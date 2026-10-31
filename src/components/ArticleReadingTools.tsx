import React, { memo, useEffect, useId, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, type MotionValue } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { readingProgress } from '../lib/reading-progress';

/** One measurement controller serves both responsive displays; only the Markdown body is measured. */
export function useArticleReadingProgress(targetRef: React.RefObject<HTMLElement | null>, contentKey: string) {
  const progress = useMotionValue(0);
  const { scrollY } = useScroll();
  useEffect(() => {
    let frame = 0, disposed = false;
    const measure = () => {
      frame = 0;
      const content = targetRef.current;
      if (!content || disposed) return;
      const rect = content.getBoundingClientRect();
      progress.set(readingProgress({ scrollY: window.scrollY, contentTop: rect.top + window.scrollY, contentHeight: rect.height,
        viewportHeight: window.innerHeight, topInset: 104, bottomInset: window.innerWidth < 1100 ? 52 : 0 }));
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const unsubscribe = scrollY.on('change', schedule);
    const observer = new ResizeObserver(schedule);
    if (targetRef.current) observer.observe(targetRef.current);
    // Changes above the body (cover decoding, font swap, responsive opening) move its start.
    if (targetRef.current?.closest('article')) observer.observe(targetRef.current.closest('article')!);
    window.addEventListener('resize', schedule, { passive: true });
    void document.fonts?.ready.then(schedule);
    measure();
    return () => { disposed = true; unsubscribe(); observer.disconnect(); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, [targetRef, contentKey, progress, scrollY]);
  return progress;
}

/** Motion draws the line; refs update the integer and ARIA only when the displayed percent changes. */
export const ReadingProgressMarker = memo(function ReadingProgressMarker({ progress, lang, compact = false }: {
  progress: MotionValue<number>; lang: 'en' | 'zh'; compact?: boolean;
}) {
  const output = useRef<HTMLSpanElement>(null), region = useRef<HTMLDivElement>(null), last = useRef(-1);
  const reduceMotion = useReducedMotion();
  const smooth = useSpring(progress, { stiffness: 240, damping: 34 });
  const sync = (value: number) => {
    const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
    if (percent === last.current) return;
    last.current = percent;
    if (output.current) output.current.textContent = String(percent);
    region.current?.setAttribute('aria-valuenow', String(percent));
    region.current?.setAttribute('aria-valuetext', `${percent}%`);
  };
  useMotionValueEvent(progress, 'change', sync);
  useEffect(() => { last.current = -1; sync(progress.get()); }, [progress, lang, reduceMotion]);
  return <div ref={region} className={`journal-reading-progress ${compact ? 'journal-progress-mobile' : 'journal-progress-desktop'}`}
    role="progressbar" aria-label={lang === 'en' ? 'Reading progress' : '阅读进度'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
    <span className="journal-progress-label">{lang === 'en' ? 'Reading progress' : '阅读进度'}</span>
    <span className="journal-progress-number" aria-hidden="true"><span ref={output} data-progress-value>0</span><span className="journal-progress-unit">%</span></span>
    <div className="journal-progress-track" aria-hidden="true"><motion.div style={{ scaleX: reduceMotion ? progress : smooth }} /></div>
  </div>;
});

export function TableOfContents({ headings, lang, activeHeadingId, collapsible = true }: {
  headings: { text: string; level: number; id: string }[]; lang: 'en' | 'zh'; activeHeadingId?: string | null; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!headings.length) return null;
  const label = lang === 'en' ? 'In this article' : '本文目录';
  return <nav className="journal-toc" data-collapsible={collapsible} aria-label={label}>
    {collapsible ? <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="journal-toc-label">
      {label}<ChevronDown size={14} className={open ? 'rotate-180' : ''} />
    </button> : <h2 className="journal-toc-label">{label}</h2>}
    {(!collapsible || open) && <ul id={id} className="toc-scroll">
      {headings.map((heading, index) => <li key={`${heading.id}-${index}`} style={{ paddingLeft: Math.max(0, heading.level - 2) * 10 }}>
        <a href={`#${heading.id}`} aria-current={activeHeadingId === heading.id ? 'location' : undefined}
          onClick={event => {
            const target = document.getElementById(heading.id);
            if (!target) return;
            event.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 104,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            window.history.pushState(null, '', `#${heading.id}`);
          }}>{heading.text}</a>
      </li>)}
    </ul>}
  </nav>;
}
