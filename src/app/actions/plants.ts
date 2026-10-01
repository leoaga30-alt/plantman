"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { z } from "zod";

const PlantSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  speciesId: z.string().min(1, "Species required"),
  roomId: z.string().min(1, "Room required"),
  potDiameterCm: z.number().optional(),
  potMaterial: z
    .enum(["PLASTIC", "TERRACOTTA", "GLAZED_CERAMIC", "OTHER"])
    .default("PLASTIC"),
  acquiredAt: z.string().optional(),
  coverPhotoPath: z.string().optional(),
});

type PlantInput = z.infer<typeof PlantSchema>;

export async function createPlant(input: PlantInput) {
  await requireMember();

  const validated = PlantSchema.parse(input);

  return prisma.plant.create({
    data: {
      ...validated,
      acquiredAt: validated.acquiredAt
        ? new Date(validated.acquiredAt)
        : undefined,
    },
    include: { species: true, room: true },
  });
}

export async function updatePlant(id: string, input: PlantInput) {
  await requireMember();

  const validated = PlantSchema.parse(input);

  return prisma.plant.update({
    where: { id },
    data: {
      ...validated,
      acquiredAt: validated.acquiredAt
        ? new Date(validated.acquiredAt)
        : undefined,
    },
    include: { species: true, room: true },
  });
}

export async function archivePlant(id: string) {
  await requireMember();

  return prisma.plant.update({
    where: { id },
    data: { archivedAt: new Date() },
    include: { species: true, room: true },
  });
}

export async function unarchivePlant(id: string) {
  await requireMember();

  return prisma.plant.update({
    where: { id },
    data: { archivedAt: null },
    include: { species: true, room: true },
  });
}

export async function deletePlant(id: string) {
  await requireMember();

  return prisma.plant.delete({
    where: { id },
  });
}

export async function getPlants() {
  await requireMember();

  return prisma.plant.findMany({
    include: { species: true, room: true },
    orderBy: { name: "asc" },
  });
}

export async function getPlantById(id: string) {
  await requireMember();

  return prisma.plant.findUnique({
    where: { id },
    include: { species: true, room: true, photos: true, events: true },
  });
}
