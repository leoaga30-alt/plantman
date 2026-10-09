import { createHash, timingSafeEqual } from "node:crypto";
import { runDailyDigest } from "@/lib/daily-digest";

export const dynamic = "force-dynamic";

// Constant-time comparison of the Bearer token with CRON_SECRET (hashed so lengths always match).
function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(given), hash(expected));
}

// Manual trigger of the daily reminder. The app also runs it by itself every morning
// (see digest-scheduler). `?dry=1` shows what would be sent, without sending or logging anything.
export async function GET(req: Request) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 });

  const dryRun = new URL(req.url).searchParams.get("dry") === "1";

  try {
    return Response.json(await runDailyDigest({ dryRun }));
  } catch (err) {
    console.error("Daily digest failed:", err instanceof Error ? err.message : err);
    return new Response("Error", { status: 500 });
  }
}
