import { getSpecies } from "@/app/actions/species";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Species } from "@prisma/client";

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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {s.commonName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {s.scientificName && `(${s.scientificName})`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Eau: {s.waterNeed} • Lumière: {s.lightPref} •
                        Humidité: {s.humidityPref}
                        {s.validated ? " ✓" : " (à valider)"}
                      </p>
                    </div>
                    <div>→</div>
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
