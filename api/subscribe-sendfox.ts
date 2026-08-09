import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  // Always set JSON content-type and CORS
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ success: true });
  }

  try {
    // Safely parse body if received as string or Buffer from Vercel
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    } else if (Buffer.isBuffer && Buffer.isBuffer(body)) {
      try {
        body = JSON.parse((body as Buffer).toString("utf-8"));
      } catch (e) {
        body = {};
      }
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const tags = Array.isArray(body.tags) ? body.tags : (Array.isArray(body.lists) ? body.lists : []);

    if (!email || !email.includes("@")) {
      return res.status(200).json({ success: false, error: "A valid email address is required." });
    }

    // 1. Try persisting subscription into Supabase database if configured
    let dbSaved = false;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error: dbErr } = await supabase.from("newsletter_subscriptions").insert([{
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
      process.env.SENDFOX_API_TOKEN
    )?.trim();

    if (!token) {
      console.warn("SENDFOX_API_KEY is missing in environment variables.");
      if (dbSaved) {
        return res.status(200).json({
          success: true,
          message: "Subscribed successfully! (Saved to database)"
        });
      }
      return res.status(200).json({
        success: false,
        error: "SENDFOX_API_KEY is not configured in server environment variables. Please add SENDFOX_API_KEY in application settings."
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

          if (userListIds.length === 0) {
            userListIds = validLists.map((l: any) => Number(l.id)).filter((id: number) => !isNaN(id) && id > 0);
          }
        }
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
      return res.status(200).json({ success: true, contact: respData || { email } });
    }

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
      return res.status(200).json({ success: true, message: "This email is already registered in SendFox!" });
    }

    return res.status(200).json({ success: false, error: errorMsg });
  } catch (error: any) {
    console.error("Sendfox Subscription Error:", error);
    return res.status(200).json({ success: false, error: error?.message || "An error occurred during subscription." });
  }
}
