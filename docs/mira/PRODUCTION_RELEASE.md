# MIRA production release

The release adds the editorial agent API, strict WordPress media validation and Content Studio review controls. MIRA is disabled unless `MIRA_PRODUCTION_READY=true`; existing commerce remains available while it is disabled. MIRA articles remain Draft and the Production database blocks MIRA publication.

Production Vercel project `immersation` needs the following **Production-scoped** additions before enabling the feature: `MIRA_AGENT_TOKEN`, `MIRA_PRODUCTION_READY`, `WORDPRESS_MEDIA_BASE_URL`, `WORDPRESS_MEDIA_USERNAME`, and `WORDPRESS_MEDIA_APP_PASSWORD`. The origin is `https://cms.immersation.com` and the media user is `mira-media-prod`. Use separate Production secrets. Existing `APP_URL`, `SUPABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `VITE_SUPABASE_ANON_KEY` are also required; their values and provenance must be verified privately.

The restricted WordPress account cannot list the media collection, so automatic confirmation that an uncertain upload is absent remains unavailable and must fail closed. An authenticated identity check is available with `python3 tools/mira/verify-production-wordpress.py`; it prompts privately and does not upload files.

After separate approval, enter the Production-only values in the Vercel project's Production scope and leave `MIRA_PRODUCTION_READY=false`. Merge the reviewed release into `main` and allow its deployment. Verify the build, the existing site and commerce, and that the agent endpoint returns 404 while disabled. An authenticated agent API check cannot succeed while the flag is false. Once these checks pass, a separately authorized operator can set the flag to `true` and redeploy; then verify authorization and the Production media integration before one supervised bilingual Draft submission. Hermes schedules remain paused and publication stays disabled.

Production WordPress media API calls use the fixed `/index.php?rest_route=/wp/v2/media` route, since `/wp-json/wp/v2/media` redirects. Metadata and media requests reject redirects, retain the exact-host allowlist, and validate the actual image bytes; the secret is never sent to the image URL.
