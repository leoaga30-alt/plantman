"use client";

import { getOrGenerateSpecies, createSpeciesFromProfile } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";
import { SpeciesProfile } from "@/lib/ai/schemas";
import { useState } from "react";

interface SpeciesSelectorProps {
  onSelectSpecies: (speciesId: string) => void;
}

export function SpeciesSelector({ onSelectSpecies }: SpeciesSelectorProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SpeciesProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setResult(null);

    try {
      const res = await getOrGenerateSpecies(query);

      if (res.found && res.speciesId) {
        onSelectSpecies(res.speciesId);
      } else if (res.profile) {
        setResult(res.profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  };

  const handleCreateFromProfile = async () => {
    if (!result) return;

    setSearching(true);
    try {
      const species = await createSpeciesFromProfile(result);
      onSelectSpecies(species.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCandidate = async (candidate: { commonName: string; scientificName: string }) => {
    if (!result) return;
    setSearching(true);
    try {
      const updated = { ...result, ...candidate, status: "ok" as const };
      const species = await createSpeciesFromProfile(updated);
      onSelectSpecies(species.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom de l&apos;espèce</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Monstera, Pothos, Ficus…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3 py-2 rounded-md border border-border text-sm"
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? "…" : "Chercher"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {result && result.status === "ambiguous" && result.candidates && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Plante ambiguë. Choisir :</p>
          <div className="space-y-2">
            {result.candidates.map((c, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelectCandidate(c)}
                className="w-full p-2 text-left rounded border border-border hover:bg-background text-sm"
              >
                <p className="font-medium">{c.commonName}</p>
                <p className="text-xs text-muted-foreground">{c.scientificName}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {result && result.status === "ok" && (
        <div className="space-y-2 border-t pt-4">
          <div className="p-3 bg-background rounded">
            <p className="font-medium text-sm">{result.commonName}</p>
            <p className="text-xs text-muted-foreground">{result.scientificName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Confiance: {Math.round(result.confidence * 100)}%
            </p>
          </div>
          <Button onClick={handleCreateFromProfile} disabled={searching} className="w-full">
            {searching ? "Création…" : "Utiliser cette fiche"}
          </Button>
        </div>
      )}

      {!result && (
        <div className="text-xs text-muted-foreground">
          <p>Saisir un nom pour chercher ou générer une fiche (via IA).</p>
        </div>
      )}
    </div>
  );
}
