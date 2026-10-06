"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { isValidPhotoPath, photoPath, PHOTO_EXTENSIONS } from "@/lib/photos";
import { createUploadTicket, signPhotoUrl } from "@/lib/storage";

const RequestSchema = z.object({
  plantId: z.string().min(1),
  ext: z.enum(PHOTO_EXTENSIONS),
});

const ConfirmSchema = z.object({
  plantId: z.string().min(1),
  path: z.string().min(1),
});

// Step 1: the browser asks for a one-shot upload ticket, then sends the file
// straight to Supabase Storage (the image never goes through a Server Action).
export async function requestPhotoUpload(plantId: string, ext: string) {
  await requireMember();
  const input = RequestSchema.parse({ plantId, ext });

  const plant = await prisma.plant.findUnique({
    where: { id: input.plantId },
    select: { id: true },
  });
  if (!plant) throw new Error("Plante introuvable");

  return createUploadTicket(photoPath(plant.id, randomUUID(), input.ext));
}

// Step 2: once uploaded, record the photo and make it the plant's cover.
export async function confirmPhotoUpload(plantId: string, path: string) {
  await requireMember();
  const input = ConfirmSchema.parse({ plantId, path });

  if (!isValidPhotoPath(input.plantId, input.path)) {
    throw new Error("Chemin de photo invalide");
  }

  const url = await signPhotoUrl(input.path);
  if (!url) throw new Error("La photo n'a pas été envoyée");

  await prisma.$transaction([
    prisma.photo.create({
      data: { plantId: input.plantId, path: input.path, kind: "PROFILE" },
    }),
    prisma.plant.update({
      where: { id: input.plantId },
      data: { coverPhotoPath: input.path },
    }),
  ]);

  return { url };
}
