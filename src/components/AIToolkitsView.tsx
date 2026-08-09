import { subscribeToSendfox } from "../lib/sendfox";
import { supabase } from "../lib/supabase";
import React, { useState } from "react";
import { 
  ArrowLeft, 
  Cpu, 
  Terminal, 
  GitFork, 
  Check, 
  ShoppingBag, 
  Download, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  Layers, 
  BookOpen, 
  HelpCircle,
  FileText,
  Workflow,
  ChevronRight
} from "lucide-react";

interface AIToolkitsViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onAddToCart?: (item: any) => void;
}

export default function AIToolkitsView({
  lang,
  onBackToHome,
  onPlayChime,
  onAddToCart
}: AIToolkitsViewProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "prompts" | "blueprints" | "templates" | "dashboards">("all");
  const [activeStep, setActiveStep] = useState<number>(0);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["body", "tool", "capital"]);

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

  const handleAction = (cb?: () => void) => {
    if (onPlayChime) onPlayChime();
    if (cb) cb();
  };

  const triggerAddToCart = (id: string, title: string) => {
    handleAction(() => {
      if (onAddToCart) {
        onAddToCart({ id, title });
      }
      setAddedItemId(id);
      setTimeout(() => setAddedItemId(null), 2500);
    });
  };

  // Workflow demo steps
  const workflowSteps = [
    {
      title: { en: "Input", zh: "输入" },
      desc: { en: "High-signal readings, transcripts, or research briefs.", zh: "高信噪比阅读材料、音视频转译或研究简报。" }
    },
    {
      title: { en: "AI Processing", zh: "AI 处理" },
      desc: { en: "Dynamic prompt structures filter noise and isolate variables.", zh: "利用动态 Prompt 结构过滤杂音，隔离核心变量。" }
    },
    {
      title: { en: "Human Review", zh: "人类审阅" },
      desc: { en: "The indispensable quality gate where logic meets judgment.", zh: "无可替代的质量安全门，将机器逻辑注入直觉与判断。" }
    },
    {
      title: { en: "Output", zh: "输出" },
      desc: { en: "Actionable summaries, structured logs, or drafts.", zh: "生成具备高度实践指导意义的复盘摘要、系统格式日志或初稿。" }
    },
    {
      title: { en: "Archive", zh: "归档" },
      desc: { en: "Committed to your long-term personal knowledge library.", zh: "沉淀并提交至您的终身个人知识仓库，形成长期智识资产。" }
    }
  ];

  // Toolkits library
  const toolkits = [
    {
      id: "ai-research-brief",
      title: { en: "AI Research Brief Generator", zh: "AI 深度研究简报生成器" },
      category: "prompts",
      useCase: { en: "Distill 50+ page documents into dense, 1-page structured maps.", zh: "将 50 页以上的超长学术/商业报告，提炼为单页高密度结构化心智地图。" },
      level: { en: "Intermediate", zh: "中级进阶" },
      format: { en: "System Prompts", zh: "系统级 Prompts" },
      pillar: "Tool",
      isFree: true,
      badge: { en: "Free", zh: "免费试用" }
    },
    {
      id: "newsletter-repurposing",
      title: { en: "Newsletter Repurposing Workflow", zh: "信札与知识资产重构工作流" },
      category: "blueprints",
      useCase: { en: "Deconstruct research essays into multi-channel micro-insights.", zh: "将一万字的深度研究长文，自动拆解并转换为适用于各平台的微型知识信号。" },
      level: { en: "Advanced", zh: "高级专业" },
      format: { en: "Make.com Blueprint", zh: "Make / n8n 蓝图" },
      pillar: "Tool",
      isFree: false,
      badge: { en: "Paid ($19)", zh: "付费获取 ($19)" }
    },
    {
      id: "substack-article-system",
      title: { en: "Substack Article System", zh: "高质写作与出版控制台" },
      category: "templates",
      useCase: { en: "Draft, organize, refine, and publish from a single calm vault.", zh: "整合了灵感捕获、提纲扩写、冷读校对与一键发布流程的闭环协作控制台。" },
      level: { en: "Beginner", zh: "入门友好" },
      format: { en: "Notion Template", zh: "Notion 知识模版" },
      pillar: "Tool",
      isFree: false,
      badge: { en: "Paid ($24)", zh: "付费获取 ($24)" }
    },
    {
      id: "wordpress-checklist",
      title: { en: "WordPress Publishing Checklist", zh: "极简数字发布自动化校验清单" },
      category: "templates",
      useCase: { en: "AI-assisted technical meta checker & formatting pipeline.", zh: "自动化检测 SEO 杂音、验证图片 referrer 状态及文章排版规范的静态清单。" },
      level: { en: "Beginner", zh: "入门友好" },
      format: { en: "JSON Pipeline", zh: "JSON 清单与自动化流" },
      pillar: "Tool",
      isFree: true,
      badge: { en: "Free", zh: "免费试用" }
    },
    {
      id: "perplexity-research-pack",
      title: { en: "Perplexity Research Prompt Pack", zh: "Perplexity 严苛研究提示词合集" },
      category: "prompts",
      useCase: { en: "Eliminate shallow search summaries and force analytical depth.", zh: "强力过滤搜索引擎生成的肤浅营销话术，深度穿透并获取硬核原始数据与出处。" },
      level: { en: "Intermediate", zh: "中级进阶" },
      format: { en: "Markdown Prompts", zh: "Markdown 格式提示词包" },
      pillar: "Tool",
      isFree: true,
      badge: { en: "Free", zh: "免费试用" }
    },
    {
      id: "content-calendar-auto",
      title: { en: "Content Calendar Automation", zh: "全能发布规划与进度监测看板" },
      category: "dashboards",
      useCase: { en: "An active dashboard linked with Webhooks for calm tracking.", zh: "内置 Webhook 接口的主动式发布排期画布，不发弹窗，仅在后台静默演进。" },
      level: { en: "Advanced", zh: "高级专业" },
      format: { en: "Dashboard Config", zh: "Notion / Canvas 配置包" },
      pillar: "Tool",
      isFree: false,
      badge: { en: "Member Free / $29", zh: "会员免费 / $29" }
    }
  ];

  return (
    <div className="bg-[#F4F1EB] min-h-screen text-[#1C1C1C] selection:bg-[#8B5A44]/10 selection:text-[#8B5A44] pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Calm System Grid Textures */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" id="toolkits-grid-bg">
        <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(#1C1C1C 1px, transparent 1px), linear-gradient(90deg, #1C1C1C 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => handleAction(onBackToHome)}
          className="flex items-center gap-2 group text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors mb-12 cursor-pointer"
          id="toolkits-back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{lang === "en" ? "Back to Chamber" : "返回主页"}</span>
        </button>

        {/* 1. Hero Masthead with Abstract System Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24" id="toolkits-hero">
          
          {/* Left Hero copy */}
          <div className="lg:col-span-7">
            <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#8B5A44] block mb-4">
              {lang === "en" ? "AI TOOLKITS" : "AI TOOLKITS ｜ AI 工具包"}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6 ink-text">
              {lang === "en" ? "AI Toolkits" : "用于智能杠杆的提示词、工作流、模板与自动化系统"}
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-xl mb-8">
              {lang === "en" 
                ? "Prompts, workflows, templates, and automation systems for intelligent leverage. Build calmer AI workflows that reduce repetitive work, organize information, and expand your personal output without adding more noise."
                : "建立更安静、更清晰的 AI 工作流，减少重复劳动，整理信息流程，并在不制造更多噪音的前提下放大个人产能。让 AI 充当高效的副大脑，而非带来数字焦虑的催促机。"}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => {
                  const el = document.getElementById("featured-toolkit-anchor");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm hover:shadow-md cursor-pointer"
              >
                {lang === "en" ? "Explore Featured" : "研读推荐系统"}
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("toolkit-library-anchor");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] px-8 py-4 rounded-sm transition-colors cursor-pointer bg-white/20 hover:bg-white/50"
              >
                {lang === "en" ? "Browse Library" : "浏览全套工具箱"}
              </button>
            </div>
          </div>

          {/* Right: Custom Abstract AI Chip/Workflow line Visual (Avoiding Robots, Neon Clichés) */}
          <div className="lg:col-span-5 flex justify-center py-8" id="toolkits-hero-visual">
            <div className="relative w-80 h-80 bg-[#1A2F24] border border-[#D8D2C6]/30 rounded-md p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              
              {/* Elegant slow rotating dashed line circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-64 h-64 border border-[#B69A6B] border-dashed rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="w-48 h-48 border border-white/40 border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse] absolute"></div>
              </div>

              {/* Node diagram illustration inside card */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="flex justify-between items-center text-[8px] font-mono text-[#B69A6B]">
                  <span>SYSTEM LAYER DEEP-CYPRESS</span>
                  <span>NODE ACTIVE [01]</span>
                </div>

                {/* Central abstract node-line system diagram */}
                <div className="my-auto relative flex flex-col items-center justify-center h-40">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 opacity-10 flex flex-col justify-between py-4">
                    <div className="h-px bg-[#F4F1EB] w-full"></div>
                    <div className="h-px bg-[#F4F1EB] w-full"></div>
                    <div className="h-px bg-[#F4F1EB] w-full"></div>
                  </div>

                  {/* Horizontal node flow */}
                  <div className="flex items-center justify-between w-full px-4 relative z-10">
                    <div className="w-7 h-7 rounded-sm bg-[#8B5A44]/30 border border-[#8B5A44] flex items-center justify-center text-white text-[9px] font-mono shadow-sm">
                      IN
                    </div>
                    
                    <div className="flex-1 h-px bg-gradient-to-r from-[#8B5A44] to-[#B69A6B] relative">
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#B69A6B] animate-pulse"></span>
                    </div>

                    <div className="w-10 h-10 rounded-sm bg-[#B69A6B]/20 border border-[#B69A6B] flex items-center justify-center text-white text-[11px] font-mono shadow-lg">
                      AI
                    </div>

                    <div className="flex-1 h-px bg-gradient-to-r from-[#B69A6B] to-green-600 relative">
                      <span className="absolute -top-1 left-1/3 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>

                    <div className="w-7 h-7 rounded-sm bg-green-950 border border-green-700 flex items-center justify-center text-white text-[9px] font-mono shadow-sm">
                      OUT
                    </div>
                  </div>

                  {/* Vertical feedback branch (Human loop) */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="h-6 w-px bg-dashed border-l border-[#B69A6B]/50"></div>
                    <div className="bg-white/10 border border-white/20 rounded-xs px-2 py-0.5 text-[8px] font-mono text-white/70 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#B69A6B]"></span>
                      HUMAN INPUT
                    </div>
                  </div>
                </div>

                {/* Abstract Text footer */}
                <div className="flex justify-between items-center text-[7px] font-mono text-white/40 border-t border-white/10 pt-2.5">
                  <span>IMMERSATION AUTOMATION PRESENCE</span>
                  <span>C-Y-P-R-E-S-S</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. Toolkit Categories (Four elegant cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24" id="toolkits-categories">
          
          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="w-10 h-10 bg-[#1A2F24]/10 rounded-sm flex items-center justify-center text-[#1A2F24] mb-6">
              <Terminal className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Prompt Libraries" : "提示词库"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Reusable prompt systems for research, writing, strategy, and decision support." 
                : "用于深度学术研究、出版撰稿、商业画布推演与决策支持的可复用 Prompt 系统。"}
            </p>
          </div>

          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="w-10 h-10 bg-[#8B5A44]/10 rounded-sm flex items-center justify-center text-[#8B5A44] mb-6">
              <GitFork className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Workflow Blueprints" : "工作流蓝图"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Step-by-step automation maps for repeatable tasks." 
                : "将繁重且重复的机械性任务，解构并转化为逻辑严密、多应用协作的自动化地图。"}
            </p>
          </div>

          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="w-10 h-10 bg-[#B69A6B]/10 rounded-sm flex items-center justify-center text-[#B69A6B] mb-6">
              <Layers className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Automation Templates" : "自动化模板"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Ready-to-adapt templates for tools like Notion, Sheets, Make, n8n, or AI assistants." 
                : "适配 Notion 知识库、电子表格、Make、n8n 或是主流 AI 机器人的无门槛配置模板。"}
            </p>
          </div>

          <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300">
            <div className="w-10 h-10 bg-[#1C1C1C]/10 rounded-sm flex items-center justify-center text-[#1C1C1C] mb-6">
              <Cpu className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-3">
              {lang === "en" ? "Productivity Dashboards" : "效率仪表盘"}
            </h3>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en" 
                ? "Personal operating dashboards for planning, tracking, and review." 
                : "用于核心精力规划、目标进度监测与长期周期性自我盘点的个人静音控制台。"}
            </p>
          </div>

        </div>

        {/* 3. Featured Toolkit (The Calm AI Workflow Playbook) */}
        <div 
          className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 mb-24 relative overflow-hidden" 
          id="featured-toolkit-anchor"
        >
          <span className="absolute right-8 top-8 bg-[#8B5A44]/10 text-[#8B5A44] font-display text-[9px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 rounded-sm">
            {lang === "en" ? "CORE TOOLKIT" : "核心主打工具"}
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Panel Left */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-64 h-80 bg-[#1A2F24] border-2 border-[#D8D2C6] rounded-sm p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden m-2 group hover:scale-[1.01] transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#8B5A44]"></div>
                
                <div className="flex justify-between items-center text-[8px] font-mono text-[#B69A6B]">
                  <span>PLAYBOOK VOL. I</span>
                  <span>10x LEVERAGE</span>
                </div>

                <div className="my-auto py-4">
                  <span className="text-[11px] font-mono text-[#8B5A44] block mb-2 font-semibold">01 // WORKFLOWS</span>
                  <h3 className="font-serif text-xl font-normal text-white leading-tight mb-2">
                    The Calm AI
                  </h3>
                  <h3 className="font-serif text-xl font-normal text-white leading-tight mb-4">
                    Workflow Playbook
                  </h3>
                  <p className="text-[9px] font-serif text-white/50 leading-relaxed max-w-[180px]">
                    {lang === "en" 
                      ? "High-signal automation models for modern thinkers." 
                      : "建立自运行的个人数字生产与智识整合链条"}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[7px] font-mono text-white/30 border-t border-white/5 pt-3">
                  <span>SYSTEM BY IMMERSATION</span>
                  <span>EST. 2026</span>
                </div>
              </div>
            </div>

            {/* Content Right */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#8B5A44] block mb-2">
                {lang === "en" ? "FEATURED AUTOMATION SYSTEM" : "明星级智能杠杆系统"}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] mb-4 leading-tight">
                {lang === "en" 
                  ? "The Calm AI Workflow Playbook" 
                  : "从容 AI 工作流操作手册：让重复脑力劳动化为后台静音脚本"}
              </h2>
              <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en"
                  ? "A structured, highly practical introduction to building your first AI-assisted research, translation, synthesis, and publishing pipeline. This is not a list of generic prompt hacks, but a deep methodology centered around human review and automated variables."
                  : "这是一本专注于消除重复思考磨损的技术指南。全书不塞毫无营养的“神仙提示词”，而是深入本质，教您如何理清信息上下游、构建数据过滤器、配置自动触发器，并在最后的审阅环节牢牢把握人类智慧。"}
              </p>

              {/* Minimal parameters list */}
              <div className="border-t border-b border-[#D8D2C6]/50 py-4 mb-8 grid grid-cols-2 gap-4 text-xs font-serif">
                <div>
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50 block mb-1">
                    {lang === "en" ? "INCLUDED BLUEPRINTS" : "内置核心蓝图清单"}
                  </span>
                  <ul className="space-y-1 text-[#1C1C1C]/80">
                    <li>• {lang === "en" ? "Academic Synthesis Map" : "学术文献高保真缩写链"}</li>
                    <li>• {lang === "en" ? "Newsletter Variable Pipeline" : "信札流转与自动化推送脚本"}</li>
                  </ul>
                </div>
                <div>
                  <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50 block mb-1">
                    {lang === "en" ? "SPECIFICATION" : "技术参数与规格"}
                  </span>
                  <p className="text-[#1C1C1C]/80">
                    {lang === "en" ? "Format: PDF, Notion, Make Config" : "规格: 120页 PDF, Notion库, JSON 配置文件"}
                  </p>
                  <p className="text-[#1C1C1C]/80">
                    {lang === "en" ? "Skill Level: Intermediate" : "推荐受众: 中阶行动者 / 极客个体"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleAction(() => {
                    alert(lang === "en" ? "Opening a minimalist preview pane of the Playbook chapters..." : "正在为您开启《从容 AI 工作流指南》前三章节无损试读画布...");
                  })}
                  className="w-full sm:w-auto bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-sm transition-brand flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{lang === "en" ? "Preview Toolkit" : "免费预览工具包"}</span>
                </button>
                <button 
                  onClick={() => triggerAddToCart("calm-ai-playbook", "The Calm AI Workflow Playbook")}
                  className="w-full sm:w-auto border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white/30 hover:bg-white/60"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {addedItemId === "calm-ai-playbook" 
                      ? (lang === "en" ? "In Cart" : "已加入购物车") 
                      : (lang === "en" ? "Add to Cart" : "加入购物车 ($29.00)")}
                  </span>
                </button>
                <button 
                  onClick={() => handleAction(() => {
                    alert(lang === "en" ? "Downloading sample workbook assets..." : "正在下载本品配套试用工作流配置文件包...");
                  })}
                  className="w-full sm:w-auto text-[#1C1C1C]/70 hover:text-[#8B5A44] font-display text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Download Sample" : "下载试用组件"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 4. Workflow Demo Section (Interactive horizontal diagram) */}
        <div className="bg-[#1A2F24] text-[#F4F1EB] border border-white/15 rounded-md p-8 md:p-12 mb-24 relative overflow-hidden" id="workflow-demo-section">
          <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none select-none">
            <svg className="w-96 h-96" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2,2" />
            </svg>
          </div>

          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#B69A6B] block mb-2">
              {lang === "en" ? "THE IMMERSATION PIPELINE" : "智枢数据吞吐闭环示范"}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-white tracking-tight">
              {lang === "en" ? "Calm Data Architecture" : "从容、健康的自动化吞吐流"}
            </h2>
            <p className="font-serif text-xs text-[#F4F1EB]/70 mt-2">
              {lang === "en" 
                ? "Every toolkit we design is built to prevent alert fatigue. Here is the blueprint of how information moves."
                : "我们拒绝喧闹的弹窗提醒与疯狂的微型任务提示。我们提倡：静默后台执行，定时安全复盘，将数据转化为长期复利。"}
            </p>
          </div>

          {/* Horizontal System Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => handleAction(() => setActiveStep(idx))}
                className={`bg-white/5 border rounded-sm p-5 cursor-pointer transition-all duration-300 relative ${
                  activeStep === idx 
                    ? "border-[#B69A6B] bg-white/10 shadow-lg scale-[1.02]" 
                    : "border-white/10 hover:border-white/30 hover:bg-white/8"
                }`}
              >
                {/* Visual Arrow for next step on Desktop */}
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-4.5 z-20 text-[#B69A6B] opacity-50">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}

                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs text-[#B69A6B] font-bold">0{idx + 1}</span>
                  <span className={`w-2 h-2 rounded-full ${activeStep === idx ? "bg-green-400 animate-pulse" : "bg-white/20"}`}></span>
                </div>

                <h4 className="font-serif text-sm font-semibold text-white mb-2">{step.title[lang]}</h4>
                <p className="font-serif text-[11px] text-[#F4F1EB]/70 leading-relaxed">{step.desc[lang]}</p>
              </div>
            ))}
          </div>

          {/* Live indicator of the currently selected concept */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-sm p-4 text-xs font-serif text-[#F4F1EB]/75 max-w-xl mx-auto text-center">
            <span className="text-[#B69A6B] font-mono mr-2 uppercase tracking-widest">[FOCUS ON PHASE 0{activeStep + 1}]</span>
            {activeStep === 0 && (
              lang === "en" 
                ? "Filter inputs aggressively. Trash all popups, news-tickers, and distracting notifications before they enter your memory stack."
                : "源头过滤。将无价值的八卦推送、垃圾推送与催促警报直接清除，只放行高信噪比素材。"
            )}
            {activeStep === 1 && (
              lang === "en" 
                ? "Let large language models run the bulk processing of formatting, structure isolation, and translation in the silent background."
                : "格式化与特征点隔离由后台 AI 自动批处理执行，静默清洗，绝不频繁打扰大脑主频。"
            )}
            {activeStep === 2 && (
              lang === "en" 
                ? "This is the core. AI never posts directly. A human reviews the logic, shapes the tone, and infuses wisdom."
                : "人机协同重镇。AI 绝不越权直接公开，而由人类调动常识与价值观进行关键校验与质检。"
            )}
            {activeStep === 3 && (
              lang === "en" 
                ? "Outputs are clean, minimalist markdown, PDF formats, or cleanly structured table records."
                : "生成无杂质的 Markdown、无噪 PDF 或结构明朗的长期账单数据库记录，立等可查。"
            )}
            {activeStep === 4 && (
              lang === "en" 
                ? "Commit files locally or to private folders. The system remembers, so your active memory can remain fully silent and peaceful."
                : "提交本地离线介质或私有馆藏目录。电脑替你保存，让你能静下心进行长周期战略复盘。"
            )}
          </div>

        </div>

        {/* 5. Toolkits Library Grid */}
        <div className="mb-24" id="toolkit-library-anchor">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] tracking-tight mb-2 ink-text">
                {lang === "en" ? "Toolkit Library" : "智枢精巧工具箱合集"}
              </h2>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60">
                {lang === "en" ? "Proven templates and prompting structures for immediate leverage." : "涵盖身体调理、自动化提效、资本复盘的精密控制台与提示词组。"}
              </p>
            </div>

            {/* Sub-Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2" id="toolkits-tabs">
              {[
                { id: "all", label: { en: "All", zh: "全部" } },
                { id: "prompts", label: { en: "Prompts", zh: "提示词" } },
                { id: "blueprints", label: { en: "Blueprints", zh: "蓝图工作流" } },
                { id: "templates", label: { en: "Templates", zh: "模版配置" } }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleAction(() => setActiveCategory(tab.id as any))}
                  className={`text-[10px] font-display font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all cursor-pointer ${
                    activeCategory === tab.id 
                      ? "bg-[#1A2F24] text-[#F4F1EB]" 
                      : "bg-[#D8D2C6]/25 text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
                  }`}
                >
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Library */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="toolkits-library-grid">
            {toolkits
              .filter(tk => activeCategory === "all" || tk.category === activeCategory)
              .map((tk) => (
                <div 
                  key={tk.id}
                  className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-6 flex flex-col justify-between hover:border-[#8B5A44] hover:bg-white/80 transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <span className="font-display text-[9px] uppercase font-bold tracking-[0.15em] text-[#8B5A44]">
                        {tk.format[lang]}
                      </span>
                      <span className="text-[9px] text-[#1C1C1C]/45 font-mono uppercase">
                        {lang === "en" ? `LEVEL: ${tk.level.en}` : `推荐难度: ${tk.level.zh}`}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-normal text-[#1A2F24] mb-3 leading-snug">
                      {tk.title[lang]}
                    </h3>

                    <p className="font-serif text-xs text-[#1C1C1C]/65 leading-relaxed mb-6">
                      {tk.useCase[lang]}
                    </p>
                  </div>

                  {/* Actions footer inside card */}
                  <div className="border-t border-[#D8D2C6]/40 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] bg-[#1A2F24]/5 text-[#1A2F24] font-mono px-2 py-0.5 rounded-xs">
                        {tk.badge[lang]}
                      </span>
                      <span className="text-[9px] font-mono text-[#1C1C1C]/50 uppercase">PILLAR: {tk.pillar}</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(() => {
                          alert(lang === "en" 
                            ? `Opening instant preview of "${tk.title.en}" markdown and structure specs...` 
                            : `正在拉取并预览 “${tk.title.zh}” 的技术框架参数清单……`);
                        })}
                        className="flex-1 border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-[9px] font-semibold uppercase tracking-[0.15em] py-2.5 rounded-sm transition-colors text-center cursor-pointer bg-white/20 hover:bg-white"
                      >
                        {lang === "en" ? "Preview" : "预览大纲"}
                      </button>
                      <button 
                        onClick={() => {
                          if (tk.isFree) {
                            handleAction(() => alert(lang === "en" ? `Initiating secure download of "${tk.title.en}" free package...` : `正在打包免费试用配置文件 “${tk.title.zh}” 并初始化离线下载……`));
                          } else {
                            triggerAddToCart(tk.id, tk.title[lang]);
                          }
                        }}
                        className="flex-1 bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-[9px] font-semibold uppercase tracking-[0.15em] py-2.5 rounded-sm transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {tk.isFree ? (
                          <>
                            <Download className="w-3 h-3" />
                            <span>{lang === "en" ? "Download" : "下载试用"}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>
                              {addedItemId === tk.id 
                                ? (lang === "en" ? "In Cart" : "已入购物车") 
                                : (lang === "en" ? "Add to Cart" : "加入购物车")}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
          </div>

        </div>

        {/* 6. Human Review Note (Human-Centered AI brand value) */}
        <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-8 mb-24 max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center" id="human-review-note">
          <div className="w-12 h-12 bg-[#8B5A44]/10 text-[#8B5A44] rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-[#1A2F24] mb-1.5">
              {lang === "en" ? "Human-Centered AI: Automation with Discernment" : "人类审阅重镇：带有人性温度的技术自动化"}
            </h4>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en"
                ? "AI should reduce friction, not replace human judgment. Every prompt library and automated template we release is engineered with a strict review gate. We treat machines as multipliers for clarity, reserving crucial strategic discernment for the human mind."
                : "我们坚信 AI 应当减少机械阻力，而非替代您的核心常识。我们不推崇全自动生成的肤浅内容，每一套发布的工具包都强制预留了“人类校验层”。让机器去处理拼写、排版、基础提炼，而将逻辑穿透与决策力交还给清澈沉静的自己。"}
            </p>
          </div>
        </div>

        {/* 7. Elegant CTA */}
        <div className="text-center py-12 border-t border-[#D8D2C6]/50 max-w-xl mx-auto" id="toolkits-cta">
          <h2 className="font-serif text-3xl font-normal text-[#1A2F24] mb-4 ink-text">
            {lang === "en" ? "Start with One Workflow" : "从一个自动化闭环开始"}
          </h2>
          <p className="font-serif text-sm text-[#1C1C1C]/60 leading-relaxed mb-8">
            {lang === "en"
              ? "Download the Calm AI Workflow Starter Kit today. Offload shallow coordination labor and reclaim your cognitive sovereignty."
              : "立即下载我们的免费《从容 AI 工作流启动包》，体验大脑轻载、流程流转的无阻力美感。"}
          </p>
          {isSubscribed ? (
            <div className="bg-[#1A2F24] text-white p-6 rounded-sm inline-block shadow-md">
              <span className="font-serif text-sm">
                {lang === "en" ? "Subscription established successfully." : "系统澄澈信标订阅成功。"}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubscribeSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input 
                  type="email" 
                  placeholder={lang === "en" ? "Enter your email..." : "输入你的邮箱..."}
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                  className="bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none text-[#1C1C1C] text-xs px-5 py-4 rounded-sm font-sans placeholder-[#1C1C1C]/40 w-full flex-1"
                />
                <button 
                  type="submit"
                  className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm cursor-pointer whitespace-nowrap"
                >
                  {lang === "en" ? "SUBSCRIBE" : "加入智枢"}
                </button>
              </div>
              
              <div className="flex flex-col gap-2 text-left mt-2">
                <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50">
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
                      className="mt-0.5 rounded-sm border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44] transition-colors"
                    />
                    <div className="flex flex-col">
                      <span className="font-serif text-xs text-[#1C1C1C] group-hover:text-[#8B5A44] transition-colors">Body</span>
                      <span className="font-sans text-[9px] text-[#1C1C1C]/40">{lang === "en" ? "Mindfulness, health" : "正念，健康"}</span>
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
                      className="mt-0.5 rounded-sm border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44] transition-colors"
                    />
                    <div className="flex flex-col">
                      <span className="font-serif text-xs text-[#1C1C1C] group-hover:text-[#8B5A44] transition-colors">Tool</span>
                      <span className="font-sans text-[9px] text-[#1C1C1C]/40">{lang === "en" ? "AI, workflows" : "AI，工作流"}</span>
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
                      className="mt-0.5 rounded-sm border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44] transition-colors"
                    />
                    <div className="flex flex-col">
                      <span className="font-serif text-xs text-[#1C1C1C] group-hover:text-[#8B5A44] transition-colors">Capital</span>
                      <span className="font-sans text-[9px] text-[#1C1C1C]/40">{lang === "en" ? "Wealth, long-term" : "财富，长期主义"}</span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
