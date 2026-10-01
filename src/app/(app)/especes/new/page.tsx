"use client";

import { createSpecies } from "@/app/actions/species";
import { SpeciesForm } from "@/components/SpeciesForm";
import { useRouter } from "next/navigation";
import { SpeciesFormData } from "@/types/species";

export default function NewSpeciesPage() {
  const router = useRouter();

  const handleSubmit = async (data: SpeciesFormData) => {
    await createSpecies(data);
    router.push("/especes");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Nouvelle espèce</h1>
        <SpeciesForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
