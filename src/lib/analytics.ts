export interface FunnelAnalytics {
  uniqueViews: number;
  cartAdditions: number;
  checkoutInitiations: number;
}

export function getFunnelAnalytics(): FunnelAnalytics {
  const saved = localStorage.getItem("immersation_funnel_analytics");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (
        typeof parsed.uniqueViews === "number" &&
        typeof parsed.cartAdditions === "number" &&
        typeof parsed.checkoutInitiations === "number"
      ) {
        return parsed;
      }
    } catch (e) {
      console.error("Error reading funnel analytics from storage", e);
    }
  }

  // Reset baseline to 0 for real-time live tracking starting from now
  const baseline: FunnelAnalytics = {
    uniqueViews: 0,
    cartAdditions: 0,
    checkoutInitiations: 0
  };
  localStorage.setItem("immersation_funnel_analytics", JSON.stringify(baseline));
  return baseline;
}

export function clearAllAnalytics(articlesList: any[] = []) {
  const emptyFunnel: FunnelAnalytics = {
    uniqueViews: 0,
    cartAdditions: 0,
    checkoutInitiations: 0
  };
  localStorage.setItem("immersation_funnel_analytics", JSON.stringify(emptyFunnel));

  const emptyArticles: Record<string, { views: number; timeSpent: number; lastActive: string }> = {};
  articlesList.forEach((art) => {
    const slug = art.slug || art.id;
    if (slug) {
      emptyArticles[slug] = {
        views: 0,
        timeSpent: 0,
        lastActive: new Date().toISOString()
      };
    }
  });
  localStorage.setItem("immersation_article_analytics", JSON.stringify(emptyArticles));
}

export function trackPageView() {
  try {
    const data = getFunnelAnalytics();
    data.uniqueViews += 1;
    localStorage.setItem("immersation_funnel_analytics", JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function trackCartAddition() {
  try {
    const data = getFunnelAnalytics();
    data.cartAdditions += 1;
    localStorage.setItem("immersation_funnel_analytics", JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function trackCheckoutInitiation() {
  try {
    const data = getFunnelAnalytics();
    data.checkoutInitiations += 1;
    localStorage.setItem("immersation_funnel_analytics", JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}
