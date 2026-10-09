import { prisma } from "@/lib/db";
import type { ScheduledPlant } from "@/lib/watering/forecast";

// Plant + event loading shared by the app screens and the daily email, so both agree on who needs water.

export type PlantWithRelations = Awaited<ReturnType<typeof loadPlants>>[number];

export async function loadPlants(roomId?: string) {
  return prisma.plant.findMany({
    where: { archivedAt: null, ...(roomId && { roomId }) },
    include: { species: true, room: true },
  });
}

// Latest WATER and SKIP event per plant, in a single query.
export async function loadLatestEvents(plantId?: string) {
  const rows = await prisma.careEvent.groupBy({
    by: ["plantId", "type"],
    where: { type: { in: ["WATER", "SKIP"] }, ...(plantId && { plantId }) },
    _max: { at: true },
  });

  const latest = new Map<string, { water: Date | null; skip: Date | null }>();
  for (const row of rows) {
    const entry = latest.get(row.plantId) ?? { water: null, skip: null };
    if (row.type === "WATER") entry.water = row._max.at;
    else entry.skip = row._max.at;
    latest.set(row.plantId, entry);
  }
  return latest;
}

export function toScheduledPlant(
  plant: PlantWithRelations,
  events: { water: Date | null; skip: Date | null } | undefined
): ScheduledPlant {
  return {
    lastWateredAt: events?.water ?? null,
    lastSkipAt: events?.skip ?? null,
    winterRest: plant.species.winterRest,
    intervalSpring: plant.species.intervalSpring,
    intervalSummer: plant.species.intervalSummer,
    intervalAutumn: plant.species.intervalAutumn,
    intervalWinter: plant.species.intervalWinter,
    room: {
      tempSummer: plant.room.tempSummer,
      tempWinter: plant.room.tempWinter,
      light: plant.room.light,
      humidity: plant.room.humidity,
      nearHeater: plant.room.nearHeater,
    },
    potDiameterCm: plant.potDiameterCm ?? undefined,
    potMaterial: plant.potMaterial,
    intervalAdjust: plant.intervalAdjust || 1.0,
    intervalOverride: plant.intervalOverride ?? undefined,
  };
}
