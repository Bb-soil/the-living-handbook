import {AppError,currentSnapshot,submit,receiptSuggestion,publicStatus,processSuggestion,makeCandidate,publish,analytics,retrySuggestion,limit,rollback} from './store.js';
import {effectiveEnv,configSummary,saveSettings} from './settings.js';
import {markdown} from './markdown.js';
import {queueStatus,tickQueue} from './queue.js';
import {hash} from './store.js';
import {readTranslation,processTranslation} from './translations.js';
import {articleHTML} from './markdown.js';
export const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function isAdmin(request,env){const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');return Boolean(id&&email&&env.ADMIN_EMAIL&&email.toLowerCase()===env.ADMIN_EMAIL.toLowerCase())}
const admin=(r,e)=>{if(!isAdmin(r,e))throw new AppError('author_only',403)};
export async function api(request,rawEnv){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(!rawEnv.DB)throw new AppError('storage_not_ready',503);
  if(path==='/api/queue/tick'){
   if(request.method!=='POST')throw new AppError('method_not_allowed',405);
   if(!rawEnv.QUEUE_AUTH_TOKEN||await hash(request.headers.get('authorization')||'')!==await hash('Bearer '+rawEnv.QUEUE_AUTH_TOKEN))throw new AppError('author_only',403);
   if(Number(request.headers.get('content-length')||0)>1024)throw new AppError('body_too_large',413);
   const text=await request.text();if(text.length>1024)throw new AppError('body_too_large',413);
   let data;try{data=JSON.parse(text||'{}')}catch{throw new AppError('invalid_json')}
   const configured=await effectiveEnv(rawEnv);
   if(data.translation_only===true)return json(data.dry_run===true?{dry_run:true,processed_steps:0}:await processTranslation(configured));
   return json(await tickQueue(configured,{dryRun:data.dry_run===true}));
  }
  let body={};
  if(!['GET','HEAD'].includes(request.method)){
   if(request.method!=='POST')throw new AppError('method_not_allowed',405);
   if(request.headers.get('origin')!==url.origin||request.headers.get('x-tlh-request')!=='1'||!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('csrf',403);
   if(Number(request.headers.get('content-length')||0)>128000)throw new AppError('body_too_large',413);
   const text=await request.text();if(new TextEncoder().encode(text).length>128000)throw new AppError('body_too_large',413);
   try{body=JSON.parse(text)}catch{throw new AppError('invalid_json')}
  }
  if(path.startsWith('/api/admin/'))admin(request,rawEnv);
  const env=await effectiveEnv(rawEnv);
  await currentSnapshot(env);
  if(path==='/api/translation'&&request.method==='GET'){
   const revision=url.searchParams.get('revision');if(!revision||!/^\d+$/.test(revision))throw new AppError('invalid_revision');
   const source=await currentSnapshot(env,Number(revision));if(!source)throw new AppError('revision_missing',404);
   const translated=await readTranslation(env,source);if(!translated)return json({ready:false,revision_id:source.revision_id,source_hash:source.content_hash},202);
   return json({ready:true,snapshot:translated,html:articleHTML(translated)});
  }
  if(path==='/api/config'&&request.method==='GET')return json({...configSummary(env),author:isAdmin(request,env),signedIn:Boolean(request.headers.get('oai-authenticated-user-id')),storage:true});
  if(path==='/api/article'&&request.method==='GET'){const n=url.searchParams.get('revision');if(n&&!/^[1-9]\d*$/.test(n))throw new AppError('invalid_revision');const s=await currentSnapshot(env,n?Number(n):undefined);if(!s)throw new AppError('revision_missing',404);return json(s)}
  const actor=request.headers.get('oai-authenticated-user-id')||request.headers.get('cf-connecting-ip')||'anonymous';
  if(path==='/api/suggestions'&&request.method==='POST'){if(!request.headers.get('oai-authenticated-user-id'))throw new AppError('sign_in_required',401);const s=await submit(env,body,request.headers.get('x-receipt-token'),actor);return json(publicStatus(s),202)}
  const statusMatch=path.match(/^\/api\/suggestions\/([\w-]+)(\/process)?$/);
  if(statusMatch){let s=await receiptSuggestion(env,statusMatch[1],request.headers.get('x-receipt-token'));if(statusMatch[2]&&request.method==='POST'){await limit(env,'process:'+s.id,15);await processSuggestion(env,s.id);s=await receiptSuggestion(env,s.id,request.headers.get('x-receipt-token'))}else if(request.method!=='GET')throw new AppError('method_not_allowed',405);return json(publicStatus(s))}
  if(path==='/api/admin/rollback'&&request.method==='POST'){if(body.confirmed!==true)throw new AppError('manual_review_required');return json(await rollback(env,body.revision,body.base,body.operation))}
  if(path==='/api/admin/settings'){if(request.method==='POST')return json(await saveSettings(rawEnv,body));return json(configSummary(env))}
  if(path==='/api/admin/dashboard'&&request.method==='GET'){
   const suggestions=(await env.DB.prepare('SELECT id,base,section,quote,replacement,reason,state,stage,analysis,candidate,error,created,updated FROM suggestions ORDER BY created DESC LIMIT 100').all()).results;
   const history=(await env.DB.prepare('SELECT id,hash,created,summary,parent FROM revisions ORDER BY id DESC LIMIT 50').all()).results;
   return json({snapshot:await currentSnapshot(env),suggestions,history,analytics:await analytics(env),queue:await queueStatus(env),config:configSummary(env)});
  }
  const processMatch=path.match(/^\/api\/admin\/suggestions\/([\w-]+)\/process$/);
  if(processMatch&&request.method==='POST'){await retrySuggestion(env,processMatch[1]);await processSuggestion(env,processMatch[1]);return json({ok:true})}
  const approveMatch=path.match(/^\/api\/admin\/suggestions\/([\w-]+)\/approve-intent$/);
  if(approveMatch&&request.method==='POST'){
   if(body.confirmed!==true)throw new AppError('manual_review_required');
   const s=await env.DB.prepare('SELECT * FROM suggestions WHERE id=?').bind(approveMatch[1]).first();
   if(!s||s.stage!=='moderate'||!['needs_review','rejected'].includes(s.state)||!s.analysis)throw new AppError('invalid_decision',409);
   if((await currentSnapshot(env)).revision_id!==s.base)throw new AppError('stale_base',409);
   const analysis={...JSON.parse(s.analysis),human_intent_approved_at:Date.now()};
   await env.DB.prepare("UPDATE suggestions SET state='pending',stage='rewrite',analysis=?,error=NULL,lease=NULL,lease_until=0,updated=? WHERE id=? AND state=?").bind(JSON.stringify(analysis),Date.now(),s.id,s.state).run();return json({ok:true});
  }
  const decisionMatch=path.match(/^\/api\/admin\/suggestions\/([\w-]+)\/decision$/);
  if(decisionMatch&&request.method==='POST'){
   if(!['rejected','needs_review'].includes(body.state))throw new AppError('invalid_decision');
   await env.DB.prepare("UPDATE suggestions SET state=?,lease=NULL,lease_until=0,updated=? WHERE id=? AND state<>'published'").bind(body.state,Date.now(),decisionMatch[1]).run();return json({ok:true});
  }
  if(path==='/api/admin/preview'&&request.method==='POST'){if(typeof body.body!=='string'||body.body.length>20000)throw new AppError('invalid_candidate');return json({html:markdown(body.body)})}
  if(path==='/api/admin/candidates'&&request.method==='POST'){
   if(body.manual_review!==true)throw new AppError('manual_review_required');
    if(body.suggestion){const s=await env.DB.prepare('SELECT * FROM suggestions WHERE id=?').bind(body.suggestion).first();if(!s)throw new AppError('not_found',404);if(s.section!==body.section)throw new AppError('section_mismatch',409);if(s.base!==body.base&&body.acknowledge_stale!==true)throw new AppError('stale_acknowledgement_required',409)}
   const c=await makeCandidate(env,{base:body.base,section:body.section,body:body.body,suggestion:body.suggestion||null,kind:'manual'});return json(c,201);
  }
  const candidateMatch=path.match(/^\/api\/admin\/candidates\/([\w-]+)$/);
  if(candidateMatch&&request.method==='GET'){const c=await env.DB.prepare('SELECT * FROM candidates WHERE id=?').bind(candidateMatch[1]).first();if(!c)throw new AppError('not_found',404);return json(c)}
  const pub=path.match(/^\/api\/admin\/candidates\/([\w-]+)\/publish$/);
  if(pub&&request.method==='POST'){
   const c=await env.DB.prepare('SELECT kind FROM candidates WHERE id=?').bind(pub[1]).first();
   if(c?.kind==='manual'&&body.manual_review!==true)throw new AppError('manual_review_required');
   return json(await publish(env,pub[1],body.base,body.hash,body.operation));
  }
  throw new AppError('not_found',404);
 }catch(e){return json({error:e instanceof AppError?e.code:'internal_error'},e instanceof AppError?e.status:500)}
}
