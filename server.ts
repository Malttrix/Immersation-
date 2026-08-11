import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const DEFAULT_SENDFOX_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MzciLCJqdGkiOiIxNmQ5ZjI5OTdkMGJlNjcyNTgwZjdjMmMxMTYyYzA4NDVlMzEzZmQyNzIxZTdiZmQyYjAxN2E3YjRjNWU2YmIwNGY2ZDA3ZDY1MjFjMGZhMiIsImlhdCI6MTc4NjA3Njg2Ny4wNjMxNzksIm5iZiI6MTc4NjA3Njg2Ny4wNjMxOCwiZXhwIjo0OTQxNzUwNDY3LjA0NzYsInN1YiI6IjIwMjg3MiIsInNjb3BlcyI6W119.C3UEfhebjll-R1200AdFElO_iAEUnNOXn_VQUr-4mOM2EYmSK4xCi3fF8u-3oSewqujdVACvRd-_hdatVfC6NlUiqXgNtybvo7EQJKqtAdtvwD9irLYcQOZz9aIdVIL2dCiG2SVOpcP-T97HeuHT6UhCB0DIUxM97MnxHdcULC1j4j6nhmi02Aj2ysJLXJasnqNmzjRpjBTYVE56tIp_wwKKITS8_936_XzxrJtd4NDS22-q0A7wDp5N1PvvsXxCvw4wvr2gr8bgIb9DL09wIX2-NBjfy2Eas6jbFAjlfmesCRPfyBwJuJq2GlfDnowALllQSWv_uA_rZx45E4ci92BUKUUu1_Yh239q2Q_zlvi4I1d5ZiQHiAKMD328dVt5WC9ICYMdxgX70_FHvoJx09eKemXrzsrwhfGOeYywZvc2vuMizF5w8yepEUWApV49S1YRYCxYbCdcpwymN92TC5lilCRomq2WvdipW8ICTP9Omjb8nHmIlIvmaE_ORFelI3_UlRD3CTuqkW4Rg0rBRRwS45zovpaNZem54i-lwTPplp06MLRJvObgPZomvutSFv8vi7tkXj6EiNpfSW2dE6YMLOLLiT95e7WW7CNcqwUgfFn9LEuUWHX83bIB-nHc1Z4eU7cgbAw30q61YECwXOpb12dpCmYkbUnUjT_hmvs";

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const serverSupabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Parse JSON bodies safely
app.use((req: any, res: any, next: any) => {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      return next();
    }
    if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
        return next();
      } catch (e) {
        // String was not JSON
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString("utf-8"));
        return next();
      } catch (e) {
        // Buffer was not JSON
      }
    }
  }
  
  express.json({ limit: "50mb" })(req, res, (err: any) => {
    if (err) {
      console.warn("Express body parse warning:", err);
      req.body = {};
    }
    next();
  });
});

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is missing. Please set it in Settings.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    stripe_configured: !!process.env.STRIPE_SECRET_KEY 
  });
});

// SEO Crawling Endpoints (Robots.txt & Sitemap.xml)
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(process.cwd(), "public", "robots.txt");
  if (fs.existsSync(robotsPath)) {
    res.setHeader("Content-Type", "text/plain");
    return res.sendFile(robotsPath);
  }
  res.setHeader("Content-Type", "text/plain");
  res.send("User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: https://immersation.com/sitemap.xml\n");
});

app.get("/sitemap.xml", (req, res) => {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    res.setHeader("Content-Type", "application/xml");
    return res.sendFile(sitemapPath);
  }
  res.setHeader("Content-Type", "application/xml");
  res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"><url><loc>https://immersation.com/</loc></url></urlset>");
});

// Convert EPUB to Flip Book chapters
app.post("/api/convert-epub", async (req, res) => {
  try {
    const convertModule = await import("./src/lib/convertEpub.js");
    const handler: any = convertModule.default || convertModule;
    return handler(req, res);
  } catch (err: any) {
    console.error("EPUB Module Load Error:", err);
    return res.status(500).json({ success: false, error: "EPUB converter service unavailable: " + (err?.message || String(err)) });
  }
});

// Create Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items, lang } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Determine dynamic application base URL from client origin, headers, or env
    let APP_URL = process.env.APP_URL;
    if (!APP_URL) {
      if (req.body && req.body.originUrl && typeof req.body.originUrl === "string") {
        try {
          APP_URL = new URL(req.body.originUrl).origin;
        } catch (e) {
          // ignore invalid URL
        }
      }
      if (!APP_URL) {
        const originHeader = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer as string).origin : null);
        const hostHeader = (req.headers["x-forwarded-host"] as string) || req.headers.host;
        const protoHeader = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
        APP_URL = originHeader || (hostHeader ? `${protoHeader}://${hostHeader}` : "http://localhost:3000");
      }
    }
    const bookIds = items.map((item: any) => item.id);

    // If Stripe secret key is not configured, fall back to sandbox checkout redirection
    if (!process.env.STRIPE_SECRET_KEY) {
      const bookIdsBase64 = Buffer.from(JSON.stringify(bookIds)).toString("base64");
      const sandboxSessionId = `SANDBOX_${bookIdsBase64}`;
      return res.json({ 
        url: `${APP_URL}/?checkout_success=true&session_id=${sandboxSessionId}`,
        simulated: true
      });
    }

    const stripe = getStripe();

    const lineItems = items.map((item: any) => {
      const title = item.title[lang] || item.title["en"] || "Digital Volume";
      const tagline = item.tagline ? (item.tagline[lang] || item.tagline["en"]) : "Knowledge volume";
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Immersation: ${title}`,
            description: tagline,
          },
          unit_amount: Math.round((item.price || 19.00) * 100),
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${APP_URL}/?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?checkout_canceled=true`,
      metadata: {
        books: JSON.stringify(bookIds),
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Stripe Session
app.get("/api/verify-session", async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "Missing session_id parameter" });
    }

    // Handle Sandbox session verification immediately
    if (session_id.startsWith("SANDBOX_")) {
      let books: string[] = [];
      try {
        const parts = session_id.split("_");
        if (parts[1]) {
          books = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        }
      } catch (e) {
        console.error("Error decoding sandbox books:", e);
      }
      return res.json({ paid: true, books });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ error: "STRIPE_SECRET_KEY is missing" });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const books = session.metadata?.books ? JSON.parse(session.metadata.books) : [];
      res.json({ paid: true, books });
    } else {
      res.json({ paid: false, status: session.payment_status });
    }
  } catch (error: any) {
    console.error("Stripe Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});


// Subscribe to Sendfox Newsletter
app.post(["/api/subscribe-sendfox", "/subscribe-sendfox", "/api/subscribe-sendfox/"], async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const body = req.body || {};
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const tags = Array.isArray(body.tags) ? body.tags : (Array.isArray(body.lists) ? body.lists : []);

    if (!email || !email.includes("@")) {
      return res.status(200).json({ success: false, error: "A valid email address is required." });
    }

    // 1. Try persisting subscription into Supabase database if configured
    let dbSaved = false;
    if (serverSupabase) {
      try {
        const { error: dbErr } = await serverSupabase.from("newsletter_subscriptions").insert([{
          email,
          tags,
          subscribed_at: new Date().toISOString()
        }]);
        if (!dbErr) dbSaved = true;
      } catch (dbErr) {
        console.warn("Supabase subscription save warning:", dbErr);
      }
    }

    // 2. Dispatch to Sendfox API if API Key is available
    const token = (
      process.env.SENDFOX_API_KEY ||
      process.env.VITE_SENDFOX_API_KEY ||
      process.env.SENDFOX_TOKEN ||
      process.env.SENDFOX_KEY ||
      process.env.SENDFOX_API_TOKEN ||
      DEFAULT_SENDFOX_KEY
    )?.trim();

    if (!token) {
      console.warn("SENDFOX_API_KEY is missing in environment variables.");
      if (dbSaved) {
        return res.json({
          success: true,
          message: "Subscribed successfully! (Saved to database; SENDFOX_API_KEY is pending configuration)"
        });
      }
      return res.status(200).json({
        success: false,
        error: "SENDFOX_API_KEY is not configured in server environment variables. Please add SENDFOX_API_KEY in application secrets."
      });
    }

    // Dynamic resolution of SendFox Lists from the user's account
    let userListIds: number[] = [];

    if (Array.isArray(body.lists)) {
      body.lists.forEach((l: any) => {
        const num = Number(l);
        if (!isNaN(num) && num > 0) userListIds.push(num);
      });
    }

    try {
      const listsRes = await fetch("https://api.sendfox.com/lists", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (listsRes.ok) {
        const listsData = await listsRes.json().catch(() => null);
        const accountLists = Array.isArray(listsData?.data) ? listsData.data : (Array.isArray(listsData) ? listsData : []);
        const validLists = accountLists.filter((l: any) => l && l.id !== undefined && l.id !== null);
        
        console.log(`[SendFox] Retrieved ${validLists.length} lists from account:`, validLists.map((l: any) => `${l.name || 'List'} (${l.id})`).join(", "));

        if (validLists.length > 0) {
          tags.forEach((t: any) => {
            const tagName = String(t).toLowerCase().trim();
            const matched = validLists.find((l: any) => {
              const nameStr = String(l.name || "").toLowerCase();
              return nameStr.includes(tagName) || tagName.includes(nameStr);
            });
            if (matched && matched.id) {
              userListIds.push(Number(matched.id));
            }
          });

          // If no tag matched a specific list, default to adding contact to available lists in user's SendFox account
          if (userListIds.length === 0) {
            userListIds = validLists.map((l: any) => Number(l.id)).filter((id: number) => !isNaN(id) && id > 0);
          }
        }
      } else {
        console.warn("[SendFox] Unable to fetch user lists, status:", listsRes.status);
      }
    } catch (lErr) {
      console.warn("[SendFox] List fetch exception:", lErr);
    }

    const uniqueLists = Array.from(new Set(userListIds));

    // Construct contact payload
    const payload: Record<string, any> = { email };

    if (body.first_name) {
      payload.first_name = String(body.first_name).trim();
    } else {
      const emailPrefix = email.split("@")[0] || "";
      if (emailPrefix) {
        payload.first_name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
    }

    if (uniqueLists.length > 0) {
      payload.lists = uniqueLists;
    }

    console.log("[SendFox] Submitting contact payload:", JSON.stringify(payload));

    let response = await fetch("https://api.sendfox.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    // Fallback: If list IDs caused an error, retry without lists
    if (!response.ok && payload.lists) {
      console.warn("[SendFox] API call with list IDs failed. Retrying contact creation without lists...");
      const basicPayload = { ...payload };
      delete basicPayload.lists;
      response = await fetch("https://api.sendfox.com/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(basicPayload)
      });
    }

    const errorText = await response.text();
    let respData: any = null;
    try {
      respData = JSON.parse(errorText);
    } catch (e) {
      respData = null;
    }

    if (response.ok) {
      console.log("[SendFox] Contact created successfully:", respData || email);
      return res.json({ success: true, contact: respData || { email } });
    }

    console.error("[SendFox] Error response status:", response.status, "body:", errorText);
    let errorMsg = "Failed to create contact in SendFox.";
    if (respData) {
      if (respData.message) errorMsg = respData.message;
      else if (respData.error) errorMsg = respData.error;
      else if (Array.isArray(respData.email) && respData.email[0]) errorMsg = `Email ${respData.email[0]}`;
      else if (respData.errors) {
        errorMsg = typeof respData.errors === "string" ? respData.errors : JSON.stringify(respData.errors);
      }
    } else if (errorText) {
      errorMsg = errorText.slice(0, 150);
    }

    if (errorMsg.toLowerCase().includes("already") || errorMsg.toLowerCase().includes("taken") || errorMsg.toLowerCase().includes("exists")) {
      return res.json({ success: true, message: "This email is already registered in SendFox!" });
    }

    return res.status(200).json({ success: false, error: errorMsg });
  } catch (error: any) {
    console.error("Sendfox Subscription Error:", error);
    return res.status(200).json({ success: false, error: error?.message || "An error occurred during subscription." });
  }
});

// Helper: Convert Markdown to styled HTML for email broadcasting
function markdownToEmailHtml(markdownStr: string, ctaText?: string, targetUrl?: string): string {
  if (!markdownStr) return "";
  let html = markdownStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*$)/gim, '<h3 style="font-family: Georgia, serif; color: #1A2F24; margin-top: 20px; margin-bottom: 8px; font-size: 18px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-family: Georgia, serif; color: #1A2F24; margin-top: 24px; margin-bottom: 12px; font-size: 22px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-family: Georgia, serif; color: #1A2F24; margin-top: 28px; margin-bottom: 16px; font-size: 26px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #8B5A44; text-decoration: underline;">$1</a>')
    .split(/\n\n+/)
    .map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3')) return trimmed;
      return `<p style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #2D3748; margin-bottom: 16px;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join("\n");

  if (ctaText) {
    let finalUrl = targetUrl || "https://immersation.com/newsletter";
    if (
      !finalUrl ||
      finalUrl.includes("aistudio.google.com") ||
      finalUrl.includes("ais-dev-") ||
      finalUrl.includes("ais-pre-") ||
      finalUrl.includes("localhost") ||
      finalUrl.includes("127.0.0.1") ||
      finalUrl.includes("run.app")
    ) {
      try {
        const parsed = new URL(finalUrl);
        finalUrl = `https://immersation.com${parsed.pathname}${parsed.search}`;
      } catch (e) {
        finalUrl = "https://immersation.com/newsletter";
      }
    }
    html += `
    <div style="margin-top: 32px; margin-bottom: 24px; text-align: center;">
      <a href="${finalUrl}" style="background-color: #1A2F24; color: #F4F1EB; padding: 12px 24px; text-decoration: none; font-family: sans-serif; font-size: 14px; font-weight: bold; border-radius: 2px; display: inline-block;">
        ${ctaText}
      </a>
    </div>`;
  }

  return `
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F1EB; font-family: sans-serif;">
    <div style="background-color: #ffffff; padding: 32px; border-radius: 4px; border: 1px solid #D8D2C6;">
      ${html}
      <hr style="border: none; border-top: 1px solid #E8DDCF; margin: 32px 0 16px 0;" />
      <p style="font-size: 11px; color: #A0AEC0; text-align: center;">
        Sent via Immersation Content Studio. You are receiving this email because you subscribed to Immersation Updates.<br/><br/>
        <a href="{{unsubscribe_url}}" style="color: #718096; text-decoration: underline;">Unsubscribe from these emails</a>
      </p>
    </div>
  </div>`;
}

// Broadcast Campaign to SendFox subscribers
app.post(["/api/broadcast-sendfox", "/broadcast-sendfox", "/api/broadcast-sendfox/"], async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const body = req.body || {};
    const subject = body.subject || body.emailSubject;
    const previewText = body.previewText || "";
    const content = body.content || body.bodyEN || body.bodyZH || "";
    const tags = Array.isArray(body.sendFoxTags) ? body.sendFoxTags : (Array.isArray(body.tags) ? body.tags : []);
    const ctaText = body.ctaText || "READ THE FULL SIGNAL";
    const targetUrl = body.targetUrl || body.ctaUrl || body.newsletterUrl || body.url || "";

    if (!subject) {
      return res.status(200).json({ success: false, error: "Email subject line is required for broadcasting." });
    }

    const token = (
      body.apiKey ||
      process.env.SENDFOX_API_KEY ||
      process.env.VITE_SENDFOX_API_KEY ||
      process.env.SENDFOX_TOKEN ||
      process.env.SENDFOX_KEY ||
      process.env.SENDFOX_API_TOKEN ||
      DEFAULT_SENDFOX_KEY
    )?.trim();

    if (!token) {
      console.warn("SENDFOX_API_KEY is missing in environment variables and request payload.");
      return res.status(200).json({
        success: false,
        error: "SENDFOX_API_KEY is missing. Please enter your SendFox Personal Access Token in the newsletter settings or configure SENDFOX_API_KEY in environment variables."
      });
    }

    // Resolve list IDs from SendFox
    let targetListIds: number[] = [];
    try {
      const listsRes = await fetch("https://api.sendfox.com/lists", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (listsRes.ok) {
        const listsData = await listsRes.json().catch(() => null);
        const accountLists = Array.isArray(listsData?.data) ? listsData.data : (Array.isArray(listsData) ? listsData : []);
        const validLists = accountLists.filter((l: any) => l && l.id !== undefined && l.id !== null);

        if (validLists.length > 0) {
          tags.forEach((t: any) => {
            const tagName = String(t).toLowerCase().trim();
            const matched = validLists.find((l: any) => {
              const nameStr = String(l.name || "").toLowerCase();
              return nameStr.includes(tagName) || tagName.includes(nameStr);
            });
            if (matched && matched.id) {
              targetListIds.push(Number(matched.id));
            }
          });

          // Fallback: if no tag matched specifically, include all account lists
          if (targetListIds.length === 0) {
            targetListIds = validLists.map((l: any) => Number(l.id));
          }
        }
      }
    } catch (lErr) {
      console.warn("Failed fetching SendFox lists for broadcast:", lErr);
    }

    const uniqueListIds = Array.from(new Set(targetListIds));
    const emailHtml = markdownToEmailHtml(content, ctaText, targetUrl);

    const campaignPayload: Record<string, any> = {
      title: subject,
      subject: subject,
      body: emailHtml,
      html: emailHtml,
      html_body: emailHtml
    };

    if (body.from_name || body.fromName) {
      campaignPayload.from_name = body.from_name || body.fromName;
    }
    if (body.from_email || body.fromEmail) {
      campaignPayload.from_email = body.from_email || body.fromEmail;
    }

    if (previewText) {
      campaignPayload.preview_text = previewText;
    }

    if (uniqueListIds.length > 0) {
      campaignPayload.lists = uniqueListIds;
    }

    // Try fetching account user info from SendFox to satisfy from_name and from_email if missing
    if (!campaignPayload.from_name || !campaignPayload.from_email) {
      try {
        const meRes = await fetch("https://api.sendfox.com/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json().catch(() => null);
          if (meData) {
            if (!campaignPayload.from_name) {
              campaignPayload.from_name = meData.from_name || meData.name || meData.first_name || "Immersation Studio";
            }
            if (!campaignPayload.from_email) {
              campaignPayload.from_email = meData.from_email || meData.email;
            }
          }
        }
      } catch (meErr) {
        console.warn("Could not fetch SendFox /me user details:", meErr);
      }
    }

    // Default fallbacks if still missing
    if (!campaignPayload.from_name) campaignPayload.from_name = "Immersation Studio";

    console.log("[SendFox Broadcast] Creating campaign draft:", {
      title: campaignPayload.title,
      subject: campaignPayload.subject,
      from_name: campaignPayload.from_name,
      from_email: campaignPayload.from_email,
      lists: uniqueListIds,
      htmlLength: emailHtml.length
    });

    // Step 1: Create Campaign Draft in SendFox
    const createRes = await fetch("https://api.sendfox.com/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(campaignPayload)
    });

    const createText = await createRes.text();
    let campaignData: any = null;
    try { campaignData = JSON.parse(createText); } catch (e) { campaignData = null; }

    if (!createRes.ok || !campaignData?.id) {
      console.error("[SendFox Broadcast] API Creation Error:", createRes.status, createText);
      let errorMsg = "SendFox API returned an error when creating campaign draft.";
      if (campaignData?.message) errorMsg = campaignData.message;
      else if (campaignData?.error) errorMsg = campaignData.error;
      else if (createText) errorMsg = createText.slice(0, 200);

      return res.status(200).json({ success: false, error: errorMsg });
    }

    const campaignId = campaignData.id;
    console.log(`[SendFox Broadcast] Draft campaign #${campaignId} created. Triggering immediate delivery...`);

    // Step 2: Trigger immediate delivery of the created draft campaign
    const sendRes = await fetch(`https://api.sendfox.com/campaigns/${campaignId}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    const sendText = await sendRes.text();
    let sendData: any = null;
    try { sendData = JSON.parse(sendText); } catch (e) { sendData = null; }

    if (sendRes.ok) {
      console.log(`[SendFox Broadcast] Campaign #${campaignId} queued and sent successfully!`, sendData);
      return res.json({
        success: true,
        campaign: sendData || campaignData,
        message: `Campaign "${subject}" dispatched and queued for immediate delivery to subscribers via SendFox API!`
      });
    }

    console.warn(`[SendFox Broadcast] Immediate send endpoint response status ${sendRes.status}:`, sendText);
    return res.json({
      success: true,
      campaign: campaignData,
      message: `Campaign "${subject}" created in SendFox (ID ${campaignId}). ${sendData?.message || "Queued in SendFox campaigns."}`
    });

  } catch (error: any) {
    console.error("SendFox Broadcast Error:", error);
    return res.status(200).json({ success: false, error: error?.message || "Failed to broadcast newsletter campaign." });
  }
});

// Get synced articles
app.get("/api/articles", (req, res) => {
  try {
    const syncPath = path.join(process.cwd(), "articles_sync.json");
    if (fs.existsSync(syncPath)) {
      const data = fs.readFileSync(syncPath, "utf-8");
      const articles = JSON.parse(data);
      return res.json({ success: true, articles });
    }
    return res.json({ success: true, articles: null });
  } catch (error: any) {
    console.error("Error reading synced articles:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Sync articles back to source code and JSON file
app.post("/api/sync-articles", async (req, res) => {
  try {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: "Invalid articles payload" });
    }

    // 1. Always write to JSON sync file for instant runtime reload across refreshes
    const syncPath = path.join(process.cwd(), "articles_sync.json");
    fs.writeFileSync(syncPath, JSON.stringify(articles, null, 2));

    // 2. Always write to src/articlesData.ts so that changes persist in the codebase
    const filePath = path.join(process.cwd(), "src", "articlesData.ts");
    const fileContent = `export interface Article {
  id?: string;
  slug?: string;
  pillar?: string;
  categoryValue?: string;
  contentFormat?: string;
  articleFormat?: string;
  created_at?: string;
  updatedAt?: string;
  description?: { en: string; zh: string };
  title: { en: string; zh: string };
  excerpt: { en: string; zh: string };
  category: { en: string; zh: string };
  content: { en: string; zh: string };
  date: { en: string; zh: string };
  readTime: { en: string; zh: string };
  tags: string[];
  cover?: string;
  pinterestImageUrl?: string;
  adUrl?: string;
  status?: string;
  scheduledDate?: string;
  featured?: boolean;
  relatedArticles?: string[];
  seo?: {
    titleEN: string;
    titleZH: string;
    descEN: string;
    descZH: string;
  };
  author?: string;
  canonicalLink?: string;
  published?: boolean;
}

export const defaultArticles: Article[] = ${JSON.stringify(articles, null, 2)};
`;
    fs.writeFileSync(filePath, fileContent);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Sync Articles Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware and static serving

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      return res.status(200).send(`<!DOCTYPE html><html><head><title>Immersation</title></head><body><div id="root"></div></body></html>`);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
