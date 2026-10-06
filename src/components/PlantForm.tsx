"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plant, Species, Room } from "@prisma/client";
import { PlantFormData } from "@/types/species";

interface PlantFormProps {
  plant?: Plant & { species?: Species; room?: Room };
  initialSpeciesId?: string;
  species: Species[];
  rooms: Room[];
  onSubmit: (data: PlantFormData) => Promise<void>;
}

export function PlantForm({
  plant,
  initialSpeciesId,
  species: speciesList,
  rooms: roomsList,
  onSubmit,
}: PlantFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: plant?.name || "",
    description: plant?.description || "",
    speciesId: plant?.speciesId || initialSpeciesId || "",
    roomId: plant?.roomId || "",
    potDiameterCm: plant?.potDiameterCm || "",
    potMaterial: plant?.potMaterial || "PLASTIC",
    acquiredAt: plant?.acquiredAt
      ? plant.acquiredAt.toISOString().split("T")[0]
      : "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData: PlantFormData = {
        ...formData,
        potDiameterCm: formData.potDiameterCm
          ? parseInt(formData.potDiameterCm as string)
          : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Nom</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          required
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="Ex: Le grand Monstera"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Espèce</label>
          <select
            value={formData.speciesId}
            onChange={(e) =>
              setFormData({ ...formData, speciesId: e.target.value })
            }
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Sélectionner une espèce</option>
            {speciesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.commonName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pièce</label>
          <select
            value={formData.roomId}
            onChange={(e) =>
              setFormData({ ...formData, roomId: e.target.value })
            }
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Sélectionner une pièce</option>
            {roomsList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
          rows={2}
          placeholder="Notes supplémentaires..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Diamètre pot (cm)
          </label>
          <input
            type="number"
            value={formData.potDiameterCm}
            onChange={(e) =>
              setFormData({ ...formData, potDiameterCm: e.target.value })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            placeholder="12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Matière</label>
          <select
            value={formData.potMaterial}
            onChange={(e) =>
              setFormData({
                ...formData,
                potMaterial: e.target.value as
                  | "PLASTIC"
                  | "TERRACOTTA"
                  | "GLAZED_CERAMIC"
                  | "OTHER",
              })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="PLASTIC">Plastique</option>
            <option value="TERRACOTTA">Terre cuite</option>
            <option value="GLAZED_CERAMIC">Céramique</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Acquise le</label>
          <input
            type="date"
            value={formData.acquiredAt}
            onChange={(e) =>
              setFormData({ ...formData, acquiredAt: e.target.value })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
