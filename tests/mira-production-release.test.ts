import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app';
import { validateMiraDeployment } from '../scripts/mira-preview-guard.mjs';

const production = { VERCEL:'1', VERCEL_ENV:'production', VERCEL_PROJECT_NAME:'immersation', VERCEL_PROJECT_ID:'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu', VERCEL_GIT_COMMIT_REF:'main' };

test('production MIRA is disabled by default without blocking existing site builds', async () => {
  assert.deepEqual(validateMiraDeployment(production), []);
  assert.ok(validateMiraDeployment({...production, MIRA_PRODUCTION_READY:'true'}).length);
  const app=createApp({env:{...production,MIRA_AGENT_TOKEN:'a'.repeat(43)}});
  const server=app.listen(0,'127.0.0.1');
  try {
    await new Promise<void>(resolve=>server.once('listening',resolve));
    const address=server.address(); if (!address || typeof address==='string') throw Error('No local port');
    const root=`http://127.0.0.1:${address.port}`;
    const blocked=await fetch(root+'/api/editorial/agent/drafts/x',{headers:{authorization:'Bearer '+'a'.repeat(43),'x-forwarded-proto':'https'}});
    assert.equal(blocked.status,404);
    assert.equal((await fetch(root+'/api/health')).status,200);
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
});

test('enabled production requires the exact production services', () => {
  const ready={...production,MIRA_PRODUCTION_READY:'true',SUPABASE_URL:'https://zoneqvjrbcowlzwiyinq.supabase.co',VITE_SUPABASE_URL:'https://zoneqvjrbcowlzwiyinq.supabase.co',APP_URL:'https://immersation.com',WORDPRESS_MEDIA_BASE_URL:'https://cms.immersation.com',WORDPRESS_MEDIA_USERNAME:'mira-media-prod',WORDPRESS_MEDIA_APP_PASSWORD:'test',MIRA_AGENT_TOKEN:'a'.repeat(43),SUPABASE_SERVICE_ROLE_KEY:'test',VITE_SUPABASE_ANON_KEY:'test'};
  assert.deepEqual(validateMiraDeployment(ready),[]);
  for(const change of [{SUPABASE_URL:'https://dibfotxdupgdhbmhmrnl.supabase.co'},{WORDPRESS_MEDIA_BASE_URL:'https://staging-cms.immersation.com'},{WORDPRESS_MEDIA_USERNAME:'administrator'},{VERCEL_GIT_COMMIT_REF:'feature/other'},{MIRA_STAGING_READY:'true'}]) assert.ok(validateMiraDeployment({...ready,...change}).length);
});
