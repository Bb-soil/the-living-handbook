import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function createLocalDb(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA foreign_keys=ON');
 class Statement{constructor(sql,args=[]){this.sql=sql;this.args=args}bind(...args){return new Statement(this.sql,args)}async first(){return sqlite.prepare(this.sql).get(...this.args)??null}async all(){return {results:sqlite.prepare(this.sql).all(...this.args)}}sync(){const r=sqlite.prepare(this.sql).run(...this.args);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}async run(){return this.sync()}}
 const db={prepare:sql=>new Statement(sql),batch:async statements=>{sqlite.exec('BEGIN IMMEDIATE');try{const out=statements.map(s=>s.sync());sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}},raw:sqlite,close:()=>sqlite.close()};
 sqlite.exec('CREATE TABLE IF NOT EXISTS __local_migrations (name TEXT PRIMARY KEY)');
 for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())if(!sqlite.prepare('SELECT name FROM __local_migrations WHERE name=?').get(file)){sqlite.exec('BEGIN');try{sqlite.exec(fs.readFileSync('drizzle/'+file,'utf8'));sqlite.prepare('INSERT INTO __local_migrations(name) VALUES (?)').run(file);sqlite.exec('COMMIT')}catch(e){sqlite.exec('ROLLBACK');throw e}}
 return db;
}

