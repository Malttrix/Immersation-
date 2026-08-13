/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo, FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Compass,
  Layers,
  Sparkles,
  Workflow,
  TrendingUp,
  Activity,
  Cpu,
  Coins,
  ArrowUpRight,
  ArrowRight,
  Mail,
  CheckCircle,
  Menu,
  X,
  Volume2,
  VolumeX,
  FileText,
  User,
  ShoppingBag,
  CreditCard,
  Lock,
  Unlock,
  Trash2,
  ShieldCheck,
  Database,
  Settings,
  Check, ChevronDown
} from "lucide-react";
import {
  navigationLinks,
  heroContent,
  brandEssenceContent,
  productBooks,
  threePillarsContent,
  whatWeCreateContent,
  journalArticles,
  advantageContent,
  newsletterContent,
  footerContent
} from "./data";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { defaultArticles } from "./articlesData";
import { subscribeToSendfox } from "./lib/sendfox";
import { trackPageView, trackCartAddition, trackCheckoutInitiation } from "./lib/analytics";
import AboutView from "./components/AboutView";
import PrivacyView from "./components/PrivacyView";
import TermsView from "./components/TermsView";
import NewsletterView from "./components/NewsletterView";
import MindfulnessPillarView from "./components/MindfulnessPillarView";
import AIPillarView from "./components/AIPillarView";
import WealthPillarView from "./components/WealthPillarView";
import ArticlesView from "./components/ArticlesView";
import ReadingRoomView from "./components/ReadingRoomView";
import ListeningRoomView from "./components/ListeningRoomView";
import DigitalPublishingView from "./components/DigitalPublishingView";
import EditorialIntelligenceView from "./components/EditorialIntelligenceView";
import AIToolkitsView from "./components/AIToolkitsView";
import AudioExperiencesView from "./components/AudioExperiencesView";
import WealthFrameworksView from "./components/WealthFrameworksView";
import PillarsView from "./components/PillarsView";
import AdminDashboard from "./components/AdminDashboard";
import SEOHead from "./components/SEOHead";

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private droneOscs: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private masterGain: GainNode | null = null;
  private isDronePlaying = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playChime() {
    this.initContext();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Pentatonic calm wind chime notes
    const frequencies = [783.99, 987.77, 1174.66, 1318.51, 1567.98];
    const gains = [0.10, 0.07, 0.05, 0.04, 0.03];
    
    frequencies.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq + (index * 4), now + 1.5);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gains[index], now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0 + index * 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 4.5);
    });
    
    // Grounding bass note (low G)
    const lowFreqs = [196.00, 293.66];
    lowFreqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  toggleAmbient(state: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (state && !this.isDronePlaying) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.20, now + 1.5);

      const freqs = [98.00, 146.83, 196.00, 246.94, 293.66];
      const vols = [0.05, 0.04, 0.03, 0.02, 0.02];

      this.droneOscs = [];
      this.droneGains = [];

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq + (Math.sin(idx) * 0.5), now + 10);
        
        gain.gain.setValueAtTime(vols[idx], now);
        
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.12 + (idx * 0.03);
        lfoGain.gain.value = vols[idx] * 0.35;
        
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        
        lfo.start(now);
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        this.droneOscs.push(osc);
        this.droneGains.push(gain);
      });

      this.isDronePlaying = true;
    } else if (!state && this.isDronePlaying) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);

      const currentOscs = [...this.droneOscs];
      setTimeout(() => {
        if (!this.isDronePlaying) {
          currentOscs.forEach(o => {
            try { o.stop(); } catch(e){}
          });
        }
      }, 1600);

      this.droneOscs = [];
      this.droneGains = [];
      this.isDronePlaying = false;
    }
  }
}

const getPathForView = (view: string, slug?: string | null): string => {
  switch (view) {
    case "about": return "/about-us";
    case "privacy": return "/privacy-policy";
    case "terms": return "/terms-of-use";
    case "newsletter": return "/newsletter";
    case "articles": return slug ? `/articles/${slug}` : "/articles";
    case "pillars": return "/pillars";
    case "pillar-mindfulness": return "/pillars/mindfulness-health-longevity";
    case "pillar-ai": return "/pillars/ai-automation";
    case "pillar-wealth": return "/pillars/wealth-cognition";
    case "digital-publishing": return "/products/digital-publishing";
    case "ai-toolkits": return "/products/ai-toolkits";
    case "audio-experiences": return "/products/audio-experiences";
    case "wealth-frameworks": return "/products/wealth-frameworks";
    case "editorial-intelligence": return "/editorial-intelligence";
    case "reading-room": return "/reading-room";
    case "listening-room": return "/listening-room";
    case "home":
    default: return "/";
  }
};

const getViewForPath = (pathWithHash: string): { view: "home" | "about" | "privacy" | "terms" | "newsletter" | "pillar-mindfulness" | "pillar-ai" | "pillar-wealth" | "articles" | "reading-room" | "listening-room" | "digital-publishing" | "editorial-intelligence" | "ai-toolkits" | "audio-experiences" | "wealth-frameworks" | "pillars"; slug: string | null } => {
  const rawPath = pathWithHash.toLowerCase().split('?')[0].split('#')[0];
  const cleanPath = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
  
  if (cleanPath === "/about-us" || cleanPath.includes("about")) {
    return { view: "about", slug: null };
  }
  if (cleanPath === "/privacy-policy" || cleanPath.includes("privacy")) {
    return { view: "privacy", slug: null };
  }
  if (cleanPath === "/terms-of-use" || cleanPath === "/terms" || cleanPath.includes("terms")) {
    return { view: "terms", slug: null };
  }
  if (cleanPath === "/newsletter" || cleanPath.includes("newsletter")) {
    return { view: "newsletter", slug: null };
  }
  if (cleanPath.startsWith("/articles/")) {
    const rawSlug = cleanPath.substring("/articles/".length);
    const slug = rawSlug.replace(/\/+$/, "");
    return { view: "articles", slug: slug || null };
  }
  if (cleanPath === "/articles" || cleanPath.includes("articles")) {
    return { view: "articles", slug: null };
  }
  if (cleanPath === "/pillars" || cleanPath.includes("pillars")) {
    return { view: "pillars", slug: null };
  }
  if (cleanPath.includes("mindfulness-health-longevity")) {
    return { view: "pillar-mindfulness", slug: null };
  }
  if (cleanPath.includes("ai-automation")) {
    return { view: "pillar-ai", slug: null };
  }
  if (cleanPath.includes("wealth-cognition")) {
    return { view: "pillar-wealth", slug: null };
  }
  if (cleanPath.includes("digital-publishing")) {
    return { view: "digital-publishing", slug: null };
  }
  if (cleanPath.includes("ai-toolkits")) {
    return { view: "ai-toolkits", slug: null };
  }
  if (cleanPath.includes("audio-experiences")) {
    return { view: "audio-experiences", slug: null };
  }
  if (cleanPath.includes("wealth-frameworks")) {
    return { view: "wealth-frameworks", slug: null };
  }
  if (cleanPath.includes("editorial-intelligence") || cleanPath.includes("editorial")) {
    return { view: "editorial-intelligence", slug: null };
  }
  if (cleanPath.includes("reading-room")) {
    return { view: "reading-room", slug: null };
  }
  if (cleanPath.includes("listening-room")) {
    return { view: "listening-room", slug: null };
  }
  
  return { view: "home", slug: null };
};

const ensureBilingualHelper = (field: any, defaultEn = "", defaultZh = "") => {
  if (typeof field === "string") {
    return { en: field, zh: field };
  }
  if (field && typeof field === "object") {
    return {
      en: field.en || defaultEn,
      zh: field.zh || defaultZh
    };
  }
  return { en: defaultEn, zh: defaultZh };
};

const defaultCoverPalettes = [
  { coverColor: "bg-[#1A2F24]", borderColor: "border-[#1A2F24]", textColor: "text-[#F4F1EB]", accentColor: "text-[#B69A6B]" },
  { coverColor: "bg-[#8B5A44]", borderColor: "border-[#8B5A44]", textColor: "text-[#F4F1EB]", accentColor: "text-[#E8DDCF]" },
  { coverColor: "bg-[#1C1C1C]", borderColor: "border-[#1C1C1C]", textColor: "text-[#F4F1EB]", accentColor: "text-[#B69A6B]" },
  { coverColor: "bg-[#2D3A32]", borderColor: "border-[#2D3A32]", textColor: "text-[#F4F1EB]", accentColor: "text-[#E8DDCF]" },
  { coverColor: "bg-[#3D2D20]", borderColor: "border-[#3D2D20]", textColor: "text-[#F4F1EB]", accentColor: "text-[#B69A6B]" },
];

const sanitizeBooks = (items: any[]): any[] => {
  const seen = new Set<string>();
  const uniqueItems: any[] = [];
  (items || []).forEach((b, idx) => {
    if (!b) return;
    const identifier = b.id || `generated-book-id-${Math.random()}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      const palette = defaultCoverPalettes[idx % defaultCoverPalettes.length];
      const coverImg = b.cover || b.coverImageUrl || b.cover_image_url || "";
      let rawFlip = typeof b.html5FlipbookUrl === "string" ? b.html5FlipbookUrl.trim() : (typeof b.flipbookUrl === "string" ? b.flipbookUrl.trim() : "");
      if (!rawFlip && b.epubSourceUrl && typeof b.epubSourceUrl === "string") {
        rawFlip = b.epubSourceUrl.trim();
      }
      let sanitizedFlipbookUrl = rawFlip;
      if (sanitizedFlipbookUrl.toLowerCase().endsWith(".epub")) {
        sanitizedFlipbookUrl = sanitizedFlipbookUrl.substring(0, sanitizedFlipbookUrl.length - 5) + ".html";
      } else if (sanitizedFlipbookUrl.toLowerCase().endsWith(".pdf")) {
        sanitizedFlipbookUrl = "";
      }
      if (sanitizedFlipbookUrl.startsWith("http://")) {
        sanitizedFlipbookUrl = sanitizedFlipbookUrl.replace("http://", "https://");
      }
      uniqueItems.push({
        ...b,
        id: identifier,
        title: ensureBilingualHelper(b.title, "Untitled Product", "未命名产品"),
        description: ensureBilingualHelper(b.description, "", ""),
        tagline: ensureBilingualHelper(b.tagline || b.description, "", ""),
        format: ensureBilingualHelper(b.format, "eBook", "电子书"),
        badge: ensureBilingualHelper(b.badge, "Member / Paid", "会员免费 / 付费"),
        pillar: ensureBilingualHelper(b.pillar, "Body", "身体"),
        coverColor: b.coverColor || palette.coverColor,
        borderColor: b.borderColor || palette.borderColor,
        textColor: b.textColor || palette.textColor,
        accentColor: b.accentColor || palette.accentColor,
        cover: coverImg,
        coverImageUrl: coverImg,
        html5FlipbookUrl: sanitizedFlipbookUrl,
        flipbookUrl: sanitizedFlipbookUrl,
      });
    }
  });
  return uniqueItems;
};

const sanitizeArticles = (items: any[]): any[] => {
  const seen = new Set<string>();
  const uniqueItems: any[] = [];
  (items || []).forEach(a => {
    if (!a) return;
    const identifier = a.id || a.slug || `generated-art-id-${Math.random()}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniqueItems.push({
        ...a,
        id: identifier,
        title: ensureBilingualHelper(a.title, "Untitled Essay", "无题文章"),
        excerpt: ensureBilingualHelper(a.excerpt || a.description, "", ""),
        description: ensureBilingualHelper(a.description || a.excerpt, "", ""),
        content: ensureBilingualHelper(a.content, "", ""),
        date: ensureBilingualHelper(a.date, "JUL 2026", "2026年7月"),
        readTime: ensureBilingualHelper(a.readTime, "5 MIN READ", "阅读时间 5 分钟"),
        category: ensureBilingualHelper(a.category, "General", "常规"),
      });
    }
  });
  return uniqueItems;
};

const sanitizeNewsletters = (items: any[]): any[] => {
  const seen = new Set<string>();
  const uniqueItems: any[] = [];
  (items || []).forEach(n => {
    if (!n) return;
    const identifier = n.id || n.issue || `generated-nl-id-${Math.random()}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniqueItems.push({
        ...n,
        id: identifier,
        title: ensureBilingualHelper(n.title, "Untitled Issue", "未命名特刊"),
        excerpt: ensureBilingualHelper(n.excerpt || n.description, "", ""),
        category: ensureBilingualHelper(n.category, "Newsletter", "新闻信"),
        readTime: ensureBilingualHelper(n.readTime, "5 MIN READ", "阅读时间 5 分钟"),
        content: ensureBilingualHelper(n.content, "", ""),
      });
    }
  });
  return uniqueItems;
};

export default function App() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subInterests, setSubInterests] = useState<string[]>(["body", "tool", "capital"]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [books, setBooks] = useState<any[]>(() => {
    let initial = [...productBooks];
    try {
      const saved = localStorage.getItem("immersation_books");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initial = initial.map((defBook: any) => {
            const localBook = parsed.find((b: any) => b.id === defBook.id);
            if (localBook) {
              return { ...defBook, ...localBook };
            }
            return defBook;
          });
          const initialIds = new Set(initial.map(b => b.id));
          parsed.forEach((localBook: any) => {
            if (localBook.id && !initialIds.has(localBook.id)) {
              initial.push(localBook);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error reading immersation_books from localStorage", e);
    }
    return sanitizeBooks(initial);
  });
  useEffect(() => {
    localStorage.setItem("immersation_books", JSON.stringify(books));
  }, [books]);

  // Fetch products (books) from Supabase
  useEffect(() => {
    let productsSubscription: any = null;
    if (supabase) {
      const fetchSupabaseProducts = () => {
        supabase.from('products').select('*').then(({ data, error }) => {
          if (!error && data) {
            setBooks(prevBooks => {
              const updated = data.map((spItem: any) => {
                const existing = prevBooks.find((b: any) => b.id === spItem.id);
                const spHtml5 = spItem.html5FlipbookUrl || spItem.html5_flipbook_url || spItem.flipbookUrl;
                const finalHtml5 = spHtml5 && String(spHtml5).trim() !== "" ? String(spHtml5).trim() : (existing?.html5FlipbookUrl || existing?.flipbookUrl || "");
                return {
                  ...existing,
                  ...spItem,
                  html5FlipbookUrl: finalHtml5,
                  flipbookUrl: finalHtml5
                };
              });
              const spIds = new Set(data.map((sp: any) => sp.id));
              prevBooks.forEach((pb: any) => {
                if (pb.id && !spIds.has(pb.id)) {
                  updated.push(pb);
                }
              });
              return sanitizeBooks(updated);
            });
          }
        });
      };
      
      fetchSupabaseProducts();
      
      productsSubscription = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          console.log("Supabase Realtime: products table changed", payload);
          fetchSupabaseProducts();
        })
        .subscribe();
    }
    
    return () => {
      if (productsSubscription && supabase) {
        supabase.removeChannel(productsSubscription);
      }
    };
  }, []);
  const [articles, setArticles] = useState<any[]>(() => {
    let initial = [...defaultArticles];
    try {
      const saved = localStorage.getItem("immersation_articles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          initial = initial.map((defArt: any) => {
            const defSlug = defArt.slug || defArt.id;
            const localArt = parsed.find(a => (a.slug || a.id) === defSlug);
            if (localArt) {
              const defTime = new Date(defArt.updatedAt || 0).getTime();
              const localTime = new Date(localArt.updatedAt || 0).getTime();
              // Prefer local if it's newer or equal, allowing edits to persist
              return localTime >= defTime ? { ...defArt, ...localArt } : defArt;
            }
            return defArt;
          });

          // Add locally created articles
          const initialSlugs = new Set(initial.map(a => a.slug || a.id));
          parsed.forEach((localArt: any) => {
            const localSlug = localArt.slug || localArt.id;
            if (localSlug && !initialSlugs.has(localSlug)) {
              initial.push(localArt);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error parsing articles from localStorage", e);
    }
    return sanitizeArticles(initial);
  });

  useEffect(() => {
    localStorage.setItem("immersation_articles", JSON.stringify(articles));
  }, [articles]);

  // Fetch articles from Supabase to ensure live sync
  useEffect(() => {
    // 1. First fetch server-side synced articles cache (from local filesystem workspace)
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(prev => {
            let merged = [...prev];
            data.articles.forEach((serverArt: any) => {
              const serverId = serverArt.id || serverArt.slug;
              const existingIdx = merged.findIndex(a => (a.id || a.slug) === serverId);
              if (existingIdx !== -1) {
                const existing = merged[existingIdx];
                const existingTime = new Date(existing.updatedAt || 0).getTime();
                const serverTime = new Date(serverArt.updatedAt || 0).getTime();
                if (serverTime > existingTime) {
                  merged[existingIdx] = { ...existing, ...serverArt };
                }
              } else {
                merged.push(serverArt);
              }
            });
            return sanitizeArticles(merged);
          });
        }
      })
      .catch(err => console.error("Error loading server articles sync cache:", err));

    // 2. Fetch from Supabase if configured
    let articlesSubscription: any = null;
    if (supabase) {
      const fetchSupabaseArticles = () => {
        console.log("fetchSupabaseArticles called");
        supabase.from('articles').select('*').then(({ data, error }) => {
          if (!error && data) {
            // When Supabase is connected, it becomes the ABSOLUTE source of truth.
            // Ignore defaultArticles/localStorage to ensure exact sync with live site.
            const sanitizedData = sanitizeArticles(data);
            
            // Sort by date (descending)
            sanitizedData.sort((a, b) => {
              const dateA = a.date?.en ? new Date(a.date.en).getTime() : 0;
              const dateB = b.date?.en ? new Date(b.date.en).getTime() : 0;
              return dateB - dateA;
            });
            
            setArticles(sanitizedData);
          }
        });
      };
      
      fetchSupabaseArticles();
      
      articlesSubscription = supabase
        .channel('public:articles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, (payload) => {
          console.log("Supabase Realtime: articles table changed", payload);
          fetchSupabaseArticles();
        })
        .subscribe();
    }
    
    return () => {
      if (articlesSubscription && supabase) {
        supabase.removeChannel(articlesSubscription);
      }
    };
  }, []);
  const [newsletterIssues, setNewsletterIssues] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_newsletters_v2");
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return sanitizeNewsletters(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Error parsing newsletters from localStorage", e);
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("immersation_newsletters_v2", JSON.stringify(newsletterIssues));
  }, [newsletterIssues]);

  // Fetch newsletters from Supabase
  useEffect(() => {
    if (supabase) {
      supabase.from('newsletters').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Sort by date (descending)
          const merged = [...data].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
          setNewsletterIssues(sanitizeNewsletters(merged));
        }
      });
    }
  }, []);

  // Fetch purchases from Supabase to ensure live transaction data in admin dashboard
  useEffect(() => {
    if (supabase) {
      supabase
        .from("purchases")
        .select("*")
        .order("purchased_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const loaded = data.map((item: any) => ({
              id: item.transaction_id || `TXN-${item.id}`,
              email: item.user_email,
              item: item.items,
              amount: Number(item.amount),
              date: item.purchased_at ? item.purchased_at.split("T")[0] : new Date().toISOString().split("T")[0],
              status: item.status || "Successful"
            }));
            setSystemTransactions(loaded);
          }
        });
    }
  }, []);

  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(() => {
    const initialPath = window.location.pathname;
    const { slug } = getViewForPath(initialPath);
    return slug;
  });
  const [activeView, setActiveView] = useState<"home" | "about" | "privacy" | "terms" | "newsletter" | "pillar-mindfulness" | "pillar-ai" | "pillar-wealth" | "articles" | "reading-room" | "listening-room" | "digital-publishing" | "editorial-intelligence" | "ai-toolkits" | "audio-experiences" | "wealth-frameworks" | "pillars" | "admin">(() => {
    const initialPath = window.location.pathname;
    const { view } = getViewForPath(initialPath);
    return view as any;
  });
  const [lastNonRoomView, setLastNonRoomView] = useState<any>("home");

  useEffect(() => {
    if (activeView !== "reading-room" && activeView !== "listening-room") {
      setLastNonRoomView(activeView);
    }
  }, [activeView]);
  const [selectedReadingBookId, setSelectedReadingBookId] = useState<string | null>(null);
  const [journalProgress, setJournalProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Cart & Account States
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("immersation_user_email") || null;
  });
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Google Auth & Admin States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googlePasswordInput, setGooglePasswordInput] = useState("");
  const [googleAuthError, setGoogleAuthError] = useState("");
  const [isLiveCheckout, setIsLiveCheckout] = useState(false);
  const [adminTab, setAdminTab] = useState<"overview" | "members" | "books" | "transactions" | "library">("overview");

  const [systemMembers, setSystemMembers] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_members");
    if (saved) return JSON.parse(saved);
    return [
    { email: "dreammyhomee@gmail.com", role: "System Administrator", joined: "2026-05-01", status: "Active", regMethod: "Google Account" },
    { email: "support@immersation.com", role: "Active Thought Leader", joined: "2026-05-15", status: "Active", regMethod: "Google Account" },
    { email: "guest.thinker@gmail.com", role: "Active Thought Leader", joined: "2026-06-12", status: "Active", regMethod: "Google Account" },
    { email: "john.doe@gmail.com", role: "Active Thought Leader", joined: "2026-07-02", status: "Active", regMethod: "Google Account" }
  ];
  });
  useEffect(() => {
    localStorage.setItem("immersation_members", JSON.stringify(systemMembers));
  }, [systemMembers]);

  const [systemTransactions, setSystemTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem("immersation_transactions");
    if (saved) return JSON.parse(saved);
    return [
    { id: "TXN-9021", email: "support@immersation.com", item: "Substack Article System", amount: 19.00, date: "2026-07-01", status: "Successful" },
    { id: "TXN-8742", email: "guest.thinker@gmail.com", item: "Sovereign Digital Infrastructure", amount: 19.00, date: "2026-07-04", status: "Successful" },
    { id: "TXN-7391", email: "dreammyhomee@gmail.com", item: "Personal Intelligence System Bundle", amount: 49.00, date: "2026-07-08", status: "Successful" }
  ];
  });
  useEffect(() => {
    localStorage.setItem("immersation_transactions", JSON.stringify(systemTransactions));
  }, [systemTransactions]);

  // Payment Gateway & Digital Library Unlocked States
  const [unlockedBookIds, setUnlockedBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("immersation_unlocked_books");
    return saved ? JSON.parse(saved) : ["starter-kit"]; // starter-kit unlocked by default
  });
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "processing" | "success">("cart");
  const [orderReceipt, setOrderReceipt] = useState<any[]>([]);

  const [isStripeConfigured, setIsStripeConfigured] = useState(false);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);

  // Sandbox Payment States
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSandboxPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    
    const cleanCard = cardNumber.replace(/\s+/g, "");
    
    // Validate card number length
    if (cleanCard.length < 13 || cleanCard.length > 19 || !/^\d+$/.test(cleanCard)) {
      setPaymentError(
        lang === "en"
          ? "Declined: Please enter a valid card number (13-19 digits)."
          : "交易拒绝：请输入有效的卡号（13-19位数字）。"
      );
      return;
    }

    // Validate Luhn Algorithm Check (prevent credit card fraud/random numbers)
    let luhnSum = 0;
    let shouldDouble = false;
    for (let i = cleanCard.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCard.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      luhnSum += digit;
      shouldDouble = !shouldDouble;
    }
    
    if (luhnSum % 10 !== 0) {
      setPaymentError(
        lang === "en"
          ? "Declined: Invalid credit card number (failed checksum verification). Use a valid sandbox card (e.g., 4242 4242 4242 4242)."
          : "交易拒绝：无效的信用卡卡号（未通过校验和校验）。请使用有效的沙盒测试卡号（例如：4242 4242 4242 4242）。"
      );
      return;
    }

    // Validate expiry date MM/YY format
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setPaymentError(
        lang === "en"
          ? "Declined: Expiry date must be in MM/YY format."
          : "交易拒绝：到期日必须为 MM/YY 格式。"
      );
      return;
    }

    const [monthStr, yearStr] = cardExpiry.split("/");
    const month = parseInt(monthStr, 10);
    if (month < 1 || month > 12) {
      setPaymentError(
        lang === "en"
          ? "Declined: Invalid expiration month."
          : "交易拒绝：无效的到期月份。"
      );
      return;
    }

    // Validate expiry is in the future
    const currentYearShort = parseInt(new Date().getFullYear().toString().slice(-2), 10);
    const currentMonth = new Date().getMonth() + 1;
    const expYearShort = parseInt(yearStr, 10);
    
    if (expYearShort < currentYearShort || (expYearShort === currentYearShort && month < currentMonth)) {
      setPaymentError(
        lang === "en"
          ? "Declined: This card has already expired."
          : "交易拒绝：该卡片已过期。"
      );
      return;
    }

    // Validate CVC
    if (!cardCvc || cardCvc.length < 3 || cardCvc.length > 4 || !/^\d+$/.test(cardCvc)) {
      setPaymentError(
        lang === "en"
          ? "Declined: Invalid CVC (3-4 digits)."
          : "交易拒绝：无效的 CVC 安全码（3-4位数字）。"
      );
      return;
    }

    // Validate ZIP/Postcode
    if (!cardZip || cardZip.trim().length < 3) {
      setPaymentError(
        lang === "en"
          ? "Declined: Invalid ZIP Code."
          : "交易拒绝：无效的邮政编码。"
      );
      return;
    }

    setCheckoutStep("processing");

    setTimeout(() => {
      const newUnlocked = [...unlockedBookIds, ...cartItems.map(item => item.id)];
      const uniqueUnlocked = Array.from(new Set(newUnlocked));
      setUnlockedBookIds(uniqueUnlocked);
      localStorage.setItem("immersation_unlocked_books", JSON.stringify(uniqueUnlocked));
      
      // Append simulated transaction log
      const totalAmount = cartItems.reduce((acc, item) => acc + (item.price || 19.00), 0);
      const newTx = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        email: userEmail || "support@immersation.com",
        item: cartItems.map(item => typeof item.title === "object" && item.title !== null ? (item.title[lang] || item.title.en || item.title.zh) : (item.title || "Item")).join(", "),
        amount: totalAmount,
        date: new Date().toISOString().split("T")[0],
        status: "Successful"
      };
      setSystemTransactions(prev => [newTx, ...prev]);

      // Sync transaction to Supabase database if configured
      if (supabase) {
        try {
          supabase
            .from("purchases")
            .insert([{
              transaction_id: newTx.id,
              user_email: newTx.email,
              items: newTx.item,
              amount: newTx.amount,
              purchased_at: new Date().toISOString(),
              status: newTx.status
            }])
            .then(({ error }) => {
              if (error) console.warn("Supabase purchase sync skipped/table missing:", error);
            });
        } catch (err) {
          console.warn("Supabase purchase sync error:", err);
        }
      }

      // If simulated user doesn't exist in our list, add them!
      if (userEmail && !systemMembers.some(m => m.email === userEmail)) {
        setSystemMembers(prev => [...prev, { email: userEmail, role: "Active Thought Leader", joined: new Date().toISOString().split("T")[0], status: "Active" }]);
      }

      setOrderReceipt([...cartItems]);
      setCartItems([]);
      setCheckoutStep("success");
      
      if (audioEngineRef.current) audioEngineRef.current.playChime();
    }, 2200);
  };

  // Check if Stripe configuration is active on server
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.stripe_configured) {
          setIsStripeConfigured(true);
        }
      })
      .catch((err) => console.error("Stripe configuration check failed:", err));
  }, []);

  // Close popup window if authenticated and notify opener window
  useEffect(() => {
    if (window.opener && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS", email: session.user.email }, "*");
          window.close();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS", email: session.user.email }, "*");
          window.close();
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Listen to Supabase Auth State Changes if configured
  useEffect(() => {
    if (!supabase) return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email;
        if (email) {
          localStorage.setItem("immersation_user_email", email);
          localStorage.setItem("immersation_login_type", "oauth");
          setUserEmail(email);
          setSystemMembers(prev => {
            if (prev.some(m => m.email === email)) return prev;
            return [...prev, {
              email,
              role: email === "dreammyhomee@gmail.com" ? "System Administrator" : "Active Thought Leader",
              joined: new Date().toISOString().split("T")[0],
              status: "Active",
              regMethod: "Google Account"
            }];
          });
          setShowGoogleModal(false);
          setIsSigningIn(false);
          if (email === "dreammyhomee@gmail.com") {
            const allBookIds = books.map(b => b.id);
            setUnlockedBookIds(allBookIds);
            localStorage.setItem("immersation_unlocked_books", JSON.stringify(allBookIds));
          }
        }
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email;
        if (email) {
          localStorage.setItem("immersation_user_email", email);
          localStorage.setItem("immersation_login_type", "oauth");
          setUserEmail(email);
          setSystemMembers(prev => {
            if (prev.some(m => m.email === email)) return prev;
            return [...prev, {
              email,
              role: email === "dreammyhomee@gmail.com" ? "System Administrator" : "Active Thought Leader",
              joined: new Date().toISOString().split("T")[0],
              status: "Active",
              regMethod: "Google Account"
            }];
          });
          setShowGoogleModal(false);
          setIsSigningIn(false);
          if (email === "dreammyhomee@gmail.com") {
            const allBookIds = books.map(b => b.id);
            setUnlockedBookIds(allBookIds);
            localStorage.setItem("immersation_unlocked_books", JSON.stringify(allBookIds));
          }
        }
      } else if (event === "SIGNED_OUT") {
        const loginType = localStorage.getItem("immersation_login_type");
        if (loginType === "oauth") {
          localStorage.removeItem("immersation_user_email");
          localStorage.removeItem("immersation_login_type");
          setUserEmail(null);
        }
      }
    });

    // Listen for popup auth success messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== "https://immersation.com" && event.origin !== "https://www.immersation.com") return;
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const email = event.data.email;
        if (email) {
          localStorage.setItem("immersation_user_email", email);
          localStorage.setItem("immersation_login_type", "oauth");
          setUserEmail(email);
          setSystemMembers(prev => {
            if (prev.some(m => m.email === email)) return prev;
            return [...prev, {
              email,
              role: email === "dreammyhomee@gmail.com" ? "System Administrator" : "Active Thought Leader",
              joined: new Date().toISOString().split("T")[0],
              status: "Active",
              regMethod: "Google Account"
            }];
          });
          setShowGoogleModal(false);
          setIsSigningIn(false);
          if (email === "dreammyhomee@gmail.com") {
            const allBookIds = books.map(b => b.id);
            setUnlockedBookIds(allBookIds);
            localStorage.setItem("immersation_unlocked_books", JSON.stringify(allBookIds));
          }
          // Refresh the session in the main window to ensure supabase client is authenticated
          if (supabase) {
            supabase.auth.getSession();
          }
        }
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("message", handleMessage);
    };
  }, [books]);

  // Check for OAuth error in URL on mount
  useEffect(() => {
    
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      alert(`OAuth Error: ${errorDescription || error}\n\nPlease check your Supabase Redirect URLs configuration. Ensure that ${window.location.origin} is explicitly listed as a Redirect URL.`);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  // Verify Stripe checkout session on mount (redirected back from Stripe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutSuccess = params.get("checkout_success");
    const sessionId = params.get("session_id");

    if (checkoutSuccess && sessionId) {
      setCheckoutStep("processing");
      setCartOpen(true);

      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid && data.books) {
            setUnlockedBookIds((prev) => {
              const next = [...prev];
              data.books.forEach((id: string) => {
                if (!next.includes(id)) {
                  next.push(id);
                }
              });
              return next;
            });
            
            // Reconstruct cart items or receipt items
            const items = data.books.map((id: string) => 
              books.find((b) => b.id === id)
            ).filter(Boolean);
            
            setOrderReceipt(items);
            setCheckoutStep("success");
            setCartItems([]); // Clear cart upon success

            // Clean URL query parameters
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            if (audioEngineRef.current) audioEngineRef.current.playChime();
          } else {
            setCheckoutStep("cart");
            alert(lang === "en" 
              ? "Your payment could not be verified by Stripe. Please contact support." 
              : "Stripe 无法验证您的支付状态。请重试或联系客服。");
          }
        })
        .catch((err) => {
          console.error("Error verifying Stripe session:", err);
          setCheckoutStep("cart");
        });
    } else if (params.get("checkout_canceled") === "true") {
      setCheckoutStep("cart");
      setCartOpen(true);
      // Clean URL query parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [lang]);

  const handleStripeCheckout = async () => {
    setIsRedirectingToStripe(true);
    setCheckoutStep("processing");
    if (audioEngineRef.current) audioEngineRef.current.playChime();

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          lang,
          originUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      alert(lang === "en" 
        ? `Could not connect to payment gateway: ${error.message}` 
        : `支付网关连接失败: ${error.message}`);
      setCheckoutStep("cart");
    } finally {
      setIsRedirectingToStripe(false);
    }
  };

  // Save unlocked books to localStorage
  useEffect(() => {
    localStorage.setItem("immersation_unlocked_books", JSON.stringify(unlockedBookIds));
  }, [unlockedBookIds]);

  // Reset checkout step when cart closes
  useEffect(() => {
    if (!cartOpen) {
      setCheckoutStep("cart");
    }
  }, [cartOpen]);

  // Track page views in real-time
  useEffect(() => {
    trackPageView();
  }, [activeView, activeArticleSlug]);

  // Track cart additions in real-time
  const lastCartLengthRef = useRef(0);
  useEffect(() => {
    if (cartItems.length > lastCartLengthRef.current) {
      trackCartAddition();
    }
    lastCartLengthRef.current = cartItems.length;
  }, [cartItems]);

  // Track checkout initiations in real-time
  useEffect(() => {
    if (checkoutStep === "payment") {
      trackCheckoutInitiation();
    }
  }, [checkoutStep]);

  const audioEngineRef = useRef<AmbientAudioEngine | null>(null);

  // Generate deterministic jagged path coordinates to simulate a physical torn paper edge
  const { tornPaths, tornPathsSecondary } = useMemo(() => {
    const width = 1440;
    const segments = 120;
    const segmentWidth = width / segments;
    const points1 = [];
    const points2 = [];
    
    let seed1 = 123;
    const random1 = () => {
      const x = Math.sin(seed1++) * 10000;
      return x - Math.floor(x);
    };

    let seed2 = 456;
    const random2 = () => {
      const x = Math.sin(seed2++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i <= segments; i++) {
      const x = i * segmentWidth;
      
      // Smooth wave harmonics combined with micro-noise to replicate realistic paper grain rips
      const wave1 = Math.sin(i * 0.15) * 5;
      const wave2 = Math.cos(i * 0.35) * 2;
      const wave3 = Math.sin(i * 0.7) * 1;
      const noise = (random1() - 0.5) * 1.5;
      const y1 = 20 + wave1 + wave2 + wave3 + noise;
      points1.push(`${x.toFixed(1)},${y1.toFixed(1)}`);

      const wave1b = Math.sin(i * 0.13) * 4.5;
      const wave2b = Math.cos(i * 0.29) * 2.5;
      const noiseb = (random2() - 0.5) * 1.2;
      const y2 = 14 + wave1b + wave2b + noiseb;
      points2.push(`${x.toFixed(1)},${y2.toFixed(1)}`);
    }

    return {
      tornPaths: `M 0,56 L 0,20 ${points1.map(p => `L ${p}`).join(' ')} L 1440,56 Z`,
      tornPathsSecondary: `M 0,56 L 0,14 ${points2.map(p => `L ${p}`).join(' ')} L 1440,56 Z`
    };
  }, []);

  // Generate deterministic closed 4-sided jagged path for What We Create image (objectBoundingBox coords: 0 to 1)
  const tornClipPathD = useMemo(() => {
    const segmentsTop = 36;
    const segmentsRight = 28;
    const segmentsBottom = 42;
    const segmentsLeft = 34;

    const pad = 0.008;
    const micro = 0.0045;
    const macro = 0.018;

    let seed = 24681;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const pts: string[] = [];
    const clampPoint = (n: number) => Math.min(0.995, Math.max(0.005, n));
    const pushPoint = (x: number, y: number) => {
      pts.push(`${clampPoint(x).toFixed(5)},${clampPoint(y).toFixed(5)}`);
    };

    for (let i = 0; i <= segmentsTop; i++) {
      const t = i / segmentsTop;
      const x = pad + t * (1 - pad * 2);
      const wave =
        Math.sin(t * Math.PI * 2.2) * 0.25 +
        Math.sin(t * Math.PI * 5.7) * 0.1;
      const noise = (random() - 0.5) * micro;
      const y = pad + wave * micro + noise;
      pushPoint(x, y);
    }

    for (let i = 1; i <= segmentsRight; i++) {
      const t = i / segmentsRight;
      const y = pad + t * (1 - pad * 2);
      const inwardPull = Math.sin(t * Math.PI * 1.2) * 0.35;
      const noise = (random() - 0.5) * micro;
      const x = 1 - pad - inwardPull * micro + noise;
      pushPoint(x, y);
    }

    for (let i = 1; i <= segmentsBottom; i++) {
      const t = i / segmentsBottom;
      const x = 1 - pad - t * (1 - pad * 2);
      const centerTear =
        Math.exp(-Math.pow((t - 0.42) / 0.18, 2)) * macro * 0.75;
      const sideBreak =
        Math.exp(-Math.pow((t - 0.82) / 0.09, 2)) * macro * 0.42;
      const wave =
        Math.sin(t * Math.PI * 4.5) * micro * 0.7 +
        Math.cos(t * Math.PI * 10.5) * micro * 0.28;
      const noise = (random() - 0.5) * micro * 1.15;
      const y = 1 - pad - wave - noise - centerTear - sideBreak;
      pushPoint(x, y);
    }

    for (let i = 1; i <= segmentsLeft; i++) {
      const t = i / segmentsLeft;
      const y = 1 - pad - t * (1 - pad * 2);
      const upperRip =
        Math.exp(-Math.pow((t - 0.22) / 0.12, 2)) * macro * 0.55;
      const lowerRip =
        Math.exp(-Math.pow((t - 0.78) / 0.16, 2)) * macro * 0.9;
      const wave =
        Math.sin(t * Math.PI * 3.6) * micro * 0.8 +
        Math.cos(t * Math.PI * 8.4) * micro * 0.24;
      const noise = (random() - 0.5) * micro * 1.2;
      const x = pad + wave + noise + upperRip + lowerRip;
      pushPoint(x, y);
    }

    return `M ${pts.join(" L ")} Z`;
  }, []);

  // Reading progress bar specifically for the journal/editorial section
  useEffect(() => {
    const handleScroll = () => {
      // Header scroll state tracker
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (activeView !== "home") {
        setShowProgress(false);
        return;
      }
      const element = document.getElementById("editorial");
      if (!element) {
        setShowProgress(false);
        return;
      }
      
      const rect = element.getBoundingClientRect();
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Determine if the section is at least partially in the viewport
      const isInViewport = rect.top < windowHeight && rect.bottom > 0;
      
      if (isInViewport) {
        // Calculate progress through the section
        const totalDistance = sectionHeight + windowHeight;
        const scrolledDistance = windowHeight - rect.top;
        const progress = Math.min(100, Math.max(0, (scrolledDistance / totalDistance) * 100));
        setJournalProgress(progress);
        setShowProgress(true);
      } else {
        setShowProgress(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeView]);

  const handleNavigation = (target: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (target === "#about" || target === "about") {
      setActiveView("about");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "#home" || target === "home" || target === "#") {
      setActiveView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "/privacy-policy" || target === "#privacy-policy" || target === "privacy-policy") {
      setActiveView("privacy");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "/terms" || target === "#terms" || target === "terms" || target === "/terms-of-use" || target === "#terms-of-use" || target === "terms-of-use") {
      setActiveView("terms");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "/newsletter" || target === "#newsletter" || target === "newsletter") {
      setActiveView("newsletter");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "articles" || target === "#articles" || target === "/articles"
    ) {
      setActiveView("articles");
      setActiveArticleSlug(null);
      window.history.pushState({}, "", "/articles");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target.startsWith("articles/") || target.startsWith("#articles/") || target.startsWith("/articles/")
    ) {
      const slug = target.replace(/^(\/)?(#)?articles\//, "");
      setActiveView("articles");
      setActiveArticleSlug(slug);
      window.history.pushState({}, "", `/articles/${slug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "/contact" || target === "#contact" || target === "contact") {
      setActiveView("terms");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const el = document.getElementById("term-26");
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 300);
    } else if (target === "/refund-policy" || target === "#refund-policy" || target === "refund-policy") {
      setActiveView("terms");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const el = document.getElementById("term-10");
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 300);
    } else if (target === "/disclaimer" || target === "#disclaimer" || target === "disclaimer") {
      setActiveView("terms");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const el = document.getElementById("term-4");
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 300);
    } else if (
      target === "/pillars" ||
      target === "#pillars" ||
      target === "pillars"
    ) {
      setActiveView("pillars");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/pillars/mindfulness-health-longevity" || 
      target === "#pillars/mindfulness-health-longevity" || 
      target === "pillars/mindfulness-health-longevity" ||
      target === "#mindfulness-health-longevity"
    ) {
      setActiveView("pillar-mindfulness");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/pillars/ai-automation" || 
      target === "#pillars/ai-automation" || 
      target === "pillars/ai-automation" ||
      target === "#ai-automation"
    ) {
      setActiveView("pillar-ai");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/pillars/wealth-cognition" || 
      target === "#pillars/wealth-cognition" || 
      target === "pillars/wealth-cognition" ||
      target === "#wealth-cognition"
    ) {
      setActiveView("pillar-wealth");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/products/digital-publishing" ||
      target === "#products/digital-publishing" ||
      target === "products/digital-publishing" ||
      target === "digital-publishing" ||
      target === "#digital-publishing" ||
      target === "/digital-publishing"
    ) {
      setActiveView("digital-publishing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/products/ai-toolkits" ||
      target === "#products/ai-toolkits" ||
      target === "products/ai-toolkits" ||
      target === "ai-toolkits" ||
      target === "#ai-toolkits" ||
      target === "/ai-toolkits"
    ) {
      setActiveView("ai-toolkits");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/products/audio-experiences" ||
      target === "#products/audio-experiences" ||
      target === "products/audio-experiences" ||
      target === "audio-experiences" ||
      target === "#audio-experiences" ||
      target === "/audio-experiences"
    ) {
      setActiveView("audio-experiences");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/products/wealth-frameworks" ||
      target === "#products/wealth-frameworks" ||
      target === "products/wealth-frameworks" ||
      target === "wealth-frameworks" ||
      target === "#wealth-frameworks" ||
      target === "/wealth-frameworks"
    ) {
      setActiveView("wealth-frameworks");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/editorial-intelligence" ||
      target === "#editorial-intelligence" ||
      target === "editorial-intelligence" ||
      target === "#editorial" ||
      target === "editorial"
    ) {
      setActiveView("editorial-intelligence");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/reading-room" ||
      target === "#reading-room" ||
      target === "reading-room"
    ) {
      setActiveView("reading-room");
      setSelectedReadingBookId(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (
      target === "/listening-room" ||
      target === "#listening-room" ||
      target === "listening-room"
    ) {
      setActiveView("listening-room");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActiveView("home");
      setTimeout(() => {
        try {
          const element = document.querySelector(target);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        } catch (err) {
          console.error(err);
        }
      }, 80);
    }
  };

  // Centralized URL state sync
  useEffect(() => {
    const currentPath = window.location.pathname;
    const targetPath = getPathForView(activeView, activeArticleSlug);
    
    if (currentPath !== targetPath) {
      window.history.pushState({ view: activeView, slug: activeArticleSlug }, "", targetPath);
    }
  }, [activeView, activeArticleSlug]);

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const { view, slug } = getViewForPath(window.location.pathname);
      setActiveView(view);
      setActiveArticleSlug(slug);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    audioEngineRef.current = new AmbientAudioEngine();
    
    // Smooth scrolling to terms sub-sections if initialized on deep anchor links
    const path = (window.location.pathname).toLowerCase();
    if (path.includes("contact")) {
      setTimeout(() => {
        const el = document.getElementById("term-26");
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 500);
    } else if (path.includes("refund-policy")) {
      setTimeout(() => {
        const el = document.getElementById("term-10");
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 500);
    } else if (path.includes("disclaimer")) {
      setTimeout(() => {
        const el = document.getElementById("term-4");
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 500);
    }

    return () => {
      audioEngineRef.current?.toggleAmbient(false);
    };
  }, []);

  const handleToggleAmbient = () => {
    if (!audioEngineRef.current) return;
    const newState = !ambientOn;
    setAmbientOn(newState);
    audioEngineRef.current.toggleAmbient(newState);
    audioEngineRef.current.playChime();
  };

  const handleJourneyClick = () => {
    // Silent journey indicator click
  };

  // GSAP animation references
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const booksRef = useRef<HTMLDivElement>(null);
  const pillarsContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Register ScrollTrigger plugin
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. TYPOGRAPHY ANIMATION (Main Headline & Titles)
      const animatedHeaders = document.querySelectorAll(".animate-reveal-text");
      animatedHeaders.forEach((header) => {
        gsap.fromTo(
          header,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out", // Close equivalent to cubic-bezier(0.22, 1, 0.36, 1)
            scrollTrigger: {
              trigger: header,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // 2. PARALLAX ANNOTATION CARDS
      const parallaxItems = document.querySelectorAll(".parallax-annotation");
      parallaxItems.forEach((item, index) => {
        const speed = index % 2 === 0 ? 30 : -30;
        gsap.fromTo(
          item,
          { y: speed },
          {
            y: -speed,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });

      // 3. ESSENCE BOOK REVEAL
      if (booksRef.current) {
        const books = booksRef.current.querySelectorAll(".book-cover-wrapper");
        gsap.fromTo(
          books,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.25,
            ease: "power4.out",
            scrollTrigger: {
              trigger: booksRef.current,
              start: "top 80%"
            }
          }
        );
      }

      // 4. ANIMATED SVG WINDING PATH (Three Pillars Section)
      if (svgPathRef.current && svgContainerRef.current) {
        const path = svgPathRef.current;
        const length = path.getTotalLength();
        
        // Setup initial dashed dasharray & dashoffset
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length
        });

        // ScrollTrigger to scrub path drawing
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: svgContainerRef.current,
            start: "top 45%",
            end: "bottom 55%",
            scrub: 1
          }
        });
      }

      // 5. PILLAR GLASS CARDS REVEAL & ANCHOR NODES
      const pillarCards = document.querySelectorAll(".pillar-glass-card");
      pillarCards.forEach((card, idx) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 0.92,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        );

        // Light up the specific path node when card crosses 70% of screen
        const node = nodeRefs.current[idx];
        if (node) {
          gsap.fromTo(
            node,
            { scale: 1, backgroundColor: "#D8D2C6", borderColor: "#D8D2C6" },
            {
              scale: 1.5,
              backgroundColor: "#8B5A44",
              borderColor: "#F4F1EB",
              scrollTrigger: {
                trigger: card,
                start: "top 70%",
                end: "bottom 30%",
                toggleActions: "play reverse play reverse"
              }
            }
          );
        }
      });

      // 5b. SCROLLING PARALLAX EFFECT FOR THE THREE PILLARS (CORE METRIC)
      const parallaxWrappers = document.querySelectorAll(".pillar-parallax-wrapper");
      parallaxWrappers.forEach((wrapper, idx) => {
        const isEven = idx % 2 === 0;
        // Alternating floating speeds: even cards move slightly faster (offset decreases), odd cards slightly slower (offset increases)
        gsap.fromTo(
          wrapper,
          { y: isEven ? 50 : -50 },
          {
            y: isEven ? -50 : 50,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
              invalidateOnRefresh: true,
            }
          }
        );
      });

      // 6. WHAT WE CREATE SECTION - LEFT BANNER PARALLAX
      const createLeftImage = document.querySelector(".create-parallax-img");
      if (createLeftImage) {
        gsap.fromTo(
          createLeftImage,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: createLeftImage,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }

      // 7. LIST ITEMS FADE STAGGER
      const createItems = document.querySelectorAll(".create-list-item");
      gsap.fromTo(
        createItems,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".create-list-container",
            start: "top 80%"
          }
        }
      );

      // 8. WHAT WE CREATE - RIGHT CARD SLIDE
      const createRightCard = document.querySelector(".create-right-card");
      if (createRightCard) {
        gsap.fromTo(
          createRightCard,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: createRightCard,
              start: "top 80%"
            }
          }
        );
      }

      // 9. JOURNAL GRID STAGGER REVEAL
      const journalCards = document.querySelectorAll(".journal-card-wrapper");
      gsap.fromTo(
        journalCards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".journal-grid-container",
            start: "top 80%"
          }
        }
      );

      // 10. NEWSLETTER BOX ENTRANCE
      const newsletterBox = document.querySelector(".newsletter-container-box");
      if (newsletterBox) {
        gsap.fromTo(
          newsletterBox,
          { scale: 0.96, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: newsletterBox,
              start: "top 85%"
            }
          }
        );
      }

      // 11. MAGNETIC HOVER FOR PILLAR CARDS WITH GSAP (Enhanced with scale-up and fade-in)
      const pillarCols = document.querySelectorAll("[id^='pillar-col-']");
      pillarCols.forEach((col) => {
        const parent = col as HTMLElement;
        const card = parent.querySelector(".pillar-glass-card") as HTMLElement;
        if (!card) return;

        const onMouseEnter = () => {
          gsap.to(card, {
            scale: 1.03,
            opacity: 1,
            backgroundColor: "rgba(244, 241, 235, 0.95)",
            boxShadow: "0 20px 25px -5px rgba(26, 47, 36, 0.12), 0 10px 10px -5px rgba(26, 47, 36, 0.06)",
            borderColor: "#8B5A44",
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto"
          });
        };

        const onMouseMove = (e: MouseEvent) => {
          const rect = parent.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = e.clientX - centerX;
          const deltaY = e.clientY - centerY;
          
          const maxNudge = 4;
          const nudgeX = Math.max(-maxNudge, Math.min(maxNudge, deltaX * 0.02));
          const nudgeY = Math.max(-maxNudge, Math.min(maxNudge, deltaY * 0.02)) - 1; // Incorporates subtle hover lift
          
          gsap.to(card, {
            x: nudgeX,
            y: nudgeY,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto"
          });
        };

        const onMouseLeave = () => {
          gsap.to(card, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.92,
            backgroundColor: "rgba(244, 241, 235, 0.85)",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            borderColor: "#D8D2C6",
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto"
          });
        };

        parent.addEventListener("mouseenter", onMouseEnter);
        parent.addEventListener("mousemove", onMouseMove);
        parent.addEventListener("mouseleave", onMouseLeave);
      });

      // 12. GENTLE BREATHING PULSE FOR HERO SCENIC FRAME & PREMIUM CLICK RIPPLE
      const scenicFrame = document.querySelector("#organic-scenic-frame");
      if (scenicFrame) {
        // Continuous gentle breathe
        gsap.fromTo(
          scenicFrame,
          { scale: 0.99 },
          {
            scale: 1.02,
            duration: 8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          }
        );

        // Tactile ripple click handler
        const onClickFrame = (e: MouseEvent) => {
          const rect = scenicFrame.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Create custom ripple element
          const ripple = document.createElement("div");
          ripple.className = "absolute rounded-full pointer-events-none bg-[#8B5A44]/20 z-10";
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.style.width = "12px";
          ripple.style.height = "12px";
          ripple.style.transform = "translate(-50%, -50%)";
          
          scenicFrame.appendChild(ripple);

          // Animate expanding ripple (reduced scale for calmness)
          gsap.fromTo(
            ripple,
            { scale: 0, opacity: 0.6 },
            {
              scale: 15,
              opacity: 0,
              duration: 1.0,
              ease: "power2.out",
              onComplete: () => {
                ripple.remove();
              }
            }
          );

          // Subtle spring/squeeze on frame to enhance material depth (calmer ease)
          gsap.fromTo(
            scenicFrame,
            { scale: 0.99 },
            {
              scale: 1.01,
              duration: 0.4,
              ease: "power2.out"
            }
          );
        };

        scenicFrame.addEventListener("click", onClickFrame as any);
      }

      // 13. SCROLL-DRIVEN VIDEO BACKGROUND PLAYBACK CONTROL (Play more / faster with responsive scrubbing)
      const videoElement = heroVideoRef.current;
      if (videoElement) {
        const initVideoScroll = () => {
          if (!videoElement.duration) return;
          gsap.fromTo(
            videoElement,
            { currentTime: 0 },
            {
              currentTime: videoElement.duration,
              ease: "none",
              scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom 30%", // Complete playback sooner (by bottom 30% of scroll trigger), making it play faster
                scrub: 0.6,        // Shorter lag for more immediate feedback and active scroll-tracking speed
                invalidateOnRefresh: true,
              }
            }
          );
        };

        if (videoElement.readyState >= 1) {
          initVideoScroll();
        } else {
          videoElement.addEventListener("loadedmetadata", initVideoScroll);
        }
      }

      // 14. VIDEO CONTAINER PARALLAX DEPTH EFFECT
      const videoContainer = document.querySelector("#hero-video-bg-container");
      if (videoContainer) {
        gsap.fromTo(
          videoContainer,
          { y: 0 },
          {
            y: 120,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top top",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }

    }, mainContainerRef);

    return () => ctx.revert(); // Cleanup GSAP animations to avoid memory leaks
  }, [activeView]);

  // Staggered fade-up animation for H1 hero title lines triggered on page load & view/language changes
  useEffect(() => {
    if (activeView === "home") {
      // Ensure initial hidden offset state is set
      gsap.set(".hero-title-line", { y: 40, opacity: 0 });
      
      gsap.to(".hero-title-line", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.2
      });
    }
  }, [lang, activeView]);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      const emailToSubscribe = email.trim();
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 8000);
      
      // Subscribe to Sendfox via our proxy API
      await subscribeToSendfox(emailToSubscribe, { tags: subInterests });

      if (supabase) {
        try {
          await supabase
            .from("newsletter_subscriptions")
            .insert([{ email: emailToSubscribe, tags: subInterests, subscribed_at: new Date().toISOString() }]);
        } catch (err) {
          console.warn("Supabase newsletter sync skipped/table missing:", err);
        }
      }
    }
  };

  return (
    <div id="immersation-app" ref={mainContainerRef} className="relative bg-[#F4F1EB] min-h-screen overflow-x-hidden selection:bg-[#1A2F24] selection:text-[#F4F1EB] antialiased">
      {/* Dynamic SEO Head Manager */}
      <SEOHead activeView={activeView} activeArticleSlug={activeArticleSlug} articles={articles} lang={lang} />

      {/* Paper Grain Pattern Overlay - Establishes brand texture */}
      <div className="paper-grain" id="bg-grain"></div>

      {/* SVG ClipPath Definition for What We Create torn image */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <clipPath id="torn-paper-image-clip" clipPathUnits="objectBoundingBox">
            <path d={tornClipPathD} />
          </clipPath>
        </defs>
      </svg>

      {/* Reading Progress Bar specifically for Journal Articles */}
      <div 
        id="journal-progress-bar-container"
        className={`fixed top-0 left-0 w-full h-[3.5px] bg-transparent z-[60] pointer-events-none transition-opacity duration-500 ${showProgress ? "opacity-100" : "opacity-0"}`}
      >
        <div 
          id="journal-progress-bar-fill"
          className="h-full bg-[#8B5A44] transition-all duration-75 ease-out" 
          style={{ width: `${journalProgress}%` }}
        ></div>
      </div>

      {/* Slide-over Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden animate-fade-in" id="cart-drawer-overlay">
          {/* Backdrop blur */}
          <div 
            className="absolute inset-0 bg-[#1C1C1C]/40 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setCartOpen(false)}
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#F4F1EB] border-l border-[#D8D2C6] flex flex-col shadow-2xl relative animate-slide-in">
              {/* Header */}
              <div className="px-6 py-6 border-b border-[#D8D2C6]/50 flex items-center justify-between">
                <h3 className="font-serif text-xl font-normal text-[#1A2F24] tracking-tight">
                  {lang === "en" ? "Your Cart" : "我的购物车"}
                </h3>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
                {checkoutStep === "success" ? (
                  <div className="text-center my-auto flex flex-col items-center justify-center py-8 animate-fade-in" id="checkout-success-view">
                    <CheckCircle className="w-16 h-16 text-[#1A2F24] mb-6 stroke-[1.25]" />
                    <h4 className="font-serif text-2xl font-normal text-[#1A2F24] tracking-tight mb-3">
                      {lang === "en" ? "Order Confirmed" : "订购成功"}
                    </h4>
                    <p className="font-sans text-xs text-[#1C1C1C]/60 max-w-sm mx-auto mb-6 leading-relaxed">
                      {lang === "en" 
                        ? "Thank you for your trust. Your personal intelligence library has been upgraded successfully."
                        : "感谢您的信任。您的个人智识图书馆已成功加载已购项目。"}
                    </p>

                    {/* Receipt Details card */}
                    <div className="w-full bg-[#E8DDCF]/35 border border-[#D8D2C6] rounded-sm p-5 text-left mb-8" id="checkout-receipt-details">
                      <span className="text-[8px] font-mono tracking-widest text-[#8B5A44] block mb-3 uppercase">
                        {lang === "en" ? "TRANSACTION RECEIPT" : "交易账单"}
                      </span>
                      <div className="space-y-2 mb-4">
                        {orderReceipt.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-serif text-[#1C1C1C]/80 truncate max-w-[220px]">
                              {typeof item.title === "object" && item.title !== null ? (item.title[lang] || item.title.en || item.title.zh) : (item.title || "")}
                            </span>
                            <span className="font-mono text-[#8B5A44] font-semibold">
                              ${(item.price || 19.00).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#D8D2C6]/50 pt-3 flex justify-between items-center text-xs font-semibold text-[#1A2F24]">
                        <span>{lang === "en" ? "Total Paid" : "实付总额"}</span>
                        <span className="font-mono">
                          ${orderReceipt.reduce((acc, item) => acc + (item.price || 19.00), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#D8D2C6]/20 text-[10px] text-[#1C1C1C]/40 space-y-1">
                        <div>
                          <span className="font-medium">User Account:</span> {userEmail}
                        </div>
                        <div>
                          <span className="font-medium">Order Reference:</span> IMM-{Math.floor(100000 + Math.random() * 900000)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCartOpen(false);
                        setAccountOpen(true);
                      }}
                      className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] py-4 rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <span>{lang === "en" ? "Open Digital Library" : "进入数字图书馆"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : checkoutStep === "processing" ? (
                  <div className="text-center my-auto flex flex-col items-center justify-center py-12 animate-pulse" id="checkout-processing-view">
                    {/* Glowing rotating spinner */}
                    <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 border-[3px] border-[#8B5A44]/20 rounded-full"></div>
                      <div className="absolute inset-0 border-[3px] border-t-[#8B5A44] rounded-full animate-spin"></div>
                      <div className="w-6 h-6 bg-[#1A2F24] rounded-full opacity-10 animate-ping"></div>
                    </div>
                    <h4 className="font-serif text-lg font-normal text-[#1A2F24] tracking-tight mb-2">
                      {lang === "en" ? "Processing Secure Payment..." : "正在处理安全支付..."}
                    </h4>
                    <p className="font-sans text-xs text-[#1C1C1C]/50 max-w-xs mx-auto leading-relaxed mb-6">
                      {lang === "en" 
                        ? "Encrypting payment details & upgrading mind ledger..." 
                        : "正在加密结算数据并同步您的心智资产库..."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="text-[10px] font-display uppercase tracking-widest text-[#8B5A44] hover:underline cursor-pointer px-4 py-2 border border-[#8B5A44]/30 rounded-sm"
                    >
                      {lang === "en" ? "Cancel & Return to Cart" : "取消并返回购物车"}
                    </button>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center my-auto flex flex-col items-center justify-center py-12 animate-fade-in" id="checkout-empty-view">
                    <ShoppingBag className="w-12 h-12 text-[#8B5A44]/30 stroke-[1] mb-6" />
                    <p className="font-serif text-base text-[#1C1C1C]/80 mb-2 font-medium">
                      {lang === "en" ? "Your cart is currently empty." : "您的购物车目前为空。"}
                    </p>
                    <p className="font-sans text-xs text-[#1C1C1C]/50 max-w-xs mx-auto mb-8 leading-relaxed">
                      {lang === "en" 
                        ? "Select a digital volume to begin building your Personal Intelligence system." 
                        : "请选择一部数字出版著作，开始构建您的个人智能系统。"}
                    </p>
                    <button
                      onClick={() => {
                        setCartOpen(false);
                        handleNavigation("#products");
                      }}
                      className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3 rounded-sm transition-brand shadow-sm cursor-pointer"
                    >
                      {lang === "en" ? "Browse Products" : "浏览精选产品"}
                    </button>
                  </div>
                ) : checkoutStep === "payment" ? (
                  <form onSubmit={handleSandboxPaymentSubmit} className="flex flex-col h-full justify-between animate-fade-in text-left" id="checkout-payment-form">
                    <div className="space-y-4">
                      {/* Navigation head inside checkout */}
                      <div className="flex items-center gap-2 pb-4 border-b border-[#D8D2C6]/30">
                        <button 
                          type="button" 
                          onClick={() => setCheckoutStep("cart")}
                          className="text-[10px] font-display uppercase tracking-widest text-[#8B5A44] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          ← {lang === "en" ? "Back to Cart" : "返回购物车"}
                        </button>
                        <span className="text-stone-300">•</span>
                        <span className="text-[10px] font-display text-stone-500 uppercase tracking-widest">
                          {lang === "en" ? "Secure Sandbox Gateway" : "安全沙盒网关"}
                        </span>
                      </div>

                      {/* Amount display */}
                      <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-4 rounded-sm flex justify-between items-center">
                        <span className="text-xs font-serif text-[#1C1C1C]/75">{lang === "en" ? "Total Payable" : "应付金额"}</span>
                        <span className="text-base font-mono font-bold text-[#8B5A44]">
                          ${cartItems.reduce((acc, item) => acc + (item.price || 19.00), 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Error Banner */}
                      {paymentError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm font-sans">
                          {paymentError}
                        </div>
                      )}

                      {/* Card Details inputs */}
                      <div className="space-y-3 pt-2 text-left">
                        {/* Email Indicator */}
                        <div>
                          <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-1.5 text-left">
                            {lang === "en" ? "Email Address" : "电子邮箱"}
                          </label>
                          <input
                            type="email"
                            required
                            disabled={!!userEmail}
                            value={userEmail || ""}
                            onChange={(e) => {}}
                            placeholder={lang === "en" ? "your.email@gmail.com" : "您的电子邮箱..."}
                            className="w-full bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-4 font-sans text-xs text-[#1C1C1C] transition-brand disabled:opacity-75 disabled:bg-stone-100"
                          />
                        </div>

                        {/* Name on Card */}
                        <div>
                          <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-1.5 text-left">
                            {lang === "en" ? "Cardholder Name" : "持卡人姓名"}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder={lang === "en" ? "Satoshi Nakamoto" : "持卡人姓名..."}
                            className="w-full bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-4 font-sans text-xs text-[#1C1C1C] transition-brand"
                          />
                        </div>

                        {/* Card Number */}
                        <div>
                          <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-1.5 text-left flex justify-between items-center">
                            <span>{lang === "en" ? "Card Number" : "卡号"}</span>
                            <span className="text-[9px] text-[#8B5A44] font-mono lowercase">
                              {lang === "en" ? "use test card (e.g. 4242 4242 4242 4242)" : "请输入测试卡号 (例如: 4242 4242 4242 4242)"}
                            </span>
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1C1C1C]/40" />
                            <input
                              type="text"
                              required
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                                const matches = val.match(/\d{4,16}/g);
                                const match = (matches && matches[0]) || "";
                                const parts = [];

                                for (let i = 0, len = match.length; i < len; i += 4) {
                                  parts.push(match.substring(i, i + 4));
                                }

                                if (parts.length > 0) {
                                  setCardNumber(parts.join(" "));
                                } else {
                                  setCardNumber(val);
                                }
                              }}
                              placeholder="•••• •••• •••• ••••"
                              className="w-full bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 pl-12 pr-4 font-mono text-xs text-[#1C1C1C] transition-brand"
                            />
                          </div>
                        </div>

                        {/* Exp, CVC, Zip row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-1.5 text-left">
                              {lang === "en" ? "Expiry Date" : "有效期"}
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");
                                if (val.length >= 2) {
                                  val = val.substring(0, 2) + "/" + val.substring(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              placeholder="MM/YY"
                              className="w-full bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-3 text-center font-mono text-xs text-[#1C1C1C] transition-brand"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-1.5 text-left">
                              CVC
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ""))}
                              placeholder="123"
                              className="w-full bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-3 text-center font-mono text-xs text-[#1C1C1C] transition-brand"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-1.5 text-left">
                              {lang === "en" ? "ZIP Code" : "邮编"}
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={10}
                              value={cardZip}
                              onChange={(e) => setCardZip(e.target.value)}
                              placeholder="10001"
                              className="w-full bg-white border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-3 text-center font-sans text-xs text-[#1C1C1C] transition-brand"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit payment */}
                    <div className="border-t border-[#D8D2C6]/50 pt-6 mt-6">
                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#1C1C1C]/40 mb-4 font-mono uppercase tracking-wider">
                        <Lock className="w-3 h-3 text-[#8B5A44]" />
                        <span>{lang === "en" ? "Secure End-To-End Sandbox Encryption" : "端到端安全沙盒级加密信道"}</span>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] py-4 rounded-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>
                          {lang === "en" 
                            ? `Authorize Payment: $${cartItems.reduce((acc, item) => acc + (item.price || 19.00), 0).toFixed(2)}`
                            : `授权支付：$${cartItems.reduce((acc, item) => acc + (item.price || 19.00), 0).toFixed(2)}`}
                        </span>
                        <Unlock className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col h-full justify-between animate-fade-in" id="checkout-cart-view">
                    <div className="flex-1 overflow-y-auto">
                      <span className="text-[9px] font-display tracking-widest text-[#8B5A44] uppercase font-bold block mb-4">
                        {lang === "en" ? "SELECTED VOLUMES" : "已选智识著作"}
                      </span>
                      <div className="space-y-4 pr-1">
                        {cartItems.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-4 bg-white/50 border border-[#D8D2C6]/60 p-4 rounded-sm relative group hover:border-[#8B5A44]/50 transition-colors"
                          >
                            <div className="w-10 h-13 bg-[#1A2F24] text-white rounded-xs flex items-center justify-center shadow-sm flex-shrink-0 font-serif text-[10px] font-bold">
                              VOL
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-serif text-sm font-semibold text-[#1A2F24] truncate">
                                {typeof item.title === "object" && item.title !== null ? (item.title[lang] || item.title.en || item.title.zh) : (item.title || "")}
                              </h5>
                              <p className="font-sans text-[10px] text-[#1C1C1C]/50 mt-1">
                                {typeof item.format === "object" && item.format !== null ? item.format[lang] : (item.format || "Digital Volume")}
                              </p>
                              <div className="font-mono text-xs font-semibold text-[#8B5A44] mt-1.5">
                                ${(item.price || 19.00).toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setCartItems(prev => prev.filter(i => i.id !== item.id));
                              }}
                              className="text-[#1C1C1C]/40 hover:text-red-600 p-1.5 cursor-pointer rounded-full hover:bg-red-50 transition-colors"
                              title={lang === "en" ? "Remove item" : "移除项目"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer / Summary block */}
                    <div className="border-t border-[#D8D2C6]/50 pt-6 mt-6">
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs text-[#1C1C1C]/60">
                          <span>{lang === "en" ? "Subtotal" : "商品小计"}</span>
                          <span className="font-mono">${cartItems.reduce((acc, item) => acc + (item.price || 19.00), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#1C1C1C]/60">
                          <span>{lang === "en" ? "Tax" : "增值税"}</span>
                          <span className="font-mono">$0.00</span>
                        </div>
                        <div className="border-t border-[#D8D2C6]/30 my-2 pt-2 flex justify-between text-sm font-semibold text-[#1A2F24]">
                          <span>{lang === "en" ? "Total Due" : "应付总额"}</span>
                          <span className="font-mono text-[#8B5A44]">${cartItems.reduce((acc, item) => acc + (item.price || 19.00), 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Security badge */}
                      <div className="flex items-center gap-2 bg-[#1A2F24]/5 border border-[#1A2F24]/10 rounded-sm p-3 mb-4 text-[#1A2F24]">
                        <ShieldCheck className="w-4 h-4 text-[#8B5A44]" />
                        <span className="text-[10px] font-sans">
                          {lang === "en" 
                            ? "SSL Secure 256-bit Connection" 
                            : "SSL 256位高能安全加密信道"}
                        </span>
                      </div>

                      {isStripeConfigured || isLiveCheckout ? (
                        <>
                          <button
                            onClick={handleStripeCheckout}
                            className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] py-4 rounded-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={isRedirectingToStripe}
                            id="btn-stripe-checkout"
                          >
                            {isRedirectingToStripe ? (
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-[#F4F1EB] border-t-transparent rounded-full animate-spin"></span>
                                <span>{lang === "en" ? "Connecting Stripe..." : "正在连接 Stripe..."}</span>
                              </div>
                            ) : (
                              <>
                                <span>{lang === "en" ? "Checkout with Stripe" : "通过 Stripe 安全结算"}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                          
                          <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-[#1A2F24]/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                            <span>
                              {isLiveCheckout 
                                ? (lang === "en" ? "Stripe Live Mode Enforced by Administrator" : "管理员已强制启用 Stripe 实时交易通道")
                                : (lang === "en" ? "Secure Stripe Live Payments Active" : "Stripe 实时安全支付已启用")}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setCheckoutStep("payment");
                              if (audioEngineRef.current) audioEngineRef.current.playChime();
                            }}
                            className="w-full bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] py-4 rounded-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                            id="btn-simulate-checkout"
                          >
                            <span>{lang === "en" ? "Proceed to Secure Payment" : "去支付结算 (沙盒)"}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          {/* Beautiful security and setup notice card */}
                          <div className="mt-4 p-4 bg-[#E8DDCF]/45 border border-[#D8D2C6]/85 rounded-sm text-left">
                            <h5 className="font-serif text-xs font-semibold text-[#1A2F24] mb-1.5 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-[#8B5A44]" />
                              <span>{lang === "en" ? "Stripe Sandbox Checkout Enabled" : "Stripe 沙盒付款已启用"}</span>
                            </h5>
                            <p className="font-sans text-[11px] text-[#1C1C1C]/75 leading-relaxed mb-3">
                              {lang === "en"
                                ? "Your live payment gateway is simulated in sandbox mode. To preview or complete the checkout flow, you can safely proceed by entering any standard credit or debit card details."
                                : "沙盒支付通道已启动。为方便您测试，您可以直接输入任意主流信用卡或借记卡信息以进行真实感结算模拟与全额资产交付。"}
                            </p>
                            <div className="font-mono text-[9px] text-stone-600 space-y-1.5">
                              <div className="flex justify-between">
                                <span className="font-semibold">{lang === "en" ? "Supported Cards:" : "支持的卡片:"}</span>
                                <span className="bg-white/50 px-1.5 py-0.5 rounded-xs">{lang === "en" ? "Any standard Credit/Debit card" : "任意标准信用卡 / 借记卡"}</span>
                              </div>
                            </div>
                            
                            {/* Hidden/Admin helper */}
                            <div className="mt-3 pt-3 border-t border-[#D8D2C6]/50 text-[9px] font-sans text-stone-500 leading-normal">
                              {lang === "en"
                                ? "⚙️ Administrator: To switch from Sandbox to Live mode, configure your STRIPE_SECRET_KEY in the AI Studio Settings."
                                : "⚙️ 管理员提示：要在该网站上启用实时付款结算，请在 AI Studio 设置中配置您的 STRIPE_SECRET_KEY。"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over My Account Drawer */}
      {accountOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden animate-fade-in" id="account-drawer-overlay">
          {/* Backdrop blur */}
          <div 
            className="absolute inset-0 bg-[#1C1C1C]/40 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setAccountOpen(false)}
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#F4F1EB] border-l border-[#D8D2C6] flex flex-col shadow-2xl relative animate-slide-in">
              {/* Header */}
              <div className="px-6 py-6 border-b border-[#D8D2C6]/50 flex items-center justify-between">
                <h3 className="font-serif text-xl font-normal text-[#1A2F24] tracking-tight">
                  {lang === "en" ? "My Account" : "我的账户"}
                </h3>
                <button 
                  onClick={() => setAccountOpen(false)}
                  className="text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
                {!userEmail ? (
                  <div className="my-auto flex flex-col justify-center">
                    <div className="text-center mb-8">
                      <User className="w-12 h-12 text-[#8B5A44]/30 stroke-[1] mx-auto mb-4" />
                      <h4 className="font-serif text-lg font-normal text-[#1A2F24] tracking-tight">
                        {lang === "en" ? "Access Your Digital Library" : "访问您的数字图书馆"}
                      </h4>
                      <p className="font-sans text-xs text-[#1C1C1C]/50 mt-2 max-w-xs mx-auto leading-relaxed">
                        {lang === "en" 
                          ? "Sign in using Google to securely unlock your purchased digital volumes and guides." 
                          : "使用 Google 账号安全登录，以解锁您已购的数字著作与指南。"}
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        setShowGoogleModal(true);
                      }}
                      disabled={isSigningIn}
                      className="w-full flex items-center justify-center bg-white border border-[#D8D2C6] hover:border-[#8B5A44] hover:bg-white/90 text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] py-4 rounded-sm transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                      id="btn-google-signin"
                    >
                      {isSigningIn ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-[#8B5A44] border-t-transparent rounded-full animate-spin"></span>
                          <span>{lang === "en" ? "Connecting..." : "连接中..."}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          <span>{lang === "en" ? "Continue with Google" : "使用 Google 账号继续"}</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex flex-col">
                      {/* Signed-in profile details */}
                      <div className="border-b border-[#D8D2C6]/50 pb-6 mb-6 text-left">
                        <span className="text-[9px] font-display uppercase tracking-widest text-[#8B5A44] block mb-1">
                          {userEmail === "dreammyhomee@gmail.com" 
                            ? (lang === "en" ? "SYSTEM ADMINISTRATOR" : "系统超级管理员")
                            : (lang === "en" ? "ACTIVE THOUGHT LEADER" : "活跃思想领袖")}
                        </span>
                        <h4 className="font-serif text-lg font-normal text-[#1A2F24] truncate">
                          {userEmail === "dreammyhomee@gmail.com" ? "support@immersation.com" : userEmail}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${userEmail === "dreammyhomee@gmail.com" ? "bg-red-600" : "bg-[#8B5A44]"}`}></span>
                          <span className="text-[10px] font-display uppercase tracking-wider text-[#1C1C1C]/60">
                            {userEmail === "dreammyhomee@gmail.com" 
                              ? (lang === "en" ? "Membership: Top-Tier Sovereign Admin" : "会员身份：终极主权系统管理员")
                              : (lang === "en" ? "Membership: Founding Thinker" : "会员身份：创始思想者")}
                          </span>
                        </div>
                      </div>

                      {/* Admin Tab Selector */}
                      {userEmail === "dreammyhomee@gmail.com" && (
                        <div className="flex border-b border-[#D8D2C6]/30 mb-6 font-display text-[9px] tracking-widest uppercase font-bold">
                          <button
                            type="button"
                            onClick={() => setAdminTab("overview")}
                            className={`flex-1 pb-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                              adminTab !== "library"
                                ? "border-[#8B5A44] text-[#8B5A44]"
                                : "border-transparent text-stone-400 hover:text-stone-600"
                            }`}
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>{lang === "en" ? "Admin Console" : "管理控制台"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminTab("library")}
                            className={`flex-1 pb-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                              adminTab === "library"
                                ? "border-[#8B5A44] text-[#8B5A44]"
                                : "border-transparent text-stone-400 hover:text-stone-600"
                            }`}
                          >
                            <Database className="w-3.5 h-3.5" />
                            <span>{lang === "en" ? "My Library" : "数字图书馆"}</span>
                          </button>
                        </div>
                      )}

                      {/* View rendering based on adminTab */}
                      {userEmail === "dreammyhomee@gmail.com" && adminTab !== "library" ? (
                        <div className="space-y-4 animate-fade-in text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setAccountOpen(false);
                              setActiveView("admin");
                              if (audioEngineRef.current) audioEngineRef.current.playChime();
                            }}
                            className="w-full bg-[#8B5A44] hover:bg-[#1A2F24] text-[#F4F1EB] font-display text-[10px] font-bold uppercase tracking-[0.15em] py-3 rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            <Database className="w-3.5 h-3.5" />
                            <span>{lang === "en" ? "Launch Executive Dashboard" : "启动全维度决策控制台"}</span>
                          </button>

                          {/* Inner Admin Navigation */}
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#D8D2C6]/20 font-display text-[9px] uppercase tracking-wider font-bold">
                            <button
                              type="button"
                              onClick={() => setAdminTab("overview")}
                              className={`px-2 py-1 rounded-xs transition-colors ${adminTab === "overview" ? "bg-[#1A2F24]/10 text-[#1A2F24]" : "text-stone-400 hover:text-[#1C1C1C]"}`}
                            >
                              {lang === "en" ? "Overview" : "系统配置"}
                            </button>
                            <span className="text-stone-300">|</span>
                            <button
                              type="button"
                              onClick={() => setAdminTab("members")}
                              className={`px-2 py-1 rounded-xs transition-colors ${adminTab === "members" ? "bg-[#1A2F24]/10 text-[#1A2F24]" : "text-stone-400 hover:text-[#1C1C1C]"}`}
                            >
                              {lang === "en" ? "Members" : "成员列表"}
                            </button>
                            <span className="text-stone-300">|</span>
                            <button
                              type="button"
                              onClick={() => setAdminTab("transactions")}
                              className={`px-2 py-1 rounded-xs transition-colors ${adminTab === "transactions" ? "bg-[#1A2F24]/10 text-[#1A2F24]" : "text-stone-400 hover:text-[#1C1C1C]"}`}
                            >
                              {lang === "en" ? "Transactions" : "账单流水"}
                            </button>
                          </div>

                          {/* Overview Content */}
                          {adminTab === "overview" && (
                            <div className="space-y-4 animate-fade-in text-left">
                              {/* Stat Cards */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-3 rounded-sm">
                                  <span className="text-[9px] font-display text-stone-500 uppercase tracking-wider block">{lang === "en" ? "Total Revenue" : "流水总额"}</span>
                                  <span className="text-sm font-mono font-bold text-[#8B5A44] block mt-0.5">
                                    ${systemTransactions.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="bg-[#1A2F24]/5 border border-[#D8D2C6]/40 p-3 rounded-sm">
                                  <span className="text-[9px] font-display text-stone-500 uppercase tracking-wider block">{lang === "en" ? "Members" : "注册思想者"}</span>
                                  <span className="text-sm font-serif font-semibold text-[#1A2F24] block mt-0.5">
                                    {systemMembers.length} {lang === "en" ? "Users" : "人"}
                                  </span>
                                </div>
                              </div>

                              {/* Stripe config */}
                              <div className="bg-[#E8DDCF]/25 border border-[#D8D2C6]/50 rounded-sm p-4 space-y-3 text-left">
                                <span className="text-[10px] font-bold text-[#8B5A44] uppercase tracking-wider block">
                                  {lang === "en" ? "Gateway Channel Configuration" : "Stripe 交易通道控制"}
                                </span>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1">
                                    <span className="text-xs font-serif font-bold text-[#1A2F24] block">
                                      {isLiveCheckout ? (lang === "en" ? "Stripe Live Mode" : "Stripe 实时交易模式") : (lang === "en" ? "Sandbox Simulation" : "安全沙盒模拟")}
                                    </span>
                                    <span className="text-[9px] text-stone-500 block leading-relaxed mt-0.5">
                                      {isLiveCheckout 
                                        ? (lang === "en" ? "Live mode. STRIPE_SECRET_KEY enforced in production." : "全站已强制切入 Stripe 实时交易总线。")
                                        : (lang === "en" ? "Uses Stripe sandbox with 4242 testing card credentials." : "为全站客户启用安全沙盒账单模拟，支持 4242 测试卡。")}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsLiveCheckout(!isLiveCheckout);
                                      if (audioEngineRef.current) audioEngineRef.current.playChime();
                                    }}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 relative flex-shrink-0 ${isLiveCheckout ? "bg-[#1A2F24]" : "bg-stone-300"}`}
                                  >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isLiveCheckout ? "translate-x-5" : "translate-x-0"}`}></div>
                                  </button>
                                </div>
                              </div>

                              {/* Book Control */}
                              <div className="bg-[#E8DDCF]/25 border border-[#D8D2C6]/50 rounded-sm p-4 space-y-3 text-left">
                                <span className="text-[10px] font-bold text-[#8B5A44] uppercase tracking-wider block">
                                  {lang === "en" ? "Global Asset Access Controls" : "全数字资产授权面板"}
                                </span>
                                <p className="text-[9px] text-stone-500 leading-normal">
                                  {lang === "en" ? "Grant or revoke library assets on this System Administrator account instantly." : "在此管理员账户上一键授权或恢复初始智识图书馆库藏。"}
                                </p>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const allBookIds = books.map(b => b.id);
                                      setUnlockedBookIds(allBookIds);
                                      localStorage.setItem("immersation_unlocked_books", JSON.stringify(allBookIds));
                                      if (audioEngineRef.current) audioEngineRef.current.playChime();
                                    }}
                                    className="flex-1 bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] text-[9px] font-display uppercase tracking-wider py-2 rounded-xs transition-colors"
                                  >
                                    {lang === "en" ? "Unlock All" : "一键解锁全部"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUnlockedBookIds(["starter-kit"]);
                                      localStorage.setItem("immersation_unlocked_books", JSON.stringify(["starter-kit"]));
                                      if (audioEngineRef.current) audioEngineRef.current.playChime();
                                    }}
                                    className="flex-1 bg-white hover:bg-stone-50 text-red-700 border border-red-200 text-[9px] font-display uppercase tracking-wider py-2 rounded-xs transition-colors"
                                  >
                                    {lang === "en" ? "Reset Library" : "重置所有权"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Members Content */}
                          {adminTab === "members" && (
                            <div className="space-y-3 animate-fade-in text-left">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                                {lang === "en" ? "Registered Thinkers Directory" : "智枢阁注册成员目录"}
                              </span>
                              <div className="max-h-[220px] overflow-y-auto border border-[#D8D2C6]/30 rounded-sm bg-white/30">
                                <table className="w-full text-[10px] text-left">
                                  <thead className="bg-[#E8DDCF]/50 font-display uppercase tracking-wider text-stone-600 border-b border-[#D8D2C6]/40">
                                    <tr>
                                      <th className="p-2 font-semibold">{lang === "en" ? "Google Email" : "邮箱地址"}</th>
                                      <th className="p-2 font-semibold">{lang === "en" ? "Role" : "系统角色"}</th>
                                      <th className="p-2 font-semibold text-center">{lang === "en" ? "Action" : "操作"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#D8D2C6]/20 font-mono">
                                    {systemMembers.map((m, idx) => (
                                      <tr key={idx} className="hover:bg-white/50">
                                        <td className="p-2 text-stone-800 font-sans truncate max-w-[120px]">{m.email === "dreammyhomee@gmail.com" ? "support@immersation.com" : m.email}</td>
                                        <td className="p-2 text-[8px]">
                                          <span className={`px-1.5 py-0.5 rounded-xs font-sans font-semibold uppercase ${m.email === "dreammyhomee@gmail.com" ? "bg-red-50 text-red-700 border border-red-200" : "bg-[#1A2F24]/10 text-[#1A2F24]"}`}>
                                            {m.email === "dreammyhomee@gmail.com" ? "ADMIN" : "MEMBER"}
                                          </span>
                                        </td>
                                        <td className="p-2 text-center font-sans">
                                          {m.email !== "dreammyhomee@gmail.com" ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSystemMembers(systemMembers.filter(member => member.email !== m.email));
                                              }}
                                              className="text-red-600 hover:underline cursor-pointer"
                                            >
                                              {lang === "en" ? "Revoke" : "解散"}
                                            </button>
                                          ) : (
                                            <span className="text-stone-400">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.currentTarget);
                                  const email = formData.get("newEmail") as string;
                                  if (email && !systemMembers.some(m => m.email === email)) {
                                    setSystemMembers([...systemMembers, { email, role: "Active Thought Leader", joined: "2026-07-08", status: "Active" }]);
                                    e.currentTarget.reset();
                                    if (audioEngineRef.current) audioEngineRef.current.playChime();
                                  }
                                }}
                                className="flex gap-2 mt-2"
                              >
                                <input
                                  type="email"
                                  name="newEmail"
                                  required
                                  placeholder={lang === "en" ? "new.thinker@gmail.com" : "追加模拟注册邮箱..."}
                                  className="flex-1 bg-white border border-[#D8D2C6] rounded-xs px-2.5 py-1.5 text-[11px] font-sans focus:outline-none focus:border-[#8B5A44]"
                                />
                                <button
                                  type="submit"
                                  className="bg-[#1A2F24] text-[#F4F1EB] px-3 py-1.5 text-[9px] font-display uppercase tracking-wider rounded-xs hover:bg-[#8B5A44]"
                                >
                                  {lang === "en" ? "Add" : "追加"}
                                </button>
                              </form>
                            </div>
                          )}

                          {/* Transactions Content */}
                          {adminTab === "transactions" && (
                            <div className="space-y-3 animate-fade-in text-left">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                                {lang === "en" ? "Platform Ledger Entries" : "平台数字交易流水分支系统"}
                              </span>
                              <div className="max-h-[220px] overflow-y-auto border border-[#D8D2C6]/30 rounded-sm bg-white/30">
                                <table className="w-full text-[10px] text-left">
                                  <thead className="bg-[#E8DDCF]/50 font-display uppercase tracking-wider text-stone-600 border-b border-[#D8D2C6]/40">
                                    <tr>
                                      <th className="p-2 font-semibold">TXID</th>
                                      <th className="p-2 font-semibold">{lang === "en" ? "Email" : "账单账户"}</th>
                                      <th className="p-2 font-semibold">{lang === "en" ? "Amount" : "实付"}</th>
                                      <th className="p-2 font-semibold">{lang === "en" ? "Date" : "日期"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#D8D2C6]/20 font-mono">
                                    {systemTransactions.map((tx, idx) => (
                                      <tr key={idx} className="hover:bg-white/50">
                                        <td className="p-2 text-stone-400">{tx.id}</td>
                                        <td className="p-2 text-stone-800 font-sans truncate max-w-[120px]">{tx.email === "dreammyhomee@gmail.com" ? "support@immersation.com" : tx.email}</td>
                                        <td className="p-2 text-[#8B5A44] font-semibold">${tx.amount.toFixed(2)}</td>
                                        <td className="p-2 text-stone-500">{tx.date}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h5 className="text-[10px] font-display font-bold uppercase tracking-wider text-[#1C1C1C]/60 mb-4 text-left">
                            {lang === "en" ? "Your Digital Library" : "您的数字图书馆"}
                          </h5>
                          <div className="flex flex-col gap-3">
                            {books.map((book) => {
                              const isUnlocked = unlockedBookIds.includes(book.id) || Number(book.price || 0) === 0;
                              return (
                                <div 
                                  key={book.id}
                                  onClick={() => {
                                    if (isUnlocked) {
                                      setAccountOpen(false);
                                      setSelectedReadingBookId(book.id);
                                      setActiveView("reading-room");
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    } else {
                                      setCartItems((prev) => {
                                        if (prev.some((item) => item.id === book.id)) return prev;
                                        return [...prev, book];
                                      });
                                      setCheckoutStep("cart");
                                      setAccountOpen(false);
                                      setCartOpen(true);
                                      if (audioEngineRef.current) audioEngineRef.current.playChime();
                                    }
                                  }}
                                  className={`flex items-center gap-4 p-3 border rounded-sm cursor-pointer transition-all group ${
                                    isUnlocked 
                                      ? "bg-white/40 hover:bg-white/80 border-[#D8D2C6]/50 hover:border-[#8B5A44]/50" 
                                      : "bg-[#1C1C1C]/5 border-[#D8D2C6]/30 hover:border-[#8B5A44]/40 opacity-90"
                                  }`}
                                >
                                  <div className={`w-8 h-10 ${book.coverColor} rounded-xs flex items-center justify-center flex-shrink-0 shadow-sm relative`}>
                                    <span className="text-[8px] font-mono text-[#F4F1EB]/80 font-bold">VOL</span>
                                    {!isUnlocked && (
                                      <div className="absolute inset-0 bg-black/45 rounded-xs flex items-center justify-center">
                                        <Lock className="w-3 h-3 text-white/90" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <h6 className="font-serif text-xs font-normal text-[#1A2F24] truncate group-hover:text-[#8B5A44]">
                                      {typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en || book.title.zh) : (book?.title || "")}
                                    </h6>
                                    <p className="text-[9px] font-sans truncate flex items-center gap-1 mt-0.5">
                                      {isUnlocked ? (
                                        <span className="text-green-700 font-medium">
                                          {lang === "en" ? "Access Enabled" : "可直接阅读"}
                                        </span>
                                      ) : (
                                        <span className="text-[#8B5A44] font-medium flex items-center gap-0.5">
                                          <Lock className="w-2.5 h-2.5 inline" />
                                          {lang === "en" ? `Unlock ($${(book.price || 19.00).toFixed(2)})` : `付费解锁 ($${(book.price || 19.00).toFixed(2)})`}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <ArrowUpRight className="w-3 h-3 text-[#1C1C1C]/30 group-hover:text-[#8B5A44] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="mt-8 border-t border-[#D8D2C6]/50 pt-6">
                      <button 
                        onClick={async () => {
                          if (supabase) {
                            try {
                              await supabase.auth.signOut();
                            } catch (e) {
                              console.warn("Supabase signOut error skipped:", e);
                            }
                          }
                          localStorage.removeItem("immersation_user_email");
                          localStorage.removeItem("immersation_login_type");
                          setUserEmail(null);
                          setAdminTab("library");
                          if (audioEngineRef.current) audioEngineRef.current.playChime();
                        }}
                        className="w-full border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C]/70 hover:text-[#8B5A44] font-display text-[10px] font-bold uppercase tracking-[0.2em] py-3 rounded-sm transition-colors bg-transparent cursor-pointer"
                      >
                        {lang === "en" ? "Sign Out" : "退出登录"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Minimalist Header (Seamlessly overlaps with transparent background at scroll top) */}
      {activeView !== "reading-room" && activeView !== "listening-room" && activeView !== "admin" && (
        <header 
          id="main-header" 
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
            scrolled 
              ? "bg-[#F4F1EB]/80 backdrop-blur-lg border-b border-[#D8D2C6]/30 shadow-[0_2px_20px_-4px_rgba(28,28,28,0.04)]" 
              : "bg-transparent backdrop-blur-none border-b border-transparent"
          }`}
        >
          <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 h-20 flex items-center justify-between">
            {/* Logo & Brand Wordmark */}
            <a href="#" onClick={(e) => handleNavigation("#home", e)} className="flex items-center group" id="logo-anchor">
              <img 
                src="https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-scaled.png" 
                alt="Immersation Logo" 
                className="h-11 sm:h-12 w-auto object-contain transition-all duration-500 group-hover:scale-[1.03]" 
                referrerPolicy="no-referrer"
              />
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-10" id="desktop-nav">
              {navigationLinks.map((link) => {
                if (link.href === "#pillars") {
                  return (
                    <div key={link.href} className="relative group">
                      <a
                        href={link.href}
                        onClick={(e) => handleNavigation(link.href, e)}
                        className={`font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-1 ${
                          activeView.startsWith("pillar-") || activeView === "pillars"
                            ? "text-[#8B5A44] font-bold" 
                            : "text-[#1C1C1C]/75 hover:text-[#8B5A44]"
                        }`}
                      >
                        {link.label[lang]}
                        <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                      </a>
                      <div className="absolute top-full left-0 pt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="bg-[#F4F1EB] border border-[#D8D2C6] rounded-sm shadow-xl py-2 flex flex-col">
                          <a 
                            href="#pillars/mindfulness-health-longevity"
                            onClick={(e) => handleNavigation("#pillars/mindfulness-health-longevity", e)}
                            className="px-6 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-[#1C1C1C]/75 hover:text-[#8B5A44] hover:bg-[#E8DDCF]/50 transition-colors"
                          >
                            {lang === "en" ? "Mindfulness & Health" : "正念与健康"}
                          </a>
                          <a 
                            href="#pillars/ai-automation"
                            onClick={(e) => handleNavigation("#pillars/ai-automation", e)}
                            className="px-6 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-[#1C1C1C]/75 hover:text-[#8B5A44] hover:bg-[#E8DDCF]/50 transition-colors"
                          >
                            {lang === "en" ? "AI Automation" : "AI 自动化"}
                          </a>
                          <a 
                            href="#pillars/wealth-cognition"
                            onClick={(e) => handleNavigation("#pillars/wealth-cognition", e)}
                            className="px-6 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-[#1C1C1C]/75 hover:text-[#8B5A44] hover:bg-[#E8DDCF]/50 transition-colors"
                          >
                            {lang === "en" ? "Wealth Cognition" : "财富认知"}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (link.href === "editorial-intelligence") {
                  return (
                    <div key={link.href} className="relative group">
                      <a
                        href={link.href}
                        onClick={(e) => handleNavigation(link.href, e)}
                        className={`font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-1 ${
                          activeView === "editorial-intelligence" || activeView === "articles" || activeView === "newsletter"
                            ? "text-[#8B5A44] font-bold" 
                            : "text-[#1C1C1C]/75 hover:text-[#8B5A44]"
                        }`}
                      >
                        {link.label[lang]}
                        <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                      </a>
                      <div className="absolute top-full left-0 pt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="bg-[#F4F1EB] border border-[#D8D2C6] rounded-sm shadow-xl py-2 flex flex-col">
                          <a 
                            href="articles"
                            onClick={(e) => handleNavigation("articles", e)}
                            className="px-6 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-[#1C1C1C]/75 hover:text-[#8B5A44] hover:bg-[#E8DDCF]/50 transition-colors"
                          >
                            {lang === "en" ? "Articles" : "专栏文章"}
                          </a>
                          <a 
                            href="newsletter"
                            onClick={(e) => handleNavigation("newsletter", e)}
                            className="px-6 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-[#1C1C1C]/75 hover:text-[#8B5A44] hover:bg-[#E8DDCF]/50 transition-colors"
                          >
                            {lang === "en" ? "Newsletter" : "数字简报"}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavigation(link.href, e)}
                    className={`font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ${
                      (link.href === "about" && activeView === "about") || 
                      (link.href === "editorial-intelligence" && activeView === "editorial-intelligence")
                        ? "text-[#8B5A44] font-bold" 
                        : "text-[#1C1C1C]/75 hover:text-[#8B5A44]"
                    }`}
                  >
                    {link.label[lang]}
                  </a>
                );
              })}
            </nav>

            {/* Desktop Utilities (Right side) */}
            <div className="hidden lg:flex items-center gap-6" id="desktop-utilities">
              {/* Language Switcher */}
              <div className="flex items-center border border-[#D8D2C6] rounded-full px-4 py-1.5 bg-white/10" id="lang-switcher-container">
                <button
                  onClick={() => setLang("en")}
                  className={`text-[10px] font-display font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                    lang === "en" ? "text-[#8B5A44]" : "text-[#1C1C1C]/50 hover:text-[#1C1C1C]"
                  }`}
                  id="btn-lang-en"
                >
                  EN
                </button>
                <span className="text-[#D8D2C6] text-xs px-2 select-none">/</span>
                <button
                  onClick={() => setLang("zh")}
                  className={`text-[10px] font-display font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                    lang === "zh" ? "text-[#8B5A44] font-semibold" : "text-[#1C1C1C]/50 hover:text-[#1C1C1C]"
                  }`}
                  id="btn-lang-zh"
                >
                  中文
                </button>
              </div>

              {/* My Account */}
              <button
                onClick={() => {
                  setAccountOpen(true);
                  if (audioEngineRef.current) audioEngineRef.current.playChime();
                }}
                className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/75 hover:text-[#8B5A44] transition-colors cursor-pointer"
                id="btn-my-account"
              >
                <User className="w-4 h-4 text-[#8B5A44]" />
                <span>
                  {userEmail 
                    ? (lang === "en" ? "Account" : "我的账户") 
                    : (lang === "en" ? "Sign In" : "登录")}
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  setCheckoutStep("cart");
                  setCartOpen(true);
                  if (audioEngineRef.current) audioEngineRef.current.playChime();
                }}
                className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/75 hover:text-[#8B5A44] transition-colors relative cursor-pointer"
                id="btn-cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#8B5A44]" />
                <span>{lang === "en" ? "Cart" : "购物车"}</span>
                <span className="text-[9px] bg-[#8B5A44] text-[#F4F1EB] rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono font-bold leading-none">
                  {cartItems.length}
                </span>
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setLang(lang === "en" ? "zh" : "en")}
                className="text-[10px] font-display font-bold tracking-[0.2em] uppercase border border-[#D8D2C6] px-3 py-1.5 rounded-full text-[#1C1C1C]/75 hover:text-[#8B5A44]"
                id="btn-lang-mobile"
              >
                {lang === "en" ? "中文" : "EN"}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#1C1C1C] p-1.5 hover:text-[#8B5A44] transition-colors"
                aria-label="Toggle Menu"
                id="btn-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Panel */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-b border-[#D8D2C6] bg-[#F4F1EB] px-6 py-6 flex flex-col gap-5 animate-fade-in" id="mobile-menu-drawer">
              {/* Navigation Links */}
              <div className="flex flex-col gap-4 border-b border-[#D8D2C6]/30 pb-4">
                {navigationLinks.map((link) => {
                  if (link.href === "editorial-intelligence") {
                    return (
                      <div key={link.href} className="flex flex-col gap-2">
                        <a
                          href={link.href}
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            handleNavigation(link.href, e);
                          }}
                          className={`font-display text-sm font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                            activeView === "editorial-intelligence" || activeView === "articles" || activeView === "newsletter"
                              ? "text-[#8B5A44]"
                              : "text-[#1C1C1C] hover:text-[#8B5A44]"
                          }`}
                        >
                          {link.label[lang]}
                        </a>
                        <div className="pl-4 flex flex-col gap-2 border-l border-[#D8D2C6]/60">
                          <a
                            href="articles"
                            onClick={(e) => {
                              setMobileMenuOpen(false);
                              handleNavigation("articles", e);
                            }}
                            className={`font-display text-xs font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                              activeView === "articles" ? "text-[#8B5A44]" : "text-[#1C1C1C]/70 hover:text-[#8B5A44]"
                            }`}
                          >
                            {lang === "en" ? "Articles" : "专栏文章"}
                          </a>
                          <a
                            href="newsletter"
                            onClick={(e) => {
                              setMobileMenuOpen(false);
                              handleNavigation("newsletter", e);
                            }}
                            className={`font-display text-xs font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                              activeView === "newsletter" ? "text-[#8B5A44]" : "text-[#1C1C1C]/70 hover:text-[#8B5A44]"
                            }`}
                          >
                            {lang === "en" ? "Newsletter" : "数字简报"}
                          </a>
                        </div>
                      </div>
                    );
                  }
                  if (link.href === "#pillars") {
                    return (
                      <div key={link.href} className="flex flex-col gap-2">
                        <a
                          href={link.href}
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            handleNavigation(link.href, e);
                          }}
                          className={`font-display text-sm font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                            activeView.startsWith("pillar-") || activeView === "pillars"
                              ? "text-[#8B5A44]"
                              : "text-[#1C1C1C] hover:text-[#8B5A44]"
                          }`}
                        >
                          {link.label[lang]}
                        </a>
                        <div className="pl-4 flex flex-col gap-2 border-l border-[#D8D2C6]/60">
                          <a
                            href="#pillars/mindfulness-health-longevity"
                            onClick={(e) => {
                              setMobileMenuOpen(false);
                              handleNavigation("#pillars/mindfulness-health-longevity", e);
                            }}
                            className={`font-display text-xs font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                              activeView === "pillar-mindfulness" ? "text-[#8B5A44]" : "text-[#1C1C1C]/70 hover:text-[#8B5A44]"
                            }`}
                          >
                            {lang === "en" ? "Mindfulness & Health" : "正念与健康"}
                          </a>
                          <a
                            href="#pillars/ai-automation"
                            onClick={(e) => {
                              setMobileMenuOpen(false);
                              handleNavigation("#pillars/ai-automation", e);
                            }}
                            className={`font-display text-xs font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                              activeView === "pillar-ai" ? "text-[#8B5A44]" : "text-[#1C1C1C]/70 hover:text-[#8B5A44]"
                            }`}
                          >
                            {lang === "en" ? "AI Automation" : "AI 自动化"}
                          </a>
                          <a
                            href="#pillars/wealth-cognition"
                            onClick={(e) => {
                              setMobileMenuOpen(false);
                              handleNavigation("#pillars/wealth-cognition", e);
                            }}
                            className={`font-display text-xs font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                              activeView === "pillar-wealth" ? "text-[#8B5A44]" : "text-[#1C1C1C]/70 hover:text-[#8B5A44]"
                            }`}
                          >
                            {lang === "en" ? "Wealth Cognition" : "财富认知"}
                          </a>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        handleNavigation(link.href, e);
                      }}
                      className={`font-display text-sm font-semibold uppercase tracking-[0.2em] py-1 transition-colors ${
                        (link.href === "about" && activeView === "about") || 
                        (link.href === "digital-publishing" && activeView === "digital-publishing")
                          ? "text-[#8B5A44]"
                          : "text-[#1C1C1C] hover:text-[#8B5A44]"
                      }`}
                    >
                      {link.label[lang]}
                    </a>
                  );
                })}
              </div>

              {/* Mobile Utilities */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAccountOpen(true);
                  }}
                  className="flex items-center gap-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/80 hover:text-[#8B5A44] text-left py-1"
                >
                  <User className="w-4 h-4 text-[#8B5A44]" />
                  <span>
                    {userEmail 
                      ? (lang === "en" ? "Account" : "我的账户") 
                      : (lang === "en" ? "Sign In" : "登录")}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setCheckoutStep("cart");
                    setMobileMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className="flex items-center gap-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/80 hover:text-[#8B5A44] text-left py-1"
                >
                  <ShoppingBag className="w-4 h-4 text-[#8B5A44]" />
                  <span>{lang === "en" ? "Cart" : "购物车"}</span>
                  <span className="text-[9px] bg-[#8B5A44] text-[#F4F1EB] rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold leading-none">
                    {cartItems.length}
                  </span>
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {activeView === "home" ? (
        <>
          {/* Hero Section (100vh) */}
          <section
            id="hero"
            ref={heroRef}
            className="relative min-h-[100vh] pt-32 pb-40 lg:pb-32 flex flex-col justify-center w-full overflow-hidden"
          >
            {/* Background Video controlled by GSAP scroll scrubbing */}
            <div className="absolute inset-0 w-full h-[120%] -top-[10%] z-0 pointer-events-none overflow-hidden" id="hero-video-bg-container">
              <video
                ref={heroVideoRef}
                src="https://cms.immersation.com/wp-content/uploads/2026/07/Immersation-header-loop.mp4"
                playsInline
                muted
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.40 }} // Increased opacity for richer background details
              />
              {/* Overlay for brand styling, paper texture blend, and reading safety */}
              <div className="absolute inset-0 bg-[#F4F1EB] mix-blend-color-burn" style={{ opacity: 0.45 }} />
            </div>
            {/* Vertical Side Label - "PERSONAL INTELLIGENCE MEDIA" */}
            <div 
              className="hidden lg:flex absolute left-3 lg:left-4 xl:left-6 top-[50%] select-none z-30 whitespace-nowrap" 
              id="vertical-side-label"
              style={{
                transform: "translate(-50%, -50%) rotate(-90deg)",
                transformOrigin: "center center"
              }}
            >
              <span className="font-display text-[9px] uppercase font-bold tracking-[0.35em] text-[#8B5A44] flex items-center">
                {lang === "zh" ? "个人智能媒体" : "Personal Intelligence Media"}
              </span>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10" id="hero-layout-grid">
          {/* Left Hero Content block */}
          <div className="max-w-3xl flex flex-col justify-center" id="hero-left-col">
            {/* Small parent brand locator */}
            <div className="flex items-center gap-2 mb-6" id="hero-parent-brand">
              <span className="h-[1px] w-6 bg-[#8B5A44]"></span>
              <p className="font-display text-[10px] uppercase font-semibold tracking-[0.25em] text-[#8B5A44]">
                {lang === "en" ? "A Knowledge Brand by Malttrix ｜ 梦萃" : "Malttrix ｜ 梦萃 旗下精品智识媒介"}
              </p>
            </div>

            {/* Giant Title (Editorial Typography Combination) */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.1] font-normal text-[#1C1C1C] tracking-tight mb-8 overflow-hidden" id="hero-title">
              {lang === "en" ? (
                <>
                  <span className="hero-title-line inline-block opacity-0">Build Your</span> <br />
                  <span className="hero-title-line inline-block font-serif italic font-normal text-[#1A2F24] relative inline-block opacity-0">
                    Personal Intelligence
                    <span className="absolute left-0 bottom-1 w-full h-[2px] bg-[#8B5A44]/30"></span>
                  </span>{" "}
                  <br />
                  <span className="hero-title-line inline-block opacity-0">System.</span>
                </>
              ) : (
                <>
                  <span className="hero-title-line inline-block opacity-0">构建属于你的</span> <br />
                  <span className="hero-title-line inline-block font-serif italic font-medium text-[#1A2F24] bg-[#8B5A44]/10 px-3 py-1 rounded-sm opacity-0">
                    个人智能系统
                  </span>
                </>
              )}
            </h1>

            {/* Subheadline (Lora Serif Body Text) */}
            <p className="font-serif text-lg md:text-xl text-[#1C1C1C]/85 max-w-xl leading-relaxed mb-10 ink-text" id="hero-subheadline">
              {heroContent.subheadline[lang]}
            </p>

            {/* Core Slogan Slabs (Quiet Luxury Minimalist Border Box) */}
            <div className="border-l-2 border-[#8B5A44] pl-6 py-4 mb-10 max-w-lg bg-[#E8DDCF]/20 animate-fade-in" id="hero-slogan-slab">
              <p className="font-serif text-lg font-medium italic text-[#8B5A44] tracking-wide mb-3" id="hero-primary-slogan">
                “{heroContent.primarySlogan[lang]}”
              </p>
              <div className="h-[1px] w-1/3 bg-[#D8D2C6]/50 my-3"></div>
              <p className="font-serif text-xs font-semibold text-[#1C1C1C]/75 tracking-wide">
                {heroContent.sloganBlock[lang]}
              </p>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-5" id="hero-ctas">
              <a
                href="#editorial"
                onClick={(e) => handleNavigation("#editorial", e)}
                className="bg-[#1A2F24] text-[#F4F1EB] text-xs font-display font-medium uppercase tracking-[0.2em] px-8 py-4 rounded-sm hover:bg-[#8B5A44] transition-brand shadow-md hover:shadow-lg flex items-center gap-2"
                id="hero-read-cta"
              >
                {heroContent.ctaRead[lang]}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#products"
                onClick={(e) => handleNavigation("#products", e)}
                className="border border-[#1A2F24] text-[#1A2F24] hover:bg-[#1A2F24] hover:text-[#F4F1EB] text-xs font-display font-medium uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand flex items-center gap-2"
                id="hero-explore-cta"
              >
                {heroContent.ctaProducts[lang]}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom indicator scroll anchor */}
        <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-30" id="scroll-indicator" onClick={handleJourneyClick}>
          <span className="font-display text-[9px] uppercase font-bold tracking-[0.3em] text-[#1C1C1C]">
            {lang === "en" ? "Scroll to immerse" : "向下滚动 开启沉浸"}
          </span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#1C1C1C] to-transparent animate-pulse"></div>
        </div>

        {/* Torn Paper Mask Effect bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden z-20 pointer-events-none select-none" style={{ height: '56px', marginBottom: '-1px' }} id="torn-paper-mask-hero">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_-5px_5px_rgba(139,90,68,0.06)]">
            {/* Background fibers/edge layer */}
            <path d={tornPathsSecondary} fill="#E1D9C9" opacity="0.8" />
            {/* Foreground main layer matching next section's bg [#F4F1EB] */}
            <path d={tornPaths} fill="#F4F1EB" />
          </svg>
        </div>
      </section>

      {/* Segment 2: Brand Essence Section (Overlap Transition via Torn Paper) */}
      <section id="brand-essence" className="py-24 bg-[#F4F1EB] relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header Split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-4" id="essence-header-grid">
            <div className="lg:col-span-6" id="essence-title-col">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
                {brandEssenceContent.trusted[lang]}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.15] text-[#1A2F24] tracking-tight animate-reveal-text" id="essence-title">
                {brandEssenceContent.title[lang]}
              </h2>
            </div>
            <div className="lg:col-span-6" id="essence-desc-col">
              <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/80 leading-relaxed mb-4 ink-text">
                {brandEssenceContent.description[lang]}
              </p>
              <a
                href="#pillars"
                onClick={(e) => handleNavigation("#pillars", e)}
                className="font-display text-[11px] font-bold tracking-[0.25em] text-[#8B5A44] hover:text-[#1A2F24] transition-colors duration-300 flex items-center gap-1.5 uppercase"
                id="link-explore-solutions"
              >
                {brandEssenceContent.explore[lang]}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Brand core values block (Depth Over Noise / Systems Over Hacks / Long-Term Assets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-[#D8D2C6]/40" id="essence-values-grid">
            <div className="flex flex-col gap-3" id="essence-val-1">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44]">01 / ARCHITECTURE</span>
              <h3 className="font-serif text-base font-semibold text-[#1A2F24]">{lang === "en" ? "Depth Over Noise" : "深度沉浸 ｜ 拒斥噪音"}</h3>
              <p className="font-sans text-xs text-[#1C1C1C]/70 leading-relaxed">
                {lang === "en" 
                  ? "We favor quiet, continuous reading over fragmented notifications. Clear signals only."
                  : "摒弃低级、碎裂的信息噪音。在高度自洽的专注闭环中，完全唤醒心智深度潜能。"}
              </p>
            </div>
            <div className="flex flex-col gap-3" id="essence-val-2">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44]">02 / LEVERAGE</span>
              <h3 className="font-serif text-base font-semibold text-[#1A2F24]">{lang === "en" ? "Systems Over Hacks" : "系统建构 ｜ 拒绝套路"}</h3>
              <p className="font-sans text-xs text-[#1C1C1C]/70 leading-relaxed">
                {lang === "en"
                  ? "Stop memorizing hacks. Build deterministic pipelines and playbooks that run on autopilot."
                  : "停止对短效奇招与技巧的盲目追逐。致力于去建立可复用、自主运转的个人生产力飞轮。"}
              </p>
            </div>
            <div className="flex flex-col gap-3" id="essence-val-3">
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5A44]">03 / COMPOUNDING</span>
              <h3 className="font-serif text-base font-semibold text-[#1A2F24]">{lang === "en" ? "Long-Term Assets" : "长线资产 ｜ 穿越周期"}</h3>
              <p className="font-sans text-xs text-[#1C1C1C]/70 leading-relaxed">
                {lang === "en"
                  ? "We invest in timeless assets: body longevity, custom AI software, and patient capital."
                  : "将有限的生命心能与时间，尽数配置在随时间沉淀而不断复利增值的确定性长期资产上。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Segment 3: The Three Pillars Section (Continuous Winding Path SVG - Replicating image_7c5c07.jpg & Mont-Fort) */}
      <section id="pillars" ref={pillarsContainerRef} className="py-24 border-t border-[#D8D2C6] bg-[#F4F1EB] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
          
          {/* Section Heading Description Block */}
          <div className="max-w-3xl mx-auto text-center mb-28" id="pillars-header">
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
              03 / CORE METRIC
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight mb-8" id="pillars-main-title">
              {lang === "en" ? "The Three Pillars" : "三大核心智识支柱"}
            </h2>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/80 leading-relaxed ink-text" id="pillars-introduction">
              {threePillarsContent.introduction[lang]}
            </p>
          </div>

          {/* Absolute Background SVG Canvas containing organic winding dashed path line */}
          <div ref={svgContainerRef} className="absolute inset-0 top-60 bottom-0 pointer-events-none z-0" id="winding-path-canvas-container">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1000 1200"
              xmlns="http://www.w3.org/2000/svg"
              id="winding-path-svg"
            >
              <defs>
                {/* Soft gradient along the path to simulate ink dissipation */}
                <linearGradient id="windingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5A44" />
                  <stop offset="50%" stopColor="#1A2F24" />
                  <stop offset="100%" stopColor="#8B5A44" />
                </linearGradient>
              </defs>
              {/* The organic, curvy path line running down the entire section */}
              <path
                ref={svgPathRef}
                d="M 500,0 C 200,200 800,400 500,600 C 200,800 800,1000 500,1200"
                fill="none"
                stroke="url(#windingGrad)"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="opacity-80"
                id="winding-dash-path"
              />
            </svg>
          </div>

          {/* Alternating Content Glassmorphism Cards positioned along the path */}
          <div className="relative z-10 space-y-36 md:space-y-48" id="pillars-cards-flow">
            
            {threePillarsContent.pillars.map((pillar, idx) => {
              // Left / Right alignments based on index
              const isEven = idx % 2 === 0;
              const flexClass = isEven ? "justify-start md:pl-12" : "justify-end md:pr-12";
              const colOffset = isEven ? "lg:col-start-1 lg:col-span-6" : "lg:col-start-7 lg:col-span-6";

              return (
                <div key={pillar.id} className={`grid grid-cols-1 lg:grid-cols-12 w-full relative`} id={`pillar-wrapper-${pillar.id}`}>
                  
                  {/* Central Winding Path Intersecting Node (Placed at 50% horizontally in SVG space) */}
                  <div
                    ref={(el) => { nodeRefs.current[idx] = el; }}
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-[3px] border-[#D8D2C6] bg-[#F4F1EB] z-20 flex items-center justify-center shadow-md transition-all duration-300 hidden lg:flex"
                    id={`pillar-node-${pillar.id}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>

                  {/* Card container with alternate bento column grids */}
                  <div 
                    className={`${colOffset} cursor-pointer`} 
                    id={`pillar-col-${pillar.id}`}
                    onClick={() => handleNavigation(pillar.id === "body" ? "/pillars/mindfulness-health-longevity" : pillar.id === "tool" ? "/pillars/ai-automation" : "/pillars/wealth-cognition")}
                  >
                    <div className="pillar-parallax-wrapper w-full" id={`pillar-parallax-${pillar.id}`}>
                      <div className="pillar-glass-card glass-card rounded-md p-8 md:p-12 shadow-sm border border-[#D8D2C6] relative overflow-hidden group hover:border-[#8B5A44] transition-all duration-500">
                        
                        {/* Quiet luxury absolute background emblem */}
                        <span className="absolute right-6 top-4 font-display text-[4rem] font-bold text-[#8B5A44]/5 select-none leading-none">
                          0{idx + 1}
                        </span>

                        {/* Pillar Title */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2.5 rounded-sm bg-[#1A2F24]/10 text-[#8B5A44] transition-all duration-500 group-hover:bg-[#8B5A44]/10 group-hover:text-[#1A2F24] flex items-center justify-center">
                            {pillar.id === "body" ? (
                              <Activity className="w-5 h-5 stroke-[1.5] transition-all duration-500 ease-out group-hover:scale-125 group-hover:animate-pulse" />
                            ) : pillar.id === "tool" ? (
                              <Cpu className="w-5 h-5 stroke-[1.5] transition-all duration-500 ease-out group-hover:scale-125 group-hover:animate-pulse" />
                            ) : (
                              <Coins className="w-5 h-5 stroke-[1.5] transition-all duration-500 ease-out group-hover:scale-125 group-hover:animate-pulse" />
                            )}
                          </div>
                          <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44]">
                            {pillar.pillarName[lang]}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] mb-6 leading-tight">
                          {pillar.title[lang]}
                        </h3>

                        <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed mb-8">
                          {pillar.description[lang]}
                        </p>

                        {/* Editorial Tag Line */}
                        <div className="flex items-center justify-between border-t border-[#D8D2C6]/40 pt-6">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A44]"></span>
                            <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/60">
                              {pillar.id === "body" ? "LONG-TERM VITALITY" : pillar.id === "tool" ? "AI LEVERAGE PLATFORM" : "COMPOUND WEALTH"}
                            </span>
                          </div>
                          <span className="font-display text-[9px] font-bold uppercase tracking-[0.25em] text-[#8B5A44] group-hover:text-[#1A2F24] transition-colors duration-300 flex items-center gap-1.5">
                            {lang === "en" ? "EXPLORE PILLAR" : "探索主册"} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Segment 4: What We Create Section (Splits, list, right stone card - Replicating image_7c5c07.jpg) */}
      <section id="products" className="py-24 border-t border-[#D8D2C6] bg-[#F4F1EB] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Header block */}
          <div className="border-b border-[#D8D2C6] pb-12 mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6" id="create-header">
            <div>
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
                04 / OUR ECOSYSTEM
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight" id="create-section-title">
                {whatWeCreateContent.title[lang]}
              </h2>
            </div>
            <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/60 max-w-md leading-relaxed">
              {lang === "en" ? "Every piece of knowledge is connected. We formulate structure from chaos so you can learn and act immediately." : "打破孤立。智枢阁为你淬炼知识链条，让底层逻辑在深度实操中产生闭环效能。"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="create-grid-layout">
            
            {/* Left side: Premium Image with real-time generated 4-sided torn paper edge mask and dual-layer backing effect */}
            <div
              className="lg:col-span-4 relative h-[450px] lg:h-[600px] hidden lg:block group"
              id="create-left-col"
            >
              <div className="what-create-ecosystem-wrap h-full">
                <div className="what-create-paper-board" aria-hidden="true" />
                <div className="what-create-tear-shadow" aria-hidden="true" />

                <div
                  className="what-create-ecosystem-image absolute inset-0 h-full"
                  style={{ clipPath: "url(#torn-paper-image-clip)" }}
                >
                  <div className="absolute inset-0 bg-[#8B5A44]/[0.035] pointer-events-none z-[1]" />

                  <div className="create-parallax-img absolute inset-0 w-full h-[120%] -top-[10%]">
                    <img
                      src="https://cms.immersation.com/wp-content/uploads/2026/07/WHAT-WE-CREATE-01.png"
                      alt="Immersation ecosystem"
                      className="what-create-ecosystem-img-el w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Side: Dynamic Interactive List of Products */}
            <div className="lg:col-span-5 flex flex-col justify-center create-list-container" id="create-middle-col">
              <div className="space-y-6">
                {whatWeCreateContent.items.map((item) => {
                  const isComingSoon = item.num !== "01";
                  return (
                    <div
                      key={item.num}
                      onClick={(e) => {
                        if (!isComingSoon && item.num === "01") handleNavigation("editorial-intelligence", e);
                      }}
                      className={`create-list-item flex gap-6 items-start p-5 border-b border-[#D8D2C6]/40 rounded-sm transition-all duration-300 group ${isComingSoon ? "cursor-default opacity-80" : "hover:bg-[#E8DDCF]/30 cursor-pointer"}`}
                      id={`create-item-${item.num}`}
                    >
                      <span className={`font-display text-xs font-bold text-[#8B5A44] ${!isComingSoon ? "group-hover:scale-110 transition-transform" : ""}`}>
                        {item.num}
                      </span>
                      <div className="flex-1 relative">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className={`font-display text-sm font-semibold uppercase tracking-wider text-[#1A2F24] ${!isComingSoon ? "group-hover:text-[#8B5A44] transition-colors" : ""}`}>
                            {item.title[lang]}
                          </h3>
                          {isComingSoon && (
                            <span className="font-display text-[9px] uppercase font-bold tracking-[0.2em] text-[#8B5A44] bg-[#8B5A44]/10 px-2 py-0.5 rounded-sm">
                              {lang === "en" ? "Coming Soon" : "敬请期待"}
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                          {item.description[lang]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Tall visual card "Curated. Connected. Continuously Evolving." */}
            <div className="lg:col-span-3 lg:h-[600px] flex flex-col justify-between" id="create-right-col">
              <div className="create-right-card glass-card rounded-md border border-[#D8D2C6] p-8 flex flex-col justify-between h-full bg-[#E8DDCF]/15 relative" id="curated-evolving-card">
                
                {/* Visual of Stacked Zen balancing pebbles drawn in SVG */}
                <div className="w-full flex justify-center py-6" id="zen-stones-container">
                  <svg viewBox="0 0 200 240" className="w-40 h-48" id="zen-stones-svg">
                    {/* Sand Ground floor line */}
                    <line x1="20" y1="210" x2="180" y2="210" stroke="#D8D2C6" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* Shadow base ellipse */}
                    <ellipse cx="100" cy="210" rx="55" ry="10" fill="#1C1C1C" opacity="0.08" />

                    {/* Bottom stone 01 */}
                    <ellipse cx="100" cy="180" rx="52" ry="24" fill="#757065" />
                    <ellipse cx="98" cy="177" rx="49" ry="21" fill="none" stroke="#D8D2C6" strokeWidth="1" opacity="0.3" />
                    
                    {/* Middle stone 02 */}
                    <ellipse cx="102" cy="140" rx="40" ry="18" fill="#4B564E" />
                    <ellipse cx="100" cy="138" rx="37" ry="15" fill="none" stroke="#F4F1EB" strokeWidth="1" opacity="0.2" />

                    {/* Mid-top stone 03 */}
                    <ellipse cx="97" cy="108" rx="28" ry="14" fill="#8B5A44" />
                    <ellipse cx="96" cy="106" rx="25" ry="11" fill="none" stroke="#F4F1EB" strokeWidth="1" opacity="0.3" />

                    {/* Top stone 04 */}
                    <ellipse cx="101" cy="84" rx="18" ry="10" fill="#B69A6B" />
                    
                    {/* Micro Accent ring surrounding top stone (representing intelligence gravity) */}
                    <circle cx="101" cy="84" r="28" fill="none" stroke="#8B5A44" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                    <circle cx="121" cy="65" r="3" fill="#8B5A44" />
                  </svg>
                </div>

                <div className="pt-6 border-t border-[#D8D2C6]/50 mt-4">
                  <h3 className="font-serif text-xl font-semibold text-[#1A2F24] leading-tight mb-4">
                    {whatWeCreateContent.rightCard.title[lang]}
                  </h3>
                  <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                    {whatWeCreateContent.rightCard.description[lang]}
                  </p>
                </div>

                {/* Footnote Badge */}
                <div className="mt-8 flex items-center justify-between" id="curated-evolving-footnote">
                  <span className="text-[8px] font-display font-bold text-[#8B5A44] tracking-[0.2em] uppercase">
                    IMMERSATION 智枢阁
                  </span>
                  <span className="text-[10px] font-mono text-[#1C1C1C]/50">
                    EST. 2026
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Segment 5: From The Journal (Bento Grid of Cards - Replicating image_7c5c07.jpg) */}
      <section id="editorial" className="py-24 border-t border-[#D8D2C6] bg-[#F4F1EB] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-[#D8D2C6]/50 pb-12 mb-16 gap-6" id="journal-header">
            <div>
              <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-3">
                05 / PERIODICAL FEEDS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight" id="journal-section-title">
                {lang === "en" ? "From the Journal" : "智枢内参专栏"}
              </h2>
            </div>
            <a
              href="#about"
              className="font-display text-xs font-bold tracking-widest text-[#8B5A44] hover:text-[#1A2F24] transition-colors duration-300 uppercase flex items-center gap-1.5"
              id="cta-all-articles"
            >
              {lang === "en" ? "VIEW ALL ARTICLES" : "查阅所有智识内参"}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Premium Bento Grid of 5 Cards */}
          <div className="journal-grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8" id="journal-grid">
            
            {articles.slice(0, 5).map((article, idx) => {
              // Create custom grid sizing for bento effect
              // Card 1: Span 5 columns on desktop
              // Card 2: Span 7 columns on desktop
              // Card 3: Span 4 columns
              // Card 4: Span 4 columns
              // Card 5: Span 4 columns
              let gridColClass = "lg:col-span-4";
              if (idx === 0) gridColClass = "lg:col-span-5";
              if (idx === 1) gridColClass = "lg:col-span-7";

              return (
                <div
                  key={article.id}
                  className={`journal-card-wrapper ${gridColClass} border border-[#D8D2C6] hover:border-[#8B5A44] rounded-sm bg-white/40 p-8 flex flex-col justify-between transition-all duration-500 group cursor-pointer hover:bg-white/80 hover:shadow-lg`}
                  id={`journal-card-${article.id}`}
                >
                  <div>
                    {/* Header: Category & Date Indicator */}
                    <div className="flex justify-between items-center mb-8" id={`journal-card-header-${article.id}`}>
                      <span className="font-display text-[9px] font-bold tracking-[0.2em] text-[#8B5A44] uppercase bg-[#8B5A44]/5 px-3 py-1 rounded-sm">
                        {typeof article?.category === "object" && article?.category !== null ? (article.category[lang] || article.category.en) : (article?.category || "ARTICLE")}
                      </span>
                      <span className="text-[10px] font-mono text-[#1C1C1C]/40">
                        {idx === 0 ? "JUL 2026" : idx === 1 ? "JUN 2026" : "MAY 2026"}
                      </span>
                    </div>

                    {/* Slogan title */}
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1A2F24] leading-snug mb-4 group-hover:text-[#8B5A44] transition-colors">
                      {typeof article?.title === "object" && article?.title !== null ? (article.title[lang] || article.title.en || article.title.zh) : (article?.title || "")}
                    </h3>

                    {/* Description */}
                    <p className="font-serif text-sm text-[#1C1C1C]/75 leading-relaxed mb-8 ink-text">
                      {typeof article?.description === "object" && article?.description !== null ? (article.description[lang] || article.description.en || article.description.zh) : (article?.description || "")}
                    </p>
                  </div>

                  {/* Footer: Read Time & Action Arrow */}
                  <div className="border-t border-[#D8D2C6]/30 pt-6 flex justify-between items-center" id={`journal-card-footer-${article.id}`}>
                    <span className="font-display text-[9px] font-bold tracking-widest text-[#1C1C1C]/50 uppercase">
                      {typeof article?.readTime === "object" && article?.readTime !== null ? (article.readTime[lang] || article.readTime.en) : (article?.readTime || "5 MIN")}
                    </span>
                    <div className="flex items-center gap-1.5 text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors">
                      <span className="font-display text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {lang === "en" ? "READ" : "阅读"}
                      </span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Segment 5.5: Digital Publishing / Products (4 realistic 3D book slabs catalog) */}
      <section id="digital-publishing" className="py-24 border-t border-[#D8D2C6] bg-[#F4F1EB] relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20" id="digital-publishing-header">
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
              06 / DIGITAL STANDARDS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight" id="publishing-main-title">
              {lang === "en" ? "Digital Publishing & Products" : "数字出版与高阶资产"}
            </h2>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/80 mt-6 leading-relaxed ink-text">
              {lang === "en" 
                ? "Premium structured knowledge blueprints designed to offload cognitive strain and establish actionable daily systems."
                : "高密度、系统化的智识蓝图。旨在卸载大脑认知过载，助你一步步落地坚不可摧的个人智能操作系统。"}
            </p>
          </div>

          {/* Four Product Book Notebook Slabs Grid */}
          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <span className="font-display text-xs uppercase font-bold tracking-[0.3em] text-[#8B5A44] mb-3">
                {lang === "en" ? "Coming Soon" : "敬请期待"}
              </span>
              <p className="font-serif text-[#1C1C1C]/60 text-sm max-w-sm text-center">
                {lang === "en" 
                  ? "Digital products are currently under development. Check back later for structured knowledge blueprints."
                  : "数字产品正在加紧研发中，敬请期待高密度智识蓝图的发布。"}
              </p>
            </div>
          ) : (
          <div
            ref={booksRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pt-8"
            id="books-container"
          >
            {books.map((book) => {
              const bgClass = book.coverColor || "bg-[#1A2F24]";
              const borderClass = book.borderColor || "border-[#1A2F24]";
              const textClass = book.textColor || "text-[#F4F1EB]";
              const coverImg = book.cover || book.coverImageUrl || "";
              const hasCustomImage = typeof coverImg === "string" && coverImg.trim().length > 0 && !coverImg.includes("IMMERSATION-LOGO-Light-scaled.png");

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    setSelectedReadingBookId(book.id);
                    setActiveView("reading-room");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="book-cover-wrapper flex flex-col items-center group cursor-pointer"
                  id={`book-item-${book.id}`}
                >
                  {/* 3D Realistic Book-Slab with cover texture and leather shadow */}
                  <div
                    className={`w-full max-w-[280px] aspect-[3/4.2] ${bgClass} border ${borderClass} rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500 relative transform group-hover:-translate-y-4 group-hover:rotate-1 flex flex-col justify-between p-8 overflow-hidden`}
                    id={`book-slab-${book.id}`}
                  >
                    {/* Cover Image display if image URL is supplied */}
                    {hasCustomImage ? (
                      <>
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-sm">
                          <img 
                            src={coverImg || undefined} 
                            referrerPolicy="no-referrer"
                            alt={typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en) : (book?.title || "Book Cover")}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        {/* Tactile Book Spine shadow/ridge effect on the left */}
                        <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/25 to-transparent border-r border-white/10 rounded-l-sm z-10 pointer-events-none"></div>
                        {/* Subtle paper edges visible on the right */}
                        <div className="absolute top-1.5 right-[-3px] w-[3px] h-[98%] bg-[#E8DDCF] border border-l-0 border-[#D8D2C6]/60 rounded-r-xs shadow-xs z-[-1]"></div>
                      </>
                    ) : (
                      <>
                        {/* Tactile Book Spine shadow/ridge effect on the left */}
                        <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/25 to-transparent border-r border-white/10 rounded-l-sm z-10 pointer-events-none"></div>
                        {/* Subtle paper edges visible on the right */}
                        <div className="absolute top-1.5 right-[-3px] w-[3px] h-[98%] bg-[#E8DDCF] border border-l-0 border-[#D8D2C6]/60 rounded-r-xs shadow-xs z-[-1]"></div>

                        {/* Top content: Category emblem and micro lines */}
                        <div className="flex justify-between items-start relative z-10">
                          <span className={`text-[9px] font-display font-semibold tracking-widest uppercase ${textClass}/70`}>
                            {book.id === "starter-kit" ? "SYSTEM CORE" : book.id === "workflow-playbook" ? "AI LEVERAGE" : book.id === "longevity-reset" ? "BODY & MIND" : "CAPITAL"}
                          </span>
                          {/* Tiny system nodes emblem */}
                          <div className="flex gap-1">
                            <span className={`w-1 h-1 rounded-full ${book.id === "starter-kit" ? "bg-[#B69A6B]" : "bg-[#8B5A44]"}`}></span>
                            <span className={`w-1 h-1 rounded-full ${book.id === "starter-kit" ? "bg-[#B69A6B]" : "bg-[#8B5A44]"} opacity-50`}></span>
                          </div>
                        </div>

                        {/* Center Content: Giant Debossed Title & Slogan */}
                        <div className="my-auto flex flex-col items-center text-center relative z-10">
                          {/* Pillar label AT THE TOP of the ebook title */}
                          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#B69A6B] mb-2">
                            {(typeof book.pillar === "object" && book.pillar !== null ? (book.pillar[lang] || book.pillar.en || book.pillar.zh) : book.pillar) || 
                             (typeof book.category === "object" && book.category !== null ? (book.category[lang] || book.category.en || book.category.zh) : book.category) || 
                             (book.id === "starter-kit" ? "Mindfulness & Systems" : book.id === "workflow-playbook" ? "AI & Automation" : book.id === "longevity-reset" ? "Mindfulness & Health" : "Wealth & Frameworks")}
                          </span>

                          {/* Vector Icon/Seals specific to each volume */}
                          <div className="mb-4">
                            {book.id === "starter-kit" ? (
                              <Compass className="w-10 h-10 stroke-[1.25] text-[#B69A6B]" />
                            ) : book.id === "workflow-playbook" ? (
                              <Sparkles className="w-10 h-10 stroke-[1.25] text-[#8B5A44]" />
                            ) : book.id === "longevity-reset" ? (
                              <Activity className="w-10 h-10 stroke-[1.25] text-[#E8DDCF]" />
                            ) : (
                              <Coins className="w-10 h-10 stroke-[1.25] text-[#B69A6B]" />
                            )}
                          </div>
                          
                          <h3 className={`font-serif text-lg tracking-wider font-semibold mb-2 ${textClass} leading-snug drop-shadow-sm`}>
                            {typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en || book.title.zh) : (book?.title || "")}
                          </h3>
                          <p className={`font-serif italic text-[11px] px-1 ${textClass}/80 leading-normal`}>
                            {typeof book?.tagline === "object" && book?.tagline !== null ? (book.tagline[lang] || book.tagline.en) : (typeof book?.description === "object" && book?.description !== null ? (book.description[lang] || book.description.en) : (book?.tagline || book?.description || ""))}
                          </p>
                        </div>

                        {/* Bottom: Publishing credit & details */}
                        <div className="border-t border-white/20 pt-4 flex justify-between items-end relative z-10">
                          <div className="text-left">
                            <span className={`text-[7px] font-display uppercase tracking-[0.2em] block ${textClass}/50`}>
                              PUBLISHER
                            </span>
                            <span className={`text-[9px] font-sans font-medium tracking-wide ${textClass}`}>
                              IMMERSATION
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono ${textClass}/70`}>
                            VOL. {book.id === "starter-kit" ? "01" : book.id === "workflow-playbook" ? "02" : book.id === "longevity-reset" ? "03" : "04"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                {/* Companion description text on page (aligned under the book cover) */}
                <div className="mt-6 text-center max-w-[260px] flex flex-col items-center">
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#8B5A44] mb-1">
                    {(typeof book.pillar === "object" && book.pillar !== null ? (book.pillar[lang] || book.pillar.en || book.pillar.zh) : book.pillar) || 
                     (typeof book.category === "object" && book.category !== null ? (book.category[lang] || book.category.en || book.category.zh) : book.category) || 
                     (book.id === "starter-kit" ? "Mindfulness & Systems" : book.id === "workflow-playbook" ? "AI & Automation" : book.id === "longevity-reset" ? "Mindfulness & Longevity" : "Wealth & Frameworks")}
                  </span>
                  <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-[#1A2F24] mb-2 group-hover:text-[#8B5A44] transition-colors">
                    {typeof book?.title === "object" && book?.title !== null ? (book.title[lang] || book.title.en || book.title.zh) : (book?.title || "")}
                  </h4>
                  <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                    {typeof book?.description === "object" && book?.description !== null ? (book.description[lang] || book.description.en || book.description.zh) : (book?.description || "")}
                  </p>
                  
                  {/* Premium Reading Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-[#D8D2C6]/30 pt-3 w-full justify-center">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[#8B5A44] group-hover:underline">
                      {lang === "en" ? "Read Online" : "在线阅读"}
                    </span>
                    <span className="text-[10px] text-[#1C1C1C]/30">•</span>
                    <span className="text-[10px] font-display font-medium uppercase tracking-wider text-[#1C1C1C]/50 hover:text-[#1C1C1C]">
                      {lang === "en" ? "Reading Room" : "进入阅读室"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          )}
        </div>
      </section>

      {/* Segment 5.6: Future Individual Journey */}
      <section id="journey" className="py-24 border-t border-[#D8D2C6] bg-[#F4F1EB] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="max-w-3xl mx-auto text-center mb-16" id="journey-header">
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
              07 / RECONSTRUCT THE SELF
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A2F24] tracking-tight" id="journey-title">
              {lang === "en" ? "Future Individual Journey" : "未来个体成长旅程"}
            </h2>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/80 mt-6 leading-relaxed ink-text">
              {lang === "en"
                ? "A quiet, highly deterministic system for personal expansion across three consecutive life horizons."
                : "一套连贯且高确定性的心智操作系统，由浅入深层层递进，重构你的未来秩序。"}
            </p>
          </div>

          {/* Timeline Horizontal Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative" id="journey-steps-grid">
            {/* Decorative Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-[2.25rem] left-[10%] right-[10%] h-[1px] bg-[#D8D2C6]/60 z-0"></div>
            
            {/* Step 1 */}
            <div className="bg-[#E8DDCF]/20 border border-[#D8D2C6]/60 rounded-sm p-8 flex flex-col items-center text-center relative z-10 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#1A2F24] text-[#F4F1EB] flex items-center justify-center font-display text-xs font-bold tracking-[0.2em] mb-6">
                01
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1A2F24] mb-4">
                {lang === "en" ? "Reclaim Time" : "收回时间"}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en"
                  ? "Solve productivity bottlenecks, repetitive tasks, and efficiency anxiety through AI automation and leverage."
                  : "通过 AI 自动化与智能化工具消除低效机械劳动，卸载身心重负，率先夺回时间主权。"}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#E8DDCF]/20 border border-[#D8D2C6]/60 rounded-sm p-8 flex flex-col items-center text-center relative z-10 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#8B5A44] text-[#F4F1EB] flex items-center justify-center font-display text-xs font-bold tracking-[0.2em] mb-6">
                02
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1A2F24] mb-4">
                {lang === "en" ? "Restore Energy" : "恢复精力"}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en"
                  ? "Reset your biology. Optimize physical recovery, deep sleep, and neuro-focus for sustained performance."
                  : "回归身体底层操作系统。改善深度睡眠、舒缓长期压力、训练底层专注力，彻底激活生命力容器。"}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#E8DDCF]/20 border border-[#D8D2C6]/60 rounded-sm p-8 flex flex-col items-center text-center relative z-10 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#F4F1EB] flex items-center justify-center font-display text-xs font-bold tracking-[0.2em] mb-6">
                03
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1A2F24] mb-4">
                {lang === "en" ? "Build Long-Term Value" : "建立长期价值"}
              </h3>
              <p className="font-sans text-xs text-[#1C1C1C]/75 leading-relaxed">
                {lang === "en"
                  ? "Develop calm judgment around capital, risk management, and compound systematic wealth building."
                  : "建立清醒、极度耐心的资产配置直觉，掌控长线风险，构筑起穿越周期的硬核数字价值体。"}
              </p>
            </div>
          </div>

          {/* Micro horizontal step-by-step indicator */}
          <div className="mt-12 text-center">
            <span className="font-serif italic text-xs text-[#8B5A44] tracking-wide">
              {lang === "en" 
                ? "Reclaim Time → Restore Energy → Build Long-Term Value."
                : "收回时间 → 恢复精力 → 建立长期价值。"}
            </span>
          </div>

        </div>
      </section>

      {/* Segment 5.7: By Malttrix ｜ 梦萃 */}
      <section id="malttrix" className="py-16 border-t border-[#D8D2C6] bg-[#1A2F24]/5 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-[9px] uppercase font-bold tracking-[0.3em] text-[#8B5A44] block mb-4">
            AFFILIATION
          </span>
          <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed max-w-2xl mx-auto italic">
            {lang === "en"
              ? "“Immersation｜智枢阁 is a knowledge brand by Malttrix｜梦萃, focused on personal intelligence, digital publishing, mindful longevity, AI automation, and wealth cognition.”"
              : "“Immersation｜智枢阁 是 Malttrix｜梦萃 旗下的知识品牌，专注于个人智能、数字出版、正念长寿、AI 自动化与财富认知。”"}
          </p>
          <div className="w-12 h-[1px] bg-[#8B5A44]/30 mx-auto mt-6"></div>
        </div>
      </section>

      {/* Segment 6: The Immersation Advantage (6 core point row values) */}
      <section id="advantage" className="py-24 border-t border-[#D8D2C6] bg-[#1A2F24] text-[#F4F1EB] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-20" id="advantage-header">
            <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#B69A6B] block mb-3">
              THE SYSTEM CORE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-[#F4F1EB]" id="advantage-title">
              {advantageContent.title[lang]}
            </h2>
            <div className="w-12 h-[1px] bg-[#B69A6B] mx-auto mt-6"></div>
          </div>

          {/* Grid structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12" id="advantage-grid">
            {advantageContent.items.map((item, idx) => (
              <div
                key={idx}
                className="border-b border-[#F4F1EB]/10 pb-8 flex flex-col justify-between group cursor-pointer hover:border-[#B69A6B] transition-colors duration-300"
                id={`advantage-item-${idx}`}
              >
                <div>
                  {/* Subtle index */}
                  <span className="font-mono text-[10px] text-[#B69A6B] block mb-4">
                    [ 0{idx + 1} ]
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#F4F1EB] mb-3 group-hover:text-[#B69A6B] transition-colors">
                    {item.title[lang]}
                  </h3>
                  <p className="font-sans text-xs text-[#F4F1EB]/70 leading-relaxed">
                    {item.description[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segment 7: Stay In The Loop Section (Split Newsletter - Replicating image_7c5c07.jpg) */}
      <section id="newsletter" className="pt-24 pb-0 bg-[#F4F1EB] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="newsletter-container-box rounded-md overflow-hidden glass-card shadow-lg p-8 md:p-16 relative z-20 -mb-24 md:-mb-28" id="newsletter-bento-card">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="newsletter-grid">
              
              {/* Left Column: Vector Still Life (Ceramic Vase still-life) */}
              <div className="lg:col-span-5 flex justify-center items-center" id="newsletter-left-col">
                <div className="w-full max-w-[280px] aspect-[1/1] bg-[#E8DDCF] rounded-sm border border-[#D8D2C6] relative overflow-hidden flex justify-center items-center shadow-md" id="vase-bg">
                  {/* Beautiful Clean vector Still Life of black vase with thin branches */}
                  <svg viewBox="0 0 200 200" className="w-full h-full" id="vase-stilllife-svg">
                    {/* Background soft ambient grid */}
                    <line x1="10" y1="170" x2="190" y2="170" stroke="#D8D2C6" strokeWidth="1.5" />
                    <line x1="50" y1="20" x2="50" y2="170" stroke="#D8D2C6" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="150" y1="20" x2="150" y2="170" stroke="#D8D2C6" strokeWidth="0.5" strokeDasharray="2,2" />

                    {/* Branch (Spanning gracefully) */}
                    <path
                      d="M 125,140 Q 140,90 110,60 Q 85,35 110,10 Q 75,50 120,80"
                      fill="none"
                      stroke="#1C1C1C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 118,65 Q 90,60 70,50"
                      fill="none"
                      stroke="#1C1C1C"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    
                    {/* Micro green leaves */}
                    <path d="M 110,10 Q 105,5 100,8 Q 105,12 110,10 Z" fill="#1A2F24" />
                    <path d="M 118,65 Q 110,60 112,56 Q 116,60 118,65 Z" fill="#1A2F24" />
                    <path d="M 70,50 Q 65,45 60,48 Q 65,52 70,50 Z" fill="#1A2F24" />

                    {/* Elegant Dark Textured Ceramic Vase */}
                    <path
                      d="M 85,170 C 80,135 75,125 100,125 C 125,125 120,135 115,170 Z"
                      fill="#1A2F24"
                    />
                    {/* Vase rim */}
                    <ellipse cx="100" cy="125" rx="10" ry="3" fill="#1C1C1C" />

                    {/* Small rustic tea bowl next to the vase */}
                    <path d="M 130,170 C 130,162 135,158 145,158 C 155,158 160,162 160,170 Z" fill="#8B5A44" />
                    <ellipse cx="145" cy="158" rx="7" ry="2" fill="#E8DDCF" />
                  </svg>
                </div>
              </div>

              {/* Right Column: Copywriting & Dynamic Subscribe Input Box */}
              <div className="lg:col-span-7" id="newsletter-right-col">
                <span className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] block mb-4">
                  {newsletterContent.title[lang]}
                </span>
                
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A2F24] leading-tight mb-4">
                  {newsletterContent.heading[lang]}
                </h3>

                <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed mb-8 ink-text">
                  {newsletterContent.subheading[lang]}
                </p>

                {subscribed ? (
                  <div className="flex items-center gap-3 bg-[#1A2F24]/5 border border-[#1A2F24]/20 rounded-sm p-4 animate-fade-in" id="subscribe-success-message">
                    <CheckCircle className="w-5 h-5 text-[#1A2F24]" />
                    <p className="font-serif text-sm font-semibold text-[#1A2F24]">
                      {newsletterContent.successMsg[lang]}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-4 max-w-lg" id="subscribe-form">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1C1C1C]/40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={newsletterContent.inputPlaceholder[lang]}
                          className="w-full bg-[#F4F1EB] border border-[#D8D2C6] focus:border-[#8B5A44] focus:outline-none rounded-sm py-4 pl-12 pr-4 font-sans text-xs text-[#1C1C1C] transition-brand placeholder:text-[#1C1C1C]/40"
                          id="newsletter-email-input"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand cursor-pointer whitespace-nowrap shadow-sm hover:shadow"
                      >
                        {newsletterContent.buttonText[lang]}
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="font-display text-[9px] uppercase tracking-wider text-[#1C1C1C]/50">
                        {lang === "en" ? "Select your interests (Optional):" : "选择您感兴趣的领域 (可选):"}
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
                            className="mt-0.5 rounded-sm border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44] transition-colors"
                          />
                          <div className="flex flex-col">
                            <span className="font-serif text-xs text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors">Body</span>
                            <span className="font-sans text-[9px] text-stone-500">{lang === "en" ? "Mindfulness, health, longevity" : "正念，健康，长寿"}</span>
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
                            className="mt-0.5 rounded-sm border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44] transition-colors"
                          />
                          <div className="flex flex-col">
                            <span className="font-serif text-xs text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors">Tool</span>
                            <span className="font-sans text-[9px] text-stone-500">{lang === "en" ? "AI, prompts, workflows" : "AI，提示词，工作流"}</span>
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
                            className="mt-0.5 rounded-sm border-[#D8D2C6] text-[#8B5A44] focus:ring-[#8B5A44] transition-colors"
                          />
                          <div className="flex flex-col">
                            <span className="font-serif text-xs text-[#1A2F24] group-hover:text-[#8B5A44] transition-colors">Capital</span>
                            <span className="font-sans text-[9px] text-stone-500">{lang === "en" ? "Wealth cognition, long-term thinking" : "财富认知，长期主义"}</span>
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
      </section>
        </>
      ) : activeView === "about" ? (
        <AboutView 
          lang={lang} 
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
        />
      ) : activeView === "privacy" ? (
        <PrivacyView 
          lang={lang} 
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
        />
      ) : activeView === "newsletter" ? (
        <NewsletterView 
          lang={lang} 
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
          newsletterIssues={newsletterIssues.length > 0 ? newsletterIssues : undefined}
        />
      ) : activeView === "pillar-mindfulness" ? (
        <MindfulnessPillarView 
          lang={lang} 
          articles={articles}
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
          onNavigateToNewsletter={() => {
            setActiveView("newsletter");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToArticle={(slug) => handleNavigation(slug ? "articles/" + slug : "articles")}
          onAddToCart={(item) => {
            setCartItems((prev) => {
              if (prev.some((i) => i.id === item.id)) return prev;
              return [...prev, item];
            });
            setCheckoutStep("cart");
            setCartOpen(true);
            if (audioEngineRef.current) audioEngineRef.current.playChime();
          }}
        />
      ) : activeView === "pillar-ai" ? (
        <AIPillarView 
          lang={lang} 
          articles={articles}
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
          onNavigateToNewsletter={() => {
            setActiveView("newsletter");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToArticle={(slug) => handleNavigation(slug ? "articles/" + slug : "articles")}
          onAddToCart={(item) => {
            setCartItems((prev) => {
              if (prev.some((i) => i.id === item.id)) return prev;
              return [...prev, item];
            });
            setCheckoutStep("cart");
            setCartOpen(true);
            if (audioEngineRef.current) audioEngineRef.current.playChime();
          }}
        />
      ) : activeView === "pillar-wealth" ? (
        <WealthPillarView 
          lang={lang} 
          articles={articles}
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
          onNavigateToNewsletter={() => {
            setActiveView("newsletter");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToArticle={(slug) => handleNavigation(slug ? "articles/" + slug : "articles")}
          onAddToCart={(item) => {
            setCartItems((prev) => {
              if (prev.some((i) => i.id === item.id)) return prev;
              return [...prev, item];
            });
            setCheckoutStep("cart");
            setCartOpen(true);
            if (audioEngineRef.current) audioEngineRef.current.playChime();
          }}
        />
      ) : activeView === "pillars" ? (
        <PillarsView
          lang={lang}
          onBackToHome={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToPillar={(pillar) => {
            if (pillar === "mindfulness") {
              setActiveView("pillar-mindfulness");
            } else if (pillar === "ai") {
              setActiveView("pillar-ai");
            } else if (pillar === "wealth") {
              setActiveView("pillar-wealth");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          onNavigateToNewsletter={() => {
            setActiveView("newsletter");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : activeView === "articles" ? (
        <ArticlesView
          lang={lang}
          onBackToHome={() => {
            setActiveView("home");
            window.history.pushState({}, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          initialArticleSlug={activeArticleSlug}
          articles={articles}
        />
      ) : activeView === "reading-room" ? (
        <ReadingRoomView
          lang={lang}
          selectedBookId={selectedReadingBookId}
          unlockedBookIds={unlockedBookIds}
          booksData={books}
          onUnlockBook={(bookId) => {
            const bookToUnlock = books.find(b => b.id === bookId);
            if (bookToUnlock) {
              setCartItems((prev) => {
                if (prev.some(item => item.id === bookToUnlock.id)) return prev;
                return [...prev, bookToUnlock];
              });
              setCheckoutStep("cart");
              setCartOpen(true);
              if (audioEngineRef.current) audioEngineRef.current.playChime();
            }
          }}
          onBackToHome={() => {
            setActiveView(lastNonRoomView);
            setSelectedReadingBookId(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
        />
      ) : activeView === "listening-room" ? (
        <ListeningRoomView
          lang={lang}
          onBackToHome={() => {
            setActiveView(lastNonRoomView);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
        />
      ) : activeView === "digital-publishing" ? (
        <DigitalPublishingView
          lang={lang}
          books={books}
          onBackToHome={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          onAddToCart={(item) => {
            setCartItems(prev => {
              if (prev.some(i => i.id === item.id)) return prev;
              return [...prev, { ...item, title: typeof item.title === "string" ? { en: item.title, zh: item.title } : item.title }];
            });
            setCartOpen(true);
          }}
          onNavigateToReadingRoom={(bookId) => {
            setActiveView("reading-room");
            setSelectedReadingBookId(bookId);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : activeView === "editorial-intelligence" ? (
        <EditorialIntelligenceView
          lang={lang}
          articles={articles}
          newsletterIssues={newsletterIssues}
          onBackToHome={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          onNavigateToNewsletter={() => {
            setActiveView("newsletter");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToArticles={(slug) => {
            if (slug) {
              handleNavigation("articles/" + slug);
            } else {
              handleNavigation("articles");
            }
          }}
        />
      ) : activeView === "ai-toolkits" ? (
        <AIToolkitsView
          lang={lang}
          onBackToHome={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          onAddToCart={(item) => {
            setCartItems(prev => {
              if (prev.some(i => i.id === item.id)) return prev;
              // Format structure for the cart
              return [...prev, {
                id: item.id,
                title: typeof item.title === 'string' ? { en: item.title, zh: item.title } : item.title,
                price: item.id === "calm-ai-playbook" ? 29.00 : 19.00,
                format: "Digital Toolkit",
                cover: "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-Light-scaled.png"
              }];
            });
            setCartOpen(true);
          }}
        />
      ) : activeView === "audio-experiences" ? (
        <AudioExperiencesView
          lang={lang}
          onBackToHome={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          onNavigateToListeningRoom={() => {
            setActiveView("listening-room");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onAddToCart={(item) => {
            setCartItems(prev => {
              if (prev.some(i => i.id === item.id)) return prev;
              return [...prev, {
                id: item.id,
                title: typeof item.title === 'string' ? { en: item.title, zh: item.title } : item.title,
                price: 19.00,
                format: "Audio Publication",
                cover: "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-Light-scaled.png"
              }];
            });
            setCartOpen(true);
          }}
        />
      ) : activeView === "wealth-frameworks" ? (
        <WealthFrameworksView
          lang={lang}
          onBackToHome={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlayChime={() => audioEngineRef.current?.playChime()}
          onAddToCart={(item) => {
            setCartItems(prev => {
              if (prev.some(i => i.id === item.id)) return prev;
              return [...prev, {
                id: item.id,
                title: typeof item.title === 'string' ? { en: item.title, zh: item.title } : item.title,
                price: 39.00,
                format: "Wealth Framework",
                cover: "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-Light-scaled.png"
              }];
            });
            setCartOpen(true);
          }}
        />
      ) : activeView === "admin" ? (
        userEmail === "dreammyhomee@gmail.com" ? (
          <AdminDashboard
            lang={lang}
            userEmail={userEmail}
            systemMembers={systemMembers}
            setSystemMembers={setSystemMembers}
            systemTransactions={systemTransactions}
            setSystemTransactions={setSystemTransactions}
            books={books}
            setBooks={setBooks}
            articles={articles}
            setArticles={setArticles}
            newsletterIssues={newsletterIssues}
            setNewsletterIssues={setNewsletterIssues}
            onClose={() => {
              setActiveView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          <div className="min-h-screen bg-[#F4F1EB] flex flex-col items-center justify-center p-6 text-center">
            <Lock className="w-16 h-16 text-[#8B5A44] mb-4 animate-bounce" />
            <h1 className="font-serif text-3xl font-semibold text-[#1A2F24] mb-2">
              {lang === "en" ? "Access Denied" : "访问受限"}
            </h1>
            <p className="text-sm text-stone-600 max-w-md mb-6">
              {lang === "en" 
                ? "This console is reserved exclusively for the System Administrator (dreammyhomee@gmail.com). Please sign in using the administrator credentials."
                : "此决策控制台仅限系统超级管理员 (dreammyhomee@gmail.com) 访问。请使用管理员账户进行身份验证。"}
            </p>
            <button
              onClick={() => {
                setActiveView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-xs transition-colors cursor-pointer"
            >
              {lang === "en" ? "Return to Library" : "返回数字图书馆"}
            </button>
          </div>
        )
      ) : (
        <TermsView 
          lang={lang} 
          onBackToHome={() => setActiveView("home")} 
          onPlayChime={() => audioEngineRef.current?.playChime()} 
        />
      )}

      {/* Footer (Replicating Deep Cypress block layout from image_7c5c07.jpg) */}
      {activeView !== "admin" && activeView !== "reading-room" && activeView !== "listening-room" && (
        <footer id="main-footer" className="bg-[#1A2F24] text-[#F4F1EB]/95 border-t border-[#D8D2C6]/10 pt-36 md:pt-40 lg:pt-44 pb-12 relative overflow-hidden">
        {/* Faint Concentric Circles Background (as seen in Screenshot 1) */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none overflow-hidden opacity-[0.08] select-none z-0 animate-fade-in" id="footer-radial-circles">
          <div className="absolute -top-10 -right-10 w-full h-full rounded-full border-[1.5px] border-[#F4F1EB]"></div>
          <div className="absolute top-10 right-10 w-[80%] h-[80%] rounded-full border-[1.5px] border-[#F4F1EB]"></div>
          <div className="absolute top-28 right-28 w-[60%] h-[60%] rounded-full border-[1.5px] border-[#F4F1EB]"></div>
          <div className="absolute top-44 right-44 w-[40%] h-[40%] rounded-full border-[1.5px] border-[#F4F1EB]"></div>
          <div className="absolute top-60 right-60 w-[20%] h-[20%] rounded-full border-[1.5px] border-[#F4F1EB]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          {/* Top segment: Large Slogan & Branding columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#F4F1EB]/10" id="footer-top-grid">
            
            {/* Slogan and Brand Column */}
            <div className="lg:col-span-4" id="footer-brand-summary">
              <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight text-[#F4F1EB] mb-4">
                {footerContent.slogan[lang]}
              </h3>
              <p className={`font-serif text-xs text-[#F4F1EB]/70 max-w-sm leading-relaxed mb-6 ${lang === "en" ? "italic" : ""}`}>
                {footerContent.subSlogan[lang]}
              </p>

              {/* Sub brand affiliation */}
              <div className="inline-block border border-[#F4F1EB]/10 rounded-sm px-4 py-2 bg-[#F4F1EB]/5" id="footer-affiliation-box">
                <span className="font-display text-[9px] uppercase tracking-[0.2em] text-[#B69A6B] block">
                  BRAND AFFILIATION
                </span>
                <span className="font-sans text-[10px] text-[#F4F1EB] font-medium">
                  {footerContent.affiliation[lang]}
                </span>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-8" id="footer-links-grid">
              {footerContent.columns.map((column, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-5" id={`footer-col-${colIdx}`}>
                  <h4 className="font-display text-[10px] uppercase font-bold tracking-[0.25em] text-[#F4F1EB]/45 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B69A6B] inline-block flex-shrink-0"></span>
                    {column.title[lang]}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {column.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <a
                          href={link.href}
                          onClick={(e) => handleNavigation(link.href, e)}
                          className="font-display text-xs text-[#F4F1EB]/70 hover:text-[#B69A6B] transition-colors duration-300"
                        >
                          {link.label[lang]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom segment: Highly polished brand signature */}
          <div className="pt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="footer-bottom">
            {/* Logo and sub-brand details on Left */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <img 
                  src="https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-LOGO-Light-scaled.png" 
                  alt="Immersation Logo" 
                  className="h-10 w-auto object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[#F4F1EB]/40 font-sans text-[10px] tracking-[0.1em] uppercase">
                {lang === "en" ? "Stable Body. Intelligent Leverage. Long-Term Capital." : "稳定身心 ｜ 智能放大 ｜ 长期资本"}
              </p>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-2 text-[11px] font-display font-medium tracking-widest text-[#F4F1EB]/50">
              <button 
                onClick={() => setLang("en")} 
                className={`hover:text-[#B69A6B] transition-colors uppercase ${lang === "en" ? "text-[#B69A6B] font-bold" : ""}`}
                id="footer-lang-en"
              >
                EN
              </button>
              <span className="text-white/10">/</span>
              <button 
                onClick={() => setLang("zh")} 
                className={`hover:text-[#B69A6B] transition-colors ${lang === "zh" ? "text-[#B69A6B] font-bold" : ""}`}
                id="footer-lang-zh"
              >
                中文
              </button>
            </div>

            {/* Copyright & Core Affiliation Credit on Right */}
            <div className="flex flex-col items-start md:items-end text-[11px] text-[#F4F1EB]/50 font-sans gap-1" id="footer-copyright-and-affiliation">
              <span>© 2026 Immersation｜智枢阁. All rights reserved.</span>
              <span className="text-[#F4F1EB]/35 text-[10px] italic">
                {lang === "en" ? "A knowledge brand by Malttrix｜梦萃." : "Malttrix｜梦萃 旗下智识出版品牌。"}
              </span>
            </div>
          </div>

        </div>
      </footer>
      )}

      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in" id="google-auth-modal">
          <div className="bg-white text-stone-900 w-full max-w-[420px] rounded-lg shadow-2xl p-8 border border-stone-200 font-sans text-left flex flex-col justify-between min-h-[500px] relative animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => {
                setShowGoogleModal(false);
                setGoogleAuthError("");
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Logo */}
            <div className="flex flex-col items-center text-center mt-4">
              <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <h3 className="text-xl font-normal text-stone-800 tracking-tight">
                {lang === "en" ? "Sign in with Google" : "使用 Google 账号登录"}
              </h3>
              <p className="text-xs text-stone-500 mt-1.5">
                {lang === "en" ? "to continue to Immersation" : "继续前往 Immersation（智枢阁）"}
              </p>
            </div>

            {/* Email form & choices */}
            <div className="my-6 space-y-4">
              {/* Error indicator */}
              {googleAuthError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm">
                  {googleAuthError}
                </div>
              )}

              {/* Supabase OAuth Integration */}
              {isSupabaseConfigured ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (supabase) {
                      setIsSigningIn(true);
                      setGoogleAuthError("");
                      const inIframe = window.self !== window.top;
                      
                      if (inIframe) {
                        alert(lang === "en" 
                          ? "Note: Google Sign-In requires top-level navigation. Since you are previewing inside the AI Studio iframe, the callback might result in a 404 page. For full testing, please use your live deployed website." 
                          : "注意：Google 登录需要在顶层窗口进行。由于您正在 AI Studio 预览版中测试，回调可能会跳转到 404 页面。请在您真实部署的网站上进行完整测试。");
                      }
                      
                      const { data, error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: window.location.origin,
                          skipBrowserRedirect: true, // Always use popup for cleaner SPA experience
                        },
                      });
                      if (error) {
                        setGoogleAuthError(error.message);
                        setIsSigningIn(false);
                      } else if (data?.url) {
                        // Open the authorization URL in a popup window
                        const width = 600;
                        const height = 700;
                        const left = window.screen.width / 2 - width / 2;
                        const top = window.screen.height / 2 - height / 2;
                        
                        const authWindow = window.open(
                          data.url,
                          "google_oauth_popup",
                          `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
                        );
                        
                        if (!authWindow) {
                          // Fallback to a direct redirect if popup is blocked
                          window.location.href = data.url;
                        } else {
                          // Stop spinner if popup opened successfully, modal will close when message received
                          setIsSigningIn(false);
                        }
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 hover:border-[#8B5A44] font-sans text-xs font-semibold py-3 px-4 rounded-sm tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer mb-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span className="text-[#1a73e8]">{lang === "en" ? "Continue with Google (Real Auth)" : "通过 Google 账号登录 (真实认证)"}</span>
                </button>
              ) : (
                <div className="space-y-3 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmailInput("dreammyhomee@gmail.com");
                      setGooglePasswordInput("password123");
                      setGoogleAuthError("");
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-stone-50 border border-stone-200 hover:border-[#8B5A44] font-sans text-xs font-semibold py-3 px-4 rounded-sm tracking-wide transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span className="text-stone-700">{lang === "en" ? "Demo Admin Login (dreammyhomee)" : "一键填入演示管理员账号"}</span>
                  </button>
                  <div className="p-3 bg-[#F4F1EB]/80 border border-stone-200/50 rounded-xs text-stone-500 font-sans text-[10px] leading-relaxed">
                    {lang === "en" ? (
                      <span>
                        💡 <strong>Supabase is not configured yet.</strong> To enable real, secure Google Sign-In, please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in the settings.
                      </span>
                    ) : (
                      <span>
                        💡 <strong>尚未在环境中配置 Supabase。</strong>要启用真实的、安全的 Google 快捷登录，请在设置中配置您的 <code>VITE_SUPABASE_URL</code> 和 <code>VITE_SUPABASE_ANON_KEY</code> 环境变量。
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Secure Input form */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Google Account Email" : "Google 账号邮箱"}
                  </label>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => {
                      setGoogleEmailInput(e.target.value);
                      setGoogleAuthError("");
                    }}
                    placeholder="your.google.account@gmail.com"
                    className="w-full bg-white border border-stone-200 focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-4 text-xs font-sans text-stone-800"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Google Account Password" : "输入 Google 密码"}
                  </label>
                  <input
                    type="password"
                    value={googlePasswordInput}
                    onChange={(e) => setGooglePasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-stone-200 focus:border-[#8B5A44] focus:outline-none rounded-sm py-3 px-4 text-xs font-sans text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* Bottom: actions */}
            <div className="flex justify-between items-center border-t border-stone-100 pt-5">
              <span className="text-[10px] text-stone-400 font-medium">
                {lang === "en" ? "Google One-Tap Auth" : "Google 快捷认证"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!googleEmailInput) {
                    setGoogleAuthError(lang === "en" ? "Please enter a valid Google Account email." : "请输入有效的 Google 账号邮箱。");
                    return;
                  }
                  if (!googleEmailInput.includes("@")) {
                    setGoogleAuthError(lang === "en" ? "Invalid email structure. Must be a valid Google Account." : "邮箱格式不正确。请使用有效的 Google 账号。");
                    return;
                  }
                  if (!googlePasswordInput || googlePasswordInput.length < 6) {
                    setGoogleAuthError(lang === "en" ? "Please enter your Google Account password (minimum 6 characters)." : "请输入您的 Google 账号密码（至少 6 位字符）。");
                    return;
                  }
                  setIsSigningIn(true);
                  setShowGoogleModal(false);
                  setTimeout(() => {
                    localStorage.setItem("immersation_user_email", googleEmailInput);
                    localStorage.setItem("immersation_login_type", "manual");
                    setUserEmail(googleEmailInput);
                    setSystemMembers(prev => {
                      if (prev.some(m => m.email === googleEmailInput)) return prev;
                      return [...prev, {
                        email: googleEmailInput,
                        role: googleEmailInput === "dreammyhomee@gmail.com" ? "System Administrator" : "Active Thought Leader",
                        joined: new Date().toISOString().split("T")[0],
                        status: "Active",
                        regMethod: "Google Account"
                      }];
                    });
                    setIsSigningIn(false);
                    if (googleEmailInput === "dreammyhomee@gmail.com") {
                      // If admin logging in, unlock all digital volumes immediately to represent "full access"!
                      const allBookIds = books.map(b => b.id);
                      setUnlockedBookIds(allBookIds);
                      localStorage.setItem("immersation_unlocked_books", JSON.stringify(allBookIds));
                      setAdminTab("overview");
                    } else {
                      setAdminTab("library");
                    }
                    if (audioEngineRef.current) audioEngineRef.current.playChime();
                  }, 1200);
                }}
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold py-2.5 px-6 rounded-sm tracking-wide transition-all hover:shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>{lang === "en" ? "Sign In" : "确定登录"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
