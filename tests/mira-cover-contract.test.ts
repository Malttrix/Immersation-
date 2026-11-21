import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

test('finalize requires bilingual content and a verified cover; social assets are optional', async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
   create table articles(id text primary key,studio_revision integer,studio jsonb,title jsonb,excerpt jsonb,category jsonb,content jsonb,cover text);
   create table mira_submissions(submission_id text primary key,article_id text,review_status text);
   create table mira_media_uploads(submission_id text,role text,state text,result jsonb,sha256 text);
   create table mira_audit(submission_id text,action text,actor text,revision integer);
   create function mira_publication_complete(articles,mira_submissions) returns boolean language sql as $$select false$$;
   create function mira_finalize_at_revision(text,integer) returns jsonb language sql as $$select '{}'::jsonb$$;
   grant usage on schema public to anon,authenticated,service_role;`);
  await db.exec(readFileSync('supabase/migrations/202611210001_mira_website_cover_contract.sql','utf8'));
  const sha='a'.repeat(64), url='https://cms.immersation.com/wp-content/uploads/2026/11/mira-cover-test.jpg';
  const cover={id:63,url,mime:'image/jpeg',width:1600,height:900,sha256:sha};
  await db.query('insert into articles values($1,3,$2,$3,$4,$5,$6,$7)', ['a',JSON.stringify({status:'Draft',miraMedia:{cover}}),JSON.stringify({en:'Title',zh:'标题'}),JSON.stringify({en:'Summary',zh:'摘要'}),JSON.stringify({en:'Category',zh:'分类'}),JSON.stringify({en:'Body',zh:'正文'}),url]);
  await db.exec("insert into mira_submissions values('s','a','collecting_assets')");
  const call=()=>db.query<any>("select mira_finalize_at_revision('s',3) r");
  await assert.rejects(call(),/verified cover is incomplete/);
  const result={id:63,url,mime:'image/jpeg',width:1600,height:900};
  await db.query('insert into mira_media_uploads values($1,$2,$3,$4,$5)',['s','cover','completed',JSON.stringify(result),'b'.repeat(64)]);
  await assert.rejects(call(),/verified cover is incomplete/);
  await db.query('update mira_media_uploads set sha256=$1',[sha]);
  await db.exec("update articles set content=jsonb_set(content,'{zh}',to_jsonb(''::text))");
  await assert.rejects(call(),/verified cover is incomplete/);
  await db.exec("update articles set content=jsonb_set(content,'{zh}',to_jsonb('正文'::text))");
  await assert.rejects(db.query("select mira_finalize_at_revision('s',2)"),/Revision conflict/);
  await db.exec('set role authenticated'); await assert.rejects(call(),/permission denied/); await db.exec('reset role');
  await db.exec('set role service_role'); assert.equal((await call()).rows[0].r.status,'pending_review'); assert.equal((await call()).rows[0].r.revision,3); await db.exec('reset role');
  assert.equal((await db.query('select * from mira_audit')).rows.length,1);
  await db.exec("update mira_submissions set review_status='collecting_assets'");
  await db.exec(`update articles set studio=studio || '{"miraMedia":{"cover":${JSON.stringify(cover)},"pinterest1":{"id":1},"pinterest2":{"id":2},"instagram1":{"id":3},"instagram2":{"id":4},"instagram3":{"id":5}}}'::jsonb`);
  assert.equal((await call()).rows[0].r.status,'pending_review');
 } finally {await db.close();}
});
