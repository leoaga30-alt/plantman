import { brusselsHour } from "@/lib/dates";
import { runDailyDigest } from "@/lib/daily-digest";

// Sends the daily reminder from inside the app: Railway keeps one instance running, and the
// day is claimed in DigestLog, so a restart or a second instance can never send it twice.
// If the app was down at the usual time, the next check (every 10 min) catches up the same day.

const CHECK_EVERY_MS = 10 * 60 * 1000;
const FIRST_CHECK_DELAY_MS = 30 * 1000;
const SEND_UNTIL_HOUR = 20; // after that, a "water now" reminder is no longer useful

export function startDigestScheduler() {
  if (process.env.DIGEST_SCHEDULER === "off") return;
  if (process.env.NODE_ENV !== "production") return;

  const state = globalThis as { __digestSchedulerStarted?: boolean };
  if (state.__digestSchedulerStarted) return;
  state.__digestSchedulerStarted = true;

  const sendFromHour = Number(process.env.DIGEST_HOUR ?? 7);

  const check = async () => {
    const hour = brusselsHour();
    if (hour < sendFromHour || hour >= SEND_UNTIL_HOUR) return;

    try {
      const result = await runDailyDigest();
      if (result.status !== "already") {
        console.log(
          `Daily digest ${result.date}: ${result.status} (${result.plants} plants, ${result.sent}/${result.recipients} emails)`
        );
      }
    } catch (err) {
      console.error("Daily digest check failed:", err instanceof Error ? err.message : err);
    }
  };

  setTimeout(check, FIRST_CHECK_DELAY_MS).unref();
  setInterval(check, CHECK_EVERY_MS).unref();
}
