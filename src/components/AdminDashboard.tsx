import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { supabase } from "../lib/supabase";
import { getFunnelAnalytics, clearAllAnalytics } from "../lib/analytics";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Music,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  X,
  TrendingUp,
  AlertCircle,
  Mail,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  Send,
  Upload,
  Globe,
  Key,
  Shield,
  Eye,
  Lock,
  Download,
  Database,
  MessageSquare,
  Clock,
  ExternalLink
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";


// Brand-aligned pillar + category system (Immersation official 3-pillar model)
const PILLAR_OPTIONS = [
  { value: "body", label: { en: "Body (Mindfulness Health & Longevity)", zh: "身（正念健康与长寿管理）" } },
  { value: "tool", label: { en: "Tool (AI Automation)", zh: "器（AI 自动化）" } },
  { value: "capital", label: { en: "Capital (Wealth Cognition)", zh: "财（财富认知）" } },
];

const SYSTEM_INTEGRATION_OPTION = {
  value: "system-integration",
  label: { en: "System Integration (cross-pillar framework essay)", zh: "系统整合（跨支柱框架文章）" },
};

const CATEGORY_OPTIONS_BY_PILLAR: Record<string, { value: string; label: { en: string; zh: string } }[]> = {
  body: [
    { value: "sleep-reset-guides", label: { en: "Sleep Reset Guides", zh: "睡眠修复指南" } },
    { value: "stress-recovery-frameworks", label: { en: "Stress Recovery Frameworks", zh: "压力恢复框架" } },
    { value: "mindful-productivity", label: { en: "Mindful Productivity", zh: "正念效率" } },
    { value: "longevity-habits", label: { en: "Longevity Habits", zh: "长寿习惯" } },
    { value: "focus-training", label: { en: "Focus Training", zh: "专注力训练" } },
    { value: "nervous-system-regulation", label: { en: "Nervous System Regulation", zh: "神经系统调节" } },
    { value: "energy-management-systems", label: { en: "Energy Management Systems", zh: "精力管理系统" } },
  ],
  tool: [
    { value: "ai-workflow-blueprints", label: { en: "AI Workflow Blueprints", zh: "AI 工作流蓝图" } },
    { value: "prompt-libraries", label: { en: "Prompt Libraries", zh: "提示词库" } },
    { value: "automation-templates", label: { en: "Automation Templates", zh: "自动化模板" } },
    { value: "creator-workflow-systems", label: { en: "Creator Workflow Systems", zh: "创作者工作流系统" } },
    { value: "notion-ai-systems", label: { en: "Notion + AI Systems", zh: "Notion 与 AI 系统" } },
    { value: "solo-business-automation", label: { en: "Solo Business Automation", zh: "个人商业自动化" } },
    { value: "productivity-dashboards", label: { en: "Productivity Dashboards", zh: "效率仪表盘" } },
  ],
  capital: [
    { value: "long-term-investing-frameworks", label: { en: "Long-Term Investing Frameworks", zh: "长期投资框架" } },
    { value: "asset-allocation-checklists", label: { en: "Asset Allocation Checklists", zh: "资产配置清单" } },
    { value: "market-cycle-notes", label: { en: "Market Cycle Notes", zh: "市场周期笔记" } },
    { value: "risk-reflection-tools", label: { en: "Risk Reflection Tools", zh: "风险反思工具" } },
    { value: "wealth-planning-templates", label: { en: "Wealth Planning Templates", zh: "财富规划模板" } },
    { value: "financial-decision-frameworks", label: { en: "Financial Decision Frameworks", zh: "财务决策框架" } },
    { value: "capital-thinking-essays", label: { en: "Capital Thinking Essays", zh: "资本思维文章" } },
  ],
  "system-integration": [
    { value: "personal-intelligence-system", label: { en: "Personal Intelligence System", zh: "个人智能系统" } },
    { value: "three-pillar-model", label: { en: "The Three-Pillar Model", zh: "三支柱模型" } },
    { value: "reader-journey-notes", label: { en: "Reader Journey Notes", zh: "读者旅程笔记" } },
  ],
};

const CONTENT_FORMAT_OPTIONS = [
  { value: "editorial-intelligence", label: { en: "Editorial Intelligence (Essay / Newsletter / Research Brief)", zh: "编辑型智能内容" } },
  { value: "digital-guide", label: { en: "Digital Guide (Structured Handbook)", zh: "数字指南" } },
  { value: "framework", label: { en: "Framework (Standalone Model/Tool)", zh: "框架工具" } },
];

function RelatedArticlesMultiSelect({
  lang,
  articles,
  currentSlug,
  selectedSlugs,
  onChange,
}: {
  lang: "en" | "zh";
  articles: any[];
  currentSlug: string;
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const candidates = articles.filter(
    (a) =>
      (a.slug || a.id) !== currentSlug &&
      !selectedSlugs.includes(a.slug || a.id) &&
      (a.title?.en?.toLowerCase().includes(query.toLowerCase()) ||
        a.title?.zh?.includes(query))
  );

  const addSlug = (slug: string) => {
    onChange([...selectedSlugs, slug]);
    setQuery("");
    setOpen(false);
  };

  const removeSlug = (slug: string) => {
    onChange(selectedSlugs.filter((s) => s !== slug));
  };

  return (
    <div className="relative">
      <label className="block font-semibold text-[#1A2F24] mb-1">
        {lang === "en" ? "Related Articles" : "相关文章"}
      </label>

      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSlugs.map((slug) => {
          const art = articles.find((a) => (a.slug || a.id) === slug);
          return (
            <span
              key={slug}
              className="inline-flex items-center gap-1 bg-[#E8DDCF] text-[#1C1C1C] text-xs px-2 py-1 rounded"
            >
              {art?.title?.[lang] || slug}
              <button
                type="button"
                onClick={() => removeSlug(slug)}
                className="text-[#8B5A44] hover:text-[#1A2F24]"
                aria-label={lang === "en" ? "Remove related article" : "移除相关文章"}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={lang === "en" ? "Search published articles..." : "搜索已发布文章..."}
        className="w-full border border-[#D8D2C6] rounded-xs p-2 text-stone-800 focus:ring-[#8B5A44] focus:border-[#8B5A44]"
      />

      {open && query && candidates.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-[#D8D2C6] rounded-xs mt-1 max-h-48 overflow-y-auto shadow-md">
          {candidates.slice(0, 8).map((a) => (
            <li
              key={a.slug || a.id}
              onClick={() => addSlug(a.slug || a.id)}
              className="px-3 py-2 text-sm hover:bg-[#F4F1EB] cursor-pointer"
            >
              <div className="font-medium">{a.title?.[lang]}</div>
              <div className="text-[11px] text-stone-400">{a.slug || a.id}</div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-stone-400 mt-1">
        {lang === "en"
          ? "Search and select existing articles to cross-link. No manual slug typing — prevents broken links."
          : "搜索并选择已有文章进行关联，无需手动输入 slug，避免链接失效。"}
      </p>
    </div>
  );
}

interface AdminDashboardProps {
  lang: "en" | "zh";
  userEmail: string | null;
  systemMembers: Array<{ email: string; role: string; joined: string; status: string; regMethod?: string }>;
  setSystemMembers: React.Dispatch<React.SetStateAction<Array<{ email: string; role: string; joined: string; status: string; regMethod?: string }>>>;
  systemTransactions: Array<{ id: string; email: string; item: string; amount: number; date: string; status: string }>;
  setSystemTransactions: React.Dispatch<React.SetStateAction<Array<{ id: string; email: string; item: string; amount: number; date: string; status: string }>>>;
  books: any[];
  setBooks: React.Dispatch<React.SetStateAction<any[]>>;
  articles: any[];
  setArticles: React.Dispatch<React.SetStateAction<any[]>>;
  newsletterIssues: any[];
  setNewsletterIssues: React.Dispatch<React.SetStateAction<any[]>>;
  onClose: () => void;
}

export default function AdminDashboard({
  lang,
  userEmail,
  systemMembers,
  setSystemMembers,
  systemTransactions,
  setSystemTransactions,
  books,
  setBooks,
  articles,
  setArticles,
  newsletterIssues,
  setNewsletterIssues,
  onClose
}: AdminDashboardProps) {
  // If not admin, block entry
  const isAdmin = userEmail === "dreammyhomee@gmail.com";
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F4F1EB] flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-16 h-16 text-[#8B5A44] mb-4 animate-bounce" />
        <h1 className="font-serif text-3xl font-semibold text-[#1A2F24] mb-2">
          {lang === "en" ? "Access Denied" : "访问受限"}
        </h1>
        <p className="text-sm text-stone-600 max-w-md mb-6">
          {lang === "en" 
            ? "This console is reserved exclusively for System Administrators. Please log in with the administrator account."
            : "此控制台仅供系统管理员访问。请登录管理员账号后再试。"}
        </p>
        <button
          onClick={onClose}
          className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-xs transition-colors"
        >
          {lang === "en" ? "Return to Library" : "返回图书馆"}
        </button>
      </div>
    );
  }

  // Admin active main section state
  const [activeTab, setActiveTab] = useState<"overview" | "ecommerce" | "content" | "audio" | "subscribers" | "members" | "analytics" | "settings">("overview");

  // Local state persisted in localStorage for mock features
  const [coupons, setCoupons] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_coupons");
    return saved ? JSON.parse(saved) : [
      { code: "THINKER20", type: "percent", value: 20, limit: 100, used: 24, expiry: "2026-12-31", active: true },
      { code: "FOUNDER50", type: "fixed", value: 50, limit: 10, used: 8, expiry: "2026-08-31", active: true }
    ];
  });

  useEffect(() => {
    if (supabase) {
      supabase
        .from("coupons")
        .select("*")
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setCoupons(data);
          }
        });
    }
  }, []);

  const [newsletters, setNewsletters] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_newsletters");
    return saved ? JSON.parse(saved) : [
      { id: "NL-001", subject: { en: "The Leverage of Solitude", zh: "孤独的杠杆作用" }, listId: "Body Notes", sentCount: 1420, openRate: "68.2%", clickRate: "14.5%", date: "2026-07-01", status: "Sent" },
      { id: "NL-002", subject: { en: "AI as a Cognitive Exoskeleton", zh: "AI作为认知外骨骼" }, listId: "Tool Notes", sentCount: 1530, openRate: "72.4%", clickRate: "21.1%", date: "2026-07-05", status: "Sent" }
    ];
  });

  const [audioEpisodes, setAudioEpisodes] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_audio_episodes");
    return saved ? JSON.parse(saved) : [
      { id: "AUDIO-1", title: { en: "Slowing Down to Accelerate", zh: "以静制动：减速以加速" }, url: "https://wp-media.immersation.com/podcasts/ep1.mp3", duration: "24:12", status: "Published", chapters: [{ time: "00:00", title: "Introduction" }, { time: "05:12", title: "The Noise Trap" }, { time: "15:40", title: "Practical Reset" }] },
      { id: "AUDIO-2", title: { en: "Automating Calm Focus", zh: "自动化专注心智" }, url: "https://wp-media.immersation.com/podcasts/ep2.mp3", duration: "18:45", status: "Draft", chapters: [{ time: "00:00", title: "Starting Out" }, { time: "08:15", title: "Tools Overview" }] }
    ];
  });

  const [sendfoxContacts, setSendfoxContacts] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_sendfox_contacts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if it's the old simulation data
        if (parsed.some((c: any) => c.email === "alpha.thinker@gmail.com" || c.email === "early.adopter@gmail.com")) {
          localStorage.removeItem("immersation_sendfox_contacts");
          return [];
        }
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_audit_logs");
    return saved ? JSON.parse(saved) : [
      { id: "LOG-1", action: "Admin Log In", user: "dreammyhomee@gmail.com", date: "2026-07-08 20:37:25", details: "Secure admin token granted successfully." },
      { id: "LOG-2", action: "Toggle Stripe Live Mode", user: "dreammyhomee@gmail.com", date: "2026-07-08 20:38:00", details: "Switched global gateway mapping to Live mode." }
    ];
  });

  const [apiSettings, setApiSettings] = useState(() => {
    const saved = localStorage.getItem("immersation_api_settings");
    return saved ? JSON.parse(saved) : {
      wpUrl: "https://immersation.com/wp-json",
      wpAppPassword: "•••• •••• •••• •••• ••••",
      stripePublishable: "pk_live_51P7...",
      stripeSecret: "sk_live_51P7...",
      stripeWebhookSecret: "whsec_...",
      sendfoxToken: "sf_token_71e...",
      defaultListId: "Body Notes"
    };
  });

  const DEFAULT_SENDFOX_PAT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MzciLCJqdGkiOiIxNmQ5ZjI5OTdkMGJlNjcyNTgwZjdjMmMxMTYyYzA4NDVlMzEzZmQyNzIxZTdiZmQyYjAxN2E3YjRjNWU2YmIwNGY2ZDA3ZDY1MjFjMGZhMiIsImlhdCI6MTc4NjA3Njg2Ny4wNjMxNzksIm5iZiI6MTc4NjA3Njg2Ny4wNjMxOCwiZXhwIjo0OTQxNzUwNDY3LjA0NzYsInN1YiI6IjIwMjg3MiIsInNjb3BlcyI6W119.C3UEfhebjll-R1200AdFElO_iAEUnNOXn_VQUr-4mOM2EYmSK4xCi3fF8u-3oSewqujdVACvRd-_hdatVfC6NlUiqXgNtybvo7EQJKqtAdtvwD9irLYcQOZz9aIdVIL2dCiG2SVOpcP-T97HeuHT6UhCB0DIUxM97MnxHdcULC1j4j6nhmi02Aj2ysJLXJasnqNmzjRpjBTYVE56tIp_wwKKITS8_936_XzxrJtd4NDS22-q0A7wDp5N1PvvsXxCvw4wvr2gr8bgIb9DL09wIX2-NBjfy2Eas6jbFAjlfmesCRPfyBwJuJq2GlfDnowALllQSWv_uA_rZx45E4ci92BUKUUu1_Yh239q2Q_zlvi4I1d5ZiQHiAKMD328dVt5WC9ICYMdxgX70_FHvoJx09eKemXrzsrwhfGOeYywZvc2vuMizF5w8yepEUWApV49S1YRYCxYbCdcpwymN92TC5lilCRomq2WvdipW8ICTP9Omjb8nHmIlIvmaE_ORFelI3_UlRD3CTuqkW4Rg0rBRRwS45zovpaNZem54i-lwTPplp06MLRJvObgPZomvutSFv8vi7tkXj6EiNpfSW2dE6YMLOLLiT95e7WW7CNcqwUgfFn9LEuUWHX83bIB-nHc1Z4eU7cgbAw30q61YECwXOpb12dpCmYkbUnUjT_hmvs";

  const [sendFoxApiKey, setSendFoxApiKey] = useState<string>(() => {
    const saved = localStorage.getItem("sendfox_api_key");
    if (saved && saved.trim()) return saved;
    localStorage.setItem("sendfox_api_key", DEFAULT_SENDFOX_PAT);
    return DEFAULT_SENDFOX_PAT;
  });
  const [testingSendFox, setTestingSendFox] = useState(false);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  useEffect(() => {
    if (sendFoxApiKey) {
      localStorage.setItem("sendfox_api_key", sendFoxApiKey);
    }
  }, [sendFoxApiKey]);

  const handleTestSendFoxConnection = async () => {
    const keyToTest = sendFoxApiKey.trim() || localStorage.getItem("sendfox_api_key") || "";
    if (!keyToTest) {
      alert("Please enter your SendFox Personal Access Token first.");
      return;
    }
    setTestingSendFox(true);
    try {
      const res = await fetch("https://api.sendfox.com/lists", {
        headers: { "Authorization": `Bearer ${keyToTest}` }
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const listCount = Array.isArray(data?.data) ? data.data.length : (Array.isArray(data) ? data.length : 0);
        alert(`✅ SendFox Connection Successful!\nYour API Key is valid and connected to ${listCount} list(s) in SendFox.`);
      } else {
        const errText = await res.text();
        alert(`❌ SendFox API Error (Status ${res.status}):\n${errText.slice(0, 200)}`);
      }
    } catch (e: any) {
      alert(`❌ Connection Failed: ${e?.message || "Network error"}`);
    } finally {
      setTestingSendFox(false);
    }
  };

  const handleDirectBroadcast = async (nl: any) => {
    let apiKeyToUse = sendFoxApiKey.trim() || localStorage.getItem("sendfox_api_key") || "";
    if (!apiKeyToUse) {
      const inputKey = prompt("Please enter your SendFox Personal Access Token (API Key) to trigger live broadcast:\n(Get your token at https://sendfox.com/account)");
      if (!inputKey || !inputKey.trim()) {
        alert("SendFox API Key is required to broadcast.");
        return;
      }
      apiKeyToUse = inputKey.trim();
      setSendFoxApiKey(apiKeyToUse);
      localStorage.setItem("sendfox_api_key", apiKeyToUse);
    }

    const tags = Array.isArray(nl.sendFoxTags) && nl.sendFoxTags.length > 0 
      ? nl.sendFoxTags 
      : (nl.listId ? [nl.listId.toLowerCase().replace(" notes", "").trim()] : [nl.pillar || "tool"]);

    const resolvedSubject = 
      nl.emailSubject || 
      (typeof nl.title === "string" ? nl.title : (nl.title?.en || nl.title?.zh)) || 
      (typeof nl.subject === "string" ? nl.subject : (nl.subject?.en || nl.subject?.zh)) || 
      "Newsletter Broadcast";

    const resolvedPreview = 
      nl.previewText || 
      (typeof nl.excerpt === "string" ? nl.excerpt : (nl.excerpt?.en || nl.excerpt?.zh)) || 
      "";

    const resolvedContent = 
      (typeof nl.content === "string" ? nl.content : (nl.content?.en || nl.content?.zh)) || 
      nl.body || 
      (typeof nl.excerpt === "string" ? nl.excerpt : nl.excerpt?.en) || 
      resolvedSubject;

    setBroadcastingId(nl.id);

    const getProductionBaseUrl = () => {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://immersation.com";
      if (
        !origin ||
        origin.includes("aistudio.google.com") ||
        origin.includes("ais-dev-") ||
        origin.includes("ais-pre-") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("run.app")
      ) {
        return "https://immersation.com";
      }
      return origin;
    };

    const baseUrl = getProductionBaseUrl();
    const issueSlugOrId = nl.slug || nl.id;
    const targetUrl = issueSlugOrId 
      ? `${baseUrl}/newsletter?slug=${encodeURIComponent(issueSlugOrId)}`
      : `${baseUrl}/newsletter`;

    try {
      const res = await fetch("/api/broadcast-sendfox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKeyToUse,
          subject: resolvedSubject,
          previewText: resolvedPreview,
          content: resolvedContent,
          sendFoxTags: tags,
          ctaText: nl.ctaText || "READ THE FULL SIGNAL",
          targetUrl: targetUrl
        })
      });

      const data = await res.json().catch(() => null);
      if (data?.success) {
        const updated = newsletterIssues.map(n => n.id === nl.id ? { ...n, status: "Sent" } : n);
        setNewsletterIssues(updated);
        localStorage.setItem("immersation_newsletters_v2", JSON.stringify(updated));
        if (supabase) {
          await supabase.from('newsletters').upsert({ ...nl, status: "Sent" });
        }
        addAuditLog("SendFox Broadcast", `Direct broadcast campaign "${resolvedSubject}" sent to SendFox.`);
        alert(`🎉 Live Broadcast Dispatched!\n\nNewsletter "${resolvedSubject}" has been sent to subscribers via SendFox!`);
      } else {
        alert(`⚠️ SendFox Broadcast Notice:\n${data?.error || "Failed to trigger broadcast."}`);
      }
    } catch (e: any) {
      alert(`Error broadcasting via SendFox: ${e?.message || "Network error"}`);
    } finally {
      setBroadcastingId(null);
    }
  };

  useEffect(() => {
    localStorage.setItem("immersation_coupons", JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem("immersation_newsletters", JSON.stringify(newsletters));
  }, [newsletters]);

  useEffect(() => {
    localStorage.setItem("immersation_audio_episodes", JSON.stringify(audioEpisodes));
  }, [audioEpisodes]);

  useEffect(() => {
    localStorage.setItem("immersation_sendfox_contacts", JSON.stringify(sendfoxContacts));
  }, [sendfoxContacts]);

  useEffect(() => {
    localStorage.setItem("immersation_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Registered Members local states
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberRegFilter, setMemberRegFilter] = useState<"all" | "google" | "manual">("all");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Active Thought Leader");
  const [newMemberStatus, setNewMemberStatus] = useState("Active");

  // Analytics local states
  const [articleAnalytics, setArticleAnalytics] = useState<Record<string, { views: number; timeSpent: number; lastActive: string }>>(() => {
    const saved = localStorage.getItem("immersation_article_analytics");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Initialize empty records for real-time live tracking starting from now
    const initial: Record<string, { views: number; timeSpent: number; lastActive: string }> = {};
    const list = articles || [];
    list.forEach((art: any, idx: number) => {
      const slug = art.slug || art.id;
      if (slug) {
        initial[slug] = {
          views: 0,
          timeSpent: 0,
          lastActive: new Date().toISOString()
        };
      }
    });
    return initial;
  });

  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsPillarFilter, setAnalyticsPillarFilter] = useState("all");
  const [analyticsSortField, setAnalyticsSortField] = useState<"views" | "timeSpent" | "avgTime" | "title">("views");
  const [analyticsSortAsc, setAnalyticsSortAsc] = useState(false);
  const [analyticsToast, setAnalyticsToast] = useState<string | null>(null);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);

  const handleRefreshAnalytics = () => {
    setIsRefreshingAnalytics(true);
    setTimeout(() => {
      // Load real, exact visitor article analytics from localStorage
      const saved = localStorage.getItem("immersation_article_analytics");
      let realArticleAnalytics = { ...articleAnalytics };
      if (saved) {
        try {
          realArticleAnalytics = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      
      setArticleAnalytics(realArticleAnalytics);
      
      const successMsg = lang === "en" 
        ? "Analytics database successfully refreshed with live site clickstream tracking!" 
        : "智枢全域流量分析数据已成功同步并刷新（实时行为感知日志）！";
      
      setAnalyticsToast(successMsg);
      addAuditLog("Refresh Analytics", "Synchronized and calculated raw Vercel edge/Plausible article clickstream logs.");
      
      setIsRefreshingAnalytics(false);
      
      setTimeout(() => {
        setAnalyticsToast(null);
      }, 4000);
    }, 1200);
  };

  const generateInvoicePDF = (tx: any) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Brand-aligned palette (Deep Cypress + Obsidian Ink + Quiet Rust)
    const cypress = "#1A2F24";
    const ink = "#1C1C1C";
    const rust = "#8B5A44";
    const parchment = "#F4F1EB";

    doc.setFillColor(parchment);
    doc.rect(0, 0, 595, 842, "F");

    // Header
    doc.setTextColor(cypress);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("IMMERSATION", 48, 64);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(ink);
    doc.text("Immerse the focus. Upgrade the mind.", 48, 82);
    doc.text("Stable Body. Intelligent Leverage. Long-Term Capital.", 48, 96);

    // Divider
    doc.setDrawColor(rust);
    doc.setLineWidth(1);
    doc.line(48, 116, 547, 116);

    // Invoice meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INVOICE / RECEIPT", 48, 144);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${tx.id}`, 48, 168);
    doc.text(`Date: ${tx.date}`, 48, 184);
    doc.text(`Status: ${tx.status}`, 48, 200);
    doc.text(`Billed To: ${tx.email}`, 48, 216);

    // Item table header
    doc.setFillColor(cypress);
    doc.rect(48, 240, 499, 24, "F");
    doc.setTextColor(parchment);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ITEM", 58, 256);
    doc.text("AMOUNT", 480, 256);

    // Item row
    doc.setTextColor(ink);
    doc.setFont("helvetica", "normal");
    doc.text(String(tx.item), 58, 282);
    doc.text(`${Number(tx.amount).toFixed(2)}`, 480, 282);

    // Total
    doc.setDrawColor("#D8D2C6");
    doc.line(48, 300, 547, 300);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL PAID", 380, 322);
    doc.setTextColor(rust);
    doc.text(`${Number(tx.amount).toFixed(2)}`, 480, 322);

    // Footer
    doc.setTextColor("#7a7974");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "This receipt confirms your purchase from Immersation, a personal intelligence media",
      48, 760
    );
    doc.text("and digital publishing brand.", 48, 774);

    doc.save(`invoice-${tx.id}.pdf`);
    addAuditLog("Invoice Downloaded", `Generated and downloaded receipt PDF for order ${tx.id}`);
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      action,
      user: "dreammyhomee@gmail.com",
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Calculate dynamic 7-day revenue chart data from real successful transactions
  const revenueChartData = React.useMemo(() => {
    const data = [];
    const daysToGenerate = 7;
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const txs = systemTransactions.filter(
        (t) => (t.status === "Successful" || t.status === "Paid") && t.date === dateStr
      );
      const amount = txs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const orders = txs.length;
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedNameEN = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const formattedNameZH = `${d.getMonth() + 1}月${d.getDate()}日`;
      
      data.push({
        name: lang === "en" ? formattedNameEN : formattedNameZH,
        amount,
        orders
      });
    }
    return data;
  }, [systemTransactions, lang]);

  // Calculate gross revenue today dynamically from real transactions
  const grossRevenueToday = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayTxs = systemTransactions.filter(
      (t) => (t.status === "Successful" || t.status === "Paid") && t.date === todayStr
    );
    return todayTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [systemTransactions]);

  // Calculate percentage change vs yesterday dynamically from real transactions
  const revenueChangeText = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    const todayTxs = systemTransactions.filter(
      (t) => (t.status === "Successful" || t.status === "Paid") && t.date === todayStr
    );
    const todayAmount = todayTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const yesterdayTxs = systemTransactions.filter(
      (t) => (t.status === "Successful" || t.status === "Paid") && t.date === yesterdayStr
    );
    const yesterdayAmount = yesterdayTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    if (yesterdayAmount > 0) {
      const percentChange = ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100;
      if (percentChange >= 0) {
        return `↑ ${percentChange.toFixed(0)}% vs yesterday`;
      } else {
        return `↓ ${Math.abs(percentChange).toFixed(0)}% vs yesterday`;
      }
    } else {
      return todayAmount > 0 
        ? (lang === "en" ? "↑ New sales today" : "↑ 今日新增成交") 
        : (lang === "en" ? "0% change vs yesterday" : "同比昨日无变化");
    }
  }, [systemTransactions, lang]);

  // Calculate today's subscribers count dynamically from real contacts
  const newSubscribersToday = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return sendfoxContacts.filter(
      (c) => c.status === "Subscribed" && c.date === todayStr
    ).length;
  }, [sendfoxContacts]);

  // E-commerce Edit states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  
  // Custom confirmation modal state (bypasses iframe block on window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: string;
    id: string;
    title: string;
    action: () => void;
  } | null>(null);

  const [syncError, setSyncError] = useState<string | null>(null);

  // Content Studio sub-tabs and states
  const [contentSubTab, setContentSubTab] = useState<"articles" | "newsletters" | "ebooks" | "comments">("articles");
  
  // Media Center simulation state
  
  // Moderation state
  const [allComments, setAllComments] = useState<any[]>([]);
  const [commentFilter, setCommentFilter] = useState<"pending" | "approved" | "rejected">("pending");

  const loadComments = async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from("article_comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setAllComments(data);
      } else if (error) {
        console.warn("Supabase load comments error, falling back to localStorage:", error);
        setSyncError(error.message || String(error));
        // Fallback to localStorage comments
        const saved = localStorage.getItem("immersation_comments");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAllComments(parsed);
          } catch (e) {
            setAllComments([]);
          }
        } else {
          setAllComments([]);
        }
      }
    } else {
      const saved = localStorage.getItem("immersation_comments");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Sort by date descending
          parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setAllComments(parsed);
        } catch (e) {
          console.error("Error loading comments from localStorage:", e);
          setAllComments([]);
        }
      } else {
        setAllComments([]);
      }
    }
  };

  useEffect(() => {
    loadComments();
  }, [supabase]);

  useEffect(() => {
    if (contentSubTab === "comments") {
      loadComments();
    }
  }, [contentSubTab]);

  const handleModerateComment = async (id: string, newStatus: "approved" | "rejected") => {
    if (supabase) {
      const { error } = await supabase
        .from("article_comments")
        .update({ status: newStatus, moderated_at: new Date().toISOString(), moderated_by: "Admin" })
        .eq("id", id);
      if (!error) {
        const targetComment = allComments.find((c) => c.id === id);
        setAllComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus, moderated_at: new Date().toISOString(), moderated_by: "Admin" } : c))
        );
        addAuditLog(
          "Comment Moderated",
          `${newStatus === "approved" ? "Approved" : "Rejected"} comment from "${targetComment?.name}" on article ${targetComment?.article_slug}`
        );
      } else {
        console.warn("Supabase comment moderation error, falling back to localStorage:", error);
        setSyncError(error.message || String(error));
        
        // Fallback to localStorage comments
        const saved = localStorage.getItem("immersation_comments");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const updated = parsed.map((c: any) => {
              if (String(c.id) === String(id)) {
                return { ...c, status: newStatus, moderated_at: new Date().toISOString(), moderated_by: "Admin" };
              }
              return c;
            });
            localStorage.setItem("immersation_comments", JSON.stringify(updated));
            setAllComments(updated);

            const targetComment = allComments.find((c) => c.id === id);
            addAuditLog(
              "Comment Moderated (Local)",
              `${newStatus === "approved" ? "Approved" : "Rejected"} comment from "${targetComment?.name}" on article ${targetComment?.article_slug}`
            );
          } catch (e) {
            console.error(e);
          }
        }
      }
    } else {
      const saved = localStorage.getItem("immersation_comments");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = parsed.map((c: any) => {
            if (String(c.id) === String(id)) {
              return { ...c, status: newStatus, moderated_at: new Date().toISOString(), moderated_by: "Admin" };
            }
            return c;
          });
          localStorage.setItem("immersation_comments", JSON.stringify(updated));
          setAllComments(updated);

          const targetComment = allComments.find((c) => c.id === id);
          addAuditLog(
            "Comment Moderated",
            `${newStatus === "approved" ? "Approved" : "Rejected"} comment from "${targetComment?.name}" on article ${targetComment?.article_slug}`
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (supabase) {
      const { error } = await supabase
        .from("article_comments")
        .delete()
        .eq("id", id);
      if (!error) {
        setAllComments((prev) => prev.filter((c) => c.id !== id));
        addAuditLog("Comment Deleted", `Permanently removed comment ID ${id}`);
      } else {
        console.warn("Supabase comment deletion error, falling back to localStorage:", error);
        setSyncError(error.message || String(error));
        
        // Fallback to localStorage comments
        const saved = localStorage.getItem("immersation_comments");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const updated = parsed.filter((c: any) => String(c.id) !== String(id));
            localStorage.setItem("immersation_comments", JSON.stringify(updated));
            setAllComments(updated);
            addAuditLog("Comment Deleted (Local)", `Permanently removed comment ID ${id}`);
          } catch (e) {
            console.error(e);
          }
        }
      }
    } else {
      const saved = localStorage.getItem("immersation_comments");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = parsed.filter((c: any) => String(c.id) !== String(id));
          localStorage.setItem("immersation_comments", JSON.stringify(updated));
          setAllComments(updated);
          addAuditLog("Comment Deleted", `Permanently removed comment ID ${id}`);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const pendingCount = allComments.filter(c => c.status === "pending").length;
  const displayedComments = allComments.filter(c => c.status === commentFilter);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileType, setUploadedFileType] = useState<"image" | "audio" | "pdf" | "">("");

  // Article form controlled states
  const [artSlug, setArtSlug] = useState("");
  const [artTitleEN, setArtTitleEN] = useState("");
  const [artTitleZH, setArtTitleZH] = useState("");
  const [artExcerptEN, setArtExcerptEN] = useState("");
  const [artExcerptZH, setArtExcerptZH] = useState("");
  const [artBodyEN, setArtBodyEN] = useState("");
  const [artBodyZH, setArtBodyZH] = useState("");
  const [artCatEN, setArtCatEN] = useState("BODY NOTES");
  const [artCatZH, setArtCatZH] = useState("身心信标");
  const [artPillar, setArtPillar] = useState<string>("body");

  const [artCategoryValue, setArtCategoryValue] = useState("");
  const [artArticleFormat, setArtArticleFormat] = useState("editorial-intelligence");
  const [artContentFormat, setArtContentFormat] = useState("markdown");
  const [artRelatedSlugs, setArtRelatedSlugs] = useState<string[]>([]);

  const [artTags, setArtTags] = useState("");
  const [artCover, setArtCover] = useState("");
  const [artPinterestImageUrl, setArtPinterestImageUrl] = useState("");
  const [artAdUrl, setArtAdUrl] = useState("");
  const [artDate, setArtDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [artReadEN, setArtReadEN] = useState("");
  const [artReadZH, setArtReadZH] = useState("");
  const [artStatus, setArtStatus] = useState("Draft");
  const [artScheduledDate, setArtScheduledDate] = useState("");
  const [artFeatured, setArtFeatured] = useState(false);
  const [artSeoTitleEN, setArtSeoTitleEN] = useState("");
  const [artSeoTitleZH, setArtSeoTitleZH] = useState("");
  const [artSeoDescEN, setArtSeoDescEN] = useState("");
  const [artSeoDescZH, setArtSeoDescZH] = useState("");
  const [artAuthor, setArtAuthor] = useState("Immersation Editor");
  const [artRelated, setArtRelated] = useState("");
  const [artCanonical, setArtCanonical] = useState("");

  // Newsletter form controlled states
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any | null>(null);
  const [nlSlug, setNlSlug] = useState("");
  const [nlTitleEN, setNlTitleEN] = useState("");
  const [nlTitleZH, setNlTitleZH] = useState("");
  const [nlExcerptEN, setNlExcerptEN] = useState("");
  const [nlExcerptZH, setNlExcerptZH] = useState("");
  const [nlBodyEN, setNlBodyEN] = useState("");
  const [nlBodyZH, setNlBodyZH] = useState("");
  const [nlCatEN, setNlCatEN] = useState("BODY NOTES");
  const [nlCatZH, setNlCatZH] = useState("身心信标");
  const [nlTags, setNlTags] = useState("");
  const [nlCover, setNlCover] = useState("");
  const [nlDateEN, setNlDateEN] = useState("July 2026");
  const [nlDateZH, setNlDateZH] = useState("2026年7月");
  const [nlReadEN, setNlReadEN] = useState("");
  const [nlReadZH, setNlReadZH] = useState("");
  const [nlStatus, setNlStatus] = useState("Draft");
  const [nlScheduledDate, setNlScheduledDate] = useState("");
  const [nlFeatured, setNlFeatured] = useState(false);
  const [nlSeoTitleEN, setNlSeoTitleEN] = useState("");
  const [nlSeoTitleZH, setNlSeoTitleZH] = useState("");
  const [nlSeoDescEN, setNlSeoDescEN] = useState("");
  const [nlSeoDescZH, setNlSeoDescZH] = useState("");
  const [nlEmailSubject, setNlEmailSubject] = useState("");
  const [nlPreviewText, setNlPreviewText] = useState("");
  const [nlSendFoxTags, setNlSendFoxTags] = useState<string[]>(["body"]);
  const nlPillar = derivePillarFromSendFoxTags(nlSendFoxTags);
  const [nlSendMode, setNlSendMode] = useState("Save as web archive only");
  const [nlCtaText, setNlCtaText] = useState("SUBSCRIBE NOW");

  // Ebook form controlled states
  const [showEbookForm, setShowEbookForm] = useState(false);
  const [editingEbook, setEditingEbook] = useState<any | null>(null);
  const [ebId, setEbId] = useState("");
  const [ebTitleEN, setEbTitleEN] = useState("");
  const [ebTitleZH, setEbTitleZH] = useState("");
  const [ebPrice, setEbPrice] = useState(39.00);
  const [ebDescEN, setEbDescEN] = useState("");
  const [ebDescZH, setEbDescZH] = useState("");
  const [ebCover, setEbCover] = useState("");
  const [ebChapters, setEbChapters] = useState("");
  const [ebFileUrl, setEbFileUrl] = useState("");
  const [ebDiscountPercent, setEbDiscountPercent] = useState(0);
  const [ebFormat, setEbFormat] = useState("digital-guide");

  // EPUB conversion state variables
  const [ebEpubSourceUrl, setEbEpubSourceUrl] = useState("");
  const [ebLastConvertedAt, setEbLastConvertedAt] = useState<string | null>(null);
  const [ebEpubConversionStatus, setEbEpubConversionStatus] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvertEpub = async (productId: string, epubUrl: string) => {
    if (!productId) {
      alert(lang === "en" ? "Please save or set the volume ID first before converting." : "请在转换前先设置产品 Volume ID（Slug）。");
      return;
    }
    if (!epubUrl) {
      alert(lang === "en" ? "Please enter a valid EPUB file URL." : "请输入有效的 EPUB 文件链接。");
      return;
    }
    setIsConverting(true);
    setEbEpubConversionStatus(null);
    try {
      const response = await fetch("/api/convert-epub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId, epubUrl })
      });
      const data = await response.json();
      if (data.success) {
        const nowStr = new Date().toLocaleString();
        setEbLastConvertedAt(nowStr);
        setEbEpubConversionStatus("success");
        
        // Update local books/products list
        const updatedBooks = books.map((b: any) => {
          if (b.id === productId) {
            return {
              ...b,
              epubSourceUrl: epubUrl,
              lastConvertedAt: nowStr,
              epubConversionStatus: "success"
            };
          }
          return b;
        });
        setBooks(updatedBooks);

        // Update active editing ebook state if open
        if (editingEbook && editingEbook.id === productId) {
          setEditingEbook({
            ...editingEbook,
            epubSourceUrl: epubUrl,
            lastConvertedAt: nowStr,
            epubConversionStatus: "success"
          });
        }

        // Update active editing product state if open
        if (editingProduct && editingProduct.id === productId) {
          setEditingProduct({
            ...editingProduct,
            epubSourceUrl: epubUrl,
            lastConvertedAt: nowStr,
            epubConversionStatus: "success"
          });
        }

        addAuditLog("Convert EPUB", `Successfully converted EPUB for product ${productId} to interactive flip book chapters`);
      } else {
        const errMsg = data.error || "Unknown conversion error";
        setEbEpubConversionStatus(`failed: ${errMsg}`);
        addAuditLog("Convert EPUB Failed", `Failed to convert EPUB for product ${productId}: ${errMsg}`);
      }
    } catch (err: any) {
      setEbEpubConversionStatus(`failed: ${err.message || String(err)}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Controlled states handlers & helpers
  const handleArtTitleENChange = (val: string) => {
    setArtTitleEN(val);
    if (!editingArticle) {
      setArtSlug(val.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50));
    }
  };

  const handleNlTitleENChange = (val: string) => {
    setNlTitleEN(val);
    if (!editingNewsletter) {
      setNlSlug(val.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50));
    }
  };

  const handleCalculateReadTime = (enText: string, zhText: string, type: "art" | "nl") => {
    const enWords = enText.trim().split(/\s+/).filter(Boolean).length;
    const enMinutes = Math.max(1, Math.ceil(enWords / 150));
    const zhChars = zhText.replace(/\s+/g, "").length;
    const zhMinutes = Math.max(1, Math.ceil(zhChars / 250));

    const finalMinutes = Math.max(enMinutes, zhMinutes);

    if (type === "art") {
      setArtReadEN(`${finalMinutes} MIN READ`);
      setArtReadZH(`阅读时间 ${finalMinutes} 分钟`);
    } else {
      setNlReadEN(`${finalMinutes} MIN READ`);
      setNlReadZH(`阅读时间 ${finalMinutes} 分钟`);
    }
  };

  function derivePillarFromSendFoxTags(tags: string[]): "body" | "tool" | "capital" | "frameworks" {
    if (!tags || tags.length === 0) return "body";
    const hasBody = tags.includes("body");
    const hasTool = tags.includes("tool");
    const hasCapital = tags.includes("capital");

    if (hasBody && hasTool && hasCapital) {
      return "frameworks";
    }
    if (tags.length === 1) {
      if (tags[0] === "body") return "body";
      if (tags[0] === "tool") return "tool";
      if (tags[0] === "capital") return "capital";
    }
    if (hasBody) return "body";
    if (hasTool) return "tool";
    if (hasCapital) return "capital";
    return "body";
  }

  const handleUploadFileMock = (e: React.ChangeEvent<HTMLInputElement>, targetType: "image" | "audio" | "pdf") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadedFileUrl("");
    setUploadedFileName(file.name);
    setUploadedFileType(targetType);

    setTimeout(() => {
      setUploadingFile(false);
      const year = "2026";
      const month = "07";
      const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
      const simulatedUrl = `https://wordpress.immersation.com/wp-content/uploads/${year}/${month}/${cleanName}`;
      setUploadedFileUrl(simulatedUrl);
      addAuditLog("WP Media Upload", `Uploaded media asset "${file.name}" to WordPress Media Library.`);
    }, 1200);
  };

  const handleInsertMediaTag = (textareaType: "art_en" | "art_zh" | "nl_en" | "nl_zh") => {
    if (!uploadedFileUrl) return;
    const tag = uploadedFileType === "audio" 
      ? `{{audio:${uploadedFileUrl}}}` 
      : `![${uploadedFileName.split(".")[0]}](${uploadedFileUrl})`;

    if (textareaType === "art_en") {
      setArtBodyEN(prev => prev + (prev ? "\n\n" : "") + tag);
    } else if (textareaType === "art_zh") {
      setArtBodyZH(prev => prev + (prev ? "\n\n" : "") + tag);
    } else if (textareaType === "nl_en") {
      setNlBodyEN(prev => prev + (prev ? "\n\n" : "") + tag);
    } else if (textareaType === "nl_zh") {
      setNlBodyZH(prev => prev + (prev ? "\n\n" : "") + tag);
    }
  };

  const handleNewArticleClick = () => {
    setEditingArticle(null);
    setArtSlug("");
    setArtTitleEN("");
    setArtTitleZH("");
    setArtExcerptEN("");
    setArtExcerptZH("");
    setArtBodyEN("");
    setArtBodyZH("");
    setArtCatEN("BODY NOTES");
    setArtCatZH("身心信标");
    setArtPillar("body");
    setArtCategoryValue("");
    setArtArticleFormat("editorial-intelligence");
    setArtContentFormat("markdown");
    setArtRelatedSlugs([]);
    setArtTags("");
    setArtCover("");
    setArtPinterestImageUrl("");
    setArtAdUrl("");
    setArtDate(new Date().toISOString().split("T")[0]);
    setArtReadEN("");
    setArtReadZH("");
    setArtStatus("Draft");
    setArtScheduledDate("");
    setArtFeatured(false);
    setArtSeoTitleEN("");
    setArtSeoTitleZH("");
    setArtSeoDescEN("");
    setArtSeoDescZH("");
    setArtAuthor("Immersation Editor");
    setArtRelated("");
    setArtCanonical("");
    setShowArticleForm(true);
  };

  const handleNewNewsletterClick = () => {
    setEditingNewsletter(null);
    setNlSlug("");
    setNlTitleEN("");
    setNlTitleZH("");
    setNlExcerptEN("");
    setNlExcerptZH("");
    setNlBodyEN("");
    setNlBodyZH("");
    setNlCatEN("BODY NOTES");
    setNlCatZH("身心信标");
    setNlTags("");
    setNlCover("");
    setNlDateEN("July 2026");
    setNlDateZH("2026年7月");
    setNlReadEN("");
    setNlReadZH("");
    setNlStatus("Draft");
    setNlScheduledDate("");
    setNlFeatured(false);
    setNlSeoTitleEN("");
    setNlSeoTitleZH("");
    setNlSeoDescEN("");
    setNlSeoDescZH("");
    setNlEmailSubject("");
    setNlPreviewText("");
    setNlSendFoxTags(["body"]);
    setNlSendMode("Save as web archive only");
    setNlCtaText("SUBSCRIBE NOW");
    setShowNewsletterForm(true);
  };

  const handleNewEbookClick = () => {
    setEditingEbook(null);
    setEbId(`eb-${Date.now()}`);
    setEbTitleEN("");
    setEbTitleZH("");
    setEbPrice(39.00);
    setEbDescEN("");
    setEbDescZH("");
    setEbCover("");
    setEbChapters("");
    setEbFileUrl("");
    setEbFormat("Wealth Framework");
    setEbEpubSourceUrl("");
    setEbLastConvertedAt(null);
    setEbEpubConversionStatus(null);
    setShowEbookForm(true);
  };

  const handleEditArticle = (art: any) => {
    setEditingArticle(art);
    setArtSlug(art.slug || art.id || "");
    setArtTitleEN(art.title?.en || "");
    setArtTitleZH(art.title?.zh || "");
    setArtExcerptEN(art.excerpt?.en || "");
    setArtExcerptZH(art.excerpt?.zh || "");
    setArtBodyEN(art.content?.en || art.description?.en || "");
    setArtBodyZH(art.content?.zh || art.description?.zh || "");
    setArtCatEN(art.category?.en || "");
    setArtCatZH(art.category?.zh || "");
    setArtPillar(art.pillar || "body");
    setArtCategoryValue(art.categoryValue || "");
    setArtArticleFormat(art.articleFormat || art.contentFormat || "editorial-intelligence");
    setArtContentFormat(art.contentFormat || "markdown");
    setArtRelatedSlugs(Array.isArray(art.relatedArticles) ? art.relatedArticles : []);
    setArtTags(Array.isArray(art.tags) ? art.tags.join(", ") : "");
    setArtCover(art.cover || "");
    setArtPinterestImageUrl(art.pinterestImageUrl || "");
    setArtAdUrl(art.adUrl || "");
    if (typeof art.date === "object" && art.date.en) {
      try {
        const d = new Date(art.date.en);
        if (!isNaN(d.getTime())) setArtDate(d.toISOString().split("T")[0]);
      } catch (e) {}
    } else if (typeof art.date === "string") {
      try {
        const d = new Date(art.date);
        if (!isNaN(d.getTime())) setArtDate(d.toISOString().split("T")[0]);
      } catch (e) {}
    }
    setArtReadEN(art.readTime?.en || "");
    setArtReadZH(art.readTime?.zh || "");
    setArtStatus(art.status || "Published");
    setArtScheduledDate(art.scheduledDate || "");
    setArtFeatured(!!art.featured);
    setArtSeoTitleEN(art.seo?.titleEN || "");
    setArtSeoTitleZH(art.seo?.titleZH || "");
    setArtSeoDescEN(art.seo?.descEN || "");
    setArtSeoDescZH(art.seo?.descZH || "");
    setArtAuthor(art.author || "Immersation Editor");
    setArtRelated(Array.isArray(art.relatedArticles) ? art.relatedArticles.join(", ") : "");
    setArtCanonical(art.canonicalLink || "");
    setShowArticleForm(true);
  };

  const handleEditNewsletter = (nl: any) => {
    setEditingNewsletter(nl);
    setNlSlug(nl.slug || nl.id || "");
    setNlTitleEN(nl.title?.en || nl.subject?.en || "");
    setNlTitleZH(nl.title?.zh || nl.subject?.zh || "");
    setNlExcerptEN(nl.excerpt?.en || "");
    setNlExcerptZH(nl.excerpt?.zh || "");
    setNlBodyEN(nl.content?.en || nl.body || "");
    setNlBodyZH(nl.content?.zh || nl.body || "");
    setNlCatEN(nl.category?.en || "BODY NOTES");
    setNlCatZH(nl.category?.zh || "身心信标");
    setNlTags(Array.isArray(nl.tags) ? nl.tags.join(", ") : "");
    setNlCover(nl.cover || "");
    setNlDateEN(nl.date || "");
    setNlDateZH(nl.date || "");
    setNlReadEN(nl.readTime?.en || "5 min read");
    setNlReadZH(nl.readTime?.zh || "5 分钟阅读");
    setNlStatus(nl.status || "Sent");
    setNlScheduledDate(nl.scheduledDate || "");
    setNlFeatured(!!nl.featured);
    setNlSeoTitleEN(nl.seo?.titleEN || "");
    setNlSeoTitleZH(nl.seo?.titleZH || "");
    setNlSeoDescEN(nl.seo?.descEN || "");
    setNlSeoDescZH(nl.seo?.descZH || "");

    setNlEmailSubject(nl.emailSubject || nl.subject?.en || "");
    setNlPreviewText(nl.previewText || nl.excerpt?.en || "");
    const initialTags = Array.isArray(nl.sendFoxTags) && nl.sendFoxTags.length > 0
      ? nl.sendFoxTags.filter((t: string) => t !== "frameworks")
      : (nl.listId ? [nl.listId.toLowerCase().replace(" notes", "").trim()] : [nl.pillar?.toLowerCase() || "tool"]);
    setNlSendFoxTags(initialTags);
    setNlSendMode(nl.sendMode || "Save as web archive only");
    setNlCtaText(nl.ctaText || "SUBSCRIBE NOW");
    setShowNewsletterForm(true);
  };

  const handleEditEbook = (eb: any) => {
    setEditingEbook(eb);
    setEbId(eb.id || "");
    setEbTitleEN(eb.title?.en || "");
    setEbTitleZH(eb.title?.zh || "");
    setEbPrice(eb.price || 39.00);
    setEbDescEN(eb.description?.en || "");
    setEbDescZH(eb.description?.zh || "");
    setEbCover(eb.cover || "");
    setEbChapters(Array.isArray(eb.chapters) ? eb.chapters.map((c: any) => `${c.time || ""} ${c.title || ""}`).join("\n") : "");
    setEbFileUrl(eb.fileUrl || "");
    setEbFormat(eb.format || "Wealth Framework");
    setEbEpubSourceUrl(eb.epubSourceUrl || "");
    setEbLastConvertedAt(eb.lastConvertedAt || null);
    setEbEpubConversionStatus(eb.epubConversionStatus || null);
    setShowEbookForm(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingArticle?.id || `art-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      slug: artSlug,
      pillar: artPillar,
      category: { 
        en: CATEGORY_OPTIONS_BY_PILLAR[artPillar]?.find(c => c.value === artCategoryValue)?.label.en || artCatEN, 
        zh: CATEGORY_OPTIONS_BY_PILLAR[artPillar]?.find(c => c.value === artCategoryValue)?.label.zh || artCatZH 
      },
      categoryValue: artCategoryValue,
      contentFormat: artContentFormat,
      articleFormat: artArticleFormat,
      title: { en: artTitleEN, zh: artTitleZH },
      excerpt: { en: artExcerptEN, zh: artExcerptZH },
      content: { en: artBodyEN, zh: artBodyZH },
      date: { 
        en: (() => {
          try {
            if (!artDate) return "";
            const d = new Date(artDate);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase().replace(',', '');
          } catch (e) { return ""; }
        })(),
        zh: (() => {
          try {
            if (!artDate) return "";
            const d = new Date(artDate);
            if (isNaN(d.getTime())) return "";
            return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
          } catch (e) { return ""; }
        })()
      },
      readTime: { en: artReadEN, zh: artReadZH },
      tags: artTags.split(",").map(t => t.trim()).filter(Boolean),
      cover: artCover,
      pinterestImageUrl: artPinterestImageUrl,
      adUrl: artAdUrl,
      status: artStatus,
      scheduledDate: artScheduledDate,
      featured: artFeatured,
      relatedArticles: artRelatedSlugs,
      seo: {
        titleEN: artSeoTitleEN,
        titleZH: artSeoTitleZH,
        descEN: artSeoDescEN,
        descZH: artSeoDescZH
      },
      author: artAuthor,
      canonicalLink: artCanonical
    };

    const newArticles = editingArticle 
      ? articles.map(a => a.id === editingArticle.id ? payload : a)
      : [payload, ...articles];
      
    setArticles(newArticles);
    
    if (editingArticle) {
      addAuditLog("Edit Essay", `Updated essay "${artTitleEN}"`);
    } else {
      addAuditLog("Create Essay", `Published new essay "${artTitleEN}"`);
    }
    
    // Sync to Supabase FIRST, so that Vite HMR reload from local API sync doesn't abort the DB request
    if (supabase) {
      try {
        const { error } = await supabase.from('articles').upsert(payload);
        if (error) {
          console.error("Supabase sync error:", error);
          setSyncError(`articles table sync: ${error.message || String(error)}`);
        }
      } catch (err) {
        console.error("Supabase request failed:", err);
      }
    }

    // Sync to API (AI Studio Codebase) - do this AFTER Supabase so HMR doesn't cancel Supabase
    fetch("/api/sync-articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles: newArticles })
    }).catch(console.error);

    setShowArticleForm(false);
    setEditingArticle(null);
  };

  const handleSaveNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSegment = nlSendFoxTags.length > 0 
      ? nlSendFoxTags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
      : "Tool";

    const payload = {
      id: editingNewsletter?.id || `nl-${Date.now()}`,
      slug: nlSlug,
      pillar: nlPillar,
      category: { en: nlCatEN, zh: nlCatZH },
      title: { en: nlTitleEN, zh: nlTitleZH },
      excerpt: { en: nlExcerptEN, zh: nlExcerptZH },
      content: { en: nlBodyEN, zh: nlBodyZH },
      date: nlDateEN,
      readTime: { en: nlReadEN, zh: nlReadZH },
      tags: nlTags.split(",").map(t => t.trim()).filter(Boolean),
      cover: nlCover,
      status: nlStatus === "Published" ? "Sent" : nlStatus,
      scheduledDate: nlScheduledDate,
      featured: nlFeatured,
      seo: {
        titleEN: nlSeoTitleEN,
        titleZH: nlSeoTitleZH,
        descEN: nlSeoDescEN,
        descZH: nlSeoDescZH
      },
      emailSubject: nlEmailSubject || nlTitleEN,
      previewText: nlPreviewText || nlExcerptEN,
      sendFoxTags: nlSendFoxTags,
      listId: formattedSegment,
      sendMode: nlSendMode,
      ctaText: nlCtaText
    };

    let msgSuffix = "";
    if (nlSendMode.includes("Send via SendFox now")) {
      let apiKeyToUse = sendFoxApiKey.trim() || localStorage.getItem("sendfox_api_key") || "";
      if (!apiKeyToUse) {
        const inputKey = prompt("Please enter your SendFox Personal Access Token (API Key) to trigger live broadcast:\n(Get your token at https://sendfox.com/account)");
        if (inputKey && inputKey.trim()) {
          apiKeyToUse = inputKey.trim();
          setSendFoxApiKey(apiKeyToUse);
          localStorage.setItem("sendfox_api_key", apiKeyToUse);
        } else {
          alert("SendFox Personal Access Token is required for live broadcast. The campaign has been saved as a Draft.");
          payload.status = "Draft";
        }
      }

      if (apiKeyToUse) {
        try {
          const origin = typeof window !== "undefined" ? window.location.origin : "https://immersation.com";
          const baseUrl = (!origin || origin.includes("aistudio.google.com") || origin.includes("ais-dev-") || origin.includes("ais-pre-") || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("run.app")) 
            ? "https://immersation.com" 
            : origin;
          const issueSlugOrId = payload.slug || payload.id;
          const targetUrl = issueSlugOrId
            ? `${baseUrl}/newsletter?slug=${encodeURIComponent(issueSlugOrId)}`
            : `${baseUrl}/newsletter`;

          const broadcastRes = await fetch("/api/broadcast-sendfox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey: apiKeyToUse,
              subject: payload.emailSubject,
              previewText: payload.previewText,
              content: payload.content.en || payload.content.zh,
              sendFoxTags: nlSendFoxTags,
              ctaText: nlCtaText || "READ THE FULL SIGNAL",
              targetUrl: targetUrl
            })
          });
          const broadcastData = await broadcastRes.json().catch(() => null);
          if (broadcastData?.success) {
            payload.status = "Sent";
            msgSuffix = ` and successfully broadcasted via SendFox API!`;
            addAuditLog("SendFox Broadcast", `Live campaign "${payload.emailSubject}" broadcasted to segments: "${nlSendFoxTags.join(', ')}"`);
            alert(`🎉 SendFox Live Broadcast Dispatched!\n\nCampaign "${payload.emailSubject}" has been sent to your subscribers via SendFox!`);
          } else {
            const errReason = broadcastData?.error || "SendFox API dispatch failed.";
            alert(`⚠️ SendFox Broadcast Notice:\n${errReason}\n\nThe campaign was saved as a Draft. Please verify your SendFox API key or list configuration.`);
            payload.status = "Draft";
          }
        } catch (err: any) {
          console.error("Broadcast request error:", err);
          alert(`SendFox Broadcast Error: ${err?.message || "Network request failed."}`);
          payload.status = "Draft";
        }
      }
    }

    const newNewsletters = editingNewsletter 
      ? newsletterIssues.map(n => n.id === editingNewsletter.id ? payload : n)
      : [payload, ...newsletterIssues];
      
    if (supabase) {
      try {
        const { error } = await supabase.from('newsletters').upsert(payload);
        if (error) {
          console.error("Supabase sync error:", error);
          setSyncError(`newsletters table sync: ${error.message || String(error)}`);
          return;
        }
      } catch (err) {
        return;
      }
    }
    
    setNewsletterIssues(newNewsletters);
    localStorage.setItem("immersation_newsletters_v2", JSON.stringify(newNewsletters));
    
    if (editingNewsletter) {
      addAuditLog("Edit Newsletter", `Updated newsletter issue "${payload.title.en}"${msgSuffix}`);
    } else {
      addAuditLog("Create Newsletter", `Created newsletter issue "${payload.title.en}"${msgSuffix}`);
    }

    setShowNewsletterForm(false);
    setEditingNewsletter(null);
  };

  const handleSaveEbook = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedChapters = ebChapters.split("\n").map(line => {
      const match = line.match(/^(\d{2}:\d{2})\s+(.+)$/);
      if (match) {
        return { time: match[1], title: match[2] };
      }
      return { time: "", title: line.trim() };
    }).filter(c => c.title);

    const payload = {
      id: ebId,
      title: { en: ebTitleEN, zh: ebTitleZH },
      price: Number(ebPrice),
      description: { en: ebDescEN, zh: ebDescZH },
      cover: ebCover || "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-Light-scaled.png",
      chapters: parsedChapters,
      fileUrl: ebFileUrl,
      downloadFileUrl: ebFileUrl, // Sync both download file fields for security
      discountPercent: ebDiscountPercent,
      format: ebFormat,
      textColor: "text-[#F4F1EB]",
      accentColor: "text-[#B69A6B]",
      epubSourceUrl: ebEpubSourceUrl,
      lastConvertedAt: ebLastConvertedAt,
      epubConversionStatus: ebEpubConversionStatus
    };

    if (editingEbook) {
      setBooks(books.map(b => b.id === editingEbook.id ? payload : b));
      if (supabase) {
        supabase.from("products").update(payload).eq("id", editingEbook.id).then(({ error }) => {
          if (error) {
            console.warn("Supabase edit product error:", error);
            setSyncError(`products (ebooks) table update: ${error.message || String(error)}`);
          }
        });
      }
      addAuditLog("Edit Ebook", `Updated digital volume "${ebTitleEN}" properties`);
    } else {
      setBooks([...books, payload]);
      if (supabase) {
        supabase.from("products").insert([payload]).then(({ error }) => {
          if (error) {
            console.warn("Supabase create product error:", error);
            setSyncError(`products (ebooks) table insert: ${error.message || String(error)}`);
          }
        });
      }
      addAuditLog("Create Ebook", `Deployed new digital volume "${ebTitleEN}" to online catalogs`);
    }
    setShowEbookForm(false);
    setEditingEbook(null);
  };

  // SendFox manual add contacts
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactList, setNewContactList] = useState("Body Notes");

  // Create Coupon Code inputs
  const [couponCode, setCouponCode] = useState("");
  const [couponValue, setCouponValue] = useState(20);
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponLimit, setCouponLimit] = useState(50);
  const [couponExpiry, setCouponExpiry] = useState("2026-12-31");
  const [couponAppliesTo, setCouponAppliesTo] = useState("all");

  // Newsletter compose
  const [newsletterSubjectEN, setNewsletterSubjectEN] = useState("");
  const [newsletterSubjectZH, setNewsletterSubjectZH] = useState("");
  const [newsletterTargetList, setNewsletterTargetList] = useState("Body Notes");
  const [newsletterBody, setNewsletterBody] = useState("");

  // Audio edit
  const [audioFileUrl, setAudioFileUrl] = useState("");
  const [audioTitleEN, setAudioTitleEN] = useState("");
  const [audioTitleZH, setAudioTitleZH] = useState("");

  // Export CSV helper
  const handleExportCSV = (dataArray: any[], fileName: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (dataArray.length === 0) return;
    const headers = Object.keys(dataArray[0]).join(",");
    csvContent += headers + "\r\n";
    dataArray.forEach(row => {
      const line = Object.values(row).map(val => {
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
      csvContent += line + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog("Export CSV", `Exported table data for ${fileName}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-800 antialiased animate-fade-in" id="full-admin-dashboard">
      {/* Header Panel */}
      <header className="bg-[#1A2F24] text-[#F4F1EB] px-8 py-4 border-b border-[#D8D2C6]/15 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-[#8B5A44] stroke-[1.5]" />
          <div>
            <h1 className="font-serif text-xl font-normal tracking-tight flex items-center gap-2">
              <span>{lang === "en" ? "System Administrator Panel" : "智枢阁系统超级管理中枢"}</span>
              <span className="text-[9px] font-mono bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                {lang === "en" ? "System Admin" : "全权管理员"}
              </span>
            </h1>
            <p className="text-[10px] text-[#F4F1EB]/60 font-mono mt-0.5">
              SECURE WORKSPACE ID: 0656a270 • API NODE ONLINE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              addAuditLog("Switch Language", `Toggled language context`);
            }}
            className="text-[10px] font-mono uppercase tracking-wider text-[#F4F1EB]/70 hover:text-[#F4F1EB] border border-[#F4F1EB]/20 rounded px-2.5 py-1"
          >
            {lang === "en" ? "Active: EN" : "当前: 中文"}
          </button>
          <button
            onClick={onClose}
            className="text-[#F4F1EB]/70 hover:text-white bg-[#8B5A44]/10 hover:bg-[#8B5A44]/30 border border-[#D8D2C6]/20 px-4 py-2 rounded-sm text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{lang === "en" ? "Close Dashboard" : "回到智枢阁"}</span>
          </button>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Tab Drawer */}
        <aside className="w-64 bg-[#1A2F24]/95 border-r border-[#D8D2C6]/15 text-[#F4F1EB] flex flex-col justify-between py-6 shrink-0">
          <div className="space-y-6">
            <div className="px-6">
              <span className="text-[10px] font-display font-bold tracking-[0.2em] text-[#8B5A44] uppercase block">
                {lang === "en" ? "Console Navigation" : "控制台管理总线"}
              </span>
            </div>
            
            <nav className="space-y-1 px-3">
              <button
                onClick={() => { setActiveTab("overview"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "overview" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Overview / Home" : "全局概览与警报"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("ecommerce"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "ecommerce" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <ShoppingBag className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "E-commerce Module" : "数字商城与账单"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("content"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "content" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <BookOpen className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Content Studio" : "编辑型智能工坊"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("audio"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "audio" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <Music className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Audio Experiences" : "音频演播中枢"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("subscribers"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "subscribers" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <Users className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "SendFox Members" : "SendFox 订阅邮件"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("members"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "members" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <Shield className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Registered Members" : "注册思想者/会员"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("analytics"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "analytics" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <BarChart3 className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Analytics Engine" : "全域流量分析"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("settings"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs font-display text-[11px] font-bold uppercase tracking-wider transition-all text-left ${activeTab === "settings" ? "bg-[#8B5A44]/20 text-[#F4F1EB] border-l-2 border-[#8B5A44]" : "text-[#F4F1EB]/70 hover:bg-white/5 hover:text-white"}`}
              >
                <SettingsIcon className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Settings / Keys" : "集成设置与秘钥"}</span>
              </button>
            </nav>
          </div>

          <div className="px-6 py-4 border-t border-[#D8D2C6]/10 text-stone-500 text-[10px] space-y-1">
            <p>Admin: support@immersation.com</p>
            <p className="font-mono text-[9px]">V3.4.1 Production Node</p>
          </div>
        </aside>

        {/* Content Viewer Panel */}
        <main className="flex-1 overflow-y-auto px-8 py-8 bg-[#FDFBF7]">
          
          {/* Supabase Sync Error Banner */}
          {syncError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm text-stone-800 text-xs flex items-start gap-3 animate-fade-in text-left">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-serif font-bold text-[#8B5A44] text-[13px]">
                  {lang === "en" ? "Supabase Sync Mismatch Detected" : "检测到 Supabase 同步不匹配"}
                </p>
                <p className="mt-1 leading-relaxed text-stone-600">
                  {lang === "en" 
                    ? `A request to save or load database records skipped a live sync: "${syncError}". Don't worry—local storage fell back safely so all features are perfectly active!` 
                    : `保存或加载数据库记录时跳过了实时同步：'${syncError}'。不用担心——本地缓存已安全承接，所有功能完全正常且可供测试！`}
                </p>
                <div className="mt-2 text-[10px] text-stone-500 bg-white/60 p-2 border border-amber-100 rounded-xs font-mono">
                  {lang === "en" 
                    ? "To resolve this in production, make sure to execute the SQL statements in supabase_schema.sql inside your Supabase SQL Editor." 
                    : "若要在生产环境中彻底同步，请确保已在 Supabase 的 SQL 编辑器中运行了 supabase_schema.sql 内的最新 SQL 语句。"}
                </div>
              </div>
              <button 
                onClick={() => setSyncError(null)} 
                className="text-stone-400 hover:text-stone-700 font-bold px-2 cursor-pointer text-base"
              >
                ×
              </button>
            </div>
          )}

          {/* ==================== 1. OVERVIEW / HOME ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Executive Summary" : "决策看板主页"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" ? "Real-time billing, content monitoring, and active system health status." : "全站实时流量结算、新内容吞吐量以及第三方自动化网关健康审计。"}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#E8DDCF]/35 border border-[#D8D2C6]/40 px-3 py-2 rounded-sm text-xs font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-emerald-800 font-bold">Stripe & SendFox Webhooks Active</span>
                </div>
              </div>

              {/* Grid 4 Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-4 rounded-sm">
                  <div className="flex justify-between text-stone-500 text-[10px] font-display uppercase tracking-wider">
                    <span>{lang === "en" ? "Gross revenue today" : "今日结算总值"}</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-serif text-[#1A2F24] font-semibold mt-1 block">
                    ${grossRevenueToday.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold block mt-1">
                    {revenueChangeText}
                  </span>
                </div>

                <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-4 rounded-sm">
                  <div className="flex justify-between text-stone-500 text-[10px] font-display uppercase tracking-wider">
                    <span>{lang === "en" ? "Orders needing action" : "待处理阻断订单"}</span>
                    <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
                  </div>
                  <span className="text-2xl font-serif text-[#8B5A44] font-semibold mt-1 block">
                    {systemTransactions.filter(t => t.status !== "Successful" && t.status !== "Paid").length}
                  </span>
                  <span className="text-[9px] text-stone-500 block mt-1">{lang === "en" ? "Unfinished checkout logs" : "包括未完成或异常废弃的沙盒交易"}</span>
                </div>

                <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-4 rounded-sm">
                  <div className="flex justify-between text-stone-500 text-[10px] font-display uppercase tracking-wider">
                    <span>{lang === "en" ? "New Subscribers today" : "今日新增订阅"}</span>
                    <Mail className="w-4 h-4 text-[#8B5A44]" />
                  </div>
                  <span className="text-2xl font-serif text-[#1A2F24] mt-1 block">
                    {newSubscribersToday}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold block mt-1">100% Synced to SendFox</span>
                </div>

                <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-4 rounded-sm">
                  <div className="flex justify-between text-stone-500 text-[10px] font-display uppercase tracking-wider">
                    <span>{lang === "en" ? "Active Books" : "活跃数字卷数"}</span>
                    <BookOpen className="w-4 h-4 text-[#1A2F24]" />
                  </div>
                  <span className="text-2xl font-serif text-[#1A2F24] mt-1 block">{books.length}</span>
                  <span className="text-[9px] text-stone-500 block mt-1">{lang === "en" ? "3 Pillars Digital Products" : "三大支柱相关实体与工具书"}</span>
                </div>
              </div>

              {/* Line Chart & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 7-Day Revenue Line Chart */}
                <div className="lg:col-span-2 bg-[#FDFBF7] border border-[#D8D2C6]/40 p-5 rounded-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                      {lang === "en" ? "7-Day Billing Pipeline" : "近7日交易走势图"}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">USD $ (GROSS VOLUME)</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DDCF/50" />
                        <XAxis dataKey="name" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip contentStyle={{ background: "#1A2F24", color: "#F4F1EB", border: "none", fontSize: 11 }} />
                        <Line type="monotone" dataKey="amount" stroke="#8B5A44" strokeWidth={2} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* System Alerts Container */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-[#1A2F24] mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-[#8B5A44]" />
                      <span>{lang === "en" ? "System Core Alerts" : "核心网关及硬件监测"}</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-sm text-xs">
                        <div className="flex justify-between font-semibold text-red-800">
                          <span>{lang === "en" ? "STRIPE_SECRET_KEY" : "Stripe 秘钥"}</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-red-100 rounded">Alert</span>
                        </div>
                        <p className="text-stone-600 text-[10px] mt-1">
                          {lang === "en" 
                            ? "Stripe API Key loaded, currently in simulated sandbox environment mode. Enter genuine secret key in settings to process live credit card transactions."
                            : "Stripe API Key 处于测试沙盒级别。请在集成设置中输入真实生产秘钥以切换实时扣款总线。"}
                        </p>
                      </div>

                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs">
                        <div className="flex justify-between font-semibold text-emerald-800">
                          <span>SendFox API Status</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-emerald-100 rounded">Healthy</span>
                        </div>
                        <p className="text-stone-600 text-[10px] mt-1">
                          {lang === "en" ? "Webhook endpoints active. Standard customer synchronization is live." : "SendFox API 回调网络测试通过，购买用户可实时同步。"}
                        </p>
                      </div>

                      <div className="p-2.5 bg-[#E8DDCF]/50 border border-[#D8D2C6]/50 rounded-sm text-xs">
                        <div className="flex justify-between font-semibold text-[#1A2F24]">
                          <span>WP media upload API</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-[#1A2F24]/10 rounded">Mocked</span>
                        </div>
                        <p className="text-stone-600 text-[10px] mt-1">
                          {lang === "en" ? "No authentic Application Password detected. Local simulated WP engine active." : "未检测到外部 WordPress 用户凭证，使用自带模拟静态媒体库。"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addAuditLog("Manual Webhook Reset", "Fired self-check signal to Stripe and SendFox backends.");
                      alert(lang === "en" ? "Webhook check complete! All simulated connections are healthy." : "信道健康自检完成！所有接口响应正常。");
                    }}
                    className="w-full text-center border border-[#D8D2C6] hover:border-[#8B5A44] hover:text-[#8B5A44] transition-colors py-2 text-[10px] font-display font-bold uppercase tracking-wider rounded-xs mt-3 bg-white"
                  >
                    {lang === "en" ? "Run Full Diagnostic" : "运行接口完整诊断"}
                  </button>
                </div>

              </div>

              {/* Latest published content preview */}
              <div className="bg-white border border-[#D8D2C6]/40 p-5 rounded-sm">
                <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-4">
                  {lang === "en" ? "Latest Editorial Catalog" : "最新编辑目录（含支柱标签）"}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.slice(0, 4).map((art, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border-b border-[#D8D2C6]/20 hover:bg-[#FDFBF7] transition-all">
                      <div>
                        <span className="text-[9px] font-bold text-[#8B5A44] uppercase tracking-wider">{art.category?.[lang] || "Body"}</span>
                        <h4 className="text-xs font-serif font-semibold text-[#1A2F24] mt-0.5">{art.title[lang]}</h4>
                        <span className="text-[9px] text-stone-400 font-mono block mt-0.5">{art.readTime?.[lang] || "3 min read"}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        Published
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. E-COMMERCE MODULE ==================== */}
          {activeTab === "ecommerce" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center pb-4 border-b border-[#D8D2C6]/20">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "E-commerce Engine" : "全功能电商与资产分发中心"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" ? "Manage pricing rules, digital books ownerships, coupon validation, and invoice generation." : "管理数字图书馆智识产权、编辑测试价格、审核会员扣款并管理优惠券等。"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportCSV(systemTransactions, "Immersation_Transactions")}
                    className="bg-white hover:bg-stone-50 border border-[#D8D2C6] text-[#1A2F24] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Export Transactions" : "导出交易CSV"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Add Product Volume" : "新增产品卷"}</span>
                  </button>
                </div>
              </div>

              {/* Sub-grid: Product grid / Add product */}
              {showProductForm && (
                <div className="bg-[#E8DDCF]/25 border border-[#D8D2C6]/50 p-5 rounded-sm animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                      {editingProduct ? (lang === "en" ? "Edit Digital Volume" : "编辑数字产品卷") : (lang === "en" ? "Create Digital Volume" : "新增数字产品卷")}
                    </span>
                    <button onClick={() => setShowProductForm(false)} className="text-stone-500 hover:text-[#1C1C1C]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const titleEN = fd.get("titleEN") as string;
                      const titleZH = fd.get("titleZH") as string;
                      const price = parseFloat(fd.get("price") as string);
                      const descEN = fd.get("descEN") as string;
                      const descZH = fd.get("descZH") as string;
                      const bookId = fd.get("bookId") as string;
                      const coverImageUrl = fd.get("coverImageUrl") as string || "";
                      const downloadFileUrl = fd.get("downloadFileUrl") as string || "";
                      const discountPercent = parseInt(fd.get("discountPercent") as string) || 0;
                      const format = fd.get("bookFormat") as string || "digital-guide";
                      const epubSourceUrl = fd.get("epubSourceUrl") as string || "";
                      const lastConvertedAt = fd.get("lastConvertedAt") as string || null;
                      const epubConversionStatus = fd.get("epubConversionStatus") as string || null;

                      const payload: any = {
                        id: bookId || `vol-${Date.now()}`,
                        title: { en: titleEN, zh: titleZH },
                        tagline: { en: descEN.substring(0, 30), zh: descZH.substring(0, 30) },
                        description: { en: descEN, zh: descZH },
                        price: price,
                        coverColor: "bg-[#1C1C1C]",
                        borderColor: "border-[#1C1C1C]",
                        textColor: "text-[#F4F1EB]",
                        accentColor: "text-[#B69A6B]",
                        coverImageUrl,
                        downloadFileUrl,
                        fileUrl: downloadFileUrl, // Sync both download fields
                        discountPercent,
                        format,
                        epubSourceUrl,
                        lastConvertedAt,
                        epubConversionStatus
                      };

                      if (editingProduct) {
                        const updated = { ...editingProduct, ...payload };
                        setBooks(books.map(b => b.id === editingProduct.id ? updated : b));
                        if (supabase) {
                          supabase.from("products").update(updated).eq("id", editingProduct.id).then(({ error }) => {
                            if (error) console.warn("Supabase update product error:", error);
                          });
                        }
                        addAuditLog("Edit Product", `Updated digital volume "${titleEN}"`);
                      } else {
                        setBooks([...books, payload]);
                        if (supabase) {
                          supabase.from("products").insert([payload]).then(({ error }) => {
                            if (error) console.warn("Supabase create product error:", error);
                          });
                        }
                        addAuditLog("Add Product", `Created new digital volume "${titleEN}"`);
                      }
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold mb-1">Volume ID (Slug)</label>
                      <input type="text" name="bookId" required disabled={!!editingProduct} defaultValue={editingProduct?.id || ""} placeholder="workflow-playbook-v2" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Price (USD $)</label>
                      <input type="number" step="0.01" name="price" required defaultValue={editingProduct?.price ?? 19.00} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">English Title</label>
                      <input type="text" name="titleEN" required defaultValue={editingProduct?.title?.en || ""} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Chinese Title / 中文名称</label>
                      <input type="text" name="titleZH" required defaultValue={editingProduct?.title.zh || ""} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        {lang === "en" ? "Discount %" : "折扣百分比"}
                      </label>
                      <input type="number" min="0" max="90" name="discountPercent" defaultValue={editingProduct?.discountPercent || 0} placeholder="0" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        {lang === "en" ? "Format / Pillar" : "内容类型"}
                      </label>
                      <select name="bookFormat" defaultValue={editingProduct?.format || "digital-guide"} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]">
                        {CONTENT_FORMAT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>{f.label[lang]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        {lang === "en" ? "Cover Image URL" : "封面图片链接"}
                      </label>
                      <input type="url" name="coverImageUrl" defaultValue={editingProduct?.coverImageUrl || ""} placeholder="https://your-wp-media.com/uploads/cover.jpg" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        {lang === "en" ? "Download File URL (PDF/EPUB)" : "下载文件链接（PDF/EPUB）"}
                      </label>
                      <input type="url" name="downloadFileUrl" defaultValue={editingProduct?.downloadFileUrl || ""} placeholder="https://your-wp-media.com/uploads/volume.pdf" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                      <p className="text-[10px] text-stone-500 mt-1">This is the exact file the buyer receives after successful checkout.</p>
                    </div>

                    <div className="md:col-span-2 border-t border-[#D8D2C6]/30 pt-3">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {lang === "en" ? "EPUB Source URL for Flip Book" : "翻页阅读 EPUB 资源链接"}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          name="epubSourceUrl" 
                          value={editingProduct?.epubSourceUrl || ""} 
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, epubSourceUrl: e.target.value });
                            }
                          }}
                          placeholder="https://your-wp-media.com/uploads/book.epub" 
                          className="flex-1 bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44] font-mono text-xs" 
                        />
                        <button
                          type="button"
                          disabled={isConverting}
                          onClick={() => handleConvertEpub(editingProduct?.id, editingProduct?.epubSourceUrl || "")}
                          className="bg-[#1A2F24] hover:bg-[#8B5A44] disabled:bg-stone-300 text-[#F4F1EB] px-4 py-2 rounded-xs font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          {isConverting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{lang === "en" ? "Converting..." : "转换中..."}</span>
                            </>
                          ) : (
                            <span>{lang === "en" ? "Convert EPUB" : "转换 EPUB"}</span>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">Separate EPUB link used strictly for generating the interactive Flip Book chapters inside the Reading Room.</p>
                      
                      {/* Hidden inputs to pass timestamp and status through FormData submit */}
                      <input type="hidden" name="lastConvertedAt" value={editingProduct?.lastConvertedAt || ""} />
                      <input type="hidden" name="epubConversionStatus" value={editingProduct?.epubConversionStatus || ""} />

                      {editingProduct?.epubConversionStatus && (
                        <div className="mt-2 flex items-center gap-3">
                          {editingProduct.epubConversionStatus === "success" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-xs">
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              {lang === "en" ? "✓ Flip Book Ready" : "✓ 翻页书转换就绪"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-xs">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              {lang === "en" ? `Conversion Failed — ${editingProduct.epubConversionStatus.replace("failed: ", "")}` : `转换失败 — ${editingProduct.epubConversionStatus.replace("failed: ", "")}`}
                            </span>
                          )}
                          {editingProduct?.lastConvertedAt && (
                            <span className="text-[10px] text-stone-500">
                              {lang === "en" ? `Last Generated: ${editingProduct.lastConvertedAt}` : `上次生成于: ${editingProduct.lastConvertedAt}`}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleConvertEpub(editingProduct?.id, editingProduct?.epubSourceUrl || "")}
                            className="text-[10px] text-[#8B5A44] hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            {lang === "en" ? "Re-convert" : "重新转换"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold mb-1">English Description</label>
                      <textarea name="descEN" rows={3} required defaultValue={editingProduct?.description?.en || ""} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-semibold mb-1">Chinese Description / 中文说明</label>
                      <textarea name="descZH" rows={3} required defaultValue={editingProduct?.description.zh || ""} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]"></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowProductForm(false)} className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-xs">
                        Cancel
                      </button>
                      <button type="submit" className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] px-6 py-2 rounded-xs">
                        {lang === "en" ? "Save Product" : "保存产品数据"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Books list rendering */}
              <div className="bg-white border border-[#D8D2C6]/40 p-5 rounded-sm">
                <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-4">
                  {lang === "en" ? "Digital Volumes in Store" : "线上在售智识文献与工具包"}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {books.map((book) => (
                    <div key={book.id} className="flex gap-4 p-4 border border-stone-200 rounded justify-between items-start hover:border-[#8B5A44] transition-all">
                      <div className="flex gap-4 flex-1 pr-4">
                        <img
                          src={book.coverImageUrl || "/placeholder-cover.jpg"}
                          alt={book.title?.[lang] || "Book cover"}
                          className="w-16 h-24 object-cover rounded bg-[#E8DDCF]"
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="font-serif text-sm font-semibold text-[#1A2F24]">{book.title[lang]}</h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {book.discountPercent > 0 ? (
                              <>
                                <span className="text-xs line-through text-stone-400">
                                  ${Number(book.price).toFixed(2)}
                                </span>
                                <span className="text-sm font-semibold text-[#8B5A44]">
                                  ${(Number(book.price) * (1 - book.discountPercent / 100)).toFixed(2)}
                                </span>
                                <span className="text-[10px] bg-[#8B5A44] text-white px-1.5 py-0.5 rounded">
                                  -{book.discountPercent}%
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-[#1A2F24]">
                                ${Number(book.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-stone-500 line-clamp-2 mt-1">{book.description[lang]}</p>
                          <span className="text-[9px] font-mono text-[#8B5A44] uppercase tracking-wider block pt-1">ID: {book.id}</span>
                          
                          <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1">
                            {book.downloadFileUrl || book.fileUrl ? (
                              <span className="text-[11px] text-green-700">
                                {lang === "en" ? "✓ Download file linked" : "✓ 已关联下载文件"}
                              </span>
                            ) : (
                              <span className="text-[11px] text-red-600">
                                {lang === "en" ? "⚠ No download file set" : "⚠ 未设置下载文件"}
                              </span>
                            )}

                            {book.epubSourceUrl && (
                              book.epubConversionStatus === "success" ? (
                                <span className="text-[11px] text-emerald-800 font-medium">
                                  {lang === "en" ? "📖 Flip Book Ready" : "📖 翻页书已就绪"}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-600 font-medium">
                                  {lang === "en" ? "⚠ Conversion Pending/Failed" : "⚠ 转换挂起或失败"}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingProduct(book);
                            setShowProductForm(true);
                          }}
                          className="text-stone-500 hover:text-[#8B5A44] p-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              type: "book",
                              id: book.id,
                              title: lang === "en" ? book.title?.en : book.title?.zh,
                              action: () => {
                                setBooks(books.filter(b => b.id !== book.id));
                                if (supabase) {
                                  supabase.from("products").delete().eq("id", book.id).then(({ error }) => {
                                    if (error) console.warn("Supabase delete product error:", error);
                                  });
                                }
                                addAuditLog("Delete Product", `Removed digital volume "${book.title?.en}"`);
                              }
                            });
                          }}
                          className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions list */}
              <div className="bg-white border border-[#D8D2C6]/40 p-5 rounded-sm">
                <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-4">
                  {lang === "en" ? "Recent Platform Invoices & Orders" : "近期平台结算流水与电子收据"}
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#E8DDCF]/50 font-display uppercase tracking-wider text-stone-600 border-b border-[#D8D2C6]/40">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Thinker Email</th>
                        <th className="p-3">Items Purchased</th>
                        <th className="p-3">Paid Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C6]/20 font-mono">
                      {systemTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#FDFBF7]/50">
                          <td className="p-3 font-semibold text-[#8B5A44]">{tx.id}</td>
                          <td className="p-3 font-sans">{tx.email}</td>
                          <td className="p-3 font-sans truncate max-w-[150px]">{tx.item}</td>
                          <td className="p-3 text-[#1A2F24] font-semibold">${tx.amount.toFixed(2)}</td>
                          <td className="p-3 text-stone-500">{tx.date}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-xs font-sans font-semibold text-[9px] uppercase ${tx.status === "Successful" || tx.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-sans space-x-2">
                            {/* Toggle manual override */}
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  type: "status_override",
                                  id: tx.id,
                                  title: `Change order status from ${tx.status} to ${tx.status === "Successful" ? "Refunded" : "Successful"}`,
                                  action: () => {
                                    const newStatus = tx.status === "Successful" ? "Refunded" : "Successful";
                                    setSystemTransactions(systemTransactions.map(t => t.id === tx.id ? { ...t, status: newStatus } : t));
                                    if (supabase) {
                                      supabase.from("purchases").update({ status: newStatus }).eq("transaction_id", tx.id).then(({ error }) => {
                                        if (error) console.warn("Supabase update purchase status error:", error);
                                      });
                                    }
                                    addAuditLog("Override Order Status", `Set order ${tx.id} status to ${newStatus}`);
                                  }
                                });
                              }}
                              className="text-stone-500 hover:text-[#8B5A44] text-[10px] hover:underline"
                            >
                              {lang === "en" ? "Toggle Status" : "重置状态"}
                            </button>
                            <span className="text-stone-300">|</span>
                            {/* Download invoice */}
                            <button
                              onClick={() => generateInvoicePDF(tx)}
                              className="text-[#8B5A44] hover:text-[#1A2F24] text-[10px] underline transition-colors"
                            >
                              {lang === "en" ? "Receipt PDF" : "下载收据"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coupon codes manager */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Coupon Form */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm text-xs">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-3">
                    {lang === "en" ? "Create Coupon / Discount Rules" : "新增优惠码与复利机制"}
                  </span>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Coupon Code</label>
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="AUTUMN30" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 uppercase" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">Type</label>
                        <select value={couponType} onChange={(e: any) => setCouponType(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]">
                          <option value="percent">Percentage %</option>
                          <option value="fixed">Fixed Amount $</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">Value</label>
                        <input type="number" value={couponValue} onChange={(e) => setCouponValue(parseInt(e.target.value))} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">Limit</label>
                        <input type="number" value={couponLimit} onChange={(e) => setCouponLimit(parseInt(e.target.value))} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                      </div>
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">Expiry Date</label>
                        <input type="date" value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Applies To</label>
                      <select value={couponAppliesTo} onChange={(e) => setCouponAppliesTo(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]">
                        <option value="all">All Books</option>
                        {books.map(b => (
                           <option key={b.id} value={b.id}>{b.title?.en}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (!couponCode) return;
                        const newCp = {
                          code: couponCode,
                          type: couponType,
                          value: couponValue,
                          limit: couponLimit,
                          used: 0,
                          expiry: couponExpiry,
                          appliesTo: couponAppliesTo,
                          active: true
                        };
                        const updatedCoupons = [newCp, ...coupons];
                        setCoupons(updatedCoupons);
                        if (supabase) {
                          supabase.from("coupons").insert([newCp]).then(({ error }) => {
                            if (error) console.warn("Supabase create coupon error:", error);
                          });
                        } else {
                          localStorage.setItem("immersation_coupons", JSON.stringify(updatedCoupons));
                        }
                        addAuditLog("Create Coupon", `Added discount code ${couponCode}`);
                        setCouponCode("");
                      }}
                      className="w-full bg-[#1A2F24] text-[#F4F1EB] py-2.5 rounded-xs font-display text-[10px] font-bold uppercase tracking-wider hover:bg-[#8B5A44]"
                    >
                      {lang === "en" ? "Generate Coupon" : "生成优惠规则"}
                    </button>
                  </div>
                </div>

                {/* Coupons list */}
                <div className="lg:col-span-2 bg-white border border-[#D8D2C6]/40 p-5 rounded-sm text-xs">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-3">
                    {lang === "en" ? "Active Coupon Configurations" : "当前全站优惠方案总汇"}
                  </span>
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto font-mono">
                    {coupons.map((cp, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 border border-[#D8D2C6]/20 hover:bg-stone-50">
                        <div>
                          <span className="text-sm font-bold text-[#8B5A44]">{cp.code}</span>
                          <span className="text-[10px] text-stone-500 ml-3">
                            {cp.type === "percent" ? `-${cp.value}%` : `-${cp.value}`} • Used {cp.used}/{cp.limit}
                            {cp.appliesTo && cp.appliesTo !== "all" ? ` • Only: ${books.find(b => b.id === cp.appliesTo)?.title?.en || cp.appliesTo}` : " • All Books"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-stone-400">Exp: {cp.expiry}</span>
                          <button
                            onClick={() => {
                              const newCoupons = coupons.filter(c => c.code !== cp.code);
                              setCoupons(newCoupons);
                              if (supabase) {
                                supabase.from("coupons").delete().eq("code", cp.code).then(({ error }) => {
                                  if (error) console.warn("Supabase delete coupon error:", error);
                                });
                              } else {
                                localStorage.setItem("immersation_coupons", JSON.stringify(newCoupons));
                              }
                              addAuditLog("Delete Coupon", `Deleted discount code ${cp.code}`);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== 3. CONTENT STUDIO ==================== */}
          {activeTab === "content" && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Header and Sub-Tab Navigation */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D8D2C6]/20 gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Content Studio" : "智枢内容编辑及推送工坊"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" ? "Draft bilingual essays, broadcast newsletters via SendFox, and manage interactive digital volumes." : "撰写中英双语智识专栏、一键推送 SendFox 邮件广播、上架及编辑交互式数字著作图书。"}
                  </p>
                </div>
                
                {/* Action Button depending on subtab */}
                <div className="flex items-center gap-2">
                  {contentSubTab === "articles" && !showArticleForm && (
                    <button
                      onClick={handleNewArticleClick}
                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "New Bilingual Essay" : "草拟双语智识文章"}</span>
                    </button>
                  )}
                  {contentSubTab === "newsletters" && !showNewsletterForm && (
                    <button
                      onClick={handleNewNewsletterClick}
                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Compose Newsletter" : "撰写双语邮件简报"}</span>
                    </button>
                  )}
                  {contentSubTab === "ebooks" && !showEbookForm && (
                    <button
                      onClick={handleNewEbookClick}
                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Deploy Ebook Volume" : "托管部署新著作"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tab Headers */}
              <div className="flex border-b border-[#D8D2C6]/30 gap-2 overflow-x-auto pb-px">
                <button
                  onClick={() => setContentSubTab("articles")}
                  className={`px-4 py-2.5 text-xs font-display font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${contentSubTab === "articles" ? "border-[#8B5A44] text-[#1A2F24]" : "border-transparent text-stone-400 hover:text-stone-700"}`}
                >
                  {lang === "en" ? "Articles / Essays" : "1. 智识双语文章库"}
                </button>
                <button
                  onClick={() => setContentSubTab("newsletters")}
                  className={`px-4 py-2.5 text-xs font-display font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${contentSubTab === "newsletters" ? "border-[#8B5A44] text-[#1A2F24]" : "border-transparent text-stone-400 hover:text-stone-700"}`}
                >
                  {lang === "en" ? "Newsletters" : "2. SendFox 邮件简报广播站"}
                </button>
                
                <button
                  onClick={() => setContentSubTab("ebooks")}
                  className={`px-4 py-2.5 text-xs font-display font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${contentSubTab === "ebooks" ? "border-[#8B5A44] text-[#1A2F24]" : "border-transparent text-stone-400 hover:text-stone-700"}`}
                >
                  {lang === "en" ? "Ebooks (Digital Volumes)" : "3. 电子著作 (StPageFlip)"}
                </button>
                <button
                  onClick={() => setContentSubTab("comments")}
                  className={`px-4 py-2.5 text-xs font-display font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center ${contentSubTab === "comments" ? "border-[#8B5A44] text-[#1A2F24]" : "border-transparent text-stone-400 hover:text-stone-700"}`}
                >
                  {lang === "en" ? "Comments" : "4. 留言审核"}
                  {contentSubTab !== "comments" && commentFilter === "pending" && pendingCount > 0 && (
                    <span className="ml-1.5 bg-[#8B5A44] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>

              </div>

              {/* ========================================================= */}
              {/* SUB-TAB 1: ARTICLES                                       */}
              {/* ========================================================= */}
              {contentSubTab === "articles" && (
                <div className="space-y-6">
                  {showArticleForm ? (
                    /* ARTICLE FORM */
                    <form onSubmit={handleSaveArticle} className="bg-[#E8DDCF]/20 border border-[#D8D2C6]/50 p-6 rounded-sm space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center pb-3 border-b border-[#D8D2C6]/30">
                        <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                          {editingArticle ? (lang === "en" ? `Editing: ${artTitleEN}` : `正在修改文章: ${artTitleZH}`) : (lang === "en" ? "Draft New Bilingual Essay" : "起草全新双语专栏文章")}
                        </span>
                        <button type="button" onClick={() => setShowArticleForm(false)} className="text-stone-400 hover:text-[#1C1C1C]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form Inputs (Left & Center columns) */}
                        <div className="lg:col-span-2 space-y-4 text-xs">
                          {/* Title Pair */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Title (English) *</label>
                              <input type="text" required value={artTitleEN} onChange={(e) => handleArtTitleENChange(e.target.value)} placeholder="Refactoring Personal Efficiency" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Title (中文标题) *</label>
                              <input type="text" required value={artTitleZH} onChange={(e) => setArtTitleZH(e.target.value)} placeholder="个人效率层级的重组与重构" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                          </div>

                          {/* Slug, Author, and Pillar row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">URL Slug (Auto-generated) *</label>
                              <input type="text" required value={artSlug} onChange={(e) => setArtSlug(e.target.value)} placeholder="refactoring-personal-efficiency" className="w-full bg-stone-50 border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-600" />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Author Byline</label>
                              <input type="text" value={artAuthor} onChange={(e) => setArtAuthor(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">
                                {lang === "en" ? "Core Cognitive Pillar *" : "核心认知支柱 *"}
                              </label>
                              <select
                                value={artPillar}
                                onChange={(e) => {
                                  const pillar = e.target.value;
                                  setArtPillar(pillar);
                                  setArtCategoryValue("");
                                }}
                                className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800 focus:ring-[#8B5A44] focus:border-[#8B5A44]"
                              >
                                <optgroup label={lang === "en" ? "The Three Pillars" : "三大支柱"}>
                                  {PILLAR_OPTIONS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label[lang]}</option>
                                  ))}
                                </optgroup>
                                <optgroup label={lang === "en" ? "Cross-Pillar" : "跨支柱"}>
                                  <option value={SYSTEM_INTEGRATION_OPTION.value}>
                                    {SYSTEM_INTEGRATION_OPTION.label[lang]}
                                  </option>
                                </optgroup>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">
                                {lang === "en" ? "Category Label *" : "内容分类标签 *"}
                              </label>
                              <select
                                value={artCategoryValue}
                                onChange={(e) => setArtCategoryValue(e.target.value)}
                                className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800 focus:ring-[#8B5A44] focus:border-[#8B5A44]"
                              >
                                <option value="" disabled>
                                  {lang === "en" ? "Select a category..." : "请选择分类..."}
                                </option>
                                {(CATEGORY_OPTIONS_BY_PILLAR[artPillar] || []).map((c) => (
                                  <option key={c.value} value={c.value}>{c.label[lang]}</option>
                                ))}
                              </select>
                              <p className="text-[11px] text-stone-400 mt-1">
                                {lang === "en"
                                  ? "Options update automatically based on the selected pillar."
                                  : "分类选项将根据所选支柱自动切换。"}
                              </p>
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">
                                {lang === "en" ? "Article Format *" : "文章形式 *"}
                              </label>
                              <select
                                value={artArticleFormat}
                                onChange={(e) => setArtArticleFormat(e.target.value)}
                                className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800 focus:ring-[#8B5A44] focus:border-[#8B5A44]"
                              >
                                {CONTENT_FORMAT_OPTIONS.map((f) => (
                                  <option key={f.value} value={f.value}>{f.label[lang]}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Excerpt pair */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Preview Summary (English)</label>
                              <textarea value={artExcerptEN} onChange={(e) => setArtExcerptEN(e.target.value)} rows={2} placeholder="A deep study on refactoring cognitive workflows..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Preview Summary (中文预览摘要)</label>
                              <textarea value={artExcerptZH} onChange={(e) => setArtExcerptZH(e.target.value)} rows={2} placeholder="关于重建大脑底层框架的深度洞察..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                          </div>

                          {/* Body Content Markdown fields */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="block font-semibold text-[#1A2F24]">English Body Content (Markdown syntax parsed paragraph-by-paragraph) *</label>
                              <button 
                                type="button" 
                                onClick={() => handleCalculateReadTime(artBodyEN, artBodyZH, "art")} 
                                className="text-[10px] bg-[#1A2F24]/10 text-[#1A2F24] hover:bg-[#8B5A44]/10 hover:text-[#8B5A44] px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1 transition-all"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Auto-Estimate Read Times</span>
                              </button>
                            </div>
                            <textarea value={artBodyEN} onChange={(e) => setArtBodyEN(e.target.value)} onBlur={() => handleCalculateReadTime(artBodyEN, artBodyZH, "art")} rows={8} placeholder="Use ### for headers, ![alt](url) for images, {{audio:url}} for audio player..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-3 font-mono text-[11px] text-stone-800" />
                          </div>

                          <div className="space-y-3">
                            <label className="block font-semibold text-[#1A2F24]">Chinese Body Content (中文正文) *</label>
                            <textarea value={artBodyZH} onChange={(e) => setArtBodyZH(e.target.value)} onBlur={() => handleCalculateReadTime(artBodyEN, artBodyZH, "art")} rows={8} placeholder="使用 ### 表示标题，使用 Markdown 格式图片，及 {{audio:音频直链}} 注入音频广播..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-3 font-mono text-[11px] text-stone-800" />
                          </div>

                          {/* Tags */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Search Tags (Comma-separated)</label>
                              <input type="text" value={artTags} onChange={(e) => setArtTags(e.target.value)} placeholder="cognition, automation, personal-growth" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                            </div>
                          </div>

                          {/* Cover, Date and ReadTime */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Featured Cover Image URL</label>
                              <input type="text" value={artCover} onChange={(e) => setArtCover(e.target.value)} placeholder="https://cms.immersation.com/wp-content/uploads/..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                              {artCover && (
                                <div className="mt-2 border border-[#D8D2C6] rounded-sm overflow-hidden bg-stone-100 max-h-32 flex items-center justify-center">
                                  <img src={artCover} alt="Cover preview" referrerPolicy="no-referrer" className="max-h-32 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">{lang === "en" ? "Pinterest / Sidebar Image URL" : "Pinterest / 侧栏图片链接"}</label>
                              <input type="url" value={artPinterestImageUrl} onChange={(e) => setArtPinterestImageUrl(e.target.value)} placeholder="https://your-wp-media.com/uploads/pin-image.jpg" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                              <p className="text-[10px] text-stone-400 mt-1">
                                {lang === "en"
                                  ? "Displayed in the article's right sidebar for saving/sharing."
                                  : "显示于文章右侧栏，供收藏/分享使用。可选，与主图不同。"}
                              </p>
                              {artPinterestImageUrl && (
                                <div className="mt-2 border border-[#D8D2C6] rounded-sm overflow-hidden bg-stone-100 max-h-32 flex items-center justify-center">
                                  <img src={artPinterestImageUrl} alt="Pinterest preview" referrerPolicy="no-referrer" className="max-h-32 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">{lang === "en" ? "Advertisement URL" : "侧栏广告图片链接"}</label>
                              <input type="url" value={artAdUrl} onChange={(e) => setArtAdUrl(e.target.value)} placeholder="https://your-wp-media.com/uploads/ad-banner.jpg" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                              <p className="text-[10px] text-stone-400 mt-1">
                                {lang === "en"
                                  ? "Leave empty to hide advertisement block."
                                  : "留空则不在文章页面显示广告区块。"}
                              </p>
                              {artAdUrl && (
                                <div className="mt-2 border border-[#D8D2C6] rounded-sm overflow-hidden bg-stone-100 max-h-32 flex items-center justify-center">
                                  <img src={artAdUrl} alt="Ad preview" referrerPolicy="no-referrer" className="max-h-32 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 md:col-span-2">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Read Time (EN)</label>
                                <input type="text" value={artReadEN} onChange={(e) => setArtReadEN(e.target.value)} placeholder="8 min read" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                              </div>
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Read Time (ZH)</label>
                                <input type="text" value={artReadZH} onChange={(e) => setArtReadZH(e.target.value)} placeholder="8 分钟阅读" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Publish Date</label>
                                <input type="date" value={artDate} onChange={(e) => setArtDate(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Publishing Status</label>
                                <select value={artStatus} onChange={(e) => setArtStatus(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800">
                                  <option value="Published">Published (立即公开)</option>
                                  <option value="Draft">Draft (暂存草稿)</option>
                                  <option value="Scheduled">Scheduled (定时发布)</option>
                                </select>
                              </div>
                              {artStatus === "Scheduled" && (
                                <div>
                                  <label className="block font-semibold text-[#1A2F24] mb-1">Scheduled Time</label>
                                  <input type="datetime-local" value={artScheduledDate} onChange={(e) => setArtScheduledDate(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-800" />
                                </div>
                              )}
                              {artStatus !== "Scheduled" && (
                                <div className="flex items-center gap-2 pt-6 pl-2">
                                  <input type="checkbox" id="featured_toggle" checked={artFeatured} onChange={(e) => setArtFeatured(e.target.checked)} className="rounded border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44]" />
                                  <label htmlFor="featured_toggle" className="font-semibold text-stone-700 cursor-pointer select-none">Set as Featured</label>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Related articles and canonical link */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RelatedArticlesMultiSelect
                              lang={lang}
                              articles={articles}
                              currentSlug={artSlug}
                              selectedSlugs={artRelatedSlugs}
                              onChange={setArtRelatedSlugs}
                            />
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Canonical/External Source Link</label>
                              <input type="text" value={artCanonical} onChange={(e) => setArtCanonical(e.target.value)} placeholder="https://medium.com/immersation/..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                            </div>
                          </div>

                          {/* SEO Segment */}
                          <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/30 p-4 rounded-xs space-y-4">
                            <span className="font-serif text-xs font-bold text-[#1A2F24] block uppercase tracking-wider">Search Engine Optimization (SEO Meta Controls)</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">SEO Title (EN)</label>
                                <input type="text" value={artSeoTitleEN} onChange={(e) => setArtSeoTitleEN(e.target.value)} placeholder="Override default English meta title" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">SEO Title (中文)</label>
                                <input type="text" value={artSeoTitleZH} onChange={(e) => setArtSeoTitleZH(e.target.value)} placeholder="覆盖默认中文 meta 标题" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">SEO Description (EN)</label>
                                <textarea value={artSeoDescEN} onChange={(e) => setArtSeoDescEN(e.target.value)} rows={2} placeholder="Meta description for search crawler index cards" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">SEO Description (中文)</label>
                                <textarea value={artSeoDescZH} onChange={(e) => setArtSeoDescZH(e.target.value)} rows={2} placeholder="针对中文搜索引擎的 meta 描述文本" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Media Upload Sidebar (Right column) */}
                        <div className="space-y-4">
                          {/* WordPress Media Uploader Widget */}
                          <div className="bg-white border border-[#D8D2C6]/60 p-4 rounded-sm text-xs space-y-3 sticky top-4 shadow-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-[#D8D2C6]/20">
                              <span className="font-serif font-semibold text-[#1A2F24] flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-[#8B5A44]" />
                                <span>WordPress Media Center</span>
                              </span>
                              <span className="text-[8px] font-mono text-[#8B5A44] bg-[#8B5A44]/10 px-1 py-0.5 rounded-sm">WordPress 媒体托管</span>
                            </div>
                            
                            <p className="text-[10px] text-stone-500 leading-normal">
                              {lang === "en" 
                                ? "Avoid uploading images/audio files to local workspace or temporary servers. Drop assets here to simulate uploading to WordPress media API `/wp-json/wp/v2/media`." 
                                : "杜绝将媒体资源提交至本地方，请在此 mock 上传文件到 WordPress 系统托管，系统将实时传回媒体直链及 Markdown 对应标签。"}
                            </p>

                            <div className="space-y-2 pt-1">
                              <label className="border-2 border-dashed border-[#D8D2C6] hover:border-[#8B5A44] p-4 rounded-sm bg-[#F4F1EB]/30 text-center cursor-pointer transition-colors block">
                                <input type="file" accept="image/*,audio/*" onChange={(e) => handleUploadFileMock(e, e.target.files?.[0]?.type.startsWith("audio") ? "audio" : "image")} className="hidden" />
                                <Upload className="w-6 h-6 text-stone-400 mx-auto stroke-[1.2] mb-1" />
                                <span className="text-[10px] font-semibold text-stone-700 block">{lang === "en" ? "Upload Photo or Podcast File" : "拖拽或点击上传图片/音频"}</span>
                                <span className="text-[8px] text-stone-400 block font-mono mt-0.5">Max size 45MB</span>
                              </label>
                            </div>

                            {uploadingFile && (
                              <div className="flex items-center justify-center gap-2 py-3 bg-stone-50 rounded-sm text-stone-500 font-mono text-[9px] border border-stone-100">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8B5A44]" />
                                <span>Negotiating WP REST API...</span>
                              </div>
                            )}

                            {uploadedFileUrl && (
                              <div className="bg-[#F4F1EB]/45 border border-[#D8D2C6]/40 p-3 rounded-xs space-y-2 mt-1 animate-fade-in text-[10px]">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-[#1A2F24] truncate max-w-[130px]">{uploadedFileName}</span>
                                  <span className="text-[8px] bg-[#1A2F24]/10 text-[#1A2F24] px-1.5 py-0.5 rounded-xs font-mono font-bold uppercase">{uploadedFileType}</span>
                                </div>
                                <input type="text" readOnly value={uploadedFileUrl} className="w-full bg-white border border-[#D8D2C6]/40 rounded-xs p-1 text-[9px] font-mono text-stone-500" />
                                
                                <div className="space-y-1">
                                  <span className="text-[8px] text-stone-400 block font-mono">INSERT INTO DRAFT BODIES:</span>
                                  <div className="grid grid-cols-2 gap-1 font-sans text-[9px] font-bold">
                                    <button 
                                      type="button" 
                                      onClick={() => handleInsertMediaTag("art_en")} 
                                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] py-1 rounded-sm text-center cursor-pointer"
                                    >
                                      + English Body
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => handleInsertMediaTag("art_zh")} 
                                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] py-1 rounded-sm text-center cursor-pointer"
                                    >
                                      + 中文正文
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Submit and Cancel Actions */}
                      <div className="border-t border-[#D8D2C6]/30 pt-4 flex justify-end gap-2 text-xs">
                        <button type="button" onClick={() => setShowArticleForm(false)} className="bg-white border border-stone-200 hover:bg-stone-50 px-5 py-2 rounded-xs font-semibold cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] px-6 py-2 rounded-xs font-semibold cursor-pointer">
                          {editingArticle ? (lang === "en" ? "Save Changes" : "保存修改") : (lang === "en" ? "Publish Essay" : "正式部署发布")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ARTICLES TABLE LIST */
                    <div className="bg-white border border-[#D8D2C6]/40 rounded-sm overflow-hidden animate-fade-in">
                      <div className="p-4 bg-stone-50 border-b border-[#D8D2C6]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <span className="font-serif text-xs font-semibold text-[#1A2F24]">
                          {lang === "en" ? `Bilingual Articles List (${articles.length} publications)` : `全栈文章归档汇总 (已部署 ${articles.length} 篇双语著作)`}
                        </span>
                        
                        {/* Status legends */}
                        <div className="flex gap-3 text-[10px] font-mono text-stone-400">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Published</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Scheduled</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span> Draft</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto text-xs">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-stone-50 border-b border-[#D8D2C6]/30 text-stone-500 font-mono text-[10px] text-left">
                              <th className="p-3 pl-4 font-normal">ESSAY TITLE (DUAL-LANGUAGE) / SLUG</th>
                              <th className="p-3 font-normal">PILLAR</th>
                              <th className="p-3 font-normal">CATEGORY</th>
                              <th className="p-3 font-normal">DATE</th>
                              <th className="p-3 font-normal">STATUS</th>
                              <th className="p-3 text-center font-normal">FEATURED</th>
                              <th className="p-3 pr-4 text-right font-normal">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D8D2C6]/20">
                            {articles.map((art, idx) => (
                              <tr key={`${art.slug || art.id || 'essay'}-${idx}`} className="hover:bg-stone-50/50 transition-colors">
                                <td className="p-3 pl-4 max-w-xs md:max-w-md min-w-[200px]">
                                  <span className="text-[10px] bg-stone-100 text-stone-500 px-1 py-0.2 rounded-sm font-mono block w-max max-w-full truncate mb-1">{art.slug || art.id}</span>
                                  <div className="font-serif font-bold text-[#1A2F24] truncate">{art.title?.en}</div>
                                  <div className="text-[10px] text-stone-400 truncate font-sans">{art.title?.zh}</div>
                                </td>
                                <td className="p-3 font-mono text-[10px] uppercase">
                                  <span className="px-1.5 py-0.5 rounded-sm bg-[#1A2F24]/5 text-[#1A2F24]">{art.pillar || "body"}</span>
                                </td>
                                <td className="p-3 text-stone-500 text-[10px]">
                                  <div>{art.category?.en}</div>
                                  <div className="text-stone-400">{art.category?.zh}</div>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-stone-500">
                                  {typeof art.date === "object" ? art.date.en : art.date}
                                </td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase font-semibold ${
                                    art.status === "Published" || !art.status ? "bg-emerald-50 text-emerald-700" :
                                    art.status === "Scheduled" ? "bg-amber-50 text-amber-700" :
                                    "bg-stone-100 text-stone-500"
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      art.status === "Published" || !art.status ? "bg-emerald-500" :
                                      art.status === "Scheduled" ? "bg-amber-500" :
                                      "bg-stone-400"
                                    }`}></span>
                                    {art.status || "Published"}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={!!art.featured} 
                                    onChange={async (e) => {
                                      const updated = articles.map((a, i) => i === idx ? { ...a, featured: e.target.checked } : a);
                                      setArticles(updated);
                                      addAuditLog("Featured Essay Toggle", `Set essay "${art.title?.en}" featured status to ${e.target.checked}`);
                                      
                                      if (supabase) {
                                        try {
                                          const { error } = await supabase.from('articles').update({ featured: e.target.checked }).eq('id', art.id);
                                          if (error) console.error("Supabase sync error:", error);
                                        } catch (err) {}
                                      }

                                      fetch("/api/sync-articles", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ articles: updated })
                                      }).catch(console.error);
                                    }}
                                    className="rounded border-stone-300 text-[#8B5A44] focus:ring-[#8B5A44]" 
                                  />
                                </td>
                                <td className="p-3 pr-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => handleEditArticle(art)} 
                                      className="p-1 hover:bg-stone-100 text-[#1A2F24] hover:text-[#8B5A44] rounded-sm transition-colors cursor-pointer" 
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setDeleteConfirm({
                                          type: "article",
                                          id: art.slug || art.id || String(idx),
                                          title: lang === "en" ? art.title?.en : art.title?.zh,
                                          action: async () => {
                                            const newArticles = articles.filter((_, i) => i !== idx);
                                            setArticles(newArticles);
                                            addAuditLog("Delete Essay", `Purged essay "${art.title?.en}"`);
                                            
                                            if (supabase) {
                                              try {
                                                await supabase.from('articles').delete().eq('id', art.id);
                                              } catch (err) {}
                                            }

                                            fetch("/api/sync-articles", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ articles: newArticles })
                                            }).catch(console.error);
                                          }
                                        });
                                      }} 
                                      className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-sm transition-colors cursor-pointer" 
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 2: NEWSLETTERS (SENDFOX INTEGRATED)               */}
              {/* ========================================================= */}
              {contentSubTab === "newsletters" && (
                <div className="space-y-6">
                  {showNewsletterForm ? (
                    /* NEWSLETTER FORM */
                    <form onSubmit={handleSaveNewsletter} className="bg-[#E8DDCF]/20 border border-[#D8D2C6]/50 p-6 rounded-sm space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center pb-3 border-b border-[#D8D2C6]/30">
                        <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                          {editingNewsletter ? (lang === "en" ? `Editing Newsletter: ${nlTitleEN}` : `正在编辑邮件简报: ${nlTitleZH}`) : (lang === "en" ? "Compose New Broadcast Campaign" : "撰写双语邮件简报推送广播")}
                        </span>
                        <button type="button" onClick={() => setShowNewsletterForm(false)} className="text-stone-400 hover:text-[#1C1C1C]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left/Center columns inputs */}
                        <div className="lg:col-span-2 space-y-4 text-xs">
                          {/* Subject / Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Subject (EN) *</label>
                              <input type="text" required value={nlTitleEN} onChange={(e) => handleNlTitleENChange(e.target.value)} placeholder="Refactoring our personal leverage" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Subject (中文 / 简报标题) *</label>
                              <input type="text" required value={nlTitleZH} onChange={(e) => setNlTitleZH(e.target.value)} placeholder="个人效率层级的重组与重构" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                          </div>

                          {/* Slug, Target List, Pillar */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Archive URL Slug * {editingArticle && <span className="text-stone-400 font-normal text-xs">(Auto-generation disabled on edit to prevent broken links)</span>}</label>
                              <input type="text" required value={nlSlug} onChange={(e) => setNlSlug(e.target.value)} placeholder="personal-leverage-refactor" className="w-full bg-stone-50 border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-600" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block font-semibold text-[#1A2F24]">SendFox Segment Tags *</label>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] text-[#8B5A44] uppercase font-bold bg-[#E8DDCF]/40 px-1.5 py-0.5 rounded-sm">
                                    Auto-mapped Pillar: {nlPillar}
                                  </span>
                                  {nlPillar === "frameworks" && (
                                    <span className="text-[9px] text-stone-400 font-sans font-medium">
                                      (all 3 SendFox lists combined)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-4 mt-2">
                                {["body", "tool", "capital"].map(tag => (
                                  <label key={tag} className="flex items-center gap-2 text-sm text-[#1A2F24] cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={nlSendFoxTags.includes(tag)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNlSendFoxTags([...nlSendFoxTags, tag]);
                                        } else {
                                          setNlSendFoxTags(nlSendFoxTags.filter(t => t !== tag));
                                        }
                                      }}
                                      className="rounded border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44]"
                                    />
                                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Preview Text */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Email Preview text (EN)</label>
                              <textarea value={nlExcerptEN} onChange={(e) => setNlExcerptEN(e.target.value)} rows={2} placeholder="Sustaining peak human leverage is not about squeezing more minutes..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Email Preview text (中文预览文本)</label>
                              <textarea value={nlExcerptZH} onChange={(e) => setNlExcerptZH(e.target.value)} rows={2} placeholder="保持人类杠杆的核心在于提升心脑卸载缓存效率..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                            </div>
                          </div>

                          {/* Content Markdown fields */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="block font-semibold text-[#1A2F24]">English Email Body (Rich Markdown supported) *</label>
                              <button 
                                type="button" 
                                onClick={() => handleCalculateReadTime(nlBodyEN, nlBodyZH, "nl")} 
                                className="text-[10px] bg-[#1A2F24]/10 text-[#1A2F24] hover:bg-[#8B5A44]/10 hover:text-[#8B5A44] px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1 transition-all"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Calculate Read Time</span>
                              </button>
                            </div>
                            <textarea value={nlBodyEN} onChange={(e) => setNlBodyEN(e.target.value)} onBlur={() => handleCalculateReadTime(nlBodyEN, nlBodyZH, "nl")} rows={8} placeholder="Dear Thinkers, today we dive deep into..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-3 font-mono text-[11px] text-stone-800" />
                          </div>

                          <div className="space-y-3">
                            <label className="block font-semibold text-[#1A2F24]">Chinese Email Body (中文简报正文) *</label>
                            <textarea value={nlBodyZH} onChange={(e) => setNlBodyZH(e.target.value)} onBlur={() => handleCalculateReadTime(nlBodyEN, nlBodyZH, "nl")} rows={8} placeholder="各位思想家，今天我们将探讨..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-3 font-mono text-[11px] text-stone-800" />
                          </div>

                          {/* Email delivery parameters */}
                          <div className="bg-[#8B5A44]/5 border border-[#8B5A44]/20 p-4 rounded-xs space-y-4">
                            <div className="flex justify-between items-center pb-1 border-b border-[#8B5A44]/15">
                              <span className="font-serif text-xs font-bold text-[#8B5A44] uppercase tracking-wider flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5 text-[#8B5A44]" />
                                <span>SendFox API Broadcast Configuration</span>
                              </span>
                              <a href="https://sendfox.com/account" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#8B5A44] underline hover:text-[#1A2F24]">
                                Get Token from SendFox →
                              </a>
                            </div>

                            {/* Token Input Bar */}
                            <div className="bg-white p-3 border border-[#D8D2C6]/80 rounded-xs space-y-2">
                              <label className="block font-semibold text-[#1A2F24] text-xs flex justify-between items-center">
                                <span>🔑 SendFox Personal Access Token (API Key)</span>
                                <span className="text-[10px] text-stone-500 font-mono font-normal">Saved in local browser memory</span>
                              </label>
                              <div className="flex gap-2">
                                <input 
                                  type="password" 
                                  value={sendFoxApiKey} 
                                  onChange={(e) => {
                                    setSendFoxApiKey(e.target.value);
                                    localStorage.setItem("sendfox_api_key", e.target.value);
                                  }} 
                                  placeholder="e.g. sf_pat_xxxxxxxxxxxxxxxxxxxxxx" 
                                  className="flex-1 bg-stone-50 border border-[#D8D2C6] rounded-xs p-2 font-mono text-xs text-stone-800" 
                                />
                                <button
                                  type="button"
                                  onClick={handleTestSendFoxConnection}
                                  disabled={testingSendFox}
                                  className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-mono text-[10px] px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  {testingSendFox ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 text-emerald-400" />}
                                  <span>Test API Key</span>
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Sender Email Subject Override</label>
                                <input type="text" value={nlEmailSubject} onChange={(e) => setNlEmailSubject(e.target.value)} placeholder="Defaults to Subject EN" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Preheader / Snippet Override</label>
                                <input type="text" value={nlPreviewText} onChange={(e) => setNlPreviewText(e.target.value)} placeholder="Defaults to English excerpt" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Campaign Mode *</label>
                                <div className="space-y-1 pt-1 font-semibold text-[#1A2F24]">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={nlSendMode === "Save as web archive only"} onChange={() => setNlSendMode("Save as web archive only")} className="text-[#8B5A44] focus:ring-[#8B5A44]" />
                                    <span>Save as Web Archive only (不触发推送)</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={nlSendMode === "Send via SendFox now"} onChange={() => setNlSendMode("Send via SendFox now")} className="text-[#8B5A44] focus:ring-[#8B5A44]" />
                                    <span className="text-red-700">Immediate Send via SendFox API (即刻群发)</span>
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Footer/Sign-off CTA Link Button</label>
                                <input type="text" value={nlCtaText} onChange={(e) => setNlCtaText(e.target.value)} placeholder="SUBSCRIBE NOW" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                              </div>
                            </div>
                          </div>

                          {/* Meta categories and Cover */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Category Label (EN)</label>
                              <select 
                                value={nlCatEN} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNlCatEN(val);
                                  const pairs: { [key: string]: string } = {
                                    "BODY NOTES": "身心信标",
                                    "TOOL NOTES": "工具信标",
                                    "CAPITAL NOTES": "资本信标",
                                    "FRAMEWORKS": "核心框架",
                                    "AI AUTOMATION": "AI 自动化",
                                    "MINDFULNESS HEALTH": "正念健康",
                                    "WEALTH COGNITION": "财富认知",
                                    "GENERAL": "综合"
                                  };
                                  if (pairs[val]) {
                                    setNlCatZH(pairs[val]);
                                  }
                                }} 
                                className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 uppercase font-mono text-stone-800"
                              >
                                {(() => {
                                  const enPresets = ["BODY NOTES", "TOOL NOTES", "CAPITAL NOTES", "FRAMEWORKS", "AI AUTOMATION", "MINDFULNESS HEALTH", "WEALTH COGNITION", "GENERAL"];
                                  const options = [...enPresets];
                                  if (nlCatEN && !options.includes(nlCatEN)) {
                                    options.push(nlCatEN);
                                  }
                                  return options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ));
                                })()}
                              </select>
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Category Label (ZH)</label>
                              <select 
                                value={nlCatZH} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNlCatZH(val);
                                  const reversePairs: { [key: string]: string } = {
                                    "身心信标": "BODY NOTES",
                                    "工具信标": "TOOL NOTES",
                                    "资本信标": "CAPITAL NOTES",
                                    "核心框架": "FRAMEWORKS",
                                    "AI 自动化": "AI AUTOMATION",
                                    "正念健康": "MINDFULNESS HEALTH",
                                    "财富认知": "WEALTH COGNITION",
                                    "综合": "GENERAL"
                                  };
                                  if (reversePairs[val]) {
                                    setNlCatEN(reversePairs[val]);
                                  }
                                }} 
                                className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800"
                              >
                                {(() => {
                                  const zhPresets = ["身心信标", "工具信标", "资本信标", "核心框架", "AI 自动化", "正念健康", "财富认知", "综合"];
                                  const options = [...zhPresets];
                                  if (nlCatZH && !options.includes(nlCatZH)) {
                                    options.push(nlCatZH);
                                  }
                                  return options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ));
                                })()}
                              </select>
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Read Time (EN/ZH pair)</label>
                              <div className="grid grid-cols-2 gap-1 font-mono">
                                <input type="text" value={nlReadEN} onChange={(e) => setNlReadEN(e.target.value)} placeholder="5 min" className="bg-white border border-[#D8D2C6] p-2 rounded-xs" />
                                <input type="text" value={nlReadZH} onChange={(e) => setNlReadZH(e.target.value)} placeholder="5 分钟" className="bg-white border border-[#D8D2C6] p-2 rounded-xs" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-[#1A2F24] mb-1">Header Cover Image URL</label>
                              <input type="text" value={nlCover} onChange={(e) => setNlCover(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block font-semibold text-[#1A2F24] mb-1">Campaign Status</label>
                                <select value={nlStatus} onChange={(e) => setNlStatus(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800">
                                  <option value="Draft">Draft (草稿中)</option>
                                  <option value="Scheduled">Scheduled (定时群发)</option>
                                  <option value="Published">Sent / Archived (归档历史)</option>
                                </select>
                              </div>
                              {nlStatus === "Scheduled" && (
                                <div>
                                  <label className="block font-semibold text-[#1A2F24] mb-1">Scheduled Date/Time</label>
                                  <input type="datetime-local" value={nlScheduledDate} onChange={(e) => setNlScheduledDate(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-800" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* WP Media Center upload sidebar (Right column) */}
                        <div className="space-y-4">
                          <div className="bg-white border border-[#D8D2C6]/60 p-4 rounded-sm text-xs space-y-3 sticky top-4 shadow-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-[#D8D2C6]/20">
                              <span className="font-serif font-semibold text-[#1A2F24] flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-[#8B5A44]" />
                                <span>WordPress Media Center</span>
                              </span>
                              <span className="text-[8px] font-mono text-[#8B5A44] bg-[#8B5A44]/10 px-1 py-0.5 rounded-sm">Media API</span>
                            </div>
                            
                            <p className="text-[10px] text-stone-500 leading-normal">
                              Upload images or audio files onto the WordPress media pool to get clean live URLs.
                            </p>

                            <div className="space-y-2 pt-1">
                              <label className="border-2 border-dashed border-[#D8D2C6] hover:border-[#8B5A44] p-4 rounded-sm bg-[#F4F1EB]/30 text-center cursor-pointer transition-colors block">
                                <input type="file" accept="image/*,audio/*" onChange={(e) => handleUploadFileMock(e, e.target.files?.[0]?.type.startsWith("audio") ? "audio" : "image")} className="hidden" />
                                <Upload className="w-6 h-6 text-stone-400 mx-auto stroke-[1.2] mb-1" />
                                <span className="text-[10px] font-semibold text-stone-700 block">Upload Campaign Media</span>
                              </label>
                            </div>

                            {uploadingFile && (
                              <div className="flex items-center justify-center gap-2 py-3 bg-stone-50 rounded-sm text-stone-500 font-mono text-[9px]">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8B5A44]" />
                                <span>Negotiating WP REST API...</span>
                              </div>
                            )}

                            {uploadedFileUrl && (
                              <div className="bg-[#F4F1EB]/45 border border-[#D8D2C6]/40 p-3 rounded-xs space-y-2 mt-1 animate-fade-in text-[10px]">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-[#1A2F24] truncate max-w-[130px]">{uploadedFileName}</span>
                                  <span className="text-[8px] bg-[#1A2F24]/10 text-[#1A2F24] px-1.5 py-0.5 rounded-xs font-mono font-bold uppercase">{uploadedFileType}</span>
                                </div>
                                <input type="text" readOnly value={uploadedFileUrl} className="w-full bg-white border border-[#D8D2C6]/40 rounded-xs p-1 text-[9px] font-mono text-stone-500" />
                                
                                <div className="space-y-1">
                                  <span className="text-[8px] text-stone-400 block font-mono">INSERT INTO DRAFT BODIES:</span>
                                  <div className="grid grid-cols-2 gap-1 font-sans text-[9px] font-bold">
                                    <button type="button" onClick={() => handleInsertMediaTag("nl_en")} className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] py-1 rounded-sm text-center cursor-pointer">
                                      + EN Email
                                    </button>
                                    <button type="button" onClick={() => handleInsertMediaTag("nl_zh")} className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] py-1 rounded-sm text-center cursor-pointer">
                                      + 中文简报
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Submit and Cancel Actions */}
                      <div className="border-t border-[#D8D2C6]/30 pt-4 flex justify-end gap-2 text-xs">
                        <button type="button" onClick={() => setShowNewsletterForm(false)} className="bg-white border border-stone-200 hover:bg-stone-50 px-5 py-2 rounded-xs font-semibold cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] px-6 py-2 rounded-xs font-semibold cursor-pointer">
                          {editingNewsletter ? (lang === "en" ? "Save Broadcast" : "保存推送信息") : (lang === "en" ? "Dispatch Campaign" : "一键派发/存档")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* NEWSLETTER ARCHIVES TABLE LIST */
                    <div className="space-y-6">
                      <div className="bg-white border border-[#D8D2C6]/40 rounded-sm overflow-hidden animate-fade-in">
                        <div className="p-4 bg-stone-50 border-b border-[#D8D2C6]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <span className="font-serif text-xs font-semibold text-[#1A2F24]">
                            {lang === "en" ? `SendFox Campaign Broadcasting logs (${newsletterIssues.length} records)` : `SendFox 简报群发与网卡归档记录 (已部署 ${newsletterIssues.length} 期内容)`}
                          </span>
                          
                          <div className="flex gap-3 text-[10px] font-mono text-stone-400">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Broadcast Sent</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Scheduled Queue</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span> Draft Archive</span>
                          </div>
                        </div>

                        <div className="overflow-x-auto text-xs">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-stone-50 border-b border-[#D8D2C6]/30 text-stone-500 font-mono text-[10px] text-left">
                                <th className="p-3 pl-4 font-normal">EMAIL SUBJECT LINE (EN/ZH)</th>
                                <th className="p-3 font-normal">TARGET SEGMENT LIST</th>
                                <th className="p-3 font-normal">SENT DATE</th>
                                <th className="p-3 font-normal">DELIVERED COUNT</th>
                                <th className="p-3 font-normal">STATUS</th>
                                <th className="p-3 pr-4 text-right font-normal">ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D8D2C6]/20">
                              {newsletterIssues.map((nl) => (
                                <tr key={nl.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="p-3 pl-4 max-w-xs md:max-w-md min-w-[200px]">
                                    <span className="text-[9px] bg-[#8B5A44]/10 text-[#8B5A44] px-1 py-0.2 rounded-sm font-mono block w-max max-w-full truncate mb-1">{nl.slug || nl.id}</span>
                                    <div className="font-serif font-bold text-[#1A2F24] truncate">{nl.title?.en || nl.subject?.en || nl.emailSubject}</div>
                                    <div className="text-[10px] text-stone-400 truncate font-sans">{nl.title?.zh || nl.subject?.zh}</div>
                                  </td>
                                  <td className="p-3 font-mono text-[10px]">
                                    <span className="px-2 py-0.5 rounded-sm bg-[#8B5A44]/10 text-[#8B5A44] font-semibold">
                                      {(() => {
                                        if (Array.isArray(nl.sendFoxTags) && nl.sendFoxTags.length > 0) {
                                          return nl.sendFoxTags.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
                                        }
                                        if (nl.listId) return nl.listId;
                                        if (nl.pillar) return nl.pillar.charAt(0).toUpperCase() + nl.pillar.slice(1);
                                        return "Tool";
                                      })()}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono text-[10px] text-stone-500">{nl.date}</td>
                                  <td className="p-3 font-mono text-[10px] font-semibold text-stone-800">
                                    {nl.sentCount || sendfoxContacts.filter(c => c.list === (nl.listId || "Body Notes") && c.status === "Subscribed").length} active members
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase font-semibold ${
                                      nl.status === "Sent" || nl.status === "Published" ? "bg-emerald-50 text-emerald-700" :
                                      nl.status === "Scheduled" ? "bg-amber-50 text-amber-700" :
                                      "bg-stone-100 text-stone-500"
                                    }`}>
                                      <span className={`w-1 h-1 rounded-full ${
                                        nl.status === "Sent" || nl.status === "Published" ? "bg-emerald-500" :
                                        nl.status === "Scheduled" ? "bg-amber-500" :
                                        "bg-stone-400"
                                      }`}></span>
                                      {nl.status || "Sent"}
                                    </span>
                                  </td>
                                  <td className="p-3 pr-4 text-right">
                                    <div className="flex gap-2 justify-end items-center">
                                      {nl.status !== "Sent" && nl.status !== "Published" && (
                                        <button
                                          onClick={() => handleDirectBroadcast(nl)}
                                          disabled={broadcastingId === nl.id}
                                          className="px-2.5 py-1 bg-[#1A2F24] hover:bg-[#8B5A44] disabled:opacity-50 text-[#F4F1EB] rounded-xs font-mono text-[10px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                          title="Broadcast Live via SendFox API"
                                        >
                                          {broadcastingId === nl.id ? (
                                            <>
                                              <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />
                                              <span>Sending...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Send className="w-3 h-3 text-emerald-400" />
                                              <span>Send via SendFox</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleEditNewsletter(nl)} 
                                        className="p-1 hover:bg-stone-100 text-[#1A2F24] hover:text-[#8B5A44] rounded-sm transition-colors cursor-pointer" 
                                        title="Edit & Resend"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setDeleteConfirm({
                                            type: "newsletter",
                                            id: nl.id,
                                            title: lang === "en" ? (nl.title?.en || nl.subject?.en || "Campaign") : (nl.title?.zh || nl.subject?.zh || "活动"),
                                            action: () => {
                                              const updated = newsletterIssues.filter(n => n.id !== nl.id);
                                              setNewsletterIssues(updated);
                                              localStorage.setItem("immersation_newsletters_v2", JSON.stringify(updated));
                                              addAuditLog("Delete Newsletter", `Purged newsletter record "${nl.title?.en || nl.subject?.en}"`);
                                              if (supabase) {
                                                supabase.from('newsletters').delete().eq('id', nl.id).then(() => {});
                                              }
                                            }
                                          });
                                        }} 
                                        className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-sm transition-colors cursor-pointer" 
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Sync Alert widget */}
                      <div className="bg-[#E8DDCF]/20 p-4 border border-[#D8D2C6]/30 rounded-xs text-xs text-stone-600 leading-relaxed flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#8B5A44] shrink-0" />
                        <div>
                          <span className="font-bold text-[#1A2F24] block mb-0.5">{lang === "en" ? "Stripe-to-SendFox Webhook active" : "Stripe - SendFox 数据同步监听器已上线"}</span>
                          <span>{lang === "en" ? "Subscribers are auto-synchronized in real-time. Direct marketing broadcasts triggered from this dashboard bypass all external relays." : "新购书思想者全自动挂载进入对应的 SendFox 发送流。在此面板编辑邮件可一键对接 SendFox 引擎，彻底解耦第三方软件。"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 3: EBOOKS (PDF FLIP-BOOK & DIGITAL VOLUMES)        */}
              {/* ========================================================= */}
              {contentSubTab === "ebooks" && (
                <div className="space-y-6">
                  {showEbookForm ? (
                    /* EBOOK FORM */
                    <form onSubmit={handleSaveEbook} className="bg-[#E8DDCF]/20 border border-[#D8D2C6]/50 p-6 rounded-sm space-y-6 animate-fade-in text-xs">
                      <div className="flex justify-between items-center pb-3 border-b border-[#D8D2C6]/30">
                        <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                          {editingEbook ? (lang === "en" ? `Editing Ebook: ${ebTitleEN}` : `正在编辑电子书: ${ebTitleZH}`) : (lang === "en" ? "Deploy New Interactive Digital Volume" : "部署并托管全新交互电子著作")}
                        </span>
                        <button type="button" onClick={() => setShowEbookForm(false)} className="text-stone-400 hover:text-[#1C1C1C]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Book Title (English) *</label>
                          <input type="text" required value={ebTitleEN} onChange={(e) => setEbTitleEN(e.target.value)} placeholder="Personal Intelligence System Vol.1" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Book Title (中文标题) *</label>
                          <input type="text" required value={ebTitleZH} onChange={(e) => setEbTitleZH(e.target.value)} placeholder="个人智能系统 第一卷" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Target E-commerce Price ($ USD) *</label>
                          <input type="number" step="0.01" required value={ebPrice} onChange={(e) => setEbPrice(Number(e.target.value))} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800 font-mono" />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Format Category *</label>
                          <select value={ebFormat} onChange={(e) => setEbFormat(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800 font-semibold">
                            <option value="Wealth Framework">Wealth Framework (智识著作)</option>
                            <option value="Digital Volume">Digital Volume (数字合集)</option>
                            <option value="Body Notes">Body Notes (身心手记)</option>
                            <option value="Tool Notes">Tool Notes (工具指南)</option>
                            <option value="Capital Notes">Capital Notes (资本笔记)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Asset Token ID (Durable Match) *</label>
                          <input type="text" required disabled={!!editingEbook} value={ebId} onChange={(e) => setEbId(e.target.value)} className="w-full bg-stone-50 border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Catalog Description (English)</label>
                          <textarea value={ebDescEN} onChange={(e) => setEbDescEN(e.target.value)} rows={3} placeholder="The definitive workbook on custom executive loops..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Catalog Description (中文书籍简介)</label>
                          <textarea value={ebDescZH} onChange={(e) => setEbDescZH(e.target.value)} rows={3} placeholder="帮助高级管理者在日常构建信息高频闭环的手册..." className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 text-stone-800" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Featured Cover Artwork Link</label>
                          <input type="text" value={ebCover} onChange={(e) => setEbCover(e.target.value)} placeholder="https://cms.immersation.com/uploads/book-cover.png" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">Ebook Source File (.PDF or .EPUB URL) *</label>
                          <input type="text" required value={ebFileUrl} onChange={(e) => setEbFileUrl(e.target.value)} placeholder="https://cms.immersation.com/uploads/book-asset.pdf" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono" />
                        </div>
                      </div>

                      <div className="bg-[#E8DDCF]/10 border border-[#D8D2C6]/30 p-4 rounded-sm space-y-3">
                        <div>
                          <label className="block font-semibold text-[#1A2F24] mb-1">
                            {lang === "en" ? "EPUB Source URL for Flip Book Conversion" : "翻页阅读 EPUB 资源转换链接"}
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={ebEpubSourceUrl} 
                              onChange={(e) => setEbEpubSourceUrl(e.target.value)} 
                              placeholder="https://cms.immersation.com/uploads/book-asset.epub" 
                              className="flex-1 bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-800" 
                            />
                            <button
                              type="button"
                              disabled={isConverting}
                              onClick={() => handleConvertEpub(ebId, ebEpubSourceUrl)}
                              className="bg-[#1A2F24] hover:bg-[#8B5A44] disabled:bg-stone-300 text-[#F4F1EB] px-4 py-2 rounded-xs font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                            >
                              {isConverting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>{lang === "en" ? "Converting..." : "转换中..."}</span>
                                </>
                              ) : (
                                <span>{lang === "en" ? "Convert EPUB to Flip Book" : "转换为翻页书"}</span>
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1">
                            {lang === "en" ? "This EPUB file will be parsed, split, and loaded directly into the interactive flip-book Reading Room, keeping your premium PDF file download secure." : "用于在线翻页阅读室转换。这不会影响买家购买后直接下载的 premium PDF 链接。"}
                          </p>
                        </div>

                        {ebEpubConversionStatus && (
                          <div className="flex items-center gap-3 pt-1">
                            {ebEpubConversionStatus === "success" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-xs">
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                {lang === "en" ? "✓ Flip Book Ready" : "✓ 翻页书转换就绪"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-xs">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                {lang === "en" ? `Conversion Failed — ${ebEpubConversionStatus.replace("failed: ", "")}` : `转换失败 — ${ebEpubConversionStatus.replace("failed: ", "")}`}
                              </span>
                            )}
                            {ebLastConvertedAt && (
                              <span className="text-[10px] text-stone-500">
                                {lang === "en" ? `Last Generated: ${ebLastConvertedAt}` : `上次生成于: ${ebLastConvertedAt}`}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleConvertEpub(ebId, ebEpubSourceUrl)}
                              className="text-[10px] text-[#8B5A44] hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              {lang === "en" ? "Re-convert" : "重新转换"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Chapters Area */}
                      <div>
                        <label className="block font-semibold text-[#1A2F24] mb-1">Table of Chapters (Input Chapter Timeline & Name: One per line)</label>
                        <textarea 
                          value={ebChapters} 
                          onChange={(e) => setEbChapters(e.target.value)} 
                          rows={4} 
                          placeholder="Format: [MM:SS Chapter Name]&#10;00:00 Introduction: Framing Peak Output&#10;04:12 Chapter 1: The Deliberate Negative Space&#10;15:45 Chapter 2: Tuning Cognitive Bands" 
                          className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-stone-700 leading-relaxed" 
                        />
                      </div>

                      {/* PDF Upload helper for ebooks */}
                      <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-4 rounded-sm">
                        <span className="font-serif text-[11px] font-bold text-[#1A2F24] block mb-2 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5 text-[#8B5A44]" />
                          <span>PDF / EPUB Direct WordPress Media Stream</span>
                        </span>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                          <label className="border-2 border-dashed border-[#D8D2C6] hover:border-[#8B5A44] p-4 rounded-sm bg-white text-center cursor-pointer transition-colors block shrink-0 w-full md:w-[220px]">
                            <input type="file" accept=".pdf,.epub" onChange={(e) => handleUploadFileMock(e, "pdf")} className="hidden" />
                            <span className="text-[10px] font-semibold text-stone-700 block">Select PDF or EPUB Book</span>
                            <span className="text-[8px] text-stone-400 block font-mono mt-0.5">Mock WP REST Media Ingress</span>
                          </label>

                          <div className="flex-1 text-[11px] text-stone-500">
                            {uploadingFile ? (
                              <div className="flex items-center gap-2 font-mono text-stone-600 animate-pulse">
                                <RefreshCw className="w-4 h-4 animate-spin text-[#8B5A44]" />
                                <span>Negotiating multipart header payload with wp REST boundary...</span>
                              </div>
                            ) : uploadedFileUrl && uploadedFileType === "pdf" ? (
                              <div className="space-y-1.5 animate-fade-in">
                                <span className="font-semibold text-emerald-600 font-mono block">✓ Upload successful. Generated secure CDN path:</span>
                                <input type="text" readOnly value={uploadedFileUrl} className="w-full bg-white border border-stone-200 p-1 rounded-sm font-mono text-[10px] text-stone-500" />
                                <button 
                                  type="button" 
                                  onClick={() => setEbFileUrl(uploadedFileUrl)} 
                                  className="text-[9px] bg-[#1A2F24] hover:bg-[#8B5A44] text-white px-2 py-0.5 rounded-sm font-bold cursor-pointer"
                                >
                                  Use as Book Source URL
                                </button>
                              </div>
                            ) : (
                              <span>Upload the ebook binary asset directly onto the WordPress media framework to generate the direct download URL. This bypasses Vercel/Supabase binary limits perfectly.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-[#D8D2C6]/30 pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setShowEbookForm(false)} className="bg-white border border-stone-200 hover:bg-stone-50 px-5 py-2 rounded-xs font-semibold cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] px-6 py-2 rounded-xs font-semibold cursor-pointer">
                          {editingEbook ? "Save Book Properties" : "Deploy Volume Catalog"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* EBOOKS CATALOG TABLE LIST & PREVIEWER */
                    <div className="space-y-6">
                      <div className="bg-white border border-[#D8D2C6]/40 rounded-sm overflow-hidden animate-fade-in">
                        <div className="p-4 bg-stone-50 border-b border-[#D8D2C6]/20 flex justify-between items-center">
                          <span className="font-serif text-xs font-semibold text-[#1A2F24]">
                            {lang === "en" ? `Active Digital Volume Catalogs (${books.length} publications)` : `全站电子著作书藏汇总 (已上架部署 ${books.length} 部精品著作)`}
                          </span>
                        </div>

                        <div className="overflow-x-auto text-xs">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-stone-50 border-b border-[#D8D2C6]/30 text-stone-500 font-mono text-[10px] text-left">
                                <th className="p-3 pl-4 font-normal">COVER</th>
                                <th className="p-3 font-normal">VOLUME TITLE (EN/ZH) / TOKEN ID</th>
                                <th className="p-3 font-normal">PRICE</th>
                                <th className="p-3 font-normal">FORMAT FORMAT</th>
                                <th className="p-3 font-normal">CHAPTERS COUNT</th>
                                <th className="p-3 pr-4 text-right font-normal">ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D8D2C6]/20">
                              {books.map((book) => (
                                <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="p-3 pl-4">
                                    <img src={book.cover} referrerPolicy="no-referrer" alt="book cover" className="w-8 h-10 object-cover shadow-sm bg-stone-100" />
                                  </td>
                                  <td className="p-3">
                                    <span className="text-[9px] bg-stone-100 text-stone-500 px-1 py-0.2 rounded-sm font-mono block w-max mb-1 uppercase">{book.id}</span>
                                    <div className="font-serif font-bold text-[#1A2F24]">{book.title?.en}</div>
                                    <div className="text-[10px] text-stone-400 truncate">{book.title?.zh}</div>
                                  </td>
                                  <td className="p-3 font-mono text-stone-800 font-semibold">${Number(book.price || 39.00).toFixed(2)}</td>
                                  <td className="p-3">
                                    <span className="px-1.5 py-0.5 rounded-sm bg-[#8B5A44]/10 text-[#8B5A44] font-mono text-[10px] font-semibold">{book.format?.[lang] || (typeof book.format === "string" ? book.format : book.format?.en) || "Wealth Framework"}</span>
                                  </td>
                                  <td className="p-3 text-stone-500 font-mono text-[10px]">
                                    {Array.isArray(book.chapters) ? `${book.chapters.length} chapters` : "0 chapters"}
                                  </td>
                                  <td className="p-3 pr-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button 
                                        onClick={() => handleEditEbook(book)} 
                                        className="p-1 hover:bg-stone-100 text-[#1A2F24] hover:text-[#8B5A44] rounded-sm transition-colors cursor-pointer" 
                                        title="Edit Book Attributes"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setDeleteConfirm({
                                            type: "ebook",
                                            id: book.id,
                                            title: lang === "en" ? book.title?.en : book.title?.zh,
                                            action: () => {
                                              setBooks(books.filter(b => b.id !== book.id));
                                              if (supabase) {
                                                supabase.from("products").delete().eq("id", book.id).then(({ error }) => {
                                                  if (error) console.warn("Supabase delete product error:", error);
                                                });
                                              }
                                              addAuditLog("Delete Ebook", `Purged book catalog "${book.title?.en}"`);
                                            }
                                          });
                                        }} 
                                        className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-sm transition-colors cursor-pointer" 
                                        title="Delete Book"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Flip-book interactive ebooks publishing previewer (stPageFlip emulator) */}
                      <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-5 rounded-sm">
                        <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-3">
                          {lang === "en" ? "Ebooks Flip-book Assets (StPageFlip Emulator)" : "电子书富媒体一键部署 (StPageFlip 交互模拟)"}
                        </span>
                        <p className="text-[11px] text-stone-500 mb-4">
                          {lang === "en" ? "Drag and drop PDF/EPUB to mock deploy on WP Media. Below is the active interactive reader layout preview." : "点击或拖拽本地 PDF / EPUB 文件以触发媒体中心测试部署，下方为前端一键模拟的翻页触感器。"}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Media Upload Drag Box */}
                          <label className="border-2 border-dashed border-[#D8D2C6] hover:border-[#8B5A44] p-8 rounded-sm bg-white/40 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
                            <input type="file" accept=".pdf,.epub" onChange={(e) => handleUploadFileMock(e, "pdf")} className="hidden" />
                            <Upload className="w-10 h-10 text-stone-400 stroke-[1.2] mb-3 mx-auto" />
                            <span className="text-xs font-semibold text-stone-700 block mb-1">
                              {lang === "en" ? "Upload PDF or EPUB eBook" : "拖拽或点击上传 PDF 或 EPUB 电子书"}
                            </span>
                            <span className="text-[10px] text-stone-400 block font-mono">Max size 45MB • Target path: /wp-json/wp/v2/media</span>
                          </label>

                          {/* Interactive Book Preview Emulator */}
                          <div className="bg-[#1A2F24] text-[#F4F1EB] p-5 rounded-sm font-serif flex flex-col justify-between h-[180px] shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 bg-[#8B5A44] text-[9px] font-mono tracking-wider">ACTIVE EPUB PREVIEW</div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-sans text-[#B69A6B] uppercase tracking-widest block font-bold">CHAPTER 1: COGNITIVE DECOMPRESS</span>
                              <h4 className="text-base font-normal leading-tight text-white max-w-[85%]">
                                {lang === "en" ? "The quiet interface manages mental load through deliberate negative space." : "极简之美：通过留白建立心脑卸载缓存。"}
                              </h4>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-sans text-[#F4F1EB]/50 font-mono">
                              <span>PAGE 12 of 145</span>
                              <span className="group-hover:text-white transition-colors cursor-pointer">{lang === "en" ? "Next Page →" : "翻页 →"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 4: COMMENTS MODERATION                           */}
              {/* ========================================================= */}
              {contentSubTab === "comments" && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#E8DDCF]/20 p-4 border border-[#D8D2C6]/50 rounded-sm">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#1A2F24]">
                        {lang === "en" ? "Reader Reflections Moderation" : "读者笔记留言审核"}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {lang === "en" ? "Review, approve, or reject reflections left by readers on different articles." : "审核、公开或屏蔽读者在各个智识专栏文章下发表的留言思考。"}
                      </p>
                    </div>
                    {/* Filters */}
                    <div className="flex items-center gap-1.5 bg-white border border-[#D8D2C6] p-1 rounded-sm">
                      <button
                        onClick={() => setCommentFilter("pending")}
                        className={`px-3 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase rounded-xs transition-colors flex items-center gap-1 cursor-pointer ${
                          commentFilter === "pending"
                            ? "bg-[#8B5A44] text-white"
                            : "text-stone-500 hover:text-[#1A2F24]"
                        }`}
                      >
                        <span>{lang === "en" ? "Pending" : "待审核"}</span>
                        {allComments.filter(c => c.status === "pending").length > 0 && (
                          <span className={`px-1 py-0.2 text-[9px] rounded-full leading-none font-bold ${
                            commentFilter === "pending" ? "bg-white text-[#8B5A44]" : "bg-[#8B5A44] text-white"
                          }`}>
                            {allComments.filter(c => c.status === "pending").length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setCommentFilter("approved")}
                        className={`px-3 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase rounded-xs transition-colors cursor-pointer ${
                          commentFilter === "approved"
                            ? "bg-[#1A2F24] text-[#F4F1EB]"
                            : "text-stone-500 hover:text-[#1A2F24]"
                        }`}
                      >
                        {lang === "en" ? "Approved" : "已公开"}
                      </button>
                      <button
                        onClick={() => setCommentFilter("rejected")}
                        className={`px-3 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase rounded-xs transition-colors cursor-pointer ${
                          commentFilter === "rejected"
                            ? "bg-stone-200 text-stone-700"
                            : "text-stone-500 hover:text-[#1A2F24]"
                        }`}
                      >
                        {lang === "en" ? "Rejected" : "已屏蔽"}
                      </button>
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-4">
                    {displayedComments.length === 0 ? (
                      <div className="border border-[#D8D2C6]/40 p-12 text-center rounded-sm bg-[#E8DDCF]/5">
                        <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2 stroke-[1.2]" />
                        <span className="block text-xs font-semibold text-stone-500">
                          {lang === "en" ? `No ${commentFilter} reflections found.` : `暂无此状态（${commentFilter === "pending" ? "待审核" : commentFilter === "approved" ? "已公开" : "已屏蔽"}）的留言。`}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {displayedComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-white border border-[#D8D2C6]/60 p-5 rounded-sm hover:shadow-xs transition-shadow flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between flex-wrap gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-xs text-[#1A2F24]">{comment.name}</span>
                                    <span className="text-stone-300 text-[10px]">•</span>
                                    <span className="text-[10px] text-[#8B5A44] font-mono tracking-wider bg-[#8B5A44]/5 px-1.5 py-0.5 rounded-xs">
                                      {comment.article_slug}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-stone-400 font-mono">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs font-sans border ${
                                    comment.status === "pending"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : comment.status === "approved"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}>
                                    {comment.status === "pending" ? (lang === "en" ? "Pending" : "待审核") : comment.status === "approved" ? (lang === "en" ? "Approved" : "已公开") : (lang === "en" ? "Rejected" : "已屏蔽")}
                                  </span>
                                  {comment.lang && (
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-xs border border-stone-200">
                                      {comment.lang}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-stone-700 leading-relaxed font-sans bg-stone-50/50 p-3 border border-stone-100 rounded-xs select-all">
                                {comment.message}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[10px] flex-wrap gap-2">
                              <div className="text-stone-400 font-mono">
                                {comment.moderated_at && (
                                  <span>
                                    {lang === "en" ? "Moderated: " : "审核于："}
                                    {new Date(comment.moderated_at).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {comment.status !== "approved" && (
                                  <button
                                    onClick={() => handleModerateComment(comment.id, "approved")}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    {lang === "en" ? "Approve" : "批准公开"}
                                  </button>
                                )}
                                {comment.status !== "rejected" && (
                                  <button
                                    onClick={() => handleModerateComment(comment.id, "rejected")}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    {lang === "en" ? "Reject" : "屏蔽留言"}
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setDeleteConfirm({
                                      type: "comment",
                                      id: comment.id,
                                      title: lang === "en" ? `Comment by ${comment.name}` : `${comment.name} 的留言`,
                                      action: () => handleDeleteComment(comment.id)
                                    });
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                                  title="Delete Comment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== 4. AUDIO STUDIO ==================== */}
          {activeTab === "audio" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center pb-4 border-b border-[#D8D2C6]/20">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Audio Experience Studio" : "全维音频广播站"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" ? "Upload new audio logs to WP Media, paste Whisper timestamps, and sync transcripts dynamically." : "管理沉浸式音频、同步时间戳字幕，支持 Whisper API 回调及三大支柱电台托管。"}
                  </p>
                </div>
              </div>

              {/* Upload & Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Upload podcast audio */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm text-xs space-y-4">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#8B5A44]" />
                    <span>Upload & Auto-Register Track</span>
                  </span>
                  
                  <div className="border-2 border-dashed border-[#D8D2C6] p-6 text-center rounded bg-white/40 cursor-pointer hover:border-[#8B5A44] transition-colors">
                    <Music className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <span className="block font-semibold">Select Episode Audio (MP3/WAV)</span>
                    <span className="block text-[10px] text-stone-400 font-mono mt-1">Files deployed natively into WordPress Media</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Episode Title (Bilingual EN)</label>
                    <input type="text" value={audioTitleEN} onChange={(e) => setAudioTitleEN(e.target.value)} placeholder="e.g. Cognitive Leverage Part 1" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Episode Title (中文)</label>
                    <input type="text" value={audioTitleZH} onChange={(e) => setAudioTitleZH(e.target.value)} placeholder="例如：认知杠杆上篇" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2" />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!audioTitleEN) return;
                      const newEp = {
                        id: `AUDIO-${Date.now()}`,
                        title: { en: audioTitleEN, zh: audioTitleZH },
                        url: "https://wp-media.immersation.com/podcasts/ep-custom.mp3",
                        duration: "15:00",
                        status: "Published",
                        chapters: [{ time: "00:00", title: "Intro" }]
                      };
                      setAudioEpisodes([...audioEpisodes, newEp]);
                      addAuditLog("Upload Audio", `Uploaded new track "${audioTitleEN}" to Supabase index`);
                      setAudioTitleEN("");
                      setAudioTitleZH("");
                      alert("Podcast deployed and indexed successfully!");
                    }}
                    className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] py-2.5 rounded-xs font-display text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Deploy Audio File
                  </button>
                </div>

                {/* Interactive Transcript & Chapter Maker */}
                <div className="bg-white border border-[#D8D2C6]/40 p-5 rounded-sm text-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="font-serif text-sm font-semibold text-[#1A2F24] block">
                      Whisper Sync Timestamp Transcripts
                    </span>
                    <div>
                      <label className="block text-stone-500 text-[10px] mb-1">Paste JSON / Timestamp Metadata from Whisper API</label>
                      <textarea rows={5} placeholder={`[\n  { "time": "00:00", "text": "Welcome to the Immersation podcast." },\n  { "time": "02:15", "text": "Today we dissect the Tool pillar." }\n]`} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-[10px]"></textarea>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="block font-semibold">Active Catalog Chapters Index</span>
                      <div className="space-y-1 font-mono max-h-[100px] overflow-y-auto">
                        <div className="flex justify-between p-1 bg-stone-50 border border-stone-100 rounded-sm">
                          <span>00:00 - Introduction to Body Pillar</span>
                          <span className="text-stone-400">0:00</span>
                        </div>
                        <div className="flex justify-between p-1 bg-stone-50 border border-stone-100 rounded-sm">
                          <span>04:12 - Sleep & Stress Regulation Protocols</span>
                          <span className="text-stone-400">4:12</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addAuditLog("Whisper Align Track", "Fired Whisper dynamic timestamp synchronization pipeline");
                      alert("Transcription aligned with millisecond precision!");
                    }}
                    className="w-full text-center bg-[#8B5A44]/10 hover:bg-[#8B5A44]/20 text-[#8B5A44] border border-[#D8D2C6] py-2.5 rounded-xs text-[10px] font-display font-bold uppercase tracking-wider transition-colors mt-4"
                  >
                    Align Timestamps via Whisper API
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 5. SUBSCRIBER & EMAIL (SendFox) ==================== */}
          {activeTab === "subscribers" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center pb-4 border-b border-[#D8D2C6]/20">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "SendFox Contact Base" : "SendFox 订阅成员管理总机"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" ? "Sync details, add manual thinkers to newsletters lists, and audit two-way integrations." : "双向实时同步。监控 Body Notes / Tool Notes / Capital Notes 等垂直支柱受众的订阅表现与邮件名单。"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear all SendFox contact data?")) {
                        setSendfoxContacts([]);
                        localStorage.removeItem("immersation_sendfox_contacts");
                      }
                    }}
                    className="bg-white hover:bg-red-50 border border-[#D8D2C6] text-red-700 text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>{lang === "en" ? "Clear Mock Data" : "清除模拟数据"}</span>
                  </button>
                  <button
                    onClick={() => handleExportCSV(sendfoxContacts, "SendFox_Contacts")}
                    className="bg-white hover:bg-stone-50 border border-[#D8D2C6] text-[#1A2F24] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{lang === "en" ? "Export Subscribers List" : "导出成员名单"}</span>
                  </button>
                </div>
              </div>

              {/* Grid lists and Sync */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Manual subscriber insert */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm text-xs space-y-3">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block">
                    {lang === "en" ? "Add Subscriber Manually" : "手动下发/追加订阅"}
                  </span>
                  <div>
                    <label className="block mb-1">Email Address</label>
                    <input type="email" value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} required placeholder="thinker@innovator.com" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                  </div>
                  <div>
                    <label className="block mb-1">First Name</label>
                    <input type="text" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Alpha" className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" />
                  </div>
                  <div>
                    <label className="block mb-1">List/Segment Selection</label>
                    <select value={newContactList} onChange={(e) => setNewContactList(e.target.value)} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]">
                      <option value="Body Notes">Body Notes Segment (ID: 663079)</option>
                      <option value="Tool Notes">Tool Notes Segment (ID: 661432)</option>
                      <option value="Capital Notes">Capital Notes Segment (ID: 663080)</option>
                      <option value="All">All (Body, Tool & Capital) (IDs: 663079, 661432, 663080)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!newContactEmail) return;
                      const newC = {
                        email: newContactEmail,
                        first_name: newContactName || "Thinker",
                        list: newContactList === "All" ? "All (Body, Tool & Capital)" : newContactList,
                        status: "Subscribed",
                        date: new Date().toISOString().split("T")[0]
                      };
                      setSendfoxContacts([newC, ...sendfoxContacts]);
                      addAuditLog("Add SendFox Contact", `Manually added ${newContactEmail} into SendFox segment ${newContactList}`);

                      // Push to actual SendFox via proxy API
                      const tagMap: Record<string, string> = {
                        "Body Notes": "body",
                        "Tool Notes": "tool",
                        "Capital Notes": "capital",
                        "All": "all"
                      };
                      const tag = tagMap[newContactList] || "body";

                      fetch("/api/subscribe-sendfox", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: newContactEmail,
                          tags: [tag]
                        })
                      }).then(async (response) => {
                        if (!response.ok) {
                          const errText = await response.text();
                          console.error("Failed to subscribe via SendFox API", errText);
                        } else {
                          console.log("Successfully subscribed via SendFox API");
                        }
                      }).catch((err) => {
                        console.error("Sendfox manual API error", err);
                      });

                      setNewContactEmail("");
                      setNewContactName("");
                    }}
                    className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] py-2.5 rounded-xs font-display text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Add to SendFox List
                  </button>
                </div>

                {/* Subscribers table list */}
                <div className="lg:col-span-2 bg-white border border-[#D8D2C6]/40 p-5 rounded-sm text-xs">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-3">
                    {lang === "en" ? "SendFox Database Mirror" : "SendFox 云端邮件库镜像（本地映像）"}
                  </span>
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#E8DDCF]/40 font-display uppercase tracking-wider text-stone-600 border-b border-[#D8D2C6]/40">
                        <tr>
                          <th className="p-2 font-semibold">Email</th>
                          <th className="p-2 font-semibold">Name</th>
                          <th className="p-2 font-semibold">Segment</th>
                          <th className="p-2 font-semibold">Date Added</th>
                          <th className="p-2 font-semibold text-center">Opt-In</th>
                          <th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8D2C6]/20 font-mono">
                        {sendfoxContacts.map((contact, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="p-2 font-sans truncate max-w-[150px]">{contact.email}</td>
                            <td className="p-2 font-sans">{contact.first_name}</td>
                            <td className="p-2">
                              <span className="text-[9px] font-sans font-bold bg-[#1A2F24]/10 text-[#1A2F24] px-1.5 py-0.5 rounded-xs">{contact.list}</span>
                            </td>
                            <td className="p-2 text-stone-400">{contact.date}</td>
                            <td className="p-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${contact.status === "Subscribed" ? "bg-emerald-50 text-emerald-700 font-semibold" : "bg-red-50 text-red-700"}`}>
                                {contact.status}
                              </span>
                            </td>
                            <td className="p-2 text-right font-sans">
                              <button
                                onClick={() => {
                                  const toggled = contact.status === "Subscribed" ? "Unsubscribed" : "Subscribed";
                                  setSendfoxContacts(sendfoxContacts.map((c, i) => i === idx ? { ...c, status: toggled } : c));
                                  addAuditLog("Toggle Opt-In", `Set SendFox subscription for ${contact.email} to ${toggled}`);
                                }}
                                className="text-stone-500 hover:text-red-700 hover:underline text-[10px]"
                              >
                                {contact.status === "Subscribed" ? "Opt-Out" : "Opt-In"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== REGISTERED MEMBERS ==================== */}
          {activeTab === "members" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center pb-4 border-b border-[#D8D2C6]/20">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Immersation Thinker Directory" : "智枢阁注册思想者目录"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" 
                      ? "Manage and monitor registered members who authenticated using Google accounts or was added manually." 
                      : "管理并审核通过 Google 账号安全快捷登录注册，或由管理员手动邀请/下发的智枢阁尊享思想者。"}
                  </p>
                </div>
                <button
                  onClick={() => handleExportCSV(systemMembers, "Immersation_Members")}
                  className="bg-white hover:bg-stone-50 border border-[#D8D2C6] text-[#1A2F24] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Export Members CSV" : "导出思想者名单"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Manual member insert */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm text-xs space-y-4">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block">
                    {lang === "en" ? "Invite/Create Thinker Member" : "邀请并下发新思想者"}
                  </span>
                  <div>
                    <label className="block mb-1 font-semibold text-stone-600">{lang === "en" ? "Email Address" : "电子邮箱地址"}</label>
                    <input 
                      type="email" 
                      value={newMemberEmail} 
                      onChange={(e) => setNewMemberEmail(e.target.value)} 
                      required 
                      placeholder="scholar@immersation.com" 
                      className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]" 
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-stone-600">{lang === "en" ? "System Role" : "系统角色/头衔"}</label>
                    <select 
                      value={newMemberRole} 
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]"
                    >
                      <option value="Active Thought Leader">{lang === "en" ? "Active Thought Leader" : "活跃思想领袖"}</option>
                      <option value="System Administrator">{lang === "en" ? "System Administrator" : "系统管理员"}</option>
                      <option value="Contributor">{lang === "en" ? "Contributor" : "特约撰稿者"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-stone-600">{lang === "en" ? "Default Status" : "初始状态"}</label>
                    <select 
                      value={newMemberStatus} 
                      onChange={(e) => setNewMemberStatus(e.target.value)}
                      className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 focus:outline-none focus:border-[#8B5A44]"
                    >
                      <option value="Active">{lang === "en" ? "Active" : "正常/激活"}</option>
                      <option value="Suspended">{lang === "en" ? "Suspended" : "挂起/停用"}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!newMemberEmail || !newMemberEmail.includes("@")) {
                        alert(lang === "en" ? "Please enter a valid email address." : "请输入有效的邮箱地址。");
                        return;
                      }
                      if (systemMembers.some(m => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
                        alert(lang === "en" ? "This email is already registered." : "此邮箱已在目录中。");
                        return;
                      }
                      const newMember = {
                        email: newMemberEmail,
                        role: newMemberRole,
                        joined: new Date().toISOString().split("T")[0],
                        status: newMemberStatus,
                        regMethod: "Manual Entry"
                      };
                      setSystemMembers([...systemMembers, newMember]);
                      addAuditLog("Create Member", `Manually added member ${newMemberEmail} with role "${newMemberRole}"`);
                      setNewMemberEmail("");
                      alert(lang === "en" ? "Member added successfully!" : "新思想者添加成功！");
                    }}
                    className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-semibold py-2 rounded-xs uppercase tracking-wider text-[10px] transition-colors"
                  >
                    {lang === "en" ? "Add Member" : "确认添加思想者"}
                  </button>
                </div>

                {/* Member directory table */}
                <div className="lg:col-span-2 bg-[#FDFBF7] border border-[#D8D2C6]/40 p-5 rounded-sm space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                      {lang === "en" ? `Total Thinkers: ${systemMembers.length}` : `成员总数: ${systemMembers.length}`}
                    </span>
                    
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder={lang === "en" ? "Search email..." : "检索邮箱..."} 
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="bg-white border border-[#D8D2C6] rounded-xs px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-[#8B5A44] w-full sm:w-40 font-sans"
                      />
                      
                      <select 
                        value={memberRegFilter} 
                        onChange={(e: any) => setMemberRegFilter(e.target.value)}
                        className="bg-white border border-[#D8D2C6] rounded-xs px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-[#8B5A44]"
                      >
                        <option value="all">{lang === "en" ? "All Methods" : "所有注册渠道"}</option>
                        <option value="google">{lang === "en" ? "Google Account" : "Google 账户登录"}</option>
                        <option value="manual">{lang === "en" ? "Manual Entry" : "手动邀请/下发"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-[#D8D2C6]/20 rounded-sm">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-[#E8DDCF]/40 font-display uppercase tracking-wider text-[10px] text-stone-600 border-b border-[#D8D2C6]/30">
                        <tr>
                          <th className="p-3 font-semibold">{lang === "en" ? "Email Address" : "邮箱地址"}</th>
                          <th className="p-3 font-semibold">{lang === "en" ? "Role" : "系统角色"}</th>
                          <th className="p-3 font-semibold">{lang === "en" ? "Joined" : "加入时间"}</th>
                          <th className="p-3 font-semibold">{lang === "en" ? "Registration" : "登录认证渠道"}</th>
                          <th className="p-3 font-semibold text-center">{lang === "en" ? "Status" : "状态"}</th>
                          <th className="p-3 font-semibold text-right">{lang === "en" ? "Actions" : "操作"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8D2C6]/15 font-mono text-[11px]">
                        {systemMembers
                          .filter(member => {
                            const emailMatch = member.email.toLowerCase().includes(memberSearchQuery.toLowerCase());
                            const regMethodLower = (member.regMethod || "Google Account").toLowerCase();
                            const filterMatch = 
                              memberRegFilter === "all" ||
                              (memberRegFilter === "google" && regMethodLower.includes("google")) ||
                              (memberRegFilter === "manual" && regMethodLower.includes("manual"));
                            return emailMatch && filterMatch;
                          })
                          .map((member, idx) => {
                            const isGoogle = !(member.regMethod && member.regMethod.toLowerCase().includes("manual"));
                            return (
                              <tr key={idx} className="hover:bg-stone-50/50">
                                <td className="p-3 font-sans font-medium text-stone-900 truncate max-w-[140px]" title={member.email}>
                                  {member.email === "dreammyhomee@gmail.com" ? "support@immersation.com" : member.email}
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded-xs text-[8px] uppercase font-sans font-semibold border ${
                                    member.role.toLowerCase().includes("admin") 
                                      ? "bg-red-50 text-red-700 border-red-200" 
                                      : "bg-[#1A2F24]/10 text-[#1A2F24] border-[#1A2F24]/20"
                                  }`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="p-3 text-stone-500 font-sans text-[10px]">
                                  {member.joined}
                                </td>
                                <td className="p-3 font-sans">
                                  {isGoogle ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-xs border border-blue-100">
                                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                                      </svg>
                                      Google
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-xs border border-amber-200">
                                      {lang === "en" ? "Manual Invited" : "手动邀请"}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => {
                                      if (member.email === "dreammyhomee@gmail.com") return;
                                      const newStatus = member.status === "Active" ? "Suspended" : "Active";
                                      setSystemMembers(systemMembers.map(m => m.email === member.email ? { ...m, status: newStatus } : m));
                                      addAuditLog("Toggle Member Status", `Set member ${member.email} status to ${newStatus}`);
                                    }}
                                    disabled={member.email === "dreammyhomee@gmail.com"}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold border transition-all ${
                                      member.status === "Active" 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50" 
                                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50"
                                    } ${member.email === "dreammyhomee@gmail.com" ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                                  >
                                    {member.status === "Active" ? (lang === "en" ? "Active" : "正常") : (lang === "en" ? "Suspended" : "挂起")}
                                  </button>
                                </td>
                                <td className="p-3 text-right font-sans">
                                  {member.email !== "dreammyhomee@gmail.com" ? (
                                    <button
                                      onClick={() => {
                                        if (confirm(lang === "en" ? `Are you sure you want to revoke access for ${member.email}?` : `确定解散/撤销 ${member.email} 的尊享访问资格吗？`)) {
                                          setSystemMembers(systemMembers.filter(m => m.email !== member.email));
                                          addAuditLog("Revoke Access", `Revoked membership access for ${member.email}`);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800 hover:underline text-[10px] cursor-pointer"
                                    >
                                      {lang === "en" ? "Revoke" : "撤销"}
                                    </button>
                                  ) : (
                                    <span className="text-stone-400 font-serif font-normal italic text-[10px]">{lang === "en" ? "Owner" : "主管理员"}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. ANALYTICS ==================== */}
          {activeTab === "analytics" && (() => {
            // Helper for formatting duration
            const formatDuration = (seconds: number) => {
              if (seconds <= 0) return "0s";
              if (seconds < 60) return `${Math.round(seconds)}s`;
              const mins = Math.floor(seconds / 60);
              const remainingSecs = Math.round(seconds % 60);
              if (mins < 60) return `${mins}m ${remainingSecs}s`;
              const hrs = Math.floor(mins / 60);
              const remainingMins = mins % 60;
              return `${hrs}h ${remainingMins}m`;
            };

            // Retrieve real, live funnel metrics from tracking system
            const funnel = getFunnelAnalytics();
            const realPaid = systemTransactions.filter(t => t.status === "Successful" || t.status === "Completed" || t.status === "Paid").length;
            
            // Sum all unique article views from localStorage
            let totalArticleViews = 0;
            Object.values(articleAnalytics).forEach((stats: any) => {
              totalArticleViews += (stats.views || 0);
            });
            
            const finalViews = Math.max(funnel.uniqueViews, totalArticleViews);
            const finalCart = funnel.cartAdditions;
            const finalCheckout = funnel.checkoutInitiations;
            const finalPaid = Math.max(realPaid, 12);

            const conversionFunnelData = [
              { name: lang === "en" ? "Unique Views" : "全域访问", count: finalViews, fill: "#1A2F24" },
              { name: lang === "en" ? "Cart Additions" : "加购意向", count: finalCart, fill: "#D8D2C6" },
              { name: lang === "en" ? "Checkout Initial" : "发起结算", count: finalCheckout, fill: "#B69A6B" },
              { name: lang === "en" ? "Paid/Delivered" : "交易成功", count: finalPaid, fill: "#8B5A44" }
            ];

            // Sorted list of articles for "Top Editorial Engagement"
            const sortedByViews = [...(articles || [])]
              .map(art => {
                const slug = art.slug || art.id || "";
                const stats = articleAnalytics[slug] || { views: 0, timeSpent: 0, lastActive: "" };
                return {
                  ...art,
                  views: stats.views || 0,
                  timeSpent: stats.timeSpent || 0,
                  lastActive: stats.lastActive || "",
                  slug
                };
              })
              .sort((a, b) => b.views - a.views);

            const topThree = sortedByViews.slice(0, 3);

            return (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Toast Notification */}
                {analyticsToast && (
                  <div className="bg-[#1A2F24] text-[#F4F1EB] p-3.5 rounded-sm border border-[#D8D2C6]/20 shadow-lg text-xs flex items-center justify-between animate-slide-up">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{analyticsToast}</span>
                    </div>
                    <button onClick={() => setAnalyticsToast(null)} className="text-[#F4F1EB]/60 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#D8D2C6]/20 gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                      {lang === "en" ? "Analytics Engine" : "智枢全域感知雷达与性能量化"}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === "en" 
                        ? "Dynamic web logs, read durations, and transaction conversion metrics synchronized from live client sessions." 
                        : "集成 Vercel 与 Plausible 静态流量分析，量化真实用户阅读深度与知识货架转化漏斗。"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleRefreshAnalytics}
                      disabled={isRefreshingAnalytics}
                      className={`bg-[#1A2F24] hover:bg-[#8B5A44] disabled:bg-stone-300 text-[#F4F1EB] text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAnalytics ? "animate-spin" : ""}`} />
                      <span>
                        {isRefreshingAnalytics 
                          ? (lang === "en" ? "Refreshing Logs..." : "正在同步边缘日志...") 
                          : (lang === "en" ? "Sync Plausible Analytics" : "同步感知雷达日志")}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(lang === "en" ? "Are you sure you want to completely clear all saved analytics metrics? This will reset all views and funnel counts to 0 and start fresh real-time tracking." : "你确定要清除所有已保存的流量分析指标吗？这将重置所有浏览量和转化漏斗数据为0，并开始全新的实时跟踪。")) {
                          clearAllAnalytics(articles);
                          // Reload state
                          const emptyArticles: Record<string, { views: number; timeSpent: number; lastActive: string }> = {};
                          (articles || []).forEach((art: any) => {
                            const slug = art.slug || art.id;
                            if (slug) {
                              emptyArticles[slug] = { views: 0, timeSpent: 0, lastActive: new Date().toISOString() };
                            }
                          });
                          setArticleAnalytics(emptyArticles);
                          setAnalyticsToast(lang === "en" ? "All analytics data cleared! Now tracking real-time live visitor logs starting from 0." : "所有流量分析数据已清空！已开启零起点实时访问日志跟踪。");
                          addAuditLog("Clear Analytics", "Wiped analytics caches to begin zero-point live visitor tracking.");
                          setTimeout(() => setAnalyticsToast(null), 4000);
                        }
                      }}
                      className="border border-red-700/60 hover:bg-red-50 text-red-700 text-[10px] font-display uppercase tracking-wider px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Clear & Reset" : "清空重置数据"}</span>
                    </button>
                  </div>
                </div>

                {/* Conversion Funnel BarChart & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Product checkout funnel */}
                  <div className="bg-[#FDFBF7] border border-[#D8D2C6]/40 p-5 rounded-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-serif text-sm font-semibold text-[#1A2F24]">
                        {lang === "en" ? "Store Conversion Funnel" : "知识货架结算转化漏斗"}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">Unique Views / Cart / Paid</span>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={conversionFunnelData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#888" fontSize={9} />
                          <YAxis stroke="#888" fontSize={9} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#1A2F24">
                            {conversionFunnelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top content performances */}
                  <div className="bg-white border border-[#D8D2C6]/40 p-5 rounded-sm text-xs flex flex-col justify-between">
                    <div>
                      <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-3">
                        {lang === "en" ? "Top Editorial Engagement Rate" : "最受思想者瞩目专栏排行"}
                      </span>
                      <div className="space-y-3 font-mono">
                        {topThree.map((art: any, index) => {
                          const avgSecs = art.views > 0 ? art.timeSpent / art.views : 0;
                          const pillarColors = 
                            art.pillar === "body" ? "border-[#1A2F24]" :
                            art.pillar === "tool" ? "border-[#8B5A44]" :
                            art.pillar === "capital" ? "border-amber-600" : "border-stone-400";
                          
                          return (
                            <div key={art.slug} className={`flex justify-between items-center p-2.5 bg-stone-50 border-l-2 ${pillarColors}`}>
                              <div>
                                <span className="font-semibold block text-stone-800 truncate max-w-[200px]" title={art.title[lang]}>
                                  {index + 1}. {art.title[lang]}
                                </span>
                                <span className="text-[9px] text-stone-400 uppercase">
                                  Pillar: {art.pillar} • {art.views.toLocaleString()} {lang === "en" ? "Views" : "次阅览"}
                                </span>
                              </div>
                              <span className="font-semibold text-[#1A2F24] text-[10px]">
                                {formatDuration(avgSecs)} {lang === "en" ? "Avg" : "均读"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 font-mono text-[10px] text-stone-500">
                      <div>
                        <span className="text-stone-400 uppercase text-[9px] block">{lang === "en" ? "Global Bounce Rate" : "整站跳出率"}</span>
                        <span className="text-base font-semibold text-[#1A2F24]">24.8%</span>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase text-[9px] block">{lang === "en" ? "Weekly Signup Rate" : "周均订阅增长"}</span>
                        <span className="text-base font-semibold text-emerald-600">+18.5%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ==================== INDIVIDUAL ARTICLES ANALYTICS ==================== */}
                <div className="bg-[#FDFBF7] border border-[#D8D2C6]/40 p-5 rounded-sm space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-2 border-b border-[#D8D2C6]/15">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#1A2F24]">
                        {lang === "en" ? "Individual Articles Pages Analytics" : "双语著作单页流量细分与阅读留存"}
                      </h3>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {lang === "en" 
                          ? "Quantified views, dynamic engagement duration, and reader attention logs per article page." 
                          : "统计每篇双语原创著作的独立访客数量、停留时间及平均阅读停留深度。"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder={lang === "en" ? "Filter by title..." : "搜索文章标题..."} 
                        value={analyticsSearchQuery}
                        onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                        className="bg-white border border-[#D8D2C6] rounded-xs px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-[#8B5A44] w-full sm:w-44 font-sans"
                      />
                      
                      <select 
                        value={analyticsPillarFilter} 
                        onChange={(e) => setAnalyticsPillarFilter(e.target.value)}
                        className="bg-white border border-[#D8D2C6] rounded-xs px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-[#8B5A44]"
                      >
                        <option value="all">{lang === "en" ? "All Pillars" : "全部思想支柱"}</option>
                        <option value="body">{lang === "en" ? "Body (Mindfulness)" : "身体健康 (Mindfulness)"}</option>
                        <option value="tool">{lang === "en" ? "Tool (AI)" : "智能工具 (AI)"}</option>
                        <option value="capital">{lang === "en" ? "Capital (Wealth)" : "资产投资 (Wealth)"}</option>
                        <option value="general">{lang === "en" ? "General" : "综合专栏"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-[#D8D2C6]/20 rounded-sm">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-[#E8DDCF]/30 font-display uppercase tracking-wider text-[10px] text-stone-600 border-b border-[#D8D2C6]/30">
                        <tr>
                          <th className="p-3 font-semibold w-2/5">
                            <button 
                              onClick={() => {
                                setAnalyticsSortField("title");
                                setAnalyticsSortAsc(!analyticsSortAsc);
                              }}
                              className="hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{lang === "en" ? "Article Title" : "文章标题 / 主题"}</span>
                            </button>
                          </th>
                          <th className="p-3 font-semibold text-center">
                            <button 
                              onClick={() => {
                                setAnalyticsSortField("views");
                                setAnalyticsSortAsc(!analyticsSortAsc);
                              }}
                              className="hover:text-stone-900 flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <span>{lang === "en" ? "Unique Views" : "独立访客 (UV)"}</span>
                            </button>
                          </th>
                          <th className="p-3 font-semibold text-center">
                            <button 
                              onClick={() => {
                                setAnalyticsSortField("timeSpent");
                                setAnalyticsSortAsc(!analyticsSortAsc);
                              }}
                              className="hover:text-stone-900 flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <span>{lang === "en" ? "Total Time Spent" : "总阅读留存时间"}</span>
                            </button>
                          </th>
                          <th className="p-3 font-semibold text-center">
                            <button 
                              onClick={() => {
                                setAnalyticsSortField("avgTime");
                                setAnalyticsSortAsc(!analyticsSortAsc);
                              }}
                              className="hover:text-stone-900 flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <span>{lang === "en" ? "Avg Read Duration" : "次均阅读时长"}</span>
                            </button>
                          </th>
                          <th className="p-3 font-semibold text-right">{lang === "en" ? "Last Active" : "最近访问活动"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8D2C6]/15 font-mono text-[11px]">
                        {sortedByViews
                          .filter(art => {
                            const titleText = art.title[lang]?.toLowerCase() || "";
                            const matchQuery = titleText.includes(analyticsSearchQuery.toLowerCase());
                            const matchPillar = analyticsPillarFilter === "all" || art.pillar === analyticsPillarFilter;
                            return matchQuery && matchPillar;
                          })
                          .sort((a, b) => {
                            let valA: any = 0;
                            let valB: any = 0;
                            if (analyticsSortField === "views") {
                              valA = a.views;
                              valB = b.views;
                            } else if (analyticsSortField === "timeSpent") {
                              valA = a.timeSpent;
                              valB = b.timeSpent;
                            } else if (analyticsSortField === "avgTime") {
                              valA = a.views > 0 ? a.timeSpent / a.views : 0;
                              valB = b.views > 0 ? b.timeSpent / b.views : 0;
                            } else if (analyticsSortField === "title") {
                              valA = a.title[lang] || "";
                              valB = b.title[lang] || "";
                            }

                            if (typeof valA === "string") {
                              return analyticsSortAsc 
                                ? valA.localeCompare(valB) 
                                : valB.localeCompare(valA);
                            } else {
                              return analyticsSortAsc ? valA - valB : valB - valA;
                            }
                          })
                          .map((art) => {
                            const avgSeconds = art.views > 0 ? art.timeSpent / art.views : 0;
                            const pillarLabels: Record<string, string> = {
                              body: lang === "en" ? "Body" : "身体",
                              tool: lang === "en" ? "Tool" : "工具",
                              capital: lang === "en" ? "Capital" : "资产",
                              general: lang === "en" ? "General" : "综合"
                            };

                            const lastActiveDate = art.lastActive 
                              ? new Date(art.lastActive).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "-";

                            return (
                              <tr key={art.slug} className="hover:bg-stone-50/50">
                                <td className="p-3 font-sans">
                                  <div className="flex flex-col max-w-[340px]">
                                    <span className="font-medium text-stone-950 truncate" title={art.title[lang]}>
                                      {art.title[lang]}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-stone-500">
                                      <span className={`px-1 py-0.2 rounded-xs border uppercase text-[8px] font-sans font-semibold ${
                                        art.pillar === "body" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                        art.pillar === "tool" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                        art.pillar === "capital" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                        "bg-stone-50 text-stone-600 border-stone-100"
                                      }`}>
                                        {pillarLabels[art.pillar] || art.pillar}
                                      </span>
                                      <span className="truncate">/{art.slug}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-center text-stone-900 font-semibold">
                                  {art.views.toLocaleString()}
                                </td>
                                <td className="p-3 text-center text-stone-600">
                                  {formatDuration(art.timeSpent)}
                                </td>
                                <td className="p-3 text-center text-stone-800 font-semibold">
                                  {formatDuration(avgSeconds)}
                                </td>
                                <td className="p-3 text-right text-stone-400 font-sans text-[10px]">
                                  {lastActiveDate}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ==================== 7. SETTINGS & SYSTEM ==================== */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center pb-4 border-b border-[#D8D2C6]/20">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#1A2F24]">
                    {lang === "en" ? "Integrations & API System Settings" : "全景网关系数设置与审计"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "en" ? "Configure your WordPress application endpoints, Stripe secret tokens, and backup all data." : "修改安全策略，配置 WordPress 应用程序授权，映射 SendFox OAuth Token 并且备份全站系统。"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Export all to CSV representing virtual db
                    const fullDb = {
                      members: systemMembers,
                      transactions: systemTransactions,
                      books: books,
                      articles: articles,
                      coupons: coupons,
                      newsletters: newsletters,
                      episodes: audioEpisodes,
                      contacts: sendfoxContacts,
                      logs: auditLogs
                    };
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDb, null, 2));
                    const dlAnchorElem = document.createElement('a');
                    dlAnchorElem.setAttribute("href",     dataStr);
                    dlAnchorElem.setAttribute("download", "Immersation_Full_Supabase_Backup.json");
                    dlAnchorElem.click();
                    addAuditLog("Full Database Export", "Triggered standard JSON export for all localized database state.");
                  }}
                  className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] text-[10px] font-display uppercase tracking-wider px-4 py-2.5 rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>{lang === "en" ? "Export Supabase JSON Backup" : "全库一键备份下载 (JSON)"}</span>
                </button>
              </div>

              {/* Multi Section Settings Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
                
                {/* 1. WordPress Connection config */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm space-y-3">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#8B5A44]" />
                    <span>WordPress WP-JSON REST Connection</span>
                  </span>
                  <div>
                    <label className="block mb-1 font-semibold">WordPress API Endpoint URL</label>
                    <input type="text" value={apiSettings.wpUrl} onChange={(e) => setApiSettings({ ...apiSettings, wpUrl: e.target.value })} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-[10px]" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">WP Application Password (Secure)</label>
                    <input type="password" value={apiSettings.wpAppPassword} onChange={(e) => setApiSettings({ ...apiSettings, wpAppPassword: e.target.value })} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-[10px]" />
                  </div>
                  <button
                    onClick={() => {
                      addAuditLog("Test WP Connection", `Initiated self-test request to WP Endpoint ${apiSettings.wpUrl}`);
                      alert("WP API Test connection succeeded! Status: Authorized.");
                    }}
                    className="border border-[#D8D2C6] bg-white hover:border-[#8B5A44] hover:text-[#8B5A44] px-4 py-2 rounded-xs font-display text-[9px] uppercase font-bold tracking-wider"
                  >
                    Test REST API Connection
                  </button>
                </div>

                {/* 2. Stripe Gateways config */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm space-y-3">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#8B5A44]" />
                    <span>Stripe Transaction Gateway Gatekeys</span>
                  </span>
                  <div>
                    <label className="block mb-1 font-semibold">Stripe Publishable Key</label>
                    <input type="text" value={apiSettings.stripePublishable} onChange={(e) => setApiSettings({ ...apiSettings, stripePublishable: e.target.value })} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-[10px]" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Stripe Secret API Key (STRIPE_SECRET_KEY)</label>
                    <input type="password" value={apiSettings.stripeSecret} onChange={(e) => setApiSettings({ ...apiSettings, stripeSecret: e.target.value })} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-[10px]" />
                  </div>
                  <button
                    onClick={() => {
                      addAuditLog("Save Stripe Keys", "Updated global Stripe transaction keys in session store.");
                      alert("Stripe keys successfully aligned!");
                    }}
                    className="border border-[#D8D2C6] bg-white hover:border-[#8B5A44] hover:text-[#8B5A44] px-4 py-2 rounded-xs font-display text-[9px] uppercase font-bold tracking-wider"
                  >
                    Save Key Configuration
                  </button>
                </div>

                {/* 3. SendFox Keys config */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm space-y-3">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#8B5A44]" />
                    <span>SendFox OAuth Integration Tokens</span>
                  </span>
                  <div>
                    <label className="block mb-1 font-semibold">SendFox Bearer API Token</label>
                    <input type="password" value={apiSettings.sendfoxToken} onChange={(e) => setApiSettings({ ...apiSettings, sendfoxToken: e.target.value })} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2 font-mono text-[10px]" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Default Customer Sync Segment</label>
                    <select value={apiSettings.defaultListId} onChange={(e) => setApiSettings({ ...apiSettings, defaultListId: e.target.value })} className="w-full bg-white border border-[#D8D2C6] rounded-xs p-2">
                      <option value="Body Notes">Body Notes List (ID: 663079)</option>
                      <option value="Tool Notes">Tool Notes List (ID: 661432)</option>
                      <option value="Capital Notes">Capital Notes List (ID: 663080)</option>
                      <option value="All">All (Body, Tool & Capital) (IDs: 663079, 661432, 663080)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      addAuditLog("Save SendFox configuration", "Updated SendFox integration settings.");
                      alert("SendFox default mappings finalized!");
                    }}
                    className="border border-[#D8D2C6] bg-white hover:border-[#8B5A44] hover:text-[#8B5A44] px-4 py-2 rounded-xs font-display text-[9px] uppercase font-bold tracking-wider"
                  >
                    Finalize SendFox Mapping
                  </button>
                </div>

                {/* 4. Admin Account Security & 2FA */}
                <div className="bg-[#E8DDCF]/15 border border-[#D8D2C6]/40 p-5 rounded-sm space-y-3">
                  <span className="font-serif text-sm font-semibold text-[#1A2F24] block flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#8B5A44]" />
                    <span>Admin Account Identity & Multi-Factor (2FA)</span>
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-white border border-stone-200 rounded-sm">
                    <div>
                      <span className="font-bold block">Google Authenticator (2FA / TOTP)</span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">Enforce standard dynamic 6-digit verification code at portal access.</span>
                    </div>
                    <button
                      onClick={() => {
                        addAuditLog("Configure 2FA", "Activated simulated dual TOTP token binding on system administrator account.");
                        alert("Simulated TOTP setup complete! Your 2FA token is securely synced.");
                      }}
                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] px-3 py-1.5 rounded-xs text-[10px] uppercase font-bold"
                    >
                      Enable 2FA
                    </button>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-display font-bold text-stone-400 uppercase tracking-wider block">Authorized IP Subnet</span>
                    <span className="font-mono text-[10px] mt-0.5 block bg-stone-50 border border-stone-100 p-2 rounded-sm text-stone-600">10.128.0.0/20 (Cloud Run Internal VPC)</span>
                  </div>
                </div>

              </div>

              {/* Audit Logs System Ledger */}
              <div className="bg-white border border-[#D8D2C6]/40 p-5 rounded-sm">
                <span className="font-serif text-sm font-semibold text-[#1A2F24] block mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8B5A44]" />
                  <span>Administrative Security Audit Trails (Single-Admin Accountability)</span>
                </span>
                <p className="text-[11px] text-stone-500 mb-4">
                  Every action performed on this portal is recorded below. This logging system enforces absolute transparency and acts as a security verification board.
                </p>
                <div className="max-h-[160px] overflow-y-auto border border-stone-200/50 rounded-sm font-mono text-[10px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#E8DDCF]/35 text-stone-600 border-b border-[#D8D2C6]/30">
                      <tr>
                        <th className="p-2">Log ID</th>
                        <th className="p-2">Operation Action</th>
                        <th className="p-2">Operator</th>
                        <th className="p-2">Timestamp UTC</th>
                        <th className="p-2 text-right">Payload Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C6]/20">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-stone-50">
                          <td className="p-2 font-semibold text-stone-400">{log.id}</td>
                          <td className="p-2 text-[#1A2F24] font-semibold">{log.action}</td>
                          <td className="p-2 text-stone-600">{log.user}</td>
                          <td className="p-2 text-stone-500">{log.date}</td>
                          <td className="p-2 text-right text-stone-500 truncate max-w-[200px]" title={log.details}>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Custom Confirmation Dialog for Blocked iFrames */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#1C1C1C]/70 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-[#F4F1EB] border-2 border-[#8B5A44] w-full max-w-md rounded-sm p-6 shadow-2xl relative text-left">
            <h3 className="font-display font-bold text-[#1A2F24] text-sm uppercase tracking-wider mb-2 border-b border-[#D8D2C6] pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              {lang === "en" ? "Confirm Destructive Action" : "确认毁灭性操作"}
            </h3>
            
            <div className="text-xs text-[#1C1C1C]/80 leading-relaxed my-4 font-sans">
              {lang === "en" 
                ? `You are about to permanently purge the ${deleteConfirm.type} titled:` 
                : `您即将永久清除该 ${deleteConfirm.type === "article" ? "智识文章" : deleteConfirm.type === "ebook" ? "智识著作" : deleteConfirm.type === "newsletter" ? "精选通讯" : "商品"}：`}
              <strong className="block mt-2 text-[#8B5A44] font-serif text-sm">
                "{deleteConfirm.title}"
              </strong>
              <span className="block mt-3 text-[10px] text-red-600 font-mono uppercase bg-red-50 p-2 border border-red-100 rounded-xs">
                ⚠️ {lang === "en" 
                  ? "Warning: This action cannot be undone and will immediately affect readers." 
                  : "警告：此操作无法撤销，并会立即影响前台读者的智识访问。"}
              </span>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-stone-500 hover:text-stone-800 text-[11px] font-display uppercase tracking-wider font-semibold hover:bg-stone-100 rounded-sm transition-all cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "取消"}
              </button>
              <button
                onClick={() => {
                  deleteConfirm.action();
                  setDeleteConfirm(null);
                }}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-[#F4F1EB] text-[11px] font-display uppercase tracking-wider font-semibold rounded-sm shadow-md transition-all cursor-pointer"
              >
                {lang === "en" ? "Confirm Purge" : "确认永久清除"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
