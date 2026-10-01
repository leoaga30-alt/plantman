"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateInterval } from "@/lib/watering/interval";

export interface PlantScheduleItem {
  plantId: string;
  plantName: string;
  roomId: string;
  roomName: string;
  species: {
    commonName: string;
    lightPref: string;
    humidityPref: string;
    waterNeed: string;
  };
  lastWateredAt: Date | null;
  nextWateringDate: Date;
  daysOverdue: number;
  isDue: boolean;
  coverPhotoPath: string | null;
}

export async function getTodayPlants(): Promise<PlantScheduleItem[]> {
  await requireMember();

  const plants = await prisma.plant.findMany({
    where: { archivedAt: null },
    include: {
      species: true,
      room: true,
      events: {
        where: { type: "WATER" },
        orderBy: { at: "desc" },
        take: 1,
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schedule: PlantScheduleItem[] = [];

  for (const plant of plants) {
    if (!plant.species) continue;

    const lastWatered = plant.events[0]?.at || null;
    const interval = calculateInterval({
      intervalSpring: plant.species.intervalSpring,
      intervalSummer: plant.species.intervalSummer,
      intervalAutumn: plant.species.intervalAutumn,
      intervalWinter: plant.species.intervalWinter,
      temperature: plant.room?.tempSummer || 20,
      light: (plant.room?.light || "MEDIUM") as "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN",
      humidity: (plant.room?.humidity || "NORMAL") as "DRY" | "NORMAL" | "HUMID",
      nearHeater: plant.room?.nearHeater || false,
      potDiameterCm: plant.potDiameterCm || undefined,
      potMaterial: plant.potMaterial as "PLASTIC" | "TERRACOTTA" | "GLAZED_CERAMIC" | "OTHER",
      intervalAdjust: plant.intervalAdjust || 1.0,
      date: today,
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    let nextWateringDate: Date;
    if (!lastWatered) {
      nextWateringDate = today;
    } else {
      nextWateringDate = new Date(lastWatered);
      nextWateringDate.setDate(nextWateringDate.getDate() + interval);
    }

    const daysOverdue = Math.floor(
      (today.getTime() - nextWateringDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    schedule.push({
      plantId: plant.id,
      plantName: plant.name,
      roomId: plant.roomId,
      roomName: plant.room?.name || "Unknown",
      species: {
        commonName: plant.species.commonName,
        lightPref: plant.species.lightPref,
        humidityPref: plant.species.humidityPref,
        waterNeed: plant.species.waterNeed,
      },
      lastWateredAt: lastWatered,
      nextWateringDate,
      daysOverdue,
      isDue: nextWateringDate <= today,
      coverPhotoPath: plant.coverPhotoPath,
    });
  }

  // Sort: overdue first, then today's
  return schedule.sort((a, b) => {
    if (a.isDue && !b.isDue) return -1;
    if (!a.isDue && b.isDue) return 1;
    return a.daysOverdue - b.daysOverdue;
  });
}

export async function markWatered(plantId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return prisma.careEvent.create({
    data: {
      plantId,
      memberId: user.id,
      type: "WATER",
    },
  });
}

export async function markSkipped(plantId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return prisma.careEvent.create({
    data: {
      plantId,
      memberId: user.id,
      type: "SKIP",
      note: "Sol encore humide",
    },
  });
}

export interface PlanningDay {
  date: Date;
  plants: PlantScheduleItem[];
}

export async function getPlanningPlants(
  daysAhead: number,
  roomId?: string
): Promise<PlanningDay[]> {
  await requireMember();

  const plants = await prisma.plant.findMany({
    where: {
      archivedAt: null,
      ...(roomId && { roomId }),
    },
    include: {
      species: true,
      room: true,
      events: {
        where: { type: "WATER" },
        orderBy: { at: "desc" },
        take: 1,
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const planningDays: Map<string, PlantScheduleItem[]> = new Map();

  for (const plant of plants) {
    if (!plant.species) continue;

    const lastWatered = plant.events[0]?.at || null;
    const interval = calculateInterval({
      intervalSpring: plant.species.intervalSpring,
      intervalSummer: plant.species.intervalSummer,
      intervalAutumn: plant.species.intervalAutumn,
      intervalWinter: plant.species.intervalWinter,
      temperature: plant.room?.tempSummer || 20,
      light: (plant.room?.light || "MEDIUM") as "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN",
      humidity: (plant.room?.humidity || "NORMAL") as "DRY" | "NORMAL" | "HUMID",
      nearHeater: plant.room?.nearHeater || false,
      potDiameterCm: plant.potDiameterCm || undefined,
      potMaterial: plant.potMaterial as "PLASTIC" | "TERRACOTTA" | "GLAZED_CERAMIC" | "OTHER",
      intervalAdjust: plant.intervalAdjust || 1.0,
      date: today,
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    let nextWateringDate: Date;
    if (!lastWatered) {
      nextWateringDate = today;
    } else {
      nextWateringDate = new Date(lastWatered);
      nextWateringDate.setDate(nextWateringDate.getDate() + interval);
    }

    const daysOverdue = Math.floor(
      (today.getTime() - nextWateringDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only include if within planning horizon
    if (nextWateringDate.getTime() > today.getTime() + daysAhead * 24 * 60 * 60 * 1000) {
      continue;
    }

    const dateKey = nextWateringDate.toISOString().split("T")[0];

    const item: PlantScheduleItem = {
      plantId: plant.id,
      plantName: plant.name,
      roomId: plant.roomId,
      roomName: plant.room?.name || "Unknown",
      species: {
        commonName: plant.species.commonName,
        lightPref: plant.species.lightPref,
        humidityPref: plant.species.humidityPref,
        waterNeed: plant.species.waterNeed,
      },
      lastWateredAt: lastWatered,
      nextWateringDate,
      daysOverdue,
      isDue: nextWateringDate <= today,
      coverPhotoPath: plant.coverPhotoPath,
    };

    if (!planningDays.has(dateKey)) {
      planningDays.set(dateKey, []);
    }
    planningDays.get(dateKey)!.push(item);
  }

  // Build result, sorted by date
  const result: PlanningDay[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    result.push({
      date,
      plants: planningDays.get(dateKey) || [],
    });
  }

  return result;
}
