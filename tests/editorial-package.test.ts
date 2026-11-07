import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateEditorialPackage } from '../server/editorial-package';
const sample = () => JSON.parse(readFileSync('examples/mira/article-package.json', 'utf8'));
test('accepts a complete bilingual draft package', () => assert.equal(validateEditorialPackage(sample()).ok, true));
test('rejects publishing fields, missing translation and malformed slug', () => {
  for (const change of [{ status: 'Published' }, { slug: '../article' }, { title: { en: 'only English' } }]) {
    assert.equal(validateEditorialPackage({ ...sample(), ...change }).ok, false);
  }
});
test('rejects raw HTML, active URL schemes and insecure references', () => {
  for (const text of ['<script>alert(1)</script>', '[link](javascript:alert(1))']) {
    const data = sample(); data.content.en = text;
    assert.equal(validateEditorialPackage(data).ok, false);
  }
  const data = sample(); data.references = [{ title: 'Source', url: 'http://example.com' }];
  assert.equal(validateEditorialPackage(data).ok, false);
});
test('complete editorial, social and bilingual alt metadata validates; unsafe fields do not', () => {
  const data=sample();
  assert.equal(validateEditorialPackage(data).ok,true);
  assert.equal(validateEditorialPackage({...data,pillar:'other'}).ok,false);
  assert.equal(validateEditorialPackage({...data,seo:{titleEN:'ok',script:'bad'}}).ok,false);
  assert.equal(validateEditorialPackage({...data,social:{pinterest:[{role:'pinterest3',title:'x',description:'x',keywords:[]}]}}).ok,false);
});
