import {currentSnapshot,first,all,hash,id,now,providerRun} from './store.js';
import {translatePart} from './ai.js';

const parts=s=>[{id:'__introduction',title:s.document.title,body:s.document.introduction},...s.document.sections];
export async function readTranslation(env,s){
 if(!env.DB)return null;
 const rows=await all(env.DB,"SELECT section,result FROM article_translations WHERE source_hash=? AND locale='en' AND status='complete'",s.content_hash);
 const map=new Map(rows.map(r=>[r.section,JSON.parse(r.result)]));
 if(parts(s).some(p=>!map.has(p.id)))return null;
 const document=structuredClone(s.document),intro=map.get('__introduction');
 document.language='en';document.title=intro.title;document.introduction=intro.body;document.audience=intro.audience;
 document.sections=document.sections.map(p=>({...p,title:map.get(p.id).title,body:map.get(p.id).body}));
 return {...s,document,source_language:'ru',translation_language:'en',translation_hash:await hash(document)};
}
export async function processTranslation(env,fetcher=fetch){
 if(env.ARTICLE_TRANSLATION_ENABLED!=='true'||!env.DB||!env.WRITER_API_KEY||env.AI_ENABLED==='false')return {processed_steps:0,status:'awaiting_writer'};
 const s=await currentSnapshot(env),list=parts(s),time=now();
 await env.DB.batch(list.map(p=>env.DB.prepare("INSERT OR IGNORE INTO article_translations (id,source_hash,section,locale,status,lease_until,updated) VALUES (?,?,?,'en','pending',0,?)").bind(s.content_hash+':en:'+p.id,s.content_hash,p.id,time)));
 // Reuse unchanged sections across revisions; one edit need not translate all 16 parts.
 for(const part of list){
  const state={title:part.title,body:part.body,audience:s.document.audience,target_language:'en'},partHash=await hash(state);
  const cached=await first(env.DB,"SELECT result,model FROM article_translations WHERE section=? AND locale='en' AND status='complete' AND json_extract(result,'$.source_part_hash')=? AND json_extract(result,'$.requested_model')=? LIMIT 1",part.id,partHash,env.WRITER_MODEL);
  if(cached)await env.DB.prepare("UPDATE article_translations SET status='complete',result=?,model=?,error=NULL,updated=? WHERE id=? AND status='pending' AND lease_until<=?").bind(cached.result,cached.model,time,s.content_hash+':en:'+part.id,time).run();
 }
 const rows=await all(env.DB,"SELECT * FROM article_translations WHERE source_hash=? AND status!='complete' AND lease_until<=?",s.content_hash,time);
 const row=list.map(p=>rows.find(r=>r.section===p.id)).find(r=>r&&(r.status==='pending'||(r.status==='error'&&r.updated<time-300000&&['provider_network','provider_http','provider_rate_limit','daily_budget'].includes(r.error))));
 if(!row)return {processed_steps:0,status:(await readTranslation(env,s))?'complete':'waiting'};
 const token=id();const claim=await env.DB.prepare("UPDATE article_translations SET lease=?,lease_until=? WHERE id=? AND lease_until<=? AND status!='complete'").bind(token,time+90000,row.id,time).run();if(!claim.meta.changes)return {processed_steps:0,busy:true};
 const source=list.find(p=>p.id===row.section),state={title:source.title,body:source.body,audience:s.document.audience,target_language:'en'};
 try{
  const result=await providerRun(env,'translation-part:'+await hash(state),'translate',state,()=>translatePart(env,state,fetcher),env.WRITER_MODEL);
  result.source_part_hash=await hash(state);result.requested_model=env.WRITER_MODEL;
  await env.DB.prepare("UPDATE article_translations SET status='complete',result=?,model=?,error=NULL,lease=NULL,lease_until=0,updated=? WHERE id=? AND lease=?").bind(JSON.stringify(result),result.model,now(),row.id,token).run();
  return {processed_steps:1,status:(await readTranslation(env,s))?'complete':'pending',section_id:source.id,source_revision:s.revision_id};
 }catch(e){await env.DB.prepare("UPDATE article_translations SET status='error',error=?,lease=NULL,lease_until=0,updated=? WHERE id=? AND lease=?").bind(e.code||'translation_error',now(),row.id,token).run();return {processed_steps:0,status:'error',error:e.code||'translation_error'}}
}
