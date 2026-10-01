"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { z } from "zod";

const RoomSchema = z.object({
  name: z.string().min(1, "Name required"),
  light: z.enum(["LOW", "MEDIUM", "BRIGHT", "DIRECT_SUN"]).default("MEDIUM"),
  humidity: z.enum(["DRY", "NORMAL", "HUMID"]).default("NORMAL"),
  tempSummer: z.number().min(-50).max(50),
  tempWinter: z.number().min(-50).max(50),
  nearHeater: z.boolean().default(false),
  notes: z.string().optional(),
});

type RoomInput = z.infer<typeof RoomSchema>;

export async function createRoom(input: RoomInput) {
  await requireMember();

  const validated = RoomSchema.parse(input);

  return prisma.room.create({
    data: validated,
  });
}

export async function updateRoom(id: string, input: RoomInput) {
  await requireMember();

  const validated = RoomSchema.parse(input);

  return prisma.room.update({
    where: { id },
    data: validated,
  });
}

export async function deleteRoom(id: string) {
  await requireMember();

  return prisma.room.delete({
    where: { id },
  });
}

export async function getRooms() {
  await requireMember();

  return prisma.room.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getRoom(id: string) {
  await requireMember();

  return prisma.room.findUnique({
    where: { id },
  });
}
