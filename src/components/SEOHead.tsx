import { articleSEO, hydrateArticle } from "../lib/article-studio";
import { useEffect } from "react";
import { Article } from "../articlesData";

interface SEOHeadProps {
  activeView: string;
  activeArticleSlug?: string | null;
  articles?: Article[];
  lang?: "en" | "zh";
}

export default function SEOHead({ activeView, activeArticleSlug, articles = [], lang = "en" }: SEOHeadProps) {
  useEffect(() => {
    const domain = "https://immersation.com";
    let title = "Immersation | 智枢阁";
    let description = "Immersation is a personal intelligence media brand for body, tool, and capital. Calm, structured knowledge systems for future-ready individuals.";
    let canonicalPath = "/";
    let canonicalOverride = "";
    let ogType = "website";
    let ogImage = "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-FIVICON.png";
    let jsonLdData: any = null;

    // Find active article if on article page
    if (activeView === "articles" && activeArticleSlug) {
      const raw = articles.find((a) => (a.slug || a.id) === activeArticleSlug);
      if (raw) {
        const art = hydrateArticle(raw);
        canonicalOverride = /^https?:\/\//.test(art.canonicalLink||'') ? art.canonicalLink : "";
        const {title:artTitle,description:artDesc}=articleSEO(art,lang);
        
        title = `${artTitle} | Immersation`;
        description = artDesc;
        canonicalPath = `/articles/${art.slug || art.id}`;
        ogType = "article";
        if (art.cover) ogImage = art.cover;

        jsonLdData = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": artTitle,
          "description": artDesc,
          "url": (canonicalOverride || `${domain}${canonicalPath}`),
          "image": [ogImage],
          "datePublished": art.created_at || "2026-07-28",
          "author": {
            "@type": "Organization",
            "name": art.author || "Immersation Editorial Board"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Immersation",
            "logo": {
              "@type": "ImageObject",
              "url": "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-FIVICON.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": (canonicalOverride || `${domain}${canonicalPath}`)
          }
        };
      }
    } else {
      switch (activeView) {
        case "articles":
          title = "Articles for the Future Individual | Immersation";
          description = "Explore in-depth articles on AI developer operations, body longevity, wealth cognition, and individual sovereignty.";
          canonicalPath = "/articles";
          break;
        case "newsletter":
          title = "Receive Clearer Signals — Newsletter | Immersation";
          description = "Subscribe to Immersation Newsletter for distilled mental frameworks on body, tool, and capital.";
          canonicalPath = "/newsletter";
          break;
        case "pillars":
          title = "The Core Frameworks: Body, Tool & Capital | Immersation";
          description = "Discover our three foundational pillars designed for future-ready individuals.";
          canonicalPath = "/pillars";
          break;
        case "pillar-mindfulness":
          title = "Body & Longevity Pillar | Immersation";
          description = "Mindfulness, physiological calibration, and neural architecture framework.";
          canonicalPath = "/pillars/mindfulness-health-longevity";
          break;
        case "pillar-ai":
          title = "Tool & AI Automation Pillar | Immersation";
          description = "Agentic workflows, Codex AI developer setup, and personal intelligence systems.";
          canonicalPath = "/pillars/ai-automation";
          break;
        case "pillar-wealth":
          title = "Capital & Sovereignty Pillar | Immersation";
          description = "Wealth cognition, long-term capital allocation, and individual sovereignty.";
          canonicalPath = "/pillars/wealth-cognition";
          break;
        case "editorial-intelligence":
          title = "Editorial Intelligence Engine | Immersation";
          description = "Curated publications and operational insights from the Immersation Editorial Board.";
          canonicalPath = "/editorial-intelligence";
          break;
        case "about":
          title = "About Us | Immersation";
          description = "Immersation is a personal intelligence media brand operating at the intersection of body, tool, and capital.";
          canonicalPath = "/about-us";
          break;
        case "privacy":
          title = "Privacy Policy | Immersation";
          description = "Read our Privacy Policy regarding your data and privacy rights on Immersation.";
          canonicalPath = "/privacy-policy";
          break;
        case "terms":
          title = "Terms of Use | Immersation";
          description = "Read the terms and conditions governing the use of Immersation services and content.";
          canonicalPath = "/terms-of-use";
          break;
        default:
          title = "Immersation | 智枢阁";
          description = "Immersation is a personal intelligence media brand for body, tool, and capital. Calm, structured knowledge systems for future-ready individuals.";
          canonicalPath = "/";
          break;
      }

      let schemaType = "WebPage";
      if (activeView === "home" || activeView === "pillars") schemaType = "WebSite";
      else if (activeView === "about") schemaType = "AboutPage";
      else if (activeView.startsWith("pillar-") || activeView === "articles") schemaType = "CollectionPage";

      jsonLdData = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": title,
        "url": (canonicalOverride || `${domain}${canonicalPath}`),
        "description": description,
        "publisher": {
          "@type": "Organization",
          "name": "Immersation",
          "logo": {
            "@type": "ImageObject",
            "url": "https://cms.immersation.com/wp-content/uploads/2026/07/IMMERSATION-FIVICON.png"
          }
        }
      };
    }

    const fullCanonicalUrl = (canonicalOverride || `${domain}${canonicalPath}`);

    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set/update meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Immersation');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);

    // Robots meta tag ensuring explicit index, follow
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large');

    // 3. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullCanonicalUrl);

    // 4. Update JSON-LD Script Tag
    let scriptTag = document.getElementById("json-ld-schema") as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "json-ld-schema";
      scriptTag.type = "application/ld-json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);

    // 5. Update Breadcrumb Schema Script Tag
    let breadcrumbScript = document.getElementById("json-ld-breadcrumb") as HTMLScriptElement | null;
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement("script");
      breadcrumbScript.id = "json-ld-breadcrumb";
      breadcrumbScript.type = "application/ld-json";
      document.head.appendChild(breadcrumbScript);
    }

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${domain}/`
        },
        ...(canonicalPath !== "/" ? [
          {
            "@type": "ListItem",
            "position": 2,
            "name": title.split("|")[0].trim(),
            "item": fullCanonicalUrl
          }
        ] : [])
      ]
    };
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData, null, 2);

  }, [activeView, activeArticleSlug, articles, lang]);

  return null;
}
