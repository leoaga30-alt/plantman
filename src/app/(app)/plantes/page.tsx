import { getPlants } from "@/app/actions/plants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlantThumb } from "@/components/PlantThumb";

export default async function PlantsPage() {
  const plants = await getPlants();
  const activePlants = plants.filter((p) => !p.archivedAt);
  const archivedPlants = plants.filter((p) => p.archivedAt);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Plantes</h1>
          <Link href="/plantes/new">
            <Button>Ajouter une plante</Button>
          </Link>
        </div>

        {activePlants.length === 0 && archivedPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune plante créée. Commencez par ajouter une plante.
            </p>
            <Link href="/plantes/new">
              <Button>Ajouter une plante</Button>
            </Link>
          </div>
        ) : (
          <>
            {activePlants.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Plantes actives</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {activePlants.map((plant) => (
                    <Link key={plant.id} href={`/plantes/${plant.id}`}>
                      <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer h-full flex flex-col">
                        <PlantThumb url={plant.coverPhotoUrl} className="mb-3 h-32 w-full rounded-lg" />
                        <h3 className="font-semibold text-sm">{plant.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plant.species?.commonName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plant.room?.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {archivedPlants.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                  Plantes archivées
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {archivedPlants.map((plant) => (
                    <Link key={plant.id} href={`/plantes/${plant.id}`}>
                      <div className="p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors cursor-pointer h-full flex flex-col opacity-60">
                        <PlantThumb url={plant.coverPhotoUrl} className="mb-3 h-32 w-full rounded-lg" />
                        <h3 className="font-semibold text-sm">{plant.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plant.species?.commonName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plant.room?.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
