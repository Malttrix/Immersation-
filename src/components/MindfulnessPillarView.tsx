import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { subscribeToSendfox } from "../lib/sendfox";
import { supabase } from "../lib/supabase";
import { defaultArticles, Article } from "../articlesData";
import { 
  ArrowLeft, 
  Activity, 
  Moon, 
  BatteryCharging, 
  Smile, 
  Eye, 
  Compass, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2,
  Lock,
  Download,
  Clock,
  Tag
} from "lucide-react";

interface MindfulnessPillarViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onNavigateToNewsletter?: () => void;
  onNavigateToArticle?: (slug: string) => void;
  onAddToCart?: (item: any) => void;
  articles?: any[];
}

export default function MindfulnessPillarView({ 
  lang, 
  onBackToHome, 
  onPlayChime,
  onNavigateToNewsletter,
  onNavigateToArticle,
  onAddToCart,
  articles
}: MindfulnessPillarViewProps) {
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["body"]);

  // Filter dynamic published articles for body pillar
  const bodyArticles = [...(articles || defaultArticles)]
    .filter((a) => a.pillar === "body" && a.published !== false)
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
      icon: <Moon className="w-5 h-5 text-[#8B5A44]" />,
      title: { en: "Sleep Rhythms", zh: "睡眠修复与调理" },
      desc: { 
        en: "Build better sleep rhythms, optimize lighting, and master your rest cycles to secure premium mental clarity.", 
        zh: "建立更优质的睡眠作息，优化环境光照，管理日常节律，筑牢大脑深度修复的温和底座。" 
      }
    },
    {
      icon: <BatteryCharging className="w-5 h-5 text-[#8B5A44]" />,
      title: { en: "Active Recovery", zh: "恢复与精力重建" },
      desc: { 
        en: "Step away from passive scrolling. Restore attention through active recovery, breathing templates, and quiet deep rest.", 
        zh: "告别被动刷屏的无效休息。运用科学的呼吸法与深度静心练习，高效重建并充盈你的生命精力。" 
      }
    },
    {
      icon: <Smile className="w-5 h-5 text-[#8B5A44]" />,
      title: { en: "Stress Regulation", zh: "压力与情绪平衡" },
      desc: { 
        en: "Support nervous system stability. Maintain calm focus and balanced stress responses through simple daily regulator habits.", 
        zh: "支持神经系统的稳定。通过简单温和的日常调节习惯，平衡压力反应并维持内心的平静与澄澈。" 
      }
    },
    {
      icon: <Eye className="w-5 h-5 text-[#8B5A44]" />,
      title: { en: "Focus Preservation", zh: "专注力防线巩固" },
      desc: { 
        en: "Reduce distraction friction. Protect your attention from overload and design a clean cognitive workspace.", 
        zh: "消解认知层面的注意力磨损。阻断琐碎信息对脑力的超载侵蚀，建立沉静的心智专注环境。" 
      }
    },
    {
      icon: <Compass className="w-5 h-5 text-[#8B5A44]" />,
      title: { en: "Nervous System Balance", zh: "植物神经稳态调控" },
      desc: { 
        en: "Cultivate gentle physical awareness. Harmonize daily breathing routines to prevent subconscious tension and exhaustion.", 
        zh: "培育躯体觉知。通过调和日常生理呼吸反馈环，舒缓肌肉紧绷，从源头防范深层焦虑与枯竭感。" 
      }
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#8B5A44]" />,
      title: { en: "Long-Term Vitality", zh: "长期生命力与长寿" },
      desc: { 
        en: "Nurture mental flexibility. Prevent memory decline and maintain a robust physical foundation across life stages.", 
        zh: "呵护智识的敏捷与流动性。通过持续的心智滋养和健康的生物钟节律，守护长久的蓬勃生命力。" 
      }
    }
  ];

  const guides = [
    {
      title: { en: "The Restorative Sleep Guide", zh: "静心睡眠重建指南" },
      type: "PDF GUIDE & REST LOG",
      price: "$18.00",
      desc: { 
        en: "A clear, natural checklist for building better sleep rhythms, calming your mind, and maximizing deep restorative rest.", 
        zh: "一套简洁而系统的睡眠指引，旨在帮助你平静思绪，优化就寝作息，全面提升深度恢复性睡眠的质量。" 
      }
    },
    {
      title: { en: "The Nervous System Reset Companion", zh: "身心平衡调节指南" },
      type: "AUDIO FRAMEWORK + JOURNAL TEMPLATE",
      price: "$24.00",
      desc: { 
        en: "Three structured audio sessions (5, 12, and 22 minutes) employing dual-sigh breathing and deep calming rest.", 
        zh: "包含 3 个静心音频向导（5 分钟、12 分钟和 22 分钟），通过深呼吸与放松引导，支持你的神经系统稳定性。" 
      }
    }
  ];

  const startPoints = [
    {
      num: "01",
      title: { en: "Establish a Screen-Free Buffer", zh: "确立无屏静心时间" },
      desc: { 
        en: "Gently set aside dynamic blue-light emitting screens 90 minutes before sleep. Allow your mind and body to transition naturally into deep rest.", 
        zh: "在睡前 90 分钟，温和地放下发光的动态屏幕，让你的大脑和身体自然进入平静状态，为深度休息做好铺垫。" 
      }
    },
    {
      num: "02",
      title: { en: "Practice Calm Breathing", zh: "习练深缓呼吸法" },
      desc: { 
        en: "When experiencing sudden stress or overload, take three slow, double-inhalations followed by a long, sighing exhale to soothe your nervous system.", 
        zh: "感到内心急躁或思维紧绷时，进行 3 组慢速的“双吸气接绵长呼气”习练，帮助身体迅速回归安宁状态。" 
      }
    },
    {
      num: "03",
      title: { en: "Map Daily Energy Peaks", zh: "温和管理日常精力" },
      desc: { 
        en: "Stop scheduling difficult analytical work during periods of physical fatigue. Align your most creative execution with natural daily high-energy times.", 
        zh: "避免在身体极度疲惫时强行处理高强度或繁琐的事项。将需要深度专注的工作与你自然的精力高峰期合理对齐。" 
      }
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#F4F1EB] min-h-screen py-24 relative overflow-hidden" 
      id="mindfulness-pillar-view"
    >
      {/* Decorative Blur Spheres representing organic soft visual style */}
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[#E8DDCF]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[15%] left-[-10%] w-[500px] h-[500px] bg-[#8B5A44]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Breadcrumb JSON-LD Structured Data Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://immersation.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Pillars",
                  "item": "https://immersation.com/pillars"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": lang === "en" ? "Mindfulness Health & Longevity" : "正念健康与长寿管理",
                  "item": "https://immersation.com/pillars/mindfulness-health-longevity"
                }
              ]
            })
          }}
        />

        {/* Navigation Breadcrumb */}
        <motion.div variants={itemVariants} className="mb-12" id="mindfulness-breadcrumb">
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
        <div className="border-b border-[#D8D2C6]/50 pb-16 mb-20" id="mindfulness-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4" id="mindfulness-badge">
                <Activity className="w-4 h-4 text-[#8B5A44] animate-pulse" />
                <span className="font-display text-[11px] uppercase font-bold tracking-[0.3em] text-[#8B5A44]">
                  {lang === "en" ? "THE BODY PILLAR OF IMMERSATION" : "身 ｜ IMMERSATION 核心支柱之一"}
                </span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6"
              >
                {lang === "en" ? "Mindfulness Health & Longevity" : "正念健康与长寿管理"}
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-2xl"
              >
                {lang === "en" 
                  ? "Build a stable body and mind through better sleep rhythms, mindful recovery, sustainable energy patterns, and nervous system stability."
                  : "通过良好的睡眠节律、温和的精力恢复、专注力训练与神经系统稳定，为未来的智慧探索构筑一个长久而健康的生理底座。"}
              </motion.p>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <motion.div 
                variants={itemVariants}
                className="w-full max-w-[280px] aspect-square rounded-full border border-[#D8D2C6] bg-white/40 flex items-center justify-center relative group p-6 shadow-sm overflow-hidden"
              >
                {/* Visual Circle Pulse mimicking slow meditative breathing */}
                <div className="absolute inset-4 rounded-full border border-[#8B5A44]/10 animate-ping opacity-35" style={{ animationDuration: "6s" }}></div>
                <div className="absolute inset-8 rounded-full border border-[#1A2F24]/5 animate-pulse opacity-45" style={{ animationDuration: "4s" }}></div>
                
                <div className="text-center relative z-10 flex flex-col items-center">
                  <Activity className="w-8 h-8 text-[#8B5A44] mb-3 stroke-[1.25]" />
                  <span className="font-display text-[10px] font-bold tracking-[0.25em] text-[#1C1C1C]/40 uppercase block mb-1">HARDWARE LAYER</span>
                  <span className="font-serif italic text-xs text-[#1C1C1C]/70">The Biological Engine</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* SECTION 1 & 2: PHILOSOPHY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-[#D8D2C6]/50 mb-20" id="mindfulness-philosophy">
          <div className="lg:col-span-5">
            <motion.span variants={itemVariants} className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
              01 / THE FOUNDATION OF MIND
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-2xl sm:text-3xl text-[#1A2F24] leading-tight"
            >
              {lang === "en" 
                ? "Why the Body is the First Operating System" 
                : "为什么身体是你的第一个“操作系统”？"}
            </motion.h2>
            <div className="w-12 h-[2px] bg-[#8B5A44] mt-4"></div>
          </div>

          <div className="lg:col-span-7 font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed space-y-6">
            <motion.p variants={itemVariants}>
              {lang === "en"
                ? "Your body and mind form an interconnected system. When you are tired, scattered, or burned out, it directly affects your thinking, leading to reactive decisions and over-complicated work habits. True intelligence begins with a calm physical base."
                : "身体与心智形成了一个相互连接的系统。当你感到疲惫、分散或透支时，这会直接影响你的清晰思考，导致急躁的决策和繁琐、脆弱的工作方式。真正的智慧，首先始于安定沉静的生理状态。"}
            </motion.p>
            <motion.p variants={itemVariants}>
              {lang === "en"
                ? "We treat wellness not as an aesthetic pursuit, but as the foundation of sustainable clarity. By building clean rest habits and gentle daily recovery routines, you reduce cognitive friction and support your long-term focus and judgment."
                : "因此，在智枢阁，我们不把健康视作单纯的锻炼，而是将其视作可持续注意力的底层基石。通过建立清澈的休息习惯与温和的主动恢复排程，你能够持续消除认知摩擦，为长期的价值创造沉淀深厚的专注力与判断力。"}
            </motion.p>
          </div>
        </div>

        {/* SECTION 3: KEY TOPICS GRID */}
        <div className="mb-24" id="mindfulness-topics">
          <div className="text-center max-w-xl mx-auto mb-16">
            <motion.span variants={itemVariants} className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              02 / COGNITIVE DOMAINS
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-2xl sm:text-3xl text-[#1A2F24]"
            >
              {lang === "en" ? "Focus & Longevity Key Domains" : "六大正念健康与长寿维度"}
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
                  <div className="w-10 h-10 rounded-full bg-white border border-[#D8D2C6]/60 flex items-center justify-center mb-6 group-hover:border-[#8B5A44] transition-colors">
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

        {/* SECTION 4: FEATURED ARTICLES */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="mindfulness-articles">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
                03 / INTELLECTUAL NOTES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
                {lang === "en" ? "Featured Longevity & Body Pillar Articles" : "精选身体智能与长寿科学论述"}
              </h2>
            </div>
            
            <button 
              onClick={() => onNavigateToArticle ? onNavigateToArticle("") : (onNavigateToNewsletter && onNavigateToNewsletter())}
              className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] hover:text-[#1A2F24] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {lang === "en" ? "View Archive" : "浏览全部期刊档案"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {bodyArticles.map((article) => {
              const artTitle = article.title[lang] || article.title.en;
              const artExcerpt = article.excerpt[lang] || article.excerpt.en;
              const artCategory = article.category ? (article.category[lang] || article.category.en) : "BODY & LONGEVITY";
              const artDate = article.date ? (article.date[lang] || article.date.en) : "";
              const artReadTime = article.readTime ? (article.readTime[lang] || article.readTime.en) : "";

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

        {/* SECTION 5: RELATED DIGITAL GUIDES */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="mindfulness-guides">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
              04 / DIGITAL PUBLISHING
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24]">
              {lang === "en" ? "System Toolkits & Practical Frameworks" : "身体智能与长寿微型工具箱"}
            </h2>
            <p className="font-serif text-xs text-[#1C1C1C]/60 mt-2">
              {lang === "en" 
                ? "Structured educational assets designed to align your physiology." 
                : "严密且可立即执行的标准说明书，助力你实现硬件重构"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {guides.map((guide, idx) => (
              <div 
                key={idx}
                className="border border-[#D8D2C6] rounded-sm bg-[#E8DDCF]/35 p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#1A2F24] transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[9px] text-[#8B5A44] tracking-widest uppercase">{guide.type}</span>
                    <span className="font-display text-sm font-bold text-[#1A2F24] bg-white px-2.5 py-1 rounded-sm border border-[#D8D2C6]/60">{guide.price}</span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-[#1A2F24] mb-3">
                    {guide.title[lang]}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed mb-6">
                    {guide.desc[lang]}
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
                          id: `guide-mindfulness-${idx + 1}`,
                          title: guide.title[lang] || guide.title.en,
                          type: guide.type,
                          price: parseFloat(guide.price.replace("$", "")) || 18.00,
                          cover: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80"
                        });
                      } else {
                        alert(lang === "en" 
                          ? "Added to digital library cart." 
                          : "已添加到数字图书馆购物车。");
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

        {/* SECTION 6: RECOMMENDED STARTING POINT */}
        <div className="mb-24 border-t border-[#D8D2C6]/50 pt-16" id="mindfulness-starting-point">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-2">
                05 / SYSTEM ONBOARDING
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A2F24] mb-4">
                {lang === "en" ? "Where to Begin" : "第一阶段实操指南"}
              </h2>
              <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60 leading-relaxed">
                {lang === "en" 
                  ? "We recommend executing these three foundational somatic protocols immediately to align your biology." 
                  : "如果你渴望打破当下的焦灼疲惫态，智枢阁推荐你即刻开启以下三项生理重塑底子："}
              </p>
            </div>

            <div className="lg:col-span-8 space-y-8">
              {startPoints.map((item, index) => (
                <div key={index} className="flex gap-6 items-start border-b border-[#D8D2C6]/30 pb-6 last:border-b-0">
                  <span className="font-display text-2xl font-bold text-[#8B5A44] leading-none">{item.num}</span>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#1A2F24] mb-2">{item.title[lang]}</h3>
                    <p className="font-sans text-xs sm:text-sm text-[#1C1C1C]/75 leading-relaxed">{item.desc[lang]}</p>
                  </div>
                </div>
              ))}
            </div>
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
                {lang === "en" ? "STAY CLEAR" : "保持澄澈"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mb-3">
                {lang === "en" ? "Receive Clearer Body Signals" : "接收身体长寿与专注的信标"}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-white/70 leading-relaxed">
                {lang === "en"
                  ? "Join the Immersation newsletter to receive quiet, deeply researched articles on sleep hardware optimization, parasympathetic hacks, and neuroplasticity preservation."
                  : "订阅智枢阁信标邮件。我们将定期为你输送关于深慢波睡眠锁频、副交感神经一键重置、脑神经突触保鲜的冷静洞察。不造谣、不贩卖焦虑。"}
              </p>
            </div>

            <div className="w-full lg:w-auto relative z-10 flex flex-col sm:flex-row items-center gap-3">
              {isSubscribed ? (
                <div className="bg-white/10 border border-[#B69A6B] text-[#F4F1EB] px-6 py-4 rounded-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#B69A6B]" />
                  <span className="font-serif text-xs">
                    {lang === "en" ? "Somatic Beacon connection established successfully." : "身体系统澄澈信标订阅成功。"}
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
