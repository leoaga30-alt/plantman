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
    setSubmitting(true);
    try {
      await addFertilizer(plantId, note);
      const updated = await getPlantEvents(plantId);
      setEvents(updated);
      setNote("");
      setShowFertilizerForm(false);
    } catch (err) {
      console.error("Failed to add fertilizer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepotting = async () => {
    setSubmitting(true);
    try {
      await addRepotting(plantId, note);
      const updated = await getPlantEvents(plantId);
      setEvents(updated);
      setNote("");
      setShowRepottingForm(false);
    } catch (err) {
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
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFertilizerForm(!showFertilizerForm)}
        >
          + Engrais
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRepottingForm(!showRepottingForm)}
        >
          + Rempotage
        </Button>
      </div>

      {showFertilizerForm && (
        <div className="p-4 border border-border rounded-lg space-y-2">
          <p className="text-sm font-medium">Ajouter un engrais</p>
          <input
            type="text"
            placeholder="Type d'engrais, dosage…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleFertilizer}
              disabled={submitting}
            >
              Ajouter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFertilizerForm(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {showRepottingForm && (
        <div className="p-4 border border-border rounded-lg space-y-2">
          <p className="text-sm font-medium">Ajouter un rempotage</p>
          <input
            type="text"
            placeholder="Nouveau pot, terreau…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRepotting}
              disabled={submitting}
            >
              Ajouter
            </Button>
            <Button
              size="sm"
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
