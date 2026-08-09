import React, { useState } from "react";
import { 
  ArrowLeft, 
  Compass, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Check, 
  HelpCircle, 
  Sliders, 
  Calendar, 
  FileText,
  Info,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface WealthFrameworksViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onAddToCart?: (item: any) => void;
}

export default function WealthFrameworksView({
  lang,
  onBackToHome,
  onPlayChime,
  onAddToCart
}: WealthFrameworksViewProps) {
  const [timeHorizon, setTimeHorizon] = useState<number>(10); // Years
  const [riskExposure, setRiskExposure] = useState<"low" | "medium" | "high">("medium");
  const [liquidityNeed, setLiquidityNeed] = useState<"immediate" | "moderate" | "locked">("moderate");
  const [emotionalBias, setEmotionalBias] = useState({
    fomo: false,
    lossAversion: true,
    overconfidence: false
  });
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

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

  // Dynamic system-level decision metrics
  const getDecisionScore = () => {
    let score = 50;
    score += timeHorizon * 3; // Long term increases score
    if (riskExposure === "high" && timeHorizon < 5) score -= 25; // Short term high risk reduces rating
    if (liquidityNeed === "locked" && timeHorizon >= 7) score += 15; // Locked assets fit long term
    if (emotionalBias.fomo) score -= 15;
    if (emotionalBias.lossAversion) score += 5; // Moderate protection
    return Math.min(Math.max(score, 10), 100);
  };

  const getSystemStatus = () => {
    const score = getDecisionScore();
    if (score >= 75) return { en: "Disciplined Allocation", zh: "理性严明配置方案", color: "text-green-600" };
    if (score >= 45) return { en: "Balanced System", zh: "中温平衡体系", color: "text-[#B69A6B]" };
    return { en: "High Vulnerability", zh: "高情绪磨损状态", color: "text-red-500" };
  };

  // Categories
  const categories = [
    {
      id: "risk",
      title: { en: "Risk Reflection Tools", zh: "风险反思与偏差诊断" },
      desc: { en: "Understand your cognitive boundaries, losses aversion, and FOMO triggers before exposing capital.", zh: "在配置一分钱资本前，深度诊断并量化自身的心智盲区、损失厌恶阀值与FOMO触发机制。" }
    },
    {
      id: "allocation",
      title: { en: "Asset Allocation Checklists", zh: "资产配置严苛清单" },
      desc: { en: "Structure cross-cycle capital with mathematically sound ratios. Keep your core safety vault intact.", zh: "用数学比例和刚性退出边界管理资本。建立防御性安全库，保证全系统具备极高承载力。" }
    },
    {
      id: "cycle",
      title: { en: "Market Cycle Notes", zh: "跨周期运行底稿" },
      desc: { en: "Historical observations on credit cycles, liquidities, and system stress. Ignore the short-term news.", zh: "理顺信用扩张、流动性拐点与市场系统承载力的周期规律。看穿新闻包装，回归周期深层本质。" }
    },
    {
      id: "longterm",
      title: { en: "Long-Term Investing Frameworks", zh: "长期投资与复利框架" },
      desc: { en: "Patient structures centered around slow growth, high-conviction holds, and tax/friction defense.", zh: "围绕“缓慢稳健复利”、“极端低换手率”与“极简税效防卫”设计的全生命周期投资决策框架。" }
    }
  ];

  return (
    <div className="bg-[#F4F1EB] min-h-screen text-[#1C1C1C] selection:bg-[#8B5A44]/10 selection:text-[#8B5A44] pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Editorial Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" id="wealth-grid-bg">
        <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(#1C1C1C 1px, transparent 1px), linear-gradient(90deg, #1C1C1C 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => handleAction(onBackToHome)}
          className="flex items-center gap-2 group text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors mb-12 cursor-pointer"
          id="wealth-back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{lang === "en" ? "Back to Chamber" : "返回主页"}</span>
        </button>

        {/* 1. Hero Masthead (Visual: Misty mountain lines, long-term path, compass geometry, slow curve) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 border-b border-[#D8D2C6]/50 pb-16" id="wealth-hero">
          
          {/* Left Text */}
          <div className="lg:col-span-7">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] bg-[#8B5A44]/10 px-2.5 py-1.5 rounded-sm inline-block mb-4">
              {lang === "en" ? "CAPITAL COGNITION LAYER" : "财富认知 · 资本运营层"}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6 ink-text">
              {lang === "en" ? "Wealth Frameworks" : "财富决策模型与框架"}
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-xl">
              {lang === "en" 
                ? "Decision tools for risk, allocation, and long-term value. Immersation’s Wealth Frameworks help future-ready individuals think more calmly about money, time, risk, market cycles, and sustainable capital building."
                : "用于风险、配置与长期价值判断的决策工具。智枢阁的财富框架帮助未来个体更冷静、纪律严明地理解金钱、时间、风险承受、信用周期与可持续资本积累，杜绝投机杂音与冲动交易。"}
            </p>
          </div>

          {/* Right Visual: Misty mountain, long path, compass geometry, upward curve */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-80 h-64 bg-[#1A2F24] border border-[#D8D2C6]/40 rounded-md p-6 overflow-hidden shadow-xl" id="wealth-mountain-graphic">
              
              {/* Compass Geometry ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full flex items-center justify-center">
                <div className="w-36 h-36 border border-white/5 rounded-full border-dashed"></div>
                <div className="absolute w-px h-full bg-white/5 top-0 left-1/2"></div>
                <div className="absolute h-px w-full bg-white/5 top-1/2 left-0"></div>
              </div>

              {/* Misty Mountain curves drawing */}
              <svg className="absolute inset-x-0 bottom-0 w-full h-32 opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Back Mountain */}
                <path d="M0,80 Q25,30 50,75 T100,60 L100,100 L0,100 Z" fill="none" stroke="#B69A6B" strokeWidth="0.5" />
                {/* Mid Mountain */}
                <path d="M0,90 Q40,50 75,85 T100,75 L100,100 L0,100 Z" fill="none" stroke="#D8D2C6" strokeWidth="0.75" />
              </svg>

              {/* Compounding Slow Upward curve */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d="M10,85 Q40,80 70,55 T90,20" 
                  fill="none" 
                  stroke="#8B5A44" 
                  strokeWidth="1.5" 
                  strokeDasharray="1,1" 
                  className="animate-pulse"
                />
                <circle cx="90" cy="20" r="3" fill="#B69A6B" />
              </svg>

              {/* Labelings */}
              <div className="relative z-10 h-full flex flex-col justify-between font-mono text-[8px] text-[#F4F1EB]/60">
                <div className="flex justify-between items-center text-[#B69A6B]">
                  <span>CAPITAL CALM DEVIATION</span>
                  <span>TIME COMPASS V1.0</span>
                </div>
                
                <div className="mb-2 italic text-white/40">
                  {lang === "en" ? "“Wealth is the product of silent compound conviction, not noisy rapid updates.”" : "“真正的财富，是宁静长期的复利产物，而非在交易噪音中博取筹码。”"}
                </div>

                <div className="flex justify-between items-center text-white/30 pt-2 border-t border-white/5">
                  <span>MISTY PATH COGNITION</span>
                  <span>EST. 2026.07</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. Framework Categories (Four Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24" id="wealth-categories">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="bg-white/45 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-sm bg-[#1A2F24]/5 border border-[#1A2F24]/10 flex items-center justify-center text-[#1A2F24] mb-4">
                <Compass className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#1A2F24] mb-2">
                {cat.title[lang]}
              </h3>
              <p className="font-serif text-xs text-[#1C1C1C]/65 leading-relaxed">
                {cat.desc[lang]}
              </p>
            </div>
          ))}
        </div>

        {/* 3. Featured Framework (The Capital Clarity Framework) */}
        <div className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 mb-24" id="featured-framework">
          <span className="bg-[#8B5A44]/10 text-[#8B5A44] font-display text-[9px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 rounded-sm inline-block mb-4">
            {lang === "en" ? "THE CAPITAL CLARITY FRAMEWORK" : "核心决策白皮书"}
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] mb-4">
                {lang === "en" ? "The Capital Clarity Framework" : "资本清澈度决策模型：远离盲动与多动损耗"}
              </h2>
              <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en"
                  ? "A structured decision matrix and worksheet designed to evaluate high-conviction strategic investments. This is not a trading advisory tool. It is a self-audit sheet that guides you through checking emotional biases, liquidity stress points, and long-term asset alignment before allocating significant capital."
                  : "这是一套经过严密数学建模的投资自审计体系与工作底表，旨在消除重大配置行为中的情绪磨损。该模型拒绝发布任何短线投机或单一股票/代币代码，而是指导您理性推算长周期复利窗口、下行防守厚度及极端流动性压力值。"}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => triggerAddToCart("capital-clarity", "The Capital Clarity Framework")}
                  className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-sm transition-brand cursor-pointer shadow-sm"
                >
                  {addedItemId === "capital-clarity" 
                    ? (lang === "en" ? "✓ Added to Cart" : "✓ 已放入购物车") 
                    : (lang === "en" ? "Add to Cart ($39.00)" : "加入购物车 ($39.00)")}
                </button>
                <button 
                  onClick={() => handleAction(() => {
                    alert(lang === "en" ? "Opening PDF overview file... This worksheet includes 12 self-audit indicators." : "正在拉取并展示 12 项决策安全审计指标的简短概述说明。");
                  })}
                  className="border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3.5 rounded-sm transition-colors cursor-pointer bg-white/20 hover:bg-white/50"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  <span>{lang === "en" ? "Preview Sheet Specs" : "预览大纲规格"}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/40 border border-[#D8D2C6] rounded-sm p-6 relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B5A44]"></div>
              <div className="pl-4 font-serif">
                <h4 className="text-sm font-semibold text-[#1A2F24] mb-3">
                  {lang === "en" ? "What's Included in the Box:" : "本体系包含哪些核心物料："}
                </h4>
                <ul className="space-y-2 text-xs text-[#1C1C1C]/75 list-disc pl-4 leading-relaxed">
                  <li><strong>{lang === "en" ? "The Clarity Self-Audit Sheet" : "12 项风险免疫力自审底表"}</strong></li>
                  <li><strong>{lang === "en" ? "The Core Asset Sieve" : "精选战略资产多维过滤法则"}</strong></li>
                  <li><strong>{lang === "en" ? "Liquidity Stress Testing Tool" : "流动性极端压力及安全边际折合工具"}</strong></li>
                  <li><strong>{lang === "en" ? "Offline PDF Workbook & Notion Vault" : "离线 PDF 工作本与 Notion 配置数据库"}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Decision Tool Preview (Interactive Form Style Preview) */}
        <div className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 mb-24 relative overflow-hidden" id="decision-tool-preview">
          
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              {lang === "en" ? "INTERACTIVE COMPASS PREVIEW" : "人机交互 · 财富指南针预览"}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] tracking-tight ink-text">
              {lang === "en" ? "Simulate Your Allocation Quality" : "试演您的资产配置健康度"}
            </h2>
            <p className="font-serif text-xs text-[#1C1C1C]/65 mt-2">
              {lang === "en" 
                ? "Adjust your parameters below to preview how our diagnostic rules evaluate your mental investment alignment."
                : "在此调整您的真实投资参数，抢先预览智枢阁在逻辑自审中，如何量化分析并拦截不良交易行为。"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Variables Form */}
            <div className="lg:col-span-7 bg-white/40 border border-[#D8D2C6] p-6 rounded-md space-y-6">
              
              {/* Slider 1: Time Horizon */}
              <div>
                <div className="flex justify-between items-center text-xs font-serif mb-2">
                  <span className="font-semibold text-[#1A2F24]">{lang === "en" ? "Time Horizon" : "计划持有时间"}</span>
                  <span className="font-mono text-[#8B5A44] font-bold">{timeHorizon} {lang === "en" ? "Years" : "年"}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#D8D2C6]/50 rounded-lg appearance-none cursor-pointer accent-[#1A2F24]"
                />
                <span className="text-[10px] text-[#1C1C1C]/50 block mt-1 font-serif">
                  {lang === "en" ? "Compounding relies exponentially on duration. Prefer 5+ years." : "复利效应是以时间为指数级的。我们极力建议计划周期跨越 5 年以上。"}
                </span>
              </div>

              {/* Selector 2: Risk Exposure */}
              <div>
                <span className="text-xs font-semibold text-[#1A2F24] block mb-2 font-serif">{lang === "en" ? "Risk Exposure Preference" : "计划暴露的风险水平"}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleAction(() => setRiskExposure(r))}
                      className={`py-2 text-[10px] font-display font-bold uppercase tracking-wider rounded-sm transition-all border cursor-pointer ${
                        riskExposure === r 
                          ? "bg-[#1A2F24] text-[#F4F1EB] border-[#1A2F24]" 
                          : "border-[#D8D2C6] bg-white/20 text-[#1C1C1C]/60 hover:border-[#8B5A44]"
                      }`}
                    >
                      {r === "low" && (lang === "en" ? "Low Risk" : "保守/低波")}
                      {r === "medium" && (lang === "en" ? "Moderate" : "稳健/平衡")}
                      {r === "high" && (lang === "en" ? "High Risk" : "进取/高暴露")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector 3: Liquidity Needs */}
              <div>
                <span className="text-xs font-semibold text-[#1A2F24] block mb-2 font-serif">{lang === "en" ? "Immediate Liquidity Needs" : "流动性变现渴求度"}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["immediate", "moderate", "locked"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => handleAction(() => setLiquidityNeed(l))}
                      className={`py-2 text-[10px] font-display font-bold uppercase tracking-wider rounded-sm transition-all border cursor-pointer ${
                        liquidityNeed === l 
                          ? "bg-[#1A2F24] text-[#F4F1EB] border-[#1A2F24]" 
                          : "border-[#D8D2C6] bg-white/20 text-[#1C1C1C]/60 hover:border-[#8B5A44]"
                      }`}
                    >
                      {l === "immediate" && (lang === "en" ? "Immediate" : "随时兑付")}
                      {l === "moderate" && (lang === "en" ? "1-3 Years" : "中期弹性")}
                      {l === "locked" && (lang === "en" ? "No Urgency" : "长期沉淀")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector 4: Emotional Bias */}
              <div>
                <span className="text-xs font-semibold text-[#1A2F24] block mb-2 font-serif">
                  {lang === "en" ? "Identify Active Cognitive Vulnerabilities" : "诚实勾选当前的认知弱点与状态"}
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs font-serif text-[#1C1C1C]/75 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={emotionalBias.fomo}
                      onChange={(e) => setEmotionalBias(prev => ({ ...prev, fomo: e.target.checked }))}
                      className="rounded-xs border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44]"
                    />
                    <span>{lang === "en" ? "FOMO (Anxiety about missing market upside)" : "FOMO 焦虑 (无法坐视旁人发财，总想追高热点)"}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-serif text-[#1C1C1C]/75 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={emotionalBias.lossAversion}
                      onChange={(e) => setEmotionalBias(prev => ({ ...prev, lossAversion: e.target.checked }))}
                      className="rounded-xs border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44]"
                    />
                    <span>{lang === "en" ? "High Loss Aversion (Minor drops trigger panic urges)" : "高度损失厌恶 (10% 的正常波动也会引发神经紧绷)"}</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Simulated Live Rating Output Card */}
            <div className="lg:col-span-5 bg-[#1A2F24] text-[#F4F1EB] rounded-md p-6 border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 opacity-[0.02] select-none pointer-events-none">
                <Compass className="w-56 h-56" />
              </div>

              <div className="flex justify-between items-center text-[8px] font-mono text-[#B69A6B] mb-6">
                <span>SIMULATED OUTCOME</span>
                <span>SYSTEM CALIBRATED</span>
              </div>

              <div className="text-center py-6 border-b border-white/10 mb-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 block mb-1">
                  {lang === "en" ? "Allocation Health Index" : "配置合理性自我健康度评估"}
                </span>
                <h3 className="text-5xl font-mono text-white tracking-tight mb-2">
                  {getDecisionScore()}
                  <span className="text-sm text-white/55">/100</span>
                </h3>
                <span className={`text-xs font-serif font-semibold uppercase tracking-wider ${getSystemStatus().color}`}>
                  • {getSystemStatus()[lang]}
                </span>
              </div>

              {/* Dynamic feedback bullets based on input */}
              <div className="space-y-4 text-xs font-serif mb-6">
                
                {timeHorizon < 5 ? (
                  <div className="flex items-start gap-2 text-[#B69A6B]">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      {lang === "en" 
                        ? "Horizon is too short. Compounding fails to dominate and transaction costs risk eroding principal."
                        : "持有时限不足 5 年。在这类短周期下，频繁波动的杂音将占据主导地位，手续成本与摩擦力将吞噬本金。"}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      {lang === "en"
                        ? "Excellent. Time horizon allows long-term credit and liquidity expansion models to smooth out short-term turbulence."
                        : "持有时限良妙。超过 5 年的耐心能够过滤绝大部分偶然的市场噪音，使复利大数法则发挥真正的系统级威力。"}
                    </p>
                  </div>
                )}

                {emotionalBias.fomo && (
                  <div className="flex items-start gap-2 text-red-400">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      {lang === "en"
                        ? "FOMO vulnerability active. This state severely impairs logical evaluation of downside risk. Refuse additions today."
                        : "检测到显著的 FOMO 躁动指数。在这种状态下进行决策，极易在无意中接盘泡沫并错判下行风险。建议立即冷水洗脸，暂缓动作。"}
                    </p>
                  </div>
                )}

                {liquidityNeed === "immediate" && riskExposure === "high" && (
                  <div className="flex items-start gap-2 text-red-400">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      {lang === "en"
                        ? "Mismatch hazard. Needing immediate liquidity while high risk means you risk forced liquidation in a market dip."
                        : "严重错配。在需要随时兑付流动性的资产盘子里配置了高波进取标的，一旦遭遇周期回撤，将被迫在最差折扣时点进行清盘折算。"}
                    </p>
                  </div>
                )}

              </div>

              {/* Summary decision advice footer */}
              <div className="text-[10px] font-mono text-white/40 border-t border-white/5 pt-4">
                <span>RECALCULATING ON VARIABLES IN ACTIVE STATE</span>
              </div>

            </div>

          </div>
        </div>

        {/* 5. Clear prominence disclaimer panel (Crucial trust section) */}
        <div className="bg-white/40 border border-amber-600/20 rounded-md p-8 mb-24 max-w-4xl mx-auto flex flex-col sm:flex-row gap-6 items-start" id="wealth-disclaimer">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-700 rounded-full flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold text-amber-900 mb-2">
              {lang === "en" ? "Regulatory Notice & Educational Disclaimer" : "智枢资本运营层：严肃学术免责声明"}
            </h4>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed space-y-2">
              <span>
                {lang === "en"
                  ? "All systems, checklists, interactive indicators, and models presented on this page are for educational analysis and informational purposes only. Immersation does not operate as a financial advisor, does not issue securities recommendations, and does not pitch get-rich strategies. Investing involves physical downside risk, including loss of principal."
                  : "免责声明：智枢阁展示的所有表格、决策规则、配置清单与交互评估得分，均属于关于宏观周期与理财心智的严肃研讨，绝不构成任何具体的投资建议、财务策略销售，亦非任何金融产品的要约邀请。"}
              </span>
              <span className="block mt-1 font-bold">
                {lang === "en"
                  ? "We refuse promises of passive income or quick trading formulas. If you seek customized investment recommendations, please consult a registered personal fiduciary advisor."
                  : "我们极其唾弃任何“财富神话”、“被动躺赚秘籍”或“万能炒股套利公式”。在做出重大资产决策前，请务必独立查验流动性底板，或向具有国家资质的注册信托理财专家进行独立咨询。"}
              </span>
            </p>
          </div>
        </div>

        {/* 6. Clean CTA */}
        <div className="text-center py-12 border-t border-[#D8D2C6]/50 max-w-xl mx-auto" id="wealth-cta">
          <h2 className="font-serif text-3xl font-normal text-[#1A2F24] mb-4 ink-text">
            {lang === "en" ? "Build Calmer Capital Judgment" : "构筑不可攻破的长期资本意志"}
          </h2>
          <p className="font-serif text-sm text-[#1C1C1C]/60 leading-relaxed mb-8">
            {lang === "en"
              ? "Reclaim cognitive sovereignty over your capital. Start tracking risk, cycle parameters, and discipline indexes today."
              : "接管您的资本认知参数。从一套无情绪偏见、无摩擦的投资决策审计工作纸开始，消除多动性的资产折损。"}
          </p>
          <button
            onClick={() => handleAction(() => {
              alert(lang === "en" ? "Downloading the Capital Clarity Decision Pack preview..." : "正在打包为您初始化离线下载《资本决策清晰度指南与量化底表》样本包……");
            })}
            className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm cursor-pointer"
          >
            {lang === "en" ? "Explore Wealth Frameworks" : "立即下载资本清晰底表"}
          </button>
        </div>

      </div>
    </div>
  );
}
