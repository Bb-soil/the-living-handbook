import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createLocalDb} from './local-db.mjs';
import {currentSnapshot,submit,processSuggestion} from '../worker/store.js';
import {plainText} from '../worker/markdown.js';
import {tickQueue,queueStatus} from '../worker/queue.js';
import worker from '../dist/server/index.js';
const DB=createLocalDb(),env={DB,OPENROUTER_API_KEY:'fixture-only',WRITER_API_KEY:'fixture-only',WRITER_MODEL:'fixture',WRITER_BASE_URL:'https://openrouter.ai/api/v1',QUEUE_AUTH_TOKEN:'fixture-service-only'};
const realNow=Date.now;let clock=realNow();Date.now=()=>clock;
let count=0,calls=0;const ok=s=>{count++;console.log('PASS',s)};
try{
 const snapshot=await currentSnapshot(env),section=snapshot.document.sections.find(s=>s.id==='done'),quote=plainText(section.body).slice(0,100);
 const p=n=>({base_revision_id:1,section_id:'done',quote,replacement:'Проверять результат по поведению. '+n,reason:'Уточнение '+n,ai_consent:true,idempotency_key:crypto.randomUUID()});
 const token=()=>randomBytes(32).toString('hex');
 const fixture=async(url,options)=>{calls++;assert.equal(url,'https://openrouter.ai/api/alpha/decisions');const b=JSON.parse(options.body);return Response.json({model:'fixture-jev',answers:Object.fromEntries(Object.keys(b.questions).map(k=>[k,{type:'noul',noul:k==='ambiguous'?.2:0}])),usage:{input_tokens:10,output_tokens:1}})};
 await assert.rejects(()=>submit(env,{...p(0),replacement:'x'.repeat(1501)},token(),'actor'),e=>e.code==='suggestion_too_long');
 await assert.rejects(()=>submit(env,{...p(0),reason:'x'.repeat(501)},token(),'actor'),e=>e.code==='suggestion_too_long');
 await assert.rejects(()=>submit(env,{...p(0),replacement:quote},token(),'actor'),e=>e.code==='unchanged_suggestion');ok('length and unchanged text rejected before any AI call');
 const ids=[];for(let i=0;i<6;i++){const body=p(i),t=token(),s=await submit(env,body,t,'actor-'+i);ids.push(s.id);assert.equal(s.state,'queued');assert.equal((await submit(env,body,t,'actor-'+i)).id,s.id)}
 await processSuggestion({...env,OPENROUTER_API_KEY:''},ids[0],fixture);assert.equal((await queueStatus(env)).admitted_last_hour,0);assert.equal(calls,0);ok('missing key and submission retries consume no AI slots');
 for(let n=0;n<6;n++)await Promise.all(ids.map(s=>processSuggestion(env,s,fixture)));
 assert.equal(calls,4);assert.equal((await queueStatus(env)).waiting,2);assert.equal((await queueStatus(env)).admitted_last_hour,4);
 const waiting=(await DB.prepare("SELECT id FROM suggestions WHERE state='queued' ORDER BY created,id").all()).results;
 await processSuggestion(env,waiting[1].id,fixture);await tickQueue(env,{},fixture);assert.equal(calls,4);ok('concurrent admissions allow only four globally; queued requests cannot bypass the limit');
 clock+=3600001;await tickQueue(env,{},fixture);assert.equal(calls,6);assert.equal((await queueStatus(env)).waiting,0);assert.equal((await queueStatus(env)).admitted_last_hour,2);ok('closed-page tick admits FIFO backlog after sliding-hour expiry');
 await DB.prepare("INSERT INTO request_limits(key,count,until) VALUES ('queue_worker',1,?) ON CONFLICT(key) DO UPDATE SET until=excluded.until").bind(clock+180000).run();
 assert.equal((await tickQueue(env,{},fixture)).busy,true);clock+=180001;assert.ok(!(await tickQueue(env,{},fixture)).busy);ok('expired worker lease recovers after interrupted execution');
 const origin='https://the-living-handbook.fit-hake-0747.chatgpt.site';
 const post=(path,body,headers={})=>worker.fetch(new Request(origin+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)}),env,{});
 assert.equal((await post('/api/queue/tick',{dry_run:true})).status,403);
 const probe=await post('/api/queue/tick',{dry_run:true},{Authorization:'Bearer fixture-service-only'});assert.equal(probe.status,200);assert.equal((await probe.json()).processed_steps,0);assert.equal((await DB.prepare("SELECT count FROM request_limits WHERE key='queue_probe'").first()).count,1);
 assert.equal((await post('/api/suggestions',p(99),{Origin:origin,'X-TLH-Request':'1','X-Receipt-Token':token()})).status,401);ok('unattended endpoint requires service secret; dry probe writes evidence without provider calls; proposals require login');
 console.log('Queue tests passed:',count,'; provider calls were fixtures only.');
}finally{Date.now=realNow;DB.close()}
