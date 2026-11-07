import test from 'node:test';
import assert from 'node:assert/strict';
import { mountEditorialAgent } from '../server/editorial-agent';

const staging = {VERCEL:'1', VERCEL_PROJECT_NAME:'immersation-staging', VERCEL_PROJECT_ID:'prj_Ip7SJfJuqk1B7OfTkm0Jl1ceBwk0', MIRA_STAGING_SUPABASE_REF:'dibfotxdupgdhbmhmrnl', SUPABASE_URL:'https://dibfotxdupgdhbmhmrnl.supabase.co', APP_URL:'https://immersation-staging.vercel.app', WORDPRESS_MEDIA_BASE_URL:'https://staging-cms.immersation.com', MIRA_AGENT_TOKEN:'a'.repeat(43)};
function setup(env: NodeJS.ProcessEnv) {
 const middlewares: any[] = [], routes: Record<string,any> = {};
 const app: any = {use: (_root: string, handler: any) => middlewares.push(handler), get:(path: string,handler:any)=>routes[path]=handler, post:()=>{}};
 let reads=0;
 const db: any={from:()=>{reads++; return {select:()=>({eq:()=>({eq:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})})})};}};
 mountEditorialAgent(app,db,env);
 const res: any={statusCode:200, set(){return this;}, status(n:number){this.statusCode=n; return this;}, json(v:any){this.body=v; return this;}};
 const req: any={headers:{'x-forwarded-proto':'https'}, params:{id:'existing-draft',role:'cover'},get:()=> 'x'.repeat(43)};
 return {auth:middlewares[0],route:routes['/api/editorial/agent/drafts/:id/assets/:role/verify'],req,res,reads:()=>reads};
}
test('verification requires agent authorization and exact staging identity',async()=>{
 const a=setup(staging); let next=false; a.auth(a.req,a.res,()=>{next=true});
 assert.equal(next,false); assert.equal(a.res.statusCode,401); assert.equal(a.reads(),0);
 for (const change of [{VERCEL_PROJECT_ID:'prj_other'},{SUPABASE_URL:'https://example.com'},{VERCEL:'0'},{WORDPRESS_MEDIA_BASE_URL:'https://cms.immersation.com'}]) {
  const x=setup({...staging,...change}); await x.route(x.req,x.res);
  assert.equal(x.res.statusCode,404); assert.equal(x.reads(),0);
 }
 const x=setup(staging); x.req.headers.authorization='Bearer '+staging.MIRA_AGENT_TOKEN; let ok=false; x.auth(x.req,x.res,()=>{ok=true}); assert.equal(ok,true);
 await x.route(x.req,x.res); assert.equal(x.res.statusCode,404); assert.equal(x.reads(),1);
});
