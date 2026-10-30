// Both local Express and Vercel execute the same routes. Never parse webhook JSON upstream.
import "dotenv/config";
export { default } from "../server/app";
export const config = { api: { bodyParser: false } };
