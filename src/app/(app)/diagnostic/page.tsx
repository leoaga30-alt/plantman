"use client";

import { getPlants } from "@/app/actions/plants";
import { generateDiagnosis } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";
import { DiagnosisResult } from "@/lib/ai/schemas";
import { Plant, Species } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const SYMPTOMS = [
  "Feuilles jaunes",
  "Feuilles brunes/sèches",
  "Feuilles molles",
  "Taches",
  "Chute de feuilles",
  "Tiges molles",
  "Moisissure sur terre",
  "Moucherons",
  "Cochenilles",
  "Toiles",
];

export default function DiagnosticPage() {
  const [plants, setPlants] = useState<(Plant & { species: Species })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPlants();
        setPlants(data);
      } catch (err) {
        console.error("Failed to load plants:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (!selectedPlantId || symptoms.length === 0) {
      setError("Sélectionner une plante et au moins un symptôme");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const diagnosis = await generateDiagnosis({
        plantId: selectedPlantId,
        symptoms,
        notes,
      });
      setResult(diagnosis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur du diagnostic");
    } finally {
      setSubmitting(false);
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Diagnostic 🔍</h1>
          <p className="text-muted-foreground">Analyser une plante en difficulté</p>
        </div>

        {!result ? (
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Plante</label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                <option value="">Choisir une plante</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species.commonName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Symptômes</label>
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOMS.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                      className="w-4 h-4 rounded border border-border"
                    />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations supplémentaires…"
                className="w-full px-3 py-2 rounded-md border border-border text-sm h-24"
              />
            </div>

            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? "Analyse en cours…" : "Analyser"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="font-medium">{result.summary}</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Confiance: <strong>{result.confidence}</strong>
                </p>
                <p>
                  Urgence: <strong>{result.urgency}</strong>
                </p>
              </div>
            </div>

            {result.likelyCauses && result.likelyCauses.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Causes probables :</p>
                <ul className="space-y-1 text-sm">
                  {result.likelyCauses.map((c, idx: number) => (
                    <li key={idx} className="p-2 bg-muted rounded">
                      <p className="font-medium">{c.cause}</p>
                      <p className="text-xs text-muted-foreground">{c.evidence}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.actions && result.actions.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Actions à entreprendre :</p>
                <ul className="space-y-1 text-sm list-disc pl-5">
                  {result.actions.map((a, idx: number) => (
                    <li key={idx}>{a.step}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/plantes">
              <Button variant="outline" className="w-full">
                Retour aux plantes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
