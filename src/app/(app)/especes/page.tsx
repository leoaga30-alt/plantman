import { getSpecies } from "@/app/actions/species";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Species } from "@prisma/client";
import {
  HUMIDITY_LABEL,
  LIGHT_LABEL,
  WATER_NEED_LABEL,
  careSummary,
  label,
} from "@/lib/labels";

export default async function SpeciesPage() {
  const species = await getSpecies();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Espèces</h1>
          <Link href="/especes/new">
            <Button>Ajouter une espèce</Button>
          </Link>
        </div>

        {species.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune espèce créée. Commencez par ajouter une espèce.
            </p>
            <Link href="/especes/new">
              <Button>Ajouter une espèce</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {species.map((s: Species) => (
              <Link key={s.id} href={`/especes/${s.id}`}>
                <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{s.commonName}</h2>
                        {!s.validated && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            À valider
                          </span>
                        )}
                      </div>
                      {s.scientificName && (
                        <p className="text-sm italic text-muted-foreground">
                          {s.scientificName}
                        </p>
                      )}
                      {careSummary(s.care) && (
                        <p className="mt-2 line-clamp-2 text-sm">
                          {careSummary(s.care)}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Arrosage {label(WATER_NEED_LABEL, s.waterNeed)} • Lumière{" "}
                        {label(LIGHT_LABEL, s.lightPref)} • Humidité{" "}
                        {label(HUMIDITY_LABEL, s.humidityPref)}
                      </p>
                    </div>
                    <div aria-hidden="true">→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
