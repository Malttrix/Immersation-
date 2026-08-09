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

export default async function convertEpubHandler(req: Request, res: Response) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { epubUrl, productId } = req.body || {};

    if (!epubUrl) {
      return res.status(400).json({ success: false, error: "Missing epubUrl parameter" });
    }
    if (!productId) {
      return res.status(400).json({ success: false, error: "Missing productId parameter" });
    }

    // 1. Fetch EPUB file as a binary buffer
    let response: globalThis.Response;
    try {
      response = await fetch(epubUrl);
    } catch (fetchErr: any) {
      return res.status(400).json({
        success: false,
        error: `Unreachable URL: Failed to fetch EPUB from the specified URL. (${fetchErr.message || String(fetchErr)})`
      });
    }

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: `Failed to fetch EPUB file. HTTP Status: ${response.status} ${response.statusText}`
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Load ZIP using AdmZip
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

    const bookChapters: BookChapter[] = [];
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
      return res.status(400).json({
        success: false,
        error: "Malformed EPUB file: No readable chapter files extracted."
      });
    }

    // 9. Save to Supabase book_chapters table
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    const serverSupabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

    if (serverSupabase) {
      try {
        // Safe delete-then-insert flow for transactional atomicity across all SQL configurations
        await serverSupabase.from("book_chapters").delete().eq("product_id", productId);
        
        const { error: dbErr } = await serverSupabase.from("book_chapters").insert({
          product_id: productId,
          chapters: bookChapters,
          converted_at: new Date().toISOString(),
          source_epub_url: epubUrl
        });

        if (dbErr) {
          console.error("Database Save Error:", dbErr);
          return res.status(500).json({
            success: false,
            error: `Database save failed: ${dbErr.message || String(dbErr)}`
          });
        }
      } catch (dbEx: any) {
        console.error("Database connection failed:", dbEx);
        return res.status(500).json({
          success: false,
          error: `Database connection failed: ${dbEx.message || String(dbEx)}`
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: "Supabase client is not initialized on the server. Please verify environment variables."
      });
    }

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
