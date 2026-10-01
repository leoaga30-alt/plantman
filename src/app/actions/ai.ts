"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { getCurrentUser } from "@/lib/auth/session";
import {
  generateSpeciesProfile as generateProfile,
  generateDiagnosis as generateDiag,
} from "@/lib/ai/client";
import { SpeciesProfileSchema } from "@/lib/ai/schemas";
import { z } from "zod";

const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || "20", 10);

async function checkDailyQuota(memberId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.aiUsage.count({
    where: {
      memberId,
      createdAt: { gte: today },
    },
  });

  return count < DAILY_LIMIT;
}

async function logAiUsage(
  memberId: string,
  kind: "PROFILE" | "DIAGNOSIS",
  model: string,
  inputTokens: number,
  outputTokens: number
) {
  return prisma.aiUsage.create({
    data: {
      memberId,
      kind,
      model,
      inputTokens,
      outputTokens,
    },
  });
}

export async function generateSpeciesProfile(commonName: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasQuota = await checkDailyQuota(user.id);
  if (!hasQuota) {
    throw new Error(`Quota atteint (${DAILY_LIMIT} appels/jour)`);
  }

  try {
    const { profile, tokensUsed } = await generateProfile(commonName);

    await logAiUsage(
      user.id,
      "PROFILE",
      process.env.AI_MODEL_PROFILE || "claude-haiku-4-5-20251001",
      tokensUsed.input,
      tokensUsed.output
    );

    return profile;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error("Réponse IA invalide. Réessayez.");
    }
    throw err;
  }
}

export async function generateDiagnosis(input: {
  plantId: string;
  symptoms: string[];
  notes: string;
  photoDescriptions?: string[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const hasQuota = await checkDailyQuota(user.id);
  if (!hasQuota) {
    throw new Error(`Quota atteint (${DAILY_LIMIT} appels/jour)`);
  }

  const plant = await prisma.plant.findUniqueOrThrow({
    where: { id: input.plantId },
    include: { species: true, room: true },
  });

  const recentEvents = await prisma.careEvent.findMany({
    where: { plantId: input.plantId },
    orderBy: { at: "desc" },
    take: 5,
  });

  const plantContext = `Espèce: ${plant.species.commonName} (${plant.species.scientificName || "?"})
Pièce: ${plant.room.name} (lumière: ${plant.room.light}, humidité: ${plant.room.humidity}, temp: ${plant.room.tempSummer}°C)
Pot: ${plant.potDiameterCm || "?"}cm ${plant.potMaterial}
Intervalle actuel: ${plant.intervalAdjust || 1}× ajusté
Historique: ${recentEvents.map((e) => `${e.type} le ${e.at.toLocaleDateString("fr-BE")}`).join(", ")}`;

  try {
    const { result, tokensUsed } = await generateDiag(
      plantContext,
      input.symptoms,
      input.notes,
      input.photoDescriptions
    );

    await logAiUsage(
      user.id,
      "DIAGNOSIS",
      process.env.AI_MODEL_DIAGNOSIS || "claude-haiku-4-5-20251001",
      tokensUsed.input,
      tokensUsed.output
    );

    return result;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error("Diagnostic invalide. Réessayez.");
    }
    throw err;
  }
}

export async function getRemainingQuota() {
  await requireMember();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const used = await prisma.aiUsage.count({
    where: {
      memberId: user.id,
      createdAt: { gte: today },
    },
  });

  return {
    used,
    remaining: Math.max(0, DAILY_LIMIT - used),
    total: DAILY_LIMIT,
  };
}

export async function getOrGenerateSpecies(commonName: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if species already exists (by name, scientific name, or alias)
  const existing = await prisma.species.findMany();
  const normalized = commonName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

  for (const species of existing) {
    const speciesNorm = species.commonName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
    if (speciesNorm === normalized) {
      return {
        found: true,
        speciesId: species.id,
        profile: null,
      };
    }

    if (species.scientificName) {
      const sciNorm = species.scientificName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
      if (sciNorm === normalized) {
        return {
          found: true,
          speciesId: species.id,
          profile: null,
        };
      }
    }

    for (const alias of species.aliases) {
      const aliasNorm = alias
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
      if (aliasNorm === normalized) {
        return {
          found: true,
          speciesId: species.id,
          profile: null,
        };
      }
    }
  }

  // Not found, generate
  const profile = await generateSpeciesProfile(commonName);

  return {
    found: false,
    profile,
    speciesId: null,
  };
}

export async function createSpeciesFromProfile(profile: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = SpeciesProfileSchema.parse(profile);

  const species = await prisma.species.create({
    data: {
      commonName: validated.commonName,
      scientificName: validated.scientificName || undefined,
      aliases: validated.aliases,
      waterNeed: validated.waterNeed,
      intervalSpring: validated.intervals.spring,
      intervalSummer: validated.intervals.summer,
      intervalAutumn: validated.intervals.autumn,
      intervalWinter: validated.intervals.winter,
      minTemp: validated.minTemp,
      lightPref: validated.lightPref,
      humidityPref: validated.humidityPref,
      winterRest: validated.winterRest,
      care: validated.care,
      source: "AI",
      validated: false,
    },
  });

  return species;
}
