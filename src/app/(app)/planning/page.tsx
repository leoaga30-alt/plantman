"use client";

import { getWateringForecast, type ForecastItem } from "@/app/actions/watering";
import { getRooms } from "@/app/actions/rooms";
import { Button } from "@/components/ui/button";
import { MonthCalendar, type DayMarker } from "@/components/MonthCalendar";
import { PlantThumb } from "@/components/PlantThumb";
import {
  addDays,
  formatDayLong,
  monthGrid,
  monthOf,
  shiftMonth,
  todayKey,
  type DayKey,
} from "@/lib/dates";
import { Room } from "@prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ViewMode = "week" | "month";

const WEEK_DAYS = 7;

function dayTitle(day: DayKey, today: DayKey): string {
  if (day === today) return "Aujourd'hui";
  if (day === addDays(today, 1)) return "Demain";
  return formatDayLong(day);
}

function PlantRow({ item }: { item: ForecastItem }) {
  return (
    <Link
      href={`/plantes/${item.plantId}`}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted">
        <PlantThumb url={item.coverPhotoUrl} className="size-12 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.plantName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {item.speciesName} • {item.roomName}
          </p>
        </div>
        {item.overdueDays > 0 && (
          <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            {item.overdueDays} j de retard
          </span>
        )}
      </div>
    </Link>
  );
}

export default function PlanningPage() {
  const [today] = useState<DayKey>(() => todayKey());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [cursor, setCursor] = useState(() => monthOf(todayKey()));
  const [selected, setSelected] = useState<DayKey>(today);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [result, setResult] = useState<{
    key: string;
    days: Record<DayKey, ForecastItem[]>;
    failed: boolean;
  } | null>(null);

  // Range to load: the 7 coming days, or the whole calendar grid (leading/trailing days included).
  const range = useMemo(() => {
    if (viewMode === "week") return { from: today, to: addDays(today, WEEK_DAYS - 1) };
    const { from, to } = monthGrid(cursor.year, cursor.month);
    return { from, to };
  }, [viewMode, today, cursor]);

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch((err) => console.error("Failed to load rooms:", err));
  }, []);

  // Loading is derived from the request key: no stale dots from another month while fetching.
  const requestKey = `${range.from}|${range.to}|${selectedRoomId}`;

  useEffect(() => {
    let cancelled = false;

    getWateringForecast(range.from, range.to, selectedRoomId !== "all" ? selectedRoomId : undefined)
      .then((forecast) => {
        if (!cancelled) setResult({ key: requestKey, days: forecast.days, failed: false });
      })
      .catch((err) => {
        console.error("Failed to load planning:", err);
        if (!cancelled) setResult({ key: requestKey, days: {}, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [range, selectedRoomId, requestKey]);

  const loading = result?.key !== requestKey;
  const days = useMemo(() => (loading ? {} : (result?.days ?? {})), [loading, result]);
  const failed = !loading && Boolean(result?.failed);

  const markers = useMemo(() => {
    const result: Record<DayKey, DayMarker> = {};
    for (const [day, items] of Object.entries(days)) {
      result[day] = { count: items.length, overdue: items.some((i) => i.overdueDays > 0) };
    }
    return result;
  }, [days]);

  const goToMonth = (year: number, month: number) => {
    setCursor({ year, month });
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    setSelected(today.startsWith(prefix) ? today : `${prefix}01`);
  };

  const shift = (delta: number) => {
    const next = shiftMonth(cursor.year, cursor.month, delta);
    goToMonth(next.year, next.month);
  };

  const goToToday = () => {
    const current = monthOf(today);
    goToMonth(current.year, current.month);
  };

  const total = useMemo(() => {
    if (viewMode === "week") {
      return Object.values(days).reduce((sum, items) => sum + items.length, 0);
    }
    const prefix = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-`;
    return Object.entries(days)
      .filter(([day]) => day.startsWith(prefix))
      .reduce((sum, [, items]) => sum + items.length, 0);
  }, [days, viewMode, cursor]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: WEEK_DAYS }, (_, i) => addDays(today, i)).filter(
        (day) => (days[day]?.length ?? 0) > 0
      ),
    [days, today]
  );

  const selectedItems = days[selected] ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Planning</h1>
          <p className="text-muted-foreground" aria-live="polite">
            {total} arrosage{total !== 1 ? "s" : ""}{" "}
            {viewMode === "week" ? "cette semaine" : "ce mois-ci"}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex gap-2" role="group" aria-label="Affichage">
            <Button
              type="button"
              variant={viewMode === "week" ? "default" : "outline"}
              aria-pressed={viewMode === "week"}
              onClick={() => setViewMode("week")}
              className="h-11 px-4 text-base"
            >
              Semaine
            </Button>
            <Button
              type="button"
              variant={viewMode === "month" ? "default" : "outline"}
              aria-pressed={viewMode === "month"}
              onClick={() => setViewMode("month")}
              className="h-11 px-4 text-base"
            >
              Mois
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="room-filter" className="text-xs text-muted-foreground">
              Pièce
            </label>
            <select
              id="room-filter"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="h-11 rounded-md border border-border bg-background px-3 text-base"
            >
              <option value="all">Toutes les pièces</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {failed && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            Impossible de charger le planning. Réessayez.
          </p>
        )}

        <div
          aria-busy={loading}
          className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
        >
          {viewMode === "month" ? (
            <div className="space-y-6">
              <MonthCalendar
                year={cursor.year}
                month={cursor.month}
                today={today}
                selected={selected}
                markers={markers}
                onSelect={setSelected}
                onPrevious={() => shift(-1)}
                onNext={() => shift(1)}
                onToday={goToToday}
              />

              <section aria-label={`Arrosages du ${formatDayLong(selected)}`}>
                <h2 className="mb-3 text-lg font-semibold first-letter:uppercase">
                  {dayTitle(selected, today)}
                </h2>
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Rien à arroser ce jour-là.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedItems.map((item) => (
                      <li key={item.plantId}>
                        <PlantRow item={item} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : weekDays.length === 0 && !loading ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">Rien à arroser cette semaine.</p>
              <Link href="/plantes/new">
                <Button className="h-11 px-4 text-base">Ajouter une plante</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {weekDays.map((day) => (
                <section key={day} aria-label={dayTitle(day, today)}>
                  <h2 className="mb-3 text-lg font-semibold first-letter:uppercase">{dayTitle(day, today)}</h2>
                  <ul className="space-y-2">
                    {days[day].map((item) => (
                      <li key={item.plantId}>
                        <PlantRow item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
