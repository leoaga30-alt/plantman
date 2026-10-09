import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildDigest, type DigestPlant } from "@/lib/digest";
import { todayKey, type DayKey } from "@/lib/dates";
import { sendEmail } from "@/lib/email";
import { loadLatestEvents, loadPlants, toScheduledPlant } from "@/lib/schedule-data";
import { nextDue } from "@/lib/watering/forecast";
import { waterQuantity } from "@/lib/watering/quantity";

export type DigestStatus =
  | "sent"
  | "nothing"
  | "already"
  | "no-recipients"
  | "failed"
  | "dry-run";

export interface DigestRun {
  status: DigestStatus;
  date: DayKey;
  plants: number;
  recipients: number;
  sent: number;
  failed: number;
  /** Dry run only: what would be sent. */
  preview?: { subject: string; text: string };
}

// Resend allows 2 requests per second.
const PAUSE_BETWEEN_EMAILS_MS = 600;

/** Plants that need water on `today` (or earlier), with the quantity to give. Same rules as the app. */
export async function findPlantsDueToday(today: DayKey): Promise<DigestPlant[]> {
  const [plants, events] = await Promise.all([loadPlants(), loadLatestEvents()]);

  return plants.flatMap((plant): DigestPlant[] => {
    const { due, overdueDays } = nextDue(toScheduledPlant(plant, events.get(plant.id)), today);
    if (due > today) return [];

    const quantity = waterQuantity({
      potDiameterCm: plant.potDiameterCm,
      waterNeed: plant.species.waterNeed,
    });
    return [
      {
        name: plant.name,
        room: plant.room.name,
        species: plant.species.commonName,
        overdueDays,
        quantityMl: quantity.ml,
        quantityEstimated: quantity.estimated,
      },
    ];
  });
}

function appUrl(): string | undefined {
  if (process.env.APP_URL) return process.env.APP_URL;
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : undefined;
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends today's reminder to every member who wants it. Safe to call as often as you like:
 * the day is claimed in DigestLog first, so a second call (or a second instance) sends nothing.
 */
export async function runDailyDigest(
  options: { now?: Date; dryRun?: boolean } = {}
): Promise<DigestRun> {
  const today = todayKey(options.now);
  const run = (status: DigestStatus, extra: Partial<DigestRun> = {}): DigestRun => ({
    status,
    date: today,
    plants: 0,
    recipients: 0,
    sent: 0,
    failed: 0,
    ...extra,
  });

  if (!options.dryRun && (await prisma.digestLog.findUnique({ where: { date: today } }))) {
    return run("already");
  }

  const due = await findPlantsDueToday(today);
  const digest = buildDigest(due, { today, appUrl: appUrl() });
  const members = await prisma.member.findMany({
    where: { notifyDaily: true },
    select: { email: true },
  });

  if (options.dryRun) {
    return run("dry-run", {
      plants: due.length,
      recipients: members.length,
      preview: digest ? { subject: digest.subject, text: digest.text } : undefined,
    });
  }

  // Claim the day before sending: two runs at the same moment cannot both send.
  try {
    await prisma.digestLog.create({ data: { date: today } });
  } catch (err) {
    if (isUniqueViolation(err)) return run("already");
    throw err;
  }

  // Nothing to water: no email, but the log stays (and the database was queried today).
  if (!digest) return run("nothing");
  if (members.length === 0) return run("no-recipients", { plants: due.length });

  let sent = 0;
  let failed = 0;
  for (const [index, member] of members.entries()) {
    if (index > 0) await sleep(PAUSE_BETWEEN_EMAILS_MS);

    const result = await sendEmail({
      to: member.email,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
    });
    if (result.ok) sent++;
    else {
      failed++;
      console.error(`Digest email failed (member ${index + 1}/${members.length}): ${result.error}`);
    }
  }

  // Nobody got it: free the day so the next run can try again.
  if (sent === 0) {
    await prisma.digestLog.delete({ where: { date: today } }).catch(() => undefined);
    return run("failed", { plants: due.length, recipients: members.length, failed });
  }

  return run("sent", { plants: due.length, recipients: members.length, sent, failed });
}
