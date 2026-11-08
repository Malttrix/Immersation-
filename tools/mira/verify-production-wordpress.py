#!/usr/bin/env python3
"""Read-only WordPress REST diagnostics; never display authentication material."""
import base64
import getpass
import json
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ORIGIN='https://cms.immersation.com'
ROUTES=(('pretty','/wp-json/wp/v2/users/me?context=edit'),('index','/index.php?rest_route=/wp/v2/users/me&context=edit'))
USER_AGENT='Immersation-MIRA-Media-Diagnostic/1.0'
SAFE_MESSAGES={
    'rest_not_logged_in':'WordPress reports no authenticated user.',
    'rest_forbidden_context':'WordPress denies this response context.',
    'rest_user_cannot_view':'WordPress denies access to this user.',
    'mira_role_invalid':'The MIRA role or its effective capabilities are invalid.',
    'mira_rest_forbidden':'The MIRA role denies this REST route.',
    'mira_media_forbidden':'The media request contains restricted parameters.',
    'incorrect_password':'WordPress rejected the supplied credentials.',
    'invalid_username':'WordPress rejected the supplied credentials.',
    'application_passwords_disabled':'Application Password authentication is disabled.',
}

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl): return None

def describe(response):
    """Return only fixed classifications and approved WordPress error text."""
    body=response.read(65537)
    kind=response.headers.get_content_type()
    server=(response.headers.get('Server') or '').lower()
    result={'status':response.status,'content_type':kind,'source':'unknown','code':'none','message':'not available','identity':False}
    if len(body)>65536:
        result['message']='Response exceeds the diagnostic size limit.'; return result
    data=None
    if kind=='application/json' or kind.endswith('+json'):
        try:data=json.loads(body)
        except (ValueError,UnicodeDecodeError):pass
    if isinstance(data,dict):
        code=data.get('code')
        if isinstance(code,str) and re.fullmatch(r'[a-z0-9_]{1,64}',code):
            result['code']=code
            result['message']=SAFE_MESSAGES.get(code,'WordPress returned an error; the original message was withheld.')
            result['source']='WordPress REST'
        elif 'cloudflare_error' in data or 'ray_id' in data:
            result['source']='Cloudflare'
        if response.status==200 and data.get('username')=='mira-media-prod':
            result['identity']=True; result['source']='WordPress REST'
    elif b'litespeed' in body.lower(): result['source']='LiteSpeed error page'
    if result['source']=='unknown' and 'cloudflare' in server: result['source']='Cloudflare or origin behind Cloudflare'
    elif result['source']=='unknown' and 'litespeed' in server: result['source']='LiteSpeed'
    return result

def request(path,authorization=None,opener=None):
    headers={'User-Agent':USER_AGENT,'Accept':'application/json'}
    if authorization: headers['Authorization']=authorization
    req=Request(ORIGIN+path,headers=headers)
    try: response=(opener or build_opener(NoRedirect())).open(req,timeout=15)
    except HTTPError as exc: response=exc
    try: return describe(response)
    finally: response.close()

def main():
    if len(sys.argv)!=1 or not sys.stdin.isatty():
        print('BLOCKED: interactive terminal required'); return 1
    password=getpass.getpass('WordPress Application Password (hidden): ')
    if not password: print('BLOCKED: no password supplied'); return 1
    try:
        token=base64.b64encode(('mira-media-prod:'+password).encode()).decode()
        verified=False
        for label,path in ROUTES:
            try:
                anonymous=request(path)
                authenticated=request(path,'Basic '+token)
            except (URLError,TimeoutError,OSError,ValueError):
                print(f'{label}: network, TLS, or response error'); continue
            for mode,result in (('anonymous',anonymous),('authenticated',authenticated)):
                print(f"{label} {mode}: HTTP {result['status']}; content-type {result['content_type']}; source {result['source']}; code {result['code']}; message {result['message']}")
            if authenticated['identity']:
                verified=True
                print(f'{label}: PASS — WordPress authenticated mira-media-prod.')
            elif authenticated['code'] in ('mira_role_invalid','mira_rest_forbidden','mira_media_forbidden'):
                print(f'{label}: WordPress recognized the MIRA role; review the reported permission error.')
            elif authenticated['code']=='rest_not_logged_in':
                print(f'{label}: WordPress did not authenticate the request; header forwarding and credential validity remain unconfirmed.')
            else:
                print(f'{label}: Authentication and header forwarding could not be established.')
        return 0 if verified else 1
    finally:
        password=''
        if 'token' in locals():token=''

if __name__=='__main__':sys.exit(main())
