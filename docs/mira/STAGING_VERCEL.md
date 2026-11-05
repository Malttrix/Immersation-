# Separate Vercel staging project — MIRA

**Status: preparation only.** The founder reports that Supabase staging project `dibfotxdupgdhbmhmrnl` has been initialized. Do not infer Vercel project creation or deployment from that report. No deployment is authorized by this document. Do not set the readiness attestation until the separate Vercel project, branch, services and credentials are verified.

## Create the project without a first deployment

Do not press **Deploy** in the Git import screen: project creation there starts
a deployment before the project ID and assigned domain can be configured. Go
back/cancel the import. Create the empty project in the intended Vercel team
with `vercel project add` (the CLI prompts for the name `immersation-staging`);
this is a project-management command, not `vercel deploy`. If Vercel CLI is
not installed, run `npx vercel project add` from a neutral directory rather
than the existing production-linked checkout. Confirm the active team before
creating it. A deployment domain may not exist until the first deployment: use
an independently assigned stable staging Vercel domain only after Vercel shows
it, and do not assume `<project-name>.vercel.app` has been assigned.

Record the new project ID from Settings → General, and set only its staging
environment variables. Keep Git disconnected while configuring protections;
Git connection or a subsequent push may trigger a build. Set the isolated
project's ignored-build rule and protect the deployment before connecting Git.
The MIRA feature branch and required local changes must first be committed and,
only with explicit approval, pushed. Configure its staging branch in the new
project without altering the existing production project. Any first Git build
must wait for approval and for verified `APP_URL` and staging credentials; if
Vercel cannot supply an eligible stable origin before that build, stop rather
than weakening the guard or deploying a bootstrap application.

## Protection model

`npm run build` invokes `scripts/mira-preview-guard.mjs`. The Vercel API entry point checks the same settings at runtime. On Vercel, **both** `preview` and `production` deployment environment labels are treated as staging only when the Vercel system project name is `immersation-staging`, the system project ID matches the separately configured staging ID and is not the known live project ID, the Git ref is exactly `feature/mira-editorial-integration`, and all staging checks pass. Thus the new staging project's own Production environment can be used without treating its backing services as live services. Missing system variables fail closed. A Git deployment is required; CLI deployments without an available matching Git ref are deliberately blocked. Automatic exposure of Vercel system environment variables must be enabled on the new project.

The guard requires the confirmed staging Supabase reference and exact WordPress staging origin, rejects production app hostnames, and rejects SendFox aliases, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `GEMINI_API_KEY`. Do not configure integrations, shared variables or other external service credentials in staging. Stripe/checkout are intentionally unavailable for this integration. Vercel's Production environment label for the new project is not permission to connect live systems.

**Limits:** project IDs, names, URLs and environment variables are checks, not proof of the underlying service account, DNS target or credential scope. The guard cannot identify a production credential pasted under an unrelated variable name, or an alias to a production service. Build-command overrides, deliberately altered code, or a different deployment mechanism can bypass checks. Independently verify resource ownership and credential scope. Do not publish this branch or use any deployment until the isolation and independent security checks pass.

## Required staging environment variables

Configure these in **the new `immersation-staging` Vercel project only**, for the actual deployment environment being used (its Production environment if the feature branch is configured as its production branch; Preview if a preview branch). Do not copy the production project's shared variables or values. Mark secrets sensitive. Never put credentials in chat, repository files, CLI history or logs.

| Name | Staging-only value / purpose |
| --- | --- |
| `MIRA_STAGING_READY` | `true` only after the separate project, branch, services and credentials are verified. |
| `MIRA_STAGING_VERCEL_PROJECT_ID` | Project ID of **new** `immersation-staging`, equal to Vercel's `VERCEL_PROJECT_ID`. Never use the live project's ID. |
| `MIRA_STAGING_SUPABASE_REF` | Exactly `dibfotxdupgdhbmhmrnl`, the confirmed separate Supabase staging project. |
| `SUPABASE_URL` | `https://<staging-ref>.supabase.co`, exactly matching the staging ref. |
| `VITE_SUPABASE_URL` | The same staging Supabase URL. This is exposed to the browser. |
| `VITE_SUPABASE_ANON_KEY` | The separate staging project's publishable/anon key; exposed to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | The separate staging project's server-only service role/secret key. Never prefix with `VITE_`. |
| `APP_URL` | Exact HTTPS origin of the staging site, not `immersation.com` or a subdomain. The client checks that its review URL matches the configured API origin. |
| `MIRA_AGENT_TOKEN` | A new, cryptographically random, dedicated staging-only agent credential (at least 32 random bytes, URL-safe). |
| `MIRA_AGENT_TOKEN_PREVIOUS` | Optional previous **staging** token only during a rotation. |
| `WORDPRESS_MEDIA_BASE_URL` | Exactly `https://staging-cms.immersation.com` (an optional trailing slash is accepted). |
| `WORDPRESS_MEDIA_USERNAME` | Restricted staging WordPress media account only. |
| `WORDPRESS_MEDIA_APP_PASSWORD` | Application Password for that staging account, server-only. |

Vercel supplies `VERCEL_ENV`, `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_NAME`, `VERCEL_GIT_COMMIT_REF` and `VERCEL` when system variables are exposed. Do not manually forge them. `IMMERSATION_API_BASE` and `MIRA_AGENT_TOKEN` are configured **on the staging Hermes client**, not in frontend code. Do not configure `SENDFOX_API_KEY`, `SENDFOX_TOKEN`, `SENDFOX_KEY`, `SENDFOX_API_TOKEN`, Stripe secrets or Gemini credentials in the staging project. The founder reports successful tests against the separate WordPress staging service; its restricted credential and the adapter workflow must be verified in the isolated application environment.

All-deployments Vercel Authentication also protects API routes. A separately authorized operator can create a **staging-project-only** Protection Bypass for Automation secret, then provide it to the paused staging Hermes client as `MIRA_VERCEL_BYPASS_SECRET`. The client sends it in `x-vercel-protection-bypass` only to `https://immersation-staging.vercel.app`; the separate MIRA bearer token is still required. The bypass grants access to protected deployments across the staging project and must remain secret. Do not create or activate it automatically, and never use the production project's bypass secret.

## Branch-only linkage — future approved actions

1. Review and commit the pending feature work locally. Keep the existing production Vercel project `immersation` connected to `main`; do not disconnect, rename or overwrite it. The existing production project currently also builds unassigned branch previews and has shared Preview variables, so a later push to the same repo may trigger a build there too. This branch's guard blocks that build when its system project ID/name identifies the live project, but use project-level controls as defense in depth.
2. After explicit approval, create a **separate**, initially unlinked Vercel project named `immersation-staging` (for example via the documented `vercel project add` flow), without changing the existing project. In that new project's Settings, enable system environment variables and configure staging environment variables and a staging-only deployment protection policy. Confirm project ID and all resource origins independently before setting `MIRA_STAGING_READY`.
3. Before connecting Git or allowing an import wizard to deploy, set the **new project's** Ignored Build Step to the following shell command, which asks Vercel to build only the exact MIRA ref and skip all others, including a missing ref:

   ```sh
   if [ "$VERCEL_GIT_COMMIT_REF" = "feature/mira-editorial-integration" ]; then exit 1; else exit 0; fi
   ```

   Vercel uses exit `1` to proceed and `0` to skip. Verify this setting in the new project and confirm the repository does not override it with `ignoreCommand`. Set the new project's Production branch to `feature/mira-editorial-integration` if its Production environment is desired; this setting is per project and does not change GitHub's default branch or the existing production project. Do not use `--prod` against the existing `immersation` project.
4. Only after separately approved Git connection/push, connect the repository to the new project and push the committed feature branch. A second project on the same repository does **not** inherently limit Git events to that branch: verify the ignored-build setting and inspect deployments in both projects. The existing production project's Preview build may be triggered too; the guard must be included in the pushed commit and must fail there. If your Vercel plan or import workflow cannot establish those controls before a first automatic deployment, stop and obtain an approved alternative rather than assuming it is safe.
5. The founder reports the isolated staging Supabase migration chain has been applied. Verify RLS, runtime, the WordPress staging service, authenticated review and the full staging workflow before any live connection. Never apply staging-only baseline files to production.

Vercel documents [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), [production-branch configuration](https://vercel.com/docs/git), and the [Ignored Build Step](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel). Multiple Vercel projects attached to one repository can each react to a push; do not rely on the staging project's branch configuration to change the existing production project's behavior.

For legacy Supabase JWT keys the guard rejects a decoded project reference that does not match staging; it does not verify JWT signatures. New opaque Supabase keys cannot be attributed offline, so an operator must verify their project and scope separately. Similarly, a different hostname is not proof that WordPress or an app domain points to a different installation. Treat the runtime and build checks as fail-closed safeguards alongside—not replacements for—isolated accounts and independent review.
