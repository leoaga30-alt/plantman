"use client";

import {
  addFertilizer,
  addRepotting,
  getPlantEvents,
  CareEventItem,
} from "@/app/actions/watering";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface PlantJournalProps {
  plantId: string;
}

export function PlantJournal({ plantId }: PlantJournalProps) {
  const [events, setEvents] = useState<CareEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFertilizerForm, setShowFertilizerForm] = useState(false);
  const [showRepottingForm, setShowRepottingForm] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getPlantEvents(plantId);
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [plantId]);

  const handleFertilizer = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await addFertilizer(plantId, note);
      const updated = await getPlantEvents(plantId);
      setEvents(updated);
      setNote("");
      setShowFertilizerForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'ajout";
      setError(message);
      console.error("Failed to add fertilizer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepotting = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await addRepotting(plantId, note);
      const updated = await getPlantEvents(plantId);
      setEvents(updated);
      setNote("");
      setShowRepottingForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'ajout";
      setError(message);
      console.error("Failed to add repotting:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatType = (type: string): string => {
    const typeMap: Record<string, string> = {
      WATER: "Arrosé",
      SKIP: "Arrosage sauté",
      FERTILIZE: "Engrais",
      REPOT: "Rempotage",
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      WATER: "text-green-600",
      SKIP: "text-blue-600",
      FERTILIZE: "text-yellow-600",
      REPOT: "text-purple-600",
    };
    return colorMap[type] || "";
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => setShowFertilizerForm(!showFertilizerForm)}
        >
          + Engrais
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowRepottingForm(!showRepottingForm)}
        >
          + Rempotage
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {showFertilizerForm && (
        <div className="p-4 border border-border rounded-lg space-y-3">
          <div>
            <label htmlFor="fertilizer-note" className="block text-sm font-medium mb-2">
              Ajouter un engrais
            </label>
            <input
              id="fertilizer-note"
              type="text"
              placeholder="Type d'engrais, dosage…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFertilizer}
              disabled={submitting}
            >
              Ajouter
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFertilizerForm(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {showRepottingForm && (
        <div className="p-4 border border-border rounded-lg space-y-3">
          <div>
            <label htmlFor="repotting-note" className="block text-sm font-medium mb-2">
              Ajouter un rempotage
            </label>
            <input
              id="repotting-note"
              type="text"
              placeholder="Nouveau pot, terreau…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRepotting}
              disabled={submitting}
            >
              Ajouter
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRepottingForm(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun événement</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex justify-between items-start gap-2">
                <p className={`font-medium ${getTypeColor(event.type)}`}>
                  {formatType(event.type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.at.toLocaleDateString("fr-BE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {event.note && (
                <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {event.memberName}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
