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

test('client submits a complete package to a local fixture and reports only confirmed review', async () => {
  const { createServer } = await import('node:http');
  const { mkdtemp, writeFile, rm, mkdir } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawn } = await import('node:child_process');
  const root=await mkdtemp(join(tmpdir(),'mira-client-'));
  const received: string[]=[];
  const server=createServer((req,res)=>{ received.push(`${req.method} ${req.url}`); req.resume(); req.on('end',()=>{res.setHeader('content-type','application/json'); if(req.url?.endsWith('/finalize')) res.end(JSON.stringify({status:'pending_review',reviewUrl:`http://127.0.0.1:${(server.address() as any).port}/admin`})); else res.end(JSON.stringify({status:'collecting_assets'}));}); });
  try {
    await mkdir(join(root,'media'));
    for(const role of ['cover','pinterest1','pinterest2']) await writeFile(join(root,'media',`${role}.jpg`),'local fixture');
    await writeFile(join(root,'package.json'),JSON.stringify({article:{submissionId:'demo',title:{en:'Sample'},pillar:'body'},media:{cover:'media/cover.jpg',pinterest1:'media/pinterest1.jpg',pinterest2:'media/pinterest2.jpg'}}));
    await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const port=(server.address() as any).port;
    const child=spawn('python3',['tools/mira/immersation.py','submit','--package',root],{env:{...process.env,IMMERSATION_API_BASE:`http://127.0.0.1:${port}`,MIRA_AGENT_TOKEN:'a'.repeat(43)}});
    let out='',err='';child.stdout.on('data',x=>out+=x);child.stderr.on('data',x=>err+=x);
    const code=await new Promise<number|null>(resolve=>child.on('close',resolve));
    assert.equal(code,0,err);assert.match(out,/Pending Review/);assert.match(out,/http:\/\/127\.0\.0\.1:\d+\/admin/);assert.equal(received.length,5);
    assert.equal(out.includes('a'.repeat(43)),false);
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); await rm(root,{recursive:true,force:true}); }
});
