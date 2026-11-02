import http from 'node:http';
import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
import {createLocalDb} from './local-db.mjs';
import worker from '../dist/server/index.js';
fs.mkdirSync('.sites-runtime',{recursive:true});const keyFile='.sites-runtime/preview-key';if(!fs.existsSync(keyFile))fs.writeFileSync(keyFile,randomBytes(32).toString('base64url'),{mode:0o600});
const env={DB:createLocalDb(process.env.TLH_PREVIEW_DB||'.sites-runtime/preview.sqlite'),ADMIN_EMAIL:'owner@localhost.test',CONFIG_ENCRYPTION_KEY:fs.readFileSync(keyFile,'utf8'),AI_MAX_CALLS_PER_DAY:'300'};
const server=http.createServer(async(req,res)=>{try{const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>512000){res.writeHead(413);res.end();return}chunks.push(c)}const body=Buffer.concat(chunks);const headers={...req.headers,...(process.env.TLH_PREVIEW_ANONYMOUS==='true'?{}:{'oai-authenticated-user-id':'local-preview-owner','oai-authenticated-user-email':env.ADMIN_EMAIL})};const request=new Request('http://127.0.0.1:3891'+req.url,{method:req.method,headers,...(body.length?{body}:{})});const r=await worker.fetch(request,env,{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))}catch{res.writeHead(500);res.end('Preview failed')}});
server.listen(3891,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:3891 · owner preview only; never deploy this adapter'));
