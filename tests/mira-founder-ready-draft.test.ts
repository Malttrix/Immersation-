import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

test('founder approval accepts a complete collecting draft, preserves audit and rejects stale or unauthorized actions',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
  create function auth.uid() returns uuid language sql as $$select case when current_setting('test.admin',true)='yes' then '11111111-1111-4111-8111-111111111111'::uuid else null end$$;
  create function public.is_security_admin() returns boolean language sql as $$select current_setting('test.admin',true)='yes'$$;
  create table public.articles(id text primary key,studio_revision integer,studio jsonb);
  create table public.mira_submissions(submission_id text primary key,article_id text,review_status text,approved_revision integer);
  create table public.mira_audit(submission_id text,action text,actor text,revision integer);
  create function public.mira_publication_complete(articles,mira_submissions) returns boolean language sql as $$select current_setting('test.complete',true)='yes'$$;
  insert into articles values('a',2,'{"status":"Draft"}');insert into mira_submissions values('s','a','collecting_assets',null);`);
  await db.exec(readFileSync('supabase/migrations/202611220001_mira_founder_approve_ready_draft.sql','utf8'));
  const call=(revision:number,action='approve')=>db.query<any>('select mira_review($1,$2,$3) r',['a',revision,action]);
  await db.exec("select set_config('test.admin','no',false)"); await assert.rejects(call(2),/Administrator required/);
  await db.exec("select set_config('test.admin','yes',false);select set_config('test.complete','no',false)"); await assert.rejects(call(2),/verified cover is incomplete/);
  await db.exec("select set_config('test.complete','yes',false)"); await assert.rejects(call(1),/revision conflict/); await assert.rejects(call(2,'reject'),/Review action unavailable/);
  await db.exec('set role authenticated');const result=await call(2);assert.equal(result.rows[0].r.status,'approved');assert.equal((await call(2)).rows[0].r.replayed,true);await db.exec('reset role');
  const rows=await db.query<any>('select action,revision from mira_audit order by action'); assert.deepEqual(rows.rows.map(r=>r.action),['approve','submitted_for_review']);
  const saved=await db.query<any>('select studio from articles'); assert.equal(saved.rows[0].studio.status,'Draft');
  await db.exec('set role service_role'); await assert.rejects(call(2),/permission denied/); await db.exec('reset role');
 } finally {await db.close();}
});
