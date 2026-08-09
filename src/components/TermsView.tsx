import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, FileText, ChevronDown, Check, Scale } from "lucide-react";

interface TermsViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
}

interface TocItem {
  id: string;
  label: { en: string; zh: string };
  secNum: string;
}

const tocItems: TocItem[] = [
  { id: "term-1", label: { en: "1. Who We Are", zh: "1. 我们是谁" }, secNum: "1" },
  { id: "term-2", label: { en: "2. Eligibility", zh: "2. 使用资格" }, secNum: "2" },
  { id: "term-3", label: { en: "3. Educational Purpose", zh: "3. 仅供教育与信息参考" }, secNum: "3" },
  { id: "term-4", label: { en: "4. Health Disclaimer", zh: "4. 非医疗或健康建议" }, secNum: "4" },
  { id: "term-5", label: { en: "5. Financial Disclaimer", zh: "5. 非财务或投资建议" }, secNum: "5" },
  { id: "term-6", label: { en: "6. AI & Technology", zh: "6. AI工具、自动化与技术内容" }, secNum: "6" },
  { id: "term-7", label: { en: "7. Digital Products", zh: "7. 数字产品与购买" }, secNum: "7" },
  { id: "term-8", label: { en: "8. Payments & Taxes", zh: "8. 支付、账单与税费" }, secNum: "8" },
  { id: "term-9", label: { en: "9. Digital Delivery", zh: "9. 数字交付与账户访问" }, secNum: "9" },
  { id: "term-10", label: { en: "10. Refunds", zh: "10. 退款与取消" }, secNum: "10" },
  { id: "term-11", label: { en: "11. Subscriptions", zh: "11. 订阅、会员与周期性付款" }, secNum: "11" },
  { id: "term-12", label: { en: "12. Product License", zh: "12. 数字产品使用许可" }, secNum: "12" },
  { id: "term-13", label: { en: "13. Intellectual Property", zh: "13. 知识产权" }, secNum: "13" },
  { id: "term-14", label: { en: "14. User Accounts", zh: "14. 用户账户" }, secNum: "14" },
  { id: "term-15", label: { en: "15. Communications", zh: "15. Newsletter与电子邮件" }, secNum: "15" },
  { id: "term-16", label: { en: "16. User Conduct", zh: "16. 用户行为规范" }, secNum: "16" },
  { id: "term-17", label: { en: "17. Third-Party Links", zh: "17. 第三方工具、链接与平台" }, secNum: "17" },
  { id: "term-18", label: { en: "18. No Guarantees", zh: "18. 不保证特定结果" }, secNum: "18" },
  { id: "term-19", label: { en: "19. Service Availability", zh: "19. 服务可用性与变更" }, secNum: "19" },
  { id: "term-20", label: { en: "20. Privacy Relation", zh: "20. 隐私政策关联" }, secNum: "20" },
  { id: "term-21", label: { en: "21. International Users", zh: "21. 国际用户" }, secNum: "21" },
  { id: "term-22", label: { en: "22. Liability Limitation", zh: "22. 责任限制" }, secNum: "22" },
  { id: "term-23", label: { en: "23. Indemnification", zh: "23. 赔偿条款" }, secNum: "23" },
  { id: "term-24", label: { en: "24. Term Changes", zh: "24. 条款变更" }, secNum: "24" },
  { id: "term-25", label: { en: "25. Governing Law", zh: "25. 适用法律与争议解决" }, secNum: "25" },
  { id: "term-26", label: { en: "26. Contact", zh: "26. 联系方式" }, secNum: "26" }
];

export default function TermsView({ lang, onBackToHome, onPlayChime }: TermsViewProps) {
  const [activeSec, setActiveSec] = useState<string>("term-1");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSec(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTocClick = (id: string) => {
    if (onPlayChime) onPlayChime();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSec(id);
      setMobileMenuOpen(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12 relative z-10 bg-[#F4F1EB] text-[#1C1C1C]"
      id="terms-view-container"
    >
      {/* Return Button */}
      <motion.button
        variants={itemVariants}
        onClick={() => {
          if (onPlayChime) onPlayChime();
          onBackToHome();
        }}
        className="flex items-center gap-2 mb-12 px-5 py-2.5 rounded-full border border-[#D8D2C6] bg-white/40 text-[#1C1C1C]/75 hover:text-[#1C1C1C] hover:border-[#1A2F24] hover:bg-[#F4F1EB] transition-all duration-300 font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
        id="terms-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "en" ? "Return to Core Hub" : "返回智枢主页"}
      </motion.button>

      {/* Header section designed as a premium editorial column */}
      <header className="mb-16 border-b border-[#D8D2C6] pb-12" id="terms-header">
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4" id="terms-badge">
          <Scale className="w-4 h-4 text-[#8B5A44]" />
          <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44]">
            {lang === "en" ? "LEGAL AGREEMENT & TERMS OF SERVICE" : "法律协议与服务条款"}
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight mb-6"
          id="terms-main-title"
        >
          {lang === "en" ? "Terms of Use" : "使用条款"}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-serif italic text-sm text-[#1C1C1C]/60 mb-8"
          id="terms-last-updated"
        >
          {lang === "en" ? "Last updated: July 5, 2026" : "最后更新日期：2026年7月5日"}
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="font-serif text-base text-[#1C1C1C]/85 leading-relaxed max-w-4xl"
          id="terms-lead"
        >
          {lang === "en" ? (
            <>
              Welcome to <strong>Immersation｜智枢阁</strong>.
              <br /><br />
              Immersation｜智枢阁 is a personal intelligence media and digital publishing brand by <strong>Malttrix｜梦萃</strong>, created to help future-ready individuals explore mindful longevity, AI automation, wealth cognition, and long-term personal knowledge systems.
              <br /><br />
              These Terms of Use govern your access to and use of our website, editorial content, newsletters, digital products, ebooks, toolkits, templates, audio materials, downloads, courses, community features, and related services. By accessing this website, creating an account, purchasing a product, downloading a file, subscribing to our newsletter, or using any part of our services, you agree to these Terms of Use.
            </>
          ) : (
            <>
              欢迎访问 <strong>Immersation｜智枢阁</strong>。
              <br /><br />
              Immersation｜智枢阁 是 <strong>Malttrix｜梦萃</strong> 旗下的精品个人智能媒体与数字出版品牌，致力于帮助未来个体探索正念长寿、AI 自动化、财富认知与长期个人知识系统。
              <br /><br />
              本使用条款适用于您访问和使用我们的网站、编辑内容、Newsletter、数字产品、电子书、工具包、模板、音频资料、下载文件、课程、社群功能及相关服务。当您访问本网站、创建账户、购买产品、下载文件、订阅 Newsletter 或使用我们的任何服务时，即表示您同意本使用条款。
            </>
          )}
        </motion.p>
      </header>

      {/* Main Two-Column Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="terms-layout-grid">
        
        {/* Sticky Table of Contents - Desktop */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28 self-start max-h-[80vh] overflow-y-auto pr-4 scrollbar-thin" id="terms-desktop-toc">
          <div className="border-l border-[#D8D2C6] pl-6 space-y-3.5">
            <h3 className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] mb-5">
              {lang === "en" ? "OUTLINE" : "目录提要"}
            </h3>
            {tocItems.map((item) => {
              const isActive = activeSec === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTocClick(item.id)}
                  className={`block text-left font-display text-[11px] tracking-wider transition-all duration-300 py-0.5 hover:text-[#8B5A44] cursor-pointer max-w-full truncate ${
                    isActive 
                      ? "text-[#8B5A44] font-semibold translate-x-1" 
                      : "text-[#1C1C1C]/50 font-normal"
                  }`}
                  id={`terms-toc-link-${item.id}`}
                  title={item.label[lang]}
                >
                  {item.label[lang]}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile TOC - Collapsible Accordion Selector */}
        <div className="lg:hidden w-full mb-8" id="terms-mobile-toc-container">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between p-4 bg-white/60 border border-[#D8D2C6] rounded-sm font-display text-xs uppercase font-bold tracking-wider text-[#1A2F24] cursor-pointer"
            id="terms-mobile-toc-toggle"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8B5A44]" />
              {lang === "en" ? "Section Outline" : "条款目录"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-2 bg-white/90 border border-[#D8D2C6] rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in z-30 relative" id="terms-mobile-toc-dropdown">
              {tocItems.map((item) => {
                const isActive = activeSec === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTocClick(item.id)}
                    className={`flex items-center justify-between text-left p-2.5 rounded-sm font-display text-xs tracking-wider hover:bg-[#F4F1EB] transition-colors cursor-pointer ${
                      isActive 
                        ? "text-[#8B5A44] font-semibold bg-[#8B5A44]/5" 
                        : "text-[#1C1C1C]/70"
                    }`}
                    id={`terms-mobile-toc-link-${item.id}`}
                  >
                    <span className="truncate pr-2">{item.label[lang]}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-[#8B5A44] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Content Column */}
        <main className="lg:col-span-9 space-y-16" id="terms-content-main">
          
          {/* Section 1: Who We Are */}
          <section id="term-1" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 01 ]</span>
              {lang === "en" ? "Who We Are" : "我们是谁"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    For the purpose of these Terms, “Immersation,” “we,” “our,” or “us” refers to <strong>Immersation｜智枢阁</strong>, a knowledge brand by <strong>Malttrix｜梦萃</strong>.
                  </p>
                  <p>
                    Our website and digital products are designed for educational, editorial, and personal development purposes. We create content and tools related to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>Mindfulness Health & Longevity</li>
                    <li>AI Automation</li>
                    <li>Wealth Cognition</li>
                    <li>Personal Intelligence Systems & Digital Publishing</li>
                    <li>Editorial Intelligence, AI Toolkits, and Workflow Systems</li>
                    <li>Digital Guides, Ebooks, Audio Experiences, and Frameworks</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    在本条款中，“Immersation”、“智枢阁”、“我们”或“本品牌”指 <strong>Immersation｜智枢阁</strong>，即 <strong>Malttrix｜梦萃</strong> 旗下的知识型品牌。
                  </p>
                  <p>
                    我们的网站和数字产品主要用于教育、编辑出版与个人成长用途，内容方向包括但不限于：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>正念健康与长寿管理</li>
                    <li>AI 自动化</li>
                    <li>财富认知与个人智能系统</li>
                    <li>数字出版与编辑型智能内容</li>
                    <li>AI 工具包与工作流系统</li>
                    <li>数字指南、电子书、音频体验与框架工具</li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Section 2: Eligibility */}
          <section id="term-2" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 02 ]</span>
              {lang === "en" ? "Eligibility" : "使用资格"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>By using our website or purchasing our products, you confirm that:</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>You are at least the age of majority in your country, state, or region.</li>
                    <li>You have the legal capacity to enter into these Terms.</li>
                    <li>The information you provide is accurate and complete.</li>
                    <li>You will use our website and products only for lawful purposes.</li>
                  </ul>
                  <p>If you are using our website or products on behalf of an organization, you represent that you have authority to accept these Terms on behalf of that organization.</p>
                </>
              ) : (
                <>
                  <p>当您使用本网站或购买我们的产品时，即表示您确认：</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>您已达到所在国家、州、省或地区的法定成年年龄；</li>
                    <li>您具备签署并遵守本条款的法律能力；</li>
                    <li>您提供的信息真实、准确、完整；</li>
                    <li>您仅会以合法目的使用本网站和产品。</li>
                  </ul>
                  <p>如果您代表某个组织、公司或团队使用本网站或产品，即表示您确认您有权代表该组织接受本条款。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 3: Educational Purpose */}
          <section id="term-3" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 03 ]</span>
              {lang === "en" ? "Educational and Informational Purpose Only" : "仅供教育与信息参考"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    All content, products, tools, guides, frameworks, templates, newsletters, audio materials, and other resources provided by Immersation are for <strong>educational and informational purposes only</strong>.
                  </p>
                  <p>Our content does not constitute medical, mental health, financial, investment, legal, tax, accounting, or professional consulting advice, diagnosis, treatment, or individualized recommendations.</p>
                  <p>You should consult qualified professionals before making decisions related to health, wellness, investments, finance, tax, law, business, or any other professional matter. You are solely responsible for your own decisions, actions, results, and use of any information or materials provided by Immersation.</p>
                </>
              ) : (
                <>
                  <p>
                    Immersation 提供的所有内容、产品、工具、指南、框架、模板、Newsletter、音频资料及其他资源均仅供<strong>教育与信息参考</strong>。
                  </p>
                  <p>我们的内容不构成：医疗建议、心理健康建议、财务建议、投资建议、法律建议、税务建议、会计建议、专业咨询建议或任何形式的个性化诊断与治疗方案。</p>
                  <p>在作出任何与健康、身心状态、投资、财务、税务、法律、商业或其他专业事项相关的决定前，您应咨询合格的专业人士。您需自行对自己的决定、行动、结果以及对本品牌内容或产品的使用承担全部责任。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 4: Health Disclaimer */}
          <section id="term-4" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 04 ]</span>
              {lang === "en" ? "No Medical or Health Advice" : "非医疗或健康建议"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    Immersation may publish content related to mindfulness, sleep, recovery, stress, longevity, nervous system regulation, energy management, and lifestyle systems.
                  </p>
                  <p>This content is not medical advice and should not be used to diagnose, treat, prevent, or cure any disease, condition, or health issue.</p>
                  <p>You should always consult a qualified healthcare professional before making changes to your health routines, sleep practices, nutrition, exercise, supplements, medication, or treatment plans. If you have a medical condition, mental health concern, or emergency, seek professional medical help immediately.</p>
                </>
              ) : (
                <>
                  <p>
                    Immersation 可能发布与正念、睡眠、恢复、压力、长寿、神经系统调节、精力管理和生活方式系统相关的内容。
                  </p>
                  <p>这些内容并非医疗建议，不应用于诊断、治疗、预防或治愈任何疾病、症状或健康问题。</p>
                  <p>在改变您的健康习惯、睡眠方式、饮食、运动、营养补充剂、药物或治疗计划之前，您应咨询合格的医疗专业人士。如果您存在医疗状况、心理健康问题或紧急情况，请立即寻求专业医疗帮助。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 5: Financial Disclaimer */}
          <section id="term-5" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 05 ]</span>
              {lang === "en" ? "No Financial or Investment Advice" : "非财务或投资建议"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    Immersation may publish content related to wealth cognition, investing frameworks, risk awareness, asset allocation, market cycles, behavioral finance, and long-term capital thinking.
                  </p>
                  <p>This content is for educational purposes only. We are not acting as your financial adviser, investment adviser, broker, tax adviser, or legal adviser. Nothing on this website should be understood as a recommendation to buy, sell, or hold any asset; a guarantee of returns; an individualized investment strategy; or a substitute for professional financial advice.</p>
                  <p>All investments involve risk, including the possible loss of capital. You are responsible for conducting your own research and consulting licensed professionals where appropriate.</p>
                </>
              ) : (
                <>
                  <p>
                    Immersation 可能发布与财富认知、投资框架、风险意识、资产配置、市场周期、行为金融和长期资本思维相关的内容。
                  </p>
                  <p>这些内容仅供教育参考。我们并非您的财务顾问、投资顾问、经纪人、税务顾问或法律顾问。本网站中的任何内容均不应被理解为购买、出售或持有任何资产的建议、收益保证、特定投资规划或专业财务建议的替代品。</p>
                  <p>所有投资均存在风险，包括本金亏损的可能。您应自行研究，并在适当情况下咨询持牌专业人士。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 6: AI & Technology */}
          <section id="term-6" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 06 ]</span>
              {lang === "en" ? "AI Tools, Automation, and Technology Content" : "AI 工具、自动化与技术内容"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    Immersation may provide educational content, prompts, templates, workflows, toolkits, and guides related to AI automation, productivity systems, content workflows, research systems, and digital operations.
                  </p>
                  <p>AI tools may produce inaccurate, incomplete, biased, outdated, or unsuitable outputs. You are responsible for reviewing, verifying, and adapting any AI-generated or AI-assisted output before relying on it.</p>
                  <p>We do not guarantee that any AI workflow, prompt, automation system, or toolkit will produce a specific result, income, performance improvement, traffic increase, ranking improvement, or business outcome.</p>
                </>
              ) : (
                <>
                  <p>
                    Immersation 可能提供与 AI 自动化、效率系统、内容工作流、研究系统和数字运营相关的教育内容、提示词、模板、工作流、工具包和指南。
                  </p>
                  <p>AI 工具可能产生不准确、不完整、有偏差、过时或不适合特定场景的输出。您有责任在依赖任何 AI 生成或 AI 辅助内容之前进行审查、验证和调整。</p>
                  <p>我们不保证任何 AI 工作流、提示词、自动化系统或工具包能够带来特定结果、收入、效率提升、流量增长、排名提升或商业成果。您有责任遵守您所使用的任何第三方 AI 服务的相关条款与政策。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 7: Digital Products */}
          <section id="term-7" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 07 ]</span>
              {lang === "en" ? "Digital Products and Purchases" : "数字产品与购买"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>Immersation may sell or provide digital products, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>Ebooks, digital guides, PDF handbooks, and workbooks.</li>
                    <li>AI toolkits, prompt libraries, Notion templates, and workflows.</li>
                    <li>Automation blueprints, audio products, courses, and frameworks.</li>
                  </ul>
                  <p>When you purchase a digital product, you are purchasing a limited license to access and use that product according to these Terms. You do not receive ownership of the underlying intellectual property. Prices, product details, availability, and bonuses may change at any time without prior notice.</p>
                </>
              ) : (
                <>
                  <p>Immersation 可能销售或提供数字产品，包括但不限于：</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>电子书、数字指南、PDF 手册及工作簿；</li>
                    <li>AI 工具包、提示词库、Notion 系统及工作流；</li>
                    <li>自动化蓝图、音频产品、课程、框架工具等。</li>
                  </ul>
                  <p>当您购买数字产品时，您购买的是在本条款约束下访问和使用该产品的有限许可。您并不拥有该产品背后的核心知识产权。产品价格、内容详情、可用状态及赠送福利可能随时变更，恕不另行通知。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 8: Payments & Taxes */}
          <section id="term-8" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 08 ]</span>
              {lang === "en" ? "Payment, Billing, and Taxes" : "支付、账单与税费"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>Payments may be processed through third-party payment providers such as Stripe, PayPal, card networks, wallet providers, or other supported checkout services.</p>
                  <p>By making a purchase, you agree to provide accurate billing and payment information and authorize the relevant payment provider to process the transaction. You are responsible for any applicable taxes, duties, conversion fees, bank charges, or payment provider fees that may apply in your country or region.</p>
                  <p>Unless expressly stated, Immersation does not store your full payment card details on our own servers. Payment processing is handled by third-party payment providers according to their own terms and privacy practices.</p>
                </>
              ) : (
                <>
                  <p>付款可能通过第三方支付服务商处理，例如 Stripe、PayPal、银行卡网络、电子钱包或其他支持的结账服务。</p>
                  <p>当您进行购买时，即表示您同意提供准确的账单和付款信息，并授权相关支付服务商处理交易。您需自行承担所在国家或地区可能产生的适用税费、关税、汇率转换费、银行费用或支付服务商收费。</p>
                  <p>除非另有说明，Immersation 不会在自有服务器上存储您的完整银行账户或信用卡敏感信息。支付处理由第三方支付服务商根据其自身条款和隐私政策完成。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 9: Digital Delivery */}
          <section id="term-9" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 09 ]</span>
              {lang === "en" ? "Digital Delivery and Account Access" : "数字交付与账户访问"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>Digital products are usually delivered through a download link, customer account, email delivery, protected product page, third-party platform access, or digital library area.</p>
                  <p>You are responsible for providing a valid email address and maintaining access to your account. We are not responsible for failed delivery caused by incorrect email addresses, spam filters, mailbox restrictions, account access issues, or third-party platform problems.</p>
                  <p>If you experience difficulty accessing a product you purchased, please contact us through our support channel.</p>
                </>
              ) : (
                <>
                  <p>数字产品通常通过以下一种或多种方式交付：下载链接、用户个人账户、电子邮件、受保护的专属产品页面、第三方平台访问或数字资料库等。</p>
                  <p>您有责任提供有效的电子邮件地址，并妥善维护您的账户访问权限。对于因错误邮箱、垃圾邮件过滤、邮箱空间超限、账户访问凭证丢失或第三方服务异常导致的交付失败，本品牌不承担连带赔偿责任。</p>
                  <p>如果您在接收或下载产品时遇到任何技术障碍，请随时通过我们的支持渠道进行反馈。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 10: Refunds */}
          <section id="term-10" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 10 ]</span>
              {lang === "en" ? "Refunds and Cancellations" : "退款与取消"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>Due to the nature of digital products, all sales are generally final once access has been granted, the product has been downloaded, or the digital file has been delivered.</p>
                  <p>However, we may consider refund requests on a case-by-case basis where required by applicable law or where there is a clear technical issue preventing access. Refund eligibility may depend on whether the product was accessed, the type of product, timing, and regional consumer laws. If a refund is approved, access to the product will be revoked.</p>
                </>
              ) : (
                <>
                  <p>由于数字产品具有可复制和即时下载的物理属性，一旦访问权限已开通、产品已下载或数字文件已完成送达，所有销售通常视为最终交易，不予退换。</p>
                  <p>然而，在符合法律强制性规范下，或当存在无法修复的底层技术故障导致您始终无法正常访问所购产品时，我们会按个案进行友好协商。若退款获批，我们可能会撤销您对相关数字资产的使用及访问权限。本条款绝不剥夺您作为当地消费者享有的强制性法定保障权益。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 11: Subscriptions */}
          <section id="term-11" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 11 ]</span>
              {lang === "en" ? "Subscriptions, Memberships, and Recurring Payments" : "订阅、会员与周期性付款"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>If Immersation offers paid subscriptions, memberships, premium newsletters, recurring product access, or member-only digital libraries, the pricing, billing cycle, renewal terms, cancellation method, and included benefits will be shown at the time of purchase.</p>
                  <p>By subscribing, you authorize recurring billing until you cancel. You may cancel your subscription according to the cancellation process provided. Unless otherwise stated or required by law, cancellation stops future billing but does not automatically refund amounts already paid.</p>
                </>
              ) : (
                <>
                  <p>如果 Immersation 提供付费订阅、会员专属 Newsletter、周期性产品访问或专享数字资料库，其价格、账单扣款周期、自动续订规则、取消方式和所享权益将在购买时详细呈现。</p>
                  <p>一旦订阅，即表示您授权渠道在您执行手动取消前进行周期性的划扣。您可以随时在控制面板或支付服务商端取消订阅。除非法律另有规定，取消订阅将停止下个周期的计费，但已支付的当期账单不予退还。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 12: Product License */}
          <section id="term-12" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 12 ]</span>
              {lang === "en" ? "License to Use Digital Products" : "数字产品使用许可"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>When you purchase, download, or access Immersation digital products, we grant you a limited, personal, non-exclusive, non-transferable, revocable license to use the product for your own personal or internal business learning purposes.</p>
                  <p>Unless we give you written permission, you may not:</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>Resell, redistribute, sublicense, or share the product.</li>
                    <li>Upload the product to public websites, file-sharing platforms, or AI training datasets.</li>
                    <li>Copy, modify, or repackage the product for sale.</li>
                    <li>Use the product as part of a paid course, workshop, or commercial program.</li>
                    <li>Remove copyright notices, brand marks, or ownership information.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>当您购买、下载或访问 Immersation 数字产品时，我们授予您一项有限的、个人的、非排他的、不可转让的、可撤销的学术与使用许可，用于您个人学习或团队内部业务研讨用途。</p>
                  <p>未经我们书面明示授权，您不得进行以下操作：</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>转售、再分发、向第三方转赠或拆解共享该产品；</li>
                    <li>将产品上传至公开网络空间、云共享网盘或将其输入至 AI 训练模型数据库中；</li>
                    <li>抄袭、恶意改编、重新打包或将其转变为您的付费商业课程与咨询材料；</li>
                    <li>抹去任何原厂版权标识、品牌 LOGO 或所有权声明。</li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Section 13: Intellectual Property */}
          <section id="term-13" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 13 ]</span>
              {lang === "en" ? "Intellectual Property" : "知识产权"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>All content on this website and in our products is owned by or licensed to Immersation｜智枢阁 and Malttrix｜梦萃, unless otherwise stated.</p>
                  <p>This includes but is not limited to: brand names, logos, slogans, website layout, texts, newsletters, articles, ebooks, audio files, templates, diagram models, prompts, code, and downloadable assets. You may not copy, reproduce, distribute, or create derivative works from our content without prior written permission.</p>
                </>
              ) : (
                <>
                  <p>除非特别批注，本网站所载及产品内包含的全部内容（包括但不限于品牌名称、Logo、Slogan、视觉排版、专栏文章、电子书、音频流、多学科心智模型图表、提示词包、Notion 底层架构和下载资源）均属于 Immersation｜智枢阁 及 Malttrix｜梦萃 所有，并受到国际著作权、商标权等知识产权法保护。</p>
                  <p>未经事先正式书面准许，任何人不得擅自复制、翻印、传播、公开演示或将其二次编译成派生作品。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 14: User Accounts */}
          <section id="term-14" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 14 ]</span>
              {lang === "en" ? "User Accounts" : "用户账户"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>Some features may require you to create an account. You are responsible for keeping your login details secure, maintaining accurate account info, and all activity under your account.</p>
                  <p>We may suspend or terminate accounts that violate these Terms, share paid content without permission, engage in fraud, or create security risks for our website, users, or systems.</p>
                </>
              ) : (
                <>
                  <p>访问特定精品特权或获取历史订单下载包可能需要您开通独立账户。您有义务妥善封锁和保密自己的登录口令，并对该账户下的一切正常及异常操作负全部民事法律责任。</p>
                  <p>若我们发现账户涉及盗号、协助他人非法分流付费资产、涉嫌金融欺诈或损害网站服务器的黑客行为，我们将对相关账户采取限时封禁或永久销号处理。</p>
                </>
              )}
            </div>
          </section>

          {/* Section 15: Communications */}
          <section id="term-15" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 15 ]</span>
              {lang === "en" ? "Newsletter and Email Communications" : "Newsletter 与电子邮件通讯"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  When you subscribe to our newsletter or provide your email address, you may receive editorial updates, product announcements, educational content, and brand communications from Immersation. You can unsubscribe from marketing emails at any time by using the link included in our emails. Transactional emails (e.g. download access, receipt confirmations) will still be sent as necessary.
                </p>
              ) : (
                <p>
                  当您主动选择加入我们的订阅名录后，系统将为您推送定期的编辑型内容及新套件发布信息。您可以随时使用任一封营销电邮末端的“Unsubscribe”按钮快速离场。为保证核心消费权益，关于订单确认和付款账单的安全交易型电邮依然会根据需要投递。
                </p>
              )}
            </div>
          </section>

          {/* Section 16: User Conduct */}
          <section id="term-16" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 16 ]</span>
              {lang === "en" ? "User Conduct" : "用户行为规范"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>Use our website or products for unlawful purposes.</li>
                    <li>Attempt to hack, disrupt, overload, or damage our website.</li>
                    <li>Scrape, copy, or extract content without permission.</li>
                    <li>Share paid products publicly or with unauthorized users.</li>
                    <li>Impersonate another person or organization.</li>
                    <li>Upload malicious code, spam, or harmful content.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>作为高阶智识社区的一员，您必须遵循如下健康的行为准则：</p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>严禁实施任何违反适用法律、侵害第三方名誉的恶劣行径；</li>
                    <li>严禁通过任何技术工具对我们的网络服务器实施 Ddos、渗透性越权渗透或逆向破解；</li>
                    <li>严禁使用网络爬虫无授权地扒取内容或侵占带宽；</li>
                    <li>严禁公开传播或转借分享您的付费电子资料及兑换码；</li>
                    <li>严禁上传病毒、特洛伊木马、恶意宏代码或投递垃圾钓鱼广告。</li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Section 17: Third-Party Links */}
          <section id="term-17" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 17 ]</span>
              {lang === "en" ? "Third-Party Tools, Links, and Platforms" : "第三方工具、链接与平台"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  Our website may include links to third-party websites, tools, platforms, payment processors, AI services, newsletter platforms, or embedded content. We do not control third-party platforms and are not responsible for their content, policies, security, or results. Your use of third-party tools is governed by their own terms and privacy policies.
                </p>
              ) : (
                <p>
                  我们的数字读物和面板可能包含指向外部应用或服务商的超链接（如 Stripe 扣款、Notion 部署、Gemini 模型集成等）。该等第三方平台属于完全独立的实体，我们无法把控其运营方向。对于您在使用外部第三方平台时所产生的收费纠纷、数据篡改及信息丢失，本品牌不承担任何赔偿及连带责任。
                </p>
              )}
            </div>
          </section>

          {/* Section 18: No Guarantees */}
          <section id="term-18" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 18 ]</span>
              {lang === "en" ? "No Guarantees of Results" : "不保证特定结果"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  Immersation provides knowledge, frameworks, tools, and educational resources. We do not guarantee specific outcomes, including health improvements, income increases, investment returns, traffic growth, or specific business performance. Your results depend on personal circumstances, implementation, judgment, resources, and external market conditions.
                </p>
              ) : (
                <p>
                  本品牌致力于传播理性的心智框架与前沿效率工具，但我们绝不对任何实践结果做出承诺担保。这包括但不限于：不保证您的体质长寿状况获得实质提升、不承诺您的投资回报及个人营收获得保底暴增、不确保您的网站 SEO 流量或业务自动化方案百分之百奏效。您最终取得的成效，完全取决于您的个人执行力、多变的市场宏观环境以及外部突发变量。
                </p>
              )}
            </div>
          </section>

          {/* Section 19: Service Availability */}
          <section id="term-19" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 19 ]</span>
              {lang === "en" ? "Availability and Changes to Services" : "服务可用性与变更"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  We may update, modify, pause, discontinue, or restrict access to any part of our website, products, content, features, prices, or services at any time. We aim to maintain reliable access, but we do not guarantee that the website, downloads, checkout, or products will always be available, uninterrupted, secure, or error-free.
                </p>
              ) : (
                <p>
                  我们有权在不发出单独通知的前提下，对本网站的界面排版、功能模块、产品价格、文章归档等进行下线、升级、维护或调整。虽然我们会竭尽全力维持系统无缝流畅，但我们不保证因不可抗力、服务器迁移、骨干网光缆中断造成的瞬时不可访问、网络延迟或技术报错。
                </p>
              )}
            </div>
          </section>

          {/* Section 20: Privacy Relation */}
          <section id="term-20" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 20 ]</span>
              {lang === "en" ? "Privacy Policy" : "隐私政策关联"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  Your use of our website and services is also governed by our Privacy Policy, which explains how we collect, use, store, protect, and share personal information. Please read our Privacy Policy carefully.
                </p>
              ) : (
                <p>
                  您对本网站的阅读、购买等一切交互操作均受本品牌《隐私政策》的约束与保护，详情请仔细查阅我们的专项隐私公开细则。
                </p>
              )}
            </div>
          </section>

          {/* Section 21: International Users */}
          <section id="term-21" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 21 ]</span>
              {lang === "en" ? "International Users" : "国际用户"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  You are responsible for ensuring that your use of our website, products, content, and services complies with the laws and regulations that apply in your region. We do not guarantee that our content, products, or services are appropriate or available in every country. We may restrict access to certain products or payment methods where required by local laws.
                </p>
              ) : (
                <p>
                  本网站面向全球受众。若您从本地区以外访问，您必须主动核验并确保您的所有操作及获取数字资产的行为，符合您所在国家或司法管辖区的各项网络准入规范与外汇法律约束。本品牌保留应合规部门及金融网关要求限制特定境外 IP 或结算支付通道的权利。
                </p>
              )}
            </div>
          </section>

          {/* Section 22: Liability Limitation */}
          <section id="term-22" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 22 ]</span>
              {lang === "en" ? "Limitation of Liability" : "责任限制"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  To the maximum extent permitted by law, Immersation｜智枢阁, Malttrix｜梦萃, and their team members, partners, and affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, revenue, data, goodwill, health outcomes, investment losses, or reliance on content. Our total liability for any claim related to a purchased product will not exceed the amount you paid for that product.
                </p>
              ) : (
                <p>
                  在适用法律准许的最宽边界内，Immersation｜智枢阁、Malttrix｜梦萃 及其创始所有者、团队合伙人、聘用顾问、分销商，不对任何由于信任本站内容、操作不当造成的间接损失、偶发伤害、名誉减损、身心状况偏离、投资本金亏损或因网络技术故障引发的业务中断承担经济及侵权赔偿责任。在任何诉讼指控下，我们对您购买特定数字商品所产生的最大累计责任总额上限，绝不超过您为该等单项商品实际划扣的实付总金额。
                </p>
              )}
            </div>
          </section>

          {/* Section 23: Indemnification */}
          <section id="term-23" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 23 ]</span>
              {lang === "en" ? "Indemnification" : "赔偿条款"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  You agree to defend, indemnify, and hold harmless Immersation, Malttrix, and their team members, partners, and affiliates from any claims, damages, losses, liabilities, costs, or expenses arising from your use of our website or products, your violation of these Terms, or your infringement of third-party rights.
                </p>
              ) : (
                <p>
                  您同意，若由于您公然违背本条款内容、非法篡改分分流我们的数码知识版权、从事反洗钱或黑客勒索，进而导致第三方对 Immersation｜智枢阁、Malttrix｜梦萃 发起联合起诉或造成行政罚款时，您需全额补偿及保障我们的诉讼抗辩费、受损名誉减值、司法罚金及相关损害赔偿金。
                </p>
              )}
            </div>
          </section>

          {/* Section 24: Term Changes */}
          <section id="term-24" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 24 ]</span>
              {lang === "en" ? "Changes to These Terms" : "条款变更"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  We may update these Terms from time to time. When we update them, we will revise the “Last Updated” date at the top of this page. Your continued use of our website, products, or services after the updated Terms are posted means you accept the revised Terms.
                </p>
              ) : (
                <p>
                  我们保留随时对本使用条款进行修补、剔除或完善的单方面权利。每一次条款演进，我们都会修改页面最上方的“最后更新日期”。在修定版使用条款发布后，您的任何继续访问与下载，均代表您已默认并无保留接受最新修订款约束。
                </p>
              )}
            </div>
          </section>

          {/* Section 25: Governing Law */}
          <section id="term-25" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 25 ]</span>
              {lang === "en" ? "Governing Law and Dispute Resolution" : "适用法律与争议解决"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  These Terms are governed by the laws of our registration country without regard to conflict of law principles. Any dispute arising from these Terms, the website, or our products will be resolved through friendly consultation first, failing which, through formal courts or dispute resolution forums of our choosing, unless mandatory local consumer protection laws require otherwise.
                </p>
              ) : (
                <p>
                  本条款之签订、生效、履行、解释及因本条款产生之所有民事诉讼争议，均适用我们注册实体所在地之法律管辖。因使用本品牌产品引发的任何纠纷，应先通过友好、理性的在线通道协商解决；若调解无效，双方均同意向我们注册实体所在地具有管辖权的法院提起正式诉讼，除非您所在地的消费者保护法有强制性排除。
                </p>
              )}
            </div>
          </section>

          {/* Section 26: Contact */}
          <section id="term-26" className="scroll-mt-24 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 26 ]</span>
              {lang === "en" ? "Contact & Operational Base" : "联系方式与品牌基地"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-6">
              {lang === "en" ? (
                <>
                  <p>
                    If you have questions about these Terms, licensing privileges, digital downloads, or corporate support, please contact us.
                  </p>
                  <p className="text-xs text-[#1C1C1C]/60 italic">
                    <strong>Notice:</strong> These terms serve as an operational framework for transparent delivery. Users should obtain local legal or financial advice before configuring large-scale AI automations or high-stakes wealth structures.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    如果您对本使用条款、数字交付授权、团队商用许可或订单故障协助有任何疑问，请随时与我们取得联系。
                  </p>
                  <p className="text-xs text-[#1C1C1C]/60 italic">
                    <strong>合规提示：</strong> 本服务条款旨在构建清晰、透明的交易边界。读者在部署高杠杆的 AI 自动化工作流或执行大规模资产规划时，建议获取执业律师或认证理财师的单独评估。
                  </p>
                </>
              )}

              {/* Legal CTA Block - Deep Cypress #1A2F24 with Parchment White #F4F1EB text */}
              <div className="mt-8 bg-[#1A2F24] text-[#F4F1EB] rounded-md p-8 shadow-md border border-[#D8D2C6]/20 relative overflow-hidden" id="terms-cta-block">
                <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/[0.03] pointer-events-none" />
                <span className="font-display text-[9px] font-bold uppercase tracking-[0.25em] text-[#8B5A44] block mb-2">
                  {lang === "en" ? "COMPLIANCE & BRAND ASSISTANCE" : "合规与客户席位"}
                </span>
                <h3 className="font-serif text-xl font-normal mb-3 leading-snug">
                  {lang === "en" ? "Need team licensing or commercial guide privileges?" : "需要团队多账户商用授权或深入合作咨询？"}
                </h3>
                <p className="font-serif text-xs text-[#F4F1EB]/80 leading-relaxed mb-6 max-w-2xl">
                  {lang === "en" 
                    ? "Our personal intelligence media operations desk at Malttrix | 梦萃 handles all custom multi-seat license requests and partner contracts directly."
                    : "我们由 Malttrix｜梦萃 设立的品牌运营部门，可为您提供定制化的多席位团队许可协议、商用授权书以及分销渠道合作。我们将在 2 个工作日内给您正式回复。"}
                </p>
                <a 
                  href="mailto:support@immersation.com"
                  className="inline-flex items-center gap-2.5 bg-[#8B5A44] text-[#F4F1EB] hover:bg-white hover:text-[#1A2F24] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3 rounded-sm transition-all duration-300"
                  id="terms-mailto-link"
                >
                  <Mail className="w-4 h-4" />
                  {lang === "en" ? "CONTACT COMPLIANCE GROUP" : "联络合规协作组"}
                </a>
              </div>
            </div>
          </section>

        </main>

      </div>
    </motion.div>
  );
}
