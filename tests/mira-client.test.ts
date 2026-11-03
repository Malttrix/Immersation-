import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('Hermes client retains uncertain upload keys and never prints credentials', () => {
  const script = `
import importlib.util, tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('mira','tools/mira/immersation.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
with tempfile.TemporaryDirectory() as d:
 p=Path(d)/'state'; s={'version':1,'keys':{}}
 key=m.key_for(s,p,'upload:cover','a'*64)
 assert key==m.key_for(s,p,'upload:cover','a'*64)
 s['keys']['upload:cover']['uncertain']=True
 try: m.key_for(s,p,'upload:cover','a'*64)
 except m.ClientError as e: assert e.uncertain
 else: raise AssertionError('uncertain retry must stop')
 print('ok')
`;
  const result=spawnSync('python3',['-c',script],{encoding:'utf8',env:{...process.env,MIRA_AGENT_TOKEN:'secret-fixture-token'}});
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout.trim(),'ok');
  assert.equal(result.stdout.includes('secret-fixture-token'),false);
});
