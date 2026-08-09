import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { subscribeToSendfox } from "../lib/sendfox";
import { supabase } from "../lib/supabase";
import { defaultArticles, Article } from "../articlesData";
import { 
  ArrowLeft, 
  Coins, 
  TrendingUp, 
  Percent, 
  Compass, 
  Scale, 
  AlertTriangle, 
  Lock, 
  Download, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Check,
  Clock
} from "lucide-react";

interface WealthPillarViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onNavigateToNewsletter?: () => void;
  onNavigateToArticle?: (slug: string) => void;
  articles?: any[];
}

export default function WealthPillarView({ 
  lang, 
  onBackToHome, 
  onPlayChime,
  onNavigateToNewsletter,
  onNavigateToArticle,
  articles
}: WealthPillarViewProps) {
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["capital"]);
  const [selectedCycle, setSelectedCycle] = useState<"accumulation" | "preservation" | "distribution">("accumulation");

  // Filter dynamic published articles for capital pillar
  const capitalArticles = [...(articles || defaultArticles)]
    .filter((a) => a.pillar === "capital" && a.published !== false)
    .sort((a, b) => {
      const dateA = a.date?.en ? new Date(a.date.en).getTime() : new Date(a.created_at || "2000-01-01").getTime();
      const dateB = b.date?.en ? new Date(b.date.en).getTime() : new Date(b.created_at || "2000-01-01").getTime();
      return dateB - dateA;
    })
    .slice(0, 2);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subEmail.trim()) {
      const email = subEmail.trim();
      const success = await subscribeToSendfox(email, { tags: subInterests });
      if (success) {
        setIsSubscribed(true);
        setSubEmail("");
        if (onPlayChime) onPlayChime();
        if (supabase) {
          try {
            await supabase.from("newsletter_subscriptions").insert([{ email, tags: subInterests, subscribed_at: new Date().toISOString() }]);
          } catch(e) {}
        }
        setTimeout(() => setIsSubscribed(false), 6000);
      } else {
        alert(lang === "en" ? "Subscription failed. Please ensure your SendFox API key is correct." : "订阅失败，请检查您的 SendFox API 密钥。");
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  const topics = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-[#B69A6B]" />,
      title: { en: "Risk Management & Cognition", zh: "风险认知与管理" },
      desc: { 
        en: "Evaluate the consequences of unexpected risk. Balance your capital structures to absorb uncertainty without experiencing severe loss.", 
        zh: "审慎评估各类潜在风险。合理规划资产分布，确保在面对未知波动时，拥有充分的安全边际与回旋余地。" 
      }
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#B69A6B]" />,
      title: { en: "Market & Macro Cycles", zh: "市场周期与宏观潮汐" },
      desc: { 
        en: "Align your financial positions with multi-year macro trends. Avoid fighting structural market tides and long-term economic shifts.", 
        zh: "将你的长线规划及商业重心与宏观大周期合理咬合。顺应结构性的趋势与历史规律，实现温和增长。" 
      }
    },
    {
      icon: <Percent className="w-5 h-5 text-[#B69A6B]" />,
      title: { en: "Compounding Mechanics", zh: "长期复利底层机制" },
      desc: { 
        en: "Reduce emotional trading friction. Build calm, structured, index-based and business-equity-driven wealth accumulation channels.", 
        zh: "减少因情绪波动而产生的高频交易磨损。构建安宁、稳健的资产累积逻辑，享受时间沉淀带来的复利价值。" 
      }
    },
    {
      icon: <Scale className="w-5 h-5 text-[#B69A6B]" />,
      title: { en: "Asset Allocation Architectures", zh: "资产配置与管理架构" },
      desc: { 
        en: "Diversify across complementary asset classes. Match your liquidity profile with your real-world lifestyle and cash requirements.", 
        zh: "将资金分布在不同物理领域的互补品类中，实现良性对冲。确保流动性周期与你日常生活的资金需要精确匹配。" 
      }
    },
    {
      icon: <Compass className="w-5 h-5 text-[#B69A6B]" />,
      title: { en: "Capital Mindsets & Valuation", zh: "理性资本思维与常识" },
      desc: { 
        en: "Value assets by their tangible cash flow realities. Strip away speculative hype and short-term market noise.", 
        zh: "坚持以实际产生的现金流与业务真实价值为准绳来审视资产。过滤市场炒作与噪音，保持客观敏锐的判断。" 
      }
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#B69A6B]" />,
      title: { en: "Value Accrual Preservation", zh: "长期价值留存" },
      desc: { 
        en: "Shield accrued capital from purchasing power degradation, currency inflation, and market volatility.", 
        zh: "守护多年累积的劳动成果，对冲通胀带来的购买力侵蚀。优化长线结构，实现真实价值的稳定流传。" 
      }
    }
  ];

  const cycleData = {
    accumulation: {
      title: { en: "Accumulation Phase", zh: "积累阶段" },
      focus: { en: "Monetizing high-value skills + Low personal overhead + Business equity", zh: "高价值技能变现 + 理性克制的消费观 + 商业股权沉淀" },
      advice: { en: "Focus entirely on expanding personal leverage via AI and establishing durable cash-flowing operations.", zh: "利用 AI 自动化极大拓展个人杠杆，全力确立能产生正向现金流的持久业务形态。" }
    },
    preservation: {
      title: { en: "Preservation Phase", zh: "合理留存阶段" },
      focus: { en: "Uncorrelated asset placement + Liquidity buffers + Balanced physical assets", zh: "跨领域互不关联资产的分散配置 + 宽裕流动资金缓冲 + 稳健实体资产" },
      advice: { en: "The primary objective is preventing major drawdown. Avoid high-risk speculative trends or complex leverage products.", zh: "此时的首要任务是避免不必要的重大回撤。保持清醒，规避高杠杆与过度炒作，护持累积的胜利果实。" }
    },
    distribution: {
      title: { en: "Distribution Phase", zh: "流转释放阶段" },
      focus: { en: "Generational trusts + Philanthropy + Somatic longevity support", zh: "家族信托流转 + 社会责任反哺 + 身体健康与长寿资源投入" },
      advice: { en: "Convert capital into systemic, long-term educational foundations and peace of mind. Capital returns to purpose.", zh: "将资本转换为系统性的教育养分与长寿探索，获得心灵的宁静。让财富回归其最初的健康使命。" }
    }
  };

  const toolkits = [
    {
      title: { en: "The Calm Investor's Asset Ledger", zh: "宁静投资者专属资产管理总账" },
      type: "INTERACTIVE EXCEL SHEET & MATRIX GUIDE",
      price: "$22.00",
      desc: { 
        en: "A robust capital ledger configured to calculate real-time asset balance fluctuations and run risk-simulation scenarios.", 
        zh: "一款精细的资产负债计算工具。自动测算全球资产汇率波动对实际净值的影响，并内置温和的安全边界测试。" 
      }
    },
    {
      title: { en: "Compounding & Macro Tide Guidebook", zh: "宏观周期与资产留存指南" },
      type: "PDF COMPREHENSIVE PROTOCOLS",
      price: "$27.00",
      desc: { 
        en: "A comprehensive deep dive mapping historical currency cycles, inflation shields, and specific capital preservation models.", 
        zh: "一部关于法币历史周期演变、购买力对冲的深度说明书。梳理宏观起落中的资产稳态与价值留存经验。" 
      }
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#F4F1EB] min-h-screen py-24 relative overflow-hidden" 
      id="wealth-pillar-view"
    >
      {/* Visual background lines representing clean grids */}
      <div className="absolute top-[5%] left-[-15%] w-[600px] h-[600px] bg-[#E8DDCF]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] bg-[#B69A6B]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <motion.div variants={itemVariants} className="mb-12" id="wealth-breadcrumb">
          <button 
            onClick={() => {
              if (onPlayChime) onPlayChime();
              onBackToHome();
            }}
            className="group inline-flex items-center gap-2.5 font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] hover:text-[#1A2F24] transition-colors duration-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            {lang === "en" ? "Back to Core Hub" : "折返智枢主系统"}
          </button>
        </motion.div>

        {/* PROMINENT FINANCIAL DISCLAIMER (REQUIRED FOR WEALTH PILLARS) */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#E8DDCF]/40 border-l-[3px] border-[#B69A6B] p-5 mb-14 rounded-r-sm flex items-start gap-4"
          id="prominent-disclaimer"
        >
          <AlertTriangle className="w-5 h-5 text-[#B69A6B] shrink-0 mt-0.5" />
          <div>
            <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[#1A2F24] block mb-1">
              {lang === "en" ? "EDUCATIONAL AND COGNITIVE FRAMEWORKS ONLY" : "知识传播与心智构筑申明（非财务投资建议）"}
            </span>
            <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
              {lang === "en"
                ? "All content presented under the Wealth Cognition pillar is created strictly for philosophical and educational purposes. Immersation does not act as an investment advisor or offer specific financial suggestions. Please consult a licensed professional before committing capital."
                : "本栏目所涉及之关于复利、周期、风险及资产切分的全部文字与资产模型，均属于学术探讨和心智底座构筑之范畴。智枢阁不提供具体的开户、荐股或任何投资导向。市场有风险，注资需独立研判、严谨决策。"}
            </p>
          </div>
        </motion.div>

        {/* HERO SECTION */}
        <div className="border-b border-[#D8D2C6]/50 pb-16 mb-20" id="wealth-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4" id="wealth-badge">
                <Coins className="w-4 h-4 text-[#B69A6B]" />
                <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#B69A6B]">
                  {lang === "en" ? "THE CAPITAL PILLAR OF IMMERSATION" : "资 ｜ IMMERSATION 核心支柱之一"}
                </span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6"
              >
                {lang === "en" ? "Wealth Cognition" : "财富认知"}
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-2xl"
              >
                {lang === "en" 
                  ? "Long-term capital judgment for risk, value, and time."
                  : "针对风险、价值与时间的长期资本判断力。"}
              </motion.p>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <motion.div 
                variants={itemVariants}
                className="w-full max-w-[280px] aspect-square rounded-full border border-[#D8D2C6] bg-white/40 flex items-center justify-center relative group p-6 shadow-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#E8DDCF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="text-center relative z-10 flex flex-col items-center">
                  <Coins className="w-8 h-8 text-[#B69A6B] mb-3 stroke-[1.25]" />
                  <span className="font-display text-[10px] font-bold tracking-[0.25em] text-[#1C1C1C]/40 uppercase block mb-1">CAPITAL LAYER</span>
                  <span className="font-serif italic text-xs text-[#1C1C1C]/70">The Economic Core</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* SECTION 1 & 2: WHY WEALTH BEGINS WITH JUDGMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-[#D8D2C6]/50 mb-20" id="wealth-philosophy">
          <div className="lg:col-span-5">
            <motion.span variants={itemVariants} className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              01 / THE COGNITIVE ALIGNMENT
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-2xl sm:text-3xl text-[#1A2F24] leading-tight"
            >
              {lang === "en" 
                ? "Why Wealth Begins with Judgment" 
                : "为什么财富大厦起源于“宁静的审判力”？"}
            </motion.h2>
            <div className="w-12 h-[2px] bg-[#8B5A44] mt-4"></div>
          </div>

          <div className="lg:col-span-7 font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-6">
            <motion.p variants={itemVariants}>
              {lang === "en"
                ? "Most individuals do not lose money because they lack information. They lose money because they lack peace of mind. Succumbing to FOMO, chasing the volatile peaks of speculative internet tokens, and trading based on high-frequency panic is simply biological survival instincts misfired in the market."
                : "绝大多数人在市场中折损资本，绝不是因为缺乏一手资讯，而是因为内心丧失了安静。在群体性狂热（FOMO）面前缴械、去盲目高空接盘本无任何底层价值支撑的概念资产、因为短线波动反复陷入惊恐和割肉——这实质上是远古人类求生时的生理应激反应在资本市场的错位投射。"}
            </motion.p>
            <motion.p variants={itemVariants}>
              {lang === "en"
                ? "At Immersation, we decouple capital cognition from speculation. We study historical cycles, asset-class correlations, tail-risk defenses, and valuation fundamentals. When you align your financial allocations with your personal operating system, you buy the right assets at the right price, and then you do the hardest thing in investing: you wait."
                : "在智枢阁，我们将“资本认知”与“短线投机”彻底剥离开来。我们沉着研究一个世纪以来的宏观长周期起落、资产关联抗震性、以及返璞归真的价值估值本质。当你的财务框架与你的身心稳态高度契合，你才能在极具复利的点位锚定资产，并执行整个投资历程中最难的一步：安静等待。"}
            </motion.p>
          </div>
        </div>

        {/* SECTION 3: KEY TOPICS GRID */}
        <div className="mb-24" id="wealth-topics">
          <div className="text-center max-w-xl mx-auto mb-16">
            <motion.span variants={itemVariants} className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              02 / CAPITAL DOMAINS
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-2xl sm:text-3xl text-[#1A2F24]"
            >
              {lang === "en" ? "Wealth Cognition Core Domains" : "六大资本安全与防御构件"}
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white/40 border border-[#D8D2C6]/60 hover:border-[#1A2F24] rounded-sm p-8 transition-all duration-300 hover:shadow-md flex flex-col justify-between group h-64"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-white border border-[#D8D2C6]/60 flex items-center justify-center mb-6 group-hover:border-[#B69A6B] transition-colors">
                    {topic.icon}
                  </div>
                  <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
                    {topic.title[lang]}
                  </h3>
                  <p className="font-sans text-xs text-[#1C1C1C]/70 leading-relaxed">
                    {topic.desc[lang]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 5: CAPITAL PHASES (INTERACTIVE TAB) */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="wealth-phases-interactive">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left sidebar: Tabs switcher */}
            <div className="lg:col-span-4">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
                03 / INTERACTIVE PROTOCOLS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24] mb-6">
                {lang === "en" ? "Capital Generation Lifecycle" : "资本生命周期重组规划"}
              </h2>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60 leading-relaxed mb-8">
                {lang === "en" 
                  ? "Where do you currently stand in your capital journey? Select your phase to explore the uncompromised cognitive priorities." 
                  : "审视你目前在资本链条中所处的生态位置。选择对应阶段，调阅绝不容许妥协的策略防守点。"}
              </p>

              <div className="flex flex-col gap-2.5">
                {(Object.keys(cycleData) as Array<keyof typeof cycleData>).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (onPlayChime) onPlayChime();
                      setSelectedCycle(key);
                    }}
                    className={`text-left font-display text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-sm transition-all duration-300 flex items-center justify-between border ${
                      selectedCycle === key 
                        ? "bg-[#1A2F24] text-[#F4F1EB] border-[#1A2F24]" 
                        : "bg-white/40 border-[#D8D2C6] text-[#1C1C1C]/75 hover:bg-white/70"
                    }`}
                  >
                    <span>{cycleData[key].title[lang]}</span>
                    <Check className={`w-3.5 h-3.5 text-[#B69A6B] transition-opacity ${selectedCycle === key ? "opacity-100" : "opacity-0"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Content details */}
            <div className="lg:col-span-8 bg-white/40 border border-[#D8D2C6] rounded-sm p-8 md:p-10 min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="border-b border-[#D8D2C6]/40 pb-4 mb-8 flex justify-between items-center">
                  <span className="font-mono text-[9px] text-[#8B5A44] tracking-widest uppercase">COGNITIVE BLUEPRINT</span>
                  <span className="font-mono text-[9px] text-[#1C1C1C]/40 uppercase">ACTIVE_STRATEGY: {selectedCycle}</span>
                </div>

                <div className="mb-6">
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#B69A6B] block mb-2">PRIMARY STRATEGIC FOCUS</span>
                  <p className="font-serif text-lg text-[#1A2F24] leading-relaxed">
                    {cycleData[selectedCycle].focus[lang]}
                  </p>
                </div>

                <div>
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/40 block mb-2">IMMERSATION ACTIONABLE ADVICE</span>
                  <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed">
                    {cycleData[selectedCycle].advice[lang]}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#D8D2C6]/30 pt-6 mt-8 flex justify-between items-center">
                <span className="font-serif italic text-xs text-[#1C1C1C]/40">Align your somatic hardware before deploying capital.</span>
                <span className="font-mono text-[8px] text-[#8B5A44]">CYCLE_ALIGN: 100%</span>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: FEATURED ARTICLES */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="wealth-articles">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
                04 / INTELLECTUAL NOTES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
                {lang === "en" ? "Featured Capital Articles" : "精选资本智能论述"}
              </h2>
            </div>
            
            <button 
              onClick={() => onNavigateToArticle ? onNavigateToArticle("") : (onNavigateToNewsletter && onNavigateToNewsletter())}
              className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] hover:text-[#1A2F24] flex items-center gap-1.5 transition-colors"
            >
              {lang === "en" ? "View Archive" : "浏览全部期刊档案"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {capitalArticles.map((article) => {
              const artTitle = article.title[lang] || article.title.en;
              const artExcerpt = article.excerpt[lang] || article.excerpt.en;
              const artCategory = article.category ? (article.category[lang] || article.category.en) : "CAPITAL";
              const artDate = article.date ? (article.date[lang] || article.date.en) : "";
              const artReadTime = article.readTime ? (article.readTime[lang] || article.readTime.en) : "";

              return (
                <div 
                  key={article.id || article.slug}
                  className="bg-white/40 border border-[#D8D2C6]/60 rounded-sm p-8 flex flex-col justify-between hover:border-[#1A2F24] transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-display text-[9px] uppercase font-bold tracking-wider text-[#8B5A44] bg-[#8B5A44]/10 px-2 py-0.5 rounded-xs">
                        {artCategory}
                      </span>
                      {artReadTime && (
                        <span className="font-mono text-[9px] text-[#1C1C1C]/50 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8B5A44]" />
                          {artReadTime}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-normal text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors mb-3 leading-snug">
                      {artTitle}
                    </h3>

                    <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-6 line-clamp-3">
                      {artExcerpt}
                    </p>
                  </div>

                  <div className="border-t border-[#D8D2C6]/30 pt-4 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#1C1C1C]/40">
                      {artDate}
                    </span>

                    <button 
                      onClick={() => onNavigateToArticle ? onNavigateToArticle(article.slug || article.id) : (onNavigateToNewsletter && onNavigateToNewsletter())}
                      className="font-display text-[10px] uppercase font-bold tracking-widest text-[#1A2F24] group-hover:text-[#8B5A44] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {lang === "en" ? "READ DETAILED NOTE" : "阅读整期长文"} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: FRAMEWORKS SHOP */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="wealth-toolkits">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              05 / DIGITAL PUBLISHING
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
              {lang === "en" ? "Capital Ledgers & Defensive Frameworks" : "理财认知与资本防御工具包"}
            </h2>
            <p className="font-serif text-xs text-[#1C1C1C]/60 mt-2">
              {lang === "en" 
                ? "Immediate download access to mathematical calculation tools and asset allocations scripts." 
                : "一键调阅严密、无利益捆绑的纯净理财底账框架与防震模拟表。"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {toolkits.map((kit, idx) => (
              <div 
                key={idx}
                className="border border-[#D8D2C6] rounded-sm bg-[#E8DDCF]/35 p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#1A2F24] transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[9px] text-[#8B5A44] tracking-widest uppercase">{kit.type}</span>
                    <span className="font-display text-sm font-bold text-[#1A2F24] bg-white px-2.5 py-1 rounded-sm border border-[#D8D2C6]/60">{kit.price}</span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-[#1A2F24] mb-3">
                    {kit.title[lang]}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-6">
                    {kit.desc[lang]}
                  </p>
                </div>

                <div className="border-t border-[#D8D2C6]/40 pt-4 flex flex-wrap justify-between items-center gap-4">
                  <span className="font-mono text-[8px] text-[#1C1C1C]/40 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#8B5A44]" /> SECURE DIGITAL CHECKOUT
                  </span>
                  
                  <button 
                    onClick={() => {
                      if (onPlayChime) onPlayChime();
                      alert(lang === "en" 
                        ? "Checkout pipeline initialized. Digital shop integration is secure." 
                        : "结算管道已启动。数字小铺通道安全。");
                    }}
                    className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-[10px] uppercase font-bold tracking-[0.15em] px-5 py-2.5 rounded-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {lang === "en" ? "Purchase & Download" : "获取下载凭证"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: NEWSLETTER CTA */}
        <div className="newsletter-container-box rounded-sm overflow-hidden" id="subscribe-cta-section">
          <div className="bg-[#1A2F24] text-[#F4F1EB] p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#F4F1EB]" fill="currentColor">
                <path d="M10,90 Q30,60 15,30 Q35,50 40,90 Z" />
                <path d="M50,90 Q65,40 50,10 Q70,30 80,90 Z" />
              </svg>
            </div>

            <div className="relative z-10 max-w-xl">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#B69A6B] block mb-3">
                {lang === "en" ? "COMPOUND CALMLY" : "安静复利"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-3">
                {lang === "en" ? "Subscribe for Capital Cognition Briefings" : "订阅智枢阁财富与资本认知邮件"}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-white/70 leading-relaxed">
                {lang === "en"
                  ? "Join our quiet digital publishing circle. We share deep research articles dissecting inflation trends, multi-generational wealth vehicles, and long-wave cycles."
                  : "订阅智枢阁资物栏目。我们不卖课、不拉群。只为你安静复现大资本如何沉着过冬、隐秘家族如何排布避险资产、以及如何以极高定力审判周期的常识规律。"}
              </p>
            </div>

            <div className="w-full lg:w-auto relative z-10 flex flex-col sm:flex-row items-center gap-3">
              {isSubscribed ? (
                <div className="bg-white/10 border border-[#B69A6B] text-[#F4F1EB] px-6 py-4 rounded-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#B69A6B]" />
                  <span className="font-serif text-xs">
                    {lang === "en" ? "Capital Beacon connection established successfully." : "资本系统澄澈信标订阅成功。"}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="flex flex-col gap-4 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <input 
                      type="email" 
                      placeholder={lang === "en" ? "Enter your email..." : "输入你的邮箱..."}
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      required
                      className="bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-[#B69A6B] focus:outline-none text-white text-xs px-5 py-4 rounded-sm font-sans placeholder-white/40 w-full sm:w-[240px]"
                    />
                    <button 
                      type="submit"
                      className="bg-[#B69A6B] hover:bg-white hover:text-[#1A2F24] text-white font-display text-[10px] font-bold uppercase tracking-[0.25em] px-8 py-4 rounded-sm transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto"
                    >
                      {lang === "en" ? "SUBSCRIBE" : "加入智枢"}
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-left">
                    <span className="font-display text-[9px] uppercase tracking-wider text-white/50">
                      {lang === "en" ? "Also interested in? (optional)" : "还对什么感兴趣？（可选）"}
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
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
