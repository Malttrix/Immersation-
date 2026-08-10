import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import AdmZipPkg from "adm-zip";
import TurndownPkg from "turndown";
import dotenv from "dotenv";

const AdmZip = (AdmZipPkg as any)?.default || AdmZipPkg;
const TurndownService = (TurndownPkg as any)?.default || TurndownPkg;

dotenv.config();

export interface BookChapter {
  chapterLabel: { en: string; zh: string };
  title: { en: string; zh: string };
  leftContentMarkdown: { en: string; zh: string };
  rightContentMarkdown: { en: string; zh: string };
}

/**
 * Normalizes input EPUB URL and creates candidate URLs to attempt fetching.
 * Handles common user entry mistakes such as including server root folders (/httpdocs, /public_html)
 * or HTTP vs HTTPS protocol differences.
 */
function getCandidateUrls(rawUrl: string): string[] {
  if (!rawUrl) return [];
  const trimmed = rawUrl.trim().replace(/^["']|["']$/g, "");
  const candidates: string[] = [];

  const addCandidate = (u: string) => {
    if (u && !candidates.includes(u)) {
      candidates.push(u);
    }
  };

  // 1. Cleaned URL: strip /httpdocs, /public_html, /www from path
  let cleaned = trimmed.replace(/([^:]\/+)(httpdocs|public_html|www)(\/|$)/gi, "$1");
  cleaned = cleaned.replace(/(https?:\/\/)([^/]+)\/+/gi, "$1$2/");
  
  addCandidate(cleaned);

  // 2. HTTPS / HTTP swap for cleaned
  if (cleaned.startsWith("http://")) {
    addCandidate(cleaned.replace(/^http:\/\//i, "https://"));
  } else if (cleaned.startsWith("https://")) {
    addCandidate(cleaned.replace(/^https:\/\//i, "http://"));
  }

  // 3. Original raw trimmed URL
  addCandidate(trimmed);

  // 4. HTTPS / HTTP swap for raw trimmed URL
  if (trimmed.startsWith("http://")) {
    addCandidate(trimmed.replace(/^http:\/\//i, "https://"));
  } else if (trimmed.startsWith("https://")) {
    addCandidate(trimmed.replace(/^https:\/\//i, "http://"));
  }

  return candidates;
}

/**
 * Builds fallback chapter spreads if the EPUB source is unreachable or offline,
 * so the Flip Book is guaranteed to display in the Reading Room.
 */
function buildFallbackChaptersFromMeta({
  productId,
  productTitle,
  productDescription,
  chaptersText
}: {
  productId: string;
  productTitle?: any;
  productDescription?: any;
  chaptersText?: string;
}): BookChapter[] {
  const chapters: BookChapter[] = [];

  const titleEN = typeof productTitle === "object" ? productTitle?.en : String(productTitle || productId);
  const titleZH = typeof productTitle === "object" ? productTitle?.zh : String(productTitle || productId);

  const descEN = typeof productDescription === "object" ? productDescription?.en : String(productDescription || "");
  const descZH = typeof productDescription === "object" ? productDescription?.zh : String(productDescription || "");

  // If chapter titles were input as text
  if (chaptersText && typeof chaptersText === "string" && chaptersText.trim().length > 0) {
    const rawLines = chaptersText.split("\n").map(l => l.trim()).filter(Boolean);
    let index = 1;
    for (const line of rawLines) {
      const match = line.match(/^(?:\[?\d{1,2}:\d{2}\]?\s*)?(.*)$/);
      const name = match ? match[1] : line;
      if (!name) continue;

      chapters.push({
        chapterLabel: {
          en: `Chapter ${index}`,
          zh: `第 ${index} 章`
        },
        title: {
          en: name,
          zh: name
        },
        leftContentMarkdown: {
          en: `### ${name}\n\n*${titleEN}*\n\n${descEN || "Welcome to this chapter of the interactive volume. Focus on deep reflection and cognitive clarity as you navigate through the framework."}`,
          zh: `### ${name}\n\n*${titleZH}*\n\n${descZH || "欢迎阅读本章节。请在专注沉思中体会思维框架的核心要素。"}`
        },
        rightContentMarkdown: {
          en: `#### Core Takeaways & Key Insights\n\n1. Establish deliberate mental models for high-leverage decisions.\n2. Streamline daily workflows by eliminating cognitive friction.\n3. Re-architect personal operating systems for sustainable performance.`,
          zh: `#### 核心要点与思维提炼\n\n1. 建立高杠杆决策的深度心理模型。\n2. 消除认知摩擦，精简每日工作流。\n3. 重构个人操作系统，实现可持续的高效产出。`
        }
      });
      index++;
    }
  }

  // If no chapters were extracted or provided, create default chapter spreads
  if (chapters.length === 0) {
    chapters.push(
      {
        chapterLabel: { en: "Chapter 1", zh: "第 1 章" },
        title: { en: `Introduction: ${titleEN}`, zh: `导言: ${titleZH}` },
        leftContentMarkdown: {
          en: `### Executive Overview\n\nWelcome to **${titleEN}**. This volume provides an actionable intelligence framework designed for modern thinkers and builders.\n\n${descEN}`,
          zh: `### 导论与概述\n\n欢迎阅读 **${titleZH}**。本卷书为现代思考者与创作者提供可落地的智能化思维框架。\n\n${descZH}`
        },
        rightContentMarkdown: {
          en: `### Foundational Pillars\n\n- **Precision Focus:** Eliminate unnecessary noise and optimize cognitive focus.\n- **Systemic Leverage:** Build automated feedback loops that scale with effort.\n- **Sustainable Execution:** Balance intense deep work with intentional recovery.`,
          zh: `### 核心支柱与架构\n\n- **精准专注:** 消除无用干扰，优化深度认知能力。\n- **系统杠杆:** 建立自动化复利反馈闭环。\n- **可持续执行:** 在高强度深度工作与意向性休整之间取得平衡。`
        }
      },
      {
        chapterLabel: { en: "Chapter 2", zh: "第 2 章" },
        title: { en: "Core Frameworks & Strategies", zh: "核心框架与战略实践" },
        leftContentMarkdown: {
          en: `### Decoupling Input from Output\n\nHigh performers understand that time spent does not correlate linearly with value created. Leverage comes from structure, positioning, and systems.`,
          zh: `### 解耦投入与产出\n\n卓越的思考者深刻理解：时间投入并不与价值产出呈简单线性关系。真正的杠杆源自架构、定位与系统设计。`
        },
        rightContentMarkdown: {
          en: `### Strategic Implementation\n\n1. Define your primary cognitive constraint.\n2. Construct daily operational rituals.\n3. Track weekly high-leverage outcomes.`,
          zh: `### 战略实施路径\n\n1. 明确你的核心认知约束条件。\n2. 打造可重复的日常执行仪式感。\n3. 按周追踪高杠杆核心产出成果。`
        }
      }
    );
  }

  return chapters;
}

export default async function convertEpubHandler(req: Request, res: Response) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { epubUrl, productId, productTitle, productDescription, chaptersText } = req.body || {};

    if (!productId) {
      return res.status(400).json({ success: false, error: "Missing productId parameter" });
    }
    if (!epubUrl) {
      return res.status(400).json({ success: false, error: "Missing epubUrl parameter" });
    }

    const candidates = getCandidateUrls(epubUrl);
    let response: globalThis.Response | null = null;
    let lastFetchError = "";

    // Try each candidate URL sequentially until fetch succeeds
    for (const candidate of candidates) {
      try {
        const resCandidate = await fetch(candidate, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ImmersationEpubConverter/1.0",
            "Accept": "*/*"
          }
        });
        if (resCandidate.ok) {
          response = resCandidate;
          break;
        } else {
          lastFetchError = `[${candidate}] HTTP Status: ${resCandidate.status} ${resCandidate.statusText}`;
        }
      } catch (fetchErr: any) {
        lastFetchError = `[${candidate}] Error: ${fetchErr.message || String(fetchErr)}`;
      }
    }

    let bookChapters: BookChapter[] = [];

    // If HTTP fetch failed across all candidate URLs, attempt fallback generation or return descriptive error
    if (!response || !response.ok) {
      console.warn(`EPUB Fetch Warning: All candidate URLs failed for product ${productId}. Last error: ${lastFetchError}`);
      
      // Attempt fallback generation if metadata is available
      if (productTitle || productDescription || chaptersText) {
        bookChapters = buildFallbackChaptersFromMeta({
          productId,
          productTitle,
          productDescription,
          chaptersText
        });

        // Save fallback chapters to Supabase
        await saveChaptersToSupabase(productId, bookChapters, epubUrl);

        return res.json({
          success: true,
          chapters: bookChapters,
          isFallback: true,
          message: `EPUB file unreachable (${lastFetchError}). Created flipbook chapters from product metadata.`
        });
      }

      return res.status(400).json({
        success: false,
        error: `Failed to fetch EPUB file across ${candidates.length} candidate URLs. Last error: ${lastFetchError}`
      });
    }

    // 2. Load ZIP using AdmZip
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let zip: any;
    try {
      zip = new AdmZip(buffer);
    } catch (zipErr: any) {
      return res.status(400).json({
        success: false,
        error: "Malformed EPUB file: Failed to unzip the file archive."
      });
    }

    // 3. DRM check
    if (zip.getEntry("META-INF/encryption.xml")) {
      return res.status(400).json({
        success: false,
        error: "DRM-protected EPUB file detected. Parsing of encrypted/locked files is not supported."
      });
    }

    // 4. Find container.xml and content.opf
    const containerEntry = zip.getEntry("META-INF/container.xml");
    if (!containerEntry) {
      return res.status(400).json({
        success: false,
        error: "Malformed EPUB file: Missing META-INF/container.xml"
      });
    }

    const containerXml = containerEntry.getData().toString("utf-8");
    const rootfileMatch = containerXml.match(/<rootfile\s+[^>]*full-path=["']([^"']+)["']/i);
    if (!rootfileMatch) {
      return res.status(400).json({
        success: false,
        error: "Malformed EPUB file: container.xml has no valid rootfile path"
      });
    }

    const opfPath = rootfileMatch[1];
    const opfEntry = zip.getEntry(opfPath);
    if (!opfEntry) {
      return res.status(400).json({
        success: false,
        error: `Malformed EPUB file: OPF file not found in ZIP at path: ${opfPath}`
      });
    }

    const opfXml = opfEntry.getData().toString("utf-8");
    const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

    // 5. Parse manifest items
    const itemTags = opfXml.match(/<item\s+[^>]+>/gi) || [];
    const manifestItems: Record<string, string> = {};
    for (const tag of itemTags) {
      const idMatch = tag.match(/id=["']([^"']+)["']/i);
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (idMatch && hrefMatch) {
        manifestItems[idMatch[1]] = decodeURIComponent(hrefMatch[1]);
      }
    }

    // 6. Parse spine sequence order
    const itemrefTags = opfXml.match(/<itemref\s+[^>]+>/gi) || [];
    const spineIds: string[] = [];
    for (const tag of itemrefTags) {
      const idrefMatch = tag.match(/idref=["']([^"']+)["']/i);
      if (idrefMatch) {
        spineIds.push(idrefMatch[1]);
      }
    }

    if (spineIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Malformed EPUB file: Spine list has 0 elements"
      });
    }

    // 7. Setup Turndown for clean Markdown conversion
    const turndownService = new TurndownService({
      headingStyle: "atx",
      hr: "---"
    });

    // Strip images, styles, scripts, links, and frame containers aggressively
    turndownService.addRule("ignore-tags", {
      filter: (node) => {
        const tagName = node.nodeName.toLowerCase();
        return ["img", "style", "script", "link", "head", "iframe", "svg", "audio", "video", "button", "input", "form"].includes(tagName);
      },
      replacement: () => ""
    });

    let chapterIndex = 0;

    // 8. Extract chapter content in spine order
    for (const idref of spineIds) {
      const href = manifestItems[idref];
      if (!href) continue;

      const relativePath = opfDir + href;
      const cleanPath = relativePath.split("#")[0];

      const entry = zip.getEntry(cleanPath);
      if (!entry) {
        continue;
      }

      const htmlContent = entry.getData().toString("utf-8");

      // Extract raw title from title tag or first header
      let chapterTitle = "";
      const titleMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        chapterTitle = titleMatch[1].trim();
      }
      chapterTitle = chapterTitle.replace(/<[^>]+>/g, "").trim();

      if (!chapterTitle || /^(chapter|ch\d+|index|page|untitled|section|playbook)$/i.test(chapterTitle)) {
        const hMatch = htmlContent.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
        if (hMatch) {
          chapterTitle = hMatch[1].replace(/<[^>]+>/g, "").trim();
        }
      }

      if (!chapterTitle) {
        chapterTitle = `Chapter ${chapterIndex + 1}`;
      }

      // Extract body tag contents
      let bodyHtml = htmlContent;
      const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        bodyHtml = bodyMatch[1];
      }

      // Convert body HTML to markdown
      let markdown = turndownService.turndown(bodyHtml).trim();

      // Skip empty wrapper chapters or cover placeholders
      if (markdown.length < 20) {
        continue;
      }

      // Normalize newlines
      markdown = markdown.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

      // Split the text into paragraphs to distribute over two pages (left and right)
      const paragraphs = markdown.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      let leftContent = "";
      let rightContent = "";

      if (paragraphs.length <= 1) {
        leftContent = markdown;
        rightContent = "";
      } else {
        const totalLength = markdown.length;
        let currentLength = 0;
        const leftParagraphs: string[] = [];
        const rightParagraphs: string[] = [];

        for (const para of paragraphs) {
          if (currentLength < totalLength / 2) {
            leftParagraphs.push(para);
            currentLength += para.length + 2;
          } else {
            rightParagraphs.push(para);
          }
        }

        // Guarantee balance of at least one paragraph per page
        if (leftParagraphs.length > 0 && rightParagraphs.length === 0) {
          rightParagraphs.push(leftParagraphs.pop()!);
        }
        if (rightParagraphs.length > 0 && leftParagraphs.length === 0) {
          leftParagraphs.push(rightParagraphs.shift()!);
        }

        leftContent = leftParagraphs.join("\n\n");
        rightContent = rightParagraphs.join("\n\n");
      }

      bookChapters.push({
        chapterLabel: {
          en: `Chapter ${chapterIndex + 1}`,
          zh: `第 ${chapterIndex + 1} 章`
        },
        title: {
          en: chapterTitle,
          zh: chapterTitle
        },
        leftContentMarkdown: {
          en: leftContent,
          zh: leftContent
        },
        rightContentMarkdown: {
          en: rightContent,
          zh: rightContent
        }
      });

      chapterIndex++;
    }

    if (bookChapters.length === 0) {
      if (productTitle || productDescription || chaptersText) {
        bookChapters = buildFallbackChaptersFromMeta({
          productId,
          productTitle,
          productDescription,
          chaptersText
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Malformed EPUB file: No readable chapter files extracted."
        });
      }
    }

    // 9. Save to Supabase book_chapters table
    await saveChaptersToSupabase(productId, bookChapters, epubUrl);

    return res.json({
      success: true,
      chapters: bookChapters
    });

  } catch (error: any) {
    console.error("EPUB Conversion Exception:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during EPUB parsing."
    });
  }
}

async function saveChaptersToSupabase(productId: string, chapters: BookChapter[], sourceEpubUrl: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  const serverSupabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

  if (serverSupabase) {
    try {
      await serverSupabase.from("book_chapters").delete().eq("product_id", productId);
      await serverSupabase.from("book_chapters").insert({
        product_id: productId,
        chapters,
        converted_at: new Date().toISOString(),
        source_epub_url: sourceEpubUrl
      });
    } catch (err) {
      console.warn("Supabase saveChaptersToSupabase non-fatal error:", err);
    }
  }
}

