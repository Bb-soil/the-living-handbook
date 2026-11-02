import {first,all,now,processSuggestion,requireDb} from './store.js';
import {processTranslation} from './translations.js';

export async function queueStatus(env){
 const db=requireDb(env),time=now();
 const waiting=await first(db,"SELECT count(*) AS n FROM suggestions WHERE admitted_at IS NULL AND state IN ('queued','pending','awaiting_key','awaiting_writer','processing_error')");
 const admitted=await first(db,'SELECT count(*) AS n,min(admitted_at) AS oldest FROM suggestions WHERE admitted_at>?',time-3600000);
 const heartbeat=await first(db,"SELECT count,until FROM request_limits WHERE key='queue_heartbeat'");
 return {waiting:waiting.n,admitted_last_hour:admitted.n,hourly_limit:4,replacement_limit:1500,reason_limit:500,next_slot_at:admitted.n>=4?admitted.oldest+3600000:null,last_tick_at:heartbeat?.until??null};
}

export async function tickQueue(env,{dryRun=false}={},fetcher=fetch){
 const db=requireDb(env),time=now();
 if(dryRun){await db.prepare("INSERT INTO request_limits (key,count,until) VALUES ('queue_probe',1,?) ON CONFLICT(key) DO UPDATE SET count=count+1,until=excluded.until").bind(time).run();return {dry_run:true,processed_steps:0,...await queueStatus(env)}}
 const claim=await db.prepare("INSERT INTO request_limits (key,count,until) VALUES ('queue_worker',1,?) ON CONFLICT(key) DO UPDATE SET count=count+1,until=excluded.until WHERE until<=? RETURNING count").bind(time+180000,time).first();
 if(!claim)return {busy:true,processed_steps:0};
 let steps=0;
 try{
  if(env.AI_ENABLED!=='false'&&env.OPENROUTER_API_KEY){
   // At most three provider stages per tick: requests have a 20-second timeout.
   const attempted=new Set();
   for(let n=0;n<3;n++){
    const rows=await all(db,"SELECT * FROM suggestions WHERE lease_until<=? AND (state IN ('pending','queued','awaiting_key') OR (state='awaiting_writer' AND ?=1) OR (state='processing_error' AND updated<? AND error IN ('provider_network','provider_http','provider_rate_limit')) OR (state='processing_error' AND error='daily_budget' AND updated<?)) ORDER BY CASE WHEN admitted_at IS NULL THEN 1 ELSE 0 END,created,id LIMIT 504",now(),env.WRITER_API_KEY&&env.WRITER_MODEL&&env.WRITER_BASE_URL?1:0,now()-300000,now()-now()%86400000);
    const s=rows.find(r=>!attempted.has(r.id)&&!(r.stage==='rewrite'&&!env.WRITER_API_KEY));if(!s)break;
    const result=await processSuggestion(env,s.id,fetcher);steps++;
    const after=await first(db,'SELECT state FROM suggestions WHERE id=?',s.id);
    if(result?.queued||result?.busy||after?.state!=='pending')attempted.add(s.id);
   }
  }
  const translation=await processTranslation(env,fetcher);steps+=translation.processed_steps;
  await db.prepare("INSERT INTO request_limits (key,count,until) VALUES ('queue_heartbeat',1,?) ON CONFLICT(key) DO UPDATE SET count=count+1,until=excluded.until").bind(now()).run();
  return {processed_steps:steps,...await queueStatus(env)};
 }finally{await db.prepare("UPDATE request_limits SET until=0 WHERE key='queue_worker' AND count=?").bind(claim.count).run()}
}
