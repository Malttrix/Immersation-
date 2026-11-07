#!/usr/bin/env python3
"""Read-only identity check; enter the existing application password privately."""
import base64
import getpass
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def main():
    if len(sys.argv) != 1 or not sys.stdin.isatty():
        print('BLOCKED: interactive terminal required'); return 1
    secret=getpass.getpass('WordPress Application Password (hidden): ')
    if not secret:
        print('BLOCKED: no password supplied'); return 1
    try:
        credential=base64.b64encode(('mira-media-prod:'+secret).encode()).decode()
        req=Request('https://cms.immersation.com/wp-json/wp/v2/users/me?context=edit',headers={'Authorization':'Basic '+credential,'Accept':'application/json'})
        with build_opener(NoRedirect()).open(req,timeout=15) as response:
            if response.status != 200 or not response.headers.get_content_type() == 'application/json':
                print('FAIL: unexpected status or content type'); return 1
            data=json.loads(response.read(65537))
            if data.get('username') != 'mira-media-prod':
                print('FAIL: identity could not be confirmed'); return 1
            print('PASS: authenticated as mira-media-prod'); return 0
    except HTTPError as exc:
        print('FAIL: WordPress returned HTTP '+str(exc.code)); return 1
    except (URLError,TimeoutError,ValueError,OSError):
        print('FAIL: connection, TLS, or response error'); return 1
    finally:
        secret=''
        if 'credential' in locals(): credential=''

if __name__=='__main__': sys.exit(main())
