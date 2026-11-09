import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {createApp} from '../server/app';

const migration=readFileSync('tools/mira-review-guard/202611090001_mira_finalize_revision_guard.sql','utf8');
test('database checks revision and asset state under locks, preserves data and rejects unauthorized callers',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role; create table public.articles(id text primary key,studio_revision integer,studio jsonb,content jsonb,cover text); create table public.mira_submissions(submission_id text primary key,article_id text,review_status text,approved_revision integer);create table public.mira_media_uploads(submission_id text,state text);create table public.mira_audit(submission_id text,action text,actor text,revision integer);create function public.mira_finalize(p_id text) returns jsonb language sql as $$select '{}'::jsonb$$;grant usage on schema public to service_role,anon,authenticated;insert into public.articles values('article',4,'{"status":"Draft","miraMedia":{"cover":{"id":36},"pinterest1":{"id":37},"pinterest2":{"id":38}}}','{"en":"original","zh":"原文"}','cover-url');insert into public.mira_submissions values('submission','article','collecting_assets',null);`);
  await db.exec(migration);
  const call=(id:string,revision:number)=>db.query<any>('select public.mira_finalize_at_revision($1,$2) result',[id,revision]);
  await assert.rejects(db.query("select public.mira_finalize('submission')"),/Expected revision is required/);
  await assert.rejects(call('submission',3),/Revision conflict/);
  assert.equal((await db.query<any>("select review_status from mira_submissions")).rows[0].review_status,'collecting_assets');
  await db.exec("update articles set studio=studio #- '{miraMedia,pinterest2}' where id='article'");
  await assert.rejects(call('submission',4),/assets are incomplete/);
  await db.exec(`update articles set studio=jsonb_set(studio,'{miraMedia,pinterest2}','{"id":38}') where id='article';insert into mira_media_uploads values('submission','uncertain')`);
  await assert.rejects(call('submission',4),/reconciliation/);
  await db.exec("delete from mira_media_uploads");
  await db.exec('set role authenticated');await assert.rejects(call('submission',4),/permission denied/);await db.exec('reset role');
  await db.exec('set role anon');await assert.rejects(call('submission',4),/permission denied/);await db.exec('reset role');
  const before=(await db.query<any>("select to_jsonb(a) article from articles a where id='article'")).rows[0].article;
  await db.exec('set role service_role');assert.deepEqual((await call('submission',4)).rows[0].result,{status:'pending_review',revision:4});
  assert.deepEqual((await call('submission',4)).rows[0].result,{status:'pending_review',revision:4});
  await assert.rejects(call('submission',3),/Revision conflict/);await db.exec('reset role');
  assert.deepEqual((await db.query<any>("select to_jsonb(a) article from articles a where id='article'")).rows[0].article,before);
  assert.equal((await db.query<any>('select count(*)::int n from mira_audit')).rows[0].n,1);
  await db.exec("update articles set studio_revision=5 where id='article'");await assert.rejects(call('submission',4),/Revision conflict/);
 } finally {await db.close();}
});

test('API requires agent authorization and a single valid expected revision',async()=>{
 const token='a'.repeat(43),env={MIRA_AGENT_TOKEN:token};let calls=0, conflict=false;
 const db:any={rpc:async(name:string,args:any)=>{if(name==='mira_rate_limit')return {data:true,error:null};calls++;assert.equal(name,'mira_finalize_at_revision');assert.deepEqual(args,{p_id:'submission',p_expected_revision:4});return conflict ? {data:null,error:{code:'40001'}} : {data:{status:'pending_review',revision:4},error:null};}};
 const server=createApp({env,db}).listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();if(!address||typeof address==='string')throw Error('no port');
 const url=`http://127.0.0.1:${address.port}/api/editorial/agent/drafts/submission/finalize`;
 const send=(body:any,auth=true)=>fetch(url,{method:'POST',headers:{'content-type':'application/json',...(auth?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 try {
  assert.equal((await send({expected_revision:4},false)).status,401);assert.equal(calls,0);
  for(const body of [{},{expected_revision:'4'},{expected_revision:0},{expected_revision:4,extra:true},null])assert.equal((await send(body)).status,400);
  assert.equal(calls,0);const result=await send({expected_revision:4});assert.equal(result.status,200);assert.equal((await result.json() as any).revision,4);assert.equal(calls,1); conflict=true;const stale=await send({expected_revision:4});assert.equal(stale.status,409);assert.equal((await stale.json() as any).code,'FINALIZATION_FAILED');assert.equal(calls,2);
 }finally{await new Promise<void>(r=>server.close(()=>r()));}
});
