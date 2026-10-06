"use client";

import { getSpeciesById, updateSpecies, deleteSpecies } from "@/app/actions/species";
import { SpeciesForm } from "@/components/SpeciesForm";
import { Button } from "@/components/ui/button";
import { SpeciesFormData } from "@/types/species";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Species } from "@prisma/client";

export default function SpeciesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const data = await getSpeciesById(id);
        setSpecies(data);
      } catch (err) {
        console.error("Failed to load species:", err);
        router.push("/especes");
      } finally {
        setLoading(false);
      }
    };

    loadSpecies();
  }, [id, router]);

  const handleSubmit = async (data: SpeciesFormData) => {
    await updateSpecies(id, data);
    router.push("/especes");
  };

  const handleDelete = async () => {
    if (
      !confirm("Êtes-vous sûr ? Cette action ne peut pas être annulée.")
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteSpecies(id);
      router.push("/especes");
    } catch (err) {
      alert((err as Error).message);
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

  if (!species) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Espèce non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{species.commonName}</h1>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
        <SpeciesForm species={species} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
