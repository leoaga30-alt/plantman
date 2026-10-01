"use client";

import {
  getPlantById,
  updatePlant,
  deletePlant,
  archivePlant,
  unarchivePlant,
} from "@/app/actions/plants";
import { getPlantIntervalExplanation } from "@/app/actions/watering";
import { getSpecies } from "@/app/actions/species";
import { getRooms } from "@/app/actions/rooms";
import { PlantForm } from "@/components/PlantForm";
import { Button } from "@/components/ui/button";
import { PlantFormData } from "@/types/species";
import { IntervalExplanation } from "@/lib/watering/interval";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plant, Species, Room } from "@prisma/client";

export default function PlantPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [plant, setPlant] = useState<(Plant & { species?: Species; room?: Room }) | null>(null);
  const [species, setSpecies] = useState<Species[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [explanation, setExplanation] = useState<IntervalExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantData, speciesData, roomsData] = await Promise.all([
          getPlantById(params.id),
          getSpecies(),
          getRooms(),
        ]);
        setPlant(plantData);
        setSpecies(speciesData);
        setRooms(roomsData);

        const explanation = await getPlantIntervalExplanation(params.id);
        setExplanation(explanation);
      } catch (err) {
        console.error("Failed to load plant:", err);
        router.push("/plantes");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, router]);

  const handleSubmit = async (data: PlantFormData) => {
    await updatePlant(params.id, data);
    router.push("/plantes");
  };

  const handleArchive = async () => {
    try {
      if (plant?.archivedAt) {
        await unarchivePlant(params.id);
      } else {
        await archivePlant(params.id);
      }
      router.push("/plantes");
    } catch (err) {
      console.error("Failed to archive plant:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr ? Cette action ne peut pas être annulée.")) {
      return;
    }

    setDeleting(true);
    try {
      await deletePlant(params.id);
      router.push("/plantes");
    } catch (err) {
      console.error("Failed to delete plant:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Plante non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{plant.name}</h1>
            {plant.archivedAt && (
              <p className="text-sm text-muted-foreground mt-1">Archivée</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleArchive}>
              {plant.archivedAt ? "Restaurer" : "Archiver"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Espèce</p>
              <p className="font-medium">{plant.species?.commonName}</p>
              {plant.species?.scientificName && (
                <p className="text-xs text-muted-foreground italic">
                  {plant.species.scientificName}
                </p>
              )}
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Pièce</p>
              <p className="font-medium">{plant.room?.name}</p>
            </div>
          </div>

          {explanation && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">
                Intervalle d&apos;arrosage
              </p>
              <p className="text-sm font-medium mb-2">{explanation.baseLabel}</p>
              {explanation.factors.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                  {explanation.factors.map((factor, idx) => (
                    <li key={idx}>
                      × {factor.factor.toFixed(2)} ({factor.label})
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm font-semibold text-primary">
                Résultat: {explanation.final} j
              </p>
            </div>
          )}

          {plant.species?.care && typeof plant.species.care === "object" && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">
                Fiche d&apos;entretien
              </p>
              <details className="text-sm cursor-pointer">
                <summary className="font-medium">Voir les conseils</summary>
                <div className="mt-3 space-y-2">
                  {(() => {
                    const care = plant.species.care as Record<string, unknown>;
                    const watering = care.watering as Record<string, unknown>;
                    if (watering && watering.advice) {
                      return (
                        <div>
                          <p className="font-medium text-xs">Arrosage:</p>
                          <p className="text-xs text-muted-foreground">
                            {String(watering.advice)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {(() => {
                    const care = plant.species.care as Record<string, unknown>;
                    if (care.light) {
                      return (
                        <div>
                          <p className="font-medium text-xs">Lumière:</p>
                          <p className="text-xs text-muted-foreground">
                            {String(care.light)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </details>
            </div>
          )}
        </div>

        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-6">Modifier</h2>
          <PlantForm
            plant={plant}
            species={species}
            rooms={rooms}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
