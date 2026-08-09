import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Activity,
  Cpu,
  Compass,
  ArrowRight,
  BookOpen,
  Mail,
  Check,
  CheckCircle2,
  Workflow,
  TrendingUp,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface PillarsViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onNavigateToPillar: (pillar: "mindfulness" | "ai" | "wealth") => void;
  onPlayChime?: () => void;
  onNavigateToNewsletter?: () => void;
}

export default function PillarsView({
  lang,
  onBackToHome,
  onNavigateToPillar,
  onPlayChime,
  onNavigateToNewsletter
}: PillarsViewProps) {
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeSystemNode, setActiveSystemNode] = useState<"body" | "tool" | "capital">("body");
  const [breathScale, setBreathScale] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Soft rhythmic breath animation cycle for the Body node
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathScale((prev) => (prev === 1 ? 1.08 : 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subEmail.trim()) {
      setIsSubscribed(true);
      setSubEmail("");
      if (onPlayChime) onPlayChime();
      setTimeout(() => setIsSubscribed(false), 6000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Content collections
  const p1BulletEn = [
    "Sleep reset systems",
    "Stress recovery frameworks",
    "Mindful productivity habits",
    "Focus training",
    "Nervous system regulation",
    "Energy management systems",
    "Longevity habits"
  ];
  const p1BulletZh = [
    "睡眠修复系统",
    "压力恢复框架",
    "正念效率习惯",
    "专注力训练",
    "神经系统调节",
    "精力管理系统",
    "长寿习惯"
  ];

  const p2BulletEn = [
    "AI workflow blueprints",
    "Prompt libraries",
    "Automation templates",
    "Creator workflow systems",
    "Notion + AI systems",
    "Solo business automation",
    "Productivity dashboards"
  ];
  const p2BulletZh = [
    "AI 工作流蓝图",
    "提示词库",
    "自动化模板",
    "创作者工作流系统",
    "Notion 与 AI 系统",
    "个人商业自动化",
    "效率仪表盘"
  ];

  const p3BulletEn = [
    "Long-term investing frameworks",
    "Asset allocation checklists",
    "Market cycle notes",
    "Risk reflection tools",
    "Wealth planning templates",
    "Financial decision frameworks",
    "Capital thinking essays"
  ];
  const p3BulletZh = [
    "长期投资框架",
    "资产配置清单",
    "市场周期笔记",
    "风险反思工具",
    "财富规划模板",
    "财务决策框架",
    "资本思维文章"
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-[#F4F1EB] min-h-screen text-[#1C1C1C] selection:bg-[#8B5A44]/10 selection:text-[#8B5A44] relative"
    >
      {/* Decorative subtle grain filter overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A2F24_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.015] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-16 max-w-[1600px] mx-auto border-b border-[#D8D2C6]/40">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => {
              if (onPlayChime) onPlayChime();
              onBackToHome();
            }}
            className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-all group"
            id="pillars-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
            <span>{lang === "en" ? "Back to Chamber" : "返回主阁"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6" id="pillars-hero-left">
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.3em] text-[#8B5A44] block">
              {lang === "en" ? "THE THREE PILLARS" : "三大支柱"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#1A2F24] tracking-tight">
              {lang === "en" ? "A Personal Intelligence System for the Future Individual" : "面向未来个体的个人智能系统"}
            </h1>
            <p className="font-serif text-sm text-[#1C1C1C]/75 leading-relaxed italic border-l-2 border-[#8B5A44]/30 pl-4 py-1">
              {lang === "en" 
                ? "Immersation connects Body, Tool, and Capital into one personal intelligence system for the future-ready individual."
                : "Immersation｜智枢阁 将身、器、财连接成一套面向未来个体的个人智能系统。"}
            </p>
            <div className="font-sans text-xs sm:text-sm text-[#1C1C1C]/80 space-y-4 max-w-2xl leading-relaxed">
              <p>
                {lang === "en"
                  ? "Immersation｜智枢阁 is built on three interconnected pillars: Mindfulness Health & Longevity, AI Automation, and Wealth Cognition."
                  : "Immersation｜智枢阁 建立在三大核心支柱之上：Mindfulness Health & Longevity（正念健康与长寿管理）、AI Automation（AI 自动化）以及 Wealth Cognition（财富认知）。"}
              </p>
              <p>
                {lang === "en"
                  ? "These are not ordinary content categories. They form a complete personal intelligence system for the future-ready individual: a system for the body, the tools, and capital thinking."
                  : "这三大支柱不应被理解为普通的内容分类，而是一套面向未来个体的完整个人智能系统：一套针对身体（身）、工具（器）与资本（财）的系统化思考与演进框架。"}
              </p>
            </div>

            {/* Quick Slogan Block */}
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <div className="bg-[#1A2F24]/5 rounded-sm p-4 border border-[#1A2F24]/10 max-w-md">
                <span className="block font-display text-[9px] uppercase tracking-[0.2em] text-[#8B5A44] mb-1">
                  {lang === "en" ? "SYSTEM CORE FORMULA" : "系统核心公式"}
                </span>
                <span className="font-display text-xs font-bold text-[#1A2F24] tracking-wider block">
                  {lang === "en" ? "Stable Body. Intelligent Leverage. Long-Term Capital." : "稳定身心，智能杠杆，长期资本。"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Abstract three-node interactive system diagram */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center" id="pillars-hero-right">
            <div className="relative w-full max-w-[380px] aspect-square bg-[#E8DDCF]/30 rounded-lg p-6 border border-[#D8D2C6]/50 shadow-[inset_0_4px_24px_-4px_rgba(139,90,68,0.05)] overflow-hidden">
              
              {/* Soft decorative background circles */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.2]">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#8B5A44" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#1A2F24" strokeWidth="0.5" />
                  {/* Faint bamboo leaf vector silhouette in bg */}
                  <path d="M 30,120 C 45,100 55,105 70,80" fill="none" stroke="#1A2F24" strokeWidth="0.5" strokeDasharray="1 3" />
                </svg>
              </div>

              {/* Grid backdrop */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#1C1C1C_1px,transparent_1px),linear-gradient(to_bottom,#1C1C1C_1px,transparent_1px)] [background-size:24px_24px]" />

              <h3 className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-[#8B5A44]/70 mb-4 text-center">
                {lang === "en" ? "Interconnected System Overview" : "跨支柱关联交互系统"}
              </h3>

              {/* Interactive Node Graph */}
              <div className="relative w-full h-[220px] flex items-center justify-center">
                
                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 300 200">
                  {/* Connecting system lines */}
                  <line x1="60" y1="130" x2="150" y2="50" stroke="#1A2F24" strokeWidth="1" strokeDasharray="2 2" className="opacity-60" />
                  <line x1="150" y1="50" x2="240" y2="130" stroke="#1A2F24" strokeWidth="1" strokeDasharray="2 2" className="opacity-60" />
                  <line x1="60" y1="130" x2="240" y2="130" stroke="#1A2F24" strokeWidth="1" strokeDasharray="2 2" className="opacity-60" />

                  {/* Flow dots */}
                  <circle cx="105" cy="90" r="2.5" fill="#8B5A44" className="animate-pulse" />
                  <circle cx="195" cy="90" r="2.5" fill="#8B5A44" className="animate-pulse" />
                  <circle cx="150" cy="130" r="2.5" fill="#1A2F24" className="animate-pulse" />
                </svg>

                {/* Node 1: Body (Mindfulness Health & Longevity) */}
                <button
                  onClick={() => {
                    setActiveSystemNode("body");
                    if (onPlayChime) onPlayChime();
                  }}
                  className={`absolute left-[5%] bottom-[15%] w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 z-10 cursor-pointer ${
                    activeSystemNode === "body"
                      ? "bg-[#1A2F24] text-[#F4F1EB] scale-105 shadow-md border border-[#8B5A44]/30"
                      : "bg-[#F4F1EB] text-[#1C1C1C]/75 hover:bg-[#E8DDCF] border border-[#D8D2C6]"
                  }`}
                  style={{
                    transform: activeSystemNode === "body" ? `scale(${breathScale})` : undefined
                  }}
                >
                  <Activity className={`w-5 h-5 mb-1.5 ${activeSystemNode === "body" ? "text-[#B69A6B]" : "text-[#1A2F24]"}`} />
                  <span className="font-display text-[9px] font-bold uppercase tracking-wider text-center px-1">
                    {lang === "en" ? "Body" : "身"}
                  </span>
                  <span className="text-[7px] font-sans opacity-60 text-center scale-90 px-1 truncate w-full">
                    {lang === "en" ? "Mindfulness" : "正念长寿"}
                  </span>
                </button>

                {/* Node 2: Tool (AI Automation) */}
                <button
                  onClick={() => {
                    setActiveSystemNode("tool");
                    if (onPlayChime) onPlayChime();
                  }}
                  className={`absolute left-[50%] -translate-x-1/2 top-[5%] w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 z-10 cursor-pointer ${
                    activeSystemNode === "tool"
                      ? "bg-[#1A2F24] text-[#F4F1EB] scale-105 shadow-md border border-[#8B5A44]/30"
                      : "bg-[#F4F1EB] text-[#1C1C1C]/75 hover:bg-[#E8DDCF] border border-[#D8D2C6]"
                  }`}
                >
                  <Cpu className={`w-5 h-5 mb-1.5 ${activeSystemNode === "tool" ? "text-[#B69A6B]" : "text-[#1A2F24]"}`} />
                  <span className="font-display text-[9px] font-bold uppercase tracking-wider text-center px-1">
                    {lang === "en" ? "Tool" : "器"}
                  </span>
                  <span className="text-[7px] font-sans opacity-60 text-center scale-90 px-1 truncate w-full">
                    {lang === "en" ? "AI Automation" : "AI 自动化"}
                  </span>
                </button>

                {/* Node 3: Capital (Wealth Cognition) */}
                <button
                  onClick={() => {
                    setActiveSystemNode("capital");
                    if (onPlayChime) onPlayChime();
                  }}
                  className={`absolute right-[5%] bottom-[15%] w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 z-10 cursor-pointer ${
                    activeSystemNode === "capital"
                      ? "bg-[#1A2F24] text-[#F4F1EB] scale-105 shadow-md border border-[#8B5A44]/30"
                      : "bg-[#F4F1EB] text-[#1C1C1C]/75 hover:bg-[#E8DDCF] border border-[#D8D2C6]"
                  }`}
                >
                  <Compass className={`w-5 h-5 mb-1.5 ${activeSystemNode === "capital" ? "text-[#B69A6B]" : "text-[#1A2F24]"}`} />
                  <span className="font-display text-[9px] font-bold uppercase tracking-wider text-center px-1">
                    {lang === "en" ? "Capital" : "财"}
                  </span>
                  <span className="text-[7px] font-sans opacity-60 text-center scale-90 px-1 truncate w-full">
                    {lang === "en" ? "Wealth Cognition" : "财富认知"}
                  </span>
                </button>

              </div>

              {/* Dynamic explanations */}
              <div className="mt-4 bg-[#F4F1EB]/90 p-3 rounded-xs border border-[#D8D2C6]/50 min-h-[50px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSystemNode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-center text-[10px]"
                  >
                    {activeSystemNode === "body" && (
                      <p className="font-sans text-[#1C1C1C]/80 leading-relaxed">
                        <strong>{lang === "en" ? "Body (Mindfulness Health & Longevity):" : "身（正念健康与长寿）："}</strong>{" "}
                        {lang === "en" 
                          ? "Keeps the human processor stable, providing the foundation for clear thinking." 
                          : "让人类处理器保持稳定，为清晰思考奠定持久的生理与神经基石。"}
                      </p>
                    )}
                    {activeSystemNode === "tool" && (
                      <p className="font-sans text-[#1C1C1C]/80 leading-relaxed">
                        <strong>{lang === "en" ? "Tool (AI Automation):" : "器（AI 自动化）："}</strong>{" "}
                        {lang === "en" 
                          ? "Creates intelligent leverage, reducing repetitive labor and multiplying output." 
                          : "创建智能工具杠杆，削减枯燥重复性劳动，大幅度系统化放大个人产出。"}
                      </p>
                    )}
                    {activeSystemNode === "capital" && (
                      <p className="font-sans text-[#1C1C1C]/80 leading-relaxed">
                        <strong>{lang === "en" ? "Capital (Wealth Cognition):" : "财（财富认知）："}</strong>{" "}
                        {lang === "en" 
                          ? "Turns clear, disciplined judgment into compounding, long-term freedom." 
                          : "构建不随市场喧嚣波动的长线资本认知与客观理性的配置纪律。"}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Why Three Pillars Section */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 max-w-[1200px] mx-auto" id="why-three-pillars">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block">
              {lang === "en" ? "THE REASONING" : "系统逻辑论证"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24]">
              {lang === "en" ? "Why These Three Pillars Matter" : "为什么是这三大支柱？"}
            </h2>
            <div className="w-12 h-[1px] bg-[#8B5A44] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-8">
            <div className="space-y-6 font-sans text-xs sm:text-sm text-[#1C1C1C]/80 leading-relaxed" id="why-pillars-content-left">
              <p>
                {lang === "en"
                  ? "Modern individuals are surrounded by information, tools, pressure, and financial uncertainty."
                  : "现代个体面对的不是信息不足，而是信息过载、工具过载、压力过载与财富不确定性。"}
              </p>
              <p className="font-serif italic text-sm text-[#8B5A44]/90 pl-4 border-l border-[#8B5A44]/30">
                {lang === "en"
                  ? "More information is not enough. More productivity tools are not enough. More investing opinions are not enough."
                  : "更多碎片化的信息，不等于清澈；更多前沿的工具，不等于高效；更多嘈杂的投资观点，也不等于明智的财富决策。"}
              </p>
              <p>
                {lang === "en"
                  ? "What future-ready individuals need is a coherent, quiet system."
                  : "面向未来的个体，真正需要的是一整套高度协同、安静连贯的心智操作系统。"}
              </p>
            </div>

            <div className="space-y-6 font-sans text-xs sm:text-sm text-[#1C1C1C]/80 leading-relaxed" id="why-pillars-content-right">
              <p>
                {lang === "en"
                  ? "Immersation connects health, AI, and wealth because these three areas influence one another directly."
                  : "Immersation｜智枢阁 连接「身、器、财」，是因为这三大领域正以前所未有的深度直接相互影响、互为底座。"}
              </p>
              <ul className="space-y-3 pl-1">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44] mt-2 flex-shrink-0" />
                  <span>
                    {lang === "en" 
                      ? "Without a stable body, productivity becomes unsustainable." 
                      : "没有平稳安定的肉体和神智（身），再强大的工作效率也将沦为竭泽而渔。"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44] mt-2 flex-shrink-0" />
                  <span>
                    {lang === "en" 
                      ? "Without intelligent tools, growth lacks leverage." 
                      : "没有智能的自动化技术杠杆（器），个人能效与时间复利将寸步难行。"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44] mt-2 flex-shrink-0" />
                  <span>
                    {lang === "en" 
                      ? "Without capital cognition, effort may not become long-term freedom." 
                      : "没有深度的财富投资认知（财），一生的忙碌与辛苦终究难以沉淀为坚不可摧的终身自由。"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Pillars Cards Section */}
      <section className="py-20 bg-[#E8DDCF]/40 border-y border-[#D8D2C6]/40 px-6 sm:px-12 lg:px-16" id="three-pillar-cards">
        <div className="max-w-[1400px] mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              {lang === "en" ? "EXPLORE THE MATRIX" : "探索模块矩阵"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24]">
              {lang === "en" ? "The Three Pillars Matrix" : "三大支柱矩阵与具体呈现"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CARD 1: BODY (Mindfulness Health & Longevity) */}
            <div 
              className="bg-[#F4F1EB] rounded-lg border border-[#D8D2C6] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 relative group"
              id="pillar-card-body"
            >
              {/* Soft bamboo shadow/organic motif overlay in background */}
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-[0.06] select-none z-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Organic bamboo lines */}
                  <path d="M90,10 C80,40 70,60 50,90" stroke="#1A2F24" strokeWidth="2" fill="none" />
                  <path d="M85,25 C75,45 60,65 45,85" stroke="#1A2F24" strokeWidth="1.5" fill="none" />
                  {/* Soft ink wash circle */}
                  <circle cx="70" cy="50" r="25" fill="#1A2F24" opacity="0.3" />
                </svg>
              </div>

              <div className="p-8 flex-1 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-[#1A2F24]/5 w-12 h-12 rounded-full flex items-center justify-center border border-[#1A2F24]/10">
                    <Activity className="w-6 h-6 text-[#8B5A44]" />
                  </div>
                  <span className="font-mono text-xs text-[#8B5A44] font-semibold tracking-wider">PILLAR ONE</span>
                </div>

                <div className="space-y-2">
                  <span className="font-display text-[9px] uppercase tracking-[0.2em] text-[#8B5A44] font-bold block">
                    {lang === "en" ? "BODY" : "身"}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Mindfulness Health & Longevity" : "正念健康与长寿管理"}
                  </h3>
                  <p className="font-sans text-[11px] text-[#8B5A44] tracking-wide font-medium">
                    {lang === "en" ? "Role: Keep the human processor stable." : "角色：让人类处理器保持长期稳定运行。"}
                  </p>
                </div>

                <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                  {lang === "en"
                    ? "Focuses on the human operating system: sleep, recovery, attention, stress regulation, nervous system balance, emotional clarity, and long-term vitality. True performance begins with sustainable physical and mental intelligence."
                    : "关注人体的底层生物系统：睡眠重置、压力恢复、深度专注、神经调节以及身体长期生命力。在喧嚣时代，最根本的竞争力绝非频繁更换外在工具，而是让人体处理器本身具备持久的稳定性。"}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    {lang === "en" ? "WHAT THIS HELPS YOU BUILD:" : "此支柱助你构筑："}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {(lang === "en" ? p1BulletEn : p1BulletZh).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#1C1C1C]/80">
                        <Check className="w-3.5 h-3.5 text-[#8B5A44] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8D2C6]/50">
                  <p className="font-serif text-[11px] text-[#1A2F24]/95 leading-relaxed bg-[#1A2F24]/5 p-3 rounded-xs">
                    <strong>{lang === "en" ? "Core Idea:" : "核心理念："}</strong>{" "}
                    {lang === "en" 
                      ? "A stable body creates the foundation for clear thinking, better work, and long-term decision-making."
                      : "稳定的身心基础，是实现透彻思考、深度产出与长远战略决策的前提底盘。"}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#1A2F24] border-t border-[#D8D2C6] text-center">
                <button
                  onClick={() => {
                    if (onPlayChime) onPlayChime();
                    onNavigateToPillar("mindfulness");
                  }}
                  className="w-full font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#F4F1EB] hover:text-[#B69A6B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{lang === "en" ? "Explore Mindfulness Health" : "探索正念健康与长寿"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* CARD 2: TOOL (AI Automation) */}
            <div 
              className="bg-[#F4F1EB] rounded-lg border border-[#D8D2C6] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 relative group"
              id="pillar-card-tool"
            >
              {/* Subtle intelligent grid pattern backdrop */}
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-[0.08] select-none z-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Subtle technical lines and grids */}
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#1A2F24" strokeWidth="0.5" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="#1A2F24" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="#1A2F24" strokeWidth="0.5" strokeDasharray="2 2" />
                  <rect x="35" y="35" width="30" height="30" fill="none" stroke="#8B5A44" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="3" fill="#8B5A44" />
                </svg>
              </div>

              <div className="p-8 flex-1 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-[#1A2F24]/5 w-12 h-12 rounded-full flex items-center justify-center border border-[#1A2F24]/10">
                    <Cpu className="w-6 h-6 text-[#8B5A44]" />
                  </div>
                  <span className="font-mono text-xs text-[#8B5A44] font-semibold tracking-wider">PILLAR TWO</span>
                </div>

                <div className="space-y-2">
                  <span className="font-display text-[9px] uppercase tracking-[0.2em] text-[#8B5A44] font-bold block">
                    {lang === "en" ? "TOOL" : "器"}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "AI Automation" : "AI 自动化"}
                  </h3>
                  <p className="font-sans text-[11px] text-[#8B5A44] tracking-wide font-medium">
                    {lang === "en" ? "Role: Create intelligent leverage." : "角色：用智能工具建立个人杠杆。"}
                  </p>
                </div>

                <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                  {lang === "en"
                    ? "Focuses on how individuals, creators, and small teams use AI, automation, and intelligent workflows to eliminate friction, organize information pipelines, and systemize personal leverage rather than chasing trends."
                    : "专注于个体、独立创作者与敏捷小团队如何利用 AI、API、自动化工具链与定制系统，大幅压缩重复事务，整理碎片信息。这并非追逐流行，而是将人机协作成熟落地。"}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    {lang === "en" ? "WHAT THIS HELPS YOU BUILD:" : "此支柱助你构筑："}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {(lang === "en" ? p2BulletEn : p2BulletZh).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#1C1C1C]/80">
                        <Check className="w-3.5 h-3.5 text-[#8B5A44] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8D2C6]/50">
                  <p className="font-serif text-[11px] text-[#1A2F24]/95 leading-relaxed bg-[#1A2F24]/5 p-3 rounded-xs">
                    <strong>{lang === "en" ? "Core Idea:" : "核心理念："}</strong>{" "}
                    {lang === "en" 
                      ? "Intelligent tools reduce friction, reclaim attention, and expand personal leverage."
                      : "智能工具能根本性消解底层摩擦、夺回稀缺注意力，并无限放大个体的产能边界。"}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#1A2F24] border-t border-[#D8D2C6] text-center">
                <button
                  onClick={() => {
                    if (onPlayChime) onPlayChime();
                    onNavigateToPillar("ai");
                  }}
                  className="w-full font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#F4F1EB] hover:text-[#B69A6B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{lang === "en" ? "Explore AI Automation" : "探索 AI 自动化"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* CARD 3: CAPITAL (Wealth Cognition) */}
            <div 
              className="bg-[#F4F1EB] rounded-lg border border-[#D8D2C6] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 relative group"
              id="pillar-card-capital"
            >
              {/* Compass / slow upward mountain curve backdrop motif */}
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-[0.06] select-none z-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Subtle upward mountain curve and compass geometric arcs */}
                  <path d="M 10,85 C 30,70 45,72 60,50 C 75,28 85,32 95,10" fill="none" stroke="#1A2F24" strokeWidth="1.5" />
                  <path d="M 20,85 C 40,75 55,78 70,60" fill="none" stroke="#1A2F24" strokeWidth="0.8" strokeDasharray="2 2" />
                  <circle cx="75" cy="25" r="10" fill="none" stroke="#8B5A44" strokeWidth="0.5" />
                  <line x1="75" y1="15" x2="75" y2="35" stroke="#8B5A44" strokeWidth="0.5" />
                  <line x1="65" y1="25" x2="85" y2="25" stroke="#8B5A44" strokeWidth="0.5" />
                </svg>
              </div>

              <div className="p-8 flex-1 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-[#1A2F24]/5 w-12 h-12 rounded-full flex items-center justify-center border border-[#1A2F24]/10">
                    <Compass className="w-6 h-6 text-[#8B5A44]" />
                  </div>
                  <span className="font-mono text-xs text-[#8B5A44] font-semibold tracking-wider">PILLAR THREE</span>
                </div>

                <div className="space-y-2">
                  <span className="font-display text-[9px] uppercase tracking-[0.2em] text-[#8B5A44] font-bold block">
                    {lang === "en" ? "CAPITAL" : "财"}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Wealth Cognition" : "财富认知"}
                  </h3>
                  <p className="font-sans text-[11px] text-[#8B5A44] tracking-wide font-medium">
                    {lang === "en" ? "Role: Build long-term capital judgment." : "角色：建立长期资本判断力。"}
                  </p>
                </div>

                <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                  {lang === "en"
                    ? "Focuses on how individuals understand money, time, risk, market cycles, asset allocation, and value compounding. It is not about quick speculation, but about calmer, highly-disciplined capital judgment."
                    : "专注于个体如何深刻理解金钱机制、时间复利、资本周期与资产配置。拒绝暴富幻想和高噪投机，帮助用户绕过情绪盲区，建立极为冷静且有强纪律约束的长期资本决策。"}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    {lang === "en" ? "WHAT THIS HELPS YOU BUILD:" : "此支柱助你构筑："}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {(lang === "en" ? p3BulletEn : p3BulletZh).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#1C1C1C]/80">
                        <Check className="w-3.5 h-3.5 text-[#8B5A44] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8D2C6]/50">
                  <p className="font-serif text-[11px] text-[#1A2F24]/95 leading-relaxed bg-[#1A2F24]/5 p-3 rounded-xs">
                    <strong>{lang === "en" ? "Core Idea:" : "核心理念："}</strong>{" "}
                    {lang === "en" 
                      ? "Capital thinking helps value move across time, risk, and cycles."
                      : "长期主义的资本认知，能让积累的智识价值真正穿越时间、消化风险并跨越市场周期。"}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#1A2F24] border-t border-[#D8D2C6] text-center">
                <button
                  onClick={() => {
                    if (onPlayChime) onPlayChime();
                    onNavigateToPillar("wealth");
                  }}
                  className="w-full font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#F4F1EB] hover:text-[#B69A6B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{lang === "en" ? "Explore Wealth Cognition" : "探索财富认知"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How They Work Together Section */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 max-w-[1200px] mx-auto border-b border-[#D8D2C6]/40" id="how-they-work-together">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            {/* Visual representation of multiplication */}
            <div className="aspect-square bg-[#1A2F24] text-[#F4F1EB] rounded-lg p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border border-[#B69A6B]/20 pointer-events-none" />
              
              <div className="space-y-2">
                <span className="font-display text-[9px] uppercase tracking-[0.2em] text-[#B69A6B] font-bold block">
                  SYSTEMIC MULTIPLIER
                </span>
                <h4 className="font-serif text-2xl font-normal leading-tight">
                  {lang === "en" ? "The Synthesis" : "系统乘数效益"}
                </h4>
              </div>

              {/* Multiplication formula visual */}
              <div className="py-8 space-y-4 font-display font-bold text-center">
                <div className="text-[#F4F1EB]/90 text-sm">
                  {lang === "en" ? "BODY" : "身心稳定性"}
                </div>
                <div className="text-[#B69A6B] text-xl">×</div>
                <div className="text-[#F4F1EB]/90 text-sm">
                  {lang === "en" ? "TOOL LEVERAGE" : "技术杠杆"}
                </div>
                <div className="text-[#B69A6B] text-xl">×</div>
                <div className="text-[#F4F1EB]/90 text-sm">
                  {lang === "en" ? "CAPITAL COGNITION" : "长期资本认知"}
                </div>
              </div>

              <div className="border-t border-[#F4F1EB]/10 pt-4 text-center">
                <span className="font-sans text-[11px] text-[#B69A6B] tracking-wider font-semibold">
                  {lang === "en" ? "TRUE SUSTAINABLE FREEDOM" : "实现真正可持续的心智自由"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6" id="together-content-right">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block">
              {lang === "en" ? "INTEGRATED ENGINE" : "一体化引擎运行"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24]">
              {lang === "en" ? "How the Three Pillars Work Together" : "三大支柱如何共同运作？"}
            </h2>
            <div className="font-sans text-xs sm:text-sm text-[#1C1C1C]/80 space-y-4 leading-relaxed">
              <p>
                {lang === "en"
                  ? "The Three Pillars of Immersation are not separate topics. They form one integrated system."
                  : "Immersation｜智枢阁 的三大支柱并非三个割裂或毫无关联的知识赛道，它们咬合运作，共同形成一套全闭环的生命智能引擎。"}
              </p>
              <p>
                {lang === "en"
                  ? "Body stabilizes energy, attention, and resilience. Tool uses AI and automation to reduce repetitive work and expand output. Capital turns clearer judgment and better systems into long-term value."
                  : "「身」提供最底层、最原初的生命精力和高专注恢复能力；「器」利用前沿的 AI 工作流将原本琐碎的、重复的数据处理与事务流程实现高度托管，成倍拓宽注意力的边际；而「财」则在这个基础之上，提供不被短期利益和群体狂热所左右的市场格局，帮助个体实现智识资产向长期资本的惊人沉淀。"}
              </p>
              <p className="text-[#8B5A44] font-semibold">
                {lang === "en"
                  ? "If you only focus on health, growth may lack leverage. If you only focus on AI, productivity may collapse under fatigue. If you only focus on investing, decisions may be distorted by stress, noise, and poor systems."
                  : "倘若你只关注健康（身），缺少技术支持，你的成长便会遭遇体力瓶颈；如果你只执着于 AI 技术（器），失去对身体的节律管理，你很容易在持续焦虑中崩盘；而若你徒有投资冲动（财），缺少底层心智专注以及强大的技术流程做辅助，最终往往容易在贪婪和噪音里遭受损失。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Individual Journey Section */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 max-w-[1200px] mx-auto border-b border-[#D8D2C6]/40" id="future-individual-journey">
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block">
              {lang === "en" ? "THE PATHWAY" : "个体的成长演进路径"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24]">
              {lang === "en" ? "The Future Individual Journey" : "未来个体的成长路径"}
            </h2>
            <p className="font-sans text-xs text-[#1C1C1C]/60 leading-relaxed max-w-lg mx-auto">
              {lang === "en"
                ? "Most readers enter Immersation through one urgent need. But the full system only becomes powerful when all three are connected."
                : "大多数读者都是因为某一个迫切的需求与摩擦点进入智枢阁的，但这套心智系统的真正威力，要在三大支柱合流的那一刻，才会爆发。"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#E8DDCF]/30 p-8 rounded-sm border border-[#D8D2C6]/40 space-y-4 relative" id="journey-step-1">
              <span className="absolute right-6 top-6 font-mono text-3xl font-bold text-[#8B5A44]/10">01</span>
              <span className="inline-block bg-[#8B5A44] text-[#F4F1EB] text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-xs">
                {lang === "en" ? "STAGE 1: LEVERAGE" : "第一步：夺回时间"}
              </span>
              <h3 className="font-serif text-lg font-normal text-[#1A2F24]">
                {lang === "en" ? "Reclaim Time" : "Reclaim Time ｜ 夺回时间"}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en"
                  ? "Use AI Automation to reduce repetitive work and create intelligent, self-managed workflows that hand back hours of mental peace."
                  : "通过 AI 自动化技术与模块化工作流体系，迅速消灭那些枯燥、低效的手工重复事务，在物理上彻底夺回属于你自己的宝贵自由时间。"}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#E8DDCF]/30 p-8 rounded-sm border border-[#D8D2C6]/40 space-y-4 relative" id="journey-step-2">
              <span className="absolute right-6 top-6 font-mono text-3xl font-bold text-[#8B5A44]/10">02</span>
              <span className="inline-block bg-[#1A2F24] text-[#F4F1EB] text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-xs">
                {lang === "en" ? "STAGE 2: RESTORE" : "第二步：恢复精力"}
              </span>
              <h3 className="font-serif text-lg font-normal text-[#1A2F24]">
                {lang === "en" ? "Restore Energy" : "Restore Energy ｜ 恢复精力"}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en"
                  ? "Use Mindfulness Health & Longevity to stabilize sleep, neural recovery, focus, and emotional resilience. Make wellness highly sustainable."
                  : "在夺回时间的空档里，通过科学的正念健康手段与精力管理框架，修复神经系统，改善睡眠质量，恢复大脑前所未有的敏锐与清亮。"}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#E8DDCF]/30 p-8 rounded-sm border border-[#D8D2C6]/40 space-y-4 relative" id="journey-step-3">
              <span className="absolute right-6 top-6 font-mono text-3xl font-bold text-[#8B5A44]/10">03</span>
              <span className="inline-block bg-[#8B5A44] text-[#F4F1EB] text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-xs">
                {lang === "en" ? "STAGE 3: COMPOUND" : "第三步：沉淀长期价值"}
              </span>
              <h3 className="font-serif text-lg font-normal text-[#1A2F24]">
                {lang === "en" ? "Build Long-Term Value" : "Build Long-Term Value ｜ 建立长期价值"}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en"
                  ? "Use Wealth Cognition to think more calmly about capital, risk, time, and asset compounding. Turn actions into lifelong freedom."
                  : "用长期财富认知来重塑对钱、对风险、对周期的态度。不再被短期波动惊吓，在极度冷静的头脑中完成财富沉淀，换取永不被妥协的终身清亮。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start with One Pillar Section */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 max-w-[1000px] mx-auto text-center space-y-8" id="start-one-pillar">
        <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block">
          {lang === "en" ? "PRACTICAL GUIDANCE" : "务实的实操指南"}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24]">
          {lang === "en" ? "Start with One Pillar" : "从一个支柱开始"}
        </h2>
        
        <div className="font-sans text-xs sm:text-sm text-[#1C1C1C]/80 max-w-2xl mx-auto space-y-4 leading-relaxed">
          <p>
            {lang === "en"
              ? "You do not need to master all three pillars at once. Start where your current friction is highest."
              : "我们从不指望，也绝不推荐你一次性全面重构这三个板块。最成熟的做法是：从你当前阻力最大、摩擦最剧烈的领域开始单点突破。"}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div 
              onClick={() => {
                if (onPlayChime) onPlayChime();
                onNavigateToPillar("mindfulness");
              }}
              className="p-5 bg-white border border-[#D8D2C6]/60 rounded-xs hover:border-[#8B5A44] transition-all cursor-pointer hover:translate-y-[-2px] group"
              id="pillars-start-mindfulness"
            >
              <h4 className="font-serif text-sm font-semibold text-[#1A2F24] mb-2 group-hover:text-[#8B5A44] flex items-center gap-1.5">
                <span>{lang === "en" ? "Body (If tired)" : "身 ｜ 若感到疲惫"}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#8B5A44]" />
              </h4>
              <p className="text-[11px] text-[#1C1C1C]/70 leading-relaxed">
                {lang === "en" 
                  ? "If you feel tired, scattered, or burned out, start with Body to stabilize sleep and recovery." 
                  : "如果你感到长期精力透支、焦虑难安、专注力涣散，先从正念健康开始，重置你的神经系统与睡眠质量。"}
              </p>
            </div>

            <div 
              onClick={() => {
                if (onPlayChime) onPlayChime();
                onNavigateToPillar("ai");
              }}
              className="p-5 bg-white border border-[#D8D2C6]/60 rounded-xs hover:border-[#8B5A44] transition-all cursor-pointer hover:translate-y-[-2px] group"
              id="pillars-start-ai"
            >
              <h4 className="font-serif text-sm font-semibold text-[#1A2F24] mb-2 group-hover:text-[#8B5A44] flex items-center gap-1.5">
                <span>{lang === "en" ? "Tool (If overwhelmed)" : "器 ｜ 若倍受压榨"}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#8B5A44]" />
              </h4>
              <p className="text-[11px] text-[#1C1C1C]/70 leading-relaxed">
                {lang === "en" 
                  ? "If you feel overwhelmed by repetitive tasks and information overflow, start with Tool to construct AI systems." 
                  : "若你一整天的时间都被各种低附加值的重复点击、重复整理所占据，请立刻用 AI 与自动化工作流解放双手。"}
              </p>
            </div>

            <div 
              onClick={() => {
                if (onPlayChime) onPlayChime();
                onNavigateToPillar("wealth");
              }}
              className="p-5 bg-white border border-[#D8D2C6]/60 rounded-xs hover:border-[#8B5A44] transition-all cursor-pointer hover:translate-y-[-2px] group"
              id="pillars-start-wealth"
            >
              <h4 className="font-serif text-sm font-semibold text-[#1A2F24] mb-2 group-hover:text-[#8B5A44] flex items-center gap-1.5">
                <span>{lang === "en" ? "Capital (If unclear)" : "财 ｜ 若充满迷茫"}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#8B5A44]" />
              </h4>
              <p className="text-[11px] text-[#1C1C1C]/70 leading-relaxed">
                {lang === "en" 
                  ? "If you feel unclear about long-term financial security and asset allocation, start with Capital." 
                  : "如果你赚到了一些钱，却始终不知道如何抵抗通胀，对资产配置一无所知，请先从冷静的财富认知补齐常识。"}
              </p>
            </div>
          </div>
          
          <p className="text-[11px] text-[#1C1C1C]/50 pt-2 italic">
            {lang === "en" ? "Then connect the system over time." : "在某一个支柱站稳脚跟后，再通过时间线的演进，逐步打通并组装出完整的心智系统。"}
          </p>
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="bg-[#1A2F24] text-[#F4F1EB] py-20 px-6 sm:px-12 lg:px-16 relative overflow-hidden" id="pillars-newsletter">
        {/* Abstract vector ripples in backdrop */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#B69A6B]/10 pointer-events-none z-0" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#B69A6B]/15 pointer-events-none z-0" />

        <div className="max-w-[800px] mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-3">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.3em] text-[#B69A6B] block">
              {lang === "en" ? "RECEIVE CLEARER SIGNALS" : "接收清晰信号"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F4F1EB]">
              {lang === "en" ? "Subscribe to Immersation｜智枢阁" : "订阅 Immersation｜智枢阁"}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#F4F1EB]/75 max-w-lg mx-auto">
              {lang === "en"
                ? "Receive calm articles, newsletters, frameworks, and digital knowledge assets across body, tool, and capital."
                : "我们持续为您推送围绕身（正念健康）、器（AI自动化）、财（财富认知）三大板块的深度研究、实践手记、模板蓝图与数字资产。"}
            </p>
          </div>

          {isSubscribed ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#F4F1EB]/10 border border-[#B69A6B]/30 rounded-xs p-6 max-w-lg mx-auto"
              id="pillars-sub-success"
            >
              <CheckCircle2 className="w-8 h-8 text-[#B69A6B] mx-auto mb-2" />
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#F4F1EB]">
                {lang === "en" ? "TRANSMISSION ESTABLISHED" : "订阅已激活"}
              </h4>
              <p className="font-sans text-[11px] text-[#F4F1EB]/80 mt-1">
                {lang === "en" 
                  ? "We will only send calm intelligence. No hype, no noise." 
                  : "感谢您加入智枢阁。我们将秉持冷静克制的原则，绝无多余噪音。"}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribeSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" id="pillars-newsletter-form">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#F4F1EB]/40" />
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder={lang === "en" ? "Enter your email..." : "输入您的电子邮箱..."}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#B69A6B] focus:outline-none rounded-sm py-4 pl-12 pr-4 font-sans text-xs text-white transition-brand placeholder:text-white/40"
                  id="pillars-email-input"
                />
              </div>
              <button
                type="submit"
                className="bg-[#B69A6B] hover:bg-[#8B5A44] text-[#1A2F24] hover:text-white font-display text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand cursor-pointer whitespace-nowrap shadow-sm"
                id="pillars-submit-btn"
              >
                {lang === "en" ? "SUBSCRIBE" : "即刻订阅"}
              </button>
            </form>
          )}

          <p className="font-display text-[9px] uppercase tracking-[0.25em] text-[#B69A6B]/80 font-bold">
            {lang === "en" ? "No noise. No hype. Just calm intelligence." : "没有噪音，没有夸张，只有冷静的智慧。"}
          </p>
        </div>
      </section>
    </motion.div>
  );
}
