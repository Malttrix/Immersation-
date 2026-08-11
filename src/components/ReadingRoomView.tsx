
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import HTMLFlipBook from "react-pageflip";
const FlipBook = HTMLFlipBook as any;
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Type, Sparkles, Sliders, Lock, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
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
const booksContent: Record<string, BookChapter[]> = {
  "starter-kit": [
    {
      chapterLabel: { en: "Chapter 1", zh: "第一章" },
      title: { en: "Foundations of Cognitive Offloading", zh: "大脑卸载的认知底座" },
      leftContentMarkdown: {
        en: `The human brain evolved for **processing and connecting** ideas, not for storing mechanical details. When you attempt to keep appointments, tasks, or raw notes in your working memory, you create severe cognitive strain.\n\nCognitive offloading is the deliberate practice of using external tools to reduce the cognitive load. By writing down a thought immediately, you signal to your amygdala that the detail is safe, letting your brain return to a state of calm.\n\n> [CORE PRINCIPLE]\n> "If it takes more than 10 seconds of active thought to recall a task, you have already wasted precious mental energy."`,
        zh: `人类大脑的进化是为了进行**思考与关联**，而非为了存储琐碎机械的数据。当你试图将所有的日程、待办与零散的想法仅靠大脑记忆时，你便让自己的处理器陷入了长期的超频与内耗。\n\n心智卸载（Cognitive Offloading）是指主动利用外部工具来减轻工作记忆负担的实操。当你把一个灵感立即记录下来，相当于对杏仁核发送了“安全信号”，让大脑重归清澈。\n\n> [核心原理]\n> “如果回忆一项任务需要你耗费超过 10 秒的思考，说明你的认知资源已经在无形中流失了。”`
      },
      rightContentMarkdown: {
        en: `To build a reliable starter kit for your personal intelligence system, implement these three simple steps:\n\n- **The Capture Inbox:** A single, friction-free interface where any incoming task or idea is instantly recorded. No folders, no tags at first. Just dump.\n- **Periodic Review:** Dedicate 10 minutes at the end of every day to clear your Capture Inbox, converting raw dumps into active actionable blocks.\n- **The Quiet Archive:** Move inactive but high-value reference files to a permanent, searchable database, keeping your active view strictly clean.\n\nIn subsequent chapters, we explore how to map these captured vectors to n8n pipelines, automating the transfer of raw ideas into structured databases.`,
        zh: `若想为个人智能系统构建可靠的启动框架，建议遵循以下三个基础法则：\n\n- **摩擦力捕捉收件箱（Capture Inbox）：** 设定一个单一且毫无输入阻力的文本框，供随时扔入闪现的想法或任务，无需立即整理。\n- **日终清空例程（Daily Review）：** 每天结束前留出 10 分钟整理收件箱，将其中的碎片信息分类转换成具体的行动指令或知识存档。\n- **无尘档案室（The Quiet Archive）：** 将不再活跃但极具参考价值的资产移入全局搜索数据库，使你每日聚焦的视界一尘不染。\n\n在接下来的篇章中，我们将逐步解析如何将这些捕捉到的信息流，完美对接至 n8n 自动化铁轨，实现真正的自动搬运。`
      }
    },
    {
      chapterLabel: { en: "Chapter 2", zh: "第二章" },
      title: { en: "Structuring the Knowledge Base", zh: "建立网状知识底座" },
      leftContentMarkdown: {
        en: `Folders are a legacy of the physical filing cabinet. They force thoughts into rigid hierarchies. But human creativity is associative, not hierarchical.\n\nA modern digital library utilizes **bi-directional links**. When note A links to note B, they create a two-way bridge. Over time, your notes cluster naturally, revealing unexpected connections.\n\n> [MIND VECTOR]\n> Think of your knowledge base not as a warehouse, but as an ecosystem. Every new note added should hook onto at least one existing node to thrive.`,
        zh: `文件夹分类是传统物理档案柜的遗毒。它强迫复杂的、多维的思想屈服于单一的树状层级。然而，人类的创造力是网状、联想式的。\n\n现代数字图书馆的核心优势在于**双向链接（Bi-directional Links）**。当笔记 A 指向 笔记 B 时，它们在两者间搭起了桥梁。随着时间推移，笔记自然聚类，暴露出潜在的洞察。\n\n> [心智矢量]\n> 切勿将自己的知识网络当成冷冰冰的仓库。它是一个生态系统。每当添加一条新笔记，它都必须至少勾连上一个既有节点，才能焕发生机。`
      },
      rightContentMarkdown: {
        en: `### The CODE Method\n\nTo keep your personal database highly actionable, adopt the famous CODE framework:\n\n1. **Capture:** Keep only what resonates deeply. Avoid digital hoarding.\n2. **Organize:** Structure based on actionability rather than raw category.\n3. **Distill:** Summarize the essence, leaving bold cues for your future self.\n4. **Express:** Convert knowledge into real tangible output.\n\nBy separating these phases, you maintain a quiet mind, letting deep insights compound organically.`,
        zh: `### CODE 精华实操法\n\n为了使你的个人库高度具备行动价值，建议贯彻经典的 CODE 流程：\n\n1. **C - 捕捉（Capture）：** 只留存让你产生共鸣的高信号信息，拒绝数字垃圾堆积。\n2. **O - 组织（Organize）：** 根据“当前行动指向”分类，而非单纯的项目属性。\n3. **D - 提炼（Distill）：** 抽离信息骨干，为未来的自己预留粗体线索。\n4. **E - 表达（Express）：** 将知识化为具有价值的实体，实现闭环。\n\n通过将这些阶段完全解耦，你能保持极高品质的心智带宽，让深度见解自然复利。`
      }
    }
  ],
  "workflow-playbook": [
    {
      chapterLabel: { en: "Chapter 1", zh: "第一章" },
      title: { en: "Eliminating the Cognitive Friction of Digital Pipelines", zh: "消解数字化流水线的认知摩擦" },
      leftContentMarkdown: {
        en: `Most modern knowledge work is not cerebral; it is **mechanical data-routing**. Workers fetch text from one browser window, reformat it, and paste it into a spreadsheet.\n\nEvery time you switch tabs, you pay a "cognitive context penalty." It takes up to 20 minutes to regain deep focus after a single distraction.\n\n> [AUTOMATION RULE]\n> "If a digital task requires no high-level strategic decision-making, it must be delegated to an automated workflow."`,
        zh: `多数现代脑力工作本质上根本不是脑力创造，而是**机械性的数据搬运**。我们在浏览器、表单与记事本之间频繁切换，做着数据的拷贝与变形。\n\n每一次标签页的切换，都伴随着不可忽视的“认知上下文损耗”。单次打扰可能需要长达 20 分钟才能使人重归深度思考。\n\n> [自动法则]\n> “如果一项数字化操作不需要任何高维的战略性决策，那它就应当而且必须被铁轨化自动流代劳。”`
      },
      rightContentMarkdown: {
        en: `### Mapping the Leverage Flow\n\nTo reclaim time, design workflows using an asynchronous event-driven model:\n\n1. **Triggers:** Monitor selected Webhook endpoints or RSS feeds for incoming assets.\n2. **AI Classification:** Proxy the asset through a server-side Gemini API call to clean, summarize, and categorize.\n3. **Structured Injection:** Route the summarized knowledge straight into your Notion or database, keeping you notified via unified email briefs.\n\nThis way, your only job is high-level strategic synthesis.`,
        zh: `### 构建高能杠杆闭环\n\n为了回收时间主权，请采用非对称的“触发器-分类-归纳”系统来定制流：\n\n1. **触发器（Trigger）：** 监听指定 Webhook、RSS 或特定邮箱的输入源，捕获原始素材。\n2. **AI 清洗过滤：** 通过服务端 API 将内容送至 Gemini，提炼出没有水分的结构化摘要及标签。\n3. **安静注入（Injection）：** 智能写入至 Notion 个人仪表盘中，不向你推送任何红点，仅生成静音日报。\n\n在这样的闭环中，你只在顶层扮演最终审阅者和战略裁决者。`
      }
    }
  ],
  "longevity-reset": [
    {
      chapterLabel: { en: "Chapter 1", zh: "第一章" },
      title: { en: "The Sleep Protocol and Glymphatic Cleansing", zh: "睡眠管理与脑脊液清洗协议" },
      leftContentMarkdown: {
        en: `Sleep is not a passive break from performance; it is the **active foundation** of cognitive restoration. During deep sleep (slow-wave sleep), the brain's intercellular channels expand, allowing cerebrospinal fluid to wash away metabolic debris, including beta-amyloid plaques.\n\nBy depriving yourself of sleep, you are literally drowning your neurons in yesterday's cognitive waste, resulting in heavy brain fog.\n\n> [BIOLOGY RATIO]\n> "We do not rest because our work is done. We rest so that our work can begin with absolute clarity."`,
        zh: `睡眠并非低效率的象征，而是深层认知洗涤的**硬核生理保障**。在深睡慢波阶段，脑细胞间隙拓宽，脑脊液（CSF）加速流动，彻底清洗累积一整天的代谢废物（如 β-淀粉样蛋白）。\n\n压榨睡眠相当于让你的前额叶和神经元终日浸泡在陈旧垃圾中，导致难以驱散的慢性大脑迷雾。\n\n> [生理公式]\n> “我们睡觉并非因为工作完成，我们睡觉是为了让第二天的战略大局观完美开辟。”`
      },
      rightContentMarkdown: {
        en: `### Circadian Hygiene Rules\n\nRe-architect your sleep window using these non-negotiable circadian regulations:\n\n- **Sunlight Grounding:** View natural light within 30 minutes of waking to trigger healthy cortisol release and set the melatonin timer.\n- **Dark Sanctuary:** Keep the sleeping chamber strictly below 68°F (20°C) and completely blackout. Cooling triggers natural deep sleep.\n- **Adenosine Safeguard:** Halt caffeine intake exactly 10 hours before sleep to prevent residual adenosine receptor blockages.\n\nFollowing this science-backed rhythm allows your autonomic nervous system to swing gracefully into restorative parasympathetic dominance.`,
        zh: `### 昼夜节律重组规程\n\n立刻执行以下三项硬性的昼夜节律清理规程，修复紊乱的生物钟：\n\n- **晨光锚定（Light Grounding）：** 起床后 30 分钟内沐浴自然光，重置皮质醇释放周期，启动夜间褪黑素倒计时。\n- **物理降温与极暗（Dark Sanctuary）：** 卧室维持 19-20 摄氏度并做到全遮光。体温平稳下降是深睡入场的钥匙。\n- **腺苷安全屏障（Adenosine Safeguard）：** 睡前 10 小时内拒绝咖啡因，确保腺苷受体能被饱满接受。\n\n通过这套科学节律，你的自主神经系统将优雅地滑向副交感神经（Rest and Digest）主导，消解潜在磨损。`
      }
    }
  ],
  "wealth-frameworks": [
    {
      chapterLabel: { en: "Chapter 1", zh: "第一章" },
      title: { en: "The Psychology of Slow Capital", zh: "耐性资本与情绪防御机制" },
      leftContentMarkdown: {
        en: `Wealth building is not about picking winners or reacting to volatile market spikes. It is an exercise in **disciplined behavioral finance**. Most capital is lost not due to bad macro trends, but because of emotional panics.\n\nWhen you possess high cognitive surplus, you are capable of stepping back, analyzing cycles objectively, and holding slow, patient capital that compounds quietly.\n\n> [CAPITAL MAXIM]\n> "The market is a system designed to transfer wealth from the impatient, hyperactive mind to the calm, systematic observer."`,
        zh: `真实的财富积累无关投机暴富，也不是对波动曲线的频繁应激。它是一场**克制的行为金融学博弈**。无数人的资本蒙受毁灭性折旧，往往只是因情绪化恐惧做出了决策。\n\n唯有建立在宽裕心智之上的未来个体，才能超脱噪音，客观观测周期，沉着配置能够安然越冬的“耐性资本”。\n\n> [资本格言]\n> “市场本质上是一套将财富从心浮气躁的交易者，悄然、精准让渡给理智系统观察者的离心机。”`
      },
      rightContentMarkdown: {
        en: `### Structuring Patient Assets\n\nArchitect your wealth preservation around these core risk allocation parameters:\n\n- **Zero Leveraged Debt:** Avoid short-term leverage that subjects your peace of mind to margin liquidation margins.\n- **Anti-Inflation Hard Anchors:** Hold assets with structural scarcity that compound slow, inevitable value.\n- **Friction-Locked Reserves:** Lock a portion of surplus capital into slow-liquidity vaults to enforce patient compounding.\n\nBy designing these systematic physical boundaries, you align your investment portfolio with the physical laws of steady math.`,
        zh: `### 长期资产的防御框架\n\n用防御型系统工程重新审视自身的盈余流分配，筑起长期安全壁垒：\n\n- **排除一切投机杠杆：** 绝不使用可能让你在午夜惊醒的短线透支，保全纯净的深度睡眠。\n- **锚定硬性抗通胀资产：** 倾注于具备绝对物理或算法稀缺性的底层复利品类。\n- **摩擦力锁存储备（Locked Vault）：** 有意在流动性上建立合理防火墙，抵抗人类冲动交易的生物学缺陷。\n\n建立这套系统边界后，你的资产组合就不再是碰运气，而是让时间与数学为你做工。`
      }
    }
  ]
};

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

const BookCoverMock = ({ book, size = "sm", locked = false, lang }: { book: any, size?: "sm" | "lg", locked?: boolean, lang: "en" | "zh" }) => {
  const dims = size === "lg" ? "w-14 h-18 p-3" : "w-8 h-10 p-1.5";
  const iconSize = size === "lg" ? "w-4 h-4 mb-1" : "w-3 h-3 mb-0.5";
  const titleText = size === "lg" ? "text-[6px]" : "text-[4px]";
  const brandText = size === "lg" ? "text-[5px]" : "hidden";
  const volText = size === "lg" ? "text-[5px]" : "hidden";
  
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
  const activeProductBooks = booksData || productBooks;
  
  const [activeBookId, setActiveBookId] = useState<string>(selectedBookId || activeProductBooks[0].id);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const flipBookRef = React.useRef<any>(null);
  const [readingTheme, setReadingTheme] = useState<"soft-paper" | "warm-sand" | "vintage-linen">("soft-paper");
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dbChapters, setDbChapters] = useState<BookChapter[] | null>(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);

  useEffect(() => {
    setDbChapters(null);
    if (!activeBookId) return;

    const isLocalBook = ["starter-kit", "workflow-playbook", "longevity-reset", "wealth-frameworks"].includes(activeBookId);
    const matchedBook = activeProductBooks.find(b => b.id === activeBookId);

    if (!isLocalBook || (matchedBook && matchedBook.epubSourceUrl)) {
      const fetchChapters = async () => {
        setIsLoadingChapters(true);
        try {
          const { data, error } = await supabase
            .from("book_chapters")
            .select("chapters")
            .eq("product_id", activeBookId)
            .maybeSingle();

          if (error) {
            console.warn("Error fetching book chapters from Supabase:", error);
          } else if (data && Array.isArray(data.chapters)) {
            setDbChapters(data.chapters);
          }
        } catch (err) {
          console.warn("Exception fetching book chapters:", err);
        } finally {
          setIsLoadingChapters(false);
        }
      };

      fetchChapters();
    }
  }, [activeBookId, activeProductBooks]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentBook = activeProductBooks.find((b) => b.id === activeBookId) || activeProductBooks[0];
  
  // Resolve raw chapter list from Supabase, embedded chapters, local content, or single content string
  const rawBookChapters = (() => {
    if (Array.isArray(dbChapters) && dbChapters.length > 0) return dbChapters;
    if (Array.isArray(currentBook?.chapters) && currentBook.chapters.length > 0) return currentBook.chapters;
    if (Array.isArray(booksContent[activeBookId]) && booksContent[activeBookId].length > 0) return booksContent[activeBookId];
    
    // Construct page spread if currentBook has single content/description field
    const extractVal = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (typeof val === "object") return val[lang] || val.en || val.zh || "";
      return String(val);
    };
    const cContent = extractVal(currentBook?.content || currentBook?.description || currentBook?.tagline);
    if (cContent.trim().length > 0) {
      return [{
        chapterLabel: extractVal(currentBook?.tagline || currentBook?.category) || (lang === "en" ? "Chapter 1" : "第一章"),
        title: extractVal(currentBook?.title) || "Digital Edition",
        content: cContent
      }];
    }
    return booksContent["starter-kit"] || [];
  })();

  // Process raw chapters into dynamic double-page spreads so EPUB text flows across as many pages as needed
  const activeBookSpreads = useMemo(() => {
    return processChaptersIntoSpreads(rawBookChapters, lang, currentBook);
  }, [rawBookChapters, lang, currentBook]);

  const isUnlocked = unlockedBookIds.includes(activeBookId) || Number(currentBook?.price || 0) === 0;
  
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
        
        {/* Left Col: Desktop Book Selection Shelf */}
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

        {/* Right Col: Immersive Double-Page Paper Book Reader */}
        <div className="lg:col-span-9 flex flex-col justify-between h-full" id="immersive-reader-container">
          
          {/* Main Book-Layout Canvas Frame */}
          <div className="relative w-full aspect-[3/4] md:aspect-[10/7] bg-gradient-to-br from-[#1C1C1C]/10 to-[#1C1C1C]/25 border border-[#D8D2C6] p-4 md:p-6 lg:p-8 rounded-md flex flex-col justify-center select-none shadow-2xl overflow-hidden" id="book-canvas-frame">
            
            {/* Soft shadow depth under the overall book spine */}
            {!isMobile && (
              <div className="absolute top-0 bottom-0 left-[50%] -translate-x-[50%] w-10 bg-gradient-to-r from-black/15 via-black/40 to-black/15 blur-sm z-30 pointer-events-none"></div>
            )}

            {/* Simulated wooden table grain border */}
            <div className="absolute inset-0 border-[8px] border-[#D8D2C6]/15 pointer-events-none rounded-md z-40"></div>

            {/* Inside book: Two Pages Paper Block */}
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
          </div>

          {/* Book Navigation controls underneath */}
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

        </div>

      </div>

    </div>
  );
}
