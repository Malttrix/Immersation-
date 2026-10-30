
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import HTMLFlipBook from "react-pageflip";
const FlipBook = HTMLFlipBook as any;
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Type, Sparkles, Sliders, Lock, RefreshCw, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { secureFetch } from "../lib/security-api";
import { productBooks } from "../data";

export interface BookChapter {
  chapterLabel: { en: string; zh: string };
  title: { en: string; zh: string };
  leftContentMarkdown: { en: string; zh: string };
  rightContentMarkdown: { en: string; zh: string };
}

// TODO: In the future, this function can be wired up to a file-upload feature 
// to parse an uploaded EPUB file into the BookChapter[] format.
// e.g. using epub.js: const book = ePub(epubFile); ...
export async function parseEpubToChapters(epubFile: File): Promise<BookChapter[]> {
  console.warn("parseEpubToChapters is a stub for future EPUB parsing");
  return [];
}

interface ReadingRoomViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime: () => void;
  selectedBookId?: string | null;
  unlockedBookIds?: string[];
  onUnlockBook?: (bookId: string) => void;
  booksData?: any[]; // Array combining productBooks and BookChapter[] shape
}

// Rich content for each of the 4 books to provide a high-signal real reading experience

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#1A2F24] font-semibold">{part.substring(2, part.length - 2)}</strong>;
    }
    return part;
  });
};

const renderChapterContent = (markdown: string, fontSizeClass: string) => {
  if (!markdown) return null;
  const blocks = markdown.split(/\n\s*\n/);
  
  return (
    <div className="space-y-5">
      {blocks.map((block, idx) => {
        const lines = block.trim().split('\n').map(l => l.trim());
        if (!lines.length || !lines[0]) return null;
        
        // Blockquote
        if (lines[0].startsWith('>')) {
          const textContent = lines.map(l => l.replace(/^>\s?/, '')).join(' ');
          let label = "";
          let text = textContent;
          const match = textContent.match(/^\[(.*?)\]\s*(.*)/);
          if (match) {
            label = match[1];
            text = match[2];
          }
          return (
            <div key={idx} className="p-4 bg-[#E8DDCF]/30 rounded-sm border-l-2 border-[#8B5A44] my-2">
              {label && <span className="font-display text-[8px] font-bold text-[#8B5A44] block mb-1">{label}</span>}
              <p className={`font-serif leading-[1.8] italic text-[#1C1C1C]/80 ${fontSizeClass === 'normal' ? 'text-[11px]' : fontSizeClass === 'large' ? 'text-[12px]' : 'text-[13px]'}`}>
                {renderInline(text)}
              </p>
            </div>
          );
        }

        // List
        if (lines[0].startsWith('- ') || /^\d+\.\s/.test(lines[0])) {
           const isOrdered = /^\d+\.\s/.test(lines[0]);
           return (
             <ul key={idx} className={`space-y-3 font-serif leading-[1.8] text-[#1C1C1C]/85 ${isOrdered ? 'list-decimal pl-4' : ''} ${fontSizeClass === 'normal' ? 'text-[11px]' : fontSizeClass === 'large' ? 'text-[12px]' : 'text-[13px]'}`}>
               {lines.map((line, lIdx) => {
                 const text = line.replace(/^(?:-\s|\d+\.\s)/, '');
                 if (isOrdered) {
                    return <li key={lIdx}>{renderInline(text)}</li>;
                 } else {
                    return (
                      <li key={lIdx} className="flex items-start gap-2">
                        <span className="text-[#8B5A44] font-bold mt-0.5">•</span>
                        <span>{renderInline(text)}</span>
                      </li>
                    );
                 }
               })}
             </ul>
           );
        }
        
        // Heading
        const text = lines.join(' ');
        if (text.startsWith('### ')) {
          return <h4 key={idx} className={`font-serif font-semibold text-[#1A2F24] mb-2 ${fontSizeClass === 'normal' ? 'text-[11px]' : fontSizeClass === 'large' ? 'text-[12px]' : 'text-[13px]'}`}>{renderInline(text.substring(4))}</h4>;
        }

        // Paragraph
        return (
          <p key={idx} className={`font-serif leading-[1.85] text-[#1C1C1C]/90 ${fontSizeClass === 'normal' ? 'text-[13px]' : fontSizeClass === 'large' ? 'text-[14px]' : 'text-[15px]'}`}>
            {renderInline(text)}
          </p>
        );
      })}
    </div>
  );
};

const BookCoverMock = ({ book, size = "sm", locked = false, lang }: { book: any, size?: "sm" | "md" | "lg", locked?: boolean, lang: "en" | "zh" }) => {
  const dims = size === "lg" ? "w-14 h-18 p-3" : size === "md" ? "w-11 h-14 p-2" : "w-8 h-10 p-1.5";
  const iconSize = size === "lg" || size === "md" ? "w-4 h-4 mb-1" : "w-3 h-3 mb-0.5";
  const titleText = size === "lg" || size === "md" ? "text-[6px]" : "text-[4px]";
  const brandText = size === "lg" || size === "md" ? "text-[5px]" : "hidden";
  const volText = size === "lg" || size === "md" ? "text-[5px]" : "hidden";
  
  return (
    <div className={`${dims} ${book.coverColor} border ${book.borderColor} rounded-sm shadow-md flex flex-col justify-between relative transform -rotate-1 shrink-0`}>
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-black/10 to-transparent"></div>
      <span className={`${brandText} font-display font-semibold text-white/55 tracking-wider`}>IMMERSATION</span>
      <div className="my-auto flex flex-col items-center">
        {locked ? <Lock className={`${iconSize} text-white/90`} /> : <BookOpen className={`${iconSize} text-white/90`} />}
        <span className={`${titleText} font-serif font-bold text-white leading-tight truncate w-full text-center`}>
          {typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en || book.title.zh) : (book?.title || "")}
        </span>
      </div>
      <span className={`${volText} font-mono text-white/40 text-right`}>{locked ? "VOL. LOCK" : "VOL. " + (book.id === "starter-kit" ? "01" : book.id === "workflow-playbook" ? "02" : book.id === "longevity-reset" ? "03" : "04")}</span>
    </div>
  );
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>((props, ref) => {
  return (
    <div ref={ref} className={" " + (props.className || "")} data-density="soft">
      {props.children}
    </div>
  );
});

function processChaptersIntoSpreads(rawChapters: any[], lang: "en" | "zh", book: any) {
  if (!Array.isArray(rawChapters) || rawChapters.length === 0) return [];

  const extractVal = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val[lang] || val.en || val.zh || Object.values(val).find(v => typeof v === "string") || "";
    }
    return String(val);
  };

  const spreads: { chapterLabel: string; title: string; leftContent: string; rightContent: string }[] = [];

  rawChapters.forEach((pageObj, chIdx) => {
    let chapterLabel = extractVal(
      pageObj.chapterLabel || pageObj.label || pageObj.chapter || pageObj.category || pageObj.tagline || pageObj.pillar || pageObj.volume
    );
    if (!chapterLabel) {
      chapterLabel = lang === "en" ? `Chapter ${chIdx + 1}` : `第 ${chIdx + 1} 章`;
    }

    let title = extractVal(pageObj.title || pageObj.name || pageObj.heading || pageObj.chapterTitle);
    if (!title) {
      title = extractVal(book?.title) || (lang === "en" ? "Untitled Chapter" : "未命名章节");
    }

    let leftText = extractVal(
      pageObj.leftContentMarkdown || pageObj.left_content_markdown || pageObj.leftContent || pageObj.left_content || pageObj.leftPage || pageObj.left
    );
    let rightText = extractVal(
      pageObj.rightContentMarkdown || pageObj.right_content_markdown || pageObj.rightContent || pageObj.right_content || pageObj.rightPage || pageObj.right
    );

    // If both left and right text exist, treat this chapter as an explicit spread (or multiple if long)
    if (leftText.trim() || rightText.trim()) {
      spreads.push({
        chapterLabel,
        title,
        leftContent: leftText,
        rightContent: rightText
      });
      return;
    }

    // Otherwise, extract raw single content
    let rawContent = extractVal(
      pageObj.content || pageObj.body || pageObj.markdown || pageObj.text || pageObj.description || pageObj.excerpt || pageObj.details
    );

    if (!rawContent.trim()) {
      const bookDesc = extractVal(book?.description || book?.tagline);
      rawContent = lang === "en"
        ? `### ${title}\n\n${bookDesc || "Welcome to this chapter. Explore key insights and cognitive frameworks designed for deep clarity."}\n\n#### Executive Summary & Key Takeaways\n\n1. Eliminate friction across daily workflow pipelines.\n2. Leverage structured knowledge tools for clear cognitive synthesis.\n3. Compound long-term value through deliberate practice.`
        : `### ${title}\n\n${bookDesc || "欢迎阅读本章节。沉淀核心认知与系统化思维模型。"}\n\n#### 核心要点与实操总结\n\n1. 消解每日工作流中的冗余阻力与摩擦。\n2. 借助结构化知识工具实现敏捷心智提炼。\n3. 通过意向性复利实践积累长久价值。`;
    }

    // Split raw text into paragraphs
    const paragraphs = rawContent.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    // Chunk paragraphs into single-page limits (~500-600 characters per single page)
    const MAX_PAGE_CHARS = 550;
    const pageBlocks: string[] = [];
    let currentBlock = "";

    for (const para of paragraphs) {
      if (currentBlock.length > 0 && (currentBlock.length + para.length > MAX_PAGE_CHARS)) {
        pageBlocks.push(currentBlock.trim());
        currentBlock = para;
      } else {
        currentBlock = currentBlock ? `${currentBlock}\n\n${para}` : para;
      }
    }
    if (currentBlock.trim()) {
      pageBlocks.push(currentBlock.trim());
    }

    // Pair page blocks into double-page spreads
    for (let i = 0; i < pageBlocks.length; i += 2) {
      const subIndex = Math.floor(i / 2) + 1;
      const totalSubs = Math.ceil(pageBlocks.length / 2);
      const displayLabel = totalSubs > 1 ? `${chapterLabel} (${subIndex}/${totalSubs})` : chapterLabel;

      spreads.push({
        chapterLabel: displayLabel,
        title,
        leftContent: pageBlocks[i] || "",
        rightContent: pageBlocks[i + 1] || ""
      });
    }
  });

  return spreads;
}

export default function ReadingRoomView({ 
  lang, 
  onBackToHome, 
  onPlayChime, 
  selectedBookId,
  unlockedBookIds = ["starter-kit"],
  onUnlockBook,
  booksData
}: ReadingRoomViewProps) {
  // Use booksData if provided, otherwise fallback to productBooks
  const activeProductBooks = booksData?.length ? booksData : productBooks;
  
  const [activeBookId, setActiveBookId] = useState<string>(selectedBookId || activeProductBooks[0].id);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const flipBookRef = React.useRef<any>(null);
  const [readingTheme, setReadingTheme] = useState<"soft-paper" | "warm-sand" | "vintage-linen">("soft-paper");
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dbChapters, setDbChapters] = useState<BookChapter[] | null>(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setDbChapters(null);
    setIsLoadingChapters(true);
    secureFetch(`/api/products/${encodeURIComponent(activeBookId)}/content`).then(async response => {
      const data = await response.json();
      if (!cancelled && response.ok) setDbChapters(data.chapters || []);
    }).catch(() => {}).finally(() => { if (!cancelled) setIsLoadingChapters(false); });
    return () => { cancelled = true; };
  }, [activeBookId, unlockedBookIds]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentBook = activeProductBooks.find((b) => b.id === activeBookId) || activeProductBooks[0];

  // Paid content is fetched only through backend authorization. No embedded paid text or public URL fallback.
  const html5FlipbookUrl = "";
  const rawBookChapters = dbChapters || [];

  // Process raw chapters into dynamic double-page spreads so EPUB text flows across as many pages as needed
  const activeBookSpreads = useMemo(() => {
    return processChaptersIntoSpreads(rawBookChapters, lang, currentBook);
  }, [rawBookChapters, lang, currentBook]);

  const isUnlocked = dbChapters !== null;
  
  // Dynamically calculate totalRenderedPages and maxPages based on total double-page spreads
  const totalRenderedPages = isUnlocked ? activeBookSpreads.length * 2 : 2;
  const maxPages = Math.ceil(totalRenderedPages / 2);

  useEffect(() => {
    setCurrentPageIndex(0);
    if (flipBookRef.current && flipBookRef.current.pageFlip()) {
      try {
        flipBookRef.current.pageFlip().turnToPage(0);
      } catch (e) {
        // Safe catch if pageFlip isn't fully ready
      }
    }
  }, [activeBookId]);

  const handleNextPage = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip()) {
      flipBookRef.current.pageFlip().flipNext();
      onPlayChime();
    }
  };

  const handlePrevPage = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip()) {
      flipBookRef.current.pageFlip().flipPrev();
      onPlayChime();
    }
  };

  const handleBookChange = (bookId: string) => {
    setActiveBookId(bookId);
    onPlayChime();
  };

  // Theme settings mapping
  const themeClasses = {
    "soft-paper": "bg-[#FAF8F5] text-[#1C1C1C] border-[#E8DDCF]",
    "warm-sand": "bg-[#F3EFE0] text-[#2F2A21] border-[#DFD8C4]",
    "vintage-linen": "bg-[#EDE9DF] text-[#1D1B18] border-[#DFD8C7]",
  };

  const fontClasses = {
    "normal": "text-[13px] leading-[1.85]",
    "large": "text-[15px]",
    "extra-large": "text-base",
  };
  
  const getPagePadding = (side: "left" | "right") => {
    if (isMobile) {
      return "px-4 md:px-6";
    }
    return side === "left"
      ? "pl-4 md:pl-6 lg:pl-8 pr-10 md:pr-12 lg:pr-14"
      : "pl-10 md:pl-12 lg:pl-14 pr-4 md:pr-6 lg:pr-8";
  };

  return (
    <div className="min-h-screen bg-[#F4F1EB] py-12 px-4 md:px-8 flex flex-col font-sans relative" id="reading-room-root">
      {isLoadingChapters && (
        <div className="absolute inset-0 bg-[#F4F1EB] flex flex-col items-center justify-center z-50 rounded-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-[#8B5A44] mb-2" />
          <span className="font-serif text-xs text-stone-500 tracking-wider">
            {lang === "en" ? "Retrieving digital pages..." : "正在载入知识库卷章..."}
          </span>
        </div>
      )}
      {/* Editorial Top Navigation Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center border-b border-[#D8D2C6] pb-6 mb-8 gap-4" id="reading-room-header">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#D8D2C6] rounded-full text-[11px] leading-[1.8] font-display font-bold uppercase tracking-wider text-[#1C1C1C]/75 hover:bg-[#E8DDCF]/30 hover:text-[#8B5A44] transition-all"
            id="back-to-home-reading"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === "en" ? "Leave Room" : "退出阅读室"}
          </button>
          {isUnlocked && <button className="text-xs underline" onClick={async () => {
            setDownloadMessage('');
            try {
              const response = await secureFetch(`/api/products/${encodeURIComponent(activeBookId)}/download`);
              const result = await response.json();
              if (!response.ok) { setDownloadMessage(result.message || 'Download temporarily unavailable.'); return; }
              window.location.assign(result.url);
            } catch { setDownloadMessage('Connection interrupted. Please retry your download.'); }
          }}>{lang === 'en' ? 'Download' : '下载'}</button>}
          {downloadMessage && <span role="status" className="text-xs">{downloadMessage}</span>}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8B5A44]" />
            <h1 className="font-serif text-base font-normal text-[#1A2F24] tracking-tight">
              {lang === "en" ? "Reading Room" : "在线阅读室"}
            </h1>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center gap-3" id="reading-toolbar">
          {/* FontSize adjustments */}
          <div className="flex items-center border border-[#D8D2C6] bg-[#FAF8F5]/30 rounded-full px-3 py-1" title="Adjust Font Size">
            <Type className="w-3.5 h-3.5 text-[#1C1C1C]/60 mr-2" />
            <button
              onClick={() => setFontSize("normal")}
              className={`text-[8px] font-display font-bold w-6 h-6 rounded-full ${fontSize === "normal" ? "bg-[#8B5A44] text-white" : "text-[#1C1C1C]/60 hover:text-[#1C1C1C]"}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`text-[11px] font-display font-bold w-6 h-6 rounded-full ${fontSize === "large" ? "bg-[#8B5A44] text-white" : "text-[#1C1C1C]/60 hover:text-[#1C1C1C]"}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize("extra-large")}
              className={`text-[13px] font-display font-bold w-6 h-6 rounded-full ${fontSize === "extra-large" ? "bg-[#8B5A44] text-white" : "text-[#1C1C1C]/60 hover:text-[#1C1C1C]"}`}
            >
              A++
            </button>
          </div>

          {/* Theme Adjustment */}
          <div className="flex items-center border border-[#D8D2C6] bg-[#FAF8F5]/30 rounded-full px-3 py-1" title="Reading Canvas Theme">
            <Sliders className="w-3.5 h-3.5 text-[#1C1C1C]/60 mr-2" />
            <button
              onClick={() => setReadingTheme("soft-paper")}
              className={`w-4 h-4 rounded-full bg-[#FAF8F5] border border-black/10 mr-1.5 ${readingTheme === "soft-paper" ? "ring-2 ring-[#8B5A44]" : ""}`}
            />
            <button
              onClick={() => setReadingTheme("warm-sand")}
              className={`w-4 h-4 rounded-full bg-[#F3EFE0] border border-black/10 mr-1.5 ${readingTheme === "warm-sand" ? "ring-2 ring-[#8B5A44]" : ""}`}
            />
            <button
              onClick={() => setReadingTheme("vintage-linen")}
              className={`w-4 h-4 rounded-full bg-[#EDE9DF] border border-black/10 ${readingTheme === "vintage-linen" ? "ring-2 ring-[#8B5A44]" : ""}`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1" id="reading-room-layout">
        
        {/* Top Bar for Volume Selection when HTML5 Flipbook is Active */}
        {html5FlipbookUrl && (
          <div className="lg:col-span-12 bg-[#E8DDCF]/30 border border-[#D8D2C6] p-3 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3" id="horizontal-book-selector">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B5A44]">
                {lang === "en" ? "CHOOSE BOOK VOLUME:" : "选阅智识藏书卷："}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap max-w-full overflow-x-auto py-1">
              {activeProductBooks.map((book) => {
                const isActive = book.id === activeBookId;
                const bookPriceVal = Number(book?.price || 0);
                const isBookUnlocked = unlockedBookIds.includes(book.id) || bookPriceVal === 0;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookChange(book.id)}
                    className={`px-3.5 py-1.5 rounded-sm border text-xs font-serif transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-[#1A2F24] border-[#1A2F24] text-[#FAF8F5] font-semibold shadow"
                        : "bg-[#FAF8F5] border-[#D8D2C6] text-[#1C1C1C] hover:border-[#8B5A44]/60 hover:bg-[#E8DDCF]/10"
                    }`}
                  >
                    <span>{typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en || book.title.zh) : (book?.title || "")}</span>
                    {!isBookUnlocked && <Lock className="w-3 h-3 text-[#B69A6B]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Left Col: Desktop Book Selection Shelf (Only for Native Reader Mode) */}
        {!html5FlipbookUrl && (
          <div className="lg:col-span-3 flex flex-col gap-4 border border-[#D8D2C6] bg-[#E8DDCF]/20 p-5 rounded-sm" id="book-selector-sidebar">
            <span className="font-display text-[8px] font-bold uppercase tracking-[0.2em] text-[#8B5A44]">
              {lang === "en" ? "CHOOSE BOOK VOLUME" : "精选智识藏书卷"}
            </span>
            <div className="space-y-3">
              {activeProductBooks.map((book) => {
                const isActive = book.id === activeBookId;
                const bookPriceVal = Number(book?.price || 0);
                const isBookUnlocked = unlockedBookIds.includes(book.id) || bookPriceVal === 0;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookChange(book.id)}
                    className={`w-full text-left p-4 rounded-sm border transition-all duration-300 flex items-start gap-3 group relative overflow-hidden ${
                      isActive
                        ? "bg-[#1A2F24] border-[#1A2F24] text-[#FAF8F5] shadow"
                        : "bg-[#FAF8F5] border-[#D8D2C6]/50 text-[#1C1C1C] hover:border-[#8B5A44]/60 hover:bg-[#E8DDCF]/10"
                    } ${!isBookUnlocked && !isActive ? "opacity-75" : ""}`}
                    id={`shelf-book-${book.id}`}
                  >
                    <BookCoverMock book={book} size="sm" locked={!isBookUnlocked} lang={lang} />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-serif text-[11px] leading-[1.8] font-semibold leading-snug truncate">
                        {typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en || book.title.zh) : (book?.title || "")}
                      </h3>
                      <p className={`font-serif italic text-[8px] mt-1 truncate ${isActive ? "text-[#FAF8F5]/70" : "text-[#1C1C1C]/50"}`}>
                        {isBookUnlocked 
                          ? (typeof book?.tagline === "object" && book?.tagline !== null ? (book.tagline[lang] || book.tagline.en) : (book?.tagline || (lang === "en" ? "Free Public Access" : "免费公开查阅")))
                          : (lang === "en" ? `Premium Volume • $${bookPriceVal.toFixed(2)}` : `高阶内容 • $${bookPriceVal.toFixed(2)}`)}
                      </p>
                    </div>
                    {/* Subtle wood shelf shadow decoration inside the active button */}
                    {isActive && (
                      <div className="absolute right-0 bottom-0 top-0 w-1.5 bg-[#B69A6B]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-[#D8D2C6] text-center" id="reading-room-mission">
              <p className="font-serif text-[11px] text-[#1C1C1C]/50 italic">
                {lang === "en" ? "Structured Digital Publishing. Turning knowledge into action." : "系统化数字出版：消解冗余信息，回归纯净智识。"}
              </p>
            </div>
          </div>
        )}

        {/* Right Col: Immersive Double-Page Paper Book Reader */}
        <div className={`${html5FlipbookUrl ? "lg:col-span-12" : "lg:col-span-9"} flex flex-col justify-between h-full`} id="immersive-reader-container">
          
          {/* Main Book-Layout Canvas Frame */}
          <div className={`relative w-full ${html5FlipbookUrl ? "w-full aspect-[16/9.2] min-h-[500px] sm:min-h-[580px] md:min-h-[660px] lg:min-h-[720px] p-0" : "aspect-[3/4] md:aspect-[10/7] p-4 md:p-6 lg:p-8"} bg-gradient-to-br from-[#1C1C1C]/10 to-[#1C1C1C]/25 border border-[#D8D2C6] rounded-md flex flex-col justify-center select-none shadow-2xl overflow-hidden`} id="book-canvas-frame">
            
            {/* Soft shadow depth under the overall book spine (Native Reader only) */}
            {!html5FlipbookUrl && !isMobile && (
              <div className="absolute top-0 bottom-0 left-[50%] -translate-x-[50%] w-10 bg-gradient-to-r from-black/15 via-black/40 to-black/15 blur-sm z-30 pointer-events-none"></div>
            )}

            {/* Simulated wooden table grain border (Native Reader only) */}
            {!html5FlipbookUrl && (
              <div className="absolute inset-0 border-[8px] border-[#D8D2C6]/15 pointer-events-none rounded-md z-40"></div>
            )}

            {/* Inside book: HTML5 Flipbook Viewer OR Two Pages Paper Block */}
            {html5FlipbookUrl ? (
              <div className="w-full h-full flex flex-col bg-[#FAF8F5] rounded-sm overflow-hidden shadow-2xl relative z-20 border border-[#D8D2C6]" id="html5-flipbook-container">
                {/* Header bar */}
                <div className="bg-[#1A2F24] text-[#FAF8F5] px-4 py-2.5 flex items-center justify-between text-xs border-b border-[#B69A6B]/30 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="font-display text-[9px] uppercase font-bold tracking-widest text-[#B69A6B] shrink-0">
                      {lang === "en" ? "HTML5 Interactive Reader" : "HTML5 沉浸式翻页引擎"}
                    </span>
                    <span className="text-[#FAF8F5]/60 text-[11px] truncate hidden sm:inline">
                      • {typeof currentBook?.title === "object" && currentBook?.title !== null ? (currentBook.title[lang] || currentBook.title.en) : (currentBook?.title || "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isUnlocked && (
                      <button
                        onClick={() => setIsTheaterMode(true)}
                        className="text-[10px] bg-[#B69A6B] hover:bg-[#8B5A44] text-[#1A2F24] font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        title={lang === "en" ? "Expand for full 2-page 3D flip experience" : "开启全屏剧场模式以获得最佳 3D 双页翻折效果"}
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>{lang === "en" ? "Theater Mode" : "剧场全屏"}</span>
                      </button>
                    )}
                    <a
                      href={html5FlipbookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono hover:text-[#B69A6B] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer text-[#FAF8F5]"
                      title="Open full window"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">{lang === "en" ? "Full Window" : "全屏翻阅"}</span>
                    </a>
                  </div>
                </div>

                {/* Iframe stage or locked paywall overlay */}
                {isUnlocked ? (
                  <div className="flex-1 w-full h-full relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px]">
                    <iframe
                      src={html5FlipbookUrl || undefined}
                      title={typeof currentBook?.title === "object" && currentBook?.title !== null ? (currentBook.title[lang] || currentBook.title.en) : "Flipbook Reader"}
                      className="w-full h-full border-0 bg-white"
                      allow="fullscreen; autoplay; clipboard-write; encrypted-media"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex-1 w-full h-full relative min-h-[450px] flex flex-col items-center justify-center p-6 text-center bg-[#1A2F24]/95 text-[#F4F1EB]">
                    <div className="max-w-md space-y-4">
                      <BookCoverMock book={currentBook} size="md" locked={true} lang={lang} />
                      <div className="w-10 h-10 rounded-full bg-[#B69A6B]/20 text-[#B69A6B] flex items-center justify-center mx-auto border border-[#B69A6B]/40 mt-3">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-lg font-medium text-[#FAF8F5]">
                        {lang === "en" ? "Premium Digital Volume" : "高阶智识选卷已锁定"}
                      </h3>
                      <p className="text-xs text-[#FAF8F5]/80 font-serif leading-relaxed">
                        {lang === "en" 
                          ? "Unlock full reading access to view the HTML5 Flipbook edition in high resolution with interactive page turns." 
                          : "解锁高阶智识选卷，即可在在线阅读室中无限制查阅 HTML5 3D 沉浸式翻页书全卷。"}
                      </p>
                      <button
                        onClick={() => onUnlockBook && onUnlockBook(currentBook.id)}
                        className="mt-2 bg-[#B69A6B] hover:bg-[#8B5A44] text-[#1A2F24] font-semibold px-6 py-2.5 rounded-xs text-xs tracking-wider uppercase transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === "en" ? `Unlock Volume • ${Number(currentBook?.price || 19).toFixed(2)}` : `解锁高阶选卷 • ${Number(currentBook?.price || 19).toFixed(2)}`}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={"w-full h-full rounded-sm shadow-xl relative " + themeClasses[readingTheme]} id="dual-page-paper-block">
              {/* Paper grain/felt texture overlays */}
              <div className="absolute inset-0 bg-repeat opacity-[0.04] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')] z-50"></div>

              {/* Spine separator detail lines overlaying everything slightly */}
              {!isMobile && (
                <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-black/10 z-50 pointer-events-none"></div>
              )}
              
              <FlipBook ref={flipBookRef}
                key={`${activeBookId}-${isUnlocked}-${isMobile}`}
                width={500}
                height={700}
                size="stretch"
                minWidth={300}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1200}
                showCover={false}
                drawShadow={true}
                flippingTime={1000}
                className="w-full h-full"
                useMouseEvents={true}
                usePortrait={isMobile}
                onFlip={(e: any) => setCurrentPageIndex(isMobile ? e.data : Math.floor(e.data / 2))}
              >
              {isUnlocked ? (
                activeBookSpreads.flatMap((pData, index) => {
                  return [
                    <Page key={`left-${index}`} className={`${themeClasses[readingTheme]} pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8 ${getPagePadding('left')} border-r border-black/5 flex flex-col justify-between h-full overflow-hidden`}>
                      {/* Header info */}
                      <div className="flex items-center justify-between border-b border-[#D8D2C6]/40 pb-3 mb-4 shrink-0">
                        <span className="font-display text-[8px] font-bold tracking-[0.15em] text-[#8B5A44]">
                          {pData.chapterLabel}
                        </span>
                        <span className="font-serif italic text-[8px] text-[#1C1C1C]/40 truncate max-w-[150px]">
                          {typeof currentBook?.title === "object" && currentBook?.title !== null ? (currentBook.title[lang] || currentBook.title.en) : (currentBook?.title || "")}
                        </span>
                      </div>

                      {/* Chapter Title & Left Text Content */}
                      <div className={"flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin " + fontClasses[fontSize]}>
                        <h2 className="font-serif text-[15px] sm:text-base lg:text-xl text-[#1A2F24] tracking-tight leading-snug mb-4">
                          {pData.title}
                        </h2>
                        {renderChapterContent(pData.leftContent, fontSize)}
                      </div>

                      {/* Left Page Number footer */}
                      <div className="flex items-center justify-between border-t border-[#D8D2C6]/40 pt-3 mt-3 text-[8px] font-mono text-[#1C1C1C]/40 shrink-0">
                        <span>VOL. {activeBookId === "starter-kit" ? "01" : activeBookId === "workflow-playbook" ? "02" : activeBookId === "longevity-reset" ? "03" : "04"}</span>
                        <span>Page {index * 2 + 1}</span>
                      </div>
                    </Page>

                    ,
                    <Page key={`right-${index}`} className={`${themeClasses[readingTheme]} pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8 ${getPagePadding('right')} flex flex-col justify-between h-full overflow-hidden`}>
                      {/* Header info */}
                      <div className="flex items-center justify-between border-b border-[#D8D2C6]/40 pb-3 mb-4 shrink-0">
                        <span className="font-serif italic text-[8px] text-[#1C1C1C]/40 truncate max-w-[150px]">
                          {pData.title}
                        </span>
                        <span className="font-display text-[8px] tracking-[0.2em] font-semibold text-[#8B5A44] uppercase">
                          IMMERSATION 智枢
                        </span>
                      </div>

                      {/* Right Text Content */}
                      <div className={"flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin " + fontClasses[fontSize]}>
                        {renderChapterContent(pData.rightContent, fontSize)}
                      </div>

                      {/* Right Page Number footer */}
                      <div className="flex items-center justify-between border-t border-[#D8D2C6]/40 pt-3 mt-3 text-[8px] font-mono text-[#1C1C1C]/40 shrink-0">
                        <span>Page {index * 2 + 2}</span>
                        <span className="text-[8px] uppercase tracking-wider font-semibold font-display">Est. 2026</span>
                      </div>
                    </Page>
                  ];
                })
              ) : (
                [
                  /* LEFT PAGE - PAYWALL PREVIEW */
                  <Page key="paywall-left" className={`${themeClasses[readingTheme]} pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8 ${getPagePadding('left')} border-r border-black/5 flex flex-col justify-between h-full overflow-hidden`}>
                    <div className="flex items-center justify-between border-b border-[#D8D2C6]/40 pb-3 mb-4 shrink-0">
                      <span className="font-display text-[8px] font-bold tracking-[0.15em] text-[#8B5A44]">
                        {lang === "en" ? "VOLUME LOCKED" : "著作已锁"}
                      </span>
                      <span className="font-serif italic text-[8px] text-[#1C1C1C]/40 truncate max-w-[150px]">
                        {typeof currentBook?.title === "object" && currentBook?.title !== null ? (currentBook.title[lang] || currentBook.title.en) : (currentBook?.title || "")}
                      </span>
                    </div>

                    <div className={`flex-1 flex flex-col justify-center items-center text-center p-4 ${fontClasses[fontSize]}`}>
                      <BookCoverMock book={currentBook} size="lg" locked={true} lang={lang} />
                      
                      <h3 className="font-serif text-[13px] leading-[1.85] sm:text-[15px] text-[#1A2F24] font-semibold tracking-tight leading-snug mb-2">
                        {typeof currentBook?.title === "object" && currentBook?.title !== null ? (currentBook.title[lang] || currentBook.title.en) : (currentBook?.title || "")}
                      </h3>
                      <p className="font-serif italic text-[8px] text-[#8B5A44] mb-3">
                        {typeof currentBook?.tagline === "object" && currentBook?.tagline !== null ? (currentBook.tagline[lang] || currentBook.tagline.en) : (currentBook?.tagline || "")}
                      </p>
                      <p className="font-sans text-[#1C1C1C]/60 max-w-xs">
                        {lang === "en" 
                          ? "This high-density knowledge blueprint details step-by-step custom code integrations, live automation configurations, and proprietary leverage paradigms."
                          : "本册智识蓝图包含详细的代码级整合策略、低代码自动化方案与专有的高杠杆行动指南，助力消除日常执行摩擦。"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#D8D2C6]/40 pt-3 mt-3 text-[8px] font-mono text-[#1C1C1C]/40 shrink-0">
                      <span>{lang === "en" ? "PROPRIETARY" : "专有学术性资产"}</span>
                      <span>VOL. LOCKED</span>
                    </div>
                  </Page>

                  ,
                  <Page key="paywall-right" className={`${themeClasses[readingTheme]} pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8 ${getPagePadding('right')} flex flex-col justify-between h-full overflow-hidden`}>
                    <div className="absolute inset-0 bg-[#1A2F24]/5 pointer-events-none -z-10" />
                    <div className="flex items-center justify-between border-b border-[#D8D2C6]/40 pb-3 mb-4 shrink-0">
                      <span className="font-serif italic text-[8px] text-[#1C1C1C]/40 truncate max-w-[150px]">
                        {lang === "en" ? "Key Required" : "需要授权密钥"}
                      </span>
                      <span className="font-display text-[8px] tracking-[0.2em] font-semibold text-[#8B5A44] uppercase">
                        IMMERSATION 智枢
                      </span>
                    </div>

                    <div className={`flex-1 flex flex-col justify-center items-center text-center p-4 ${fontClasses[fontSize]}`}>
                      <div className="w-10 h-10 rounded-full bg-[#8B5A44]/10 flex items-center justify-center mb-4">
                        <Lock className="w-5 h-5 text-[#8B5A44]" />
                      </div>
                      
                      <h4 className="font-serif text-[13px] leading-[1.85] font-semibold text-[#1A2F24] mb-2">
                        {lang === "en" ? "Authorize Digital License" : "授权数字阅读许可"}
                      </h4>
                      <p className="font-sans text-[#1C1C1C]/65 max-w-xs mb-6">
                        {lang === "en" 
                          ? "Access is restricted to authorized thinkers. Acquire immediate lifetime reading room authorization and download links via our secure payment gateway."
                          : "本卷内容仅限授权思想家阅读。通过安全支付通道购买即可瞬间获得永久在线阅读权与相关配套代码组件下载权。"}
                      </p>

                      <div className="mb-6 flex flex-col items-center">
                        <span className="text-[8px] font-display font-bold uppercase tracking-widest text-[#1C1C1C]/40">
                          {lang === "en" ? "LIFETIME VALUE LICENSE" : "终身授权许可价格"}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-[13px] leading-[1.85] font-serif text-[#1C1C1C]/60 font-semibold">$</span>
                          <span className="text-2xl font-serif text-[#1A2F24] font-normal tracking-tight">
                            {(Number(currentBook?.price || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onUnlockBook) {
                            onUnlockBook(activeBookId);
                          }
                        }}
                        className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-[8px] font-bold uppercase tracking-[0.2em] py-3.5 rounded-sm transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{lang === "en" ? "Unlock Volume Now" : "立即购买解锁此卷"}</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#D8D2C6]/40 pt-3 mt-3 text-[8px] font-mono text-[#1C1C1C]/40 shrink-0">
                      <span>{lang === "en" ? "SECURE TRANSACTION" : "安全加密支付"}</span>
                      <span className="text-[8px] uppercase tracking-wider font-semibold font-display">Est. 2026</span>
                    </div>
                  </Page>
                ]
              )}
              </FlipBook>
            </div>
            )}
          </div>

          {/* Book Navigation controls underneath */}
          {html5FlipbookUrl ? (
            <div className="mt-4 p-3 bg-[#E8DDCF]/20 border border-[#D8D2C6]/60 rounded-sm space-y-2" id="book-nav-controls">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "HTML5 Interactive Reader Active" : "已加载 HTML5 互动翻页引擎"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={html5FlipbookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#8B5A44] hover:text-[#1A2F24] flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer bg-white/60 px-2.5 py-1 rounded border border-[#D8D2C6]/50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Test URL in New Tab" : "在新标签页测试该链接"}</span>
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                {lang === "en" ? (
                  <>
                    💡 <strong>If the reader shows a blank white page:</strong> Ensure your Netlify Drop URL points directly to your <code className="bg-white px-1 py-0.5 rounded text-[10px] text-emerald-800 border">index.html</code> (e.g. <span className="font-mono text-[10px] text-stone-800">https://site.netlify.app/index.html</span> or <span className="font-mono text-[10px] text-stone-800">https://site.netlify.app/folder-name/index.html</span>).
                  </>
                ) : (
                  <>
                    💡 <strong>如果出现空白页面：</strong> 请确保输入的 Netlify 链接包含完整的 <code className="bg-white px-1 py-0.5 rounded text-[10px] text-emerald-800 border">index.html</code> 文件路径（例如：<span className="font-mono text-[10px] text-stone-800">https://site.netlify.app/index.html</span> 或 <span className="font-mono text-[10px] text-stone-800">https://site.netlify.app/子文件夹名/index.html</span>）。
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-6 px-2" id="book-nav-controls">
              <button
                onClick={handlePrevPage}
                disabled={!isUnlocked || currentPageIndex === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-sm border font-display text-[11px] leading-[1.8] font-bold uppercase tracking-wider transition-all ${
                  (!isUnlocked || currentPageIndex === 0)
                    ? "border-[#D8D2C6]/40 text-[#1C1C1C]/25 cursor-not-allowed "
                    : "border-[#D8D2C6] bg-white text-[#1C1C1C]/70 hover:bg-[#E8DDCF]/30 hover:text-[#8B5A44] hover:shadow"
                }`}
                id="btn-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
                {lang === "en" ? "Previous Page" : "上一页"}
              </button>

              {/* Reading progress percentage indicator */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[11px] leading-[1.8] text-[#1C1C1C]/50">
                  {currentPageIndex + 1} / {maxPages}
                </span>
                <div className="w-32 h-1 bg-[#D8D2C6]/50 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#8B5A44] transition-all duration-300"
                    style={{ width: `${((currentPageIndex + 1) / maxPages) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleNextPage}
                disabled={!isUnlocked || currentPageIndex === maxPages - 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-sm border font-display text-[11px] leading-[1.8] font-bold uppercase tracking-wider transition-all ${
                  (!isUnlocked || currentPageIndex === maxPages - 1)
                    ? "border-[#D8D2C6]/40 text-[#1C1C1C]/25 cursor-not-allowed "
                    : "border-[#D8D2C6] bg-white text-[#1C1C1C]/70 hover:bg-[#E8DDCF]/30 hover:text-[#8B5A44] hover:shadow"
                }`}
                id="btn-next-page"
              >
                {lang === "en" ? "Next Page" : "下一页"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Fullscreen Theater Mode Modal for HTML5 Flipbook */}
      <AnimatePresence>
        {isTheaterMode && html5FlipbookUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#111B15] flex flex-col w-screen h-screen p-0 m-0 overflow-hidden"
          >
            {/* Top Bar */}
            <div className="bg-[#1A2F24] text-[#F4F1EB] px-4 py-2 flex items-center justify-between border-b border-[#B69A6B]/30 shrink-0 h-11">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <h3 className="font-serif text-xs sm:text-sm font-medium text-[#FAF8F5] truncate">
                  {typeof currentBook?.title === "object" && currentBook?.title !== null ? (currentBook.title[lang] || currentBook.title.en) : (currentBook?.title || "")}
                </h3>
                <span className="text-[10px] font-mono text-[#B69A6B] bg-[#B69A6B]/15 border border-[#B69A6B]/30 px-2 py-0.5 rounded hidden sm:inline">
                  {lang === "en" ? "Interactive 3D Double-Page Spread (95 Pages)" : "3D 双页沉浸式翻页 (95页)"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={html5FlipbookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#FAF8F5]/80 hover:text-[#B69A6B] bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === "en" ? "Full Window" : "全屏独立页"}</span>
                </a>
                <button
                  onClick={() => setIsTheaterMode(false)}
                  className="bg-[#B69A6B] hover:bg-[#8B5A44] text-[#1A2F24] hover:text-white font-semibold text-xs px-3.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Exit Theater" : "退出剧场"}</span>
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="flex-1 w-full h-[calc(100vh-44px)] bg-white overflow-hidden relative">
              <iframe
                src={html5FlipbookUrl || undefined}
                title="Theater Flipbook Reader"
                className="w-full h-full border-0 bg-white"
                allow="fullscreen; autoplay; clipboard-write; encrypted-media"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
