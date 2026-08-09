export interface CardItem {
  id: string;
  title: { en: string; zh: string };
  tagline?: { en: string; zh: string };
  description: { en: string; zh: string };
  category?: { en: string; zh: string };
  readTime?: { en: string; zh: string };
  coverColor?: string;
  borderColor?: string;
  textColor?: string;
  accentColor?: string;
  price?: number;
}

export interface NavigationItem {
  label: { en: string; zh: string };
  href: string;
}

export const navigationLinks: NavigationItem[] = [
  { label: { en: "About", zh: "关于" }, href: "about" },
  { label: { en: "Editorial Intelligence", zh: "编辑型智能内容" }, href: "editorial-intelligence" },
  { label: { en: "Pillars", zh: "三大支柱" }, href: "#pillars" }
];

export const heroContent = {
  headline: {
    en: "Build Your Personal Intelligence System.",
    zh: "构建你的个人智能系统"
  },
  primarySlogan: {
    en: "Immerse the focus. Upgrade the mind.",
    zh: "沉浸专注，心智跃迁。"
  },
  subheadline: {
    en: "A calm, structured ecosystem for body, tool, and capital.",
    zh: "为身体、工具与资本打造的沉浸式心智运转系统"
  },
  sloganBlock: {
    en: "Stable Body. Intelligent Leverage. Long-Term Capital.",
    zh: "稳定身心，智能放大，长期资本。"
  },
  ctaRead: {
    en: "Start Reading",
    zh: "开始阅读"
  },
  ctaProducts: {
    en: "Explore Products",
    zh: "探索产品"
  },
  annotations: {
    depth: { en: "Designed for depth. Built to evolve.", zh: "为深度的探索而生，随心智持续进化" },
    upgrade: { en: "Your mind. Upgraded.", zh: "升级你的心智操作系统" },
    clarity: { en: "A system for lifelong clarity.", zh: "一套赋予终身清澈判断的闭环系统" }
  }
};

export const brandEssenceContent = {
  trusted: { en: "TRUSTED BY THINKERS", zh: "思想者的选择" },
  title: { en: "Not More Information. A Better System.", zh: "非繁杂信息，乃卓越系统。" },
  description: {
    en: "We help you think, build, and act with clarity using tools that adapt to you — not the other way around. Modern individuals are overwhelmed by fragmented productivity advice, but rarely receive a coherent, quiet architecture that connects everything.",
    zh: "我们协助你以清晰的视野进行思考、构建与行动，提供适应你——而非让你去迁就的智能工具。现代人被碎片化的效率指南所淹没，却极少能拥有一套安静、连贯、能连通一切的心智底座。"
  },
  explore: { en: "EXPLORE OUR SOLUTIONS", zh: "探索我们的解决方案" }
};

export const productBooks: CardItem[] = [
  {
    id: "starter-kit",
    title: { en: "Personal Intelligence Starter Kit", zh: "个人智能启动工具包" },
    tagline: { en: "Your cognitive operating system.", zh: "你的认知操作系统" },
    description: { en: "Organize, connect, and evolve. A comprehensive starter kit to offload mental strain and optimize information intake.", zh: "整理、连接与演进。全方位脑力卸载工具，优化信息摄入，构筑个人专属知识库。" },
    coverColor: "bg-[#1A2F24]",
    borderColor: "border-[#1A2F24]",
    textColor: "text-[#F4F1EB]",
    accentColor: "text-[#B69A6B]",
    price: 0
  },
  {
    id: "workflow-playbook",
    title: { en: "The Calm AI Workflow Playbook", zh: "从容 AI 工作流指南" },
    tagline: { en: "AI-enhanced tools that integrate and elevate.", zh: "系统化的人机协同实操手册" },
    description: { en: "Reduce friction and expand personal leverage through step-by-step smart workflows that automate repetitive labor.", zh: "以静制动。通过模块化工作流模版 and 精细指导，大幅削减重复性劳动，释放智识杠杆。" },
    coverColor: "bg-[#F4F1EB]",
    borderColor: "border-[#D8D2C6]",
    textColor: "text-[#1C1C1C]",
    accentColor: "text-[#8B5A44]",
    price: 19.00
  },
  {
    id: "longevity-reset",
    title: { en: "Mindfulness Health & Longevity Reset", zh: "正念健康与长寿重置" },
    tagline: { en: "Reset your nervous system for long-term vitality.", zh: "让人类处理器保持长期稳定运行" },
    description: { en: "A science-backed protocol to optimize your sleep, manage stress, and build high-resilience physical health.", zh: "基于神经科学的精力管理与系统重置指南，恢复优质睡眠，抵抗精力赤字，重塑健康防线。" },
    coverColor: "bg-[#8B5A44]",
    borderColor: "border-[#8B5A44]",
    textColor: "text-[#F4F1EB]",
    accentColor: "text-[#E8DDCF]",
    price: 19.00
  },
  {
    id: "wealth-frameworks",
    title: { en: "Wealth Cognition Frameworks", zh: "财富认知框架" },
    tagline: { en: "Calm frameworks to compound long-term assets.", zh: "财富首先是一种认知能力" },
    description: { en: "Develop slow, disciplined judgment around asset allocation, risk control, and compounding value across market cycles.", zh: "培养穿越市场周期的冷静资本直觉。关于资产配置、风险透视与长期复利的系统化思考底座。" },
    coverColor: "bg-[#1C1C1C]",
    borderColor: "border-[#1C1C1C]",
    textColor: "text-[#F4F1EB]",
    accentColor: "text-[#B69A6B]",
    price: 19.00
  }
];

export const threePillarsContent = {
  introduction: {
    en: "The three pillars should not be presented as random content categories. They are the foundation of Immersation's personal intelligence system: Body stabilizes the human system, Tool creates intelligent leverage, and Capital builds long-term value.",
    zh: "三大心智支柱绝非随意的分类，而是智枢阁个人智能系统的基盘：身体稳定底层机制，工具创造智能杠杆，资本构建长期价值。"
  },
  pillars: [
    {
      id: "body",
      pillarName: { en: "BODY", zh: "身体 · 稳定基盘" },
      title: { en: "Mindfulness Health & Longevity", zh: "正念健康与长寿管理" },
      description: { en: "Build a stable foundation through sleep, recovery, focus, stress regulation, and long-term vitality.", zh: "通过睡眠重建、高效恢复、专注力训练、压力调节与长期生命力维护，打造不可动摇的底层心智容器。" }
    },
    {
      id: "tool",
      pillarName: { en: "TOOL", zh: "工具 · 智能杠杆" },
      title: { en: "AI Automation", zh: "AI 自动化" },
      description: { en: "Use intelligent workflows, prompts, and systems to reduce friction and expand personal leverage.", zh: "驾驭智能工作流、高度定制的 Prompt 体系与流程自动化系统，消除机械摩擦，极致放大个人杠杆。" }
    },
    {
      id: "capital",
      pillarName: { en: "CAPITAL", zh: "资本 · 长期复利" },
      title: { en: "Wealth Cognition", zh: "财富认知" },
      description: { en: "Develop calm long-term judgment around money, risk, value, and sustainable wealth building.", zh: "建立冷静、耐心的资本逻辑，穿透市场周期，理解风险与价值，践行能够穿越时间的心智财富构建。" }
    }
  ]
};

export const whatWeCreateContent = {
  title: { en: "WHAT WE CREATE", zh: "我们创造什么" },
  items: [
    {
      num: "01",
      title: { en: "Editorial Intelligence", zh: "Editorial Intelligence｜编辑型智能内容" },
      description: {
        en: "High-signal articles and newsletters designed to help future-ready individuals extract clarity from information overload.Includes: Articles, Newsletter",
        zh: "围绕正念健康与长寿管理、AI 自动化与财富认知，发布高信号文章与 Newsletter，帮助未来个体从信息噪音中提炼清晰判断。包含：Articles｜文章, Newsletter｜信札"
      }
    },
    {
      num: "02",
      title: { en: "Digital Publishing", zh: "Digital Publishing｜数字出版" },
      description: {
        en: "Structured eBooks, digital guides, and workbooks that turn deep knowledge into reusable personal assets.Includes: eBooks, Digital Guides, Workbooks, Online Reading Room",
        zh: "将复杂主题系统化为可阅读、可复盘、可长期复用的数字指南、eBook 与工作手册。包含：eBooks｜电子书, Digital Guides｜数字指南, Workbooks｜工作手册, Online Reading Room｜在线阅读室"
      }
    },
    {
      num: "03",
      title: { en: "AI Toolkits", zh: "AI Toolkits｜AI 工具包" },
      description: {
        en: "Prompts, workflows, templates, and automation systems to automate repetitive labor and expand personal leverage.Includes: Prompt Libraries, Automation Templates, Workflow Blueprints",
        zh: "开箱即用的深度提示词库、自动化工作流模版和定制化 Notion 智能效能看板，释放智识杠杆。包含：Prompt Libraries｜提示词库, Automation Templates｜自动化模版, Workflow Blueprints｜工作流蓝图"
      }
    },
    {
      num: "04",
      title: { en: "Audio Experiences", zh: "Audio Experiences｜音频体验" },
      description: {
        en: "Audiobooks, audio essays, and podcast-style knowledge sessions for walking, commuting, resting, and focused listening.Includes: Audiobooks, Audio Essays, Podcasts, Listening Room",
        zh: "将深度知识转化为可聆听的音频书、音频文章与专题播客，进入通勤、散步、休息与低注意力场景。包含：Audiobooks｜有声书, Audio Essays｜音频文章, Podcasts｜播客, Listening Room｜聆听室"
      }
    },
    {
      num: "05",
      title: { en: "Wealth Frameworks", zh: "Wealth Frameworks｜财富框架" },
      description: {
        en: "Decision tools for risk, allocation, and long-term value across market cycles.Includes: Asset Allocation, Risk Assessment, Compounding Tools",
        zh: "关于资产配置、风险透视与周期理解的冷静框架与决策工具，辅助建立长期理性的智识财富防线。包含: Asset Allocation｜资产配置, Risk Assessment｜风险透视, Compounding Tools｜复利工具"
      }
    },
    {
      num: "06",
      title: { en: "Mindfulness & Longevity Systems", zh: "Mindfulness & Longevity Systems｜正念长寿系统" },
      description: {
        en: "Sleep, recovery, focus, and vitality systems to optimize energy management.Includes: Sleep Reset, Stress Recovery, Longevity Trackers",
        zh: "基于神经科学的睡眠重置指南、精力追踪、专注力与系统压力管理工具，让人类处理器长青运行。包含：Sleep Reset｜睡眠重置, Stress Recovery｜压力恢复, Longevity Trackers｜长寿追踪"
      }
    }
  ],
  rightCard: {
    title: { en: "Curated. Connected. Continuously Evolving.", zh: "严苛筛选。精密连接。持续进化。" },
    description: { en: "Everything we create works together to strengthen your intelligence system.", zh: "智枢阁出产的每一份资产均非孤立存在，它们环环相扣，共同编织出你无懈可击的心智运转闭环。" }
  }
};

export const journalArticles: CardItem[] = [  {
    id: "ai-agent-overload-calm-automation-system",
    category: { en: "SOLO BUSINESS AUTOMATION", zh: "独立创业者自动化" },
    title: { en: "The Quiet Cost of AI Agents: Why More Automation Feels Like More Noise", zh: "AI 智能体的隐形代价：为什么自动化越多，噪音越大" },
    description: { en: "Stop stacking AI agent tools. Learn Immersation's calm 3-layer framework to consolidate automation into one personal intelligence system.", zh: "别再堆叠AI智能体工具了。了解Immersation的三层平静框架，将自动化整合为一个个人智能系统。" },
    readTime: { en: "8 MIN READ", zh: "阅读时间 8 分钟" }
  },
  {
    id: "art-thinking-clear",
    category: { en: "PERSPECTIVES", zh: "认知视角" },
    title: { en: "The Art of Thinking Clear", zh: "清澈思考的艺术" },
    description: { en: "How mental simplicity and cognitive offloading lead to exponentially better decisions.", zh: "探讨如何通过心智极简与大脑卸载，在繁杂的现代商业环境中做出更睿智的决策。" },
    readTime: { en: "8 MIN READ", zh: "阅读时间 8 分钟" }
  },
  {
    id: "building-living-systems",
    category: { en: "GUIDES", zh: "深度实践" },
    title: { en: "Building Living Systems", zh: "构建具备生命力的心智系统" },
    description: { en: "A blueprints guide to creating dynamic knowledge bases that adapt and grow alongside you.", zh: "一份设计动态知识网络的指南，使其在无形中与你的个人能力并进成长。" },
    readTime: { en: "10 MIN READ", zh: "阅读时间 10 分钟" }
  },
  {
    id: "art-better-prompting",
    category: { en: "AI TOOLKITS", zh: "AI 杠杆" },
    title: { en: "The Art of Better Prompting", zh: "深度提示词的艺术" },
    description: { en: "Practical techniques to craft prompt blueprints for clearer, highly deterministic AI actions.", zh: "抛弃玄学，掌握可高度预测、强确定性的高阶 Prompt 撰写框架。" },
    readTime: { en: "6 MIN READ", zh: "阅读时间 6 分钟" }
  },
  {
    id: "quiet-in-the-noise",
    category: { en: "EDITORIAL", zh: "社论" },
    title: { en: "Quiet in the Noise", zh: "于喧嚣处寻得静谧" },
    description: { en: "Why cognitive silence is your single greatest competitive advantage in a highly distracted world.", zh: "分析为什么心智深处的‘低噪声状态’是现代工作者无可替代的核心竞争优势。" },
    readTime: { en: "7 MIN READ", zh: "阅读时间 7 分钟" }
  },
  {
    id: "the-long-view",
    category: { en: "PERSPECTIVES", zh: "长期复利" },
    title: { en: "The Long View", zh: "长期主义视角的构建" },
    description: { en: "Designing an energetic life and wealth career that compound systematically over decades.", zh: "教你如何像配置主权基金一样规划精力分配、知识框架与资产配置，追求数十年的确定复利。" },
    readTime: { en: "9 MIN READ", zh: "阅读时间 9 分钟" }
  }
];

export const advantageContent = {
  title: { en: "THE IMMERSATION ADVANTAGE", zh: "智枢阁的独特价值" },
  items: [
    {
      title: { en: "Built for Depth", zh: "为深层沉浸而生" },
      description: { en: "Zero distraction, pure signals.", zh: "屏蔽杂讯，直指本质。唯有静水才能流深。" }
    },
    {
      title: { en: "Designed to Evolve", zh: "自适应进化" },
      description: { en: "Systems that grow with your complexity.", zh: "系统非僵死规则，而是可随你的体量与眼界一同生长的生命体。" }
    },
    {
      title: { en: "Your Data Stays Yours", zh: "绝对主权安全" },
      description: { en: "Your mind assets, strictly protected.", zh: "你脑海中的洞见、系统的痕迹皆为你独享，不成为大模型的养分。" }
    },
    {
      title: { en: "AI that Works for You", zh: "定制的专属智能" },
      description: { en: "Not generic hacks, but custom pipelines.", zh: "杜绝泛泛的套路。让智能无缝融入属于你的具体应用场景。" }
    },
    {
      title: { en: "Everything Connected", zh: "无阻碍连通" },
      description: { en: "A complete circle of body, tool, and capital.", zh: "打破藩篱。当身体康健、工具有力、资产稳固时，复利才能爆发。" }
    },
    {
      title: { en: "A System that Compounds", zh: "确定性复利体系" },
      description: { en: "Knowledge that increases in value over time.", zh: "构建随着时间的流逝非但不会折旧、反而价值倍增的智识资产库。" }
    }
  ]
};

export const newsletterContent = {
  title: { en: "Receive Clearer Signals.", zh: "收纳清澈信号" },
  heading: { en: "Thoughts, tools, and ideas to help you build a better intelligence system.", zh: "探索高带宽思想、前沿效能套件，一步步协助你构筑坚不可摧的个人智能操作系统。" },
  subheading: { en: "Join a community of builders and thinkers. Receive clearer signals.", zh: "加入由高行动力创作者与深度思考者组成的纯净社区。收纳更高密度的清澈信号。" },
  inputPlaceholder: { en: "Your core email address...", zh: "输入你的核心电子邮箱..." },
  buttonText: { en: "Subscribe ->", zh: "立即订阅 ->" },
  successMsg: { en: "Signal locked. Welcome to the quiet loop.", zh: "信号锁定，欢迎加入安静的心智闭环。" }
};

export const footerContent = {
  slogan: {
    en: "Immersation ｜ 智枢阁",
    zh: "Immersation ｜ 智枢阁"
  },
  subSlogan: {
    en: "Immerse the focus. Upgrade the mind.",
    zh: "沉浸专注，心智跃迁。"
  },
  affiliation: {
    en: "Immersation is a Personal Intelligence Media & Digital Publishing Brand by Malttrix｜梦萃, built on Mindfulness Health & Longevity, AI Automation, and Wealth Cognition.",
    zh: "Immersation ｜ 智枢阁 是 Malttrix ｜ 梦萃 旗下的个人智能媒体与数字出版品牌，构建于正念健康与长寿、AI 自动化以及财富认知三大基石之上。"
  },
  columns: [
    {
      title: { en: "Brand", zh: "品牌" },
      links: [
        { label: { en: "About", zh: "关于" }, href: "about" },
        { label: { en: "The Three Pillars", zh: "三大核心支柱" }, href: "#pillars" }
      ]
    },
    {
      title: { en: "Editorial Intelligence", zh: "编辑型智能内容" },
      links: [
        { label: { en: "Articles", zh: "文章" }, href: "articles" },
        { label: { en: "Newsletter", zh: "Newsletter" }, href: "newsletter" }
      ]
    },
    {
      title: { en: "Products", zh: "智识产品" },
      links: [
        { label: { en: "Digital Guides", zh: "数字指南" }, href: "/" },
        { label: { en: "AI Toolkits", zh: "AI 工具包" }, href: "/" },
        { label: { en: "Mindfulness & Longevity Systems", zh: "正念长寿系统" }, href: "/" },
        { label: { en: "Wealth Frameworks", zh: "财富框架" }, href: "/" },
        { label: { en: "Audio Experiences", zh: "音频体验" }, href: "/" }
      ]
    },
    {
      title: { en: "Legal", zh: "条款与支持" },
      links: [
        { label: { en: "Privacy Policy", zh: "隐私政策" }, href: "privacy-policy" },
        { label: { en: "Terms of Use", zh: "使用条款" }, href: "terms-of-use" },
        { label: { en: "Disclaimer", zh: "免责声明" }, href: "disclaimer" },
        { label: { en: "Contact", zh: "联系我们" }, href: "contact" }
      ]
    }
  ]
};
