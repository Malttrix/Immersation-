// Both local Express and Vercel execute the same routes. Never parse webhook JSON upstream.
import "dotenv/config";
import { validateMiraDeployment } from "../scripts/mira-preview-guard.mjs";
// Recheck server runtime settings; build checks protect static frontend assets.
const stagingIssues = validateMiraDeployment(process.env);
if (stagingIssues.length) throw new Error("MIRA staging isolation check failed.");
export { default } from "../server/app.js";
export const config = { api: { bodyParser: false } };
