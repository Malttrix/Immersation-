/** Keep payment and paid content unavailable in the isolated editorial project. */
export function stagingCommerceBlocked(env: NodeJS.ProcessEnv, path: string): boolean {
  const ref='dibfotxdupgdhbmhmrnl';
  const staging=env.MIRA_STAGING_SUPABASE_REF===ref || env.VERCEL_PROJECT_NAME==='immersation-staging' || [env.SUPABASE_URL,env.VITE_SUPABASE_URL].some(url=>url?.replace(/\/$/,'')===`https://${ref}.supabase.co`);
  return !!staging && (/^\/api\/(stripe\/webhook|checkout-context|create-checkout-session|verify-session|entitlements)(?:\/|$)/i.test(path) || /^\/api\/products\/[^/]+\/(content|download)\/?$/i.test(path) || /^\/api\/(orders|payment-status|claim-purchases)(?:\/|$)/i.test(path));
}
