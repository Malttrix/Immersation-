import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Compass, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Activity, 
  Cpu, 
  Coins, 
  BookOpen, 
  Workflow, 
  Bookmark, 
  Volume2
} from "lucide-react";
import { aboutContent } from "../aboutData";

interface AboutViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
}

export default function AboutView({ lang, onBackToHome, onPlayChime }: AboutViewProps) {
  const content = aboutContent;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  // Maps pillars to icons
  const getPillarIcon = (id: string) => {
    switch (id) {
      case "about-body":
        return <Activity className="w-8 h-8 text-[#8B5A44]" />;
      case "about-tool":
        return <Cpu className="w-8 h-8 text-[#1A2F24]" />;
      case "about-capital":
        return <Coins className="w-8 h-8 text-[#B69A6B]" />;
      default:
        return <Compass className="w-8 h-8 text-[#1C1C1C]" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12 relative z-10"
      id="about-view-container"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={() => {
          if (onPlayChime) onPlayChime();
          onBackToHome();
        }}
        className="flex items-center gap-2 mb-10 px-5 py-2.5 rounded-full border border-[#D8D2C6] bg-white/40 text-[#1C1C1C]/75 hover:text-[#1C1C1C] hover:border-[#1A2F24] hover:bg-[#F4F1EB] transition-all duration-300 font-display text-xs font-semibold uppercase tracking-wider cursor-pointer"
        id="btn-back-home"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "en" ? "Return to Core Hub" : "折返智枢主系统"}
      </motion.button>

      {/* Hero Header Section */}
      <header className="mb-20 max-w-4xl" id="about-hero-header">
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4" id="about-badge-wrapper">
          <span className="w-2 h-2 rounded-full bg-[#8B5A44] animate-pulse"></span>
          <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44]">
            {content.hero.brandBadge[lang]}
          </span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants} 
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] text-[#1A2F24] tracking-tight mb-8"
          id="about-main-title"
        >
          {lang === "zh" ? "关于 Immersation｜智枢阁" : "About Immersation"}
          <span className="block text-xl sm:text-2xl md:text-3xl font-display font-medium text-[#8B5A44] tracking-wide mt-3 sm:mt-4 leading-tight">
            {content.hero.title[lang]}
          </span>
        </motion.h1>

        {/* Elegant Slogan Box */}
        <motion.div 
          variants={itemVariants}
          className="inline-block border-l-2 border-[#8B5A44] pl-6 my-6"
          id="about-slogan-box"
        >
          <span className="font-display text-sm sm:text-base font-semibold tracking-widest text-[#1A2F24] uppercase block">
            {content.hero.slogan[lang]}
          </span>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="font-serif text-base sm:text-lg text-[#1C1C1C]/80 leading-relaxed max-w-3xl ink-text"
          id="about-intro-paragraph"
        >
          {content.hero.intro[lang]}
        </motion.p>
      </header>

      {/* Name Origins Block - Side by Side Bento Grid */}
      <section className="mb-24" id="section-name-origins">
        <motion.div variants={itemVariants} className="mb-12 border-b border-[#D8D2C6]/60 pb-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24] tracking-tight">
            {lang === "en" ? "Nomenclature & Philosophy" : "品牌命名内涵与释义"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12" id="origins-grid">
          {/* Immersation (EN) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/40 border border-[#D8D2C6] rounded-sm p-8 sm:p-10 flex flex-col justify-between shadow-xs hover:border-[#1A2F24]/40 transition-all duration-500"
            id="origin-card-immersation"
          >
            <div>
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] block mb-2">
                {lang === "en" ? "BESPOKE NOMENCLATURE" : "专属命名释义"}
              </span>
              <h3 className="font-display text-2xl font-bold tracking-widest text-[#1A2F24] mb-4">
                IMMERSATION
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-8">
                {content.immersationOrigin.summary[lang]}
              </p>

              <div className="space-y-6" id="immersation-parts-list">
                {content.immersationOrigin.parts.map((part) => (
                  <div key={part.key} className="flex gap-4 items-start" id={`part-${part.key}`}>
                    <div className="bg-[#1A2F24]/5 rounded-sm px-3 py-1 font-mono text-xs font-bold text-[#1A2F24]">
                      {part.key}
                    </div>
                    <div>
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">
                        {part.label[lang]}
                      </h4>
                      <p className="font-sans text-xs text-[#1C1C1C]/70 leading-relaxed mt-1">
                        {part.meaning[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#D8D2C6]/40 pt-6 mt-8 flex items-center gap-2" id="immersation-origin-footer">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A2F24]"></span>
              <span className="font-serif italic text-xs text-[#8B5A44]">
                {lang === "en" ? "Immersion + Sensation = Systems Conscious Alignment" : "深度沉浸 + 觉知感知 = 心智系统的自适应对齐"}
              </span>
            </div>
          </motion.div>

          {/* 智枢阁 (ZH) */}
          <motion.div 
            variants={itemVariants}
            className="bg-[#1A2F24] text-[#F4F1EB] rounded-sm p-8 sm:p-10 flex flex-col justify-between shadow-md"
            id="origin-card-zhisu"
          >
            <div>
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#B69A6B] block mb-2">
                {lang === "en" ? "ORIENTAL EXPRESSION" : "东方语境表达"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-[#F4F1EB] mb-4">
                智枢阁
              </h3>
              <p className="font-serif text-xs sm:text-sm text-[#F4F1EB]/80 leading-relaxed mb-8">
                {content.zhisuOrigin.summary[lang]}
              </p>

              <div className="space-y-6" id="zhisu-parts-list">
                {content.zhisuOrigin.parts.map((part) => (
                  <div key={part.key} className="flex gap-4 items-start" id={`zhisu-part-${part.key}`}>
                    <div className="bg-[#F4F1EB]/10 rounded-sm px-2.5 py-1 font-serif text-xs font-bold text-[#B69A6B]">
                      {part.key[0]}
                    </div>
                    <div>
                      <h4 className="font-serif text-xs font-bold tracking-widest text-[#F4F1EB]">
                        {part.key} — {part.label[lang]}
                      </h4>
                      <p className="font-sans text-xs text-[#F4F1EB]/70 leading-relaxed mt-1">
                        {part.meaning[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#F4F1EB]/10 pt-6 mt-8 flex items-center gap-2" id="zhisu-origin-footer">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B69A6B]"></span>
              <span className="font-serif italic text-xs text-[#B69A6B]">
                {lang === "en" ? "Insight + Connecting Hub + High-grade Space" : "智能判断 + 中枢连接 + 高阶智识空间"}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Philosophy Section: Stable Body, Intelligent Leverage, Long-Term Capital */}
      <section className="mb-24 animate-fade-in" id="section-brand-philosophy-guide">
        <motion.div variants={itemVariants} className="mb-12 border-b border-[#D8D2C6]/60 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              {lang === "en" ? "THE CORE TRIAD" : "核心三维一体哲学"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24] tracking-tight">
              {lang === "en" ? "Philosophy Brand Guide" : "品牌核心哲学导览"}
            </h2>
          </div>
          <p className="font-serif italic text-xs text-[#8B5A44] max-w-sm">
            {lang === "en" 
              ? "“A closed-loop system designed for sustainable self-directed evolution.”" 
              : "“旨在实现可持续、自主进化的闭环心智运行系统。”"
            }
          </p>
        </motion.div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12" id="brand-philosophy-grid">
          
          {/* Card 1: Stable Body */}
          <motion.div
            variants={itemVariants}
            className="bg-white/50 border border-[#D8D2C6] border-t-4 border-t-[#8B5A44] rounded-sm p-8 flex flex-col justify-between hover:shadow-md transition-all duration-500 group relative"
            id="philosophy-guide-body-card"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-display text-[11px] font-bold tracking-[0.2em] text-[#8B5A44]">
                  {lang === "en" ? "01 / BODY" : "01 / 稳定身心"}
                </span>
                <div className="p-2 bg-[#8B5A44]/10 rounded-full text-[#8B5A44]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-serif text-2xl font-normal text-[#1A2F24] tracking-tight mb-2">
                {lang === "en" ? "Stable Body" : "稳定身心"}
              </h3>
              <p className="font-serif italic text-xs text-[#8B5A44] mb-4">
                {lang === "en" ? "The Biological Vessel" : "生命底盘与硬件系统"}
              </p>
              
              <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en" 
                  ? "Your physical body and mental container are the primary processors of all intelligence. True leverage and compound interest are only achievable with a resilient, stable biological foundation. Sleep restoration, focus defense, and stress regulation act as our fundamental framework." 
                  : "身体与心智容器是承载所有外部智能的硬件处理器。任何工作杠杆或资本复利，若建立在耗竭的体能与涣散的心智上，终将坍塌。我们通过睡眠重建、高效恢复与注意力保护，筑造不可动摇的底盘。"
                }
              </p>
            </div>

            <div className="border-t border-[#D8D2C6]/40 pt-5 mt-4" id="philosophy-guide-body-pillars">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.15em] text-[#1C1C1C]/40 block mb-3">
                {lang === "en" ? "SYSTEM MODULES" : "系统模块"}
              </span>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5" id="guide-body-item-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Circadian Harmony & Sleep Restoration" : "昼夜节律调和与睡眠修复"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5" id="guide-body-item-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Deep Attention Protection" : "深度注意力保护与专注屏障"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5" id="guide-body-item-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Autonomic Nervous System Decompression" : "植物神经泄压与压力缓冲"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Intelligent Leverage */}
          <motion.div
            variants={itemVariants}
            className="bg-white/50 border border-[#D8D2C6] border-t-4 border-t-[#1A2F24] rounded-sm p-8 flex flex-col justify-between hover:shadow-md transition-all duration-500 group relative"
            id="philosophy-guide-tool-card"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-display text-[11px] font-bold tracking-[0.2em] text-[#1A2F24]">
                  {lang === "en" ? "02 / LEVERAGE" : "02 / 智能放大"}
                </span>
                <div className="p-2 bg-[#1A2F24]/10 rounded-full text-[#1A2F24]">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-serif text-2xl font-normal text-[#1A2F24] tracking-tight mb-2">
                {lang === "en" ? "Intelligent Leverage" : "智能放大"}
              </h3>
              <p className="font-serif italic text-xs text-[#1A2F24] mb-4">
                {lang === "en" ? "The Multiplier of Creative Force" : "认知工具与生产力杠杆"}
              </p>
              
              <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en" 
                  ? "Expanding human limits through systematic integration of AI and automated workflows. We do not chase temporary technology hypes; instead, we build highly specialized prompt frameworks, template engines, and automation pipelines that eliminate mechanical friction and elevate personal output." 
                  : "驾驭智能中枢，将人类智慧与 AI 技术无缝融合。我们坚决抵制无休止的技术焦虑与追逐热点，提倡通过定制的 Prompt 体系、高度自动化的工作流模板、以及无摩擦的自动化节点，极致放大每一个个体的产能。"
                }
              </p>
            </div>

            <div className="border-t border-[#D8D2C6]/40 pt-5 mt-4" id="philosophy-guide-tool-pillars">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.15em] text-[#1C1C1C]/40 block mb-3">
                {lang === "en" ? "SYSTEM MODULES" : "系统模块"}
              </span>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5" id="guide-tool-item-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A2F24]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Custom Prompt Engineering & Smart Templates" : "高度定制 Prompt 与智能模板"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5" id="guide-tool-item-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A2F24]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Automated Knowledge Pipelines" : "自动化知识加工与分发系统"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5" id="guide-tool-item-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A2F24]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "System-Integrated Dashboards" : "无缝整合的个人智枢控制台"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Long-Term Capital */}
          <motion.div
            variants={itemVariants}
            className="bg-white/50 border border-[#D8D2C6] border-t-4 border-t-[#B69A6B] rounded-sm p-8 flex flex-col justify-between hover:shadow-md transition-all duration-500 group relative"
            id="philosophy-guide-capital-card"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-display text-[11px] font-bold tracking-[0.2em] text-[#B69A6B]">
                  {lang === "en" ? "03 / CAPITAL" : "03 / 长期资本"}
                </span>
                <div className="p-2 bg-[#B69A6B]/10 rounded-full text-[#B69A6B]">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-serif text-2xl font-normal text-[#1A2F24] tracking-tight mb-2">
                {lang === "en" ? "Long-Term Capital" : "长期资本"}
              </h3>
              <p className="font-serif italic text-xs text-[#B69A6B] mb-4">
                {lang === "en" ? "The Compounding Compass" : "穿越周期的长期复利价值"}
              </p>
              
              <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en" 
                  ? "Cultivating an absolute, disciplined wealth cognitive system that is anti-fragile. Capital is not just liquid money, but also accumulated intellectual property, high-value reputation, and long-term habits. We build deep, patience-led judgment that effortlessly navigates market noise and compounds value." 
                  : "构建具备强健心智抗噪力的长期价值判断系统。资本不仅是流动的金钱，更是沉淀的知识产权、信誉资产以及抗脆弱性的投资决策纪律。通过建立长期认知、理解行为金融学并保持克制，实现真正的跨周期复利。"
                }
              </p>
            </div>

            <div className="border-t border-[#D8D2C6]/40 pt-5 mt-4" id="philosophy-guide-capital-pillars">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.15em] text-[#1C1C1C]/40 block mb-3">
                {lang === "en" ? "SYSTEM MODULES" : "系统模块"}
              </span>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5" id="guide-capital-item-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B69A6B]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Cognitive Arbitrage Frameworks" : "穿越周期的资产配置与决策纪律"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5" id="guide-capital-item-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B69A6B]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "IP & Knowledge Capitalization" : "版权、知识产品等高溢价资产化"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5" id="guide-capital-item-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B69A6B]"></span>
                  <span className="font-sans text-xs text-[#1C1C1C]/80 font-medium">
                    {lang === "en" ? "Behavioral Finance Shields" : "剔除贪婪与恐惧的心智防线"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Dynamic Integration Loop Visualizer block */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-r from-[#8B5A44]/5 via-[#1A2F24]/5 to-[#B69A6B]/5 border border-[#D8D2C6]/60 rounded-sm p-6 sm:p-8 relative overflow-hidden"
          id="philosophy-loop-visualizer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8D2C6]/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl text-left">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1A2F24] mb-2">
                {lang === "en" ? "THE SYNERGISTIC SELF-EVOLVING LOOP" : "协同进化自循环系统"}
              </h4>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en" 
                  ? "Stable Body functions as your biological host CPU, protecting attention; Intelligent Leverage converts that focused energy into multi-fold professional productivity; and Long-Term Capital secures those outputs as timeless capital assets that fund and protect the host. Together, they create a perfect self-sustaining vector."
                  : "稳定身心作为生物处理核心提供纯净、丰沛的注意力容器；智能放大利用 AI 和自动化工具将专注力转化为高倍率的创造力产出；长期资本则将这些产出结晶为穿越周期的智识与财务资产，进而提供财务安全，反哺并滋养更稳定的身心状态。三者交互形成强劲的正向增强环路。"
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 border border-[#D8D2C6] bg-white/50 rounded-sm p-4 w-full lg:w-auto" id="philosophy-loop-indicators">
              <div className="text-center px-4" id="loop-indicator-body">
                <span className="font-display text-[9px] font-bold text-[#8B5A44] block">
                  {lang === "en" ? "BODY" : "稳定身心"}
                </span>
                <span className="font-serif italic text-[11px] text-[#1C1C1C]/70">{lang === "en" ? "Protects Focus" : "守护注意力底盘"}</span>
              </div>
              <div className="text-[#D8D2C6] font-mono text-xs select-none">→</div>
              <div className="text-center px-4" id="loop-indicator-leverage">
                <span className="font-display text-[9px] font-bold text-[#1A2F24] block">
                  {lang === "en" ? "LEVERAGE" : "智能放大"}
                </span>
                <span className="font-serif italic text-[11px] text-[#1C1C1C]/70">{lang === "en" ? "Multiplies Output" : "放大创造力产出"}</span>
              </div>
              <div className="text-[#D8D2C6] font-mono text-xs select-none">→</div>
              <div className="text-center px-4" id="loop-indicator-capital">
                <span className="font-display text-[9px] font-bold text-[#B69A6B] block">
                  {lang === "en" ? "CAPITAL" : "长期资本"}
                </span>
                <span className="font-serif italic text-[11px] text-[#1C1C1C]/70">{lang === "en" ? "Safeguards Life" : "资产化反哺身心"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* The Three Pillars Bento Grid Section */}
      <section className="mb-24" id="section-three-pillars">
        <motion.div variants={itemVariants} className="mb-12 border-b border-[#D8D2C6]/60 pb-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24] tracking-tight">
            {content.threePillars.title[lang]}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="three-pillars-grid">
          {content.threePillars.pillars.map((pillar) => (
            <motion.div
              variants={itemVariants}
              key={pillar.id}
              className="bg-white/40 border border-[#D8D2C6] rounded-sm p-8 flex flex-col justify-between hover:border-[#8B5A44]/40 transition-all duration-500 relative overflow-hidden group shadow-xs"
              id={`pillar-card-${pillar.id}`}
            >
              {/* Pillar top indicator */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="font-display text-[9px] uppercase font-bold tracking-widest text-[#8B5A44]">
                    {pillar.name[lang]}
                  </span>
                  <div className="p-2.5 bg-[#F4F1EB] rounded-full">
                    {getPillarIcon(pillar.id)}
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2F24] tracking-tight mb-2">
                  {pillar.title[lang]}
                </h3>
                <p className="font-serif italic text-xs text-[#8B5A44] mb-4">
                  {pillar.subtitle[lang]}
                </p>

                {/* Specific items */}
                <ul className="space-y-3 my-6 border-t border-[#D8D2C6]/40 pt-6" id={`items-list-${pillar.id}`}>
                  {pillar.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-center text-xs text-[#1C1C1C]/75 font-sans" id={`item-${pillar.id}-${idx}`}>
                      <span className="w-1 h-1 rounded-full bg-[#1A2F24]/60"></span>
                      {item[lang]}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand commitment */}
              <div className="bg-[#1A2F24]/5 border-t border-[#D8D2C6]/40 p-5 rounded-sm mt-4" id={`commitment-${pillar.id}`}>
                <span className="font-display text-[8px] uppercase font-bold tracking-[0.15em] text-[#1C1C1C]/50 block mb-1">
                  {lang === "en" ? "PILLAR COMMITMENT" : "支柱承诺"}
                </span>
                <p className="font-serif text-xs text-[#1C1C1C]/80 leading-relaxed font-normal">
                  {pillar.commitment[lang]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision & Core Concept Slabs */}
      <section className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" id="section-mission-vision">
        {/* Mission */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/40 border border-[#D8D2C6] rounded-sm p-8 sm:p-10 shadow-xs hover:border-[#1A2F24]/40 transition-all duration-500 flex gap-6 items-start"
          id="card-mission"
        >
          <div className="p-3 bg-[#8B5A44]/10 rounded-sm">
            <BookOpen className="w-6 h-6 text-[#8B5A44]" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2F24] tracking-tight mb-4">
              {content.missionVision.mission.title[lang]}
            </h3>
            <p className="font-serif text-sm text-[#1C1C1C]/80 leading-relaxed ink-text">
              {content.missionVision.mission.text[lang]}
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/40 border border-[#D8D2C6] rounded-sm p-8 sm:p-10 shadow-xs hover:border-[#1A2F24]/40 transition-all duration-500 flex gap-6 items-start"
          id="card-vision"
        >
          <div className="p-3 bg-[#1A2F24]/10 rounded-sm">
            <Workflow className="w-6 h-6 text-[#1A2F24]" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2F24] tracking-tight mb-4">
              {content.missionVision.vision.title[lang]}
            </h3>
            <p className="font-serif text-sm text-[#1C1C1C]/80 leading-relaxed ink-text">
              {content.missionVision.vision.text[lang]}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Philosophy Slabs: System over fragments */}
      <section className="mb-24" id="section-philosophy">
        <motion.div 
          variants={itemVariants}
          className="text-center max-w-3xl mx-auto mb-16"
          id="philosophy-header"
        >
          <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
            {lang === "en" ? "CORE PHILOSOPHY" : "核心哲学体系"}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24] tracking-tight mb-4">
            {content.philosophy.title[lang]}
          </h2>
          <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed">
            {content.philosophy.subtitle[lang]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="philosophy-cards-container">
          {content.philosophy.cards.map((card, idx) => (
            <motion.div
              variants={itemVariants}
              key={idx}
              className="bg-white/40 border border-[#D8D2C6] rounded-sm p-8 flex flex-col gap-4 shadow-xs"
              id={`philosophy-card-${idx}`}
            >
              <div className="font-mono text-xs font-bold text-[#8B5A44]">
                0{idx + 1}
              </div>
              <h3 className="font-serif text-lg font-normal text-[#1A2F24] tracking-tight">
                {card.title[lang]}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {card.desc[lang]}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Connection with Mother Ecosystem Malttrix */}
      <section className="mb-24" id="section-ecosystem-connection">
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-[#E8DDCF]/40 to-[#D8D2C6]/40 border border-[#D8D2C6] rounded-sm p-8 sm:p-12 shadow-sm"
          id="malttrix-connection-card"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] block mb-2">
                {lang === "en" ? "BRAND AFFILIATION" : "母品牌生态"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24] tracking-tight mb-4">
                {content.malttrix.title[lang]}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed max-w-3xl">
                {content.malttrix.desc[lang]}
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div className="border border-[#D8D2C6] rounded-sm px-6 py-4 bg-white/40 max-w-xs" id="affiliation-badge">
                <span className="font-display text-[7px] uppercase tracking-[0.2em] text-[#8B5A44] block">
                  {lang === "en" ? "ECOSYSTEM LICENSE" : "生态授权认证"}
                </span>
                <span className="font-serif text-[10px] text-[#1C1C1C] font-semibold mt-1 block">
                  {lang === "en" ? "M-CLASS KNOWLEDGE MEMBER" : "MALTTRIX 梦萃授权知识子集"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Call to action at the bottom */}
      <section className="border-t border-[#D8D2C6]/60 pt-16 flex flex-col items-center text-center" id="about-bottom-cta">
        <motion.h4 variants={itemVariants} className="font-serif italic text-lg text-[#1C1C1C]/80 mb-6">
          Stable Body. Intelligent Leverage. Long-Term Capital.
        </motion.h4>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <motion.button
            variants={itemVariants}
            onClick={() => {
              if (onPlayChime) onPlayChime();
              onBackToHome();
            }}
            className="bg-[#1A2F24] text-[#F4F1EB] text-xs font-display font-medium uppercase tracking-[0.2em] px-8 py-4 rounded-sm hover:bg-[#8B5A44] transition-colors duration-300 shadow-md cursor-pointer flex items-center gap-2"
            id="btn-bottom-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "en" ? "Explore System Hub" : "开启智枢主中枢"}
          </motion.button>

          {onPlayChime && (
            <motion.button
              variants={itemVariants}
              onClick={onPlayChime}
              className="border border-[#D8D2C6] bg-white/40 text-[#1C1C1C] text-xs font-display font-medium uppercase tracking-[0.2em] px-8 py-4 rounded-sm hover:bg-[#1A2F24] hover:text-[#F4F1EB] hover:border-[#1A2F24] transition-colors duration-300 cursor-pointer flex items-center gap-2"
              id="btn-bottom-play-chime"
            >
              <Volume2 className="w-4 h-4" />
              {lang === "en" ? "Play Soundmark Chime" : "聆听心智风铃"}
            </motion.button>
          )}
        </div>
      </section>
    </motion.div>
  );
}
