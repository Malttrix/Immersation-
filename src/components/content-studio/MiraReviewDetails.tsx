import React, { useEffect, useRef, useState } from 'react';
import type { StudioArticle, ArticleRepository } from '../../lib/article-studio';
import { editorialImageSource } from '../../lib/magazine-markdown';
import { reviewError, validateReviewResponse, type ReviewAction } from '../../lib/mira-review';

export function MiraReviewDetails({ article, repository, onSaved, dirty, onMetadataDirtyChange }: { article: StudioArticle; repository: ArticleRepository; onSaved: (a: StudioArticle) => void; dirty: boolean; onMetadataDirtyChange: (dirty: boolean) => void }) {
  const [info, setInfo] = useState<any>(null), [ops,setOps] = useState<any[]>([]), [notes,setNotes] = useState(''), [references,setReferences] = useState('[]'), [qa,setQa] = useState('{}'), [alt,setAlt] = useState('{}'), [message,setMessage] = useState(''), [candidate,setCandidate]=useState<Record<string,string>>({}), [evidence,setEvidence]=useState<Record<string,string>>({});
  const [metadataBaseline, setMetadataBaseline] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [reloadRequired, setReloadRequired] = useState(false);
  const actionLock = useRef(false);
  useEffect(() => { let active = true;
    repository.reviewDetails?.(article.id).then(x => { if (!active) return; const initial = [x.editorial?.editorialNotes || '', JSON.stringify(x.editorial?.references || [],null,2), JSON.stringify(x.editorial?.qa || {},null,2), JSON.stringify(x.editorial?.alt || {},null,2)]; setInfo(x); setNotes(initial[0]); setReferences(initial[1]); setQa(initial[2]); setAlt(initial[3]); setMetadataBaseline(JSON.stringify(initial)); }).catch(() => { if (active) setMessage('Private review details unavailable.'); });
    repository.mediaOperations?.(article.id).then(x => { if(active) setOps(x); }).catch(() => { if(active) setMessage('Upload operations unavailable.'); });
    return () => { active=false; };
  }, [repository,article.id,article.studio_revision]);
  const extra=article._studioExtensions || {}, media=extra.miraMedia || {};
  const metadataDirty = metadataBaseline === null || JSON.stringify([notes,references,qa,alt]) !== metadataBaseline;
  useEffect(() => { onMetadataDirtyChange(metadataBaseline !== null && metadataDirty); return () => onMetadataDirtyChange(false); }, [metadataDirty, metadataBaseline, onMetadataDirtyChange]);
  function discardMetadata() { if (metadataBaseline === null || !window.confirm('Discard unsaved private metadata changes?')) return; const [n,r,q,a] = JSON.parse(metadataBaseline); setNotes(n); setReferences(r); setQa(q); setAlt(a); }
  async function act(action: ReviewAction) {
    if (actionLock.current || dirty || metadataDirty || reloadRequired || info?.status !== 'pending_review') return;
    actionLock.current = true; setBusy(true); setMessage('');
    try {
      if (!repository.review || !repository.reviewDetails || !extra.miraSubmissionId) throw Error('Remote review is unavailable.');
      const revision = article.studio_revision || 0;
      const result = await repository.review(article.id, revision, action);
      validateReviewResponse(result, extra.miraSubmissionId, revision, action);
      const updated = await repository.reviewDetails(article.id);
      if (updated?.status !== result.status || (action === 'approve' && updated?.approvedRevision !== revision)) throw Error('Review status could not be confirmed. Reopen the article before trying again.');
      setInfo(updated); setMessage('Review decision confirmed. Publication is a separate action.');
    } catch (e) { setReloadRequired(true); setMessage(reviewError(e)); }
    finally { actionLock.current = false; setBusy(false); }
  }
  async function publish() {
    if (actionLock.current || dirty || metadataDirty || reloadRequired || info?.publishEligible !== true || info?.currentRevision !== article.studio_revision || info?.approvedRevision !== article.studio_revision) return;
    if (!window.confirm('Publish this exact approved revision publicly?')) return;
    actionLock.current = true; setBusy(true); setMessage('');
    try {
      if (!repository.publishReviewed) throw Error('Publication is unavailable.');
      const saved = await repository.publishReviewed(article.id, article.studio_revision || 0);
      if (saved.id !== article.id || saved.status !== 'Published') throw Error('Publication response was not confirmed. Reopen the article before trying again.');
      window.alert('Publication confirmed. The article is now public.');
      onSaved(saved);
    } catch (e) { setReloadRequired(true); setMessage(reviewError(e)); }
    finally { actionLock.current = false; setBusy(false); }
  }
  async function save() {
    try {
      if (!repository.updateEditorial) throw Error('Editorial save unavailable.');
      const result=await repository.updateEditorial(article.id,article.studio_revision || 0,{editorialNotes:notes,references:JSON.parse(references),qa:JSON.parse(qa),alt:JSON.parse(alt)});
      onSaved(result); setMessage('Private metadata saved. Reopen the article to continue review.');
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Save failed.'); }
  }
  return <details className="studio-notice">
    <summary>MIRA review · revision {article.studio_revision || 0}</summary>
    <p>Submission: {extra.miraSubmissionId}. Review status: <strong>{({ pending_review: 'Pending', approved: 'Approved', rejected: 'Rejected', revision_requested: 'Revision requested', collecting_assets: 'Collecting assets', published: 'Published' } as Record<string,string>)[info?.status] || (info ? 'Unknown' : 'Loading…')}</strong>. Approved revision: {info?.approvedRevision ?? 'None'}.</p>
    <p>Approval applies only to this saved revision. Later edits require a new approval. Use the language and Preview controls for both articles.</p>
    {([['request_revision', 'Request revision'], ['reject', 'Reject'], ['approve', 'Approve revision']] as [ReviewAction,string][]).map(([action,label]) => <button key={action} type="button" disabled={dirty || metadataDirty || busy || reloadRequired || info?.status !== 'pending_review'} onClick={() => void act(action)}>{label}</button>)}
    <button type="button" disabled={busy || dirty || metadataDirty || reloadRequired || info?.publishEligible !== true || info?.currentRevision !== article.studio_revision || info?.approvedRevision !== article.studio_revision} onClick={() => void publish()}>Publish approved revision…</button>
    <p>Publishing is a separate action and requires confirmation of the exact approved revision.</p>
    {reloadRequired && <p role="alert">Reopen the article to check its current server state before taking another action.</p>}

    {metadataBaseline !== null && metadataDirty && <p role="status">Save or discard private metadata before saving the article, review or publication. <button type="button" onClick={discardMetadata}>Discard private metadata changes</button></p>}
    <h3>Media</h3>
    {Object.entries(media).map(([role,item]:[string,any]) => { const src=editorialImageSource(item?.url); return src ? <figure key={role}><img src={src} alt={info?.editorial?.alt?.[role]?.en || `${role} image`} loading="lazy" style={{maxWidth:'240px',maxHeight:'320px',objectFit:'contain'}} /><figcaption>{role} · {item.width} × {item.height} · WordPress ID {item.id}</figcaption></figure> : null; })}
    {ops.map(op=><div key={op.operationId}><p>Uncertain upload: {op.role} · {op.filename} · operation {op.operationId}. Find its WordPress media ID and verify it belongs to this operation.</p><label>WordPress media ID <input value={candidate[op.operationId] || ''} onChange={e=>setCandidate({...candidate,[op.operationId]:e.target.value})} inputMode="numeric" /></label><button type="button" onClick={async()=>{try { if(!repository.reconcileMedia) throw Error('Reconciliation unavailable.'); await repository.reconcileMedia(op.requestKey,Number(candidate[op.operationId])); setMessage('Media verified and attached. Reopen this article.'); } catch(e) {setMessage(e instanceof Error ? e.message : 'Verification failed.');}}}>Verify and attach</button><p>Only after independently checking the complete WordPress library, including other uploaders and trash, document why this operation is absent. Do not include secrets or personal information.</p><label>Evidence of absence <textarea value={evidence[op.operationId] || ''} onChange={e=>setEvidence({...evidence,[op.operationId]:e.target.value})} /></label><button type="button" disabled={(evidence[op.operationId] || '').trim().length < 40} onClick={async()=>{if (!window.confirm('Confirm that the provider has no media for this operation and allow a new upload attempt?')) return; try { if(!repository.confirmMediaAbsent) throw Error('Absent-upload recovery unavailable.'); await repository.confirmMediaAbsent(op.requestKey,evidence[op.operationId]); setMessage('Decision recorded. A new upload requires explicit client action.'); setOps(ops.filter(x=>x.operationId!==op.operationId)); } catch(e) {setMessage(e instanceof Error ? e.message : 'Decision could not be recorded.');}}}>Confirm absent and permit retry</button></div>)}
    <h3>Private editorial metadata</h3>
    <fieldset disabled={metadataBaseline === null || busy || reloadRequired}>
    <label>Editorial notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} /></label>
    <label>Source references (JSON)<textarea value={references} onChange={e=>setReferences(e.target.value)} /></label>
    <label>QA and warnings (JSON)<textarea value={qa} onChange={e=>setQa(e.target.value)} /></label>
    <label>Image alt text (JSON)<textarea value={alt} onChange={e=>setAlt(e.target.value)} /></label>
    <button type="button" disabled={dirty || busy || reloadRequired} onClick={()=>void save()}>Save private metadata</button>
    </fieldset>
    <p>Save article changes first. This save invalidates earlier approval.</p>
    <p role="status">{message}</p>
  </details>;
}
