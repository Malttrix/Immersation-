// Founder-identified origin. Authenticated production access still requires separate verification.
export const PRODUCTION_WORDPRESS_ORIGIN = 'https://cms.immersation.com';
export const PRODUCTION_PROJECT_ID = 'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu';
export function validateMiraProduction(env) {
  const errors = [];
  if (env.VERCEL_PROJECT_ID !== PRODUCTION_PROJECT_ID || env.VERCEL_PROJECT_NAME !== 'immersation' || env.VERCEL_ENV !== 'production') errors.push('The production Vercel project and environment are required.');
  if (env.VERCEL_GIT_COMMIT_REF !== 'main') errors.push('Production must build from the approved main branch.');
  if (env.MIRA_PRODUCTION_READY !== 'true') errors.push('Production MIRA is not enabled.');
  if (env.SUPABASE_URL?.replace(/\/$/,'') !== 'https://zoneqvjrbcowlzwiyinq.supabase.co' || env.VITE_SUPABASE_URL?.replace(/\/$/,'') !== 'https://zoneqvjrbcowlzwiyinq.supabase.co') errors.push('Production Supabase identity mismatch.');
  if (env.APP_URL?.replace(/\/$/,'') !== 'https://immersation.com') errors.push('Production APP_URL mismatch.');
  if (!PRODUCTION_WORDPRESS_ORIGIN || env.WORDPRESS_MEDIA_BASE_URL?.replace(/\/$/,'') !== PRODUCTION_WORDPRESS_ORIGIN) errors.push('Production WordPress origin has not been independently confirmed.');
  if (env.WORDPRESS_MEDIA_USERNAME !== 'mira-media-prod') errors.push('The restricted production media account is required.');
  for (const name of ['MIRA_AGENT_TOKEN','SUPABASE_SERVICE_ROLE_KEY','VITE_SUPABASE_ANON_KEY','WORDPRESS_MEDIA_USERNAME','WORDPRESS_MEDIA_APP_PASSWORD']) if (!env[name]) errors.push(`${name} is required.`);
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(env.MIRA_AGENT_TOKEN || '')) errors.push('Production agent token format is invalid.');
  for (const name of ['VITE_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']) {
    const parts = (env[name] || '').split('.');
    if (parts.length === 3) {
      try { if (JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')).ref !== 'zoneqvjrbcowlzwiyinq') errors.push(`${name} project mismatch.`); }
      catch { errors.push(`${name} has invalid JWT metadata.`); }
    }
  }
  if (env.MIRA_STAGING_READY || env.MIRA_STAGING_SUPABASE_REF || env.MIRA_STAGING_VERCEL_PROJECT_ID) errors.push('Staging configuration is not allowed in production.');
  return errors;
}
