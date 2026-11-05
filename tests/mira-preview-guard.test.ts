import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMiraDeployment } from '../scripts/mira-preview-guard.mjs';
const ref='dibfotxdupgdhbmhmrnl';
const safe=() => ({ VERCEL_ENV:'preview',VERCEL:'1',VERCEL_PROJECT_NAME:'immersation-staging',VERCEL_PROJECT_ID:'prj_StagingFixture',MIRA_STAGING_VERCEL_PROJECT_ID:'prj_StagingFixture',VERCEL_GIT_COMMIT_REF:'feature/mira-editorial-integration',MIRA_STAGING_READY:'true',MIRA_STAGING_SUPABASE_REF:ref,VITE_SUPABASE_URL:`https://${ref}.supabase.co`,SUPABASE_URL:`https://${ref}.supabase.co`,VITE_SUPABASE_ANON_KEY:'fixture',SUPABASE_SERVICE_ROLE_KEY:'fixture',MIRA_AGENT_TOKEN:'fixture',WORDPRESS_MEDIA_USERNAME:'fixture',WORDPRESS_MEDIA_APP_PASSWORD:'fixture',WORDPRESS_MEDIA_BASE_URL:'https://staging-cms.immersation.com',APP_URL:'https://preview.example' });
test('feature preview fails closed without explicit isolated staging configuration',()=>{
 assert.ok(validateMiraDeployment({VERCEL_ENV:'preview'}).length>0);
 assert.deepEqual(validateMiraDeployment(safe()),[]);
 for(const partial of [ {MIRA_STAGING_SUPABASE_REF:'zoneqvjrbcowlzwiyinq'}, {VITE_SUPABASE_URL:'https://zoneqvjrbcowlzwiyinq.supabase.co'}, {SUPABASE_URL:'https://zoneqvjrbcowlzwiyinq.supabase.co'}, {WORDPRESS_MEDIA_BASE_URL:'https://cms.immersation.com'}, {WORDPRESS_MEDIA_BASE_URL:'https://staging-cms.immersation.com.'}, {APP_URL:'https://immersation.com'}, {SENDFOX_API_KEY:'fixture'}, {STRIPE_SECRET_KEY:'fixture'} ]) assert.ok(validateMiraDeployment({...safe(),...partial}).length>0);
 assert.deepEqual(validateMiraDeployment({...safe(),VERCEL_ENV:'production'}),[]);
 assert.ok(validateMiraDeployment({...safe(),VERCEL_ENV:'production',VERCEL_PROJECT_ID:'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu',MIRA_STAGING_VERCEL_PROJECT_ID:'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu'}).length>0);
 assert.ok(validateMiraDeployment({...safe(),VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main'}).length>0);
 assert.ok(validateMiraDeployment({...safe(),MIRA_STAGING_SUPABASE_REF:'abcdefghijklmnopqrst',SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',VITE_SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co'}).length>0);
 for(const name of ['SENDFOX_TOKEN','SENDFOX_KEY','SENDFOX_API_TOKEN']) assert.ok(validateMiraDeployment({...safe(),[name]:'fixture'}).length>0);
 assert.ok(validateMiraDeployment({...safe(),VERCEL_PROJECT_NAME:'immersation'}).length>0);
 assert.ok(validateMiraDeployment({...safe(),VERCEL_PROJECT_PRODUCTION_URL:'immersation.com'}).length>0);
 const jwt = (r:string) => 'header.'+Buffer.from(JSON.stringify({ref:r})).toString('base64url')+'.sig';
 assert.ok(validateMiraDeployment({...safe(),VITE_SUPABASE_ANON_KEY:jwt('zoneqvjrbcowlzwiyinq')}).length>0);
 assert.deepEqual(validateMiraDeployment({...safe(),VITE_SUPABASE_ANON_KEY:jwt(ref),SUPABASE_SERVICE_ROLE_KEY:jwt(ref)}),[]);
 assert.ok(validateMiraDeployment({...safe(),VERCEL_PROJECT_ID:undefined}).length>0);
 assert.ok(validateMiraDeployment({...safe(),VERCEL_ENV:'production',MIRA_STAGING_VERCEL_PROJECT_ID:'prj_Different'}).length>0);
 assert.ok(validateMiraDeployment({VERCEL_ENV:'production'}).length>0);
 assert.deepEqual(validateMiraDeployment({}),[]);
});
test('guard and adapter share the strict staging origin allowlist',()=>{
 for(const url of ['https://cms.immersation.com','https://other.immersation.com','http://staging-cms.immersation.com','https://staging-cms.immersation.com:443','https://staging-cms.immersation.com:8443','https://user@staging-cms.immersation.com','https://staging-cms.immersation.com/path','https://staging-cms.immersation.com?x=1']) assert.ok(validateMiraDeployment({...safe(),WORDPRESS_MEDIA_BASE_URL:url}).length>0,url);
 assert.deepEqual(validateMiraDeployment({...safe(),WORDPRESS_MEDIA_BASE_URL:'https://staging-cms.immersation.com/'}),[]);
});
