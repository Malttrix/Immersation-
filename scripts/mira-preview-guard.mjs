import { isWordPressStagingOrigin } from './wordpress-staging-origin.mjs';
import { PRODUCTION_PROJECT_ID, validateMiraProduction } from './mira-production-guard.mjs';
/** Fail closed on Vercel unless this is the explicitly identified staging project. */
const LIVE_PROJECT_ID = 'prj_enkXTJiyVnkh7AeLYxYI1qXiJfQu';
const FEATURE_BRANCH = 'feature/mira-editorial-integration';
export function validateMiraDeployment(env) {
  const issues = [];
  if (!env.VERCEL_ENV && !env.VERCEL) return issues;
  if (env.VERCEL_PROJECT_ID === PRODUCTION_PROJECT_ID) return env.MIRA_PRODUCTION_READY === 'true' ? validateMiraProduction(env) : [];
  if (!['preview','production'].includes(env.VERCEL_ENV)) return ['Unsupported Vercel environment for MIRA staging.'];
  if (env.VERCEL_PROJECT_NAME !== 'immersation-staging') issues.push('Vercel project must be named immersation-staging.');
  const projectId = env.VERCEL_PROJECT_ID || '';
  if (!/^prj_[A-Za-z0-9]+$/.test(projectId) || projectId === LIVE_PROJECT_ID || env.MIRA_STAGING_VERCEL_PROJECT_ID !== projectId) issues.push('Vercel project ID must match the separately configured staging project and cannot be the live project.');
  if (env.VERCEL_GIT_COMMIT_REF !== FEATURE_BRANCH) issues.push('Only the MIRA feature branch may build in this staging configuration.');
  const deploymentHost = (env.VERCEL_PROJECT_PRODUCTION_URL || '').toLowerCase().replace(/\.$/,'');
  if (deploymentHost === 'immersation.com' || deploymentHost.endsWith('.immersation.com')) issues.push('The staging project must not have the live production domain.');
  if (env.MIRA_STAGING_READY !== 'true') issues.push('MIRA_STAGING_READY must be true after staging isolation is verified.');
  const ref = env.MIRA_STAGING_SUPABASE_REF || '';
  if (ref !== 'dibfotxdupgdhbmhmrnl') issues.push('The confirmed staging Supabase project reference is required.');
  const stagingSupabase = `https://${ref}.supabase.co`;
  for (const name of ['VITE_SUPABASE_URL', 'SUPABASE_URL']) {
    if ((env[name] || '').replace(/\/$/,'') !== stagingSupabase) issues.push(`${name} must match the staging project.`);
  }
  for (const name of ['VITE_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','MIRA_AGENT_TOKEN','WORDPRESS_MEDIA_USERNAME','WORDPRESS_MEDIA_APP_PASSWORD']) {
    if (!env[name]) issues.push(`${name} must be configured for staging.`);
  }
  // Legacy Supabase JWTs disclose their project ref in their payload. This is
  // only a mismatch check, not signature verification. Opaque new-style keys
  // cannot be attributed offline and require separate operator verification.
  for (const name of ['VITE_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']) {
    const value = env[name] || '';
    const parts = value.split('.');
    if (parts.length === 3) {
      try {
        const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (claims.ref !== ref) issues.push(`${name} JWT project reference must match staging.`);
      } catch { issues.push(`${name} has an invalid JWT payload.`); }
    }
  }
  if (!isWordPressStagingOrigin(env.WORDPRESS_MEDIA_BASE_URL)) issues.push('The approved WordPress staging origin is required.');
  try {
    const app = new URL(env.APP_URL || '');
    const host = app.hostname.toLowerCase().replace(/\.$/,'');
    if (app.protocol !== 'https:' || host === 'immersation.com' || host.endsWith('.immersation.com') || app.username || app.password || app.pathname !== '/' || app.search || app.hash) throw Error();
  } catch { issues.push('APP_URL must be a separate HTTPS staging origin.'); }
  for (const name of ['SENDFOX_API_KEY','SENDFOX_TOKEN','SENDFOX_KEY','SENDFOX_API_TOKEN','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','GEMINI_API_KEY']) {
    if (env[name]) issues.push(`${name} must be absent from this staging deployment until a separate test-only integration is reviewed.`);
  }
  return issues;
}
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const issues = validateMiraDeployment(process.env);
  if (issues.length) { console.error('MIRA staging isolation check failed:\n' + issues.map(x => `- ${x}`).join('\n')); process.exitCode = 1; }
}
