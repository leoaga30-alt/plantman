"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { z } from "zod";
import { removePhotos, signPhotoUrls } from "@/lib/storage";

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

  const photos = await prisma.photo.findMany({
    where: { plantId: id },
    select: { path: true },
  });

  const deleted = await prisma.plant.delete({
    where: { id },
  });

  // Best effort: the rows are gone (cascade), don't leave the files orphaned.
  await removePhotos(photos.map((photo) => photo.path)).catch(() => undefined);

  return deleted;
}

export async function getPlants() {
  await requireMember();

  const plants = await prisma.plant.findMany({
    include: { species: true, room: true },
    orderBy: { name: "asc" },
  });

  const photoUrls = await signPhotoUrls(plants.map((plant) => plant.coverPhotoPath));
  return plants.map((plant) => ({
    ...plant,
    coverPhotoUrl: plant.coverPhotoPath ? photoUrls.get(plant.coverPhotoPath) ?? null : null,
  }));
}

export async function getPlantById(id: string) {
  await requireMember();

  const plant = await prisma.plant.findUnique({
    where: { id },
    include: { species: true, room: true, photos: true, events: true },
  });
  if (!plant) return null;

  const photoUrls = await signPhotoUrls([plant.coverPhotoPath]);
  return {
    ...plant,
    coverPhotoUrl: plant.coverPhotoPath ? photoUrls.get(plant.coverPhotoPath) ?? null : null,
  };
}
