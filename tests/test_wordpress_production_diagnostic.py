import importlib.util
import io
from email.message import Message
from pathlib import Path
import unittest

path=Path(__file__).resolve().parents[1]/'tools/mira/verify-production-wordpress.py'
spec=importlib.util.spec_from_file_location('diagnostic',path)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class Response:
    def __init__(self, status, body, kind='application/json', server='cloudflare'):
        self.status=status; self.body=body
        self.headers=Message(); self.headers['Content-Type']=kind; self.headers['Server']=server
    def read(self, n): return self.body[:n]
    def close(self): pass

class DiagnosticTests(unittest.TestCase):
    def test_safe_wordpress_error_does_not_display_server_message(self):
        result=m.describe(Response(403,b'{"code":"mira_role_invalid","message":"sensitive material"}'))
        self.assertEqual(result['source'],'WordPress REST')
        self.assertEqual(result['code'],'mira_role_invalid')
        self.assertNotIn('sensitive material',str(result))

    def test_authenticated_identity_requires_exact_username(self):
        self.assertTrue(m.describe(Response(200,b'{"username":"mira-media-prod"}'))['identity'])
        self.assertFalse(m.describe(Response(200,b'{"username":"other"}'))['identity'])

    def test_no_authorization_header_for_anonymous_request(self):
        class Opener:
            def open(self,req,timeout):
                self.req=req; return Response(401,b'{"code":"rest_not_logged_in"}')
        opener=Opener();m.request(m.ROUTES[0][1],opener=opener)
        self.assertIsNone(opener.req.get_header('Authorization'))
        self.assertEqual(opener.req.get_header('User-agent'),m.USER_AGENT)

if __name__=='__main__':unittest.main()
