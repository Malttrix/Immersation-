import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, ShieldCheck, FileText, ChevronDown, Check } from "lucide-react";

interface PrivacyViewProps {
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
  { id: "sec-1", label: { en: "1. Who We Are", zh: "1. 我们是谁" }, secNum: "1" },
  { id: "sec-2", label: { en: "2. Information We Collect", zh: "2. 我们收集的信息" }, secNum: "2" },
  { id: "sec-3", label: { en: "3. How We Use Information", zh: "3. 我们如何使用信息" }, secNum: "3" },
  { id: "sec-4", label: { en: "4. Legal Bases", zh: "4. 法律依据" }, secNum: "4" },
  { id: "sec-5", label: { en: "5. Sharing", zh: "5. 共享信息" }, secNum: "5" },
  { id: "sec-6", label: { en: "6. International Transfers", zh: "6. 国际数据传输" }, secNum: "6" },
  { id: "sec-7", label: { en: "7. Data Retention", zh: "7. 数据保存期限" }, secNum: "7" },
  { id: "sec-8", label: { en: "8. Your Rights", zh: "8. 您的权利" }, secNum: "8" },
  { id: "sec-9", label: { en: "9. California Rights", zh: "9. 加州居民权利" }, secNum: "9" },
  { id: "sec-10", label: { en: "10. Newsletter", zh: "10. Newsletter" }, secNum: "10" },
  { id: "sec-11", label: { en: "11. Ecommerce", zh: "11. 电子商务" }, secNum: "11" },
  { id: "sec-13", label: { en: "12. Cookies", zh: "12. Cookie与分析" }, secNum: "13" },
  { id: "sec-14", label: { en: "13. Security", zh: "13. 数据安全" }, secNum: "14" },
  { id: "sec-15", label: { en: "14. Children", zh: "14. 儿童隐私" }, secNum: "15" },
  { id: "sec-16", label: { en: "15. AI Tools", zh: "15. AI工具与处理" }, secNum: "16" },
  { id: "sec-18", label: { en: "16. Contact", zh: "16. 联系我们" }, secNum: "18" }
];

export default function PrivacyView({ lang, onBackToHome, onPlayChime }: PrivacyViewProps) {
  const [activeSec, setActiveSec] = useState<string>("sec-1");
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
      id="privacy-view-container"
    >
      {/* Return Button */}
      <motion.button
        variants={itemVariants}
        onClick={() => {
          if (onPlayChime) onPlayChime();
          onBackToHome();
        }}
        className="flex items-center gap-2 mb-12 px-5 py-2.5 rounded-full border border-[#D8D2C6] bg-white/40 text-[#1C1C1C]/75 hover:text-[#1C1C1C] hover:border-[#1A2F24] hover:bg-[#F4F1EB] transition-all duration-300 font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
        id="privacy-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "en" ? "Return to Core Hub" : "返回智枢主页"}
      </motion.button>

      {/* Header section designed as a premium editorial column */}
      <header className="mb-16 border-b border-[#D8D2C6] pb-12" id="privacy-header">
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4" id="privacy-badge">
          <ShieldCheck className="w-4 h-4 text-[#8B5A44]" />
          <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44]">
            {lang === "en" ? "LEGAL STANDARDS & DISCLOSURES" : "法律标准与合规公开"}
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight mb-6"
          id="privacy-main-title"
        >
          {lang === "en" ? "Privacy Policy" : "隐私政策"}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-serif italic text-sm text-[#1C1C1C]/60 mb-8"
          id="privacy-last-updated"
        >
          {lang === "en" ? "Last updated: July 5, 2026" : "最后更新日期：2026年7月5日"}
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="font-serif text-base text-[#1C1C1C]/85 leading-relaxed max-w-4xl"
          id="privacy-lead"
        >
          {lang === "en" ? (
            <>
              Immersation｜智枢阁 (“Immersation,” “we,” “our,” or “us”) respects your privacy and is committed to handling personal information with clarity, care, and responsibility.
              <br /><br />
              Immersation is a personal intelligence media and digital publishing brand by Malttrix｜梦萃. We create editorial content, newsletters, digital guides, premium ebooks, AI toolkits, audio experiences, and knowledge products designed to help future-ready individuals build better systems for body, tool, and capital.
            </>
          ) : (
            <>
              Immersation｜智枢阁（以下简称“Immersation”、“我们”或“本品牌”）重视您的隐私，并承诺以清晰、克制、负责的方式处理个人信息。
              <br /><br />
              Immersation｜智枢阁 是 Malttrix｜梦萃 旗下精品个人智能媒体与数字出版品牌。我们提供编辑型内容、Newsletter、数字指南、高级电子书、AI 工具包、音频体验与知识产品，帮助未来个体围绕身体、工具与资本建立更清晰的个人智能系统。
            </>
          )}
        </motion.p>
      </header>

      {/* Main Two-Column Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="privacy-layout-grid">
        
        {/* Sticky Table of Contents - Desktop */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28 self-start max-h-[80vh] overflow-y-auto pr-4 scrollbar-thin" id="desktop-toc">
          <div className="border-l border-[#D8D2C6] pl-6 space-y-4">
            <h3 className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] mb-6">
              {lang === "en" ? "OUTLINE" : "目录提要"}
            </h3>
            {tocItems.map((item) => {
              const isActive = activeSec === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTocClick(item.id)}
                  className={`block text-left font-display text-xs tracking-wider transition-all duration-300 py-1 hover:text-[#8B5A44] cursor-pointer ${
                    isActive 
                      ? "text-[#8B5A44] font-semibold translate-x-1" 
                      : "text-[#1C1C1C]/50 font-normal"
                  }`}
                  id={`toc-link-${item.id}`}
                >
                  {item.label[lang]}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile TOC - Collapsible Accordion Selector */}
        <div className="lg:hidden w-full mb-8" id="mobile-toc-container">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between p-4 bg-white/60 border border-[#D8D2C6] rounded-sm font-display text-xs uppercase font-bold tracking-wider text-[#1A2F24] cursor-pointer"
            id="mobile-toc-toggle"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8B5A44]" />
              {lang === "en" ? "Section Outline" : "政策目录"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-2 bg-white/90 border border-[#D8D2C6] rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in z-30 relative" id="mobile-toc-dropdown">
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
                    id={`mobile-toc-link-${item.id}`}
                  >
                    <span>{item.label[lang]}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-[#8B5A44]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Content Column */}
        <main className="lg:col-span-9 space-y-16" id="privacy-content-main">
          
          {/* Section 1: Who We Are */}
          <section id="sec-1" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 01 ]</span>
              {lang === "en" ? "Who We Are" : "我们是谁"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    Immersation｜智枢阁 is a personal intelligence media and digital publishing brand focused on:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 text-[#1C1C1C]/90 font-sans text-xs sm:text-sm">
                    <li>Mindfulness Health & Longevity</li>
                    <li>AI Automation</li>
                    <li>Wealth Cognition</li>
                    <li>Editorial Intelligence</li>
                    <li>Digital Guides</li>
                    <li>AI Toolkits</li>
                    <li>Audio Experiences</li>
                    <li>Knowledge Assets</li>
                  </ul>
                  <p className="mt-4">
                    Website: <a href="https://www.immersation.com" className="text-[#8B5A44] underline" target="_blank" rel="noopener noreferrer">https://www.immersation.com</a><br />
                    Contact: <span className="font-mono text-xs text-[#1C1C1C]/70">support@immersation.com</span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Immersation｜智枢阁 是一个致力于提升未来个体认知与能效的品牌，专注于：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 text-[#1C1C1C]/90 font-sans text-xs sm:text-sm">
                    <li>正念健康与长寿管理</li>
                    <li>AI 自动化</li>
                    <li>财富认知</li>
                    <li>编辑型智能内容</li>
                    <li>数字指南</li>
                    <li>AI 工具包</li>
                    <li>音频体验</li>
                    <li>知识资产</li>
                  </ul>
                  <p className="mt-4">
                    官方网站：<a href="https://www.immersation.com" className="text-[#8B5A44] underline" target="_blank" rel="noopener noreferrer">https://www.immersation.com</a><br />
                    联系邮箱：<span className="font-mono text-xs text-[#1C1C1C]/70">support@immersation.com</span>
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section id="sec-2" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 02 ]</span>
              {lang === "en" ? "Information We Collect" : "我们收集的信息"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-6">
              {lang === "en" ? (
                <>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.1 Information You Provide Directly</h3>
                    <p>
                      You may provide personal information when you subscribe to our newsletter, create an account, purchase ebooks, digital guides, toolkits, templates, or other products, download resources, or leave comments. This may include your name, email address, billing details, purchase and download history, and communications.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.2 Payment Information</h3>
                    <p>
                      Payment details are handled securely by third-party processors like Stripe, PayPal, or WooCommerce. We do not store your full credit card credentials on our servers. Processing is subject to our providers' independent security protocols.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.3 Automatically Collected Information</h3>
                    <p>
                      Technical statistics such as IP addresses, browser engine configurations, hardware types, referring URL logs, average session durations, and user navigation clicks are tracked anonymously to improve core app efficiency.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.4 Cookies and Tracking</h3>
                    <p>
                      We utilize cookies, tracking pixels, and tags to remember user language choices, optimize page speed performance, and capture aggregate newsletter response statistics. You can configure cookie permissions in your browser.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.1 您主动提供的信息</h3>
                    <p>
                      当您订阅 Newsletter、创建账户、购买电子书、数字指南、工具包、模板、音频产品或提交表单、留下评论时，可能会提供个人数据。这些信息包括姓名、电子邮箱、账单地址、账户凭证、购买记录、下载历史以及沟通。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.2 支付信息</h3>
                    <p>
                      您的订单交易安全均由第三方支付服务商（如 Stripe, PayPal, WooCommerce Payments 等）加密处理。我们绝不会在自己的服务器上缓存或存储您的信用卡全卡号等敏感财务信息。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.3 自动收集的信息</h3>
                    <p>
                      当您访问本品牌网站时，系统可能自动捕获基础网络指纹，包括：IP 地址、设备标识符、浏览器类型、原推荐链接、逗留页面耗时以及点击路径，用于分析并提升交互体验。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs uppercase font-bold tracking-wider text-[#8B5A44] mb-2">2.4 Cookie 与跟踪像素</h3>
                    <p>
                      我们可能通过 Cookie、像素和标签进行会话保持、语系首选项锁定以及追踪总体转化流量。您可以根据需要修改浏览器高级安全选项屏蔽 Cookie 的投递。
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Section 3: How We Use Information */}
          <section id="sec-3" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 03 ]</span>
              {lang === "en" ? "How We Use Your Information" : "我们如何使用信息"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>We process personal data under strict compliance policies for the following scopes:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li><strong>Service Execution:</strong> Delivering editorial newsletters, processing premium guides checkout, and offering digital template download paths.</li>
                    <li><strong>Platform Advancements:</strong> Refining system visual layouts, assessing content relevance, and building more polished digital knowledge kits.</li>
                    <li><strong>Direct Communications:</strong> Relaying critical security notices, dispatching order receipts, and sharing essential knowledge insights.</li>
                    <li><strong>Asset & Security Safeguard:</strong> Shielding our database against unauthorized breaches and enforcing copyright protection guidelines.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>我们遵循最小化原则将收集到的信息用于如下合规目的：</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li><strong>交付服务：</strong> 派送订阅邮件、管理专属下载链路、处理结账与售后客户协助。</li>
                    <li><strong>服务优化：</strong> 分析内容反响、改进文字可读性并为高端读者设计更优秀的智识工具。</li>
                    <li><strong>必要通讯：</strong> 发送付款状态收据、安全预警、以及极少数在合法授权下的专属特惠信息。</li>
                    <li><strong>安全防范：</strong> 侦测恶意爬取与虚假账户注册，巩固系统服务器防护屏障，维护数字出版物版权。</li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Section 4: Legal Bases */}
          <section id="sec-4" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 04 ]</span>
              {lang === "en" ? "Legal Bases for Processing" : "处理个人信息的法律依据"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  For individuals inside the EEA or UK, we rely on established legal pillars to manage your data: your active consent (e.g. opting into our newsletter list), the explicit performance of a contract (e.g. delivering your purchased AI Toolkit), our legitimate brand interest in managing website stability, and legal compliance obligations.
                </p>
              ) : (
                <p>
                  我们基于合法透明的法理依据来流转您的个人数据：获得您的明确知情同意（如主动订阅 Newsletter）、合同履行义务（如保障交付您所购得的高级电子书与工具包）、我们合法的品牌运营利益（如安全防御与性能监控）以及符合相关的法律监管要求。
                </p>
              )}
            </div>
          </section>

          {/* Section 5: Sharing */}
          <section id="sec-5" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 05 ]</span>
              {lang === "en" ? "How We Share Information" : "我们如何共享信息"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  We do not sell your personal data. We restrictively share essential details only with certified service providers that help us deliver our brand ecosystem, such as email dispatch tools (e.g. Mailchimp/ConvertKit), transactional database hosts, secure merchant acquirers (Stripe), and essential security monitors. We ensure these processors respect absolute confidentiality.
                </p>
              ) : (
                <p>
                  我们绝对不会以传统方式售卖您的个人隐私资产。我们仅在必要范围内与保障我们业务良性周转的托管级技术合作方共享数据：如云服务器托管方、专业的电邮触达服务商、权威的结账扣款网关（Stripe 等）、安全风控提供商。上述主体被强制约束且必须履行对等的信息安全保密责任。
                </p>
              )}
            </div>
          </section>

          {/* Section 6: International Transfers */}
          <section id="sec-6" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 06 ]</span>
              {lang === "en" ? "International Data Transfers" : "国际数据传输"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  As Immersation relies on global secure web servers, your information may cross regional borders. In such instances, we take rigorous administrative precautions (such as Standard Contractual Clauses or comparable legal frameworks) to guarantee your data retains a premium level of protection identical to its domestic region.
                </p>
              ) : (
                <p>
                  由于 Immersation 依托跨国别的高级别安全云集群提供服务，您的部分数据包可能会发生跨区域的境外流转。我们会根据当地网络法律规范落实严格的保护壁垒（如采纳欧盟标准契约条款等），确保您的数据享有无差别的安全待遇。
                </p>
              )}
            </div>
          </section>

          {/* Section 7: Data Retention */}
          <section id="sec-7" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 07 ]</span>
              {lang === "en" ? "Data Retention" : "数据保存期限"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  Your details are persisted strictly for the minimum timeline necessary to complete active client subscriptions, process recurring billing accounts, verify license keys for downloadable products, and comply with sovereign tax, fiscal, or legal record-keeping audits. When the retention window closes, data is thoroughly expunged or securely anonymized.
                </p>
              ) : (
                <p>
                  我们对信息的生命周期实行“极简保留”。数据仅在为您提供 Newsletter 订阅通道、处理长期用户订单验证及遵守属地税法审计的最短合规年限内进行安全存储。到期后，系统会进行覆盖式的永久删除或高强度哈希脱敏匿名化处理。
                </p>
              )}
            </div>
          </section>

          {/* Section 8: Your Rights */}
          <section id="sec-8" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 08 ]</span>
              {lang === "en" ? "Your Privacy Rights" : "您的隐私权利"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    Depending on your country of residence, you may possess specific personal data sovereignty options, which we support unconditionally:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li>The right to inspect, review, or copy the data we process.</li>
                    <li>The right to request immediate correction of typographical errors or stale contact emails.</li>
                    <li>The right to claim complete erasure of your active records from our mail lists.</li>
                    <li>The right to object to automated analytics operations or direct email marketing channels.</li>
                  </ul>
                  <p className="mt-4">
                    To invoke your rights, submit a written inquiry to our privacy desk: <span className="font-mono text-xs text-[#1C1C1C]/70">support@immersation.com</span>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    基于您的法定属地，您将拥有对个人信息强有力的知情与控制权，我们予以毫无保留的支持：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 font-sans text-xs sm:text-sm text-[#1C1C1C]/90">
                    <li><strong>知情与访问：</strong> 查阅或提取我们所记录的您的基本信息数据。</li>
                    <li><strong>更正：</strong> 修正因笔误造成的地址或电邮拼写错误。</li>
                    <li><strong>注销或删除：</strong> 指令我们将您的身份信息从我们数据库中完全物理抹去。</li>
                    <li><strong>限制与反对：</strong> 退出定向统计分析或单方面撤回订阅授权。</li>
                  </ul>
                  <p className="mt-4">
                    您可以通过我们的官方隐私协助窗口提请上述诉求：<span className="font-mono text-xs text-[#1C1C1C]/70">support@immersation.com</span>。
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Section 9: California Rights */}
          <section id="sec-9" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 09 ]</span>
              {lang === "en" ? "Rights for California Residents" : "加州居民权利"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  Under California privacy law (CCPA), California citizens have the legal entitlement to ask for clear transparency disclosures regarding data sharing with external marketing platforms, the option to request complete data removal, and protection against discrimination. We do not sell user data.
                </p>
              ) : (
                <p>
                  根据美国加州消费者隐私法案 (CCPA) 规定，加利福尼亚州居民有权了解我们是否因商业广告对个人隐私资产进行了任何形式的隐性交换（即“共享”）、请求安全清退和免受不平等对待。Immersation 坚持不出售任何读者个人数据。
                </p>
              )}
            </div>
          </section>

          {/* Section 10: Newsletter */}
          <section id="sec-10" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 10 ]</span>
              {lang === "en" ? "Newsletter and Email Communications" : "Newsletter 与电子邮件通讯"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  When you voluntarily subscribe to the Immersation Periodicals, we dispatch insightful articles, technical research notes, digital tool updates, and occasional brand announcements. You retain the absolute right to unsubscribe instantly at any moment via the visible link inside every email foot layout. Unsubscribing from marketing does not halt transactional receipts.
                </p>
              ) : (
                <p>
                  当您自愿填入电邮订阅 Immersation 智识内参或 Newsletter 时，我们将向您发送关于长寿、AI 自动化和财富模型的研究备忘录。您可以随时通过邮件最底部的“取消订阅”功能即时、无条件终止邮件的收取。这不影响您的数码购买凭据的投递。
                </p>
              )}
            </div>
          </section>

          {/* Section 11: Ecommerce */}
          <section id="sec-11" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 11 ]</span>
              {lang === "en" ? "Ecommerce and Third-Party Links" : "电子商务与第三方链接"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <>
                  <p>
                    When you purchase our premium digital guides, templates, or audio files, we securely process your email, name, and regional transaction details to authenticate download delivery links, manage your library dashboard, and verify ownership rights.
                  </p>
                  <p>
                    Additionally, our platform may contain hyperlinks to external sites, social media platforms, and collaborative tools. We have no operational control over, and assume no responsibility for, the independent privacy policies, tracking mechanisms, or data handling methods practiced by these external entities.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    在您购买我们的付费数字商品时，我们需要收集、核验您的电邮及账单归属，以保障安全的向您投递下载凭证、管理您的账户面板并进行数字版权确权。
                  </p>
                  <p>
                    此外，我们的文章或指南内可能会不定期嵌入第三方的研究源链接或社交分享节点。这些服务完全独立于我们，本品牌无法、且不承担由于您访问外部第三方平台时所产生的任何隐私泄露及跟踪侵害责任。
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Section 13: Cookies */}
          <section id="sec-13" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 12 ]</span>
              {lang === "en" ? "Cookies and Analytics" : "Cookie 与分析"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  We rely on aggregate web analytics services to understand general audience retention trends, click flows, and performance bottlenecks across various browser types. Where mandated by international cyber laws, we offer clear consent banner tools. You can manually revoke or adjust cookie tracking privileges via your browser's advanced settings at any time.
                </p>
              ) : (
                <p>
                  我们借助轻量、合规的流量分析工具，以完全不记名形式提取读者的阅读停留分布与链路故障率，用于调优整体页面加载速度。根据跨境法律要求，我们会根据您的 IP 所在司法区进行 Cookie 横幅授权提示。您随时可通过浏览器安全策略清空或阻断跟踪。
                </p>
              )}
            </div>
          </section>

          {/* Section 14: Security */}
          <section id="sec-14" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 13 ]</span>
              {lang === "en" ? "Data Security" : "数据安全"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  We maintain strict cloud safeguards (including end-to-end SSL encryption protocols, firewalled databases, and scoped administrative authorization tiers) to secure your personal data against accidental loss or unauthorized leakage. However, as no medium is perfectly bulletproof, we encourage the use of unique passwords for your digital publishing accounts.
                </p>
              ) : (
                <p>
                  我们全面采取符合现代工业水准的安全防御方案（如全链路 SSL/TLS 传输加密、多重云防御、最小行政化白名单授权）保障您的隐私。但由于互联网没有绝对物理隔离的真空，我们依然强烈建议您在创建本品牌关联数字账户时使用强独立密码。
                </p>
              )}
            </div>
          </section>

          {/* Section 15: Children */}
          <section id="sec-15" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 14 ]</span>
              {lang === "en" ? "Children’s Privacy" : "儿童隐私"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  Immersation’s media catalog is explicitly curated for professionals, builders, and lifelong learners. We do not intentionally target or collect data from minors under the age of 13. If you believe a minor has supplied us with data, please contact our help desk so that we may immediately delete it.
                </p>
              ) : (
                <p>
                  Immersation 智枢阁 的内容专注于未来个体的智识升级，仅面向成年学者、知识劳动者和专业人士。我们不会且拒绝主动收集未满 13 周岁（或当地法定限制年龄）少儿的身份数据。如您发现相关情况，请致信我们以便我们在安全审计中作物理清退。
                </p>
              )}
            </div>
          </section>

          {/* Section 16: AI Tools */}
          <section id="sec-16" className="scroll-mt-24 border-b border-[#D8D2C6]/40 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 15 ]</span>
              {lang === "en" ? "AI Tools and Automated Processing" : "AI 工具与自动化处理"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-4">
              {lang === "en" ? (
                <p>
                  We utilize advanced AI utilities internally to organize translation flows, optimize layout aesthetics, and index deep editorial concepts. Personal identifier data is strictly excluded from these AI model loops. We do not engage in automated individual decision-making that carries binding legal consequences for users without active human oversight.
                </p>
              ) : (
                <p>
                  我们在内部流程中借助高阶人工智能模型辅助翻译排版、深度研究归纳以及读者问题解答，但该技术流转严格与您的真实身份信息进行物理脱钩。我们不会使用任何人工智能系统在缺乏人类介入的前提下，单方面对读者做出具有法律约束力或产生重大实质性权益影响的自动化决策。
                </p>
              )}
            </div>
          </section>

          {/* Section 18: Contact & Legal CTA */}
          <section id="sec-18" className="scroll-mt-24 pb-12">
            <h2 className="font-serif text-2xl font-normal text-[#1A2F24] mb-6 flex items-center gap-3">
              <span className="font-mono text-sm text-[#8B5A44]">[ 16 ]</span>
              {lang === "en" ? "Contact Us & Important Note" : "联系我们与重要说明"}
            </h2>
            <div className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-6">
              {lang === "en" ? (
                <>
                  <p>
                    We may refine this Privacy Policy occasionally to align with technical modifications or regulatory shifts. We will update the “Last updated” indicator at the head. Continued browsing signifies you accept any updated declarations.
                  </p>
                  <p className="text-xs text-[#1C1C1C]/60 italic">
                    <strong>Important Legal Note:</strong> This Privacy Policy serves general informational purposes. If you operate digital commerce internationally, you should seek professional counsel to ensure precise compliance with GDPR, CCPA, and regional guidelines.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    我们可能会根据网络安全标准的提高或全球隐私法的更新，适时对本政策条例做出修订。当发生条款调整时，我们将更新页面最前方的“最后更新日期”。在变更通告发布后，您的持续访问与阅读即被视为同意最新版细则。
                  </p>
                  <p className="text-xs text-[#1C1C1C]/60 italic">
                    <strong>重要免责说明：</strong> 本隐私公开范本仅作为透明运营披露，并不等同于严苛的专业诉讼法律建议。如果您在跨境电商及智能自动化产品等特定合规领域深度运营，建议您聘请执业律师进行专项审计。
                  </p>
                </>
              )}

              {/* Legal CTA Block - Deep Cypress #1A2F24 Page background with Parchment White #F4F1EB text */}
              <div className="mt-8 bg-[#1A2F24] text-[#F4F1EB] rounded-md p-8 shadow-md border border-[#D8D2C6]/20 relative overflow-hidden" id="legal-cta-block">
                <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/[0.03] pointer-events-none" />
                <span className="font-display text-[9px] font-bold uppercase tracking-[0.25em] text-[#8B5A44] block mb-2">
                  {lang === "en" ? "PRIVACY DESK ASSISTANCE" : "隐私安全专席"}
                </span>
                <h3 className="font-serif text-xl font-normal mb-3 leading-snug">
                  {lang === "en" ? "Have questions about your digital privacy rights?" : "想立即行使您的隐私选择，或有任何安全疑问？"}
                </h3>
                <p className="font-serif text-xs text-[#F4F1EB]/80 leading-relaxed mb-6 max-w-2xl">
                  {lang === "en" 
                    ? "Our personal intelligence media compliance desk will respond directly to your request within two business days. Your trust is our operational foundation."
                    : "我们由 Malttrix｜梦萃 成立的个人智能合规席位将在 2 个工作日内直接予以回应并全力配合处理。您的阅读安全与主权是我们的基石。"}
                </p>
                <a 
                  href="mailto:support@immersation.com"
                  className="inline-flex items-center gap-2.5 bg-[#8B5A44] text-[#F4F1EB] hover:bg-white hover:text-[#1A2F24] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3 rounded-sm transition-all duration-300"
                  id="privacy-mailto-link"
                >
                  <Mail className="w-4 h-4" />
                  {lang === "en" ? "CONTACT PRIVACY DESK" : "致信隐私合规组"}
                </a>
              </div>
            </div>
          </section>

        </main>

      </div>
    </motion.div>
  );
}
