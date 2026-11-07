import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { prepareImage, createWordPressAdapter, MAX_IMAGE_BYTES, verifyStagingMedia } from '../server/wordpress-media';
const env = { WORDPRESS_MEDIA_BASE_URL:'https://staging-cms.immersation.com', WORDPRESS_MEDIA_USERNAME:'test', WORDPRESS_MEDIA_APP_PASSWORD:'test-password' };
const raw = (width=900,height=600) => sharp({create:{width,height,channels:3,background:'red'}}).png().toBuffer();
test('image pipeline decodes formats, size, dimensions and strips metadata', async () => {
  const valid=await prepareImage(await raw(),'cover');
  assert.equal(valid.mime,'image/png'); assert.equal(valid.width,900); assert.equal(valid.height,600);
  await assert.rejects(prepareImage(Buffer.from('<svg/>'),'cover'),/INVALID_IMAGE/);
  await assert.rejects(prepareImage(Buffer.alloc(MAX_IMAGE_BYTES+1),'cover'),/INVALID_SIZE/);
  await assert.rejects(prepareImage(await raw(600,900),'cover'),/INVALID_DIMENSIONS/);
  await assert.rejects(prepareImage(await raw(),'pinterest1'),/INVALID_DIMENSIONS/);
  assert.equal((await prepareImage(await raw(600,900),'pinterest1')).height,900);
});
test('WordPress adapter validates response and treats failure as uncertain', async () => {
  const image=await prepareImage(await raw(),'cover');
  let callCount=0;
  const fake: typeof fetch = async (url,opts) => {
    callCount++; assert.equal(String(url),'https://staging-cms.immersation.com/wp-json/wp/v2/media');
    assert.equal(opts?.redirect,'error'); assert.equal((opts?.headers as any)['content-type'],'image/png');
    return new Response(JSON.stringify({id:42,source_url:'https://staging-cms.immersation.com/wp-content/uploads/test.png',mime_type:'image/png',media_details:{width:900,height:600}}),{status:201});
  };
  assert.equal((await createWordPressAdapter(env,fake).upload(image,'cover')).id,42);
  assert.equal(callCount,1);
  await assert.rejects(createWordPressAdapter(env,async()=>new Response('',{status:401})).upload(image,'cover'),/WORDPRESS_UNAUTHORIZED/);
  await assert.rejects(createWordPressAdapter(env,async()=>{throw Error('timeout')}).upload(image,'cover'),/WORDPRESS_RESULT_UNKNOWN/);
  await assert.rejects(createWordPressAdapter(env,async()=>new Response(JSON.stringify({id:42,source_url:'https://evil.example/file.png'}),{status:201})).upload(image,'cover'),/WORDPRESS_RESULT_UNKNOWN/);
  assert.throws(()=>createWordPressAdapter({...env,WORDPRESS_MEDIA_BASE_URL:'http://example.com'}),/WORDPRESS_NOT_CONFIGURED/);
});
test('reconciliation verifies operation identifier and exact remote bytes', async () => {
  const image=await prepareImage(await raw(),'cover'), op='a'.repeat(32), file=`mira-cover-${op}.png`;
  const fake: typeof fetch=async (url,opts) => {
    if (String(url).includes('/wp-json/')) return new Response(JSON.stringify({id:9,source_url:`https://staging-cms.immersation.com/uploads/${file}`,mime_type:'image/png',media_details:{width:image.width,height:image.height}}));
    assert.equal((opts?.headers as any)?.authorization,undefined);
    return new Response(new Uint8Array(image.bytes));
  };
  const adapter=createWordPressAdapter(env,fake);
  assert.equal((await adapter.verifyCandidate(9,'cover',op,image.sha256)).id,9);
  await assert.rejects(adapter.verifyCandidate(9,'cover','b'.repeat(32),image.sha256),/CANDIDATE_MISMATCH/);
  await assert.rejects(adapter.verifyCandidate(9,'cover',op,'c'.repeat(64)),/CANDIDATE_MISMATCH/);
  await assert.rejects(adapter.verifyCandidate(10,'cover',op,image.sha256),/CANDIDATE_MISMATCH/);
});
test('provider absence check fails closed for matches, incomplete results and unavailable search', async () => {
  const op='a'.repeat(32);
  const empty: typeof fetch=async () => new Response('[]',{status:200,headers:{'x-wp-total':'0'}});
  await createWordPressAdapter(env,empty).checkNoCandidates(op);
  const matches: typeof fetch=async () => new Response('[{"id":1},{"id":2}]',{status:200,headers:{'x-wp-total':'2'}});
  await assert.rejects(createWordPressAdapter(env,matches).checkNoCandidates(op),/CANDIDATES_EXIST/);
  await assert.rejects(createWordPressAdapter(env,async()=>new Response('[]')).checkNoCandidates(op),/WORDPRESS_UNAVAILABLE/);
  await assert.rejects(createWordPressAdapter(env,async()=>{throw Error('network')}).checkNoCandidates(op),/WORDPRESS_UNAVAILABLE/);
});
test('only the approved staging WordPress origin is accepted by the adapter', () => {
 for (const bad of ['https://cms.immersation.com','https://other.immersation.com','http://staging-cms.immersation.com','https://staging-cms.immersation.com:8443','https://staging-cms.immersation.com:443','https://user@staging-cms.immersation.com','https://staging-cms.immersation.com/path','https://staging-cms.immersation.com?x=1','https://staging-cms.immersation.com.evil.test']) {
  assert.throws(()=>createWordPressAdapter({...env,WORDPRESS_MEDIA_BASE_URL:bad}),/WORDPRESS_NOT_CONFIGURED/);
 }
 assert.doesNotThrow(()=>createWordPressAdapter(env));
 assert.doesNotThrow(()=>createWordPressAdapter({...env,WORDPRESS_MEDIA_BASE_URL:env.WORDPRESS_MEDIA_BASE_URL+'/'}));
});
test('staging verification requires recorded metadata and exact validated image bytes', async () => {
 const image=await prepareImage(await raw(),'cover'), op='a'.repeat(32);
 const asset={id:10,url:`https://staging-cms.immersation.com/wp-content/uploads/2026/11/mira-cover-${op}.png`,mime:image.mime,width:image.width,height:image.height};
 const record={id:10,source_url:asset.url,mime_type:asset.mime,media_details:{width:asset.width,height:asset.height}};
 const fake=(metadata=record, imageBody: Uint8Array=image.bytes, mime='image/png'): typeof fetch => async (url,opts) => {
  assert.equal(opts?.redirect,'error');
  if (String(url).includes('/wp-json/')) return new Response(JSON.stringify(metadata),{headers:{'content-type':'application/json'}});
  assert.equal(String(url),asset.url); return new Response(new Uint8Array(imageBody),{headers:{'content-type':mime}});
 };
 await verifyStagingMedia(asset,'cover',op,image.sha256,fake());
 await assert.rejects(verifyStagingMedia(asset,'cover',op,image.sha256,fake(record,image.bytes,'text/html')),/MEDIA_VERIFICATION_FAILED/);
 await assert.rejects(verifyStagingMedia(asset,'cover',op,image.sha256,fake(record,Buffer.from('not an image'))),/MEDIA_VERIFICATION_FAILED/);
 await assert.rejects(verifyStagingMedia(asset,'cover',op,'b'.repeat(64),fake()),/MEDIA_VERIFICATION_FAILED/);
 await assert.rejects(verifyStagingMedia(asset,'cover',op,image.sha256,fake({...record,source_url:'https://evil.example/x'})),/MEDIA_VERIFICATION_FAILED/);
 await assert.rejects(verifyStagingMedia({...asset,url:'https://staging-cms.immersation.com.evil.example/x'},'cover',op,image.sha256,fake()),/MEDIA_VERIFICATION_FAILED/);
 await assert.rejects(verifyStagingMedia(asset,'cover',op,image.sha256,async()=>new Response('',{status:302,headers:{location:'https://evil.example'}})),/MEDIA_VERIFICATION_FAILED/);
});
