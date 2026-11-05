#!/usr/bin/env python3
"""Hermes-compatible draft-only client. Never accepts admin credentials."""
import argparse, hashlib, json, os, secrets, stat, sys, tempfile
from pathlib import Path
from urllib import request, error, parse

CURRENT_SUBMISSION = None
ROLES = {'cover','background','pinterest1','pinterest2'} | {f'instagram{i}' for i in range(1,10)}
class ClientError(Exception):
    def __init__(self, stage, code, uncertain=False, correlation=None):
        self.stage, self.code, self.uncertain, self.correlation = stage, code, uncertain, correlation

def config():
    base=os.environ.get('IMMERSATION_API_BASE','https://immersation.com').rstrip('/')
    url=parse.urlsplit(base)
    if url.username or url.password or url.query or url.fragment or url.path not in ('','/') or not (url.scheme=='https' or (url.scheme=='http' and url.hostname in ('localhost','127.0.0.1','::1'))):
        raise ClientError('configuration','INVALID_API_ORIGIN')
    token=os.environ.get('MIRA_AGENT_TOKEN','')
    if len(token)<43 or not all(c.isalnum() or c in '_-' for c in token): raise ClientError('configuration','MISSING_AGENT_TOKEN')
    return base, token

class NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None

def api(stage, path, method='GET', body=None, headers=None):
    base, token=config()
    extra={}
    bypass=os.environ.get('MIRA_VERCEL_BYPASS_SECRET','')
    if bypass:
        if base != 'https://immersation-staging.vercel.app' or not bypass.isascii() or not 1 <= len(bypass) <= 512 or any(ord(c) < 33 or ord(c) > 126 for c in bypass):
            raise ClientError('configuration','INVALID_STAGING_BYPASS')
        extra['x-vercel-protection-bypass']=bypass
    req=request.Request(base+'/api/editorial/agent'+path,data=body,method=method,headers={'Authorization':'Bearer '+token,**extra,**(headers or {})})
    try:
        with request.build_opener(NoRedirect()).open(req,timeout=45) as res: return json.load(res)
    except error.HTTPError as exc:
        try: data=json.loads(exc.read(32768))
        except Exception: data={}
        code=data.get('code','HTTP_ERROR')
        raise ClientError(stage,code, stage.startswith('upload:') and (data.get('retrySafe') is False or exc.code>=500), exc.headers.get('X-Correlation-Id')) from None
    except Exception: raise ClientError(stage,'NETWORK_ERROR',stage.startswith('upload:')) from None

def verified_review_url(value):
    base,_=config()
    expected=parse.urlsplit(base); actual=parse.urlsplit(value if isinstance(value,str) else '')
    if (actual.scheme,actual.hostname,actual.port)!=(expected.scheme,expected.hostname,expected.port) or actual.username or actual.password or actual.path != '/admin' or actual.query or actual.fragment:
        raise ClientError('review_url','INVALID_REVIEW_URL')
    return value

def read_state(path):
    if not path.exists(): return {'version':1,'keys':{}}
    if path.is_symlink() or not stat.S_ISREG(path.stat().st_mode): raise ClientError('state','INVALID_STATE_FILE')
    return json.loads(path.read_text())

def save_state(path,state):
    fd,name=tempfile.mkstemp(prefix='.mira-state-',dir=path.parent)
    try:
        with os.fdopen(fd,'w') as handle: json.dump(state,handle,sort_keys=True); handle.flush(); os.fsync(handle.fileno())
        os.replace(name,path); os.chmod(path,0o600)
    finally:
        if os.path.exists(name): os.unlink(name)

def key_for(state,path,stage,digest):
    existing=state['keys'].get(stage)
    if existing and existing.get('uncertain'): raise ClientError(stage,'RECONCILIATION_REQUIRED',True)
    if existing and existing['digest']==digest: return existing['key']
    key=secrets.token_urlsafe(32)
    state['keys'][stage]={'digest':digest,'key':key}
    save_state(path,state)
    return key

def submit(directory, resume_reconciled=False, retry_confirmed_absent=None):
    global CURRENT_SUBMISSION
    root=Path(directory).resolve(); manifest=json.loads((root/'package.json').read_text())
    payload=manifest['article']; media=manifest['media']; submission=payload['submissionId']; CURRENT_SUBMISSION=submission
    if not {'cover','pinterest1','pinterest2'} <= set(media) or not set(media)<=ROLES: raise ClientError('validation','INVALID_MEDIA_ROLES')
    body=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode()
    state_path=root/'.mira-state.json'; state=read_state(state_path)
    key=key_for(state,state_path,'draft',hashlib.sha256(body).hexdigest())
    result=api('draft','/drafts','POST',body,{'Content-Type':'application/json','Idempotency-Key':key})
    for role, relative in media.items():
        path=(root/relative).resolve()
        if root not in path.parents or not path.is_file(): raise ClientError('validation','INVALID_MEDIA_PATH')
        content=path.read_bytes()
        if not 0<len(content)<=3*1024*1024: raise ClientError('validation','INVALID_MEDIA_SIZE')
        stage='upload:'+role
        existing=state['keys'].get(stage)
        digest=hashlib.sha256(content).hexdigest()
        if existing and existing.get('uncertain') and retry_confirmed_absent==role:
            outcome=api('upload_status:'+role,'/drafts/'+parse.quote(submission,safe='')+'/assets/'+role+'/status',headers={'Idempotency-Key':existing['key']})
            if outcome.get('state') != 'failed': raise ClientError(stage,'ABSENCE_NOT_CONFIRMED',True)
            state.setdefault('history',[]).append({'stage':stage, **existing})
            del state['keys'][stage]; save_state(state_path,state); existing=None
        if existing and existing.get('uncertain') and resume_reconciled and existing['digest']==digest:
            existing.pop('uncertain'); save_state(state_path,state)
        key=key_for(state,state_path,stage,digest)
        # Persist uncertainty *before* the network call so process termination is safe.
        state['keys'][stage]['uncertain']=True; save_state(state_path,state)
        try:
            api(stage,'/drafts/'+parse.quote(submission,safe='')+'/assets/'+role,'POST',content,{'Content-Type':'application/octet-stream','Idempotency-Key':key,'X-Original-Filename':path.name.encode('ascii','replace').decode()})
        except ClientError as exc:
            if not exc.uncertain: state['keys'][stage].pop('uncertain',None); save_state(state_path,state)
            raise
        state['keys'][stage].pop('uncertain',None); save_state(state_path,state)
    result=api('finalize','/drafts/'+parse.quote(submission,safe='')+'/finalize','POST')
    if result.get('status')!='pending_review': raise ClientError('finalize','UNCONFIRMED_STATUS')
    review_url=verified_review_url(result.get('reviewUrl'))
    print('MIRA — Editorial Submission Complete')
    print('Article:',payload['title']['en']); print('Pillar:',payload['pillar'])
    print('English: Ready | Chinese: Ready | Cover: Uploaded | Pinterest: Uploaded')
    print('Status: Pending Review'); print('Admin review:',review_url)
    print('Founder action: Review & Approve')

def main():
    parser=argparse.ArgumentParser(prog='immersation'); sub=parser.add_subparsers(dest='command',required=True)
    p=sub.add_parser('submit');p.add_argument('--package',required=True);p.add_argument('--resume-reconciled',action='store_true');p.add_argument('--retry-confirmed-absent',choices=sorted(ROLES))
    p=sub.add_parser('status');p.add_argument('--id',required=True)
    args=parser.parse_args()
    try:
        if args.command=='submit': submit(args.package,args.resume_reconciled,args.retry_confirmed_absent)
        else:
            data=api('status','/drafts/'+parse.quote(args.id,safe=''))
            if data.get('reviewUrl'): data['reviewUrl']=verified_review_url(data['reviewUrl'])
            print(json.dumps({k:data.get(k) for k in ('submissionId','status','revision','reviewUrl')},ensure_ascii=False))
    except ClientError as exc:
        print(json.dumps({'submissionId':CURRENT_SUBMISSION,'correlationId':exc.correlation,'stage':exc.stage,'code':exc.code,'retrySafe':not exc.uncertain,'action':'Operator reconciliation required' if exc.uncertain else 'Check configuration or validation'},ensure_ascii=False),file=sys.stderr);return 1
    except (OSError,ValueError,KeyError,TypeError):
        print(json.dumps({'stage':'package','code':'INVALID_LOCAL_PACKAGE','retrySafe':False}),file=sys.stderr);return 1
    return 0
if __name__=='__main__': sys.exit(main())
