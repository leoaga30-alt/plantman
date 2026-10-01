"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Room } from "@prisma/client";

interface RoomFormProps {
  room?: Room;
  onSubmit: (data: {
    name: string;
    light: "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN";
    humidity: "DRY" | "NORMAL" | "HUMID";
    tempSummer: number;
    tempWinter: number;
    nearHeater: boolean;
    notes?: string;
  }) => Promise<void>;
}

export function RoomForm({ room, onSubmit }: RoomFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: room?.name || "",
    light: room?.light || "MEDIUM",
    humidity: room?.humidity || "NORMAL",
    tempSummer: room?.tempSummer || 22,
    tempWinter: room?.tempWinter || 20,
    nearHeater: room?.nearHeater || false,
    notes: room?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Nom de la pièce</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          disabled={loading}
          required
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="Salon, Chambre, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Lumière</label>
          <select
            value={formData.light}
            onChange={(e) =>
              setFormData({
                ...formData,
                light: e.target.value as "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN",
              })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="BRIGHT">Vive</option>
            <option value="DIRECT_SUN">Soleil direct</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Humidité</label>
          <select
            value={formData.humidity}
            onChange={(e) =>
              setFormData({
                ...formData,
                humidity: e.target.value as "DRY" | "NORMAL" | "HUMID",
              })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="DRY">Sèche</option>
            <option value="NORMAL">Normale</option>
            <option value="HUMID">Humide</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Température été (°C)
          </label>
          <input
            type="number"
            value={formData.tempSummer}
            onChange={(e) =>
              setFormData({
                ...formData,
                tempSummer: parseFloat(e.target.value),
              })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Température hiver (°C)
          </label>
          <input
            type="number"
            value={formData.tempWinter}
            onChange={(e) =>
              setFormData({
                ...formData,
                tempWinter: parseFloat(e.target.value),
              })
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            step="0.1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="nearHeater"
          checked={formData.nearHeater}
          onChange={(e) =>
            setFormData({ ...formData, nearHeater: e.target.checked })
          }
          disabled={loading}
          className="w-4 h-4"
        />
        <label htmlFor="nearHeater" className="text-sm font-medium">
          Radiateur proche
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Remarques</label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          disabled={loading}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
          rows={3}
          placeholder="Notes supplémentaires sur la pièce..."
        />
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
