import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WateringCard } from "./WateringCard";
import type { PlantSchedule } from "@/app/actions/watering";
import { explainInterval } from "@/lib/watering/interval";

const explanation = explainInterval({
  intervalSpring: 10,
  intervalSummer: 7,
  intervalAutumn: 14,
  intervalWinter: 21,
  temperature: 22.586956521739133,
  light: "DIRECT_SUN",
  humidity: "HUMID",
  nearHeater: false,
  potMaterial: "PLASTIC",
  intervalAdjust: 1,
  date: new Date("2026-10-06T12:00:00Z"),
  heatingSeasonStart: "10-15",
  heatingSeasonEnd: "04-15",
});

const schedule = (overrides: Partial<PlantSchedule> = {}): PlantSchedule => ({
  explanation,
  today: "2026-10-06",
  nextDue: "2026-10-15",
  overdueDays: 0,
  lastWateredOn: "2026-10-04",
  inWinterRest: false,
  ...overrides,
});

// Visible text of the rendered card (tags removed, HTML entities decoded).
const text = (node: React.ReactElement) =>
  renderToStaticMarkup(node)
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

describe("WateringCard", () => {
  it("shows the next date, the last watering and a readable frequency", () => {
    const out = text(<WateringCard schedule={schedule()} />);
    expect(out).toContain("Prochain arrosage");
    expect(out).toContain("jeudi 15 octobre (dans 9 jours)");
    expect(out).toContain("Dernier arrosage : dimanche 4 octobre");
    expect(out).toContain("Arroser environ tous les");
  });

  it("explains each factor in plain French, without raw floats", () => {
    const out = text(<WateringCard schedule={schedule()} />);
    expect(out).toContain("Pièce à 22,6 °C");
    expect(out).toContain("plus chaud que 20 °C : la terre sèche plus vite");
    expect(out).toContain("Soleil direct");
    expect(out).toContain("20 % plus souvent");
    expect(out).toContain("Air humide");
    expect(out).toContain("10 % moins souvent");
    expect(out).toContain("× 0,90 × 0,80 × 1,10");
    expect(out).not.toMatch(/\d\.\d{3,}/);
    expect(out).not.toContain("22.58");
  });

  it("flags an overdue plant", () => {
    const out = text(<WateringCard schedule={schedule({ overdueDays: 3, nextDue: "2026-10-03" })} />);
    expect(out).toContain("En retard de 3 jours");
    expect(out).toContain("Prévu samedi 3 octobre");
  });

  it("handles today, tomorrow and never-watered plants", () => {
    expect(text(<WateringCard schedule={schedule({ nextDue: "2026-10-06" })} />)).toContain(
      "À arroser aujourd'hui"
    );
    expect(text(<WateringCard schedule={schedule({ nextDue: "2026-10-07" })} />)).toContain("Demain");
    expect(text(<WateringCard schedule={schedule({ lastWateredOn: null })} />)).toContain(
      "Aucun arrosage enregistré"
    );
  });

  it("mentions the winter rest", () => {
    expect(text(<WateringCard schedule={schedule({ inWinterRest: true })} />)).toContain(
      "Repos hivernal"
    );
  });
});
