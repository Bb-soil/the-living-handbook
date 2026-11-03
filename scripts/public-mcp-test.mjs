import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const remote=process.argv[2]==='--url';
if(process.argv.length>2&&(!remote||!process.argv[3]))throw new Error('Usage: node scripts/public-mcp-test.mjs [--url https://host/public-mcp]');
const endpoint=new URL(remote?process.argv[3]:'https://the-living-handbook.fit-hake-0747.chatgpt.site/public-mcp');
let DB,env,store;
let fetcher=fetch;
if(!remote){
 const {createLocalDb}=await import('./local-db.mjs');
 const {default:worker}=await import('../dist/server/index.js');
 store=await import('../worker/store.js');DB=createLocalDb();env={DB,ADMIN_EMAIL:'owner@example.test'};
 fetcher=(input,init)=>worker.fetch(new Request(input,init),env,{});
}
const client=new Client({name:'handbook-external-check',version:'1.0.0'});
try{
 await client.connect(new StreamableHTTPClientTransport(endpoint,{fetch:fetcher}));
 const tools=(await client.listTools()).tools;
 assert.deepEqual(tools.map(t=>t.name).sort(),['get_article','get_section']);
 for(const t of tools)assert.equal(t.annotations.readOnlyHint,true);
 const read=async(name,args)=>(await client.callTool({name,arguments:args}));
 const outline=(await read('get_article',{mode:'outline'})).structuredContent;
 assert.ok(outline.revision_id>0);assert.equal(outline.sections.length,15);
 const source=await (await fetcher(new URL('/api/article',endpoint))).json();
 assert.equal(outline.content_hash,source.content_hash);
 assert.equal(outline.revision_id,source.revision_id);
 const section=outline.sections.find(s=>s.id==='testing');
 assert.ok(section,'Testing section must exist');
 const first=(await read('get_section',{section_id:section.id,revision_id:outline.revision_id})).structuredContent;
 assert.equal(first.body,source.document.sections.find(s=>s.id===section.id).body);
 assert.equal(first.content_hash,outline.content_hash);
 assert.equal((await read('get_section',{section_id:'nonexistent-section'})).isError,true);
 assert.equal((await read('publish',{body:'must not write'})).isError,true);
 assert.equal((await fetcher(new URL('/api/admin/dashboard',endpoint))).status,403);
 assert.equal((await fetcher(endpoint)).status,405);
 assert.equal((await fetcher(endpoint,{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'})).status,403);
 if(!remote){
  const candidate=await store.makeCandidate(env,{base:source.revision_id,section:section.id,body:first.body+'\n\nPublic MCP publication regression.'});
  const before=(await read('get_section',{section_id:section.id})).structuredContent;
  assert.equal(before.body,first.body,'Draft candidate must not be visible');
  const published=await store.publish(env,candidate.id,source.revision_id,candidate.hash,'public-mcp-test:'+crypto.randomUUID());
  const current=(await read('get_section',{section_id:section.id})).structuredContent;
  assert.equal(current.revision_id,published.revision_id);assert.equal(current.body,candidate.body);assert.equal(current.content_hash,published.content_hash);
  const apiCurrent=await (await fetcher(new URL('/api/article',endpoint))).json();
  assert.equal(current.content_hash,apiCurrent.content_hash);
  assert.equal((await read('get_section',{section_id:section.id,revision_id:source.revision_id})).structuredContent.body,first.body);
  console.log('PASS new publication immediately visible; drafts private; pinned historical revision preserved');
 }
 console.log(JSON.stringify({ok:true,endpoint:endpoint.href,revision_id:outline.revision_id,content_hash:outline.content_hash,tools:tools.map(t=>t.name),section_id:section.id,section_title:first.title,section_characters:first.body.length}));
 console.log('PASS official SDK initialize/list/calls, site parity, unknown tool, missing section, private admin and Origin checks');
}finally{await client.close();DB?.close()}
