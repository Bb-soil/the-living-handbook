import assert from 'node:assert/strict';
import {createLocalDb} from './local-db.mjs';
import {currentSnapshot,makeCandidate,publish,submit} from '../worker/store.js';
import {readTranslation,processTranslation} from '../worker/translations.js';
import {plainText} from '../worker/markdown.js';
import worker from '../dist/server/index.js';
const DB=createLocalDb(),env={DB,ARTICLE_TRANSLATION_ENABLED:'true',WRITER_API_KEY:'fixture-key',WRITER_MODEL:'fixture-model',WRITER_BASE_URL:'https://openrouter.ai/api/v1'};
let calls=0;
const fixture=async(url,options)=>{calls++;assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');const payload=JSON.parse(options.body),source=JSON.parse(payload.messages[1].content),links=source.body.match(/\]\(([^)]+)\)/g)||[];
 return Response.json({model:'fixture-translation',choices:[{finish_reason:'stop',message:{content:JSON.stringify({title:'English title '+calls,body:'Unique fixture section '+calls+'. '+('English fixture prose for contract testing, not a real translation. ').repeat(Math.ceil(source.body.length/70))+'\n'+links.map(x=>'[Source'+x).join('\n'),audience:'Beginners building small personal projects'})}}],usage:{prompt_tokens:10,completion_tokens:20}})};
try{
 const source=await currentSnapshot(env);assert.equal(await readTranslation(env,source),null);
 for(let i=0;i<16;i++)await processTranslation(env,fixture);
 assert.equal(calls,16);const english=await readTranslation(env,source);assert.equal(english.document.language,'en');assert.equal(english.content_hash,source.content_hash);assert.ok(english.translation_hash);assert.equal(english.document.sections.length,15);assert.deepEqual(english.document.bibliography,source.document.bibliography);
 await processTranslation(env,fixture);assert.equal(calls,16);console.log('PASS all-or-nothing translated snapshot, stable source IDs/bibliography, cached results and no repeated calls');
 const q=plainText(english.document.sections[0].body).slice(0,100);await submit(env,{base_revision_id:1,section_id:source.document.sections[0].id,quote:q,replacement:'A clearer English explanation.',reason:'fixture',language:'en',ai_consent:true,idempotency_key:crypto.randomUUID()},'a'.repeat(64),'fixture-user');console.log('PASS English quote validated against translation of the same revision');
 const call=async(name,args)=>{const r=await worker.fetch(new Request('https://the-living-handbook.fit-hake-0747.chatgpt.site/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}),env,{});return (await r.json()).result};
 const section=await call('get_section',{section_id:source.document.sections[0].id,language:'en'});assert.equal(section.structuredContent.language,'en');assert.equal(section.structuredContent.body,english.document.sections[0].body);
 const candidate=await makeCandidate(env,{base:1,section:source.document.sections[0].id,body:source.document.sections[0].body+'\n\nНовая публикация.'});await publish(env,candidate.id,1,candidate.hash,'translation-test:'+crypto.randomUUID());assert.equal(await readTranslation(env,await currentSnapshot(env)),null);
 const missing=await call('get_article',{language:'en'});assert.equal(missing.isError,true);const pinned=await call('get_section',{section_id:source.document.sections[0].id,language:'en',revision_id:1});assert.equal(pinned.structuredContent.body,english.document.sections[0].body);console.log('PASS MCP English, pinned translations and stale translation never presented as current');
 assert.equal((await worker.fetch(new Request('https://the-living-handbook.fit-hake-0747.chatgpt.site/api/translation?revision=2'),env,{})).status,202);
 await processTranslation(env,fixture);assert.equal(calls,17);assert.ok(await readTranslation(env,await currentSnapshot(env)));console.log('PASS unchanged parts reused after publication; only the changed section calls Writer');
}finally{DB.close()}
