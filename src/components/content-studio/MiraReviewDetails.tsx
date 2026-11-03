import React, { useEffect, useState } from 'react';
import type { StudioArticle, ArticleRepository } from '../../lib/article-studio';
import { editorialImageSource } from '../../lib/magazine-markdown';

export function MiraReviewDetails({ article, repository, onSaved, dirty }: { article: StudioArticle; repository: ArticleRepository; onSaved: (a: StudioArticle) => void; dirty: boolean }) {
  const [info, setInfo] = useState<any>(null), [ops,setOps] = useState<any[]>([]), [notes,setNotes] = useState(''), [references,setReferences] = useState('[]'), [qa,setQa] = useState('{}'), [alt,setAlt] = useState('{}'), [message,setMessage] = useState(''), [candidate,setCandidate]=useState<Record<string,string>>({});
  useEffect(() => { let active = true;
    repository.reviewDetails?.(article.id).then(x => { if (!active) return; setInfo(x); setNotes(x.editorial?.editorialNotes || ''); setReferences(JSON.stringify(x.editorial?.references || [],null,2)); setQa(JSON.stringify(x.editorial?.qa || {},null,2)); setAlt(JSON.stringify(x.editorial?.alt || {},null,2)); }).catch(() => { if (active) setMessage('Private review details unavailable.'); });
    repository.mediaOperations?.(article.id).then(x => { if(active) setOps(x); }).catch(() => { if(active) setMessage('Upload operations unavailable.'); });
    return () => { active=false; };
  }, [repository,article.id,article.studio_revision]);
  const extra=article._studioExtensions || {}, media=extra.miraMedia || {};
  async function save() {
    try {
      if (!repository.updateEditorial) throw Error('Editorial save unavailable.');
      const result=await repository.updateEditorial(article.id,article.studio_revision || 0,{editorialNotes:notes,references:JSON.parse(references),qa:JSON.parse(qa),alt:JSON.parse(alt)});
      onSaved(result); setMessage('Private metadata saved. Reopen the article to continue review.');
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Save failed.'); }
  }
  return <details className="studio-notice">
    <summary>MIRA review · revision {article.studio_revision || 0}</summary>
    <p>Submission: {extra.miraSubmissionId}. Review status: {info?.status || 'Loading…'}. Use the language and Preview controls for both articles.</p>
    <h3>Media</h3>
    {Object.entries(media).map(([role,item]:[string,any]) => { const src=editorialImageSource(item?.url); return src ? <figure key={role}><img src={src} alt={info?.editorial?.alt?.[role]?.en || `${role} image`} loading="lazy" style={{maxWidth:'240px',maxHeight:'320px',objectFit:'contain'}} /><figcaption>{role} · {item.width} × {item.height} · WordPress ID {item.id}</figcaption></figure> : null; })}
    {ops.map(op=><div key={op.operationId}><p>Uncertain upload: {op.role} · {op.filename} · operation {op.operationId}. Find its WordPress media ID and verify it belongs to this operation.</p><label>WordPress media ID <input value={candidate[op.operationId] || ''} onChange={e=>setCandidate({...candidate,[op.operationId]:e.target.value})} inputMode="numeric" /></label><button type="button" onClick={async()=>{try { if(!repository.reconcileMedia) throw Error('Reconciliation unavailable.'); await repository.reconcileMedia(op.requestKey,Number(candidate[op.operationId])); setMessage('Media verified and attached. Reopen this article.'); } catch(e) {setMessage(e instanceof Error ? e.message : 'Verification failed.');}}}>Verify and attach</button></div>)}
    <h3>Private editorial metadata</h3>
    <label>Editorial notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} /></label>
    <label>Source references (JSON)<textarea value={references} onChange={e=>setReferences(e.target.value)} /></label>
    <label>QA and warnings (JSON)<textarea value={qa} onChange={e=>setQa(e.target.value)} /></label>
    <label>Image alt text (JSON)<textarea value={alt} onChange={e=>setAlt(e.target.value)} /></label>
    <button type="button" disabled={dirty} onClick={()=>void save()}>Save private metadata</button>
    <p>Save article changes first. This save invalidates earlier approval.</p>
    <p role="status">{message}</p>
  </details>;
}
