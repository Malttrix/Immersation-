import { supabase } from "./supabase";

export async function subscribeToSendfox(
  email: string,
  options?: { pillar?: string; tags?: string[]; lists?: number[] }
): Promise<boolean> {
  const cleanEmail = (email || "").trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    alert("Please enter a valid email address.");
    return false;
  }

  // 1. Direct client-side persist to Supabase if configured
  if (supabase) {
    try {
      await supabase.from("newsletter_subscriptions").insert([{
        email: cleanEmail,
        tags: options?.tags || [],
        subscribed_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn("Client-side Supabase newsletter insert warning:", e);
    }
  }

  // 2. Dispatch to server endpoint for Sendfox / Server-side processing
  try {
    const response = await fetch("/api/subscribe-sendfox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, ...options }),
    });

    const resText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(resText);
    } catch (e) {
      console.warn("Non-JSON server response:", resText);
    }

    if (data?.success) {
      if (data?.message) {
        console.log("SendFox Notice:", data.message);
      }
      return true;
    }

    let errorMsg = data?.error || data?.message;
    if (!errorMsg) {
      if (resText && (resText.includes("FUNCTION_INVOCATION_FAILED") || resText.includes("A server error has occurred"))) {
        errorMsg = "The subscription service is temporarily updating. Please try again shortly.";
      } else if (resText && !resText.startsWith("<") && resText.length < 100) {
        errorMsg = resText;
      } else {
        errorMsg = "Unable to connect to subscription service. Please try again.";
      }
    }

    console.error("SendFox API Error:", errorMsg);
    alert("Subscription Notice: " + errorMsg);
    return false;
  } catch (err: any) {
    console.error("Error calling /api/subscribe-sendfox endpoint:", err);
    alert("Subscription Notice: " + (err?.message || "Network request failed. Please check your connection."));
    return false;
  }
}

