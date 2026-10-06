"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  DoorOpen,
  Droplets,
  Sprout,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlantThumb } from "@/components/PlantThumb";

type Variant = "current" | "proposed";

const GROUPS = [
  {
    room: "Salle à manger",
    tint: "bg-tint-sage",
    plants: [
      { name: "Zamioculcas", species: "Zamioculcas", late: 2 },
      { name: "Monstera n°1", species: "Monstera", late: 0 },
    ],
  },
  {
    room: "Véranda",
    tint: "bg-tint-sun",
    plants: [
      { name: "Araucaria", species: "Sapin de Norfolk", late: 5 },
      { name: "Peyotl", species: "Peyotl", late: 0 },
    ],
  },
];

const NAV: [string, LucideIcon][] = [
  ["Accueil", Droplets],
  ["Planning", CalendarDays],
  ["Plantes", Sprout],
  ["Pièces", DoorOpen],
  ["Espèces", BookOpen],
  ["Diagnostic", Stethoscope],
];

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto w-full max-w-[375px] overflow-hidden rounded-[2rem] border-4 border-foreground/70 bg-background text-foreground"
    >
      {children}
    </div>
  );
}

function BottomNav({ variant }: { variant: Variant }) {
  return (
    <div className="flex border-t border-border bg-background pb-2">
      {NAV.map(([label, Icon], i) => {
        const active = i === 0;
        return variant === "current" ? (
          <div
            key={label}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              active ? "font-semibold text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </div>
        ) : (
          <div key={label} className="flex min-h-16 flex-1 items-center justify-center">
            <div
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1.5 text-[11px] font-semibold ${
                active ? "bg-tint-sage text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.5 : 2} />
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HomeCurrent() {
  return (
    <>
      <div className="px-4 py-6">
        <h1 className="mb-2 text-3xl font-bold">Aujourd&apos;hui 🌿</h1>
        <p className="mb-8 text-muted-foreground">4 plantes à arroser</p>
        <h2 className="mb-4 text-xl font-semibold">À arroser</h2>
        <div className="space-y-6">
          {GROUPS.map((group) => (
            <div key={group.room}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{group.room}</h3>
              <div className="space-y-3">
                {group.plants.map((plant) => (
                  <div key={plant.name} className="rounded-lg border border-border p-4">
                    <div className="flex items-start gap-4">
                      <PlantThumb url={null} className="size-16 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold">{plant.name}</h4>
                        <p className="text-xs text-muted-foreground">{plant.species}</p>
                        {plant.late > 0 && (
                          <p className="mt-1 text-xs text-destructive">{plant.late} j de retard</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">✓ Arrosé</Button>
                        <Button size="sm" variant="outline">
                          +2j
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav variant="current" />
    </>
  );
}

function HomeProposed() {
  return (
    <>
      <div className="px-4 py-6">
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight">Aujourd&apos;hui</h1>
        <div className="mb-6 mt-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-water px-3.5 py-1.5 text-base font-bold text-water-foreground">
            <Droplets aria-hidden="true" className="size-5" />4 à arroser
          </span>
          <span className="text-base font-medium text-muted-foreground">sur 8 plantes</span>
        </div>

        <div className="space-y-6">
          {GROUPS.map((group) => (
            <section key={group.room}>
              <h3 className={`mb-3 inline-flex rounded-full px-3.5 py-1 text-sm font-bold ${group.tint}`}>
                {group.room}
              </h3>
              <div className="space-y-3">
                {group.plants.map((plant) => (
                  <div
                    key={plant.name}
                    className="rounded-2xl border border-border bg-card p-4 shadow-(--shadow-card)"
                  >
                    <div className="flex items-center gap-4">
                      <PlantThumb url={null} className="size-[4.5rem] shrink-0 rounded-xl bg-tint-sage text-primary" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-bold leading-tight">{plant.name}</h4>
                        <p className="text-sm text-muted-foreground">{plant.species}</p>
                        {plant.late > 0 && (
                          <p className="mt-1.5 inline-block rounded-full bg-destructive/10 px-2.5 py-0.5 text-sm font-bold text-destructive">
                            {plant.late} j de retard
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-water text-base font-bold text-water-foreground"
                      >
                        <Droplets aria-hidden="true" className="size-5" />
                        Arrosé
                      </button>
                      <button
                        type="button"
                        className="h-12 rounded-xl bg-muted px-4 text-base font-semibold text-foreground"
                      >
                        Reporter 2 j
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <BottomNav variant="proposed" />
    </>
  );
}

// ---- Calendar ----------------------------------------------------------

const DAYS = Array.from({ length: 35 }, (_, i) => i - 3); // 1 Oct 2026 is a Thursday: 3 leading days
const WATERING: Record<number, number> = { 6: 2, 11: 3, 14: 1, 18: 2, 22: 1, 24: 2, 29: 1 };
const LATE = new Set([6]);

function CalendarScreen({ variant }: { variant: Variant }) {
  const proposed = variant === "proposed";
  const today = 6;
  const selected = 11;

  return (
    <div className="px-4 py-5">
      <h1 className={proposed ? "mb-4 text-[2rem] font-extrabold tracking-tight" : "mb-4 text-3xl font-bold"}>
        Planning
      </h1>
      <p className={`mb-3 first-letter:uppercase ${proposed ? "text-xl font-extrabold" : "text-xl font-semibold"}`}>
        octobre 2026
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className={`py-1 text-xs ${proposed ? "font-bold" : "font-medium"} text-muted-foreground`}>
            {d}
          </span>
        ))}
        {DAYS.map((d) => {
          const inMonth = d >= 1 && d <= 31;
          const count = inMonth ? (WATERING[d] ?? 0) : 0;
          const isSelected = d === selected;
          const isToday = d === today;
          const dayNumber = inMonth ? d : d < 1 ? 30 + d : d - 31;

          const base = proposed
            ? "rounded-xl border-2 font-semibold"
            : "rounded-lg border";
          const state = isSelected
            ? proposed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary bg-primary text-primary-foreground"
            : isToday
              ? "border-primary"
              : "border-transparent";

          return (
            <div
              key={d}
              className={`flex min-h-14 flex-col items-center gap-1 pt-1.5 text-sm ${base} ${state} ${
                inMonth || isSelected ? "" : "text-muted-foreground/60"
              }`}
            >
              <span>{dayNumber}</span>
              <span className="flex h-2 items-center gap-0.5">
                {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                  <span
                    key={i}
                    className={`rounded-full ${proposed ? "size-2" : "size-1.5"} ${
                      isSelected
                        ? "bg-primary-foreground"
                        : LATE.has(d)
                          ? "bg-destructive"
                          : proposed
                            ? "bg-water"
                            : "bg-primary"
                    }`}
                  />
                ))}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-lg font-semibold first-letter:uppercase">Dimanche 11 octobre</p>
      {proposed ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-(--shadow-card)">
          <PlantThumb url={null} className="size-12 shrink-0 rounded-xl bg-tint-sage text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">Araucaria</p>
            <p className="text-sm text-muted-foreground">Sapin de Norfolk • Véranda</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <PlantThumb url={null} className="size-12 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Araucaria</p>
            <p className="text-xs text-muted-foreground">Sapin de Norfolk • Véranda</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Components ----------------------------------------------------------

function ComponentsSheet({ variant }: { variant: Variant }) {
  const proposed = variant === "proposed";

  return (
    <div className="space-y-6 px-4 py-5">
      <section aria-label="Boutons">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Boutons</h3>
        <div className="flex flex-wrap gap-2">
          {proposed ? (
            <>
              <button type="button" className="h-12 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground">
                Enregistrer
              </button>
              <button type="button" className="h-12 rounded-xl bg-water px-5 text-base font-bold text-water-foreground">
                Arrosé
              </button>
              <button type="button" className="h-12 rounded-xl border-2 border-primary px-5 text-base font-bold text-primary">
                Modifier
              </button>
              <button type="button" className="h-12 rounded-xl bg-destructive/10 px-5 text-base font-bold text-destructive">
                Supprimer
              </button>
            </>
          ) : (
            <>
              <Button>Enregistrer</Button>
              <Button variant="outline">Modifier</Button>
              <Button variant="destructive">Supprimer</Button>
            </>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {proposed ? "Hauteur 48 px, texte 16 px gras" : "Hauteur 32 px (28 px en petit), texte 14 px"}
        </p>
      </section>

      <section aria-label="Champs">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Champs</h3>
        <label className={`mb-1.5 block ${proposed ? "text-base font-semibold" : "text-sm font-medium"}`}>
          Nom de la plante
        </label>
        {proposed ? (
          <input
            readOnly
            value="Monstera n°1"
            className="h-12 w-full rounded-xl border-2 border-input bg-card px-3 text-base"
          />
        ) : (
          <input
            readOnly
            value="Monstera n°1"
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground"
          />
        )}
      </section>

      <section aria-label="Étiquettes">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Étiquettes et statuts</h3>
        {proposed ? (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-tint-sun px-3 py-1">Lumière vive</span>
            <span className="rounded-full bg-tint-sky px-3 py-1">Humidité normale</span>
            <span className="rounded-full bg-tint-sage px-3 py-1 text-primary">Validée</span>
            <span className="rounded-full bg-tint-clay px-3 py-1">À valider</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Arrosage modéré • Lumière vive • Humidité normale (à valider)
          </p>
        )}
      </section>
    </div>
  );
}

// ---- Layout of the comparison ------------------------------------------

function Pair({
  title,
  hint,
  render,
  mode,
}: {
  title: string;
  hint: string;
  render: (variant: Variant) => React.ReactNode;
  mode: "light" | "dark";
}) {
  return (
    <section className="mb-14">
      <h3 className="mb-1 text-xl font-bold">{title}</h3>
      <p className="mb-5 text-muted-foreground">{hint}</p>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-center text-sm font-semibold text-muted-foreground">Actuel</p>
          <Frame label={`${title}, version actuelle`}>{render("current")}</Frame>
        </div>
        <div>
          <p className="mb-3 text-center text-sm font-semibold text-primary">Proposé</p>
          <div className="theme-proposal rounded-[2rem]" data-mode={mode}>
            <Frame label={`${title}, version proposée`}>{render("proposed")}</Frame>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DesignPreviews() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold">Aperçu de la proposition :</p>
        <div role="group" aria-label="Thème de l'aperçu proposé" className="flex gap-2">
          {(["light", "dark"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={mode === value ? "default" : "outline"}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className="h-11 px-4 text-base"
            >
              {value === "light" ? "Clair" : "Sombre"}
            </Button>
          ))}
        </div>
      </div>

      <Pair
        title="Aujourd'hui"
        hint="L'écran le plus utilisé : le geste « arrosé » doit être le plus visible et le plus facile à toucher."
        mode={mode}
        render={(variant) => (variant === "current" ? <HomeCurrent /> : <HomeProposed />)}
      />
      <Pair
        title="Planning (mois)"
        hint="Points bleus = jours d'arrosage, rouge = en retard."
        mode={mode}
        render={(variant) => <CalendarScreen variant={variant} />}
      />
      <Pair
        title="Boutons, champs, étiquettes"
        hint="Les briques de base, avec leurs vraies tailles."
        mode={mode}
        render={(variant) => <ComponentsSheet variant={variant} />}
      />
    </div>
  );
}
