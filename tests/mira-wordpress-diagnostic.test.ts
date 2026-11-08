import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/app';

const env={VERCEL:'1',VERCEL_ENV:'production',VERCEL_PROJECT_NAME:'immersation',VERCEL_PROJECT_ID:'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu',VERCEL_GIT_COMMIT_REF:'main',MIRA_PRODUCTION_READY:'true',SUPABASE_URL:'https://zoneqvjrbcowlzwiyinq.supabase.co',VITE_SUPABASE_URL:'https://zoneqvjrbcowlzwiyinq.supabase.co',APP_URL:'https://immersation.com',WORDPRESS_MEDIA_BASE_URL:'https://cms.immersation.com',WORDPRESS_MEDIA_USERNAME:'mira-media-prod',WORDPRESS_MEDIA_APP_PASSWORD:'fixture-only',MIRA_AGENT_TOKEN:'a'.repeat(43),SUPABASE_SERVICE_ROLE_KEY:'fixture',VITE_SUPABASE_ANON_KEY:'fixture'};

test('WordPress diagnostic is authenticated, read-only and redacts upstream responses',async()=>{
 let calls=0, writes=0;
 const db:any={rpc:async()=>{writes++;throw Error('unexpected database operation')}};
 let upstream=new Response(JSON.stringify({username:'mira-media-prod',secret:'do-not-return'}),{headers:{'content-type':'application/json'}});
 const transport:typeof fetch=async (url,options)=>{calls++;assert.equal(String(url),'https://cms.immersation.com/index.php?rest_route=%2Fwp%2Fv2%2Fusers%2Fme&context=edit');assert.equal(options?.method,'GET');assert.equal(options?.redirect,'error');assert.match((options?.headers as any).authorization,/^Basic /);return upstream;};
 const app=createApp({env,db,mediaFetch:transport});const server=app.listen(0,'127.0.0.1');
 try {
  await new Promise<void>(resolve=>server.once('listening',resolve));const address=server.address();if(!address || typeof address==='string')throw Error('no port');const url=`http://127.0.0.1:${address.port}/api/editorial/agent/diagnostics/wordpress`;
  const denied=await fetch(url,{headers:{'x-forwarded-proto':'https'}});assert.equal(denied.status,401);assert.equal(calls,0);
  const invalid=await fetch(url,{headers:{'x-forwarded-proto':'https',authorization:'Bearer '+'b'.repeat(43)}});assert.equal(invalid.status,401);assert.equal(calls,0);
  const headers={'x-forwarded-proto':'https',authorization:'Bearer '+env.MIRA_AGENT_TOKEN};const ok=await fetch(url,{headers});assert.equal(ok.status,200);assert.deepEqual(await ok.json(),{verified:true,upstreamStatus:200,username:'mira-media-prod'});
  upstream=new Response(JSON.stringify({code:'rest_not_logged_in',message:'do-not-return'}),{status:401,headers:{'content-type':'application/json'}});
  const failed=await fetch(url,{headers});assert.equal(failed.status,502);assert.deepEqual(await failed.json(),{code:'WORDPRESS_AUTH_NOT_VERIFIED',upstreamStatus:401,wordpressCode:'rest_not_logged_in'});assert.equal(writes,0);
 } finally {await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
