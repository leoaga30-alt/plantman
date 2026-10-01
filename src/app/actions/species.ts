"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { z } from "zod";

const SpeciesSchema = z.object({
  commonName: z.string().min(1, "Name required"),
  scientificName: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  waterNeed: z.enum(["LOW", "MEDIUM", "HIGH"]),
  intervalSpring: z.number().int().min(1).max(60),
  intervalSummer: z.number().int().min(1).max(60),
  intervalAutumn: z.number().int().min(1).max(60),
  intervalWinter: z.number().int().min(1).max(60),
  minTemp: z.number().optional(),
  lightPref: z.enum(["LOW", "MEDIUM", "BRIGHT", "DIRECT_SUN"]),
  humidityPref: z.enum(["DRY", "NORMAL", "HUMID"]),
  winterRest: z.boolean().default(false),
  care: z.any(), // JSON field
  validated: z.boolean().default(false),
});

type SpeciesInput = z.infer<typeof SpeciesSchema>;

export async function createSpecies(input: SpeciesInput) {
  await requireMember();

  const validated = SpeciesSchema.parse(input);

  return prisma.species.create({
    data: {
      ...validated,
      source: "MANUAL",
    },
  });
}

export async function updateSpecies(id: string, input: SpeciesInput) {
  await requireMember();

  const validated = SpeciesSchema.parse(input);

  return prisma.species.update({
    where: { id },
    data: validated,
  });
}

export async function deleteSpecies(id: string) {
  await requireMember();

  // Check if species has plants
  const plantCount = await prisma.plant.count({
    where: { speciesId: id },
  });

  if (plantCount > 0) {
    throw new Error(
      `Cannot delete species with ${plantCount} plant(s). Delete plants first.`
    );
  }

  return prisma.species.delete({
    where: { id },
  });
}

export async function getSpecies() {
  await requireMember();

  return prisma.species.findMany({
    orderBy: { commonName: "asc" },
  });
}

export async function getSpeciesById(id: string) {
  await requireMember();

  return prisma.species.findUnique({
    where: { id },
  });
}
