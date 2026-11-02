import {AppError,requireDb} from './store.js';
const SECRET_FIELDS=new Set(['OPENROUTER_API_KEY','WRITER_API_KEY']);
const ALLOWED=new Set([...SECRET_FIELDS,'WRITER_MODEL','WRITER_BASE_URL','AI_ENABLED']);
const enc=new TextEncoder(),dec=new TextDecoder();
const to64=b=>btoa(String.fromCharCode(...b));
const from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(env){if(!env.CONFIG_ENCRYPTION_KEY)throw new AppError('encryption_not_configured',503);const s=env.CONFIG_ENCRYPTION_KEY.replace(/-/g,'+').replace(/_/g,'/');try{return await crypto.subtle.importKey('raw',from64(s+'='.repeat((4-s.length%4)%4)),{name:'AES-GCM'},false,['encrypt','decrypt'])}catch{throw new AppError('encryption_not_configured',503)}}
async function encrypt(env,name,value){const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(name)},await key(env),enc.encode(value));return JSON.stringify({iv:to64(iv),ciphertext:to64(new Uint8Array(data))})}
async function decrypt(env,name,value){try{const v=JSON.parse(value);return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(v.iv),additionalData:enc.encode(name)},await key(env),from64(v.ciphertext)))}catch{throw new AppError('settings_decryption_failed',503)}}
export async function effectiveEnv(env){
 if(!env.DB)return env;const rows=(await env.DB.prepare('SELECT key,value FROM app_settings').all()).results;const result={...env};
 for(const row of rows)if(ALLOWED.has(row.key))result[row.key]=SECRET_FIELDS.has(row.key)?await decrypt(env,row.key,row.value):row.value;
 // Reuse the OpenRouter key only for the exact OpenRouter origin and API path.
 // Never forward it to a custom Writer URL or reuse a legacy TypeSafe key.
 const writerURL=result.WRITER_BASE_URL||'https://openrouter.ai/api/v1';
 result.WRITER_BASE_URL=writerURL;
 result.WRITER_MODEL=result.WRITER_MODEL||'anthropic/claude-haiku-5.5';
 if(!result.WRITER_API_KEY&&writerURL.replace(/\/$/,'')==='https://openrouter.ai/api/v1')result.WRITER_API_KEY=result.OPENROUTER_API_KEY;
 return result;
}
export const configSummary=env=>({jevConfigured:Boolean(env.OPENROUTER_API_KEY),jevModel:env.JEV_MODEL||'typesafe/jev-1.14',writerConfigured:Boolean(env.WRITER_API_KEY&&env.WRITER_MODEL&&env.WRITER_BASE_URL),writerModel:env.WRITER_MODEL||'',writerBaseUrl:env.WRITER_BASE_URL||'',aiEnabled:env.AI_ENABLED!=='false',dailyCallLimit:Math.min(500,Math.max(1,Number(env.AI_MAX_CALLS_PER_DAY)||300)),encryptionReady:Boolean(env.CONFIG_ENCRYPTION_KEY)});
export async function saveSettings(env,data){
 const db=requireDb(env);if(!data||typeof data!=='object'||Array.isArray(data))throw new AppError('invalid_settings');
 for(const name of Object.keys(data))if(!ALLOWED.has(name))throw new AppError('invalid_settings');
 for(const [name,value] of Object.entries(data)){
  if(typeof value!=='string'||value.length>8000)throw new AppError('invalid_settings');
  if(SECRET_FIELDS.has(name)&&!value.trim())continue;
  if(name==='AI_ENABLED'&&!['true','false'].includes(value))throw new AppError('invalid_settings');
  if(name==='WRITER_BASE_URL'&&value){let url;try{url=new URL(value)}catch{throw new AppError('invalid_writer_url')}if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new AppError('invalid_writer_url')}
 }
 const statements=[];for(const [name,value] of Object.entries(data)){if(SECRET_FIELDS.has(name)&&!value.trim())continue;const stored=SECRET_FIELDS.has(name)?await encrypt(env,name,value.trim()):value.trim();statements.push(db.prepare('INSERT INTO app_settings (key,value,updated) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated=excluded.updated').bind(name,stored,Date.now()))}
 if(statements.length)await db.batch(statements);
 return configSummary(await effectiveEnv(env));
}
