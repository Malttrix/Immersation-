// Brand-aligned pillar + category system (Immersation official 3-pillar model)
export const PILLAR_OPTIONS = [
  {
    value: "body",
    label: {
      en: "Body (Mindfulness Health & Longevity)",
      zh: "身（正念健康与长寿管理）",
    },
  },
  {
    value: "tool",
    label: { en: "Tool (AI Automation)", zh: "器（AI 自动化）" },
  },
  {
    value: "capital",
    label: { en: "Capital (Wealth Cognition)", zh: "财（财富认知）" },
  },
];

export const SYSTEM_INTEGRATION_OPTION = {
  value: "system-integration",
  label: {
    en: "System Integration (cross-pillar framework essay)",
    zh: "系统整合（跨支柱框架文章）",
  },
};

export const CATEGORY_OPTIONS_BY_PILLAR: Record<
  string,
  { value: string; label: { en: string; zh: string } }[]
> = {
  body: [
    {
      value: "sleep-reset-guides",
      label: { en: "Sleep Reset Guides", zh: "睡眠修复指南" },
    },
    {
      value: "stress-recovery-frameworks",
      label: { en: "Stress Recovery Frameworks", zh: "压力恢复框架" },
    },
    {
      value: "mindful-productivity",
      label: { en: "Mindful Productivity", zh: "正念效率" },
    },
    {
      value: "longevity-habits",
      label: { en: "Longevity Habits", zh: "长寿习惯" },
    },
    {
      value: "focus-training",
      label: { en: "Focus Training", zh: "专注力训练" },
    },
    {
      value: "nervous-system-regulation",
      label: { en: "Nervous System Regulation", zh: "神经系统调节" },
    },
    {
      value: "energy-management-systems",
      label: { en: "Energy Management Systems", zh: "精力管理系统" },
    },
  ],
  tool: [
    {
      value: "ai-workflow-blueprints",
      label: { en: "AI Workflow Blueprints", zh: "AI 工作流蓝图" },
    },
    {
      value: "prompt-libraries",
      label: { en: "Prompt Libraries", zh: "提示词库" },
    },
    {
      value: "automation-templates",
      label: { en: "Automation Templates", zh: "自动化模板" },
    },
    {
      value: "creator-workflow-systems",
      label: { en: "Creator Workflow Systems", zh: "创作者工作流系统" },
    },
    {
      value: "notion-ai-systems",
      label: { en: "Notion + AI Systems", zh: "Notion 与 AI 系统" },
    },
    {
      value: "solo-business-automation",
      label: { en: "Solo Business Automation", zh: "个人商业自动化" },
    },
    {
      value: "productivity-dashboards",
      label: { en: "Productivity Dashboards", zh: "效率仪表盘" },
    },
  ],
  capital: [
    {
      value: "long-term-investing-frameworks",
      label: { en: "Long-Term Investing Frameworks", zh: "长期投资框架" },
    },
    {
      value: "asset-allocation-checklists",
      label: { en: "Asset Allocation Checklists", zh: "资产配置清单" },
    },
    {
      value: "market-cycle-notes",
      label: { en: "Market Cycle Notes", zh: "市场周期笔记" },
    },
    {
      value: "risk-reflection-tools",
      label: { en: "Risk Reflection Tools", zh: "风险反思工具" },
    },
    {
      value: "wealth-planning-templates",
      label: { en: "Wealth Planning Templates", zh: "财富规划模板" },
    },
    {
      value: "financial-decision-frameworks",
      label: { en: "Financial Decision Frameworks", zh: "财务决策框架" },
    },
    {
      value: "capital-thinking-essays",
      label: { en: "Capital Thinking Essays", zh: "资本思维文章" },
    },
  ],
  "system-integration": [
    {
      value: "personal-intelligence-system",
      label: { en: "Personal Intelligence System", zh: "个人智能系统" },
    },
    {
      value: "three-pillar-model",
      label: { en: "The Three-Pillar Model", zh: "三支柱模型" },
    },
    {
      value: "reader-journey-notes",
      label: { en: "Reader Journey Notes", zh: "读者旅程笔记" },
    },
  ],
};

export const CONTENT_FORMAT_OPTIONS = [
  {
    value: "editorial-intelligence",
    label: {
      en: "Editorial Intelligence (Essay / Newsletter / Research Brief)",
      zh: "编辑型智能内容",
    },
  },
  {
    value: "digital-guide",
    label: { en: "Digital Guide (Structured Handbook)", zh: "数字指南" },
  },
  {
    value: "framework",
    label: { en: "Framework (Standalone Model/Tool)", zh: "框架工具" },
  },
];
