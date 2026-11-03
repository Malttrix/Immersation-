import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { agentAuthorized } from '../server/editorial-agent';
import sharp from 'sharp';

const pkg = JSON.parse(readFileSync('examples/mira/article-package.json','utf8'));
const key = 'request_key_123456789';
const fp = 'a'.repeat(64);
test('agent tokens are separate, rotatable, and reject invalid credentials', () => {
  const env = { MIRA_AGENT_TOKEN: 'a'.repeat(43), MIRA_AGENT_TOKEN_PREVIOUS: 'b'.repeat(43) };
  assert.equal(agentAuthorized('Bearer '+env.MIRA_AGENT_TOKEN, env), true);
  assert.equal(agentAuthorized('Bearer '+env.MIRA_AGENT_TOKEN_PREVIOUS, env), true);
  assert.equal(agentAuthorized('Bearer '+'c'.repeat(43), env), false);
  assert.equal(agentAuthorized(undefined, env), false);
  assert.equal(agentAuthorized('Bearer short', { MIRA_AGENT_TOKEN: 'short' }), false);
});
test('transactional review gates exact revision, retries, visibility and legacy articles', async () => {
  const pg = new PGlite();
  try {
    await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;
      create schema auth; create function auth.uid() returns uuid language sql as $$select '11111111-1111-4111-8111-111111111111'::uuid$$;
      create table articles(id text primary key,slug text,title jsonb,excerpt jsonb,content jsonb,category jsonb,date jsonb,"readTime" jsonb,pillar text,featured boolean default false,cover text,audio text,created_at timestamptz default now());
      create function is_security_admin() returns boolean language sql stable as $$select coalesce(current_setting('test.admin',true),'false')='true'$$;
      alter table articles enable row level security; grant select on articles to anon,authenticated;`);
    await pg.exec(readFileSync('supabase/migrations/202610310001_content_studio.sql','utf8'));
    await pg.exec(readFileSync('supabase/migrations/202611030001_mira_editorial.sql','utf8'));
    await pg.exec(readFileSync('supabase/migrations/202611040001_mira_media.sql','utf8'));
    const submit = (id=key,fingerprint=fp,p=pkg) => pg.query<{ result: any }>('select mira_submit($1,$2,$3,$4::jsonb) as result',[p.submissionId,id,fingerprint,JSON.stringify(p)]);
    assert.equal((await submit()).rows[0].result.replayed,false);
    assert.equal((await submit()).rows[0].result.replayed,true);
    await assert.rejects(submit(key,'b'.repeat(64)),/Idempotency conflict/);
    await pg.exec('set role anon');
    assert.equal((await pg.query('select * from articles')).rows.length,0);
    await assert.rejects(pg.query('select mira_submit($1,$2,$3,$4::jsonb)',[pkg.submissionId,key,fp,JSON.stringify(pkg)]),/permission denied/);
    assert.equal(readFileSync('public/sitemap.xml','utf8').includes(pkg.slug),false);
    await pg.exec('reset role');
    await assert.rejects(pg.query('select mira_review($1,$2,$3)',['mira-sample-001',1,'approve']),/Administrator required/);
    await pg.exec("set test.admin='true'");
    await assert.rejects(pg.query('select mira_review($1,$2,$3)',['mira-sample-001',1,'approve']),/assets are incomplete/);
    await assert.rejects(pg.query('select mira_finalize($1)',[pkg.submissionId]),/assets are incomplete/);
    for (const role of ['cover','pinterest1','pinterest2']) {
      const mediaKey = `asset_key_${role}_12345678`;
      await pg.query('select mira_media_start($1,$2,$3,$4)',[pkg.submissionId,mediaKey,role,fp]);
      await pg.query('select mira_media_complete($1,$2::jsonb)',[mediaKey,JSON.stringify({id:123,url:`https://cms.immersation.com/${role}.jpg`,mime:'image/jpeg',width:1200,height:1800})]);
    }
    await pg.query('select mira_finalize($1)',[pkg.submissionId]);
    await assert.rejects(pg.query('select mira_publish($1,$2)',['mira-sample-001',4]),/approved revision/);
    await pg.query('select mira_review($1,$2,$3)',['mira-sample-001',4,'approve']);
    await pg.query('select mira_update_editorial($1,$2,$3::jsonb)', ['mira-sample-001',4,JSON.stringify({editorialNotes:'updated private notes'})]);
    await assert.rejects(pg.query('select mira_publish($1,$2)',['mira-sample-001',5]),/approved revision/);
    await assert.rejects(pg.query('select mira_review($1,$2,$3)',['mira-sample-001',4,'approve']),/revision conflict/);
    await pg.query('select mira_review($1,$2,$3)',['mira-sample-001',5,'request_revision']);
    assert.equal((await pg.query<{ review_status: string }>("select review_status from mira_submissions")).rows[0].review_status,'revision_requested');
    await pg.query('select mira_review($1,$2,$3)',['mira-sample-001',5,'reject']);
    assert.equal((await pg.query<{ review_status: string }>("select review_status from mira_submissions")).rows[0].review_status,'rejected');
    await pg.query('select mira_review($1,$2,$3)',['mira-sample-001',5,'approve']);
    await assert.rejects(pg.exec(`update articles set title='{"en":"sneak"}',studio=jsonb_set(studio,'{status}','"Published"'),studio_revision=studio_revision+1 where id='mira-sample-001'`),/approved revision/);
    await pg.query('select mira_publish($1,$2)',['mira-sample-001',5]);
    assert.equal((await pg.query<{ review_status: string }>('select review_status from mira_submissions')).rows[0].review_status,'published');
    await pg.exec('set role anon');
    assert.equal((await pg.query('select * from articles')).rows.length,1);
    const publicArticle=(await pg.query<any>('select studio from articles')).rows[0];
    assert.equal(JSON.stringify(publicArticle).includes('Editorial placeholder'),false);
    await assert.rejects(pg.query('select editorial from mira_submissions'),/permission denied/);
    await pg.exec('reset role');
    assert.equal((await pg.query<any>('select editorial from mira_submissions')).rows[0].editorial.editorialNotes,'updated private notes');
    await pg.exec(`insert into articles(id,title,studio) values('manual','{"en":"Manual"}','{"status":"Published"}')`);
    assert.equal((await pg.query<{ visible: boolean }>("select studio_article_visible(to_jsonb(a)) as visible from articles a where id='manual'")).rows[0].visible,true);
  } finally { await pg.close(); }
});

test('agent HTTP submission rejects unauthorized and concurrent retries produce one draft', async () => {
  const { createApp } = await import('../server/app');
  const pg = new PGlite();
  let server: import('node:http').Server | undefined;
  try {
    await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;
      create schema auth; create function auth.uid() returns uuid language sql as $$select '11111111-1111-4111-8111-111111111111'::uuid$$;
      create table articles(id text primary key,slug text,title jsonb,excerpt jsonb,content jsonb,category jsonb,date jsonb,"readTime" jsonb,pillar text,featured boolean default false,cover text,audio text,created_at timestamptz default now());
      create function is_security_admin() returns boolean language sql stable as $$select false$$;
      alter table articles enable row level security; grant select on articles to anon,authenticated;`);
    await pg.exec(readFileSync('supabase/migrations/202610310001_content_studio.sql','utf8'));
    await pg.exec(readFileSync('supabase/migrations/202611030001_mira_editorial.sql','utf8'));
    await pg.exec(readFileSync('supabase/migrations/202611040001_mira_media.sql','utf8'));
    const db: any = { rpc: async (name: string, args: any) => {
      try {
        const entries = Object.entries(args);
        const result = await pg.query(`select public.${name}(${entries.map(([k],i) => `${k} => $${i+1}`).join(',')}) as value`, entries.map(([,v]) => typeof v === 'object' && v !== null ? JSON.stringify(v) : v));
        return { data: (result.rows[0] as any).value, error: null };
      } catch (error: any) { return { data: null, error }; }
    }};
    const token='x'.repeat(43);
    let wpCount=0;
    const mediaFetch: typeof fetch = async (_url, options) => {
      wpCount++; const meta=await sharp(Buffer.from(options!.body as Uint8Array)).metadata();
      return new Response(JSON.stringify({id:wpCount,source_url:`https://cms.immersation.com/wp-content/uploads/${wpCount}.png`,mime_type:'image/png',media_details:{width:meta.width,height:meta.height}}),{status:201});
    };
    server=createApp({env:{NODE_ENV:'test',MIRA_AGENT_TOKEN:token,WORDPRESS_MEDIA_BASE_URL:'https://cms.immersation.com',WORDPRESS_MEDIA_USERNAME:'fixture',WORDPRESS_MEDIA_APP_PASSWORD:'fixture'},db,mediaFetch}).listen(0,'127.0.0.1');
    await new Promise<void>((resolve,reject) => { server!.once('listening',resolve); server!.once('error',reject); });
    const base=`http://127.0.0.1:${(server.address() as any).port}/api/editorial/agent`;
    const send=(bearer: string, body: any = pkg) => fetch(base+'/drafts',{method:'POST',headers:{authorization:`Bearer ${bearer}`,'content-type':'application/json','idempotency-key':key},body:JSON.stringify(body)});
    assert.equal((await send('incorrect')).status,401);
    assert.equal((await send(token,{...pkg,status:'Published'})).status,400);
    const responses=await Promise.all([send(token),send(token)]);
    assert.deepEqual(responses.map(r=>r.status).sort(),[200,201]);
    assert.equal((await pg.query('select * from articles')).rows.length,1);
    assert.equal((await pg.query('select * from mira_requests')).rows.length,1);
    const status=await fetch(base+'/drafts/sample-001',{headers:{authorization:`Bearer ${token}`}});
    assert.equal((await status.json() as any).status,'collecting_assets');
    const image = (width: number, height: number) => sharp({create:{width,height,channels:3,background:'blue'}}).png().toBuffer();
    const landscape=await image(900,600), vertical=await image(600,900);
    const upload = (role: string, bytes: Buffer) => fetch(`${base}/drafts/sample-001/assets/${role}`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/octet-stream','idempotency-key':`media_key_${role}_123456789`},body:new Uint8Array(bytes)});
    assert.equal((await upload('cover',landscape)).status,201);
    assert.equal((await upload('cover',landscape)).status,200);
    assert.equal(wpCount,1);
    assert.equal((await upload('pinterest1',vertical)).status,201);
    assert.equal((await upload('pinterest2',vertical)).status,201);
    const finalized=await fetch(base+'/drafts/sample-001/finalize',{method:'POST',headers:{authorization:`Bearer ${token}`}});
    assert.equal(finalized.status,200);
    assert.equal((await finalized.json() as any).status,'pending_review');
    assert.equal(wpCount,3);

    assert.equal((await fetch(base+'/drafts/sample-001/publish',{method:'POST',headers:{authorization:`Bearer ${token}`}})).status,404);
  } finally {
    if(server) await new Promise<void>(resolve=>server!.close(()=>resolve()));
    await pg.close();
  }
});

test('uncertain upload needs an administrator and a verified candidate; repeated attach is idempotent', async () => {
  const pg=new PGlite();
  try {
    await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls; create schema auth;
    create function auth.uid() returns uuid language sql as $$select '11111111-1111-4111-8111-111111111111'::uuid$$;
    create table security_admins(user_id uuid primary key); insert into security_admins values('11111111-1111-4111-8111-111111111111');
    create function is_security_admin() returns boolean language sql stable as $$select exists(select 1 from security_admins where user_id=auth.uid())$$;
    create table articles(id text primary key,slug text,title jsonb,excerpt jsonb,content jsonb,category jsonb,date jsonb,"readTime" jsonb,pillar text,featured boolean default false,cover text,audio text,created_at timestamptz default now());
    alter table articles enable row level security; grant select on articles to anon,authenticated;`);
    for (const file of ['202610310001_content_studio.sql','202611030001_mira_editorial.sql','202611040001_mira_media.sql','202611050001_mira_absence.sql']) await pg.exec(readFileSync('supabase/migrations/'+file,'utf8'));
    await pg.query('select mira_submit($1,$2,$3,$4::jsonb)',[pkg.submissionId,key,fp,JSON.stringify(pkg)]);
    const assetKey='uncertain_media_key_123456';
    await pg.query('select mira_media_start($1,$2,$3,$4,$5)',[pkg.submissionId,assetKey,'cover',fp,'cover.jpg']);
    await pg.query('select mira_media_uncertain($1)',[assetKey]);
    assert.equal((await pg.query<any>('select state from mira_media_uploads')).rows[0].state,'uncertain');
    await assert.rejects(pg.query('select mira_finalize($1)',[pkg.submissionId]),/incomplete|reconciliation/);
    const asset={id:42,url:'https://cms.immersation.com/upload.png',mime:'image/png',width:900,height:600};
    await assert.rejects(pg.query('select mira_media_reconcile($1,$2::jsonb,$3)',[assetKey,JSON.stringify(asset),'22222222-2222-4222-8222-222222222222']),/Administrator required/);
    await pg.query('select mira_media_reconcile($1,$2::jsonb,$3)',[assetKey,JSON.stringify(asset),'11111111-1111-4111-8111-111111111111']);
    await pg.query('select mira_media_reconcile($1,$2::jsonb,$3)',[assetKey,JSON.stringify(asset),'11111111-1111-4111-8111-111111111111']);
    await assert.rejects(pg.query('select mira_media_reconcile($1,$2::jsonb,$3)',[assetKey,JSON.stringify({...asset,id:43}),'11111111-1111-4111-8111-111111111111']),/Candidate mismatch/);
    assert.equal((await pg.query<any>("select count(*)::integer as n from mira_audit where action='media_reconciled'")).rows[0].n,1);
    const absentKey='uncertain_background_123456';
    await pg.query('select mira_media_start($1,$2,$3,$4,$5)',[pkg.submissionId,absentKey,'background',fp,'background.jpg']);
    await pg.query('select mira_media_uncertain($1)',[absentKey]);
    const evidence='Reviewed the complete WordPress library, other uploaders and trash; operation was not found.';
    await assert.rejects(pg.query('select mira_media_mark_absent($1,$2,$3)',[absentKey,'22222222-2222-4222-8222-222222222222',evidence]),/Administrator required/);
    await assert.rejects(pg.query('select mira_media_mark_absent($1,$2,$3)',[absentKey,'11111111-1111-4111-8111-111111111111',evidence]),/cooling-off/);
    await pg.query("update mira_media_uploads set created_at=now()-interval '11 minutes' where request_key=$1",[absentKey]);
    await assert.rejects(pg.query('select mira_media_mark_absent($1,$2,$3)',[absentKey,'11111111-1111-4111-8111-111111111111','short']),/evidence/);
    await pg.query('select mira_media_mark_absent($1,$2,$3)',[absentKey,'11111111-1111-4111-8111-111111111111',evidence]);
    assert.equal((await pg.query<any>('select mira_media_status($1,$2,$3) as result',[pkg.submissionId,'background',absentKey])).rows[0].result.state,'failed');
    await assert.rejects(pg.query('select mira_media_complete($1,$2::jsonb)',[absentKey,JSON.stringify(asset)]),/no longer active/);
    await pg.query('select mira_media_start($1,$2,$3,$4)',[pkg.submissionId,'new_background_key_123456','background',fp]);
    assert.equal((await pg.query<any>('select count(*)::integer as n from mira_media_absence_decisions')).rows[0].n,1);

  } finally { await pg.close(); }
});
