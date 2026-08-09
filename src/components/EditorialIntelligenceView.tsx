import React, { useState } from "react";
import { subscribeToSendfox } from "../lib/sendfox";
import { 
  ArrowLeft, 
  BookOpen, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Feather, 
  Compass, 
  HelpCircle,
  Clock,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

interface EditorialIntelligenceViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onNavigateToNewsletter?: () => void;
  onNavigateToArticles?: (slug?: string) => void;
  articles?: any[];
  newsletterIssues?: any[];
}

export default function EditorialIntelligenceView({
  lang,
  onBackToHome,
  onPlayChime,
  onNavigateToNewsletter,
  onNavigateToArticles,
  articles = [],
  newsletterIssues = []
}: EditorialIntelligenceViewProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleAction = (cb?: () => void) => {
    if (onPlayChime) onPlayChime();
    if (cb) cb();
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      const emailToSubscribe = email.trim();
      handleAction(async () => {
        const success = await subscribeToSendfox(emailToSubscribe, { tags: ["editorial"] });
        if (success) {
          setSubscribed(true);
          setEmail("");
        } else {
          alert(lang === "en" ? "Subscription failed. Please try again." : "订阅失败，请重试。");
        }
      });
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

  // 3 Latest articles
  const latestArticles = articles.slice(0, 4).map(a => ({
    id: a.id || a.slug || `art-${Math.random()}`,
    slug: a.slug || a.id,
    pillar: typeof a.pillar === 'object' ? a.pillar : { en: (a.pillar || "GENERAL").toUpperCase(), zh: (a.pillar || "GENERAL").toUpperCase() },
    title: ensureBilingual(a.title, "Untitled Essay", "无题文章"),
    description: ensureBilingual(a.description || a.excerpt, "", ""),
    readTime: ensureBilingual(a.readTime, "5 MIN READ", "阅读时间 5 分钟"),
    date: typeof a.date === "object" ? (a.date[lang] || a.date.en || "2026.07.09") : (a.date || "2026.07.09")
  }));

  // Latest Newsletter Issue
  const fallbackNewsletter = {
    issue: "ISSUE #042",
    date: "July 2026",
    title: {
      en: "Signal Multipliers & System Stress",
      zh: "高信噪比乘数与系统承载力"
    },
    excerpt: {
      en: "In this issue, we dissect the absolute math behind focus. Why adding one additional distraction channel doesn't just add linear noise, but exponentially degrades your decision latency...",
      zh: "在本期信札中，我们从数学和脑电生理的角度解构专注。分析为什么多增加一个零碎的通知源，不只是增加线性干扰，而是以指数级衰减了我们的认知决策速度……"
    }
  };
  const latestNewsletterSource = newsletterIssues.length > 0 ? newsletterIssues[0] : null;
  const latestNewsletter = latestNewsletterSource ? {
    issue: latestNewsletterSource.issue || "LATEST",
    date: typeof latestNewsletterSource.date === "object" ? (latestNewsletterSource.date[lang] || latestNewsletterSource.date.en || "July 2026") : (latestNewsletterSource.date || "July 2026"),
    title: ensureBilingual(latestNewsletterSource.title, "Untitled Newsletter", "未命名信札"),
    excerpt: ensureBilingual(latestNewsletterSource.excerpt, "", "")
  } : fallbackNewsletter;

  // Find the newest content between the latest article and the latest newsletter
  const newestItem = (() => {
    const art = articles && articles[0];
    const news = newsletterIssues && newsletterIssues[0];
    if (!art && !news) return null;
    if (art && !news) return { type: "article", raw: art };
    if (!art && news) return { type: "newsletter", raw: news };

    const getTimestamp = (item: any) => {
      if (item.created_at) return new Date(item.created_at).getTime();
      const dateVal = typeof item.date === "object" ? (item.date.en || item.date) : item.date;
      if (dateVal) {
        const ts = Date.parse(String(dateVal).replace(/\./g, "-"));
        if (!isNaN(ts)) return ts;
      }
      return 0;
    };

    const artTs = getTimestamp(art);
    const newsTs = getTimestamp(news);
    if (artTs >= newsTs) {
      return { type: "article", raw: art };
    } else {
      return { type: "newsletter", raw: news };
    }
  })();

  const dynamicHeroContent = newestItem ? {
    type: newestItem.type,
    title: ensureBilingual(newestItem.raw.title, "Untitled", "未命名"),
    pillar: newestItem.type === "article" 
      ? (typeof newestItem.raw.pillar === 'object' ? newestItem.raw.pillar : { en: String(newestItem.raw.pillar || "GENERAL").toUpperCase(), zh: String(newestItem.raw.pillar || "GENERAL").toUpperCase() })
      : { en: "NEWSLETTER", zh: "智枢信札" },
    date: newestItem.type === "article"
      ? (typeof newestItem.raw.date === "object" ? (newestItem.raw.date[lang] || newestItem.raw.date.en || "2026.07.09") : (newestItem.raw.date || "2026.07.09"))
      : (typeof newestItem.raw.date === "object" ? (newestItem.raw.date[lang] || newestItem.raw.date.en || "July 2026") : (newestItem.raw.date || "July 2026")),
    slug: newestItem.raw.slug || newestItem.raw.id
  } : null;

  const handleHeroClick = () => {
    if (dynamicHeroContent) {
      if (dynamicHeroContent.type === "article") {
        if (onNavigateToArticles) onNavigateToArticles(dynamicHeroContent.slug);
      } else {
        if (onNavigateToNewsletter) onNavigateToNewsletter();
      }
    } else {
      if (onNavigateToArticles) onNavigateToArticles();
    }
  };

  const getPillarColors = (pillarEn: string) => {
    const p = String(pillarEn).trim().toUpperCase();
    if (p === "BODY") return { hex: "#8B5A44", bg: "bg-[#8B5A44]/10", border: "border-[#8B5A44]", text: "text-[#8B5A44]" };
    if (p === "TOOL") return { hex: "#B69A6B", bg: "bg-[#B69A6B]/10", border: "border-[#B69A6B]", text: "text-[#B69A6B]" };
    if (p === "CAPITAL") return { hex: "#1A2F24", bg: "bg-[#1A2F24]/10", border: "border-[#1A2F24]", text: "text-[#1A2F24]" };
    return { hex: "#8B5A44", bg: "bg-[#8B5A44]/10", border: "border-[#8B5A44]", text: "text-[#8B5A44]" };
  };

  return (
    <div className="bg-[#F4F1EB] min-h-screen text-[#1C1C1C] selection:bg-[#8B5A44]/10 selection:text-[#8B5A44] pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Editorial grid paper textures in background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" id="editorial-grid-bg">
        <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#1C1C1C 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => handleAction(onBackToHome)}
          className="flex items-center gap-2 group text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors mb-12 cursor-pointer"
          id="editorial-back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{lang === "en" ? "Back to Chamber" : "返回主页"}</span>
        </button>

        {/* 1. Hero Masthead (Layout: Left content, Right minimal paper stack visual) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 border-b border-[#D8D2C6]/50 pb-16" id="editorial-hero">
          
          {/* Left Text */}
          <div className="lg:col-span-7">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] bg-[#8B5A44]/10 px-2.5 py-1.5 rounded-sm inline-block mb-4">
              {lang === "en" ? "PUBLISHING LAYER" : "智枢阁 · 核心出版层"}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6 ink-text">
              {lang === "en" ? "Editorial Intelligence" : "编辑型智能内容"}
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-xl">
              {lang === "en" 
                ? "Articles and newsletters for future-ready individuals. Immersation’s Editorial Intelligence is the ongoing publishing layer of the brand — calm, structured writing across Mindfulness Health & Longevity, AI Automation, and Wealth Cognition."
                : "面向未来个体的文章与信札。智枢阁的 Editorial Intelligence 是品牌的持续出版层，围绕正念健康与长寿管理、AI 自动化与财富认知，发布安静、结构化、可长期复用的文章与信札内容。"}
            </p>
          </div>

          {/* Right Minimal Paper Stack Visual (Dynamic or Fallback) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end py-10 relative animate-fade-in" id="editorial-hero-visual">
            <div className="relative w-64 h-80 flex items-center justify-center">
              
              {/* Back Card */}
              <div className="absolute w-56 h-72 bg-[#D8D2C6]/20 border border-[#D8D2C6]/30 rounded-sm shadow-md transform -rotate-12 translate-x-8 translate-y-3 opacity-40"></div>
              
              {/* Middle Card */}
              <div className="absolute w-56 h-72 bg-white/60 border border-[#D8D2C6]/40 rounded-sm shadow-lg transform rotate-6 -translate-x-6 -translate-y-1 opacity-70"></div>
              
              {/* Front Card */}
              <div 
                onClick={handleHeroClick}
                className="absolute w-56 h-72 bg-white text-[#1C1C1C] border border-[#D8D2C6] rounded-sm shadow-xl transform -rotate-2 hover:rotate-0 transition-all hover:scale-[1.03] duration-500 z-10 p-5 flex flex-col justify-between cursor-pointer"
              >
                {/* Margin Line */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B5A44]/15"></div>
                
                <div className="pl-3 h-full flex flex-col justify-between font-serif">
                  <div>
                    <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-[#8B5A44] mb-3">
                      <span className="uppercase">{dynamicHeroContent ? (dynamicHeroContent.pillar[lang] || dynamicHeroContent.pillar.en) : "PUBLISHED WEEKLY"}</span>
                      <span>{dynamicHeroContent ? dynamicHeroContent.date : "ISSN 2026-07"}</span>
                    </div>
                    <h3 className="text-sm sm:text-base text-[#1A2F24] font-normal tracking-wide leading-snug mb-2 font-serif line-clamp-3">
                      {dynamicHeroContent ? dynamicHeroContent.title[lang] : (lang === "en" ? "The Quiet Signal Ledger" : "安静信识备忘录")}
                    </h3>
                    <div className="w-10 h-px bg-[#D8D2C6] my-3"></div>
                    <p className="text-[10px] text-[#1C1C1C]/60 leading-relaxed italic line-clamp-4">
                      {dynamicHeroContent ? (
                        newestItem?.type === "article" 
                          ? ensureBilingual(newestItem.raw.description || newestItem.raw.excerpt, "Click to read this featured article in the archive.", "点击在此处浏览此精选文章。")[lang]
                          : ensureBilingual(newestItem.raw.excerpt, "Click to read this featured newsletter issue.", "点击在此处浏览此精选信札。")[lang]
                      ) : (
                        lang === "en" 
                          ? "“In a world of explosive hyper-stimulants, physical silence combined with technical automation is the ultimate compound multiplier.”"
                          : "“在充满极端感官刺激的世界中，身体的寂静与技术自动化的精密融合，将产生至高无上的复利效应。”"
                      )}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center text-[8px] font-mono text-[#1C1C1C]/40 pt-4 border-t border-[#D8D2C6]/30">
                    <span>{dynamicHeroContent ? (dynamicHeroContent.type === "article" ? "READ ESSAY" : "READ ISSUE") : "VOL. I NO. XII"}</span>
                    <span>IMMERSATION PRESS</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 2. Two-Path Content Gateway */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24" id="editorial-two-path">
          
          {/* Card A: Articles */}
          <div className="bg-white/50 border border-[#D8D2C6] rounded-md p-8 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B5A44]"></div>
            <div>
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] block mb-4 mt-2">
                {lang === "en" ? "LONG-FORM ESSAYS" : "结构化长文"}
              </span>
              <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-4">
                {lang === "en" ? "Articles" : "深度文章"}
              </h2>
              <p className="font-serif text-sm text-[#1C1C1C]/70 leading-relaxed mb-8">
                {lang === "en" 
                  ? "Calm, structured long-form writing across body, tool, and capital. Hand-crafted analysis to optimize your system parameters." 
                  : "围绕身、器、财的结构化深度论述。拒绝泛泛空谈与浅层技巧，剖析现代高阶个体的心智与操作法则。"}
              </p>
            </div>
            
            <a 
              href="#articles"
              onClick={(e) => {
                e.preventDefault();
                handleAction(() => {
                  if (onNavigateToArticles) onNavigateToArticles();
                });
              }}
              className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] py-4 rounded-sm transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === "en" ? "Read Articles" : "阅读深度文章"}</span>
            </a>
          </div>

          {/* Card B: Newsletter */}
          <div className="bg-white/50 border border-[#D8D2C6] rounded-md p-8 hover-lift hover:border-[#B69A6B]/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B69A6B]"></div>
            <div>
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#B69A6B] block mb-4 mt-2">
                {lang === "en" ? "WEEKLY SIGNALS" : "每周定期信札"}
              </span>
              <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-4">
                {lang === "en" ? "Newsletter" : "智枢信札"}
              </h2>
              <p className="font-serif text-sm text-[#1C1C1C]/70 leading-relaxed mb-8">
                {lang === "en" 
                  ? "Clearer signals, curated insights, and editorial reflections delivered regularly directly to your primary inbox." 
                  : "定期接收清晰高频的系统论信号、精选心智洞察与前沿自动化复盘思考，直达您的邮箱。"}
              </p>
            </div>

            <button 
              onClick={() => handleAction(onNavigateToNewsletter)}
              className="w-full bg-[#1A2F24] hover:bg-[#B69A6B] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] py-4 rounded-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#F4F1EB]" />
              <span>{lang === "en" ? "Subscribe / View Newsletter" : "订阅信札 / 浏览最新"}</span>
            </button>
          </div>

        </div>

        {/* 3. Latest from Editorial Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24" id="editorial-latest-section">
          
          {/* Left: 3 latest articles */}
          <div className="lg:col-span-8">
            <h3 className="font-serif text-xl font-normal text-[#1A2F24] mb-6 flex items-center gap-2 pb-3 border-b border-[#D8D2C6]/50">
              <span className="w-2 h-2 rounded-full bg-[#8B5A44]"></span>
              <span>{lang === "en" ? "Latest Published Essays" : "最新深度文章"}</span>
            </h3>

            <div className="space-y-8">
              {latestArticles.map((art) => {
                const colors = getPillarColors(art.pillar.en);
                return (
                  <div 
                    key={art.id}
                    onClick={() => handleAction(() => {
                      if (onNavigateToArticles) onNavigateToArticles(art.slug);
                    })}
                    className={`group cursor-pointer bg-white/20 hover:bg-white/60 border-b border-[#D8D2C6]/40 border-l-2 ${colors.border} p-5 rounded-r-sm transition-all duration-300`}
                  >
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[#1C1C1C]/50 mb-3">
                      <span className={`${colors.text} font-bold tracking-wider`}>{art.pillar[lang]}</span>
                      <span>•</span>
                      <span>{art.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {art.readTime[lang]}
                      </span>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className={`w-10 h-10 shrink-0 rounded-sm ${colors.bg} border ${colors.border}/20 flex items-center justify-center ${colors.text}`}>
                        <BookOpen className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-serif text-lg font-normal text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors leading-snug mb-2">
                          {art.title[lang]}
                        </h4>
                        <p className="font-serif text-xs text-[#1C1C1C]/65 leading-relaxed">
                          {art.description[lang]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#8B5A44] opacity-0 group-hover:opacity-100 transition-opacity mt-4 pl-14 font-semibold uppercase tracking-wider">
                      <span>{lang === "en" ? "Read Essay" : "阅读全文"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Latest Newsletter Issue Spot */}
          <div className="lg:col-span-4">
            <h3 className="font-serif text-xl font-normal text-[#1A2F24] mb-6 flex items-center gap-2 pb-3 border-b border-[#D8D2C6]/50">
              <span className="w-2 h-2 rounded-full bg-[#B69A6B]"></span>
              <span>{lang === "en" ? "Latest Newsletter Issue" : "最新一期信札精选"}</span>
            </h3>

            <div className="bg-[#1A2F24] text-[#F4F1EB] rounded-md p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-[0.03] select-none pointer-events-none transform translate-x-6 translate-y-6">
                <Mail className="w-48 h-48" />
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-[#B69A6B] mb-4">
                <span>{latestNewsletter.issue}</span>
                <span>{latestNewsletter.date}</span>
              </div>

              <h4 className="font-serif text-base font-normal text-white mb-4">
                {latestNewsletter.title[lang]}
              </h4>

              <p className="font-serif text-xs text-[#F4F1EB]/70 leading-relaxed mb-6">
                {latestNewsletter.excerpt[lang]}
              </p>

              <button 
                onClick={() => handleAction(onNavigateToNewsletter)}
                className="w-full border border-[#B69A6B]/50 hover:border-[#B69A6B] text-[#B69A6B] hover:text-white font-display text-[10px] font-bold uppercase tracking-[0.2em] py-3 rounded-sm transition-colors text-center cursor-pointer"
              >
                {lang === "en" ? "Subscribe to Read Full Issue" : "订阅并阅读全文"}
              </button>
            </div>
          </div>

        </div>

        {/* 4. Editorial Principles (Asymmetric Layout) */}
        <div className="mb-24" id="editorial-principles">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              {lang === "en" ? "OUR COMPASS" : "出版基准"}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] tracking-tight ink-text">
              {lang === "en" ? "Editorial Principles" : "编辑出版原则与守则"}
            </h2>
            <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60 mt-2">
              {lang === "en" 
                ? "Every publication we release adheres strictly to our core mental checklist." 
                : "我们拒绝快餐式的效率碎屑，所有的撰写与出版均坚守如下三个心智规范。"}
            </p>
          </div>

          {/* Principle #1: Wide Callout with Pull-Quote treatment */}
          <div className="bg-white/60 border border-[#D8D2C6] rounded-sm p-8 md:p-12 mb-8 relative overflow-hidden" id="principle-depth-over-noise">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#8B5A44]"></div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4">
                <span className="font-mono text-xs text-[#8B5A44] font-bold block mb-2">01 / OUR MAIN CRITERION</span>
                <h3 className="font-serif text-2xl font-normal text-[#1A2F24] tracking-tight leading-snug">
                  {lang === "en" ? "Depth Over Noise" : "深度大于嘈杂"}
                </h3>
              </div>
              <div className="md:col-span-8 border-l border-[#D8D2C6]/60 pl-0 md:pl-8">
                <p className="font-serif text-base sm:text-lg text-[#1C1C1C] italic leading-relaxed mb-4">
                  {lang === "en"
                    ? "“We publish only when we have a high-signal, fully formed structured synthesis to contribute. No daily SEO fluff, no low-quality updates.”"
                    : "“唯有当内容具备足够的高信噪比、经历严苛的自我推敲并融汇成系统后，我们才会进行排版发布。杜绝碎片与低效杂音。”"}
                </p>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#1C1C1C]/40">
                  — {lang === "en" ? "IMMERSATION PUBLISHING DIRECTIVE" : "智枢阁核心编辑守则"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Principle #2 */}
            <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-sm p-8 relative hover:bg-white/60 transition-colors duration-300">
              <span className="font-mono text-xs text-[#8B5A44] font-bold block mb-4">02 / SYSTEMS OVER HACKS</span>
              <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
                {lang === "en" ? "Systems Over Hacks" : "系统大于捷径"}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/65 leading-relaxed">
                {lang === "en"
                  ? "We address root causes, sleep homeostasis, technical pipelines, and financial rules. We reject surface hacks that break within days."
                  : "我们着眼于事物的核心架构、睡眠神经机制、自动化的根本逻辑和跨周期的财富配置规律，鄙视几天便失效的雕虫小技。"}
              </p>
            </div>

            {/* Principle #3 */}
            <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-sm p-8 relative hover:bg-white/60 transition-colors duration-300">
              <span className="font-mono text-xs text-[#8B5A44] font-bold block mb-4">03 / LONG-TERM KNOWLEDGE ASSETS</span>
              <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
                {lang === "en" ? "Long-Term Assets" : "长期智识资产"}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/65 leading-relaxed">
                {lang === "en"
                  ? "Everything we write is designed to be timeless. A framework you read today should remain functionally applicable and profitable decades later."
                  : "我们交付的所有出版成果皆以数十年的生命周期为尺度。无论今天何时阅读，其核心的方法模型皆能对未来的您产生真实复利。"}
              </p>
            </div>
          </div>
        </div>

        {/* 5. CTA Section (Explore the Full Archive) */}
        <div className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 text-center max-w-3xl mx-auto" id="editorial-cta">
          <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
            {lang === "en" ? "EXPLORE ARCHIVES" : "研读智识档案"}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] tracking-tight mb-4 ink-text">
            {lang === "en" ? "Explore the Full Archive" : "检索与探索全部智识档案"}
          </h2>
          <p className="font-serif text-sm text-[#1C1C1C]/65 leading-relaxed mb-8 max-w-xl mx-auto">
            {lang === "en"
              ? "Delve into our complete library of calm, structured essays. Access key-value analyses on Mindfulness, AI workflows, and capital compounding."
              : "深入研读我们为您准备的全部结构化长文。无缝连接身、器、财三大核心支柱，寻找实现高效产出的长期高信噪比信号。"}
          </p>

          <button 
            onClick={() => handleAction(() => {
              if (onNavigateToArticles) onNavigateToArticles();
            })}
            className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === "en" ? "Browse Full Archive" : "浏览全部文章"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
