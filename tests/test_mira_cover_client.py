import contextlib, importlib.util, io, json, pathlib, tempfile, unittest
from unittest.mock import patch

path=pathlib.Path(__file__).resolve().parents[1]/'tools/mira/immersation.py'
spec=importlib.util.spec_from_file_location('mira_cover_client',path)
client=importlib.util.module_from_spec(spec); spec.loader.exec_module(client)

class CoverClientTests(unittest.TestCase):
 def run_package(self,media):
  calls=[]
  def api(stage,path,method='GET',body=None,headers=None):
   calls.append((stage,method,headers))
   if stage=='status': return {'submissionId':'s','status':'collecting_assets','revision':3}
   if stage=='finalize': return {'submissionId':'s','status':'pending_review','revision':3,'reviewUrl':'https://immersation.com/admin'}
   return {}
  with tempfile.TemporaryDirectory() as root:
   p=pathlib.Path(root); (p/'cover.jpg').write_bytes(b'cover')
   (p/'package.json').write_text(json.dumps({'article':{'submissionId':'s','title':{'en':'Test'},'pillar':'tool'},'media':media}))
   with patch.object(client,'api',side_effect=api), patch.object(client,'verified_review_url',return_value='https://immersation.com/admin'),contextlib.redirect_stdout(io.StringIO()):
    client.submit(root)
  return calls
 def test_cover_only(self):
  calls=self.run_package({'cover':'cover.jpg'})
  upload=next(x for x in calls if x[0]=='upload:cover')
  self.assertEqual(upload[2]['X-Expected-Revision'],'3')
  self.assertEqual(upload[2]['Content-Type'],'application/octet-stream')
 def test_six_image_package_does_not_upload_social(self):
  calls=self.run_package({'cover':'cover.jpg','pinterest1':'p1.png','pinterest2':'p2.png','instagram1':'i1.png','instagram2':'i2.png','instagram3':'i3.png'})
  self.assertEqual([c[0] for c in calls if c[0].startswith('upload:')],['upload:cover'])
 def test_missing_cover_fails_before_network(self):
  with self.assertRaises(client.ClientError): self.run_package({'pinterest1':'p1.png'})

if __name__=='__main__': unittest.main()
