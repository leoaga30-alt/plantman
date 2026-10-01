"use client";

import { createPlant } from "@/app/actions/plants";
import { getSpecies } from "@/app/actions/species";
import { getRooms } from "@/app/actions/rooms";
import { PlantForm } from "@/components/PlantForm";
import { SpeciesSelector } from "@/components/SpeciesSelector";
import { PlantFormData } from "@/types/species";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Species, Room } from "@prisma/client";

export default function NewPlantPage() {
  const router = useRouter();
  const [species, setSpecies] = useState<Species[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [speciesData, roomsData] = await Promise.all([
          getSpecies(),
          getRooms(),
        ]);
        setSpecies(speciesData);
        setRooms(roomsData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectSpecies = async (speciesId: string) => {
    setSelectedSpeciesId(speciesId);
    // Refresh species list to get the newly created one if generated
    const updated = await getSpecies();
    setSpecies(updated);
  };

  const handleSubmit = async (data: PlantFormData) => {
    await createPlant(data);
    router.push("/plantes");
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
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Nouvelle plante</h1>

        {!selectedSpeciesId && (
          <SpeciesSelector onSelectSpecies={handleSelectSpecies} />
        )}

        {selectedSpeciesId && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Espèce sélectionnée. Compléter les infos :
            </p>
            <PlantForm
              initialSpeciesId={selectedSpeciesId}
              species={species}
              rooms={rooms}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
