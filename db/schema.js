import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const revisions=sqliteTable('revisions',{
 id:integer('id').primaryKey({autoIncrement:true}),document:text('document').notNull(),hash:text('hash').notNull(),created:integer('created').notNull(),status:text('status').notNull(),operation:text('operation').notNull().unique(),inputHash:text('input_hash').notNull(),summary:text('summary').notNull(),parent:integer('parent'),
});
export const current=sqliteTable('current_article',{id:integer('id').primaryKey(),revision:integer('revision').notNull()});
export const suggestions=sqliteTable('suggestions',{
 id:text('id').primaryKey(),receipt:text('receipt').notNull().unique(),idem:text('idem').notNull().unique(),inputHash:text('input_hash').notNull(),base:integer('base').notNull(),section:text('section').notNull(),quote:text('quote').notNull(),replacement:text('replacement').notNull(),reason:text('reason').notNull(),state:text('state').notNull(),stage:text('stage').notNull(),analysis:text('analysis'),candidate:text('candidate'),error:text('error'),attempts:integer('attempts').notNull().default(0),lease:text('lease'),leaseUntil:integer('lease_until').notNull().default(0),created:integer('created').notNull(),updated:integer('updated').notNull(),actor:text('actor'),admittedAt:integer('admitted_at'),
});
export const candidates=sqliteTable('candidates',{
 id:text('id').primaryKey(),suggestion:text('suggestion'),base:integer('base').notNull(),section:text('section').notNull(),body:text('body').notNull(),document:text('document').notNull(),hash:text('hash').notNull(),checks:text('checks'),kind:text('kind').notNull(),created:integer('created').notNull(),
});
export const runs=sqliteTable('ai_runs',{
 id:text('id').primaryKey(),subject:text('subject').notNull(),stage:text('stage').notNull(),inputHash:text('input_hash').notNull(),requested:text('requested').notNull(),actual:text('actual'),result:text('result'),usage:text('usage'),status:text('status').notNull(),created:integer('created').notNull(),
});
export const limits=sqliteTable('request_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),until:integer('until').notNull()});
export const settings=sqliteTable('app_settings',{key:text('key').primaryKey(),value:text('value').notNull(),updated:integer('updated').notNull()});
export const translations=sqliteTable('article_translations',{id:text('id').primaryKey(),sourceHash:text('source_hash').notNull(),section:text('section').notNull(),locale:text('locale').notNull(),status:text('status').notNull(),result:text('result'),model:text('model'),error:text('error'),lease:text('lease'),leaseUntil:integer('lease_until').notNull().default(0),updated:integer('updated').notNull()});
