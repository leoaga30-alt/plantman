import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { parseInventory, normalize, type Inventory } from "../src/lib/inventory/parse";

const prisma = new PrismaClient();

const dryRun = process.argv.includes("--dry-run");

async function seedMembers() {
  const allowedEmails = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!allowedEmails.length) {
    console.log("✓ No emails in ALLOWED_EMAILS, members skipped");
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  console.log(`Creating ${allowedEmails.length} members…`);

  for (const email of allowedEmails) {
    try {
      // Create Auth user (OTP-only, no password)
      const randomPassword = Math.random().toString(36).slice(2) + Date.now();
      const { error } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { setup_complete: false },
      });

      if (error && error.status !== 422) {
        throw new Error(`Auth error for ${email}: ${error.message}`);
      }

      // Create or update Member entry
      await prisma.member.upsert({
        where: { email },
        create: {
          email,
          name: email.split("@")[0] || email,
        },
        update: {},
      });

      console.log(`  ✓ ${email}`);
    } catch (e) {
      console.error(`  ✗ ${email}:`, (e as Error).message);
      throw e;
    }
  }
}

function loadInventory(): Inventory | null {
  const path = join(process.cwd(), "data", "inventaire.md");
  if (!existsSync(path)) {
    console.log("✓ No data/inventaire.md, inventory skipped");
    return null;
  }
  return parseInventory(readFileSync(path, "utf8"));
}

function printInventory(inventory: Inventory) {
  console.log(`${inventory.rooms.length} rooms:`);
  for (const r of inventory.rooms) {
    console.log(
      `  ${r.name} | ${r.light} | ${r.tempSummer}/${r.tempWinter}°C | ${r.humidity} | heater: ${r.nearHeater}`
    );
  }
  console.log(`${inventory.species.length} species (AI profile generated if missing in DB):`);
  for (const s of inventory.species) console.log(`  ${s}`);
  console.log(`${inventory.plants.length} plants:`);
  for (const p of inventory.plants) {
    console.log(`  ${p.name} — ${p.species} — ${p.room}${p.description ? ` (${p.description})` : ""}`);
  }
  console.log("✓ Dry run: nothing written, no AI call");
}

// One Species per botanical name. The botanical name from the inventory is kept as
// scientificName (unique) so re-running the seed finds it again and never re-calls the AI.
async function createSpeciesFromAi(botanicalName: string) {
  const { generateSpeciesProfile } = await import("../src/lib/ai/client");
  const { profile } = await generateSpeciesProfile(botanicalName);

  if (profile.status !== "ok") {
    throw new Error("name is ambiguous, fix it in data/inventaire.md");
  }

  return prisma.species.create({
    data: {
      commonName: profile.commonName,
      scientificName: botanicalName,
      aliases: profile.aliases,
      waterNeed: profile.waterNeed,
      intervalSpring: profile.intervals.spring,
      intervalSummer: profile.intervals.summer,
      intervalAutumn: profile.intervals.autumn,
      intervalWinter: profile.intervals.winter,
      minTemp: profile.minTemp,
      lightPref: profile.lightPref,
      humidityPref: profile.humidityPref,
      winterRest: profile.winterRest,
      care: profile.care as Prisma.InputJsonObject,
      source: "AI",
      validated: false,
    },
  });
}

async function seedInventory(inventory: Inventory) {
  // Rooms: create-only, so edits made in the app are never overwritten.
  console.log(`Rooms (${inventory.rooms.length})…`);
  const roomIds = new Map<string, string>();
  for (const room of inventory.rooms) {
    const { name, ...data } = room;
    const saved = await prisma.room.upsert({
      where: { name },
      create: { name, ...data },
      update: {},
    });
    roomIds.set(normalize(name), saved.id);
    console.log(`  ✓ ${name}`);
  }

  console.log(`Species (${inventory.species.length})…`);
  if (process.env.AI_MOCK === "true") {
    console.warn("  ⚠ AI_MOCK=true: missing species get generic placeholder profiles");
  }
  const speciesIds = new Map<string, string>();
  const failed: string[] = [];
  for (const botanical of inventory.species) {
    const existing = await prisma.species.findUnique({
      where: { scientificName: botanical },
    });
    if (existing) {
      speciesIds.set(normalize(botanical), existing.id);
      console.log(`  = ${botanical} (already in DB)`);
      continue;
    }
    try {
      const created = await createSpeciesFromAi(botanical);
      speciesIds.set(normalize(botanical), created.id);
      console.log(`  ✓ ${botanical} → ${created.commonName} (AI, to validate)`);
    } catch (e) {
      failed.push(botanical);
      console.error(`  ✗ ${botanical}: ${(e as Error).message}`);
    }
  }

  console.log(`Plants (${inventory.plants.length})…`);
  let created = 0;
  let skipped = 0;
  for (const plant of inventory.plants) {
    const speciesId = speciesIds.get(normalize(plant.species));
    const roomId = roomIds.get(normalize(plant.room));
    if (!speciesId || !roomId) {
      console.error(`  ✗ ${plant.name}: species "${plant.species}" unavailable`);
      continue;
    }

    const existing = await prisma.plant.findFirst({
      where: { name: plant.name, roomId },
    });
    if (existing) {
      skipped++;
      console.log(`  = ${plant.name} (already in DB)`);
      continue;
    }

    await prisma.plant.create({
      data: {
        name: plant.name,
        description: plant.description,
        speciesId,
        roomId,
        potDiameterCm: plant.potDiameterCm,
        potMaterial: plant.potMaterial,
      },
    });
    created++;
    console.log(`  ✓ ${plant.name}`);
  }

  console.log(`Plants: ${created} created, ${skipped} already there`);

  if (failed.length > 0) {
    process.exitCode = 1;
    console.error(`✗ ${failed.length} species failed — re-run the seed to retry only those`);
  }
}

async function main() {
  // Parse first: an invalid inventory must stop everything before any write.
  const inventory = loadInventory();

  if (dryRun) {
    if (inventory) printInventory(inventory);
    return;
  }

  await seedMembers();
  if (inventory) await seedInventory(inventory);

  console.log(process.exitCode ? "Seed finished with errors" : "✓ Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e instanceof Error ? e.message : e);
    await prisma.$disconnect();
    process.exit(1);
  });
