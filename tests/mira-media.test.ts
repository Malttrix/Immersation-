import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { prepareImage, createWordPressAdapter, MAX_IMAGE_BYTES } from '../server/wordpress-media';
const env = { WORDPRESS_MEDIA_BASE_URL:'https://cms.immersation.com', WORDPRESS_MEDIA_USERNAME:'test', WORDPRESS_MEDIA_APP_PASSWORD:'test-password' };
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
    callCount++; assert.equal(String(url),'https://cms.immersation.com/wp-json/wp/v2/media');
    assert.equal(opts?.redirect,'error'); assert.equal((opts?.headers as any)['content-type'],'image/png');
    return new Response(JSON.stringify({id:42,source_url:'https://cms.immersation.com/wp-content/uploads/test.png',mime_type:'image/png',media_details:{width:900,height:600}}),{status:201});
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
    if (String(url).includes('/wp-json/')) return new Response(JSON.stringify({id:9,source_url:`https://cms.immersation.com/uploads/${file}`,mime_type:'image/png',media_details:{width:image.width,height:image.height}}));
    assert.equal((opts?.headers as any)?.authorization,undefined);
    return new Response(new Uint8Array(image.bytes));
  };
  const adapter=createWordPressAdapter(env,fake);
  assert.equal((await adapter.verifyCandidate(9,'cover',op,image.sha256)).id,9);
  await assert.rejects(adapter.verifyCandidate(9,'cover','b'.repeat(32),image.sha256),/CANDIDATE_MISMATCH/);
  await assert.rejects(adapter.verifyCandidate(9,'cover',op,'c'.repeat(64)),/CANDIDATE_MISMATCH/);
  await assert.rejects(adapter.verifyCandidate(10,'cover',op,image.sha256),/CANDIDATE_MISMATCH/);
});
