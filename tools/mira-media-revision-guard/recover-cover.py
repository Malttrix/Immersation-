#!/usr/bin/env python3
"""One-shot cover recovery. Execute only after separately approved Production release."""
import hashlib,json,os,pathlib,re,secrets,stat,sys,urllib.request,urllib.error
SID='local-readiness-00151b0461d24103b7ce94345b4be4cb'
ROOT=pathlib.Path('/home/box/.hermes/profiles/immersation-production/mira')
CREDS=ROOT/'credentials.json'
OLD=pathlib.Path('/home/box/.hermes/profiles/immersation-production/workspace/personal-intelligence-local-test/package/.mira-state.json')
IMAGE=pathlib.Path('/home/box/cover-optimized.jpg'); RECORD=ROOT/('cover-recovery-'+SID+'.json')
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args):return None
def private(p):
 if p.is_symlink() or not p.is_file() or p.stat().st_uid!=os.geteuid() or stat.S_IMODE(p.stat().st_mode)!=0o600:raise ValueError('private file unavailable')
def main():
 if sys.argv[1:]!=['--execute']:raise ValueError('use --execute only after deployment approval')
 if ROOT.is_symlink() or not ROOT.is_dir() or ROOT.stat().st_uid!=os.geteuid() or stat.S_IMODE(ROOT.stat().st_mode)&0o077:raise ValueError('unsafe production directory')
 private(CREDS);private(OLD)
 c=json.loads(CREDS.read_text()); state=json.loads(OLD.read_text());old=state['keys']['upload:cover']['key']
 if c.get('origin')!='https://immersation.com' or c.get('supabase_ref')!='zoneqvjrbcowlzwiyinq' or c.get('enabled') is not True or not re.fullmatch(r'[A-Za-z0-9_-]{43,128}',c.get('agent_token','')):raise ValueError('invalid production configuration')
 if not re.fullmatch(r'[A-Za-z0-9_-]{16,128}',old):raise ValueError('original operation unavailable')
 if IMAGE.is_symlink() or not IMAGE.is_file() or IMAGE.stat().st_uid!=os.geteuid():raise ValueError('image unavailable')
 data=IMAGE.read_bytes()
 if hashlib.sha256(data).hexdigest()!='674b517c3946859e3a02c6c75cc15ce946f23f4e66f6f3bbd300330a39e7ff68':raise ValueError('image hash mismatch')
 opener=urllib.request.build_opener(NoRedirect());base='https://immersation.com/api/editorial/agent/drafts/'+SID
 def call(path,method='GET',body=None,extra=None):
  req=urllib.request.Request(base+path,method=method,data=body,headers={'Authorization':'Bearer '+c['agent_token'],**(extra or {})})
  with opener.open(req,timeout=45) as r:return r.status,json.loads(r.read(32768))
 _,current=call('/media-guard-status')
 if current.get('guard')!='media-revision-v1' or current.get('submissionId')!=SID or current.get('articleId')!='mira-'+SID or current.get('articleStatus')!='Draft' or current.get('revision')!=1 or current.get('reviewStatus')!='collecting_assets' or current.get('blockingCoverOperations')!=0:raise ValueError('guard unavailable or submission changed')
 try:call('/assets/cover/status',extra={'Idempotency-Key':old});raise ValueError('original operation exists')
 except urllib.error.HTTPError as e:
  if e.code!=404:raise ValueError('original reservation check failed')
 if input('Type UPLOAD ONE COVER to proceed: ')!='UPLOAD ONE COVER':raise ValueError('not confirmed')
 key=secrets.token_urlsafe(32)
 payload={'submissionId':SID,'role':'cover','expected_revision':1,'sha256':hashlib.sha256(data).hexdigest(),'key':key,'state':'attempted'}
 fd=os.open(RECORD,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,'O_NOFOLLOW',0),0o600)
 with os.fdopen(fd,'w') as f:json.dump(payload,f);f.flush();os.fsync(f.fileno())
 # Record exists before the single POST. Never retry automatically on any outcome.
 status,out=call('/assets/cover','POST',data,{'Content-Type':'application/octet-stream','Idempotency-Key':key,'X-Expected-Revision':'1','X-Original-Filename':'cover-optimized.jpg'})
 asset=out.get('asset',{});mid=asset.get('id')
 if status!=201 or type(mid)!=int or mid<=0:raise ValueError('unconfirmed result; reconcile')
 _,verified=call('/assets/cover/verify',extra={'Idempotency-Key':key})
 if verified.get('verified') is not True or verified.get('role')!='cover' or verified.get('id')!=mid:raise ValueError('verification failed; reconcile')
 print('PASS: cover uploaded and server-verified; media ID',mid,'; check article in Content Studio. No review submitted.')
if __name__=='__main__':
 try:main()
 except Exception:print('BLOCKED: preserve recovery record; do not retry; operator reconciliation required.',file=sys.stderr);sys.exit(1)
