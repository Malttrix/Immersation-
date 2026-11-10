import importlib.util,json,tempfile,pathlib,unittest,unittest.mock,sys,shutil
p=pathlib.Path(__file__).with_name('recover-cover.py');spec=importlib.util.spec_from_file_location('recover',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Reply:
 def __init__(self,body,status=200):self.body=body;self.status=status
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self,*a):return json.dumps(self.body).encode()
class Test(unittest.TestCase):
 def test_block_before_post_when_guard_missing_and_record_one_shot(self):
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);r.chmod(0o700);creds=r/'creds';old=r/'state';rec=r/'record';img=r/'cover.jpg';shutil.copyfile('/Users/maxontan/Documents/Codex/mira-cover-recovery/cover-optimized.jpg',img)
   creds.write_text(json.dumps({'origin':'https://immersation.com','supabase_ref':'zoneqvjrbcowlzwiyinq','enabled':True,'agent_token':'x'*43}));old.write_text(json.dumps({'keys':{'upload:cover':{'key':'a'*32}}}));creds.chmod(0o600);old.chmod(0o600)
   class Opener:
    def __init__(self,good):self.good=good;self.posts=0
    def open(self,req,timeout):
     if req.method=='POST':self.posts+=1;raise TimeoutError()
     if req.full_url.endswith('/media-guard-status'):return Reply({'guard':'media-revision-v1' if self.good else 'wrong','submissionId':m.SID,'articleId':'mira-'+m.SID,'articleStatus':'Draft','revision':1,'reviewStatus':'collecting_assets','blockingCoverOperations':0})
     raise m.urllib.error.HTTPError(req.full_url,404,'',{},None)
   with unittest.mock.patch.multiple(m,ROOT=r,CREDS=creds,OLD=old,IMAGE=img,RECORD=rec),unittest.mock.patch.object(sys,'argv',['test','--execute']),unittest.mock.patch('builtins.input',return_value='UPLOAD ONE COVER'):
    bad=Opener(False)
    with unittest.mock.patch.object(m.urllib.request,'build_opener',return_value=bad):
     with self.assertRaises(ValueError):m.main()
    self.assertEqual(bad.posts,0);self.assertFalse(rec.exists())
    good=Opener(True)
    with unittest.mock.patch.object(m.urllib.request,'build_opener',return_value=good):
     with self.assertRaises(TimeoutError):m.main()
    self.assertEqual(good.posts,1);self.assertEqual(rec.stat().st_mode&0o777,0o600);self.assertEqual(json.loads(rec.read_text())['state'],'attempted')
    with unittest.mock.patch.object(m.urllib.request,'build_opener',return_value=good):
     with self.assertRaises(FileExistsError):m.main()
    self.assertEqual(good.posts,1)
unittest.main()
