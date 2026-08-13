import React, { useState } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  Plus, 
  ShoppingBag, 
  Lock, 
  Check, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  FileText,
  Bookmark,
  Layers,
  Compass,
  ClipboardList
} from "lucide-react";

interface TOCItem {
  num: string;
  en: string;
  zh: string;
}

const tocData: Record<string, TOCItem[]> = {
  "starter-kit": [
    { num: "01", en: "System Core & Cognitive Offloading", zh: "心智系统重置与数字减噪" },
    { num: "02", en: "High-Velocity Dynamic Workflows", zh: "无阻力自适应 AI 提效流" },
    { num: "03", en: "Deep Reading Rooms & Mental Maps", zh: "深度电子阅读与离线知识构建" },
    { num: "04", en: "The Capital Compass & Slow Compounding", zh: "跨周期稳健资本配置架构" }
  ],
  "workflow-playbook": [
    { num: "01", en: "Automating Cognitive Ingestion", zh: "自动化智识吞吐系统" },
    { num: "02", en: "Designing Prompt Interfaces", zh: "提示词工程与上下文控制" },
    { num: "03", en: "Self-Running Information Pipelines", zh: "自运行跨平台数据处理流" },
    { num: "04", en: "Debugging Automation Friction", zh: "人机协作中的机械阻力消解" }
  ],
  "longevity-reset": [
    { num: "01", en: "Chronobiological Sleep Homeostasis", zh: "昼夜节律与睡眠稳态控制" },
    { num: "02", en: "Nervous System Reset Protocols", zh: "神经系统张力调控方案" },
    { num: "03", en: "Sustained Cognitive Endurance Science", zh: "脑力工作者的生物化学续航" },
    { num: "04", en: "The Longevity Habit Loop", zh: "跨越岁月的健康反馈闭环" }
  ],
  "wealth-frameworks": [
    { num: "01", en: "Asymmetry of Risk & Information", zh: "风险、非对称性与信息茧房" },
    { num: "02", en: "Asset Allocations for Sovereign Thinkers", zh: "独立思考者的稳健资产分布" },
    { num: "03", en: "Spotting Cyclical Echoes & Bubbles", zh: "识别繁荣幻象与周期回声" },
    { num: "04", en: "Compounding Calm Under Extreme Stress", zh: "市场震荡中的心智财富守护" }
  ]
};

function TableOfContentsTeaser({
  productId,
  lang,
  condensed = false
}: {
  productId: string;
  lang: "en" | "zh";
  condensed?: boolean;
}) {
  const items = tocData[productId] || tocData["starter-kit"];
  const displayItems = condensed ? items.slice(0, 2) : items;

  if (condensed) {
    return (
      <div className="mt-3 pt-3 border-t border-[#D8D2C6]/30 text-[11px] text-[#1C1C1C]/75 font-serif space-y-1">
        {displayItems.map((item) => (
          <div key={item.num} className="flex items-start gap-1.5">
            <span className="text-[#8B5A44] font-mono text-[9px] font-bold shrink-0">{item.num}.</span>
            <span className="truncate">{lang === "en" ? item.en : item.zh}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-xs text-[#1C1C1C]/80 font-serif">
      {displayItems.map((item) => (
        <div key={item.num} className="flex items-center gap-2">
          <span className="text-[#8B5A44] font-mono font-bold">{item.num}.</span>
          <span>{lang === "en" ? item.en : item.zh}</span>
        </div>
      ))}
    </div>
  );
}

interface DigitalPublishingViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onAddToCart?: (item: any) => void;
  onNavigateToReadingRoom?: (bookId: string) => void;
  books?: any[];
}

export default function DigitalPublishingView({
  lang,
  onBackToHome,
  onPlayChime,
  onAddToCart,
  onNavigateToReadingRoom,
  books = []
}: DigitalPublishingViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "ebook" | "guide" | "workbook" | "reading-room">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  // Sound and action helper
  const handleAction = (cb?: () => void) => {
    if (onPlayChime) onPlayChime();
    if (cb) cb();
  };

  // Mock add to cart with confirmation
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const triggerAddToCart = (id: string, title: string) => {
    handleAction(() => {
      if (onAddToCart) {
        onAddToCart({ id, title });
      }
      setAddedItem(id);
      setTimeout(() => setAddedItem(null), 2500);
    });
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

  const coverPalettes = [
    { coverColor: "bg-[#1A2F24]", borderColor: "border-[#1A2F24]", textColor: "text-[#F4F1EB]", accentColor: "text-[#B69A6B]" },
    { coverColor: "bg-[#8B5A44]", borderColor: "border-[#8B5A44]", textColor: "text-[#F4F1EB]", accentColor: "text-[#E8DDCF]" },
    { coverColor: "bg-[#1C1C1C]", borderColor: "border-[#1C1C1C]", textColor: "text-[#F4F1EB]", accentColor: "text-[#B69A6B]" },
    { coverColor: "bg-[#2D3A32]", borderColor: "border-[#2D3A32]", textColor: "text-[#F4F1EB]", accentColor: "text-[#E8DDCF]" },
  ];

  const products = books.map((b, idx) => {
    let rawFormat = b.format;
    if (!rawFormat) {
      if (b.id === "starter-kit") rawFormat = { en: "Digital Guide", zh: "数字指南" };
      else if (b.id === "workflow-playbook") rawFormat = { en: "Digital Guide", zh: "数字指南" };
      else if (b.id === "longevity-reset") rawFormat = { en: "Workbook", zh: "工作手册" };
      else if (b.id === "wealth-frameworks") rawFormat = { en: "eBook", zh: "电子书" };
    }
    const palette = coverPalettes[idx % coverPalettes.length];
    const coverImg = b.cover || b.coverImageUrl || b.cover_image_url || "";

    return {
      id: b.id,
      title: ensureBilingual(b.title, "Untitled Product", "未命名产品"),
      format: ensureBilingual(rawFormat, "eBook", "电子书"),
      pillar: ensureBilingual(b.pillar, "Body · Tool · Capital", "身体 · 工具 · 资本"),
      pages: b.pages || "100 pages",
      badge: ensureBilingual(b.badge, "Member / Paid", "会员免费 / 付费"),
      price: b.price === 0 ? "$0.00" : `${Number(b.price || 19).toFixed(2)}`,
      description: ensureBilingual(b.description, "", ""),
      priceNum: b.price || 0,
      cover: coverImg,
      coverColor: b.coverColor || palette.coverColor,
      borderColor: b.borderColor || palette.borderColor,
      textColor: b.textColor || palette.textColor,
      accentColor: b.accentColor || palette.accentColor
    };
  });

  return (
    <div className="bg-[#F4F1EB] min-h-screen text-[#1C1C1C] selection:bg-[#8B5A44]/10 selection:text-[#8B5A44] pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Decorative Winding lines and textures */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,200 C300,400 200,800 800,1000" fill="none" stroke="#8B5A44" strokeWidth="1" strokeDasharray="5,5" />
          <path d="M500,-100 C800,300 400,600 1200,900" fill="none" stroke="#1A2F24" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => handleAction(onBackToHome)}
          className="flex items-center gap-2 group text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors mb-12 cursor-pointer"
          id="digital-pub-back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{lang === "en" ? "Back to Chamber" : "返回主页"}</span>
        </button>

        {/* 1. Hero Masthead */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24" id="digital-pub-hero">
          <div className="lg:col-span-6">
            <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#8B5A44] block mb-4">
              {lang === "en" ? "DIGITAL PUBLISHING" : "DIGITAL PUBLISHING ｜ 数字出版"}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6 ink-text">
              {lang === "en" ? "Digital Publishing" : "用于深度学习的电子书、数字指南与工作手册"}
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed mb-8 max-w-xl">
              {lang === "en" 
                ? "Structured guides, eBooks, and workbooks for deeper learning. Immersation turns complex ideas into digital knowledge assets that can be read, reviewed, applied, and reused over time."
                : "Immersation｜智枢阁 将复杂主题系统化为可阅读、可复盘、可执行、可长期复用的数字知识资产。帮助未来个体实现系统性成长。"}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => {
                  const el = document.getElementById("featured-publication");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm hover:shadow-md cursor-pointer"
              >
                {lang === "en" ? "Featured Work" : "推荐首发著作"}
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("digital-library-grid");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] px-8 py-4 rounded-sm transition-colors cursor-pointer bg-white/20 hover:bg-white/50"
              >
                {lang === "en" ? "Browse Catalog" : "浏览全部馆藏"}
              </button>
            </div>
          </div>

          {/* Elegant ebook cover stack preview / Flipping book viewer mockup */}
          <div className="lg:col-span-6 relative flex justify-center py-12" id="digital-pub-hero-visual">
            
            {/* Background radial lines */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none">
              <div className="w-[320px] h-[320px] rounded-full border border-[#D8D2C6] border-dashed"></div>
              <div className="w-[480px] h-[480px] rounded-full border border-[#D8D2C6] absolute"></div>
            </div>

            {/* eBook Stack Visual */}
            <div className="relative w-72 h-96 flex items-center justify-center">
              
              {/* Back Card (Wealth) */}
              <div className="absolute w-56 h-76 bg-[#1C1C1C] text-[#F4F1EB] border border-[#D8D2C6]/20 rounded-sm shadow-lg transform -rotate-12 translate-x-12 translate-y-4 opacity-40 transition-all hover:opacity-75 hover:scale-105 duration-500">
                <div className="p-4 h-full flex flex-col justify-between border border-[#F4F1EB]/10 m-1">
                  <span className="text-[7px] font-mono tracking-widest text-[#B69A6B]">VOL. IV</span>
                  <div className="my-auto font-serif text-sm font-normal text-center px-2">
                    Wealth Cognition Frameworks
                  </div>
                  <span className="text-[6px] font-mono text-center">IMMERSATION</span>
                </div>
              </div>

              {/* Middle Card (AI Playbook) */}
              <div className="absolute w-56 h-76 bg-[#8B5A44] text-[#F4F1EB] border border-[#D8D2C6]/20 rounded-sm shadow-xl transform rotate-6 -translate-x-8 -translate-y-2 opacity-70 transition-all hover:opacity-90 hover:scale-105 duration-500">
                <div className="p-4 h-full flex flex-col justify-between border border-[#F4F1EB]/10 m-1">
                  <span className="text-[7px] font-mono tracking-widest text-orange-200">VOL. II</span>
                  <div className="my-auto font-serif text-sm font-normal text-center px-1">
                    The Calm AI Workflow Playbook
                  </div>
                  <span className="text-[6px] font-mono text-center">IMMERSATION</span>
                </div>
              </div>

              {/* Front Card (Personal Intelligence - Featured) */}
              <div className="absolute w-56 h-76 bg-[#1A2F24] text-[#F4F1EB] border border-[#D8D2C6] rounded-sm shadow-2xl transform -rotate-2 hover:rotate-0 transition-all hover:scale-105 duration-500 z-10 cursor-pointer">
                <div className="p-6 h-full flex flex-col justify-between border border-[#F4F1EB]/10 m-1.5 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-gradient-to-br from-[#B69A6B]/20 to-transparent rounded-full blur-xl"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono tracking-widest text-[#B69A6B]">VOL. I</span>
                    <span className="text-[8px] bg-[#B69A6B]/15 text-[#B69A6B] px-1.5 py-0.5 rounded-xs font-mono uppercase">STARTER</span>
                  </div>

                  <div className="my-auto text-center py-4">
                    <h4 className="font-serif text-base font-normal tracking-wide leading-tight mb-2">
                      The Personal
                    </h4>
                    <h4 className="font-serif text-base font-normal tracking-wide leading-tight mb-2">
                      Intelligence
                    </h4>
                    <h4 className="font-serif text-base font-normal tracking-wide leading-tight text-[#B69A6B]">
                      System Guide
                    </h4>
                    <div className="w-8 h-px bg-[#B69A6B] mx-auto mt-4"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-mono tracking-[0.2em] opacity-60">IMMERSATION PRESS</span>
                    <span className="text-[6px] font-mono opacity-30 mt-1">EST. 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Product Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24" id="digital-pub-types">
          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="text-[#1A2F24] mb-6">
              <FileText className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "eBooks" : "电子书"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Long-form knowledge assets for deep reading and mental wiring." 
                : "适合深度阅读、长效沉淀的系统化个人智识资产。"}
            </p>
          </div>

          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="text-[#8B5A44] mb-6">
              <Layers className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Digital Guides" : "数字指南"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Structured playbooks and field guides for practical application." 
                : "将复杂主题转化为直观框架与可执行步骤的结构化实践手册。"}
            </p>
          </div>

          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="text-[#B69A6B] mb-6">
              <Bookmark className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Workbooks" : "工作手册"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Interactive documents for reflection, tracking, and execution." 
                : "用于记录、复盘、追踪与周期复盘的精细互动型作业表格。"}
            </p>
          </div>

          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="text-[#1C1C1C] mb-6">
              <BookOpen className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Online Reading Room" : "在线阅读室"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Read selected Immersation publications directly inside the website." 
                : "在精美、无干扰的网页端直接翻阅并复盘 Immersation 精选出版物。"}
            </p>
          </div>
        </div>

        {/* 3. Featured Publication Section */}
        <div 
          className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 mb-24 relative overflow-hidden" 
          id="featured-publication"
        >
          {/* Subtle elegant badge */}
          <span className="absolute right-8 top-8 bg-[#8B5A44]/10 text-[#8B5A44] font-display text-[9px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 rounded-sm">
            {lang === "en" ? "RECOMMENDED RELEASE" : "重点推荐首发"}
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Elegant Cover Left */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-60 h-80 bg-[#1A2F24] text-[#F4F1EB] border-2 border-[#D8D2C6] rounded-sm shadow-2xl relative p-5 flex flex-col justify-between m-2 group hover:scale-[1.01] transition-transform duration-500 overflow-hidden">
                {/* Diagonal fold corner detail */}
                <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden pointer-events-none z-20">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-[#F4F1EB] transform rotate-45 translate-x-6 -translate-y-6 border-b border-[#D8D2C6]/60 shadow-sm"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#B69A6B]/30 transform rotate-45 translate-x-1.5 -translate-y-1.5"></div>
                </div>

                <div className="border border-[#F4F1EB]/10 h-full p-4 flex flex-col justify-between relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono tracking-widest text-[#B69A6B]">VOLUME I</span>
                    <span className="text-[7px] font-mono tracking-widest text-white/50 pr-4">184 PAGES</span>
                  </div>

                  <div className="my-auto text-center">
                    <h3 className="font-serif text-lg font-normal leading-tight tracking-wide mb-1 text-white">
                      The Personal
                    </h3>
                    <h3 className="font-serif text-lg font-normal leading-tight tracking-wide mb-1 text-white">
                      Intelligence
                    </h3>
                    <h3 className="font-serif text-lg font-normal leading-tight tracking-wide text-[#B69A6B] mb-2">
                      System Guide
                    </h3>
                    
                    {/* Embedded excerpt line */}
                    <div className="my-3 px-1 py-1.5 border-y border-white/5 bg-white/[0.02]">
                      <p className="text-[8px] font-serif italic text-white/70 leading-relaxed">
                        {lang === "en" 
                          ? "“If you do not clear your mind, you cannot claim your focus.”"
                          : "“心若不修，何谈专注。打造外置智识缓存，解放生物核心CPU。”"}
                      </p>
                    </div>

                    <p className="text-[8px] font-sans text-white/45 max-w-[150px] mx-auto leading-relaxed">
                      {lang === "en" ? "Blueprints for Body, Tool, and Capital" : "稳定身体、智能放大、长期资本"}
                    </p>
                  </div>

                  <div className="flex flex-col items-center border-t border-white/5 pt-3">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#B69A6B]">IMMERSATION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Copy Right */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#8B5A44] block mb-2">
                {lang === "en" ? "THE PERSONAL INTELLIGENCE SYSTEM" : "个人智能操作系统核心指南"}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] mb-4 leading-tight">
                {lang === "en" 
                  ? "The Personal Intelligence System Guide" 
                  : "个人智能系统建立指南：打造未来的自演进基石"}
              </h2>
              <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en"
                  ? "A definitive guide designed to help modern knowledge workers build structured systems. Rather than quick hacks, it covers sleep hygiene, cognitive offloading, dynamic knowledge bases, and systemic risk frameworks across market cycles."
                  : "这是一本为高阶脑力劳动者和未来个体量身打造的长期架构手册。摒弃短期的肤浅技巧，为您系统地剖析：如何通过习惯闭环保持精力；如何在大脑中建立卸载缓存；如何利用 AI 进行信息吞吐；以及如何在漫长的资本波动周期中坚守冷静复利的认知体系。"}
              </p>

              {/* Minimalist table of contents teaser */}
              <div className="border-t border-b border-[#D8D2C6]/50 py-4 mb-8">
                <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50 block mb-2">
                  {lang === "en" ? "TABLE OF CONTENTS PREVIEW" : "核心目录概览"}
                </span>
                <TableOfContentsTeaser productId="starter-kit" lang={lang} condensed={false} />
              </div>

              {/* Action Rows */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleAction(() => {
                    if (onNavigateToReadingRoom) onNavigateToReadingRoom("starter-kit");
                  })}
                  className="w-full sm:w-auto bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-sm transition-brand flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === "en" ? "Read Online" : "立即在线翻阅"}</span>
                </button>
                <button 
                  onClick={() => triggerAddToCart("starter-kit", "Personal Intelligence System Guide")}
                  className="w-full sm:w-auto border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white/30 hover:bg-white/60"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {addedItem === "starter-kit" 
                      ? (lang === "en" ? "In Cart" : "已加入购物车") 
                      : (lang === "en" ? "Add to Cart" : "加入购物车")}
                  </span>
                </button>
                <button 
                  onClick={() => handleAction(() => {
                    alert(lang === "en" ? "Downloading high-resolution publication PDF..." : "正在下载高画质印厂级 PDF 文档...");
                  })}
                  className="w-full sm:w-auto text-[#1C1C1C]/70 hover:text-[#8B5A44] font-display text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Download PDF" : "下载 PDF 离线版"}</span>
                </button>
              </div>

              {/* Small Free Preview Link */}
              <div className="mt-4 text-center sm:text-left">
                <span className="text-[10px] font-sans text-[#1C1C1C]/40">
                  {lang === "en" 
                    ? "Free preview available. Download works offline on Kindle, Apple Books, and reMarkable." 
                    : "本品向全体订阅用户提供免费试读版。格式全面适配 Kindle, Apple Books 与 reMarkable 设备。"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Digital Library Catalog */}
        <div className="mb-24" id="digital-library-grid">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] tracking-tight mb-2 ink-text">
                {lang === "en" ? "The Digital Library" : "智枢精选数字馆藏"}
              </h2>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60">
                {lang === "en" ? "Refined digital publications across body, tool, and capital." : "覆盖身体、工具、资本的三大核心智识成果，供您静心研读。"}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2" id="digital-pub-tabs">
              {[
                { id: "all", label: { en: "All", zh: "全部" } },
                { id: "ebook", label: { en: "eBooks", zh: "电子书" } },
                { id: "guide", label: { en: "Guides", zh: "数字指南" } },
                { id: "workbook", label: { en: "Workbooks", zh: "工作手册" } }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleAction(() => setActiveTab(tab.id as any))}
                  className={`text-[10px] font-display font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? "bg-[#1A2F24] text-[#F4F1EB] shadow-sm" 
                      : "bg-[#D8D2C6]/25 text-[#1C1C1C]/60 hover:text-[#1C1C1C] hover:bg-[#D8D2C6]/40"
                  }`}
                >
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="digital-library-cards">
            {products
              .filter(p => activeTab === "all" || p.format.en.toLowerCase().includes(activeTab))
              .map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 flex flex-col justify-between group hover:border-[#8B5A44] hover:bg-white/80 transition-all duration-300"
                  id={`library-card-${prod.id}`}
                >
                  {/* Card Cover Preview */}
                  <div className="mb-6 relative flex justify-center py-6 bg-[#F4F1EB]/50 rounded-sm overflow-hidden border border-[#D8D2C6]/30">
                    <div className={`w-28 h-36 ${prod.coverColor} rounded-xs shadow-md p-3 flex flex-col justify-between relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                      {prod.cover && !prod.cover.includes("IMMERSATION-LOGO-Light-scaled.png") && (
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={prod.cover || undefined} 
                            referrerPolicy="no-referrer"
                            alt={prod.title[lang]} 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
                      
                      {/* Top Header with small format-specific visual cue */}
                      <div className="flex justify-between items-center z-10">
                        <span className={`text-[6px] font-mono tracking-widest ${prod.cover && !prod.cover.includes("IMMERSATION-LOGO-Light-scaled.png") ? "text-[#F4F1EB]" : prod.textColor} opacity-80`}>IMMERSATION</span>
                        <div className={`${prod.cover && !prod.cover.includes("IMMERSATION-LOGO-Light-scaled.png") ? "text-[#F4F1EB]" : prod.accentColor} opacity-90`}>
                          {prod.format.en.toLowerCase().includes("guide") && <Compass className="w-3 h-3" />}
                          {prod.format.en.toLowerCase().includes("workbook") && <ClipboardList className="w-3 h-3" />}
                          {prod.format.en.toLowerCase().includes("ebook") && <Layers className="w-3 h-3" />}
                        </div>
                      </div>

                      <h4 className={`font-serif text-[10px] font-normal leading-tight text-center ${prod.cover && !prod.cover.includes("IMMERSATION-LOGO-Light-scaled.png") ? "text-[#F4F1EB]" : prod.textColor} px-1 my-auto z-10`}>
                        {prod.title[lang]}
                      </h4>
                      <span className={`text-[5px] font-mono text-center ${prod.cover && !prod.cover.includes("IMMERSATION-LOGO-Light-scaled.png") ? "text-[#F4F1EB]" : prod.textColor} opacity-60 z-10`}>{prod.pages}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="text-[9px] font-display font-semibold uppercase tracking-wider text-[#8B5A44]">
                          {prod.format[lang]}
                        </span>
                        <span className="text-[9px] text-[#1C1C1C]/50 font-mono">
                          {prod.pillar[lang]}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-base font-normal text-[#1A2F24] leading-snug mb-3 group-hover:text-[#8B5A44] transition-colors">
                        {prod.title[lang]}
                      </h3>

                      <p className="font-serif text-xs text-[#1C1C1C]/65 leading-relaxed mb-3 line-clamp-3">
                        {prod.description[lang]}
                      </p>

                      {/* Condensed 2-line Table of Contents Preview */}
                      <TableOfContentsTeaser productId={prod.id} lang={lang} condensed={true} />
                      <div className="mb-4"></div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-[#D8D2C6]/40 pt-4 mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] bg-[#1A2F24]/5 text-[#1A2F24] font-mono font-bold px-2 py-1 rounded-xs">
                          {prod.badge[lang]}
                        </span>
                        <span className="font-serif text-sm font-medium text-[#1A2F24]">
                          {prod.price}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(() => {
                            if (onNavigateToReadingRoom) onNavigateToReadingRoom(prod.id);
                          })}
                          className="flex-1 bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-[9px] font-semibold uppercase tracking-[0.15em] py-2.5 rounded-sm transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{lang === "en" ? "Read" : "阅读"}</span>
                        </button>
                        <button 
                          onClick={() => triggerAddToCart(prod.id, prod.title[lang])}
                          className="border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-[9px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2.5 rounded-sm transition-colors cursor-pointer bg-white/20 hover:bg-white"
                        >
                          {addedItem === prod.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 5. Online Reading Room Interactive Segment */}
        <div className="bg-[#1A2F24] text-[#F4F1EB] border border-[#F4F1EB]/10 rounded-md p-8 md:p-12 mb-24 relative overflow-hidden" id="online-reading-room">
          
          <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full border border-white/5 pointer-events-none select-none"></div>
          <div className="absolute right-12 top-12 w-64 h-64 rounded-full border border-white/5 pointer-events-none select-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Info */}
            <div className="lg:col-span-5">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#B69A6B] block mb-3">
                {lang === "en" ? "ONLINE READING ROOM" : "智枢阁 · 专属在线阅读室"}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-tight mb-4 text-[#F4F1EB]">
                {lang === "en" ? "Online Reading Room" : "沉浸式的数字智识阅览空间"}
              </h2>
              <p className="font-serif text-sm text-[#F4F1EB]/75 leading-relaxed mb-6">
                {lang === "en" 
                  ? "Read selected Immersation publications directly inside the website. Enjoy a calm layout, night-reading support, adjustable typographic columns, and persistent paragraph bookmarks."
                  : "无需跳转，无需额外阅读硬件。我们为全体创始订阅者准备了安静、舒适的在线电子墨水阅读体验，包含页签记忆、舒适行距以及可随时呼出的正念呼吸音频组件。"}
              </p>

              <button 
                onClick={() => handleAction(() => {
                  if (onNavigateToReadingRoom) onNavigateToReadingRoom("starter-kit");
                })}
                className="bg-[#B69A6B] hover:bg-white text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-sm transition-all shadow-sm cursor-pointer"
              >
                {lang === "en" ? "Enter Reading Room" : "开启在线沉浸翻阅"}
              </button>
            </div>

            {/* Right: Simulated Book Page Spreed mock-up */}
            <div className="lg:col-span-7 bg-white/5 rounded-md p-6 border border-white/10 backdrop-blur-md relative">
              <div className="flex justify-between items-center text-[9px] font-mono text-[#F4F1EB]/40 border-b border-white/5 pb-3 mb-6">
                <span>THE PERSONAL INTELLIGENCE SYSTEM</span>
                <span>PAGE {currentPage} OF {totalPages}</span>
              </div>

              {/* Book Spread */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif text-xs leading-relaxed text-[#F4F1EB]/80 min-h-[180px]">
                {currentPage === 1 ? (
                  <>
                    <div className="border-r border-white/5 pr-4">
                      <h4 className="text-sm font-normal text-white mb-3">Chapter I: Cognitive Offloading</h4>
                      <p className="mb-3 opacity-80">The modern individual operates in a state of perpetual cognitive overload. Every uncaptured task, unfinished communication, and disorganized research brief serves as a slow, constant leak of mental energy.</p>
                      <p className="opacity-80">This phenomenon is described in neurology as the Zeigarnik Effect—our subconscious mind constantly circles incomplete loops, demanding processing power.</p>
                    </div>
                    <div>
                      <p className="mb-3 opacity-80">To achieve a state of calm high-performance, we must build systems that act as external caches. By offloading tasks instantly to highly predictable, structured repositories, we clear the biological CPU.</p>
                      <p className="opacity-80 font-display text-[9px] uppercase tracking-wider text-[#B69A6B] mt-4">“If you do not clear your mind, you cannot claim your focus.”</p>
                    </div>
                  </>
                ) : currentPage === 2 ? (
                  <>
                    <div className="border-r border-white/5 pr-4">
                      <h4 className="text-sm font-normal text-white mb-3">Chapter II: Systems over Hacks</h4>
                      <p className="mb-3 opacity-80">Fragmented productivity advice suggests that we can optimize our lives by chaining small 'hacks' together—a temporary meditation app, a strict calendar technique, or a trendy note layout.</p>
                      <p className="opacity-80">These hacks are doomed to disintegrate because they do not form a closed, systemic cycle. They operate in isolation.</p>
                    </div>
                    <div>
                      <p className="mb-3 opacity-80">An authentic personal system is cyclical. Sleep hygiene feeds the physical recovery necessary for deep morning cognitive work, which in turn designs the automated templates that run in the background.</p>
                      <p className="opacity-80">This frees up the quiet attention necessary to spot market cycles and compound capital safely.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-r border-white/5 pr-4">
                      <h4 className="text-sm font-normal text-white mb-3">Chapter III: The Leverage of Silence</h4>
                      <p className="mb-3 opacity-80">We define leverage as the multiplier of output over input. In the modern era, AI serves as the greatest structural leverage available to any single thinker.</p>
                      <p className="opacity-80">However, without a calm center, AI simply accelerates chaos. A fast generator of messy outputs is a hazard, not a leverage.</p>
                    </div>
                    <div>
                      <p className="mb-3 opacity-80">True leverage requires clarity of intent. We must use quiet parameters, highly deterministic instructions, and modular pipelines that treat the machine as a structured asset.</p>
                      <p className="opacity-80">Let the machine run the automation, so you can preserve your physical composure for long-term strategic reviews.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Book navigation */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 text-[#F4F1EB]/40">
                <button 
                  onClick={() => handleAction(() => setCurrentPage(prev => Math.max(1, prev - 1)))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[10px] font-display uppercase tracking-widest">{lang === "en" ? "PREVIOUS" : "上一页"}</span>
                </button>
                
                {/* Simplified page label replacing dots */}
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  {lang === "en" ? `PAGE ${currentPage} OF ${totalPages}` : `第 ${currentPage} 页，共 ${totalPages} 页`}
                </span>

                <button 
                  onClick={() => handleAction(() => setCurrentPage(prev => Math.min(3, prev + 1)))}
                  disabled={currentPage === 3}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="text-[10px] font-display uppercase tracking-widest">{lang === "en" ? "NEXT" : "下一页"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 6. Elegant CTA */}
        <div className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden" id="digital-pub-cta">
          <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-gradient-to-br from-[#B69A6B]/10 to-transparent rounded-full blur-xl"></div>
          <div className="relative z-10">
            <h2 className="font-serif text-3xl font-normal text-[#1A2F24] mb-4 ink-text">
              {lang === "en" ? "Build Your Digital Knowledge Library" : "建立您的终身数字智识资产库"}
            </h2>
            <p className="font-serif text-sm text-[#1C1C1C]/60 leading-relaxed mb-8 max-w-xl mx-auto">
              {lang === "en"
                ? "Start with the Personal Intelligence Starter Kit. Offload mental fatigue and design resilient workflows."
                : "从免费翻阅《个人智能系统启动指南》开始，彻底重组您的大脑、日常流程与资产底座。"}
            </p>
            <button
              onClick={() => handleAction(() => {
                if (onNavigateToReadingRoom) onNavigateToReadingRoom("starter-kit");
              })}
              className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm cursor-pointer inline-block"
            >
              {lang === "en" ? "Download Starter Kit" : "立即下载首发工具包"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
