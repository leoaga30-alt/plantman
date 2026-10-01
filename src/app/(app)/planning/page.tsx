"use client";

import { getPlanningPlants, PlanningDay } from "@/app/actions/watering";
import { getRooms } from "@/app/actions/rooms";
import { Button } from "@/components/ui/button";
import { Room } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type ViewMode = "week" | "month";

export default function PlanningPage() {
  const [planning, setPlanning] = useState<PlanningDay[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");

  const daysAhead = viewMode === "week" ? 7 : 28;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [planningData, roomsData] = await Promise.all([
          getPlanningPlants(
            daysAhead,
            selectedRoomId !== "all" ? selectedRoomId : undefined
          ),
          getRooms(),
        ]);
        setPlanning(planningData);
        setRooms(roomsData);
      } catch (err) {
        console.error("Failed to load planning:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [daysAhead, selectedRoomId]);

  const totalPlants = planning.reduce((sum, day) => sum + day.plants.length, 0);

  const formatDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) {
      return "Demain";
    }

    return date.toLocaleDateString("fr-BE", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Planning 📅</h1>
          <p className="text-muted-foreground">
            {totalPlants} plante{totalPlants !== 1 ? "s" : ""} à arroser
          </p>
        </div>

        <div className="mb-6 flex gap-3">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
              size="sm"
            >
              Semaine
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => setViewMode("month")}
              size="sm"
            >
              Mois
            </Button>
          </div>

          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">Toutes les pièces</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        {totalPlants === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aucune plante à arroser.</p>
            <Link href="/plantes/new">
              <Button>Ajouter une plante</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {planning.map((day) => {
              if (day.plants.length === 0) return null;

              return (
                <div key={day.date.toISOString()}>
                  <h2 className="text-lg font-semibold mb-3">
                    {formatDate(day.date)}
                  </h2>

                  <div className="space-y-3">
                    {day.plants.map((plant) => (
                      <Link
                        key={plant.plantId}
                        href={`/plantes/${plant.plantId}`}
                      >
                        <div className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-start gap-4">
                            {plant.coverPhotoPath && (
                              <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={plant.coverPhotoPath}
                                  alt={plant.plantName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">
                                {plant.plantName}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {plant.species.commonName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {plant.roomName}
                              </p>
                              {plant.daysOverdue > 0 && (
                                <p className="text-xs text-destructive mt-1">
                                  {plant.daysOverdue} j de retard
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
