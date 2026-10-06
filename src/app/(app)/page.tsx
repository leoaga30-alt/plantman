"use client";

import { getTodayPlants, markWatered, markSkipped } from "@/app/actions/watering";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlantScheduleItem } from "@/app/actions/watering";
import { PlantThumb } from "@/components/PlantThumb";

export default function TodayPage() {
  const [plants, setPlants] = useState<PlantScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const data = await getTodayPlants();
        setPlants(data);
      } catch (err) {
        console.error("Failed to load plants:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, []);

  const handleWatered = async (plantId: string) => {
    setLoadingId(plantId);
    try {
      await markWatered(plantId);
      const updated = await getTodayPlants();
      setPlants(updated);
    } catch (err) {
      console.error("Failed to mark watered:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSkipped = async (plantId: string) => {
    setLoadingId(plantId);
    try {
      await markSkipped(plantId);
      const updated = await getTodayPlants();
      setPlants(updated);
    } catch (err) {
      console.error("Failed to mark skipped:", err);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const duePlants = plants.filter((p) => p.isDue);
  const completedPlants = plants.filter((p) => !p.isDue);

  const groupByRoom = (items: PlantScheduleItem[]) => {
    const grouped = new Map<string, PlantScheduleItem[]>();
    items.forEach((item) => {
      if (!grouped.has(item.roomId)) {
        grouped.set(item.roomId, []);
      }
      grouped.get(item.roomId)!.push(item);
    });
    return grouped;
  };

  const dueByRoom = groupByRoom(duePlants);
  const completedByRoom = groupByRoom(completedPlants);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Aujourd&apos;hui 🌿</h1>
          <p className="text-muted-foreground">
            {duePlants.length} plante{duePlants.length !== 1 ? "s" : ""} à
            arroser
          </p>
        </div>

        {duePlants.length === 0 && completedPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune plante créée. Commencez par en ajouter une.
            </p>
            <Link href="/plantes/new">
              <Button>Ajouter une plante</Button>
            </Link>
          </div>
        ) : (
          <>
            {duePlants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">À arroser</h2>
                <div className="space-y-6">
                  {Array.from(dueByRoom.entries()).map(([roomId, items]) => (
                    <div key={roomId}>
                      <h3 className="font-medium text-sm text-muted-foreground mb-3">
                        {items[0]?.roomName}
                      </h3>
                      <div className="space-y-3">
                        {items.map((plant) => (
                          <div
                            key={plant.plantId}
                            className="p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-start gap-4">
                              <PlantThumb url={plant.coverPhotoUrl} className="size-16 shrink-0 rounded-lg" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">
                                  {plant.plantName}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {plant.species.commonName}
                                </p>
                                {plant.daysOverdue > 0 && (
                                  <p className="text-xs text-destructive mt-1">
                                    {plant.daysOverdue} j de retard
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleWatered(plant.plantId)}
                                  disabled={loadingId === plant.plantId}
                                >
                                  ✓ Arrosé
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSkipped(plant.plantId)}
                                  disabled={loadingId === plant.plantId}
                                >
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
            )}

            {completedPlants.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                  Plus tard
                </h2>
                <div className="space-y-4">
                  {Array.from(completedByRoom.entries()).map(([roomId, items]) => (
                    <div key={roomId} className="text-sm">
                      <p className="text-xs text-muted-foreground mb-2">
                        {items[0]?.roomName}
                      </p>
                      <p className="text-muted-foreground">
                        {items.map((p) => p.plantName).join(", ")}
                      </p>
                    </div>
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
