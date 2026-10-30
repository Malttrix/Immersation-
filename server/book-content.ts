type BookChapter = any;
export const defaultBookContent: Record<string, BookChapter[]> = {
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
