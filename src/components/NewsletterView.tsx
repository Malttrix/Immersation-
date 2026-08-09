import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { subscribeToSendfox } from "../lib/sendfox";
import { supabase } from "../lib/supabase";
import { 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Activity, 
  Cpu, 
  Coins, 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  X, 
  Search,
  ChevronRight,
  Filter,
  Music
} from "lucide-react";

interface NewsletterViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  newsletterIssues?: NewsletterIssue[];
}

interface NewsletterIssue {
  id: string;
  featured?: boolean;
  pillar: "body" | "tool" | "capital" | "frameworks";
  category: { en: string; zh: string };
  title: { en: string; zh: string };
  excerpt: { en: string; zh: string };
  content: { en: string; zh: string };
  date: string;
  readTime: { en: string; zh: string };
  tags: string[];
  cover?: string;
}

const renderInlineMarkdown = (text: string) => {
  if (!text) return null;

  const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      return (
        <a 
          key={i} 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#8B5A44] underline underline-offset-2 hover:text-[#1A2F24] font-medium transition-colors"
        >
          {linkText}
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-[#1A2F24]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={i} className="bg-[#E8DDCF]/40 text-[#1A2F24] px-1.5 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
};

const renderMarkdownContent = (contentStr: string) => {
  if (!contentStr) return null;

  const paragraphs = contentStr.split(/\n\s*\n/);

  return paragraphs.map((para, index) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // H1 Heading
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      return (
        <h1 key={index} className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A2F24] pt-8 pb-3 border-b border-[#D8D2C6]/40 tracking-tight">
          {renderInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
        </h1>
      );
    }

    // H2 Heading (## Heading - e.g. ## 为什么重要, ## Immersation 信号)
    if (trimmed.startsWith("## ") && !trimmed.startsWith("### ")) {
      return (
        <h2 key={index} className="font-serif text-xl sm:text-2xl font-semibold text-[#1A2F24] pt-8 pb-3 border-b border-[#D8D2C6]/40 tracking-tight">
          {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
        </h2>
      );
    }

    // H3 Heading
    if (trimmed.startsWith("### ") && !trimmed.startsWith("#### ")) {
      return (
        <h3 key={index} className="font-serif text-lg sm:text-xl font-semibold text-[#1A2F24] pt-6 pb-2 border-b border-[#D8D2C6]/30">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
    }

    // H4 Heading
    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={index} className="font-serif text-base font-semibold text-[#8B5A44] pt-4 pb-1">
          {renderInlineMarkdown(trimmed.replace(/^####\s+/, ""))}
        </h4>
      );
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteText = trimmed.split("\n").map(l => l.replace(/^>\s?/, "")).join(" ");
      return (
        <blockquote key={index} className="border-l-2 border-[#8B5A44] pl-5 py-3 my-4 bg-[#E8DDCF]/20 italic text-sm text-[#1C1C1C]/80 font-serif leading-relaxed">
          {renderInlineMarkdown(quoteText)}
        </blockquote>
      );
    }

    // Images
    if (trimmed.startsWith("![") && trimmed.includes("](")) {
      const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        return (
          <figure key={index} className="my-6 space-y-2 text-center">
            <img src={src} alt={alt} referrerPolicy="no-referrer" className="mx-auto rounded-sm border border-[#D8D2C6]/60 shadow-sm max-h-[400px] object-cover" />
            {alt && <figcaption className="font-sans text-[10px] text-stone-400 uppercase tracking-widest">{alt}</figcaption>}
          </figure>
        );
      }
    }

    // Audio syntax
    if (trimmed.includes("{{audio:")) {
      const audioMatch = trimmed.match(/\{\{audio:(.*?)\}\}/);
      if (audioMatch) {
        const url = audioMatch[1];
        return (
          <div key={index} className="bg-[#1A2F24]/5 border border-[#8B5A44]/30 rounded-sm p-4 my-6 flex items-center gap-4">
            <Music className="w-6 h-6 text-[#8B5A44] shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-display text-[9px] font-bold text-[#8B5A44] uppercase tracking-widest block mb-1">Embedded Media Player</span>
              <audio src={url} controls className="w-full h-8 accent-[#8B5A44]" />
            </div>
          </div>
        );
      }
    }

    // Bulleted list
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("+ ") || trimmed.includes("\n* ") || trimmed.includes("\n- ") || trimmed.includes("\n+ ")) {
      const listItems = trimmed.split(/\n(?=[*+-]\s)/).map(item => item.replace(/^[*-+]\s+/, "").trim());
      return (
        <ul key={index} className="list-disc pl-6 space-y-2.5 font-sans text-sm sm:text-base text-[#1C1C1C]/80">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems = trimmed.split(/\n(?=\d+\.\s)/).map(item => item.replace(/^\d+\.\s+/, "").trim());
      return (
        <ol key={index} className="list-decimal pl-6 space-y-3 font-sans text-sm sm:text-base text-[#1C1C1C]/80">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
    }

    // Code block
    if (trimmed.startsWith("`") || trimmed.startsWith("```")) {
      const cleanCode = trimmed.replace(/```[a-z]*/g, "").replace(/`/g, "").trim();
      return (
        <pre key={index} className="bg-[#1A2F24] text-[#F4F1EB] rounded-sm p-6 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed my-6 border border-white/5">
          {cleanCode}
        </pre>
      );
    }

    // Fallback paragraph
    return (
      <p key={index} className="indent-0 leading-relaxed font-sans text-sm sm:text-base text-[#1C1C1C]/80">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
};

export default function NewsletterView({ lang, onBackToHome, onPlayChime, newsletterIssues: propNewsletterIssues }: NewsletterViewProps) {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["body", "tool", "capital"]);
  const [activeIssue, setActiveIssue] = useState<NewsletterIssue | null>(null);
  const [videoError, setVideoError] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scroll to top when view is mounted
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Video scrub on scroll effect
  useEffect(() => {
    let animationFrameId: number;
    let targetTime = 0;

    const renderLoop = () => {
      if (videoRef.current && !Number.isNaN(videoRef.current.duration)) {
        const dur = videoRef.current.duration;
        if (dur > 0) {
          // Calculate target time based on scroll position (increased speed: 40px = 1 sec)
          targetTime = (window.scrollY / 40) % dur;
          const diff = targetTime - videoRef.current.currentTime;
          
          // Smoothly approach target time; if difference is large (wrap around), snap it
          if (Math.abs(diff) > dur / 2) {
            videoRef.current.currentTime = targetTime;
          } else {
            videoRef.current.currentTime += diff * 0.15;
          }
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handlePillarClick = (pillar: string) => {
    if (onPlayChime) onPlayChime();
    setSelectedPillar(pillar);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subEmail.trim()) {
      const emailToSubscribe = subEmail.trim();
      const success = await subscribeToSendfox(emailToSubscribe, { tags: subInterests });
      if (success) {
        setIsSubscribed(true);
        setSubEmail("");
        if (onPlayChime) onPlayChime();
        setTimeout(() => setIsSubscribed(false), 8000);
        
        if (supabase) {
          try {
            await supabase.from("newsletter_subscriptions").insert([{ email: emailToSubscribe, tags: subInterests, subscribed_at: new Date().toISOString() }]);
          } catch (e) {}
        }
      } else {
        alert(lang === "en" ? "Subscription failed. Please ensure your SendFox API key is correct." : "订阅失败，请检查您的 SendFox API 密钥。");
      }
    }
  };

  const handleOpenIssue = (issue: NewsletterIssue) => {
    if (onPlayChime) onPlayChime();
    setActiveIssue(issue);
    document.body.style.overflow = "hidden";
  };

  const handleCloseIssue = () => {
    if (onPlayChime) onPlayChime();
    setActiveIssue(null);
    document.body.style.overflow = "";
  };

  const defaultNewsletterIssues: NewsletterIssue[] = [
    {
      id: "personal-intelligence",
      pillar: "frameworks",
      category: { en: "FRAMEWORKS", zh: "核心框架" },
      title: { 
        en: "What Is a Personal Intelligence System?", 
        zh: "什么是个人智能系统？" 
      },
      excerpt: {
        en: "A calm framework for connecting body, tool, and capital into one future-ready operating system.",
        zh: "一个将身体、工具与资本连通为一体的未来心智操作系统，助你应对无尽的外部杂讯。"
      },
      content: {
        en: `### Introduction

The modern world does not suffer from a lack of information. It suffers from a lack of **coherence**. 

Every day, you are bombarded with productivity hacks, health advice, and investment strategies. Yet, most of this advice is fragmented, leading to mental fatigue and system-wide breakdown. 

A **Personal Intelligence System** is a unified cognitive, biological, and wealth architecture designed to align your physical energy, your digital leverage, and your long-term assets.

---

### The Three Interconnected Nodes

To build a high-signal life, you must understand how these three pillars influence each other:

1. **Body (Mindfulness Health & Longevity)**  
   Your physical nervous system is the hardware of your intelligence. If your sleep is compromised, your focus degrades. If your focus degrades, you cannot build efficient systems or make sound capital decisions.
   
2. **Tool (AI Automation)**  
   Your workflows are the software. By delegating repetitive, low-leverage tasks to custom AI systems, you reclaim the bandwidth needed for deep, creative thought.
   
3. **Capital (Wealth Cognition)**  
   Your financial assets represent stored energy. When you think long-term and eliminate emotional trading, you create a calm buffer that protects your physical and mental freedom.

---

### Moving From Noise to System

To transition from fragmented actions to an integrated system:
- **Audit your focus hours:** Protect your morning recovery state before engaging with digital interfaces.
- **Automate the routine:** Build explicit, standard operating procedures for information filtering and file sorting.
- **Think in compounding cycles:** Invest only in assets that build robust long-term digital sovereignty.

*Not more information. A better system.*`,
        zh: `### 导言

现代人所面临的问题从来不是缺少信息，而是缺乏**连贯性**。

每天，我们都会被海量的效率指南、健康建议与投资分析所淹没。然而，这些建议彼此割裂，最终导致心智超载和系统性疲惫。

一个**个人智能系统**（Personal Intelligence System）是一套将你的身体能量、数字杠杆与长期资本无缝对接的有机架构。

---

### 三大互联支柱

为了构建一个高信号的生活，你必须理解这三个支柱是如何相互促进的：

1. **身（正念健康与长寿管理）**  
   你的身体与神经系统是你的“智能硬件”。如果睡眠不佳，注意力就会涣散。而注意力涣散，你就无法搭建高效的工作流，更无法在资本决策中保持冷静。
   
2. **器（AI 自动化）**  
   你的工作流是“软件”。通过将重复、低杠杆的任务委托给定制的 AI 自动化流，你可以重新夺回宝贵的、用于深度思考的时间带宽。
   
3. **财（财富认知）**  
   你的财务资产是储存的能量。当你以长期复利思维替代情绪化决策，你就为自己构建了一个坚不可摧的缓冲垫，从而保护身体与心智的真正自由。

---

### 从噪音走向系统

要从碎片化的努力过渡到一体化的系统：
- **审计你的专注时长：** 在与数字界面交互前，优先保护好早晨的精力和恢复状态。
- **将常规流程自动化：** 为信息筛选和文件归档建立明确的、标准的 SOP（标准作业程序）。
- **按复利周期思考：** 只把资源投在能够构建长期数字自主权的资产上。

*不是更多噪音，而是更好的系统。*`
      },
      date: "July 2026",
      readTime: { en: "15 min read", zh: "15 分钟阅读" },
      tags: ["System", "Core", "Longevity", "AI"]
    },
    {
      id: "ai-workflows-reclaim-time",
      pillar: "tool",
      category: { en: "AI AUTOMATION", zh: "AI 自动化" },
      title: { 
        en: "How AI Automation Helps Knowledge Workers Reclaim Time", 
        zh: "AI 自动化如何帮助知识工作者重新夺回时间？" 
      },
      excerpt: {
        en: "A practical framework for reducing repetitive work without losing human judgment.",
        zh: "在保持人类核心判断力的同时，大幅削减重复性劳动的实操系统。"
      },
      content: {
        en: `### The Time Deficit

Most knowledge workers spend up to 40% of their day on administrative overhead: routing emails, copying data between tools, structuring research notes, and scheduling meetings. 

This is "work about work." It drains cognitive energy and leaves little space for the deep, focused labor that creates genuine value.

---

### The Three-Step Automation Filter

To reclaim your time, run your weekly tasks through this filter:

1. **Identify the Loop:** Locate repetitive tasks that occur regularly (e.g., summarizing weekly industry reports).
2. **Standardize the Inputs:** Ensure the raw data has a consistent structure, making it easily digestible by LLM engines.
3. **Design the Agent Pipeline:** Build a silent server-side flow that fetches, synthesizes, and drafts the result, leaving only the final 10% "approval and polish" phase to yourself.

---

### The Human-in-the-Loop Principle

We do not believe in full autonomy where AI makes critical decisions. That is high risk. Instead, use AI as a high-bandwidth assistant. 

It organizes the chaos; you supply the judgment. This is the definition of **Intelligent Leverage**.`,
        zh: `### 时间赤字

大多数知识工作者每天有多达 40% 的时间消耗在琐碎的事务上：分发邮件、在工具间复制数据、整理研究笔记和协调会议。

这些是“为了工作而进行的工作”。它不仅极大地消耗了认知能量，而且挤占了真正能够创造长期价值的深度专注时间。

---

### 三步自动化过滤法则

要夺回你的时间，请将你的每周任务放入这套过滤器中：

1. **找出循环：** 锁定那些定期发生且规则明确的任务（例如，总结每周的行业动态）。
2. **规范输入：** 确保原始数据结构一致，从而能被大语言模型（LLM）轻松解析。
3. **搭建代理流水线：** 建立一套在后台静默运行的自动化流，完成抓取、综合与起草，把最后 10% 的“审核与润色”留给自己。

---

### “人在回路”原则 (Human-in-the-Loop)

我们不主张将关键决策完全交给 AI。这是高风险的做法。相反，应该将 AI 视为超高带宽的特助。

它负责理清混乱，你负责给出最终判断。这就是**智能杠杆**的本质。`
      },
      date: "June 2026",
      readTime: { en: "12 min read", zh: "12 分钟阅读" },
      tags: ["Workflows", "Leverage", "Time", "AI"]
    },
    {
      id: "recovery-productivity-strategy",
      pillar: "body",
      category: { en: "MINDFULNESS HEALTH", zh: "正念健康" },
      title: { 
        en: "Why Recovery Is a Productivity Strategy", 
        zh: "为什么恢复力是一种生产力策略？" 
      },
      excerpt: {
        en: "Notes on sleep, recovery, stress regulation, and sustainable performance.",
        zh: "关于睡眠、高效恢复、压力调节与可持续心智表现的底盘之作。"
      },
      content: {
        en: `### The Exhaustion Fallacy

Modern culture glorifies non-stop grinding. But constant cognitive activation without deliberate recovery causes neural friction, brain fog, and chronic burnout. 

If your brain is depleted, the decisions you make are subpar, leading to errors that take days to fix. Therefore, **strategic rest is not the opposite of work; it is the source of work.**

---

### Active vs. Passive Recovery

Many believe that sitting on a couch browsing social media is "recovery." In reality, this passive consumption keeps your prefrontal cortex highly active, searching for dopamine triggers. 

**Active Recovery** involves:
- **Nervous System Reset:** Diaphragmatic breathing and long exhales to transition your body from sympathetic (fight-or-flight) to parasympathetic (rest-and-digest) dominance.
- **Sleep Optimization:** Dark, cool sleep environments with absolutely no blue screens 90 minutes before rest.
- **Physical Integration:** Yoga, quiet walks, or non-sleep deep rest (NSDR) to flush cortisol from your brain.

---

### Sustainable Cognitive Longevity

By treating recovery with the same seriousness as a high-stakes meeting, you preserve your cognitive capital. You run colder, think faster, and sustain high output across decades, not just weeks.`,
        zh: `### 疲惫的谬误

现代文化常常美化无休止的“内卷”。然而，缺乏刻意恢复的持续心智运转会引发大脑的“神经摩擦”、脑雾，并最终走向慢性透支。

当大脑精疲力竭时，你做出的决策将十分低效，产生的错误往往需要花几天去修补。因此，**战略性休息绝非工作的对立面，它是工作的燃料源。**

---

### 主动恢复 vs 被动休息

很多人以为，躺在沙发上刷社交媒体就是“恢复”。事实上，这种被动消费会让你的前额叶皮层持续保持高度活跃，不断搜寻多巴胺。

真正的**主动恢复**包括：
- **神经系统重置：** 通过腹式呼吸和延长呼气，引导身体从交感神经（战斗或逃跑）主导，顺利切换到副交感神经（休息和消化）主导。
- **睡眠精细化优化：** 保持暗、冷、安静的睡眠环境，睡前 90 分钟绝对不接触蓝光屏幕。
- **生理重构：** 散步、拉伸或非睡眠深度休息（NSDR），以促进皮质醇代谢。

---

### 可持续的心智长寿管理

如果你将恢复看得和高管会议一样重要，你就等于在保护自己的“认知资本”。你会运转得更沉稳、思考得更透彻，并将超强心智产出维持几十年，而不仅仅是几周。`
      },
      date: "May 2026",
      readTime: { en: "10 min read", zh: "10 分钟阅读" },
      tags: ["Sleep", "Recovery", "Nervous System", "Longevity"]
    },
    {
      id: "wealth-cognition-framework",
      pillar: "capital",
      category: { en: "WEALTH COGNITION", zh: "财富认知" },
      title: { 
        en: "Wealth Cognition: A Calm Framework for Long-Term Value", 
        zh: "财富认知：面向长期价值的冷静框架" 
      },
      excerpt: {
        en: "Articles and frameworks on long-term wealth thinking, risk awareness, and market cycles.",
        zh: "剥离情绪干扰的财富思维，跨越市场周期的资本判断与纪律性决策。"
      },
      content: {
        en: `### The Psychological Battlefield of Wealth

Most financial loss is caused by psychological misalignment, not a lack of market information. FOMO (Fear of Missing Out), panic during drawdowns, and over-leverage are emotional symptoms that ruin long-term compounding.

**Wealth Cognition** is the discipline of protecting your decision-making funnel from emotional pollution.

---

### The Capital Allocation Quadrant

To build resilient assets, structure your resource allocation as follows:
1. **Sovereign Base:** Real, liquid capital and operational cash flow that can sustain you for 12+ months without any outside income.
2. **Cognitive Reserve:** Non-negotiable investments in books, deep research briefings, and specialized systems that upgrade your earning engine.
3. **Asymmetrical Compounders:** High-upside, low-downside intellectual properties, software assets, or equity positions that you understand deeply.
4. **Defensive Shield:** Fixed assets and low-risk bonds that protect your base against severe macroeconomic shocks.

---

### The Wisdom of Staying Quiet

In market cycles, those who act the most usually pay those who are most patient. Refuse to chase daily hype. Formulate your system, establish your filters, and let compounding do the heavy lifting in silence.`,
        zh: `### 财富的心智战场

大多数财务损失并非源于市场信息的匮乏，而是由心理失调引发的。对踏空的恐惧（FOMO）、下跌时的恐慌以及过度杠杆，都是毁灭长期复利的心灵毒药。

**财富认知**是一种帮助你将“决策通道”与情绪污染彻底隔离的纪律。

---

### 资本配置象限

为了建立有韧性的资产，请这样梳理你的资源配置：
1. **自主权基地：** 能够维持你 12 个月以上体面生活的流动资金和运营现金流，不需要任何外界收入支持。
2. **认知储备：** 绝对不可削减的对书本、深度研究简报以及升级自身挣钱引擎的专属系统性投入。
3. **非对称复利器：** 具有“极高上行空间、极低下行风险”的、你本人能深刻理解的知识产权、软件资产或股权。
4. **防御盾牌：** 能保护你基本盘不受剧烈宏观波动冲击的稳健底层资产。

---

### 静默的智慧

在市场周期中，活动最频繁的人往往在向最耐心的人支付溢价。拒绝追逐每日的热点。制定你的系统，确立你的过滤网，让复利在寂静中为你前行。`
      },
      date: "April 2026",
      readTime: { en: "14 min read", zh: "14 分钟阅读" },
      tags: ["Wealth", "Compounding", "Risk", "Psychology"]
    },
    {
      id: "immersation-model-pillars",
      pillar: "frameworks",
      category: { en: "FRAMEWORKS", zh: "核心框架" },
      title: { 
        en: "Body, Tool, Capital: The Immersation Model", 
        zh: "身、器、财：Immersation 的个人智能模型" 
      },
      excerpt: {
        en: "Explaining the three interconnected nodes of our model and why they must be nurtured together.",
        zh: "揭秘三大底盘级互联系统，以及为何唯有系统性运作才能迸发心智威力。"
      },
      content: {
        en: `### The Myth of One-Dimensional Success

We have all seen the brilliant developer who suffers from severe insomnia, or the wealthy investor who constantly operates in high-stress states. These are fragmented lives. 

True sovereign capacity requires an integrated approach. The Immersation Model connects **Body**, **Tool**, and **Capital** into a self-reinforcing wheel.

---

### The Cycle of Alignment

- **From Body to Tool:** When your nervous system is calm, you design better automated systems. You write elegant prompt pipelines and structure clean files.
- **From Tool to Capital:** When automated systems take over low-leverage tasks, your cognitive bandwidth is freed. You can analyze market cycles with academic precision.
- **From Capital to Body:** When long-term capital provides financial buffer, your stress decreases. You can afford to shut off all digital devices, sleep deeply, and invest in biological longevity.

---

### The Immutable Principle

Any weakness in one pillar immediately drains the other two. If your body is broken, your tools fail and your capital leaks. Nurture them together as a single, beautifully engineered architecture.`,
        zh: `### 单一维度成功的谎言

我们常能见到极其聪慧却饱受重度失眠折磨的程序员，或者极其富有却终日焦虑的投资者。这些都是割裂的人生。

真正的自主主权能力需要一个全面融合的策略。Immersation 模型将**身**、**器**、**财**连通成一个自我增强的飞轮。

---

### 能量流转闭环

- **由身至器：** 当你的神经系统重归平稳，你就会设计出更精妙的自动化系统，写出更优雅的 Prompt，梳理出极简的文档结构。
- **由器至财：** 当自动化系统接管了低效、琐碎的工作，你的认知带宽被彻底释放，你便能以学术般的严密去透视并顺应资产周期。
- **由财至身：** 当长期资本配置为你筑起财务安全盾，你的压力就会断崖式下降。你得以从容切断电子网络，安稳深睡，并持续为生理长寿投资。

---

### 铁律

任何一个支柱的破损，都会迅速抽干另外两个支柱的能量。如果身体垮了，工具生态与资本底牌都将倾覆。将它们视为一个和谐的、精心雕琢的生命操作系统。`
      },
      date: "March 2026",
      readTime: { en: "8 min read", zh: "8 分钟阅读" },
      tags: ["Model", "System", "Integration", "Compounding"]
    }
  ];

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

  const rawNewsletterIssues = propNewsletterIssues || defaultNewsletterIssues;
  const newsletterIssues = rawNewsletterIssues.map(issue => ({
    ...issue,
    title: ensureBilingual(issue.title, "Untitled Newsletter", "未命名信札"),
    excerpt: ensureBilingual(issue.excerpt, "", ""),
    content: ensureBilingual(issue.content, "", ""),
    category: ensureBilingual(issue.category, "General", "综合"),
    readTime: ensureBilingual(issue.readTime, "5 min read", "5 分钟阅读"),
  }));

  // Auto-open newsletter issue modal if target query parameter is present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const issueQuery = params.get("slug") || params.get("issue") || params.get("id");
    if (issueQuery && newsletterIssues && newsletterIssues.length > 0) {
      const match = newsletterIssues.find(
        (i) => i.id === issueQuery || 
               (i as any).slug === issueQuery || 
               ((i as any).slug && (i as any).slug.toLowerCase() === issueQuery.toLowerCase()) ||
               i.id.toLowerCase() === issueQuery.toLowerCase()
      );
      if (match) {
        setActiveIssue(match);
        document.body.style.overflow = "hidden";
      }
    }
  }, [newsletterIssues]);

  const filteredIssues = newsletterIssues.filter(issue => {
    // Category filter
    if (selectedPillar !== "all") {
      if (issue.pillar !== selectedPillar) return false;
    }
    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const titleMatch = issue.title[lang].toLowerCase().includes(q);
      const excerptMatch = issue.excerpt[lang].toLowerCase().includes(q);
      const contentMatch = issue.content[lang].toLowerCase().includes(q);
      const tagMatch = issue.tags.some(tag => tag.toLowerCase().includes(q));
      return titleMatch || excerptMatch || contentMatch || tagMatch;
    }
    return true;
  });

  const featuredIssue = newsletterIssues.find(issue => issue.featured) || newsletterIssues[0];

  return (
    <div className="bg-[#F4F1EB] min-h-screen relative overflow-hidden" id="newsletter-view-layout">
      {/* Video Background for Hero */}
      <div className="absolute top-0 left-0 w-full h-[650px] z-0">
        {!videoError && (
          <video
            ref={videoRef}
            src="https://cms.immersation.com/wp-content/uploads/2026/07/Newsletter-Hero-Background.mp4"
            className="w-full h-full object-cover absolute inset-0 z-10"
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
          />
        )}
        <img 
          src="https://cms.immersation.com/wp-content/uploads/2026/07/Newsletter-Hero-Background.png"
          className="w-full h-full object-cover absolute inset-0 z-0"
          alt="Background Fallback"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8DDCF]/40 to-[#8B5A44]/10 -z-10"></div>
        {/* Overlay to ensure wording is still visible */}
        <div className="absolute inset-0 bg-[#F4F1EB]/40 mix-blend-normal z-20"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#F4F1EB] z-20"></div>
      </div>

      {/* Background Decorative Paper Elements */}
      <div className="absolute top-[15%] right-[-5%] w-[400px] h-[400px] bg-[#E8DDCF]/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-[#8B5A44]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-12" id="newsletter-breadcrumb">
          <button 
            onClick={onBackToHome}
            className="group inline-flex items-center gap-2.5 font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] hover:text-[#1A2F24] transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            {lang === "en" ? "Back to System Core" : "返回核心系统"}
          </button>
        </div>

        {/* SECTION 1: HERO / MASTHEAD */}
        <div className="border-b border-[#D8D2C6]/50 pb-16 mb-20 relative z-10" id="newsletter-hero">
          
          {/* Hero Copwriting */}
          <div className="max-w-3xl" id="newsletter-hero-left">
            <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#8B5A44] block mb-4">
              NEWSLETTER
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6">
              {lang === "en" 
                ? "Clearer Signals for the Future Individual" 
                : "给未来个体的清晰信号"}
            </h1>
            
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed mb-8 max-w-xl">
              {lang === "en" 
                ? "Immersation｜智枢阁 publishes calm, structured, and high-signal notes for future-ready individuals who want to live with clarity, work with intelligent systems, and build long-term value."
                : "Immersation｜智枢阁 持续发布安静、结构化、高信号的 Newsletter 内容，服务于希望更清醒地生活、更聪明地工作、更长期地创造价值的未来个体。"}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a 
                href="#subscribe-cta-section"
                className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm hover:shadow-md cursor-pointer"
              >
                {lang === "en" ? "Subscribe Now" : "立即订阅"}
              </a>
              <a 
                href="#latest-archive-section"
                className="border border-[#D8D2C6] hover:border-[#1A2F24] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand bg-white/40"
              >
                {lang === "en" ? "Browse Issues" : "浏览历史存档"}
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 2: NEWSLETTER PHILOSOPHY */}
        <div className="border-b border-[#D8D2C6]/50 pb-16 mb-20" id="newsletter-philosophy">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="md:col-span-5">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">01 / BRAND MANDATE</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A2F24] leading-tight">
                {lang === "en" ? "Not More Information. A Better System." : "不是更多信息。而是更好的系统。"}
              </h2>
              <div className="w-12 h-[2px] bg-[#8B5A44] mt-4"></div>
            </div>
            
            <div className="md:col-span-7 md:border-l md:border-[#D8D2C6]/50 md:pl-8 text-[#1C1C1C]/80 font-serif text-sm sm:text-base leading-relaxed">
              <p className="mb-4">
                {lang === "en" 
                  ? "Each Immersation issue is designed to help readers extract clarity from information overload and build a personal intelligence system for body, tool, and capital."
                  : "智枢阁发布的每一期 Newsletter，皆在帮助读者从过载的信息泥潭中提炼最清澈的线索，指引你在身（正念健康）、器（AI 自动化）和财（财富认知）三个维度建立专属的个人智能体系。"}
              </p>
              <p>
                {lang === "en"
                  ? "This newsletter archive brings together our latest articles, briefings, frameworks, and editorial reflections. We ignore transient news and focus purely on immutable operational frameworks."
                  : "这里汇集了我们最新的深度论述、行业简报与实操框架。我们刻意忽略任何转瞬即逝的杂音，而只保留能跨越周期的底层逻辑与操作系统。"}
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
              onClick={() => handlePillarClick("body")}
              className={`border rounded-sm p-8 cursor-pointer transition-all duration-500 flex flex-col justify-between h-[280px] group ${
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
                    ? "Notes on sleep, recovery, stress regulation, focus, nervous system balance, and sustainable human performance."
                    : "关于睡眠、深度恢复、神经压力调控、专注力重塑与人体长寿机能的深度论述。"}
                </p>
              </div>

              <div className="border-t border-current/15 pt-4 flex items-center gap-1.5 font-display text-[9px] uppercase font-bold tracking-widest mt-4">
                <span>{lang === "en" ? "View Body Notes" : "查看身心笔记"}</span>
                <ChevronRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Tool Card */}
            <div 
              onClick={() => handlePillarClick("tool")}
              className={`border rounded-sm p-8 cursor-pointer transition-all duration-500 flex flex-col justify-between h-[280px] group ${
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
                  <Cpu className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${
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
                    ? "Briefings on AI workflows, prompt systems, automation templates, personal operating systems, and intelligent leverage."
                    : "关于大模型工作流、Prompt 模板系统、自动化管道搭建、个人知识库与效率杠杆的实操经验。"}
                </p>
              </div>

              <div className="border-t border-current/15 pt-4 flex items-center gap-1.5 font-display text-[9px] uppercase font-bold tracking-widest mt-4">
                <span>{lang === "en" ? "View AI Automation Notes" : "查看 AI 自动化笔记"}</span>
                <ChevronRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Capital Card */}
            <div 
              onClick={() => handlePillarClick("capital")}
              className={`border rounded-sm p-8 cursor-pointer transition-all duration-500 flex flex-col justify-between h-[280px] group ${
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
                    ? "Articles and frameworks on long-term wealth thinking, risk awareness, market cycles, capital judgment, and disciplined decision-making."
                    : "关于长期价值投资、宏观市场周期判定、风险对冲模型、以及剔除偏见与恐惧的理智决策系统。"}
                </p>
              </div>

              <div className="border-t border-current/15 pt-4 flex items-center gap-1.5 font-display text-[9px] uppercase font-bold tracking-widest mt-4">
                <span>{lang === "en" ? "View Wealth Cognition Notes" : "查看财富认知笔记"}</span>
                <ChevronRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: FEATURED NEWSLETTER */}
        {featuredIssue && (
        <motion.div 
          className="mb-24" id="featured-issue"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
            03 / EDITORIAL FEATURE
          </span>
          <div className="bg-[#E8DDCF]/40 border border-[#D8D2C6] rounded-sm p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
            {/* Soft decorative visual indicator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5A44]/5 rounded-bl-full pointer-events-none"></div>

            <div className="lg:col-span-8 relative z-10">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] inline-block bg-white/60 px-3 py-1 rounded-full mb-4">
                {lang === "en" ? "FEATURED ISSUE" : "重点推介期刊"}
              </span>
              
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#1A2F24] leading-tight mb-4">
                {featuredIssue.title[lang]}
              </h3>
              
              <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed mb-6 max-w-2xl">
                {featuredIssue.excerpt[lang]}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs text-[#1C1C1C]/50 font-display mb-8">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5A44]" />
                  {featuredIssue.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8B5A44]" />
                  {featuredIssue.readTime[lang]}
                </span>
                <span className="flex items-center gap-1.5 uppercase tracking-wider bg-white/40 px-2.5 py-0.5 rounded-sm">
                  {featuredIssue.pillar === "frameworks"
                    ? (lang === "en" ? "Editorial Framework" : "核心架构系统")
                    : (lang === "en" ? String(featuredIssue.pillar).toUpperCase() : (featuredIssue.pillar === "body" ? "身" : featuredIssue.pillar === "tool" ? "器" : featuredIssue.pillar === "capital" ? "财" : String(featuredIssue.pillar).toUpperCase()))}
                </span>
              </div>

              <button 
                onClick={() => handleOpenIssue(featuredIssue)}
                className="group bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand flex items-center gap-2 shadow hover:shadow-md cursor-pointer"
              >
                {lang === "en" ? "Read Complete Issue" : "阅读整期长文"}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Desktop Illustration Thumbnail */}
            <div className="lg:col-span-4 hidden lg:flex justify-end relative">
              <div className="w-64 h-64 border border-[#D8D2C6] rounded-sm bg-white p-6 shadow-sm flex flex-col justify-between hover:rotate-1 transition-transform duration-500">
                <div className="flex justify-between items-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8B5A44]"></div>
                  <span className="font-mono text-[8px] text-[#1C1C1C]/40">SYS_OS_01</span>
                </div>
                
                <div className="my-auto flex flex-col items-center">
                  <svg className="w-16 h-16 text-[#1A2F24] opacity-85 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2,2" />
                    <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2,2" />
                  </svg>
                  <span className="font-serif italic text-xs text-[#1C1C1C]/80">The Core Framework</span>
                </div>

                <span className="font-display text-[8px] uppercase tracking-widest text-[#8B5A44] text-center border-t border-[#D8D2C6]/50 pt-2 block">
                  IMMERSATION MANUAL
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        )}
        {/* SECTION 5: LATEST ARCHIVE & FILTER SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-[#D8D2C6]/50 pt-16 mb-24" id="latest-archive-section">
          
          {/* Left column: Filter Sidebar */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 h-fit" id="archive-sidebar">
            <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8B5A44]" />
              {lang === "en" ? "Filter Archive" : "筛选信标档案"}
            </h3>

            {/* Search Input */}
            <div className="relative mb-8" id="sidebar-search">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1C1C1C]/40" />
              <input 
                type="text"
                placeholder={lang === "en" ? "Search issues..." : "输入关键词检索..."}
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
                { id: "all", label: { en: "All Issues", zh: "全部期刊" } },
                { id: "body", label: { en: "Body (Longevity)", zh: "身（正念健康）" } },
                { id: "tool", label: { en: "Tool (AI Workflows)", zh: "器（AI 自动化）" } },
                { id: "capital", label: { en: "Capital (Wealth)", zh: "财（财富认知）" } },
                { id: "frameworks", label: { en: "System Frameworks", zh: "核心架构系统" } },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handlePillarClick(pill.id)}
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
                { id: "body", label: { en: "Body", zh: "身" } },
                { id: "tool", label: { en: "Tool", zh: "器" } },
                { id: "capital", label: { en: "Capital", zh: "财" } },
                { id: "frameworks", label: { en: "Frameworks", zh: "架构" } },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handlePillarClick(pill.id)}
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

          {/* Right column: Archive grid of issues */}
          <div className="lg:col-span-9" id="archive-grid">
            <div className="flex justify-between items-center border-b border-[#D8D2C6]/30 pb-4 mb-8">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#1C1C1C]/40">
                {lang === "en" ? `${filteredIssues.length} issues found` : `共检索到 ${filteredIssues.length} 期内容`}
              </span>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="text-center py-16 bg-white/30 border border-dashed border-[#D8D2C6] rounded-sm" id="empty-search-state">
                <BookOpen className="w-10 h-10 text-[#8B5A44]/40 mx-auto mb-3" />
                <h4 className="font-serif text-lg text-[#1A2F24] mb-1">
                  {lang === "en" ? "No issues match your filters" : "未找到匹配的期刊档案"}
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
                {filteredIssues.map((issue, idx) => (
                  <motion.div 
                    key={issue.id}
                    className="group bg-white/30 border border-[#D8D2C6]/60 rounded-sm p-6 md:p-8 hover:border-[#1A2F24] hover:bg-white/70 flex flex-col justify-between shadow-sm hover:shadow-xl transition-[shadow,border-color,background-color] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.75, delay: Math.min(idx, 5) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div>
                      {issue.cover && (
                        <div className="w-full h-48 md:h-64 mb-6 overflow-hidden rounded-sm border border-[#D8D2C6]/60">
                          <img 
                            src={issue.cover} 
                            alt={issue.title[lang]} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
                            onClick={() => handleOpenIssue(issue)}
                            loading="lazy" 
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#8B5A44]">
                          {issue.category[lang]}
                        </span>
                        <span className="font-display text-[9px] text-[#1C1C1C]/40">
                          {issue.date}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-normal text-[#1A2F24] mb-3 group-hover:text-[#8B5A44] transition-colors duration-300">
                        {issue.title[lang]}
                      </h4>

                      <p className="font-serif text-sm text-[#1C1C1C]/70 leading-relaxed mb-6">
                        {issue.excerpt[lang]}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-[#D8D2C6]/30">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 font-display text-[10px] text-[#1C1C1C]/40 mr-3">
                          <Clock className="w-3.5 h-3.5 text-[#8B5A44]/60" />
                          {issue.readTime[lang]}
                        </span>
                        {issue.tags.map(tag => (
                          <span key={tag} className="font-mono text-[9px] text-[#1C1C1C]/50 bg-[#E8DDCF]/30 px-2.5 py-0.5 rounded-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleOpenIssue(issue)}
                        className="group inline-flex items-center gap-1 text-[#1A2F24] hover:text-[#8B5A44] font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
                      >
                        {lang === "en" ? "Read Issue" : "阅读整期"}
                        <ArrowRight className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: RECOMMENDED STARTING POINTS */}
        <div className="border-t border-[#D8D2C6]/50 pt-16 mb-24" id="starting-points">
          <div className="max-w-2xl mb-12">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              04 / RECOMMENDED STARTS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
              {lang === "en" ? "Recommended Starting Points" : "新读者推荐入口"}
            </h2>
            <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60 mt-2">
              {lang === "en"
                ? "If you are new to Immersation, begin with these themes. Click to read their structural briefings immediately."
                : "如果你刚接触 Immersation 智枢阁，强烈建议从以下主题切入。点击直接唤起专属的高带宽简报。"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="starting-list">
            {newsletterIssues.map((issue, idx) => (
              <div 
                key={`start-${issue.id}`}
                onClick={() => handleOpenIssue(issue)}
                className="group border-b border-[#D8D2C6]/50 pb-6 flex items-start gap-5 cursor-pointer"
              >
                <span className="font-serif text-3xl font-light text-[#8B5A44]/30 group-hover:text-[#8B5A44] transition-colors duration-300 font-mono">
                  0{idx + 1}
                </span>
                
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-normal text-[#1A2F24] mb-1 group-hover:text-[#8B5A44] transition-colors duration-300">
                    {issue.title[lang]}
                  </h4>
                  <p className="font-serif text-xs text-[#1C1C1C]/50 max-w-sm">
                    {issue.excerpt[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: SUBSCRIBE CTA */}
        <div className="pt-8" id="subscribe-cta-section">
          <div className="bg-[#1A2F24] rounded-sm p-8 md:p-16 relative overflow-hidden text-[#F4F1EB]" id="newsletter-bento-card">
            
            {/* Concentric lines background indicator */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#F4F1EB]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="max-w-2xl mx-auto text-center relative z-10">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.3em] text-[#B69A6B] block mb-4">
                {lang === "en" ? "SUBSCRIBE FOR CLEARER SIGNALS" : "订阅清晰心智信号"}
              </span>
              
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight mb-4">
                {lang === "en" ? "Receive Clearer Signals." : "接收清晰的信标"}
              </h2>

              <p className="font-serif text-sm sm:text-base text-white/70 leading-relaxed mb-10 max-w-lg mx-auto">
                {lang === "en" 
                  ? "Join the Immersation editorial list for articles, frameworks, and curated insights across body, tool, and capital. No noise. No hype. Just calm intelligence."
                  : "获取围绕身、器、财的深度论述、可执行框架与精选洞察。没有无味的推销，没有夸张喧嚣，唯有面向未来的冷静智慧。"}
              </p>

              {isSubscribed ? (
                <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-sm p-4 animate-fade-in max-w-md mx-auto">
                  <CheckCircle2 className="w-5 h-5 text-[#B69A6B]" />
                  <p className="font-serif text-sm font-semibold text-[#F4F1EB]">
                    {lang === "en" ? "Signal locked. Welcome to the quiet loop." : "订阅锁定，欢迎加入安静的心智环路。"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="flex flex-col gap-4 max-w-md mx-auto" id="sub-form">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="email"
                        required
                        placeholder={lang === "en" ? "Your core email address..." : "输入你的核心电子邮箱..."}
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#B69A6B] focus:outline-none rounded-sm py-3.5 pl-12 pr-4 font-sans text-xs text-white placeholder:text-white/30"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-[#B69A6B] hover:bg-white hover:text-[#1A2F24] text-white font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-sm transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                    >
                      {lang === "en" ? "Subscribe" : "订阅通讯"}
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2 text-left">
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
                          <span className="font-sans text-[9px] text-white/40">{lang === "en" ? "Mindfulness, health, longevity" : "正念，健康，长寿"}</span>
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
                          <span className="font-sans text-[9px] text-white/40">{lang === "en" ? "AI, prompts, workflows" : "AI，提示词，工作流"}</span>
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
                          <span className="font-sans text-[9px] text-white/40">{lang === "en" ? "Wealth cognition, long-term thinking" : "财富认知，长期主义"}</span>
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

      {/* IMMERSIVE READER MODAL */}
      <AnimatePresence>
      {activeIssue && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 md:p-6" id="immersive-reader-modal">
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseIssue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="bg-[#F4F1EB] w-full max-w-3xl h-[85vh] md:h-[80vh] rounded-sm border border-[#D8D2C6] shadow-2xl flex flex-col relative overflow-hidden z-10"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-[#D8D2C6]/50 flex justify-between items-center bg-white/40">
              <div>
                <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#8B5A44]">
                  {activeIssue.category[lang]}
                </span>
                <span className="text-[#D8D2C6] px-2">|</span>
                <span className="font-display text-[9px] text-[#1C1C1C]/40 uppercase tracking-widest font-mono">
                  IMMERSATION JOURNAL
                </span>
              </div>

              <button 
                onClick={handleCloseIssue}
                className="p-1 text-[#1C1C1C]/50 hover:text-[#1C1C1C] transition-colors bg-white/80 rounded-full border border-[#D8D2C6]/40 hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Reading Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 relative" id="modal-reading-body">
              <div className="max-w-2xl mx-auto">
                {/* Meta details */}
                <div className="flex items-center gap-4 text-xs text-[#1C1C1C]/40 font-display mb-6">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8B5A44]/60" />
                    {activeIssue.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8B5A44]/60" />
                    {activeIssue.readTime[lang]}
                  </span>
                </div>
                
                {activeIssue.cover && (
                  <div className="mb-8 rounded-sm overflow-hidden border border-[#D8D2C6]/60 shadow-sm">
                    <img 
                      src={activeIssue.cover} 
                      alt={activeIssue.title[lang]}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover max-h-[300px]"
                    />
                  </div>
                )}

                {/* Main Title */}
                <h2 className="font-serif text-2xl md:text-4xl font-normal text-[#1A2F24] leading-tight mb-8 tracking-tight">
                  {activeIssue.title[lang]}
                </h2>

                {/* Subtitle / Excerpt panel */}
                <div className="border-l-2 border-[#8B5A44] pl-5 py-2.5 mb-10 bg-[#E8DDCF]/20 italic text-sm text-[#1C1C1C]/75 font-serif leading-relaxed">
                  {activeIssue.excerpt[lang]}
                </div>

                {/* Article Body Content */}
                <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/85 leading-relaxed space-y-6 prose prose-[#1A2F24]" id="modal-prose-content">
                  {renderMarkdownContent(activeIssue.content[lang])}
                </div>

                {/* Sign-off section */}
                <div className="border-t border-[#D8D2C6]/50 pt-10 mt-16 text-center">
                  <span className="font-serif italic text-xs text-[#1C1C1C]/50 block mb-2">
                    {lang === "en" ? "Thank you for reading Immersation." : "感谢你静心读完智枢阁期刊。"}
                  </span>
                  <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44]">
                    STABLE BODY · INTELLIGENT LEVERAGE · LONG-TERM CAPITAL
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer / Call to action */}
            <div className="p-4 border-t border-[#D8D2C6]/50 bg-[#E8DDCF]/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="font-serif text-xs text-[#1C1C1C]/60">
                {lang === "en" ? "Do you want clear signals in your inbox weekly?" : "希望每周在收件箱中收到这类清澈的信标吗？"}
              </p>
              <button 
                onClick={() => { handleCloseIssue(); window.location.hash = "subscribe-cta-section"; }}
                className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-[10px] uppercase font-bold tracking-widest px-5 py-2.5 rounded-sm transition-colors"
              >
                {lang === "en" ? "SUBSCRIBE NOW" : "立即加入安静闭环"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
