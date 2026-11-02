import seed from '../article.snapshot.json' with {type:'json'};
import {normalize,plainText} from './markdown.js';
import {analyze,rewrite,route,POLICY,ProviderError} from './ai.js';
export class AppError extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status}}
export const now=()=>Date.now();
export const id=()=>crypto.randomUUID();
export const stable=v=>JSON.stringify(v,(_,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):value);
export async function hash(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof value==='string'?value:stable(value)));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export function requireDb(env){if(!env.DB)throw new AppError('storage_not_ready',503);return env.DB}
export const first=(db,sql,...args)=>db.prepare(sql).bind(...args).first();
export const all=async(db,sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
const run=(db,sql,...args)=>db.prepare(sql).bind(...args).run();
function fromRow(r){return r?{revision_id:r.id,content_hash:r.hash,published_at:new Date(r.created).toISOString(),editorial_status:r.status,document:JSON.parse(r.document)}:null}
export async function currentSnapshot(env,revision){
 if(!env.DB){if(revision&&revision!==seed.revision_id)return null;return seed}
 const db=env.DB;
 await db.batch([
 db.prepare('INSERT OR IGNORE INTO revisions (id,document,hash,created,status,operation,input_hash,summary,parent) VALUES (?,?,?,?,?,?,?,?,NULL)').bind(seed.revision_id,JSON.stringify(seed.document),seed.content_hash,Date.parse(seed.published_at),seed.editorial_status,'seed','seed','Исходный снимок'),
 db.prepare('INSERT OR IGNORE INTO current_article (id,revision) VALUES (1,?)').bind(seed.revision_id)]);
 return fromRow(await first(db,revision?'SELECT * FROM revisions WHERE id=?':'SELECT r.* FROM revisions r JOIN current_article a ON a.revision=r.id WHERE a.id=1',...(revision?[revision]:[])));
}
export async function limit(env,key,max=12,period=3600000){
 const db=requireDb(env),time=now();
 const r=await db.prepare('INSERT INTO request_limits (key,count,until) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<=? THEN 1 ELSE count+1 END,until=CASE WHEN until<=? THEN ? ELSE until END RETURNING count').bind(await hash(key),time+period,time,time,time+period).first();
 if(r.count>max)throw new AppError('rate_limit',429);
}
export async function submit(env,p,token,actor){
 const db=requireDb(env);
 if(!p||typeof p.section_id!=='string'||!Number.isSafeInteger(p.base_revision_id)||typeof p.quote!=='string'||!normalize(p.quote)||p.quote.length>2000||typeof p.replacement!=='string'||!p.replacement.trim()||p.replacement.length>4000||typeof (p.reason??'')!=='string'||(p.reason??'').length>1000||typeof p.idempotency_key!=='string'||p.idempotency_key.length<20||p.idempotency_key.length>150||!token||!/^[a-f0-9]{64}$/.test(token)||p.ai_consent!==true)throw new AppError('invalid_suggestion');
 const ih=await hash({base:p.base_revision_id,section:p.section_id,quote:normalize(p.quote),replacement:p.replacement,reason:p.reason??'',consent:true});
 const idem=await hash(p.idempotency_key),receipt=await hash(token);
 const existing=await first(db,'SELECT * FROM suggestions WHERE idem=?',idem);
 if(existing){if(existing.input_hash!==ih||existing.receipt!==receipt)throw new AppError('idempotency_conflict',409);return existing}
 if(p.quote.length>1500||p.replacement.length>1500||(p.reason??'').length>500)throw new AppError('suggestion_too_long');
 if(normalize(p.quote)===normalize(p.replacement))throw new AppError('unchanged_suggestion');
 const actorHash=await hash(actor);
 await limit(env,'submit:'+actor,60);
 const base=await currentSnapshot(env,p.base_revision_id);if(!base)throw new AppError('revision_missing',404);
 const section=base.document.sections.find(s=>s.id===p.section_id);if(!section)throw new AppError('section_missing',404);
 if(p.language!==undefined&&!['ru','en'].includes(p.language))throw new AppError('invalid_language');
 let quoteBody=section.body;if(p.language==='en'){const {readTranslation}=await import('./translations.js');const translated=await readTranslation(env,base);if(!translated)throw new AppError('translation_not_ready',409);quoteBody=translated.document.sections.find(s=>s.id===p.section_id).body}
 const quote=normalize(p.quote),text=plainText(quoteBody);
 const at=text.indexOf(quote);if(at<0||text.indexOf(quote,at+1)>=0)throw new AppError('quote_not_unique',422);
 if(await first(db,"SELECT id FROM suggestions WHERE input_hash=? AND state NOT IN ('rejected','published')",ih))throw new AppError('duplicate_suggestion',409);
 const sid=id(),time=now();
 try{const inserted=await run(db,"INSERT INTO suggestions (id,receipt,idem,input_hash,base,section,quote,replacement,reason,state,stage,attempts,lease_until,created,updated,actor) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM suggestions WHERE state='queued')<500 AND (SELECT count(*) FROM suggestions WHERE state='queued' AND actor=?)<100 AND NOT EXISTS(SELECT 1 FROM suggestions WHERE input_hash=? AND state NOT IN ('rejected','published'))",sid,receipt,idem,ih,p.base_revision_id,p.section_id,quote,p.replacement,p.reason??'','queued','moderate',0,0,time,time,actorHash,actorHash,ih);if(!inserted.meta.changes)throw new AppError('queue_full',429)}catch(e){if(e instanceof AppError)throw e;const r=await first(db,'SELECT * FROM suggestions WHERE idem=?',idem);if(r&&r.input_hash===ih&&r.receipt===receipt)return r;throw new AppError('idempotency_conflict',409)}
 return first(db,'SELECT * FROM suggestions WHERE id=?',sid);
}
export const publicStatus=s=>({id:s.id,state:s.state,stage:s.stage,created:s.created,updated:s.updated,error:s.error??null,base_revision_id:s.base,section_id:s.section,admitted_at:s.admitted_at??null});
export async function receiptSuggestion(env,sid,token){const s=await first(requireDb(env),'SELECT * FROM suggestions WHERE id=?',sid);if(!s||!token||s.receipt!==await hash(token))throw new AppError('not_found',404);return s}
export async function providerRun(env,subject,stage,state,fn,model){
 const db=requireDb(env),inputHash=await hash({state,policy:POLICY,model,key_fingerprint:await hash((stage==='rewrite'?env.WRITER_API_KEY:env.OPENROUTER_API_KEY)||'')});
 const cached=await first(db,"SELECT result FROM ai_runs WHERE subject=? AND stage=? AND input_hash=? AND status='complete' ORDER BY created DESC LIMIT 1",subject,stage,inputHash);if(cached)return JSON.parse(cached.result);
 const tries=await first(db,'SELECT count(*) AS n FROM ai_runs WHERE subject=? AND stage=? AND input_hash=?',subject,stage,inputHash);if(tries.n>=3)throw new ProviderError('attempt_limit');
 const rid=id(),time=now(),cap=Math.min(500,Math.max(1,Number(env.AI_MAX_CALLS_PER_DAY)||300));
 const reserved=await db.prepare('INSERT INTO ai_runs (id,subject,stage,input_hash,requested,status,created) SELECT ?,?,?,?,?,?,? WHERE (SELECT count(*) FROM ai_runs WHERE created>=?)<?').bind(rid,subject,stage,inputHash,model,'reserved',time,time-time%86400000,cap).run();
 if(!reserved.meta.changes)throw new ProviderError('daily_budget');
 try{const result=await fn();await run(db,'UPDATE ai_runs SET status=?,actual=?,result=?,usage=? WHERE id=?','complete',result.model,JSON.stringify(result),JSON.stringify(result.usage??{}),rid);return result}
 catch(e){await run(db,'UPDATE ai_runs SET status=?,result=? WHERE id=?','error',JSON.stringify({code:e.code||'provider_error'}),rid);throw e}
}
const changedUrls=(before,after)=>{const links=s=>new Set(s.match(/https?:\/\/[^\s)<>]+/g)||[]),old=links(before);return [...links(after)].some(x=>!old.has(x))};
export async function makeCandidate(env,{base,section,body,suggestion=null,kind='manual',checks=null},lease=null){
 const db=requireDb(env),snapshot=await currentSnapshot(env,base);if(!snapshot)throw new AppError('revision_missing',404);
 if(typeof body!=='string'||!body.trim()||body.length>20000)throw new AppError('invalid_candidate');
 const target=section==='__introduction'?{body:snapshot.document.introduction}:snapshot.document.sections.find(s=>s.id===section);if(!target)throw new AppError('section_missing',404);
 const document=structuredClone(snapshot.document),normalized=body.normalize('NFC').replace(/\r\n?/g,'\n');if(section==='__introduction')document.introduction=normalized;else document.sections.find(s=>s.id===section).body=normalized;
 const documentHash=await hash(document),cid=id();
 if(lease){const s=await first(db,'SELECT lease FROM suggestions WHERE id=?',suggestion);if(s?.lease!==lease)throw new AppError('lease_lost',409)}
 await run(db,'INSERT INTO candidates (id,suggestion,base,section,body,document,hash,checks,kind,created) VALUES (?,?,?,?,?,?,?,?,?,?)',cid,suggestion,base,section,normalized,JSON.stringify(document),documentHash,checks?JSON.stringify(checks):null,kind,now());
 return first(db,'SELECT * FROM candidates WHERE id=?',cid);
}
export async function processSuggestion(env,sid,fetcher=fetch){
 const db=requireDb(env),token=id(),time=now();
 const before=await first(db,'SELECT * FROM suggestions WHERE id=?',sid);
 if(!before||['published','rejected','needs_review','ready_for_review'].includes(before.state))return {busy:true};
 if(before.admitted_at===null){
  if(env.AI_ENABLED==='false'||!env.OPENROUTER_API_KEY)return {waiting:true};
  const admission=await run(db,"UPDATE suggestions SET admitted_at=?,state='pending',updated=? WHERE id=? AND admitted_at IS NULL AND (SELECT count(*) FROM suggestions WHERE admitted_at>?)<4 AND id=(SELECT id FROM suggestions WHERE admitted_at IS NULL AND state IN ('queued','pending','awaiting_key','awaiting_writer','processing_error') ORDER BY created,id LIMIT 1)",time,time,sid,time-3600000);
  if(!admission.meta.changes)return {queued:true};
 }
 const claimed=await run(db,"UPDATE suggestions SET lease=?,lease_until=?,updated=? WHERE id=? AND lease_until<=? AND state NOT IN ('published','rejected','needs_review','ready_for_review')",token,time+60000,time,sid,time);
 if(!claimed.meta.changes)return {busy:true};
 let s=await first(db,'SELECT * FROM suggestions WHERE id=?',sid);
 const commit=async(fields)=>{const keys=Object.keys(fields);return run(db,'UPDATE suggestions SET '+keys.map(k=>k+'=?').join(',')+',lease=NULL,lease_until=0,updated=? WHERE id=? AND lease=?',...Object.values(fields),now(),sid,token)};
 try{
  if(env.AI_ENABLED==='false'){await commit({state:'awaiting_key',error:'ai_disabled'});return}
  if(!env.OPENROUTER_API_KEY){await commit({state:'awaiting_key',error:'jev_key_missing'});return}
  const snapshot=await currentSnapshot(env,s.base),current=await currentSnapshot(env);
  if(!snapshot||current.revision_id!==s.base){await commit({state:'needs_review',error:'stale_base'});return}
  const i=snapshot.document.sections.findIndex(x=>x.id===s.section),target=snapshot.document.sections[i];
  const state={audience:snapshot.document.audience,target_section:target.body,quote:s.quote,replacement:s.replacement,reason:s.reason};
  if(s.stage==='moderate'){
   const analysis=await providerRun(env,sid,'moderate',state,()=>analyze(env,state,'moderate',fetcher),env.JEV_MODEL||'typesafe/jev-1.14');
   const decision=route(analysis.scores,s.replacement+'\n'+s.reason);
   await commit({analysis:JSON.stringify({...analysis,...decision}),state:decision.route==='accepted'?'pending':decision.route,stage:decision.route==='accepted'?'rewrite':'moderate',error:null});
  }else if(s.stage==='rewrite'){
   if(!env.WRITER_API_KEY||!env.WRITER_MODEL||!env.WRITER_BASE_URL){await commit({state:'awaiting_writer',error:'writer_not_configured'});return}
   const writerState={...state,previous_section:snapshot.document.sections[i-1]?.body?.slice(-2000)||'',next_section:snapshot.document.sections[i+1]?.body?.slice(0,2000)||''};
   const result=await providerRun(env,sid,'rewrite',writerState,()=>rewrite(env,writerState,fetcher),env.WRITER_MODEL);
   if(changedUrls(target.body,result.body)||/<\/?[a-z][^>]*>/i.test(result.body)){await commit({state:'needs_review',error:'writer_scope'});return}
   const candidate=await makeCandidate(env,{base:s.base,section:s.section,body:result.body,suggestion:sid,kind:'ai'},token);
   await commit({candidate:candidate.id,state:'pending',stage:'validate',error:null});
  }else if(s.stage==='validate'){
   const candidate=await first(db,'SELECT * FROM candidates WHERE id=?',s.candidate);if(!candidate)throw new AppError('candidate_missing');
   const checkState={...state,candidate: candidate.body};
   const checked=await providerRun(env,sid+':'+candidate.id,'validate',checkState,()=>analyze(env,checkState,'validate',fetcher),env.JEV_MODEL||'typesafe/jev-1.14');
   const decision=route(checked.scores);const checks={...checked,...decision,base:s.base,candidate_hash:candidate.hash};
   const ready=await makeCandidate(env,{base:s.base,section:s.section,body:candidate.body,suggestion:sid,kind:'ai',checks},token);
   await commit({candidate:ready.id,state:decision.route==='accepted'?'ready_for_review':'needs_review',stage:'done',error:null});
  }
 }catch(e){await commit({state:e.code==='writer_needs_review'?'needs_review':'processing_error',error:e.code||'processing_error'})}
}
export async function publish(env,cid,expected,confirmedHash,operation){
 const db=requireDb(env),c=await first(db,'SELECT * FROM candidates WHERE id=?',cid);if(!c)throw new AppError('candidate_missing',404);
 if(!Number.isSafeInteger(expected)||expected!==c.base||confirmedHash!==c.hash||typeof operation!=='string'||operation.length<20||operation.length>150)throw new AppError('confirmation_mismatch',409);
 const inputHash=await hash({candidate:cid,base:expected,hash:confirmedHash});
 const previous=await first(db,'SELECT * FROM revisions WHERE operation=?',operation);if(previous){if(previous.input_hash!==inputHash)throw new AppError('idempotency_conflict',409);return fromRow(previous)}
 if(c.kind==='ai'){const checks=c.checks?JSON.parse(c.checks):null;if(!checks||checks.route!=='accepted'||checks.policy!==POLICY||checks.candidate_hash!==c.hash||checks.base!==c.base)throw new AppError('candidate_checks_required',409)}
 const stamp=now();
 await db.batch([
 db.prepare('INSERT OR IGNORE INTO revisions (document,hash,created,status,operation,input_hash,summary,parent) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM current_article WHERE id=1 AND revision=?)').bind(c.document,c.hash,stamp,'draft_for_author_review',operation,inputHash,'Авторская публикация раздела '+c.section,c.base,expected),
 db.prepare('UPDATE current_article SET revision=(SELECT id FROM revisions WHERE operation=?) WHERE id=1 AND revision=? AND EXISTS (SELECT 1 FROM revisions WHERE operation=?)').bind(operation,expected,operation),
 db.prepare("UPDATE suggestions SET state='published',updated=? WHERE id=? AND EXISTS (SELECT 1 FROM revisions WHERE operation=?)").bind(stamp,c.suggestion,operation)]);
 const saved=await first(db,'SELECT * FROM revisions WHERE operation=?',operation);if(!saved)throw new AppError('stale_base',409);
 return fromRow(saved);
}
export async function retrySuggestion(env,sid){await run(requireDb(env),"UPDATE suggestions SET state='pending',error=NULL,lease=NULL,lease_until=0 WHERE id=? AND state IN ('awaiting_key','awaiting_writer','processing_error')",sid)}
export async function analytics(env){
 const db=requireDb(env),today=now()-now()%86400000;
 const states=await all(db,'SELECT state,count(*) AS count FROM suggestions GROUP BY state');
 const recent=await all(db,'SELECT id,subject,stage,requested,actual,status,usage,created FROM ai_runs ORDER BY created DESC LIMIT 100');
 const daily=await all(db,'SELECT usage FROM ai_runs WHERE created>=?',today);
 const usage=daily.reduce((a,r)=>{const u=JSON.parse(r.usage||'{}');a.input_tokens+=u.input_tokens||u.prompt_tokens||0;a.output_tokens+=u.output_tokens||u.completion_tokens||0;return a},{input_tokens:0,output_tokens:0});
 const calls=await first(db,'SELECT count(*) AS count FROM ai_runs WHERE created>=?',today);
 return {states,recent,usage,calls_today:calls.count,policy:POLICY};
}
export async function rollback(env,target,expected,operation){
 if(!Number.isSafeInteger(target)||!Number.isSafeInteger(expected)||typeof operation!=='string'||operation.length<20||operation.length>150)throw new AppError('invalid_rollback');
 const db=requireDb(env),old=await currentSnapshot(env,target);if(!old)throw new AppError('revision_missing',404);
 const ih=await hash({rollback:target,base:expected});
 const existing=await first(db,'SELECT * FROM revisions WHERE operation=?',operation);if(existing){if(existing.input_hash!==ih)throw new AppError('idempotency_conflict',409);return fromRow(existing)}
 await db.batch([
 db.prepare('INSERT OR IGNORE INTO revisions (document,hash,created,status,operation,input_hash,summary,parent) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM current_article WHERE id=1 AND revision=?)').bind(JSON.stringify(old.document),old.content_hash,now(),old.editorial_status,operation,ih,'Восстановлено содержание ревизии '+target,expected,expected),
 db.prepare('UPDATE current_article SET revision=(SELECT id FROM revisions WHERE operation=?) WHERE id=1 AND revision=? AND EXISTS (SELECT 1 FROM revisions WHERE operation=?)').bind(operation,expected,operation)]);
 const saved=await first(db,'SELECT * FROM revisions WHERE operation=?',operation);if(!saved)throw new AppError('stale_base',409);return fromRow(saved);
}
