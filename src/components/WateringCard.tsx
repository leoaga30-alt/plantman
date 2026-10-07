import type { PlantSchedule } from "@/app/actions/watering";
import { diffDays, formatDayLong } from "@/lib/dates";
import { formatNumberFr } from "@/lib/labels";

function nextText(schedule: PlantSchedule): string {
  const { nextDue, today, overdueDays } = schedule;
  if (overdueDays > 0) {
    return `En retard de ${overdueDays} jour${overdueDays > 1 ? "s" : ""}`;
  }

  const days = diffDays(today, nextDue);
  if (days === 0) return "À arroser aujourd'hui";
  if (days === 1) return "Demain";
  return `${formatDayLong(nextDue)} (dans ${days} jours)`;
}

export function WateringCard({ schedule }: { schedule: PlantSchedule }) {
  const { explanation, lastWateredOn, inWinterRest, overdueDays, nextDue } = schedule;

  return (
    <section aria-labelledby="watering-title" className="space-y-5 rounded-xl bg-muted p-4">
      <div>
        <h2 id="watering-title" className="text-sm font-semibold text-muted-foreground">
          Prochain arrosage
        </h2>
        <p className={`text-xl font-bold first-letter:uppercase ${overdueDays > 0 ? "text-destructive" : ""}`}>
          {nextText(schedule)}
        </p>
        {overdueDays > 0 && (
          <p className="text-sm text-muted-foreground">
            Prévu {formatDayLong(nextDue)}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {lastWateredOn
            ? `Dernier arrosage : ${formatDayLong(lastWateredOn)}`
            : "Aucun arrosage enregistré pour l'instant"}
        </p>
        {inWinterRest && (
          <p className="mt-3 rounded-lg bg-tint-sky p-3 text-sm">
            <strong>Repos hivernal :</strong> cette plante ne s&apos;arrose plus jusqu&apos;au
            1er mars.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold">{explanation.summary}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{explanation.baseLabel}</p>

        {explanation.factors.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-sm font-semibold">Ce qui change la fréquence :</p>
            <ul className="space-y-3">
              {explanation.factors.map((factor) => (
                <li key={factor.label} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{factor.label}</p>
                    <p className="text-sm text-muted-foreground">{factor.detail}</p>
                  </div>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold text-foreground ${
                      factor.effect === "faster" ? "bg-tint-sky" : "bg-tint-sun"
                    }`}
                  >
                    {factor.percent} % {factor.effect === "faster" ? "plus souvent" : "moins souvent"}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-muted-foreground">
              Calcul : {explanation.base} j ×{" "}
              {explanation.factors.map((f) => formatNumberFr(f.factor, 2, true)).join(" × ")} ={" "}
              {formatNumberFr(explanation.exact)} → {explanation.final} jours
            </p>
          </>
        )}
      </div>
    </section>
  );
}
