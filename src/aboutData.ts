export interface PillarDetail {
  id: string;
  name: { en: string; zh: string };
  title: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  commitment: { en: string; zh: string };
  items: { en: string; zh: string }[];
}

export interface OriginDetail {
  title: { en: string; zh: string };
  parts: {
    key: string;
    label: { en: string; zh: string };
    meaning: { en: string; zh: string };
  }[];
  summary: { en: string; zh: string };
}

export const aboutContent = {
  hero: {
    brandBadge: {
      en: "KNOWLEDGE SUB-BRAND OF MALTTRIX",
      zh: "MALTTRIX 梦萃 旗下知识型子品牌"
    },
    title: {
      en: "A Personal Intelligence Media & Digital Publishing Brand",
      zh: "面向未来个体的个人智能媒体与数字出版品牌"
    },
    slogan: {
      en: "Stable Body. Intelligent Leverage. Long-Term Capital.",
      zh: "稳定身心，智能放大，长期资本。"
    },
    intro: {
      en: "Immersation is dedicated to modern professionals, knowledge workers, creators, and independent builders. We help you transform deep knowledge into readable, audible, executable, and reusable long-term personal assets—integrating them directly into your physical system, work system, and wealth system.",
      zh: "Immersation｜智枢阁 是一个面向现代专业人士、知识工作者、创作者、独立创业者与未来个体的个人智能媒体与数字出版品牌。帮助用户将深度知识转化为可阅读、可聆听、可执行、可复用的长期个人资产，并将这些知识真正融入个人的身体系统、工作系统与财富系统。"
    }
  },
  
  philosophy: {
    title: { en: "The System You Truly Need", zh: "未来个体真正需要的系统" },
    subtitle: { 
      en: "We believe future competitors do not need more fragmented information. They need a clearer, more stable, and long-term personal operating system.",
      zh: "我们相信，未来个体真正需要的不是更多碎片化信息，而是一套更清晰、更稳定、更长期的个人智能系统。"
    },
    cards: [
      {
        title: { en: "A System to Stay Awake & Clear", zh: "保持身心清醒的系统" },
        desc: { en: "Sleep, recovery, attention, and sensory management to keep your primary human processor running optimally.", zh: "睡眠、恢复、专注力与神经调节，管理身体、压力、情绪，让大脑处理器保持清醒高效。" }
      },
      {
        title: { en: "A System to Leverage AI Intelligently", zh: "聪明使用 AI 的系统" },
        desc: { en: "Not chasing hot trends, but designing custom prompts, workflow templates, and automation node systems.", zh: "拒绝追逐短期热点，通过定制 AI 工作流、提示词库与自动化模版，无缝放大个人产能。" }
      },
      {
        title: { en: "A System to Understand Wealth & Time", zh: "理解财富与价值的系统" },
        desc: { en: "Calm long-term cognition around money, risk, cycle, and behavioral finance to build lasting compound value.", zh: "以冷静冷静、耐心的资本逻辑，理解时间与风险，穿透市场周期，践行心智财富的长期规划。" }
      }
    ]
  },

  immersationOrigin: {
    title: { en: "The Meaning of 'Immersation'", zh: "Immersation 的品牌造词含义" },
    summary: {
      en: "Immersation is a bespoke brand synthesis, merging deep focus with human sensory awareness to achieve systemic evolution.",
      zh: "Immersation 是一个专属品牌造词，融合了深度专注与人类觉察，达到沉浸式感知、清醒式学习、系统化进化。"
    },
    parts: [
      {
        key: "IMMERSION",
        label: { en: "Immersion", zh: "沉浸" },
        meaning: { 
          en: "Represents deep focus, deep learning, systemic understanding, and the ability to enter the core of knowledge.", 
          zh: "代表深度专注、沉浸学习、系统理解与进入知识深处的能力。" 
        }
      },
      {
        key: "SENSATION",
        label: { en: "Sensation", zh: "感知" },
        meaning: { 
          en: "Represents bodily awareness, emotional mindfulness, human experience, and clear self-understanding.", 
          zh: "代表身体觉察、情绪感知、人类体验与对自身状态的清醒理解。" 
        }
      }
    ]
  },

  zhisuOrigin: {
    title: { en: "The Meaning of '智枢阁'", zh: "智枢阁中文品牌名内涵" },
    summary: {
      en: "A premium knowledge sanctuary that converges personal intelligence, deep insights, and systemic decision-making.",
      zh: "智枢阁是 Immersation 的中文名，代表着一个汇聚个人智能、深度知识与系统化判断力的高阶知识空间。"
    },
    parts: [
      {
        key: "智 (ZHÌ)",
        label: { en: "Intelligence & Judgement", zh: "智能与判断" },
        meaning: { 
          en: "Cognition, insight, judgement, and mental updates in the AI era. It is not raw information, but structural judgment.", 
          zh: "代表智能、认知、洞察力与判断力。非单纯的信息堆积，而是经筛选、结构化后形成的决策力。" 
        }
      },
      {
        key: "枢 (SHŪ)",
        label: { en: "Hub & System Connection", zh: "中枢与连接" },
        meaning: { 
          en: "The hub, system core, and key connection point bridging body, tool, and wealth into a closed-loop system.", 
          zh: "代表中枢、枢纽、系统核心。将正念健康、AI自动化与财富认知三大支柱连结成一套完整的运转系统。" 
        }
      },
      {
        key: "阁 (GÉ)",
        label: { en: "Sanctuary & Long-Termism", zh: "藏阁与沉淀" },
        meaning: { 
          en: "A knowledge pavilion, think-tank, and publishing space. It conveys an editorial, archival, and timeless texture.", 
          zh: "代表藏书阁、思想阁与高阶知识空间。赋予品牌出版质感、书卷底蕴与长期主义的时间沉淀感。" 
        }
      }
    ]
  },

  missionVision: {
    mission: {
      title: { en: "Our Mission", zh: "我们的使命" },
      text: {
        en: "To empower modern individuals to establish a personal intelligence system that supports better living, smarter working, and long-term value creation.",
        zh: "帮助未来个体建立一套支持更好生活、更聪明工作与长期价值创造的个人智能系统。我们不制造噪音，只沉淀可长期复用的智识资产。"
      }
    },
    vision: {
      title: { en: "Our Vision", zh: "我们的愿景" },
      text: {
        en: "To be a highly influential personal intelligence media and digital publisher, offering timeless frameworks, guides, and tools to help thinkers live awake, work smart, and compound wealth steadily.",
        zh: "成为一个具有长期影响力的个人智能媒体与数字出版品牌。为高成长型个体提供高质感的框架、指南与音频，构建一个能不断折返、学习与迭代的终身资产库。"
      }
    }
  },

  threePillars: {
    title: { en: "The Three Structural Pillars", zh: "三大结构支柱体系" },
    pillars: [
      {
        id: "about-body",
        name: { en: "BODY", zh: "身之支柱" },
        title: { en: "Mindfulness Health & Longevity", zh: "正念健康与长寿管理" },
        subtitle: { en: "The biological operating system.", zh: "身体是所有智能运行的硬件底座。" },
        commitment: {
          en: "To restore the fundamental stability of body and mind, making long-term growth sustainable and free from exhaustion.",
          zh: "帮助用户恢复身体与心智的底层稳定性，让长期成长不再建立在疲惫与透支之上。"
        },
        items: [
          { en: "Sleep Restoration Guides", zh: "睡眠修复指南与机制" },
          { en: "Stress Recovery Frameworks", zh: "压力恢复与神经调节" },
          { en: "Attention & Focus Training", zh: "专注力与沉浸训练" },
          { en: "Cognitive Longevity Habits", zh: "长寿习惯与精力管理" }
        ]
      },
      {
        id: "about-tool",
        name: { en: "TOOL", zh: "器之支柱" },
        title: { en: "AI Automation", zh: "AI 自动化" },
        subtitle: { en: "The leverage multiplier.", zh: "AI 不是短期热点，而是个体的放大器。" },
        commitment: {
          en: "To offload mechanical friction, free mental capacity, and turn AI into a seamless extension of your potential.",
          zh: "用智能工具减少重复摩擦，将精力从低效事务中释放，把 AI 真正转化为个人能力的无限延伸。"
        },
        items: [
          { en: "AI Workflow Architectures", zh: "AI 工作流与提示词库" },
          { en: "Notion Systems & Dashboards", zh: "Notion 与智能系统看板" },
          { en: "Productivity Template Nodes", zh: "自动化模板与流程定制" },
          { en: "Creator Digital Pipelines", zh: "创作者与个人商业自动化" }
        ]
      },
      {
        id: "about-capital",
        name: { en: "CAPITAL", zh: "财之支柱" },
        title: { en: "Wealth Cognition", zh: "财富认知" },
        subtitle: { en: "The long-term compass.", zh: "金钱是关于时间、风险与纪律的博弈。" },
        commitment: {
          en: "To build a calm, highly disciplined wealth judgement system that compounds systematically across cycles.",
          zh: "帮助用户建立更清晰、更冷静、更长期的财富判断系统，理解不确定性并收获时间的玫瑰。"
        },
        items: [
          { en: "Long-Term Asset Frameworks", zh: "长期投资框架与纪律" },
          { en: "Risk Reflection Metacognition", zh: "风险反思与财务决策" },
          { en: "Market Cycle & Behavioral Finance", zh: "市场周期与行为金融学" },
          { en: "Compounding Capital Systems", zh: "复利规划与可持续自由" }
        ]
      }
    ] as PillarDetail[]
  },

  malttrix: {
    title: { en: "Part of the Malttrix Ecosystem", zh: "关于母品牌 Malttrix｜梦萃" },
    desc: {
      en: "Immersation is a knowledge-focused sub-brand incubated by Malttrix. While Malttrix serves as the overarching creative ecosystem and aesthetic incubator, Immersation specializes in personal intelligence, publishing, mindfulness longevity, and structural digital systems. This architecture guarantees exquisite aesthetic quality, rigorous content standards, and a shared long-term dedication to building assets.",
      zh: "Immersation｜智枢阁 是 Malttrix｜梦萃 旗下的知识型子品牌。Malttrix｜梦萃 代表更大的创意母品牌生态与美学体系，而 Immersation 则承载了知识、系统、数字出版与未来个体长期成长资产的方向。这一生态保证了智枢阁在内容上的克制克雅、美学上的高度凝练，与品牌长青的深切追求。"
    },
    badge: {
      en: "Immersation｜智枢阁 • Incubated by Malttrix",
      zh: "Immersation｜智枢阁 • 由 Malttrix｜梦萃 孵化的个人智能媒体与数字出版品牌"
    }
  }
};
