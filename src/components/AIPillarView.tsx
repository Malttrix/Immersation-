import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { subscribeToSendfox } from "../lib/sendfox";
import { supabase } from "../lib/supabase";
import { defaultArticles, Article } from "../articlesData";
import { 
  ArrowLeft, 
  Cpu, 
  Workflow, 
  Terminal, 
  FileCode, 
  Sliders, 
  FolderSync, 
  Layers, 
  Lock, 
  Download, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";

interface AIPillarViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onNavigateToNewsletter?: () => void;
  onNavigateToArticle?: (slug: string) => void;
  onAddToCart?: (item: any) => void;
  articles?: any[];
}

export default function AIPillarView({ 
  lang, 
  onBackToHome, 
  onPlayChime,
  onNavigateToNewsletter,
  onNavigateToArticle,
  onAddToCart,
  articles
}: AIPillarViewProps) {
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["tool"]);
  const [activeWorkflowExample, setActiveWorkflowExample] = useState(0);

  // Filter dynamic published articles for tool pillar
  const toolArticles = [...(articles || defaultArticles)]
    .filter((a) => a.pillar === "tool" && a.published !== false)
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
      icon: <Workflow className="w-5 h-5 text-[#1A2F24]" />,
      title: { en: "Repeatable AI Workflows", zh: "可复用的 AI 工作流" },
      desc: { 
        en: "Design repeatable workflows that connect different tools and processes to completely eliminate repetitive manual tasks.", 
        zh: "设计在后台静默运行的自动化工作流，连接不同的应用工具，彻底消除琐碎重复的手工数据流转。" 
      }
    },
    {
      icon: <Terminal className="w-5 h-5 text-[#1A2F24]" />,
      title: { en: "Structured Prompt Systems", zh: "结构化 Prompt 系统" },
      desc: { 
        en: "Build structured prompt systems to improve output consistency, reduce model drift, and ensure reliable results.", 
        zh: "建立高复用、结构化的 Prompt 系统，提升输出的稳定性与一致性，帮助大语言模型产出符合预期的高信号内容。" 
      }
    },
    {
      icon: <FileCode className="w-5 h-5 text-[#1A2F24]" />,
      title: { en: "Autonomous Assistants", zh: "智能助手协同" },
      desc: { 
        en: "Define strict functional roles and collaboration patterns to complete multi-step tasks with minimal manual coordination.", 
        zh: "合理编排具备单一专长的智能助手。通过清晰的职责切分，完成高难度的多步流转与整合任务。" 
      }
    },
    {
      icon: <FolderSync className="w-5 h-5 text-[#1A2F24]" />,
      title: { en: "Integration Templates", zh: "系统自动化集成" },
      desc: { 
        en: "Deploy standardized, tested templates for content organization, research collection, and database updates.", 
        zh: "提供简单可靠的自动化连接蓝图，支持多端内容同步、文件自动归档与知识库的一站式流转。" 
      }
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#1A2F24]" />,
      title: { en: "Structured Research Systems", zh: "结构化知识检索系统" },
      desc: { 
        en: "Synthesize large-scale multi-format knowledge sources into local libraries with clear reference and citation tracking.", 
        zh: "将全网、多格式的海量研报一键精炼为个人向量知识库，结合智能校对，确保信息出处真实、清晰、可回溯。" 
      }
    },
    {
      icon: <Layers className="w-5 h-5 text-[#1A2F24]" />,
      title: { en: "Personal Operating Systems", zh: "个人内容流转引擎" },
      desc: { 
        en: "Configure simple publishing pipelines that organize daily scattered insights into structured, accessible formats.", 
        zh: "配置轻量化内容装配线，捕捉日常零散的灵感火花，并全自动转换为排版得体、极具复用性的知识档案。" 
      }
    }
  ];

  const workflowExamples = [
    {
      title: { en: "Autonomous Research Digest Pipeline", zh: "外源研究简报自动汲取管线" },
      steps: [
        { name: "Ingestion", detail: "Scrapes RSS feeds of scientific papers and technical journals based on semantic relevance filters." },
        { name: "Synthesizer Agent", detail: "Translates and structures raw PDF content into academic bullet points, removing generic padding." },
        { name: "Drafting Agent", detail: "Formats research digests into structured bento layouts, embedding relevant tags automatically." },
        { name: "Manual Approval Gateway", detail: "Pushes draft to private Slack/Discord channel for human approval and one-click deployment." }
      ],
      stepsZh: [
        { name: "源头采录", detail: "根据你指定的语义相关性过滤规则，在静默后台全自动检索并抓取科研论文及技术周刊的RSS。" },
        { name: "研磨加工 Agent", detail: "将抓取到的冗长 PDF 文档提炼为精炼的学术级核心纲要，去除商业废话和冗余废纸。" },
        { name: "排版组装 Agent", detail: "自动将精炼大纲塞入规范的 Bento 组件骨架中，标记阅读时长、标签分类和出处。" },
        { name: "人在回路审核网关", detail: "一键推送到你的专属 Slack/Discord 频道，等待你完成最后10%的画龙点睛并一键发布。" }
      ]
    },
    {
      title: { en: "Personal Operating System Database Sync", zh: "个人操作系统多端多介质同步" },
      steps: [
        { name: "Voice Note capture", detail: "Transcribes dynamic speech input using whisper APIs, instantly stripping filler words." },
        { name: "Extraction Agent", detail: "Identifies tasks, schedules, core ideas, and links them to corresponding projects." },
        { name: "API Router", detail: "Pushes tasks to task managers, files to knowledge bases, and calendar events seamlessly." },
        { name: "Nightly Digest Summary", detail: "Compiles a calm 5-sentence log detailing what was achieved, filed, and queued." }
      ],
      stepsZh: [
        { name: "语音灵感捕捉", detail: "利用大模型端侧录音接口，极速收录无序碎语，并通过去底噪机制瞬间将其剔除杂词转换为文字。" },
        { name: "语义提炼 Agent", detail: "深入文本机理，准确辨识出“未尽事项”、“日程排期”、“核心火花”，并自动建立知识图谱关联。" },
        { name: "多向 API 路由", detail: "全自动将未尽任务塞入待办工具，日程塞入日历，高信号知识沉淀塞入本地 Markdown 文件夹。" },
        { name: "晚间静谧报告", detail: "夜深时，后台默默聚合产出一份“今日沉淀、今日收录、明日待启”的安静极简五句总结。" }
      ]
    }
  ];

  const toolkits = [
    {
      title: { en: "Intelligent Workflow Blueprints", zh: "智能多源知识管理蓝图" },
      type: "AUTOMATION BLUEPRINT + TEMPLATE PACK",
      price: "$29.00",
      desc: { 
        en: "A comprehensive automation template to connect different tools and processes, filtering and structuring scattered tasks.", 
        zh: "一套支持主流自动化工具的流程蓝图，帮助你温和连接多端内容、过滤多余杂音，并将分散的数据整理至统一的个人空间。" 
      }
    },
    {
      title: { en: "Structured Prompt Systems Guide", zh: "结构化 Prompt 系统模板" },
      type: "STRUCTURED PROMPT DIRECTORY",
      price: "$19.00",
      desc: { 
        en: "Twelve refined, repeatable prompt templates designed to keep your output stable and consistent for writing, research, and analysis.", 
        zh: "12 套精炼的结构化 Prompt 模板，帮助你在日常写作、学术研究、分析决策中实现极高的输出稳定性与内容复用率。" 
      }
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#F4F1EB] min-h-screen py-24 relative overflow-hidden" 
      id="ai-pillar-view"
    >
      {/* Technical Background Matrix lines (faint & sophisticated) */}
      <div className="absolute inset-0 opacity-[0.02] select-none pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A2F24" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <motion.div variants={itemVariants} className="mb-12" id="ai-breadcrumb">
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

        {/* HERO SECTION */}
        <div className="border-b border-[#D8D2C6]/50 pb-16 mb-20" id="ai-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4" id="ai-badge">
                <Cpu className="w-4 h-4 text-[#1A2F24]" />
                <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#1A2F24]">
                  {lang === "en" ? "THE TOOL PILLAR OF IMMERSATION" : "器 ｜ IMMERSATION 核心支柱之一"}
                </span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6"
              >
                {lang === "en" ? "AI Automation" : "AI 工作流与自动化"}
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-2xl"
              >
                {lang === "en" 
                  ? "Design repeatable AI workflows and build structured prompt systems. Turn scattered tasks into intelligent systems to reclaim your focus and valuable time."
                  : "通过连接不同的工具与流程，建立结构化 Prompt 系统，将琐碎重复的事务性工作转换为智能系统托管，夺回你最稀缺的时间与专注力。"}
              </motion.p>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <motion.div 
                variants={itemVariants}
                className="w-full max-w-[280px] aspect-square rounded-sm border border-[#D8D2C6] bg-[#E8DDCF]/20 flex flex-col justify-between p-6 shadow-sm relative group overflow-hidden"
              >
                {/* Micro tech nodes */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#1A2F24]/5 rounded-bl-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] text-[#8B5A44] tracking-widest">[ AUTOMATION ACTIVE ]</span>
                  <div className="w-2 h-2 rounded-full bg-[#1A2F24] animate-ping"></div>
                </div>

                <div className="my-auto flex flex-col items-center">
                  <Workflow className="w-10 h-10 text-[#1A2F24] mb-3 stroke-[1.25] group-hover:rotate-45 transition-transform duration-700" />
                  <span className="font-display text-[10px] font-bold tracking-widest text-[#1C1C1C]/50 uppercase mb-1">INTELLIGENT LEVERAGE</span>
                  <span className="font-serif italic text-xs text-[#1C1C1C]/70">The Software Platform</span>
                </div>

                <div className="border-t border-[#D8D2C6] pt-2 text-center">
                  <span className="font-mono text-[8px] text-[#1C1C1C]/40">SYS_OS_LOADED: 100%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* SECTION 1 & 2: WHY INTELLIGENT LEVERAGE MATTERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-[#D8D2C6]/50 mb-20" id="ai-philosophy">
          <div className="lg:col-span-5">
            <motion.span variants={itemVariants} className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              01 / THE AMPLITUDE OF THE INDIVIDUAL
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-2xl sm:text-3xl text-[#1A2F24] leading-tight"
            >
              {lang === "en" 
                ? "Why Intelligent Leverage Matters" 
                : "为什么在 AI 时代，“智能杠杆”是划分个体的分水岭？"}
            </motion.h2>
            <div className="w-12 h-[2px] bg-[#8B5A44] mt-4"></div>
          </div>

          <div className="lg:col-span-7 font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-6">
            <motion.p variants={itemVariants}>
              {lang === "en"
                ? "The digital workspace has become an administrative trap. Knowledge workers spend half their mental bandwidth formatting files, sorting folders, copying summaries, and scheduling tasks. This is low-leverage toil that wears down cognitive longevity. True sovereign workers refuse to be routing switches."
                : "当下的数字办公空间已然成为一个无休止的“行政泥潭”。绝大多数知识工作者将大量宝贵的心智带宽耗费在机械化的格式转换、资料分类、邮件往复与表格拉扯上。这是毫无复利效应的低级劳作。真正的未来个体，拒绝充当信息的肉身搬运工。"}
            </motion.p>
            <motion.p variants={itemVariants}>
              {lang === "en"
                ? "AI Automation is not about replacing human wisdom; it is about protecting it. By offloading deterministic information sorting to tailored multi-agent workflows, you reclaim the pristine, focused morning hours. You supply the final critical judgment; the system handles the noise. This is the definition of a leveraged individual."
                : "我们倡导的 AI 自动化绝不是为了替代人类的温情与核心判断，而是为了捍卫它。通过将确定性的信息筛选、格式归档全面托管给定制的多代理（Multi-Agent）管线，你得以保全最纯净的晨间心智。让系统静静梳理杂音，你只需负责最后的决策画龙。这，才是未来个体的智能放大。"}
            </motion.p>
          </div>
        </div>

        {/* SECTION 3: KEY TOPICS GRID */}
        <div className="mb-24" id="ai-topics">
          <div className="text-center max-w-xl mx-auto mb-16">
            <motion.span variants={itemVariants} className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              02 / TECHNICAL DOMAINS
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-2xl sm:text-3xl text-[#1A2F24]"
            >
              {lang === "en" ? "AI & Automation Key Topics" : "六大智能自动化构件"}
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
                  <div className="w-10 h-10 rounded-full bg-white border border-[#D8D2C6]/60 flex items-center justify-center mb-6 group-hover:border-[#1A2F24] transition-colors">
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

        {/* SECTION 6: WORKFLOW BLUEPRINTS (INTERACTIVE TAB) */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="ai-blueprints-interactive">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left sidebar: Tabs switcher */}
            <div className="lg:col-span-4">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
                03 / INTERACTIVE PROTOCOLS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24] mb-6">
                {lang === "en" ? "Live Workflow Blueprints" : "系统级自动化管线示例"}
              </h2>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60 leading-relaxed mb-8">
                {lang === "en" 
                  ? "Explore the precise mechanical schematic of our active workflows. These are production pipelines we run daily at Immersation." 
                  : "透视我们在智枢阁日常运转的真实业务骨架。高确定性，剔除一切无意义耗损。"}
              </p>

              <div className="flex flex-col gap-2.5">
                {workflowExamples.map((flow, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onPlayChime) onPlayChime();
                      setActiveWorkflowExample(idx);
                    }}
                    className={`text-left font-display text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-sm transition-all duration-300 flex items-center justify-between border ${
                      activeWorkflowExample === idx 
                        ? "bg-[#1A2F24] text-[#F4F1EB] border-[#1A2F24]" 
                        : "bg-white/40 border-[#D8D2C6] text-[#1C1C1C]/75 hover:bg-white/70"
                    }`}
                  >
                    <span>{flow.title[lang]}</span>
                    <ArrowRight className={`w-3.5 h-3.5 transform transition-transform ${activeWorkflowExample === idx ? "translate-x-1" : "translate-x-0"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Steps Visualizer */}
            <div className="lg:col-span-8 bg-white/40 border border-[#D8D2C6] rounded-sm p-8 md:p-10">
              <div className="border-b border-[#D8D2C6]/40 pb-4 mb-8 flex justify-between items-center">
                <span className="font-mono text-[9px] text-[#8B5A44] tracking-widest uppercase">PIPELINE DIAGRAM</span>
                <span className="font-mono text-[9px] text-[#1C1C1C]/40">FLOW_ID_0{activeWorkflowExample + 1}</span>
              </div>

              <div className="space-y-8 relative">
                {/* Thin joining line */}
                <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-[#D8D2C6]/60 pointer-events-none hidden sm:block"></div>

                {(lang === "en" ? workflowExamples[activeWorkflowExample].steps : workflowExamples[activeWorkflowExample].stepsZh).map((step, stepIdx) => (
                  <div key={stepIdx} className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#1A2F24] text-[#F4F1EB] font-mono text-xs font-bold flex items-center justify-center shrink-0 border-[3px] border-white/80 shadow-xs">
                      {stepIdx + 1}
                    </div>
                    
                    <div className="pt-0.5">
                      <h4 className="font-serif text-base font-normal text-[#1A2F24] mb-1.5">{step.name}</h4>
                      <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/70 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: FEATURED ARTICLES */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="ai-articles">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
                04 / INTELLECTUAL NOTES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
                {lang === "en" ? "Featured AI Workflow Articles" : "精选工具智能论述"}
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
            {toolArticles.map((article) => {
              const artTitle = typeof article.title === "object" && article.title !== null ? (article.title[lang] || article.title.en || article.title.zh) : (article.title || "");
              const artExcerpt = typeof article.excerpt === "object" && article.excerpt !== null ? (article.excerpt[lang] || article.excerpt.en || article.excerpt.zh) : (article.excerpt || "");
              const artCategory = article.category ? (typeof article.category === "object" && article.category !== null ? (article.category[lang] || article.category.en) : article.category) : "AI & TOOLS";
              const artDate = article.date ? (typeof article.date === "object" && article.date !== null ? (article.date[lang] || article.date.en) : article.date) : "";
              const artReadTime = article.readTime ? (typeof article.readTime === "object" && article.readTime !== null ? (article.readTime[lang] || article.readTime.en) : article.readTime) : "";

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

        {/* SECTION 5: TOOLKITS SHOP */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="ai-toolkits">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              05 / DIGITAL PUBLISHING
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
              {lang === "en" ? "AI Toolkits & n8n/Make blueprints" : "高阶自动化微型装备库"}
            </h2>
            <p className="font-serif text-xs text-[#1C1C1C]/60 mt-2">
              {lang === "en" 
                ? "Immediate download access to refined automation files and configuration scripts." 
                : "一键获取已打包的 n8n蓝图、XML 模块包，即刻打通你的智能杠杆流水线"}
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
                      if (onAddToCart) {
                        onAddToCart({
                          id: (kit as any).id || "ai-toolkit-" + idx,
                          title: kit.title,
                          price: parseFloat(kit.price.replace(/[^0-9.]/g, "")) || 19.00,
                          format: kit.type,
                          cover: "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-Light-scaled.png"
                        });
                      }
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
                {lang === "en" ? "AUTOMATE EXCELLENCE" : "卓越交付自动化"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-3">
                {lang === "en" ? "Subscribe for AI & Automation Briefings" : "订阅智枢阁 AI 自动化静默简报"}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-white/70 leading-relaxed">
                {lang === "en"
                  ? "Join our quiet digital publishing circle. No hype. No generic AI hacks. Just rigorous, tested architectural scripts and prompt patterns."
                  : "订阅智枢阁器物栏目。我们拒绝追逐快餐式的 AI 行业花哨营销和低劣话术。专注于为你输送真正落地、能跨场景迁移、高抗干扰的业务装配闭环。"}
              </p>
            </div>

            <div className="w-full lg:w-auto relative z-10 flex flex-col sm:flex-row items-center gap-3">
              {isSubscribed ? (
                <div className="bg-white/10 border border-[#B69A6B] text-[#F4F1EB] px-6 py-4 rounded-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#B69A6B]" />
                  <span className="font-serif text-xs">
                    {lang === "en" ? "Automation Beacon connection established successfully." : "工具系统澄澈信标订阅成功。"}
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
