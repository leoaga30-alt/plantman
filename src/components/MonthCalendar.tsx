"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDayLong, formatMonth, monthGrid, type DayKey } from "@/lib/dates";

export interface DayMarker {
  count: number;
  overdue: boolean;
}

interface MonthCalendarProps {
  year: number;
  month: number; // 1-12
  today: DayKey;
  selected: DayKey;
  markers: Record<DayKey, DayMarker | undefined>;
  onSelect: (day: DayKey) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const WEEKDAYS = [
  ["L", "lundi"],
  ["M", "mardi"],
  ["M", "mercredi"],
  ["J", "jeudi"],
  ["V", "vendredi"],
  ["S", "samedi"],
  ["D", "dimanche"],
] as const;

const MAX_DOTS = 3;

function describe(day: DayKey, marker: DayMarker | undefined, isToday: boolean): string {
  const count = marker?.count ?? 0;
  const what = count === 0 ? "rien à arroser" : `${count} plante${count > 1 ? "s" : ""} à arroser`;
  return `${formatDayLong(day)}${isToday ? " (aujourd'hui)" : ""}, ${what}`;
}

export function MonthCalendar({
  year,
  month,
  today,
  selected,
  markers,
  onSelect,
  onPrevious,
  onNext,
  onToday,
}: MonthCalendarProps) {
  const { weeks } = monthGrid(year, month);
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const showToday = !today.startsWith(prefix);

  return (
    <section aria-label="Calendrier des arrosages">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold first-letter:uppercase" aria-live="polite">
          {formatMonth(year, month)}
        </h2>
        <div className="flex items-center gap-1">
          {showToday && (
            <Button type="button" variant="outline" onClick={onToday} className="h-11 px-3 text-base">
              Aujourd&apos;hui
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            aria-label="Mois précédent"
            className="size-11"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onNext}
            aria-label="Mois suivant"
            className="size-11"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map(([letter, name], i) => (
          <abbr
            key={i}
            title={name}
            className="py-1 text-center text-xs font-medium text-muted-foreground no-underline"
          >
            {letter}
          </abbr>
        ))}

        {weeks.flat().map((day) => {
          const marker = markers[day];
          const inMonth = day.startsWith(prefix);
          const isToday = day === today;
          const isSelected = day === selected;
          const dots = Math.min(marker?.count ?? 0, MAX_DOTS);
          const more = (marker?.count ?? 0) > MAX_DOTS;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-label={describe(day, marker, isToday)}
              className={[
                "flex min-h-14 touch-manipulation flex-col items-center justify-start gap-1 rounded-lg border pt-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : isToday
                    ? "border-primary text-foreground"
                    : "border-transparent hover:bg-muted",
                inMonth || isSelected ? "" : "text-muted-foreground",
                isToday ? "font-semibold" : "",
              ].join(" ")}
            >
              <span aria-hidden="true">{Number(day.slice(8))}</span>
              <span aria-hidden="true" className="flex h-2 items-center gap-0.5">
                {Array.from({ length: dots }, (_, i) => (
                  <span
                    key={i}
                    className={`size-1.5 rounded-full ${
                      isSelected
                        ? "bg-primary-foreground"
                        : marker?.overdue
                          ? "bg-destructive"
                          : "bg-primary"
                    }`}
                  />
                ))}
                {more && (
                  <span className={`text-[10px] leading-none ${isSelected ? "" : "text-muted-foreground"}`}>
                    +
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
          Plante à arroser
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />
          En retard
        </span>
      </p>
    </section>
  );
}
