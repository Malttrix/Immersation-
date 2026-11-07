# MIRA production release

The release adds the editorial agent API, strict WordPress media validation and Content Studio review controls. MIRA is disabled unless `MIRA_PRODUCTION_READY=true`; existing commerce remains available while it is disabled. MIRA articles remain Draft and the Production database blocks MIRA publication.

Production Vercel project `immersation` needs the following **Production-scoped** additions before enabling the feature: `MIRA_AGENT_TOKEN`, `MIRA_PRODUCTION_READY`, `WORDPRESS_MEDIA_BASE_URL`, `WORDPRESS_MEDIA_USERNAME`, and `WORDPRESS_MEDIA_APP_PASSWORD`. The origin is `https://cms.immersation.com` and the media user is `mira-media-prod`. Use separate Production secrets. Existing `APP_URL`, `SUPABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `VITE_SUPABASE_ANON_KEY` are also required; their values and provenance must be verified privately.

The restricted WordPress account cannot list the media collection, so automatic confirmation that an uncertain upload is absent remains unavailable and must fail closed. An authenticated identity check is available with `python3 tools/mira/verify-production-wordpress.py`; it prompts privately and does not upload files.

Prepare a reviewed commit and verify its diff and tests. After separate approval, configure the Production variables, merge the reviewed release into `main` and allow the Production deployment. Only after deployment and authenticated media checks should a supervised bilingual Draft be submitted. Hermes schedules remain paused and publication stays disabled.
