"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth/requireMember";
import { getCurrentUser } from "@/lib/auth/session";
import { explainInterval, IntervalExplanation } from "@/lib/watering/interval";
import {
  forecastWaterings,
  nextDue,
  type ScheduledPlant,
} from "@/lib/watering/forecast";
import { isWinterRest, roomTemperature } from "@/lib/watering/season";
import { dayKeyToDate, diffDays, toDayKey, todayKey, type DayKey } from "@/lib/dates";
import { signPhotoUrls } from "@/lib/storage";


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
  /** Temporary signed URL of the cover photo (the bucket is private). */
  coverPhotoUrl: string | null;
}

type PlantWithRelations = Awaited<ReturnType<typeof loadPlants>>[number];

async function loadPlants(roomId?: string) {
  return prisma.plant.findMany({
    where: { archivedAt: null, ...(roomId && { roomId }) },
    include: { species: true, room: true },
  });
}

// Latest WATER and SKIP event per plant, in a single query.
async function loadLatestEvents(plantId?: string) {
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

function toScheduledPlant(
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


export async function getTodayPlants(): Promise<PlantScheduleItem[]> {
  await requireMember();

  const [plants, events] = await Promise.all([loadPlants(), loadLatestEvents()]);
  const photoUrls = await signPhotoUrls(plants.map((p) => p.coverPhotoPath));
  const today = todayKey();

  const schedule: PlantScheduleItem[] = plants.map((plant) => {
    const plantEvents = events.get(plant.id);
    const { due, overdueDays } = nextDue(toScheduledPlant(plant, plantEvents), today);

    return {
      plantId: plant.id,
      plantName: plant.name,
      roomId: plant.roomId,
      roomName: plant.room.name,
      species: {
        commonName: plant.species.commonName,
        lightPref: plant.species.lightPref,
        humidityPref: plant.species.humidityPref,
        waterNeed: plant.species.waterNeed,
      },
      lastWateredAt: plantEvents?.water ?? null,
      nextWateringDate: dayKeyToDate(due),
      daysOverdue: overdueDays,
      isDue: due <= today,
      coverPhotoPath: plant.coverPhotoPath,
      coverPhotoUrl: plant.coverPhotoPath ? photoUrls.get(plant.coverPhotoPath) ?? null : null,
    };
  });

  // Sort: overdue first, then today's, then the rest by date
  return schedule.sort((a, b) => {
    if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
    if (a.isDue) return b.daysOverdue - a.daysOverdue;
    return a.nextWateringDate.getTime() - b.nextWateringDate.getTime();
  });
}


export async function markWatered(plantId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return prisma.careEvent.create({
    data: {
      plantId,
      memberId: user.member.id,
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
      memberId: user.member.id,
      type: "SKIP",
      note: "Sol encore humide",
    },
  });
}

export async function addFertilizer(plantId: string, note: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return prisma.careEvent.create({
    data: {
      plantId,
      memberId: user.member.id,
      type: "FERTILIZE",
      note,
    },
  });
}

export async function addRepotting(plantId: string, note: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return prisma.careEvent.create({
    data: {
      plantId,
      memberId: user.member.id,
      type: "REPOT",
      note,
    },
  });
}

export interface CareEventItem {
  id: string;
  type: string;
  at: Date;
  note: string | null;
  memberName: string;
}

export async function getPlantEvents(plantId: string): Promise<CareEventItem[]> {
  await requireMember();

  const events = await prisma.careEvent.findMany({
    where: { plantId },
    include: { member: true },
    orderBy: { at: "desc" },
  });

  return events.map((event) => ({
    id: event.id,
    type: event.type,
    at: event.at,
    note: event.note,
    memberName: event.member.name,
  }));
}

export interface ForecastItem {
  plantId: string;
  plantName: string;
  roomId: string;
  roomName: string;
  speciesName: string;
  coverPhotoUrl: string | null;
  overdueDays: number;
}

export interface WateringForecast {
  /** Today in Belgian time, so the client never relies on its own clock. */
  today: DayKey;
  /** Plants to water, keyed by day. Days with nothing to do are absent. */
  days: Record<DayKey, ForecastItem[]>;
}

const MAX_FORECAST_DAYS = 100;
const DayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function getWateringForecast(
  from: string,
  to: string,
  roomId?: string
): Promise<WateringForecast> {
  await requireMember();

  const range = z.object({ from: DayKeySchema, to: DayKeySchema }).parse({ from, to });
  const span = diffDays(range.from, range.to);
  if (span < 0 || span > MAX_FORECAST_DAYS) throw new Error("Période invalide");

  const [plants, events] = await Promise.all([loadPlants(roomId), loadLatestEvents()]);
  const photoUrls = await signPhotoUrls(plants.map((p) => p.coverPhotoPath));
  const today = todayKey();

  const days: Record<DayKey, ForecastItem[]> = {};
  for (const plant of plants) {
    const scheduled = toScheduledPlant(plant, events.get(plant.id));

    for (const { date, overdueDays } of forecastWaterings(scheduled, range.from, range.to, today)) {
      (days[date] ??= []).push({
        plantId: plant.id,
        plantName: plant.name,
        roomId: plant.roomId,
        roomName: plant.room.name,
        speciesName: plant.species.commonName,
        coverPhotoUrl: plant.coverPhotoPath ? photoUrls.get(plant.coverPhotoPath) ?? null : null,
        overdueDays,
      });
    }
  }

  // Most overdue first, then alphabetical
  for (const items of Object.values(days)) {
    items.sort((a, b) => b.overdueDays - a.overdueDays || a.plantName.localeCompare(b.plantName, "fr"));
  }

  return { today, days };
}


export interface PlantSchedule {
  explanation: IntervalExplanation;
  today: DayKey;
  /** Day the plant is (or was) due. Before `today` when overdue. */
  nextDue: DayKey;
  overdueDays: number;
  /** Day of the last watering, in Belgian time. */
  lastWateredOn: DayKey | null;
  /** The species rests in winter and today is inside that rest. */
  inWinterRest: boolean;
}

export async function getPlantSchedule(plantId: string): Promise<PlantSchedule> {
  await requireMember();

  const [plant, events] = await Promise.all([
    prisma.plant.findUniqueOrThrow({
      where: { id: plantId },
      include: { species: true, room: true },
    }),
    loadLatestEvents(plantId),
  ]);

  const today = todayKey();
  const [, month, day] = today.split("-").map(Number);
  const plantEvents = events.get(plantId);
  const due = nextDue(toScheduledPlant(plant, plantEvents), today);

  const explanation = explainInterval({
    intervalSpring: plant.species.intervalSpring,
    intervalSummer: plant.species.intervalSummer,
    intervalAutumn: plant.species.intervalAutumn,
    intervalWinter: plant.species.intervalWinter,
    temperature: roomTemperature(month - 1, day, plant.room.tempWinter, plant.room.tempSummer),
    light: plant.room.light,
    humidity: plant.room.humidity,
    nearHeater: plant.room.nearHeater,
    potDiameterCm: plant.potDiameterCm || undefined,
    potMaterial: plant.potMaterial,
    intervalAdjust: plant.intervalAdjust || 1.0,
    intervalOverride: plant.intervalOverride ?? undefined,
    date: dayKeyToDate(today),
    heatingSeasonStart: "10-15",
    heatingSeasonEnd: "04-15",
  });

  return {
    explanation,
    today,
    nextDue: due.due,
    overdueDays: due.overdueDays,
    lastWateredOn: plantEvents?.water ? toDayKey(plantEvents.water) : null,
    inWinterRest: plant.species.winterRest && isWinterRest(month - 1, day),
  };
}
