import React, { useState } from 'react';
import { editorialImageSource, type MagazineLayout } from '../lib/magazine-markdown';

/** Reserved geometry prevents image failures and slow connections from shifting the reader. */
export function EditorialImage({ src, alt = '', caption, priority = false, decorative = false, className = '', inline = false }: {
  src?: string; alt?: string; caption?: string; priority?: boolean; decorative?: boolean; className?: string; inline?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const safeSource = editorialImageSource(src);
  const failed = !safeSource || failedSource === safeSource;
  const image = !failed && <img src={safeSource} alt={decorative ? '' : alt} aria-hidden={decorative || undefined}
    width={1672} height={941} loading={priority ? 'eager' : 'lazy'} decoding="async"
    fetchPriority={priority ? 'high' : undefined} referrerPolicy="no-referrer"
    onError={() => setFailedSource(safeSource)} />;
  if (decorative) return failed ? null : <div className={`magazine-backdrop ${className}`} aria-hidden="true">{image}</div>;
  const Frame = inline ? 'span' : 'figure';
  const Surface = inline ? 'span' : 'div';
  const Caption = inline ? 'span' : 'figcaption';
  return <Frame className={`magazine-image ${className}`}>
    <Surface className="magazine-image-surface">{image || <span className="magazine-image-fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} />}</Surface>
    {caption && <Caption className="magazine-image-caption">{caption}</Caption>}
  </Frame>;
}

export function MagazineBlock({ layout, src, alt, caption, side, children }: {
  layout: MagazineLayout; src?: string; alt?: string; caption?: string; side?: string; children?: React.ReactNode;
}) {
  if (layout === 'quote') return <blockquote className="magazine-pullquote">{children}</blockquote>;
  if (layout === 'image') return <div className="magazine-full-image"><EditorialImage src={src} alt={alt} caption={caption} />{children}</div>;
  if (layout === 'split') return <section className={`magazine-split ${side === 'right' ? 'magazine-split-right' : ''}`}>
    <EditorialImage src={src} alt={alt} caption={caption} /><div className="magazine-split-copy">{children}</div>
  </section>;
  return <section className="magazine-photo-section">
    <EditorialImage src={src} decorative /><div className="magazine-photo-copy">{children}</div>
  </section>;
}
