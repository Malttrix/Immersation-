import { subscribeToSendfox } from "../lib/sendfox";
import { defaultArticles } from "../articlesData";
import { supabase } from "../lib/supabase";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useReducedMotion } from "motion/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import remarkMagazine, { magazineSanitizeSchema, type MagazineLayout } from "../lib/magazine-markdown";
import { EditorialImage, MagazineBlock, ArticleOpening, resolveArticlePresentation } from "./ArticleMagazine";
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Share2, 
  Bookmark, 
  Compass, 
  Sparkles, 
  Activity, 
  Coins,
  CheckCircle,
  X,
  Music,
  ChevronDown,
  Eye
} from "lucide-react";

/** Article content remains static and indexable; interactions respect reduced motion. */

interface ArticlesViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  initialArticleSlug?: string | null;
  articles?: Article[];
}

export interface Article {
  slug: string;
  pillar: "body" | "tool" | "capital" | "general";
  category: { en: string; zh: string };
  title: { en: string; zh: string };
  excerpt: { en: string; zh: string };
  date: { en: string; zh: string };
  readTime: { en: string; zh: string };
  tags: string[];
  content: {
    en: string;
    zh: string;
  };
  pinterestImageUrl?: string;
  cover?: string;
  author?: string;
  adUrl?: string;
  /** Optional presentation metadata; absent/unknown values use Premium Magazine. */
  presentation?: string | { mode?: string };
}

// ----------------------------------------------------------------------------
// 1. READING PROGRESS MARKER
// A thin viewport rail uses a Motion value without React updates on every scroll.
// ----------------------------------------------------------------------------
export function ReadingProgressMarker({
  targetRef,
  lang,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  lang: "en" | "zh";
}) {
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  return <div className="journal-progress" role="img" aria-label={lang === "en" ? "Reading progress" : "阅读进度"}>
    <motion.div style={{ scaleX: scrollYProgress }} />
  </div>;
}

// ----------------------------------------------------------------------------
// 2. ACTIVE TABLE OF CONTENTS
// Discreet collapsed navigation retains heading anchors and active state.
// ----------------------------------------------------------------------------
export function TableOfContents({
  headings,
  lang,
  activeHeadingId,
}: {
  headings: { text: string; level: number; id: string }[];
  lang: "en" | "zh";
  activeHeadingId?: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <div className="journal-toc">
      <button
        aria-expanded={open}
        aria-controls="journal-contents"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-[11px] tracking-[0.2em] uppercase text-[#1A2F24] font-bold shrink-0 cursor-pointer"
      >
        {lang === "en" ? "In This Article" : "本文目录"}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul id="journal-contents" className="mt-5 flex flex-col gap-2 overflow-y-auto pr-1 toc-scroll">
          {headings.map((h, i) => {
            const headingId = h.id;
            const isActive = activeHeadingId === headingId;
            return (
              <li key={i} style={{ paddingLeft: `${(h.level - 2) * 10}px` }}>
                <a
                  href={`#${headingId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(headingId);
                    if (el) {
                      const yOffset = -90;
                      const rect = el.getBoundingClientRect();
                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                      const targetY = rect.top + scrollTop + yOffset;
                      window.scrollTo({ top: targetY, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                      window.history.pushState(null, "", `#${headingId}`);
                    }
                  }}
                  className={`text-[12.5px] leading-snug block transition-all duration-200 border-l-2 py-1 pl-2.5 -ml-px ${
                    isActive
                      ? "border-[#B69A6B] text-[#1A2F24] font-bold bg-[#B69A6B]/10 rounded-r-xs"
                      : "border-transparent text-[#1C1C1C]/70 hover:text-[#8B5A44] hover:border-[#D8D2C6]"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. EDITORIAL SECTION HEADING (ArticleHeading)
// Static section hierarchy with stable heading anchors.
// ----------------------------------------------------------------------------
export function ArticleHeading({
  id,
  children,
  level = 2,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return <Heading id={id} className={`journal-heading journal-heading-${level} ${className}`}>{children}</Heading>;
}

// ----------------------------------------------------------------------------
// 4. EDITORIAL PARAGRAPH (ArticleParagraph)
// Article text stays visible immediately; typography carries the reading rhythm.
// ----------------------------------------------------------------------------
export function ArticleParagraph({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  // Editorial text stays readable immediately, including find-in-page and anchor jumps.
  return <p className={`leading-relaxed font-serif text-base sm:text-[17px] text-[#1C1C1C]/90 my-5 ${className}`}>{children}</p>;
}

// ----------------------------------------------------------------------------
// 5. SIDEBAR CARD ENTRANCE (SidebarCard)
// Fades in and slides up 16px when first entering viewport (350ms duration)
// ----------------------------------------------------------------------------
export function SidebarCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
      className={`border border-[#D8D2C6] rounded-sm bg-white/60 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// 6. FULL-QUALITY EDITORIAL COVER (HeroImage)
// Original image, reserved aspect ratio, no crop or color grading.
// ----------------------------------------------------------------------------
export function HeroImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <EditorialImage src={src} alt={alt} priority className={`magazine-cover ${className}`} />;
}

// ----------------------------------------------------------------------------
// 7. SHARE ICON INTERACTION (ShareBar / SocialShareBar)
// Hover scale 1.08 + background color tint shift (150ms transition duration)
// ----------------------------------------------------------------------------
export function ShareBar({
  article,
  lang,
  url,
  title,
}: {
  article?: Article;
  lang: "en" | "zh";
  url?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const articleTitle = title || (article ? article.title[lang] : "");
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const shareLinks = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(shareUrl)}`,
      bgHoverClass: "hover:bg-[#1DA1F2]/15 hover:text-[#1DA1F2] hover:border-[#1DA1F2]",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.83 20.25h1.833L7.045 3.75H5.087Z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      bgHoverClass: "hover:bg-[#0A66C2]/15 hover:text-[#0A66C2] hover:border-[#0A66C2]",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(articleTitle)}`,
      bgHoverClass: "hover:bg-[#E60023]/15 hover:text-[#E60023] hover:border-[#E60023]",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.36 2 11.74c0 4.12 2.54 7.63 6.15 9.04-.08-.77-.16-1.95.03-2.79.18-.76 1.15-4.83 1.15-4.83s-.29-.59-.29-1.45c0-1.36.79-2.38 1.77-2.38.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.09-1.85 3.09-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.27 0 .85.33 1.75.73 2.24a.29.29 0 0 1 .07.28c-.08.31-.25 1-.29 1.14-.04.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6-0 3.58-2.26 6.46-5.4 6.46-1.05 0-2.05-.55-2.39-1.2 0 0-.52 1.99-.65 2.48-.24.9-.87 2.03-1.3 2.72A10 10 0 1 0 12 2Z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(articleTitle + " " + shareUrl)}`,
      bgHoverClass: "hover:bg-[#25D366]/15 hover:text-[#25D366] hover:border-[#25D366]",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.51 3.63 1.4 5.13L2 22l5.13-1.5a9.9 9.9 0 0 0 4.91 1.3c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.79 14.02c-.24.68-1.4 1.32-1.94 1.4-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.78-4.16-4.93-4.36-.15-.2-1.18-1.57-1.18-2.99 0-1.42.75-2.11 1.02-2.4.26-.28.58-.35.77-.35h.55c.18 0 .42-.07.65.5.24.57.8 1.98.87 2.12.07.15.11.32.02.51-.09.19-.13.31-.26.48-.13.17-.28.38-.4.51-.13.13-.27.28-.12.55.16.28.71 1.18 1.53 1.91 1.05.94 1.94 1.24 2.22 1.38.28.13.44.11.6-.07.17-.18.7-.81.89-1.09.19-.28.38-.23.63-.13.26.09 1.63.77 1.91.91.28.13.46.2.53.31.07.13.07.72-.17 1.39Z" />
        </svg>
      ),
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 py-6 my-6 border-y border-[#D8D2C6]/60">
      <span className="text-[10px] tracking-[0.25em] uppercase text-[#1C1C1C]/45 font-display font-semibold mr-1">
        {lang === "en" ? "Share" : "分享"}
      </span>
      {shareLinks.map((s) => (
        <motion.a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${s.name}`}
          whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
          transition={{ duration: 0.15 }}
          className={`w-9 h-9 flex items-center justify-center rounded-full border border-[#D8D2C6] text-[#1A2F24] transition-colors duration-150 ${s.bgHoverClass}`}
        >
          {s.icon}
        </motion.a>
      ))}
      <motion.button
        onClick={handleCopy}
        aria-label={lang === "en" ? "Copy link" : "复制链接"}
        whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
        transition={{ duration: 0.15 }}
        className="ml-1 w-9 h-9 flex items-center justify-center rounded-full border border-[#8B5A44]/50 text-[#8B5A44] hover:bg-[#8B5A44]/15 hover:border-[#8B5A44] transition-colors duration-150 relative cursor-pointer"
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-[#8B5A44]" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
          </svg>
        )}
      </motion.button>
      {copied && (
        <span className="text-[11px] text-[#8B5A44] font-medium ml-2">
          {lang === "en" ? "Link copied" : "链接已复制"}
        </span>
      )}
    </div>
  );
}

export interface ArticlePageProps {
  article: Article;
  lang: "en" | "zh";
  onBack: () => void;
  onBookmark?: (slug: string, e: React.MouseEvent) => void;
  isBookmarked?: boolean;
  relatedArticles?: Article[];
  onNavigate?: (slug: string) => void;
  onPlayChime?: () => void;
  activeArticleStats?: { views: number; timeSpent: number } | null;
  activeHeadingId?: string | null;
}

export function ArticlePage({
  article,
  lang,
  onBack,
  onBookmark,
  isBookmarked,
  relatedArticles = [],
  onNavigate,
  onPlayChime,
  activeArticleStats,
  activeHeadingId,
}: ArticlePageProps) {
  const articleBodyRef = useRef<HTMLElement>(null);
  const [pinterestOpen, setPinterestOpen] = useState(false);
  const presentation = resolveArticlePresentation(article.presentation);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const headings = (article.content[lang] || "")
    .split("\n")
    .filter((line: string) => line.startsWith("## ") || line.startsWith("### ") || line.startsWith("#### "))
    .map((line: string) => {
      let level = 2;
      let text = line;
      if (line.startsWith("#### ")) { level = 4; text = line.replace("#### ", "").trim(); }
      else if (line.startsWith("### ")) { level = 3; text = line.replace("### ", "").trim(); }
      else if (line.startsWith("## ")) { level = 2; text = line.replace("## ", "").trim(); }
      const cleanText = text.replace(/[*_~`]/g, '');
      return { text: cleanText, level, id: generateSlug(cleanText) };
    });

  const originalContent = article.content[lang] || "";
  const contentLines = originalContent.split("\n");
  const firstH1Index = contentLines.findIndex(line => line.trim().startsWith("# "));
  if (firstH1Index !== -1) {
    contentLines.splice(firstH1Index, 1);
  }
  const cleanedContent = contentLines.join("\n");

  const getPlainText = (children: any): string => {
    if (!children) return "";
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map(getPlainText).join("");
    }
    if (children.props && children.props.children) {
      return getPlainText(children.props.children);
    }
    return "";
  };

  const markdownComponents = useMemo(() => ({
    h1: ({ children }: any) => (
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A2F24] pt-12 pb-4 border-b border-[#D8D2C6]">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => {
      const id = generateSlug(getPlainText(children));
      return (
        <ArticleHeading id={id} level={2}>
          {children}
        </ArticleHeading>
      );
    },
    h3: ({ children }: any) => {
      const id = generateSlug(getPlainText(children));
      return (
        <ArticleHeading id={id} level={3}>
          {children}
        </ArticleHeading>
      );
    },
    h4: ({ children }: any) => {
      const id = generateSlug(getPlainText(children));
      return (
        <ArticleHeading id={id} level={4}>
          {children}
        </ArticleHeading>
      );
    },
    p: ({ children }: any) => {
      const text = getPlainText(children).trim();

      const imageOnly = React.Children.toArray(children).every(child =>
        typeof child === 'string' ? !child.trim() : React.isValidElement(child) && (child.props as any).node?.tagName === 'img');
      if (imageOnly && React.Children.count(children)) return <div className="magazine-inline-figure">{children}</div>;

      if (/^https?:\/\/.*\.(png|jpe?g|gif|webp|svg|heic)(\?.*)?$/i.test(text)) {
        return <EditorialImage src={text} alt="" />;
      }

      if (text.includes("{{audio:")) {
        const audioMatch = text.match(/\{\{audio:(.*?)\}\}/);
        if (audioMatch) {
          const url = audioMatch[1];
          return (
            <div className="bg-[#1A2F24]/5 border border-[#8B5A44]/30 rounded-sm p-4 my-6 flex items-center gap-4">
              <Music className="w-6 h-6 text-[#8B5A44] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-display text-[9px] font-bold text-[#8B5A44] uppercase tracking-widest block mb-1">
                  Embedded Media Player
                </span>
                <audio src={url || undefined} controls className="w-full h-8 accent-[#8B5A44]" />
              </div>
            </div>
          );
        }
      }

      return (
        <ArticleParagraph>
          {children}
        </ArticleParagraph>
      );
    },
    strong: ({ children }: any) => (
      <strong className="font-semibold text-[#1A2F24]">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-[#1C1C1C]/85">{children}</em>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 my-4 space-y-2.5 font-serif text-base sm:text-[17px] text-[#1C1C1C]/90">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 my-4 space-y-3 font-serif text-base sm:text-[17px] text-[#1C1C1C]/90">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#B69A6B] pl-4 italic my-6 text-[#1A2F24]/85 font-serif">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: any) => {
      const isExternal = href && (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//"));
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-[#8B5A44] hover:underline underline-offset-4 transition-all duration-300"
        >
          {children}
        </a>
      );
    },
    pre: ({ children }: any) => (
      <pre className="bg-[#1A2F24] text-[#F4F1EB] rounded-sm p-6 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed my-6 border border-white/5">
        {children}
      </pre>
    ),
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const codeContent = String(children).replace(/\n$/, "");
      const isInline = !match && !codeContent.includes("\n");
      if (isInline) {
        return (
          <code className="bg-[#1A2F24]/10 text-[#8B5A44] font-mono text-xs px-1.5 py-0.5 rounded-sm">
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    table: ({ children }: any) => (
      <div className="w-full overflow-x-auto my-8 rounded-sm border border-[#D8D2C6]/60">
        <table className="w-full text-left border-collapse text-sm text-[#1C1C1C]">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-[#1A2F24]/5 border-b border-[#D8D2C6]">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-[#D8D2C6]/40">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-[#1A2F24]/5 transition-colors">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 font-display text-[11px] uppercase tracking-wide font-semibold text-[#1A2F24]">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 font-serif text-[#1C1C1C]/90 leading-relaxed">{children}</td>
    ),
    img: ({ src, alt, title, node }: any) => (
      <span className="magazine-markdown-image">
        <EditorialImage src={src} alt={alt || ""} caption={title || alt} inline />
      </span>
    ),
    section: ({ node, children }: any) => {
      const p = node?.properties || {};
      const layout = p.dataMagazineLayout as MagazineLayout;
      if (!['image', 'background', 'quote', 'split'].includes(layout)) return <section>{children}</section>;
      return <MagazineBlock layout={layout} src={p.dataMagazineImage} alt={p.dataMagazineAlt}
        caption={p.dataMagazineCaption} side={p.dataMagazineSide}>{children}</MagazineBlock>;
    },
    hr: () => <hr className="my-10 border-t border-[#D8D2C6]" />,
  }), []);

  return (
    <div className="magazine-reader journal-reader" data-presentation={presentation} lang={lang === "zh" ? "zh-Hans" : "en"} id="article-reader-view">
      <div className="journal-shell">
        <div className="flex-1">

          {/* Top navigation bar */}
          <div className="flex justify-between items-center border-b border-[#D8D2C6]/50 pb-4 mb-0" id="reader-top-bar">
            <button
              onClick={onBack}
              className="group flex items-center gap-2.5 font-display text-[11px] font-bold tracking-[0.25em] text-[#1A2F24] hover:text-[#8B5A44] transition-colors uppercase cursor-pointer"
              id="reader-back-btn"
            >
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              {lang === "en" ? "BACK TO ARTICLES" : "返回文章列表"}
            </button>
            <span className="journal-name">{lang === "en" ? "The Living Journal" : "生活志"}</span>
            <div className="flex items-center gap-4" id="reader-actions">
              {onBookmark && (
                <button
                  onClick={(e) => onBookmark(article.slug, e)}
                  className="p-2 border border-[#D8D2C6] hover:border-[#8B5A44] rounded-sm text-[#1C1C1C]/70 hover:text-[#8B5A44] transition-all cursor-pointer"
                  aria-pressed={!!isBookmarked}
                  aria-label={lang === "en" ? "Bookmark Article" : "收藏文章"}
                  title={lang === "en" ? "Bookmark Article" : "收藏文章"}
                  id="reader-bookmark-btn"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-[#8B5A44] text-[#8B5A44]" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {/* Shared reading-first composition across all presentation modes. */}
          <div className="magazine-reader-grid">

            {/* MAIN ARTICLE COLUMN */}
            <article ref={articleBodyRef} className="magazine-article">
              <ArticleOpening hero={article.cover ? <HeroImage src={article.cover} alt={article.title[lang]} /> : null}>
              <header className="magazine-masthead">
              <p className="magazine-category">
                {article.category[lang]}
              </p>
              <h1 className="magazine-title">
                {article.title[lang]}
              </h1>

              {article.excerpt[lang] && <p className="magazine-deck">{article.excerpt[lang]}</p>}
              <div className="magazine-byline flex flex-wrap items-center font-display uppercase tracking-wide">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5A44]" />
                  {article.date[lang]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8B5A44]" />
                  {article.readTime[lang]}
                </span>
                <span className="journal-author flex items-center gap-1.5 font-medium text-[#1A2F24] normal-case tracking-normal">
                  {lang === "en" ? "By" : "作者"} {article.author || (lang === "en" ? "Immersation Editor" : "智枢阁编辑部")}
                </span>
                {activeArticleStats && (
                  <>
                        <span className="flex items-center gap-1.5" title={lang === "en" ? "Unique Pageviews" : "独立网页阅览量"}>
                      <Eye className="w-3.5 h-3.5 text-[#8B5A44]" />
                      {activeArticleStats.views.toLocaleString()} {lang === "en" ? "views" : "次阅览"}
                    </span>
                  </>
                )}
              </div>
              
              </header>
              </ArticleOpening>

              {/* Contents stay collapsed until requested, at every width. */}
              <div className="journal-reading-tools">
                <TableOfContents headings={headings} lang={lang} activeHeadingId={activeHeadingId} />
              </div>


              {/* Body Content */}
              <div className="prose-immersation">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, [remarkMagazine, { slug: article.slug, cover: article.cover }]]}
                  rehypePlugins={[[rehypeSanitize, magazineSanitizeSchema]]}
                  components={markdownComponents}
                >
                  {cleanedContent}
                </ReactMarkdown>
              </div>

              {/* Article Tags */}
              {article.tags.length > 0 && <div className="journal-tags flex flex-wrap gap-4 mt-12 pt-8 border-t border-[#D8D2C6]/50">
                {article.tags.map((tag) => (
                  <span key={tag} className="text-[11px] uppercase tracking-wide text-[#1C1C1C]/60 border border-[#D8D2C6] rounded-full px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>}

              {/* Bottom Share Bar */}
              <ShareBar article={article} lang={lang} />
              
              {/* Reader Reflections */}
              <ReaderReflections articleSlug={article.slug} lang={lang} onPlayChime={onPlayChime} />

              <footer className="journal-afterword">
                {relatedArticles.length > 0 && <section className="journal-related">
                  <SidebarRelated articles={relatedArticles} lang={lang} onNavigate={onNavigate || (() => {})} />
                </section>}
                <div className="journal-support">
                  <SidebarNewsletterCTA lang={lang} />
                  <details className="journal-pinterest" onToggle={e => setPinterestOpen(e.currentTarget.open)}>
                    <summary>{lang === "en" ? "Save this story on Pinterest" : "在 Pinterest 上收藏这篇文章"}</summary>
                    {pinterestOpen && <SidebarPinterestWidget imageUrl={article.pinterestImageUrl || article.cover}
                      altText={article.title[lang]} lang={lang}
                      pageUrl={typeof window !== "undefined" ? window.location.href : undefined} />}
                  </details>
                </div>
                {article.adUrl && <SidebarAdSlot lang={lang} slotId="article-afterword" adUrl={article.adUrl} />}
              </footer>
            </article>

          </div>
        </div>

        {/* Restrained reading progress below the site navigation. */}
        <ReadingProgressMarker targetRef={articleBodyRef} lang={lang} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// LEGACY COMPONENT ALIASES FOR COMPATIBILITY
// ----------------------------------------------------------------------------
const SocialShareBar = ShareBar;
const SidebarTOC = TableOfContents;

const MagneticButton = ({ children, className, href, onClick }: any) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const distance = Math.sqrt(x * x + y * y);
      if (distance < 40 + rect.width / 2) {
        const moveX = (x / distance) * 4;
        const moveY = (y / distance) * 4;
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        btn.style.transform = 'translate(0px, 0px)';
      }
    };
    
    const handleMouseLeave = () => {
      btn.style.transform = 'translate(0px, 0px)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <a 
      ref={buttonRef} 
      href={href} 
      onClick={onClick} 
      className={`transition-all duration-200 ease-out block ${className}`}
    >
      {children}
    </a>
  );
};


function SidebarPinterestWidget({
  imageUrl,
  altText,
  lang,
  pageUrl,
}: {
  imageUrl?: string;
  altText?: string;
  lang: "en" | "zh";
  pageUrl?: string;
}) {
  const [hasError, setHasError] = useState(false);
  if (!imageUrl) return null;

  const shareUrl = pageUrl || (typeof window !== "undefined" ? window.location.href : "");
  const description = altText || "";

  const pinterestHref = `https://pinterest.com/pin/create/button?url=${encodeURIComponent(
    shareUrl
  )}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;

  return (
    <div className="border border-[#D8D2C6] rounded-sm overflow-hidden bg-white/60 group relative">
      {!hasError ? (
        <a
          href={pinterestHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={lang === "en" ? "Pin this image on Pinterest" : "在 Pinterest 上收藏此图片"}
          className="relative block w-full"
        >
          <img
            src={imageUrl || undefined}
            referrerPolicy="no-referrer"
            alt={altText || (lang === "en" ? "Article visual" : "文章配图")}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setHasError(true)}
          />

          {/* Dark overlay on hover, Pinterest convention */}
          <div className="absolute inset-0 bg-[#1A2F24]/0 group-hover:bg-[#1A2F24]/35 transition-all duration-300" />

          {/* Persistent small Pinterest badge, top-right corner */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-[#E60023]">
              <path d="M12 2C6.48 2 2 6.36 2 11.74c0 4.12 2.54 7.63 6.15 9.04-.08-.77-.16-1.95.03-2.79.18-.76 1.15-4.83 1.15-4.83s-.29-.59-.29-1.45c0-1.36.79-2.38 1.77-2.38.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.09-1.85 3.09-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.27 0 .85.33 1.75.73 2.24a.29.29 0 0 1 .07.28c-.08.31-.25 1-.29 1.14-.04.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6-0 3.58-2.26 6.46-5.4 6.46-1.05 0-2.05-.55-2.39-1.2 0 0-.52 1.99-.65 2.48-.24.9-.87 2.03-1.3 2.72A10 10 0 1 0 12 2Z" />
            </svg>
          </div>

          {/* Full-width "Pin it" call-to-action, visible on hover, centered */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-[#E60023] text-white font-display text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M12 2C6.48 2 2 6.36 2 11.74c0 4.12 2.54 7.63 6.15 9.04-.08-.77-.16-1.95.03-2.79.18-.76 1.15-4.83 1.15-4.83s-.29-.59-.29-1.45c0-1.36.79-2.38 1.77-2.38.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.09-1.85 3.09-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.27 0 .85.33 1.75.73 2.24a.29.29 0 0 1 .07.28c-.08.31-.25 1-.29 1.14-.04.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6-0 3.58-2.26 6.46-5.4 6.46-1.05 0-2.05-.55-2.39-1.2 0 0-.52 1.99-.65 2.48-.24.9-.87 2.03-1.3 2.72A10 10 0 1 0 12 2Z" />
              </svg>
              {lang === "en" ? "Pin It" : "收藏到 Pinterest"}
            </span>
          </div>
        </a>
      ) : (
        <div className="w-full p-4 bg-stone-100 flex flex-col items-center justify-center text-center text-stone-500 text-xs">
          <p className="text-stone-400">{lang === "en" ? "Image Unavailable" : "图档暂不可用"}</p>
        </div>
      )}

      {/* Footer strip: replaces old plain "Save for later" text with a real action label + count hint */}
      <div className="p-3 flex items-center justify-between">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#8B5A44] font-semibold">
          {lang === "en" ? "Save to Pinterest" : "收藏至 Pinterest"}
        </p>
        <a
          href={pinterestHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6 flex items-center justify-center rounded-full border border-[#D8D2C6] text-[#E60023] hover:bg-[#E60023] hover:text-white hover:border-[#E60023] transition-all duration-300"
          aria-label={lang === "en" ? "Pin this image on Pinterest" : "在 Pinterest 上收藏此图片"}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
            <path d="M12 2C6.48 2 2 6.36 2 11.74c0 4.12 2.54 7.63 6.15 9.04-.08-.77-.16-1.95.03-2.79.18-.76 1.15-4.83 1.15-4.83s-.29-.59-.29-1.45c0-1.36.79-2.38 1.77-2.38.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.09-1.85 3.09-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.27 0 .85.33 1.75.73 2.24a.29.29 0 0 1 .07.28c-.08.31-.25 1-.29 1.14-.04.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6-0 3.58-2.26 6.46-5.4 6.46-1.05 0-2.05-.55-2.39-1.2 0 0-.52 1.99-.65 2.48-.24.9-.87 2.03-1.3 2.72A10 10 0 1 0 12 2Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function SidebarAdSlot({ lang, slotId, adUrl }: { lang: "en" | "zh"; slotId: string; adUrl?: string }) {
  if (!adUrl) return null;

  return (
    <div className="border border-[#D8D2C6] rounded-sm bg-white/40 p-3" data-slot={slotId}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#1C1C1C]/45] mb-2">
        {lang === "en" ? "Advertisement" : "广告"}
      </p>
      <a href={adUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
        <img src={adUrl || undefined} alt="Advertisement" className="w-full h-auto object-cover rounded-sm" loading="lazy" />
      </a>
    </div>
  );
}

function SidebarNewsletterCTA({ lang }: { lang: "en" | "zh" }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    const success = await subscribeToSendfox(email.trim(), { tags: ["editorial"] });
    setLoading(false);
    if (success) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="bg-[#1A2F24] text-[#F4F1EB] rounded-sm p-6">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[#D8D2C6] mb-2">
        {lang === "en" ? "Clearer Signals" : "清晰信号"}
      </p>
      <p className="text-sm leading-relaxed mb-4">
        {lang === "en"
          ? "Join the Immersation editorial list for essays across body, tool, and capital."
          : "订阅智枢阁，获取身、器、财三大支柱的深度专栏。"}
      </p>
      {subscribed ? (
        <div className="bg-[#8B5A44]/30 border border-[#8B5A44] rounded-sm p-3 text-center">
          <p className="text-xs text-[#E6D5B8] font-medium">
            {lang === "en" ? "✓ Subscribed successfully!" : "✓ 订阅成功！"}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label={lang === "en" ? "Your email" : "您的邮箱"}
            placeholder={lang === "en" ? "Your email" : "您的邮箱"}
            className="w-full bg-transparent border border-[#D8D2C6]/40 rounded-sm px-3 py-2 text-sm text-[#F4F1EB] placeholder:text-[#D8D2C6]/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B5A44] text-white text-xs uppercase tracking-widest py-2 rounded-sm hover:bg-[#7a4c3a] transition-colors disabled:opacity-50"
          >
            {loading
              ? (lang === "en" ? "Subscribing..." : "订阅中...")
              : (lang === "en" ? "Subscribe" : "订阅")}
          </button>
        </form>
      )}
    </div>
  );
}

function SidebarRelated({
  articles,
  lang,
  onNavigate,
}: {
  articles: any[];
  lang: "en" | "zh";
  onNavigate: (slug: string) => void;
}) {
  if (articles.length === 0) return null;
  return (
    <div className="border-t border-[#D8D2C6] pt-6">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[#1A2F24] mb-4 font-bold">
        {lang === "en" ? "Continue Reading" : "继续阅读"}
      </p>
      <div className="flex flex-col gap-4">
        {articles.map((a) => (
          <button
            key={a.slug}
            onClick={() => onNavigate(a.slug)}
            className="group block text-left"
          >
            <p className="text-[13px] font-medium text-[#1C1C1C] group-hover:text-[#8B5A44] transition-colors leading-snug">
              {a.title[lang]}
            </p>
            <p className="text-[11px] text-[#1C1C1C]/45] mt-1">{a.readTime[lang]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ArticlesView({ lang, onBackToHome, onPlayChime, initialArticleSlug, articles: propArticles }: ArticlesViewProps) {
    const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Generate deterministic jagged path coordinates to simulate a physical torn paper edge
  const { tornPaths, tornPathsSecondary } = useMemo(() => {
    const width = 1440;
    const segments = 120;
    const segmentWidth = width / segments;
    const points1 = [];
    const points2 = [];
    
    let seed1 = 123;
    const random1 = () => {
      const x = Math.sin(seed1++) * 10000;
      return x - Math.floor(x);
    };

    let seed2 = 456;
    const random2 = () => {
      const x = Math.sin(seed2++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i <= segments; i++) {
      const x = i * segmentWidth;
      
      // Smooth wave harmonics combined with micro-noise to replicate realistic paper grain rips
      const wave1 = Math.sin(i * 0.15) * 5;
      const wave2 = Math.cos(i * 0.35) * 2;
      const wave3 = Math.sin(i * 0.7) * 1;
      const noise = (random1() - 0.5) * 1.5;
      const y1 = 20 + wave1 + wave2 + wave3 + noise;
      points1.push(`${x.toFixed(1)},${y1.toFixed(1)}`);

      const wave1b = Math.sin(i * 0.13) * 4.5;
      const wave2b = Math.cos(i * 0.29) * 2.5;
      const noiseb = (random2() - 0.5) * 1.2;
      const y2 = 14 + wave1b + wave2b + noiseb;
      points2.push(`${x.toFixed(1)},${y2.toFixed(1)}`);
    }

    return {
      tornPaths: `M 0,56 L 0,20 ${points1.map(p => `L ${p}`).join(' ')} L 1440,56 Z`,
      tornPathsSecondary: `M 0,56 L 0,14 ${points2.map(p => `L ${p}`).join(' ')} L 1440,56 Z`
    };
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    // Keep video paused since we control time via scroll
    video.pause();

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;
          lastScrollY = currentScrollY;

          // Only affect video if we're near the top (hero section)
          if (currentScrollY > window.innerHeight * 1.5) {
            ticking = false;
            return;
          }

          if (delta !== 0) {
            // Adjust time based on scroll delta
            // multiplier controls the "speed" of the video relative to scroll
            let newTime = video.currentTime + (delta * 0.015);
            if (newTime < 0) newTime = 0;
            if (video.duration && newTime > video.duration) newTime = video.duration;
            video.currentTime = newTime;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["body", "tool", "capital"]);
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync with initial article slug
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (initialArticleSlug) {
      setActiveArticleSlug(initialArticleSlug);
    } else {
      const match = window.location.pathname.match(/^\/articles\/(.+)$/);
      if (match) {
        setActiveArticleSlug(match[1]);
      }
    }
  }, [initialArticleSlug]);

  // Handle browser back button/popstate within the component
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/articles\/(.+)$/);
      if (match) {
        setActiveArticleSlug(match[1]);
      } else {
        setActiveArticleSlug(null);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleArticleClick = (slug: string) => {
    if (onPlayChime) onPlayChime();
    setActiveArticleSlug(slug);
    window.history.pushState({}, "", `/articles/${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToArchive = () => {
    if (onPlayChime) onPlayChime();
    setActiveArticleSlug(null);
    window.history.pushState({}, "", `/articles`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleBookmark = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayChime) onPlayChime();
    setBookmarked(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleShare = () => {
    if (onPlayChime) onPlayChime();
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      if (onPlayChime) onPlayChime();
      
      const email = subscribedEmail.trim();
      const success = await subscribeToSendfox(email, { tags: subInterests });
      if (success) {
        setSubscribed(true);
        setSubscribedEmail("");
        if (supabase) {
          try {
            await supabase.from("newsletter_subscriptions").insert([{ email, tags: subInterests, subscribed_at: new Date().toISOString() }]);
          } catch (e) {}
        }
        setTimeout(() => setSubscribed(false), 6000);
      }
    }
  };


  const ensureBilingual = (field: any, defaultEn = "", defaultZh = "") => {
    if (typeof field === "string") {
      return { en: field, zh: field };
    }
    if (field && typeof field === "object") {
      return {
        en: field.en || defaultEn,
        zh: field.zh || defaultZh
      };
    }
    return { en: defaultEn, zh: defaultZh };
  };

  const articles = useMemo(() => (propArticles || defaultArticles).map((art: any) => ({
    ...art,
    slug: art.slug || art.id || `art-${Math.random()}`,
    pillar: art.pillar || "general",
    category: ensureBilingual(art.category, "General", "综合"),
    title: ensureBilingual(art.title, "Untitled Essay", "无题文章"),
    excerpt: ensureBilingual(art.excerpt || art.description, "", ""),
    content: ensureBilingual(art.content || art.description, "", ""),
    date: ensureBilingual(art.date, "July 2026", "2026年7月"),
    readTime: ensureBilingual(art.readTime, "5 min read", "5 分钟阅读"),
    tags: art.tags || [],
    author: art.author,
  })), [propArticles]);

  // Track page views and cumulative reading time in localStorage
  useEffect(() => {
    if (!activeArticleSlug) return;

    // 1. Log view
    const saved = localStorage.getItem("immersation_article_analytics");
    let analytics: Record<string, { views: number; timeSpent: number; lastActive: string }> = {};

    if (saved) {
      try {
        analytics = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing article analytics", e);
      }
    }

    // Initialize if empty or missing current slug
    if (Object.keys(analytics).length === 0) {
      const list = articles || [];
      list.forEach((art: any, idx: number) => {
        const slug = art.slug || art.id;
        if (slug) {
          const views = Math.max(50, Math.floor(10000 - idx * 1500 + Math.sin(idx) * 800));
          const avgSeconds = Math.max(120, Math.floor(320 - idx * 25 + Math.cos(idx) * 30));
          analytics[slug] = {
            views: views,
            timeSpent: views * avgSeconds,
            lastActive: new Date(Date.now() - idx * 24 * 3600 * 1000).toISOString()
          };
        }
      });
    }

    if (!analytics[activeArticleSlug]) {
      analytics[activeArticleSlug] = {
        views: 0,
        timeSpent: 0,
        lastActive: new Date().toISOString()
      };
    }

    analytics[activeArticleSlug].views += 1;
    analytics[activeArticleSlug].lastActive = new Date().toISOString();
    localStorage.setItem("immersation_article_analytics", JSON.stringify(analytics));

    // 2. Track reading time dynamically
    let elapsed = 0;
    const interval = setInterval(() => {
      if (document.hasFocus()) {
        elapsed += 1;
        if (elapsed % 5 === 0) {
          const currentSaved = localStorage.getItem("immersation_article_analytics");
          if (currentSaved) {
            try {
              const curAnalytics = JSON.parse(currentSaved);
              if (curAnalytics[activeArticleSlug]) {
                curAnalytics[activeArticleSlug].timeSpent += 5;
                localStorage.setItem("immersation_article_analytics", JSON.stringify(curAnalytics));
              }
            } catch (e) {}
          }
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      const remaining = elapsed % 5;
      if (remaining > 0) {
        const currentSaved = localStorage.getItem("immersation_article_analytics");
        if (currentSaved) {
          try {
            const curAnalytics = JSON.parse(currentSaved);
            if (curAnalytics[activeArticleSlug]) {
              curAnalytics[activeArticleSlug].timeSpent += remaining;
              localStorage.setItem("immersation_article_analytics", JSON.stringify(curAnalytics));
            }
          } catch (e) {}
        }
      }
    };
  // A heading, bookmark or data refresh is not a new page view.
  }, [activeArticleSlug]);

  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Setup scrollspy active heading highlighter using IntersectionObserver
  useEffect(() => {
    if (!activeArticleSlug) return;
    
    setActiveHeadingId(null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const closest = visibleEntries.reduce((prev, curr) => {
            return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev;
          });
          setActiveHeadingId(closest.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0
      }
    );

    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('#article-reader-view .prose-immersation [id]');
      headingElements.forEach((el) => observer.observe(el));
    }, 400);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeArticleSlug, lang, articles]);

  // Scroll reveal observer
  useEffect(() => {
    if (!activeArticleSlug) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0, rootMargin: "100px" }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    }, 300);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeArticleSlug, lang, articles]);

  const filteredArticles = selectedPillar === "all"
    ? articles
    : articles.filter(a => a.pillar === selectedPillar || a.pillar === "general");

  const searchedArticles = filteredArticles.filter(article => {
    const query = searchQuery.toLowerCase();
    return (
      article.title[lang].toLowerCase().includes(query) ||
      article.excerpt[lang].toLowerCase().includes(query) ||
      article.content[lang].toLowerCase().includes(query) ||
      article.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  // Recommended starting points (5 articles highlighted)
  const recommendedStartingSlugs = [
    "personal-intelligence-system",
    "immersation-model",
    "ai-automation-reclaim-time",
    "recovery-productivity-strategy",
    "wealth-cognition-framework"
  ];
  const recommendedArticles = recommendedStartingSlugs.map(slug => articles.find(a => a.slug === slug)).filter(Boolean) as any[];

  // Get active article
  const activeArticle = articles.find(a => a.slug === activeArticleSlug);

  // Get active article stats dynamically for page display
  const activeArticleStats = (() => {
    if (!activeArticleSlug) return null;
    const saved = localStorage.getItem("immersation_article_analytics");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed[activeArticleSlug]) {
          return parsed[activeArticleSlug];
        }
      } catch (e) {}
    }
    return null;
  })();

  if (activeArticle && activeArticle.slug === "agentic-ai-solopreneur-research" && !activeArticle.pinterestImageUrl) {
    activeArticle.pinterestImageUrl = "https://cms.immersation.com/wp-content/uploads/2026/07/How-to-Build-Your-Own-AI-Team-A-Local-Agentic-AI-Guide-for-Solopreneurs-02.png";
  }

  // Render Reader View
  if (activeArticle) {
    const relatedArticles = articles
      .filter((a: any) => a.slug !== activeArticle.slug && a.pillar === activeArticle.pillar && a.pillar !== "general")
      .slice(0, 4);

    return (
      <ArticlePage
        article={activeArticle}
        lang={lang}
        onBack={handleBackToArchive}
        onBookmark={(slug, e) => toggleBookmark(slug, e)}
        isBookmarked={!!bookmarked[activeArticle.slug]}
        relatedArticles={relatedArticles}
        onNavigate={(slug) => handleArticleClick(slug)}
        onPlayChime={onPlayChime}
        activeArticleStats={activeArticleStats}
        activeHeadingId={activeHeadingId}
      />
    );
  }

  return (
    <div className="bg-[#F4F1EB] min-h-screen relative overflow-hidden" id="articles-archive-view">
      
      {/* NEW FULL-WIDTH HERO SECTION */}
      <section id="articles-hero-section" className="relative w-full pt-24 pb-32 overflow-hidden bg-[#F4F1EB] text-[#1C1C1C]">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-[120%] -top-[10%] z-0 pointer-events-none overflow-hidden" id="articles-hero-video-bg">
          <video
            ref={heroVideoRef}
            src="https://cms.immersation.com/wp-content/uploads/2026/07/Article-Hero-Background-1.mp4"
            playsInline
            muted
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F4F1EB]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          {/* Navigation Breadcrumb */}
          <div className="mb-12" id="articles-breadcrumb">
            <button 
              onClick={onBackToHome}
              className="group inline-flex items-center gap-2.5 font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] hover:text-[#1A2F24] transition-colors duration-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              {lang === "en" ? "Back to System Core" : "返回核心系统"}
            </button>
          </div>

          {/* SECTION 1: HERO / MASTHEAD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-16" id="articles-hero">
            
            {/* Left Column: Copywriting */}
            <div className="lg:col-span-8" id="articles-hero-left">
              <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#8B5A44] block mb-4 motion-safe:animate-[fade-up_600ms_ease-out_both] delay-0">
                {lang === "en" ? "ARTICLES" : "文章"}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6 motion-safe:animate-[fade-up_600ms_ease-out_both] [animation-delay:120ms]">
                {lang === "en" 
                  ? "Articles for the Future Individual" 
                  : "面向未来个体的深度文章"}
              </h1>
              
              <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed mb-8 max-w-xl motion-safe:animate-[fade-up_600ms_ease-out_both] [animation-delay:240ms]">
                {lang === "en" 
                  ? "Calm, structured articles on Mindfulness Health & Longevity, AI Automation, and Wealth Cognition — helping readers build better systems for body, work, and wealth."
                  : "围绕正念健康与长寿管理、AI 自动化与财富认知，发布安静、结构化、可长期复用的文章，帮助读者建立身体、工作与财富系统中的长期个人资产。"}
              </p>

              <div className="flex flex-wrap items-center gap-4 motion-safe:animate-[fade-up_600ms_ease-out_both] [animation-delay:360ms]">
                <MagneticButton 
                  href="#latest-archive"
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (onPlayChime) onPlayChime();
                    document.getElementById("latest-archive")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-colors shadow-sm hover:shadow-md cursor-pointer"
                >
                  {lang === "en" ? "Browse Articles" : "浏览文章全集"}
                </MagneticButton>
                <MagneticButton 
                  href="#newsletter-cta-sec"
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (onPlayChime) onPlayChime();
                    document.getElementById("newsletter-cta-sec")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="border border-[#D8D2C6] hover:border-[#1A2F24] text-[#1C1C1C] bg-white/40 hover:bg-white/60 font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-colors cursor-pointer"
                >
                  {lang === "en" ? "Subscribe Now" : "接收订阅内参"}
                </MagneticButton>
              </div>
            </div>

            {/* Right Column: Visual Art (Removed) */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end relative" id="articles-hero-right">
            </div>
        </div>
          </div>

        {/* Torn Paper Mask Effect bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden z-20 pointer-events-none select-none" style={{ height: '56px', marginBottom: '-1px' }} id="torn-paper-mask-hero">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_-5px_5px_rgba(139,90,68,0.06)]">
            {/* Background fibers/edge layer */}
            <path d={tornPathsSecondary} fill="#E1D9C9" opacity="0.8" />
            {/* Foreground main layer matching next section's bg [#F4F1EB] */}
            <path d={tornPaths} fill="#F4F1EB" />
          </svg>
        </div>
      </section>

      {/* Background Decorative Paper Elements */}
      <div className="absolute top-[35%] right-[-5%] w-[400px] h-[400px] bg-[#E8DDCF]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-[#8B5A44]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-16">
        {/* SECTION 2: EDITORIAL PHILOSOPHY */}
        <div className="border-b border-[#D8D2C6]/50 pb-16 mb-20" id="editorial-philosophy">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="md:col-span-5">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">01 / EDITORIAL MANDATE</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A2F24] leading-tight">
                {lang === "en" ? "Timeless Analysis. Immutable Blueprints." : "常青深度研究，抗稀释实操蓝图。"}
              </h2>
              <div className="w-12 h-[2px] bg-[#8B5A44] mt-4"></div>
            </div>
            
            <div className="md:col-span-7 md:border-l md:border-[#D8D2C6]/50 md:pl-8 text-[#1C1C1C]/80 font-serif text-sm sm:text-base leading-relaxed">
              <p className="mb-4">
                {lang === "en" 
                  ? "Our Editorial column provides rigorous, slow-form research to help individuals build sovereign systems. We avoid speculative trends and focus purely on the immutable mechanics of life and wealth."
                  : "智枢阁专栏文章旨在提供严谨、理性的长篇慢研究，致力于为追求卓越的主权个体构筑常青底座。我们主动剥离转瞬即逝的热点，只探寻抗通胀、跨周期的底层生理、流程与财富运转密码。"}
              </p>
              <p>
                {lang === "en"
                  ? "By integrating biological energy, software intelligence, and wealth longevity, we form a complete cognitive feedback loop. Every article is designed to be read, saved, and executed over a decadal horizon."
                  : "通过将物理能级管理、流程智能以及财富寿命进行融合，我们形成了一个完整的系统性闭环。每一篇学术内参，皆以十年复利尺度进行撰写与交付，是真正的实操执行指南。"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: EXPLORE BY PILLAR */}
        <div className="mb-20" id="explore-by-pillar-section">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">02 / CORE ANCHORS</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
              {lang === "en" ? "Explore by Pillar" : "按三大核心支柱探索"}
            </h2>
            <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60 mt-2">
              {lang === "en" 
                ? "Calm, structured knowledge written to integrate seamlessly into your life." 
                : "安静、结构化的内容配置，助你将知识内化为习惯与资产"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="pillar-cards">
            {/* Body Card */}
            <div 
              onClick={() => {
                if (onPlayChime) onPlayChime();
                setSelectedPillar("body");
                document.getElementById("latest-archive")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`border rounded-sm p-8 cursor-pointer card-hover-border transition-all duration-500 flex flex-col justify-between h-[280px] group ${
                selectedPillar === "body" 
                  ? "bg-[#1A2F24] border-[#1A2F24] text-[#F4F1EB]" 
                  : "bg-white/50 border-[#D8D2C6] text-[#1C1C1C] hover:border-[#1A2F24] hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`font-display text-[10px] uppercase font-bold tracking-[0.25em] ${
                    selectedPillar === "body" ? "text-[#B69A6B]" : "text-[#8B5A44]"
                  }`}>
                    {lang === "en" ? "BODY" : "身"}
                  </span>
                  <Activity className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${
                    selectedPillar === "body" ? "text-[#B69A6B]" : "text-[#8B5A44]/70"
                  }`} />
                </div>
                
                <h3 className="font-serif text-xl font-normal leading-tight mb-3">
                  {lang === "en" ? "Mindfulness Health & Longevity" : "正念健康与长寿管理"}
                </h3>
                
                <p className={`font-sans text-xs leading-relaxed ${
                  selectedPillar === "body" ? "text-white/70" : "text-[#1C1C1C]/60"
                }`}>
                  {lang === "en"
                    ? "Articles on sleep, recovery, stress regulation, focus, nervous system balance, and sustainable human performance."
                    : "关于睡眠、深度恢复、神经压力调控、专注力重塑与人体长寿机能的深度学术论述。"}
                </p>
              </div>

              <div className="border-t border-current/15 pt-4 flex items-center gap-1.5 font-display text-[9px] uppercase font-bold tracking-widest mt-4">
                <span>{lang === "en" ? "Explore Body Articles" : "查看身心论述"}</span>
                <ChevronRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Tool Card */}
            <div 
              onClick={() => {
                if (onPlayChime) onPlayChime();
                setSelectedPillar("tool");
                document.getElementById("latest-archive")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`border rounded-sm p-8 cursor-pointer card-hover-border transition-all duration-500 flex flex-col justify-between h-[280px] group ${
                selectedPillar === "tool" 
                  ? "bg-[#1A2F24] border-[#1A2F24] text-[#F4F1EB]" 
                  : "bg-white/50 border-[#D8D2C6] text-[#1C1C1C] hover:border-[#1A2F24] hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`font-display text-[10px] uppercase font-bold tracking-[0.25em] ${
                    selectedPillar === "tool" ? "text-[#B69A6B]" : "text-[#8B5A44]"
                  }`}>
                    {lang === "en" ? "TOOL" : "器"}
                  </span>
                  <Sparkles className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${
                    selectedPillar === "tool" ? "text-[#B69A6B]" : "text-[#8B5A44]/70"
                  }`} />
                </div>
                
                <h3 className="font-serif text-xl font-normal leading-tight mb-3">
                  {lang === "en" ? "AI Automation" : "AI 自动化"}
                </h3>
                
                <p className={`font-sans text-xs leading-relaxed ${
                  selectedPillar === "tool" ? "text-white/70" : "text-[#1C1C1C]/60"
                }`}>
                  {lang === "en"
                    ? "Articles on AI workflows, prompt systems, automation templates, personal operating systems, and intelligent leverage."
                    : "关于大模型工作流、Prompt 模板系统、自动化管道搭建、个人知识库与效率杠杆的实操经验。"}
                </p>
              </div>

              <div className="border-t border-current/15 pt-4 flex items-center gap-1.5 font-display text-[9px] uppercase font-bold tracking-widest mt-4">
                <span>{lang === "en" ? "Explore Tool Articles" : "查看自动化研究"}</span>
                <ChevronRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Capital Card */}
            <div 
              onClick={() => {
                if (onPlayChime) onPlayChime();
                setSelectedPillar("capital");
                document.getElementById("latest-archive")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`border rounded-sm p-8 cursor-pointer card-hover-border transition-all duration-500 flex flex-col justify-between h-[280px] group ${
                selectedPillar === "capital" 
                  ? "bg-[#1A2F24] border-[#1A2F24] text-[#F4F1EB]" 
                  : "bg-white/50 border-[#D8D2C6] text-[#1C1C1C] hover:border-[#1A2F24] hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`font-display text-[10px] uppercase font-bold tracking-[0.25em] ${
                    selectedPillar === "capital" ? "text-[#B69A6B]" : "text-[#8B5A44]"
                  }`}>
                    {lang === "en" ? "CAPITAL" : "财"}
                  </span>
                  <Coins className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${
                    selectedPillar === "capital" ? "text-[#B69A6B]" : "text-[#8B5A44]/70"
                  }`} />
                </div>
                
                <h3 className="font-serif text-xl font-normal leading-tight mb-3">
                  {lang === "en" ? "Wealth Cognition" : "财富认知"}
                </h3>
                
                <p className={`font-sans text-xs leading-relaxed ${
                  selectedPillar === "capital" ? "text-white/70" : "text-[#1C1C1C]/60"
                }`}>
                  {lang === "en"
                    ? "Articles and frameworks on long-term wealth thinking, risk awareness, market cycles, asset allocation, and disciplined decision-making."
                    : "关于长期价值投资、宏观市场周期判定、风险对冲模型、以及剔除偏见与恐惧的理智决策系统。"}
                </p>
              </div>

              <div className="border-t border-current/15 pt-4 flex items-center gap-1.5 font-display text-[9px] uppercase font-bold tracking-widest mt-4">
                <span>{lang === "en" ? "Explore Capital Articles" : "查看资本认知"}</span>
                <ChevronRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: EDITORIAL FEATURE */}
        <div className="mb-24" id="featured-article">
          <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
            03 / EDITORIAL FEATURE
          </span>
          {articles.slice(0, 1).map(feat => (
            <div 
              key={feat.slug}
              className="bg-[#E8DDCF]/40 border border-[#D8D2C6] rounded-sm p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
              id={`featured-card-${feat.slug}`}
            >
              {/* Soft decorative visual indicator */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5A44]/5 rounded-bl-full pointer-events-none"></div>

              <div className="lg:col-span-8 relative z-10">
                <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] inline-block bg-white/60 px-3 py-1 rounded-full mb-4">
                  {lang === "en" ? "FEATURED ARTICLE" : "重点推介论述"}
                </span>
                
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#1A2F24] leading-tight mb-4">
                  {feat.title[lang]}
                </h3>
                
                <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed mb-6 max-w-2xl">
                  {feat.excerpt[lang]}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-xs text-[#1C1C1C]/50 font-display mb-8">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8B5A44]" />
                    {feat.date[lang]}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8B5A44]" />
                    {feat.readTime[lang]}
                  </span>
                  <span className="flex items-center gap-1.5 uppercase tracking-wider bg-white/40 px-2.5 py-0.5 rounded-sm">
                    {lang === "en" ? "Core Blueprint" : "系统级硬核框架"}
                  </span>
                </div>

                <button 
                  onClick={() => handleArticleClick(feat.slug)}
                  className="group bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand flex items-center gap-2 shadow hover:shadow-md cursor-pointer animate-reveal-text"
                >
                  {lang === "en" ? "Read Complete Article" : "阅读整篇论述"}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Desktop Illustration Thumbnail */}
              <div className="lg:col-span-4 hidden lg:flex justify-end relative">
                <div className="w-64 h-64 border border-[#D8D2C6] rounded-sm bg-white p-6 shadow-sm flex flex-col justify-between hover:rotate-1 transition-transform duration-500">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[8px] text-[#8B5A44] tracking-wider uppercase">[ SYSTEM FOUNDATION ]</span>
                    <span className="font-mono text-[8px] text-[#1C1C1C]/40">N°. 01</span>
                  </div>
                  <Compass className="w-12 h-12 stroke-[1] text-[#8B5A44]/70 my-auto mx-auto" />
                  <div className="border-t border-[#D8D2C6]/50 pt-2 text-center">
                    <span className="font-serif italic text-[10px] text-[#1C1C1C]/50">
                      {lang === "en" ? "Stable body compounds assets." : "稳定物理容器，倍增流程与长期资本。"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 5: LATEST ARCHIVE & FILTER SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-[#D8D2C6]/50 pt-16 mb-24" id="latest-archive">
          
          {/* Left column: Filter Sidebar */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 h-fit" id="archive-sidebar">
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8B5A44]" />
              {lang === "en" ? "Filter Archive" : "筛选学术档案"}
            </h3>

            {/* Search Input */}
            <div className="relative mb-8" id="sidebar-search">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1C1C1C]/40" />
              <input 
                type="text"
                placeholder={lang === "en" ? "Search articles..." : "输入关键词检索..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-2.5 pl-10 pr-4 font-sans text-xs text-[#1C1C1C] transition-brand"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-[#1C1C1C]/40 hover:text-[#1C1C1C]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Filters list */}
            <div className="hidden lg:flex flex-col gap-1.5" id="sidebar-filters-list">
              {[
                { id: "all", label: { en: "All Articles", zh: "全部深度文章" } },
                { id: "body", label: { en: "Mindfulness Health & Longevity", zh: "正念健康与长寿" } },
                { id: "tool", label: { en: "AI Automation", zh: "AI 自动化" } },
                { id: "capital", label: { en: "Wealth Cognition", zh: "财富认知" } },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => {
                    if (onPlayChime) onPlayChime();
                    setSelectedPillar(pill.id);
                  }}
                  className={`text-left font-display text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-all duration-300 flex items-center justify-between ${
                    selectedPillar === pill.id 
                      ? "bg-[#1A2F24] text-[#F4F1EB]" 
                      : "text-[#1C1C1C]/75 hover:bg-[#E8DDCF]/40 hover:text-[#1C1C1C]"
                  }`}
                >
                  <span>{pill.label[lang]}</span>
                  {selectedPillar === pill.id && <div className="w-1.5 h-1.5 rounded-full bg-[#B69A6B]"></div>}
                </button>
              ))}
            </div>

            {/* Mobile Filters Horizontal Scroll */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none" id="mobile-filter-scroll">
              {[
                { id: "all", label: { en: "All", zh: "全部" } },
                { id: "body", label: { en: "Mindfulness", zh: "正念" } },
                { id: "tool", label: { en: "Automation", zh: "自动化" } },
                { id: "capital", label: { en: "Wealth", zh: "财富" } },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => {
                    if (onPlayChime) onPlayChime();
                    setSelectedPillar(pill.id);
                  }}
                  className={`font-display text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedPillar === pill.id 
                      ? "bg-[#1A2F24] text-[#F4F1EB]" 
                      : "bg-white/60 border border-[#D8D2C6] text-[#1C1C1C]/70"
                  }`}
                >
                  {pill.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Right column: Archive grid of articles */}
          <div className="lg:col-span-9" id="archive-grid">
            <div className="flex justify-between items-center border-b border-[#D8D2C6]/30 pb-4 mb-8">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#1C1C1C]/40">
                {lang === "en" ? `${searchedArticles.length} articles found` : `共检索到 ${searchedArticles.length} 篇学术内参`}
              </span>
            </div>

            {searchedArticles.length === 0 ? (
              <div className="text-center py-16 bg-white/30 border border-dashed border-[#D8D2C6] rounded-sm" id="empty-search-state">
                <BookOpen className="w-10 h-10 text-[#8B5A44]/40 mx-auto mb-3" />
                <h4 className="font-serif text-lg text-[#1A2F24] mb-1">
                  {lang === "en" ? "No articles match your filters" : "未找到匹配的学术内容"}
                </h4>
                <p className="font-serif text-xs text-[#1C1C1C]/50 max-w-xs mx-auto">
                  {lang === "en" ? "Try clearing your search query or choosing another category." : "请尝试修改搜索词或选择其他的核心支柱。"}
                </p>
                <button 
                  onClick={() => { setSelectedPillar("all"); setSearchQuery(""); }}
                  className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] hover:text-[#1A2F24] mt-4"
                >
                  {lang === "en" ? "RESET FILTERS" : "重置所有过滤条件"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6" id="archive-list">
                {searchedArticles.map((article) => (
                  <div 
                    key={article.slug}
                    onClick={() => handleArticleClick(article.slug)}
                    className="group bg-white/30 border border-[#D8D2C6]/60 rounded-sm p-6 md:p-8 transition-all duration-300 hover:border-[#1A2F24] hover:bg-white/70 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {article.cover && (
                        <div className="w-full h-48 md:h-64 mb-6 overflow-hidden rounded-sm border border-[#D8D2C6]/60">
                          <img 
                            src={article.cover || undefined} 
                            alt={article.title[lang]} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            loading="lazy" 
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#8B5A44]">
                          {article.category[lang]}
                        </span>
                        <span className="font-display text-[9px] text-[#1C1C1C]/40">
                          {article.date[lang]}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-normal text-[#1A2F24] mb-3 group-hover:text-[#8B5A44] transition-colors duration-300">
                        {article.title[lang]}
                      </h4>

                      <p className="font-serif text-sm text-[#1C1C1C]/70 leading-relaxed mb-6">
                        {article.excerpt[lang]}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-[#D8D2C6]/30">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 font-display text-[10px] text-[#1C1C1C]/40 mr-3">
                          <Clock className="w-3.5 h-3.5 text-[#8B5A44]/60" />
                          {article.readTime[lang]}
                        </span>
                        {article.tags.map(tag => (
                          <span key={tag} className="font-mono text-[9px] text-[#1C1C1C]/50 bg-[#E8DDCF]/30 px-2.5 py-0.5 rounded-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleArticleClick(article.slug)}
                        className="group inline-flex items-center gap-1 text-[#1A2F24] hover:text-[#8B5A44] font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
                      >
                        {lang === "en" ? "Read Article" : "阅读深度文章"}
                        <ArrowRight className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: RECOMMENDED CURRICULUM */}
        <div className="border-t border-[#D8D2C6]/50 pt-20 mb-24" id="recommended-starts">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8D2C6]/50 pb-10 mb-16 gap-6" id="starts-header">
            <div>
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
                {lang === "en" ? "START HERE" : "从这里开始"}
              </span>
              <h2 className="font-serif text-3xl text-[#1A2F24] tracking-tight">
                {lang === "en" ? "Cornerstone Growth Curriculum" : "新读者核心智识成长路径"}
              </h2>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/60 max-w-sm leading-relaxed">
              {lang === "en"
                ? "New to the Immersation ecosystem? These five curated cornerstone entries provide the baseline logic for biology, workflow tool automation, and capital compounding."
                : "第一次来到智枢阁？这五篇由编辑部亲自甄选的体系底座文献，将为您瞬间理清物理能级、AI杠杆与资本飞轮之间的耦合公式。"}
            </p>
          </div>

          {/* Curated list with big numbers */}
          <div className="divide-y divide-[#D8D2C6]/40 border-y border-[#D8D2C6]/40" id="starts-list">
            {recommendedArticles.map((art, index) => (
              <div 
                key={art.slug}
                onClick={() => handleArticleClick(art.slug)}
                className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center cursor-pointer group hover:bg-[#F4F1EB]/30 transition-colors px-4"
                id={`start-item-${index}`}
              >
                <div className="lg:col-span-1 font-mono text-2xl sm:text-3xl text-[#8B5A44]/40 group-hover:text-[#8B5A44] font-semibold transition-colors">
                  0{index + 1}
                </div>
                <div className="lg:col-span-4">
                  <span className="font-display text-[8px] font-bold tracking-[0.2em] text-[#8B5A44] uppercase bg-[#8B5A44]/5 px-2 py-0.5 rounded-sm inline-block mb-2">
                    {art.category[lang]}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors leading-snug">
                    {art.title[lang]}
                  </h3>
                </div>
                <div className="lg:col-span-5 font-sans text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">
                  {art.excerpt[lang]}
                </div>
                <div className="lg:col-span-2 flex justify-between lg:justify-end items-center font-mono text-[9px] text-[#1C1C1C]/40 uppercase tracking-widest gap-4">
                  <span>{art.readTime[lang]}</span>
                  <div className="w-8 h-8 rounded-full border border-[#D8D2C6] group-hover:border-[#8B5A44] flex items-center justify-center text-[#1A2F24] group-hover:text-[#8B5A44] group-hover:bg-[#8B5A44]/5 transition-all">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: SUBSCRIBE CTA SECTION */}
        <div className="border-t border-[#D8D2C6]/50 pt-20 mb-12" id="subscribe-cta-section">
          <div className="bg-[#1A2F24] text-[#F4F1EB] rounded-sm p-12 text-center relative overflow-hidden shadow-md" id="newsletter-cta-sec">
            {/* Subtle design elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.03] pointer-events-none z-0"></div>

            <div className="relative z-10 space-y-6">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.3em] text-[#B69A6B] block">
                {lang === "en" ? "RECEIVE CLEARER SIGNALS" : "接收更清晰的信号"}
              </span>
              
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F4F1EB]">
                {lang === "en" ? "Receive Clearer Signals." : "接收更清晰的信号。"}
              </h2>
              
              <p className="font-serif text-sm sm:text-base text-white/70 leading-relaxed max-w-lg mx-auto">
                {lang === "en"
                  ? "Join the Immersation editorial list for articles, newsletters, and curated insights across Mindfulness Health & Longevity, AI Automation, and Wealth Cognition."
                  : "订阅 Immersation｜智枢阁，获取围绕正念健康与长寿管理、AI 自动化与财富认知的文章、Newsletter 与精选洞察。"}
              </p>

              {subscribed ? (
                <div className="max-w-md mx-auto flex items-center gap-3 bg-white/10 border border-[#B69A6B]/30 rounded-sm p-4 text-left justify-center animate-fade-in" id="archive-subscribe-success">
                  <CheckCircle className="w-5 h-5 text-[#B69A6B]" />
                  <p className="font-serif text-sm font-semibold text-[#B69A6B]">
                    {lang === "en" ? "Welcome. You have subscribed successfully." : "欢迎，您已成功订阅智枢信标。"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4 max-w-md mx-auto pt-4" id="archive-subscribe-form">
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <input 
                      type="email"
                      required
                      value={subscribedEmail}
                      onChange={(e) => setSubscribedEmail(e.target.value)}
                      placeholder={lang === "en" ? "Your core email address..." : "输入您的核心电子邮箱..."}
                      className="flex-1 bg-white/5 border border-white/20 focus:border-[#B69A6B] focus:outline-none rounded-sm py-4 px-5 font-sans text-xs text-white transition-colors placeholder:text-white/30"
                    />
                    <button 
                      type="submit"
                      className="bg-[#B69A6B] hover:bg-[#8B5A44] text-[#1A2F24] hover:text-white font-display text-[11px] font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-all shadow-md whitespace-nowrap"
                    >
                      {lang === "en" ? "Subscribe" : "立即订阅"}
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-left mt-2">
                    <span className="font-display text-[9px] uppercase tracking-wider text-white/50">
                      {lang === "en" ? "Select your interests (Optional):" : "选择您感兴趣的领域 (可选):"}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={subInterests.includes("body")}
                          onChange={(e) => {
                            if (e.target.checked) setSubInterests([...subInterests, "body"]);
                            else setSubInterests(subInterests.filter(i => i !== "body"));
                          }}
                          className="mt-0.5 rounded-sm border-white/20 bg-white/5 text-[#B69A6B] focus:ring-[#B69A6B] transition-colors"
                        />
                        <div className="flex flex-col">
                          <span className="font-serif text-xs text-white group-hover:text-[#B69A6B] transition-colors">Body</span>
                          <span className="font-sans text-[9px] text-white/40">{lang === "en" ? "Mindfulness, health" : "正念，健康"}</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={subInterests.includes("tool")}
                          onChange={(e) => {
                            if (e.target.checked) setSubInterests([...subInterests, "tool"]);
                            else setSubInterests(subInterests.filter(i => i !== "tool"));
                          }}
                          className="mt-0.5 rounded-sm border-white/20 bg-white/5 text-[#B69A6B] focus:ring-[#B69A6B] transition-colors"
                        />
                        <div className="flex flex-col">
                          <span className="font-serif text-xs text-white group-hover:text-[#B69A6B] transition-colors">Tool</span>
                          <span className="font-sans text-[9px] text-white/40">{lang === "en" ? "AI, workflows" : "AI，工作流"}</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={subInterests.includes("capital")}
                          onChange={(e) => {
                            if (e.target.checked) setSubInterests([...subInterests, "capital"]);
                            else setSubInterests(subInterests.filter(i => i !== "capital"));
                          }}
                          className="mt-0.5 rounded-sm border-white/20 bg-white/5 text-[#B69A6B] focus:ring-[#B69A6B] transition-colors"
                        />
                        <div className="flex flex-col">
                          <span className="font-serif text-xs text-white group-hover:text-[#B69A6B] transition-colors">Capital</span>
                          <span className="font-sans text-[9px] text-white/40">{lang === "en" ? "Wealth, long-term" : "财富，长期主义"}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </form>
              )}

              <p className="font-sans text-[10px] text-white/40 tracking-wider uppercase pt-4">
                {lang === "en" ? "No noise. No hype. Just calm intelligence." : "没有噪音，没有夸张，只有冷静的智慧。"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

interface Comment {
  id: string;
  article_slug: string;
  name: string;
  message: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  created_at: string;
  status?: string;
  lang?: string;
}


function ReaderReflections({ articleSlug, lang, onPlayChime }: { articleSlug: string; lang: "en" | "zh"; onPlayChime?: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [focused, setFocused] = useState(false);

  const fetchComments = async () => {
    if (!supabase) {
      const saved = localStorage.getItem("immersation_comments");
      if (saved) {
        try {
          const allComments = JSON.parse(saved);
          // Show approved comments, or pending comments added by the current user (mocked by same session)
          const filtered = allComments.filter((c: any) => c.article_slug === articleSlug && (c.status === "approved" || c.status === "pending"));
          setComments(filtered.map((d: any) => ({
            ...d,
            liked: false,
            timestamp: new Date(d.created_at).toLocaleString()
          })));
        } catch (e) {
          console.error("Error parsing comments from localStorage:", e);
          setComments([]);
        }
      } else {
        setComments([]);
      }
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("article_comments")
        .select("*")
        .eq("article_slug", articleSlug)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setComments(data.map(d => ({...d, liked: false, timestamp: new Date(d.created_at).toLocaleString()})));
      } else if (error) {
        console.warn("Supabase fetch comments error, falling back to local storage:", error);
        const saved = localStorage.getItem("immersation_comments");
        if (saved) {
          const allComments = JSON.parse(saved);
          const filtered = allComments.filter((c: any) => c.article_slug === articleSlug && (c.status === "approved" || c.status === "pending"));
          setComments(filtered.map((d: any) => ({
            ...d,
            liked: false,
            timestamp: new Date(d.created_at).toLocaleString()
          })));
        } else {
          setComments([]);
        }
      }
    } catch (e) {
      console.error("Error fetching comments from Supabase:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [articleSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (onPlayChime) onPlayChime();

    const newComment: any = {
      id: `c-${Date.now()}`,
      article_slug: articleSlug,
      name: name.trim(),
      message: message.trim(),
      likes: 0,
      liked: false,
      created_at: new Date().toISOString(),
      status: "pending",
      lang
    };

    if (supabase) {
      try {
        const { error } = await supabase.from("article_comments").insert({
          article_slug: articleSlug,
          name: name.trim(),
          message: message.trim(),
          lang,
          status: "pending",
        });
        if (error) {
          console.warn("Supabase comment insert failed, saving to local storage fallback:", error);
          const saved = localStorage.getItem("immersation_comments");
          let allComments = [];
          if (saved) {
            try { allComments = JSON.parse(saved); } catch (e) {}
          }
          allComments.unshift(newComment);
          localStorage.setItem("immersation_comments", JSON.stringify(allComments));
        }
      } catch (err) {
        console.error("Failed to insert comment to Supabase, fell back to local:", err);
      }
      // For instant UX in session
      setComments((prev) => [{...newComment, timestamp: lang === "en" ? "Just now" : "刚刚"}, ...prev]);
    } else {
      const saved = localStorage.getItem("immersation_comments");
      let allComments = [];
      if (saved) {
        try {
          allComments = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      allComments.unshift(newComment);
      localStorage.setItem("immersation_comments", JSON.stringify(allComments));
      
      setComments((prev) => [{...newComment, timestamp: lang === "en" ? "Just now" : "刚刚"}, ...prev]);
    }
    
    setName("");
    setMessage("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleLike = async (id: string) => {
    if (onPlayChime) onPlayChime();
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      )
    );
    if (supabase) {
      const visitorHash = btoa(navigator.userAgent).slice(0, 32); // simple hash
      const c = comments.find(c => c.id === id);
      if (c && !c.liked) {
         const { error } = await supabase.from("comment_likes").insert({
            comment_id: id,
            visitor_hash: visitorHash,
          });
          if (!error) {
            await supabase.rpc("increment_comment_likes", { comment_id_input: id });
          }
      }
    }
  };

  return (
    <section className="mt-20 pt-16 border-t border-[#D8D2C6]/60" id="reader-reflections">
      <div className="flex items-baseline justify-between mb-8">
        <h3 className="font-display text-[24px] tracking-tight text-[#1A2F24]">
          {lang === "en" ? "Reader Reflections" : "读者笔记"}
        </h3>
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#1C1C1C]/45]">
          {comments.length} {lang === "en" ? "notes" : "条留言"}
        </span>
      </div>

      {/* Composer — clean bordered panel, no gimmicks */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-md border transition-all duration-300 p-6 md:p-7 mb-12 ${
          focused ? "border-[#8B5A44] shadow-[0_4px_20px_rgba(139,90,68,0.08)]" : "border-[#D8D2C6]"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1A2F24] text-[#F4F1EB] flex items-center justify-center text-sm font-semibold uppercase shrink-0">
            {name.trim() ? name.trim().charAt(0) : "?"}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label={lang === "en" ? "Your name" : "您的称呼"}
              placeholder={lang === "en" ? "Your name" : "您的称呼"}
              className="w-full bg-transparent text-sm font-medium text-[#1C1C1C] outline-none placeholder:text-[#bab9b4] placeholder:font-normal mb-3"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label={lang === "en" ? "Your reflection" : "您的思考"}
              placeholder={lang === "en" ? "Share your reflection on this piece..." : "分享你对这篇文章的思考..."}
              rows={3}
              className="w-full bg-transparent text-sm text-[#1C1C1C] outline-none resize-none placeholder:text-[#bab9b4] leading-relaxed"
              required
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#D8D2C6]/50">
              <span className="text-[11px] text-[#bab9b4]">
                {lang === "en" ? "Notes are reviewed before appearing publicly." : "留言将经审核后公开显示。"}
              </span>
              <button
                type="submit"
                className="bg-[#1A2F24] text-[#F4F1EB] text-xs uppercase tracking-[0.15em] px-5 py-2.5 rounded-sm hover:bg-[#8B5A44] transition-colors duration-300 cursor-pointer"
              >
                {lang === "en" ? "Post Reflection" : "发布留言"}
              </button>
            </div>
          </div>
        </div>
        {submitted && (
          <p className="text-[11px] text-[#8B5A44] mt-3 ml-14">
            {lang === "en" ? "Thank you — your reflection has been submitted for review." : "感谢您的分享，留言已提交审核。"}
          </p>
        )}
      </form>

      {/* Comment list — clean timeline, no rotation/stickers */}
      <div className="flex flex-col divide-y divide-[#D8D2C6]/50">
        {comments.map((c) => (
          <div key={c.id} className="py-6 flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-[#8B5A44]/90 text-white flex items-center justify-center text-sm font-semibold uppercase shrink-0">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <p className="text-[13.5px] font-semibold text-[#1C1C1C]">{c.name}</p>
                <span className="text-[11px] text-[#bab9b4]">·</span>
                <p className="text-[11px] text-[#bab9b4] uppercase tracking-wide">{c.timestamp || (new Date(c.created_at).toLocaleString())}</p>
                {c.status === "pending" && (
                  <span className="ml-2 text-[9px] font-sans font-medium px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider scale-95 origin-left">
                    {lang === "en" ? "Awaiting Moderation" : "待审核"}
                  </span>
                )}
              </div>
              <p className="text-[14px] leading-relaxed text-[#1C1C1C]/90 mb-2.5">{c.message}</p>
              <button
                onClick={() => toggleLike(c.id)}
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  c.liked ? "text-[#8B5A44]" : "text-[#1C1C1C]/45] group-hover:text-[#8B5A44]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={c.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
                {c.likes > 0 ? c.likes : ""} {lang === "en" ? "Helpful" : "有用"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

}
