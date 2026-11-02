import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
import snapshot from '../article.snapshot.json' with {type:'json'};
const origin='https://the-living-handbook.fit-hake-0747.chatgpt.site';let id=0;
async function rpc(method,params={}){const r=await worker.fetch(new Request(origin+'/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params})}),{},{});assert.equal(r.status,200,await r.clone().text());const j=await r.json();assert.ok(!j.error,JSON.stringify(j));return j.result}
const page=await worker.fetch(new Request(origin),{},{});assert.equal(page.status,200);const html=await page.text();assert.equal((html.match(/data-chapter data-title/g)||[]).length,17);assert.equal((html.match(/<li id="source-/g)||[]).length,55);assert.equal((html.match(/data-suggest=/g)||[]).length,15);assert.ok(!html.includes('href="/admin'));
assert.equal((await worker.fetch(new Request(origin+'/admin'),{},{})).status,403);
assert.ok(html.includes('class="signin-link" href="/signin-with-chatgpt?return_to=%2F" target="_top"'));
assert.ok(html.includes('window.__TLH_SIGNED_IN__=false'));
const signedHTML=await (await worker.fetch(new Request(origin,{headers:{'oai-authenticated-user-id':'reader-test','oai-authenticated-user-email':'reader@example.test'}}),{ADMIN_EMAIL:'owner@example.test'},{})).text();
assert.ok(signedHTML.includes('class="signin-status">Вы вошли'));assert.ok(signedHTML.includes('window.__TLH_SIGNED_IN__=true'));assert.ok(!signedHTML.includes('href="/admin'));
for(const p of ['/admin/login','/admin/suggestions'])assert.equal((await worker.fetch(new Request(origin+p),{},{})).status,404);
assert.equal((await worker.fetch(new Request(origin+'/api/suggestions',{method:'POST',body:'{}'}),{},{})).status,503);
const init=await rpc('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'reader-smoke',version:'1'}});assert.ok(init.serverInfo);
const tools=await rpc('tools/list');assert.deepEqual(tools.tools.map(t=>t.name),['get_article','get_section']);
const forkOrigin='https://fork.example';const forkResponse=await worker.fetch(new Request(forkOrigin+'/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:100,method:'tools/call',params:{name:'get_section',arguments:{section_id:'testing'}}})}),{APP_ORIGIN:forkOrigin},{});assert.equal(forkResponse.status,200);assert.ok((await forkResponse.json()).result.structuredContent.canonical_url.startsWith(forkOrigin+'/'));
const full=(await rpc('tools/call',{name:'get_article',arguments:{mode:'full'}})).structuredContent;assert.equal(full.mode,'outline');assert.equal(full.revision_id,snapshot.revision_id);assert.equal(full.content_hash,snapshot.content_hash);assert.equal(full.sections.length,15);
for(const s of snapshot.document.sections){const r=await rpc('tools/call',{name:'get_section',arguments:{section_id:s.id,revision_id:snapshot.revision_id}});assert.equal(r.structuredContent.body,s.body);assert.equal(r.structuredContent.content_hash,full.content_hash)}
assert.equal((await rpc('tools/call',{name:'get_section',arguments:{section_id:'missing'}})).isError,true);
assert.equal((await rpc('tools/call',{name:'get_article',arguments:{revision_id:snapshot.revision_id+100}})).isError,true);
assert.equal((await worker.fetch(new Request(origin+'/mcp',{method:'POST',headers:{Origin:'https://untrusted.example'},body:'{}'}),{},{})).status,403);
console.log('PASS: reader, 15 unchanged sections, 55 sources, protected author screen, unconfigured storage fails closed, MCP handshake/tools/fallback/version/errors/origin.');
