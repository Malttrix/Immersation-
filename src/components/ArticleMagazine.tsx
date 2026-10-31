import React, { useState } from 'react';
import { editorialImageSource, type MagazineLayout } from '../lib/magazine-markdown';
import { backgroundIntensity, imageAspect, imageFocal, overlayIntensity } from '../lib/editorial-settings';

/** Complete images retain diagrams/text; only explicitly photographic assets receive a crop. */
export function EditorialImage({ src, alt = '', caption, priority = false, decorative = false, className = '', inline = false,
  treatment = 'complete', aspect, focal, mobileSrc }: {
  src?: string; alt?: string; caption?: string; priority?: boolean; decorative?: boolean; className?: string; inline?: boolean;
  treatment?: 'complete' | 'photograph'; aspect?: string; focal?: string; mobileSrc?: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const safeSource = editorialImageSource(src);
  const failed = !safeSource || failedSource === safeSource;
  const image = !failed && <img src={safeSource} alt={decorative ? '' : alt} aria-hidden={decorative || undefined}
    width={1672} height={941} loading={priority ? 'eager' : 'lazy'} decoding="async"
    fetchPriority={priority ? 'high' : undefined} referrerPolicy="no-referrer"
    style={{ objectPosition: imageFocal(focal) }} onError={() => setFailedSource(safeSource)} />;
  if (decorative) return failed ? null : <div className={`magazine-backdrop ${className}`} aria-hidden="true">{editorialImageSource(mobileSrc)?<picture><source media="(max-width: 600px)" srcSet={editorialImageSource(mobileSrc)}/>{image}</picture>:image}</div>;
  const Frame = inline ? 'span' : 'figure';
  const Surface = inline ? 'span' : 'div';
  const Caption = inline ? 'span' : 'figcaption';
  return <Frame className={`magazine-image ${className}`} data-image-treatment={treatment}
    style={{ '--editorial-image-ratio': imageAspect(aspect) } as React.CSSProperties}>
    <Surface className="magazine-image-surface">{image || <span className="magazine-image-fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} />}</Surface>
    {caption && <Caption className="magazine-image-caption">{caption}</Caption>}
  </Frame>;
}

export function EditorialBackgroundSection({ src, intensity, focal = 'right', children, overlay, mobileSrc, mobileFallback }: {
  src?: string; intensity?: unknown; focal?: string; children?: React.ReactNode; overlay?: unknown; mobileSrc?: string; mobileFallback?: string;
}) {
  const alpha = backgroundIntensity(intensity);
  return <section className="magazine-photo-section" data-background-intensity={alpha} data-mobile-background={mobileFallback}
    style={{ '--editorial-photo-alpha': alpha, '--editorial-overlay-alpha': overlayIntensity(overlay) } as React.CSSProperties}>
    <EditorialImage src={src} decorative focal={focal} mobileSrc={mobileSrc} /><div className="magazine-photo-copy">{children}</div>
  </section>;
}
export function EditorialPullQuote({ children }: { children?: React.ReactNode }) {
  return <blockquote className="magazine-pullquote">{children}</blockquote>;
}
export function EditorialSplitSection({ src, alt, caption, side, fit, focal, aspect, children }: MagazineBlockProps) {
  return <section className={`magazine-split ${side === 'right' ? 'magazine-split-right' : ''}`}>
    <EditorialImage src={src} alt={alt} caption={caption} treatment={fit === 'cover' ? 'photograph' : 'complete'} focal={focal} aspect={aspect} />
    <div className="magazine-split-copy">{children}</div>
  </section>;
}
type MagazineBlockProps = {
  layout?: MagazineLayout; src?: string; alt?: string; caption?: string; side?: string; children?: React.ReactNode;
  intensity?: unknown; focal?: string; fit?: string; aspect?: string; overlay?: unknown; mobileSrc?: string; mobileFallback?: string;
};
export function MagazineBlock(props: MagazineBlockProps) {
  const { layout, src, alt, caption, fit, focal, aspect, children } = props;
  if (layout === 'quote') return <EditorialPullQuote>{children}</EditorialPullQuote>;
  if (layout === 'image') return <div className="magazine-full-image"><EditorialImage src={src} alt={alt} caption={caption}
    treatment={fit === 'cover' ? 'photograph' : 'complete'} focal={focal} aspect={aspect} />{children}</div>;
  if (layout === 'split') return <EditorialSplitSection {...props} />;
  return <EditorialBackgroundSection {...props} />;
}

export type ArticlePresentation = 'classic-editorial' | 'premium-magazine' | 'visual-feature';
export function resolveArticlePresentation(value: unknown): ArticlePresentation {
  const mode = typeof value === 'object' && value ? (value as { mode?: unknown }).mode : value;
  const key = typeof mode === 'string' ? mode.toLowerCase().replace(/[ _]/g, '-') : '';
  if (['classic', 'editorial', 'classic-editorial'].includes(key)) return 'classic-editorial';
  if (['visual', 'feature', 'visual-feature'].includes(key)) return 'visual-feature';
  return 'premium-magazine';
}
export function ArticleOpening({ children, hero }: { children: React.ReactNode; hero?: React.ReactNode }) {
  return <div className="journal-opening">{children}{hero}</div>;
}
export function MagazineHeader({ children }: { children: React.ReactNode }) {
  return <header className="magazine-masthead">{children}</header>;
}
export function MagazineReaderGrid({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return <div className="journal-reading-grid"><div className="journal-reading-main">{children}</div>{sidebar}</div>;
}
export function MagazineSidebar({ children, lang }: { children: React.ReactNode; lang: 'en'|'zh' }) {
  return <aside className="journal-sidebar" aria-label={lang === 'en' ? 'Article reading tools' : '文章阅读工具'}><div className="journal-sidebar-inner">{children}</div></aside>;
}
