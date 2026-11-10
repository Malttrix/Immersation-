# Media revision guard release — LOCAL PREPARATION ONLY

Migration SHA-256 `ee43e8351176041cf167b6be45a95224645da42d19f2a86c13523758afc7c3b0`. Adds a nullable reservation revision and service-role-only reservation, completion, and read-only status functions. The guarded completion retains provider metadata and an uncertain reservation instead of attaching to a changed article. Existing legacy API behavior is unchanged.

Local verification: PGlite reservation/completion tests; in-process actual route harness (authentication, stale reservation, success, stale completion and provider error); recovery runner no-retry/guard checks; migration plan predicates; TypeScript. No hosted connection was made.

Candidate migration workspace: `/Users/maxontan/Documents/Codex/mira-media-release-runner`. Its local CLI version check currently fails in the sandbox because the Supabase CLI cannot write its own telemetry file. Real Supabase CLI plan and response validation for this migration, hosted compatibility and a clean committed API release are not yet established. Do not run apply or deploy until independently reviewed.

Recovery prototype: `recover-cover.py` checks production-only authenticated `media-guard-status` for the exact article, Draft, revision, review status, and all blocking cover reservations; verifies the original key status; persists a new key privately with an attempted marker before one guarded upload. Stops on uncertain response and never automatically retries. It is tested with mocked HTTP only; target VM paths and deployed route are not yet verified.

Rollback: do not drop the column, routines, history or uncertain reservations. If the deployment must be stopped, restore the previous Vercel deployment using the Vercel Production rollback control after separately authorizing that action. Review and deploy a forward corrective migration if database changes must be reverted; dropping the column would destroy persisted revision evidence. A previously uploaded WordPress object may already exist and requires audited reconciliation before any cleanup or retry.
