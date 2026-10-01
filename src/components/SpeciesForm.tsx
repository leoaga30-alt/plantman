"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Species } from "@prisma/client";
import { CareSheet, SpeciesFormData } from "@/types/species";

interface SpeciesFormProps {
  species?: Species;
  onSubmit: (data: SpeciesFormData) => Promise<void>;
}

export function SpeciesForm({ species, onSubmit }: SpeciesFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    commonName: species?.commonName || "",
    scientificName: species?.scientificName || "",
    aliases: species?.aliases?.join(", ") || "",
    waterNeed: species?.waterNeed || "MEDIUM",
    intervalSpring: species?.intervalSpring || 7,
    intervalSummer: species?.intervalSummer || 7,
    intervalAutumn: species?.intervalAutumn || 7,
    intervalWinter: species?.intervalWinter || 14,
    minTemp: species?.minTemp || "",
    lightPref: species?.lightPref || "MEDIUM",
    humidityPref: species?.humidityPref || "NORMAL",
    winterRest: species?.winterRest || false,
    validated: species?.validated || false,
  });

  const [careSheet, setCareSheet] = useState<CareSheet>(
    species?.care && typeof species.care === "object"
      ? (species.care as unknown as CareSheet)
      : {
          summary: "",
          watering: {
            advice: "",
            method: "",
            underwateringSigns: [],
            overwateringSigns: [],
          },
          light: "",
          humidity: "",
          temperature: "",
          fertilizer: { period: "", frequency: "" },
          repotting: "",
          maintenance: [],
          toxicity: { pets: false, children: false, details: "" },
          commonProblems: [],
        }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const aliasArray = formData.aliases
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      const submitData: SpeciesFormData = {
        ...formData,
        aliases: aliasArray,
        minTemp: formData.minTemp ? parseFloat(formData.minTemp as string) : undefined,
        care: careSheet,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nom commun
            </label>
            <input
              type="text"
              value={formData.commonName}
              onChange={(e) =>
                setFormData({ ...formData, commonName: e.target.value })
              }
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nom scientifique
            </label>
            <input
              type="text"
              value={formData.scientificName}
              onChange={(e) =>
                setFormData({ ...formData, scientificName: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Aliases (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.aliases}
              onChange={(e) =>
                setFormData({ ...formData, aliases: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="Ficus, Fig tree"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Besoins en eau</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Besoin</label>
            <select
              value={formData.waterNeed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  waterNeed: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="LOW">Bas</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HIGH">Élevé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Repos hivernal
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.winterRest}
                onChange={(e) =>
                  setFormData({ ...formData, winterRest: e.target.checked })
                }
                disabled={loading}
                className="w-4 h-4"
              />
              <span className="text-sm">Repos au sec l&apos;hiver</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Intervalles d&apos;arrosage</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Printemps</label>
            <input
              type="number"
              value={formData.intervalSpring}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  intervalSpring: parseInt(e.target.value),
                })
              }
              disabled={loading}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Été</label>
            <input
              type="number"
              value={formData.intervalSummer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  intervalSummer: parseInt(e.target.value),
                })
              }
              disabled={loading}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Automne</label>
            <input
              type="number"
              value={formData.intervalAutumn}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  intervalAutumn: parseInt(e.target.value),
                })
              }
              disabled={loading}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hiver</label>
            <input
              type="number"
              value={formData.intervalWinter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  intervalWinter: parseInt(e.target.value),
                })
              }
              disabled={loading}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Conditions</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lumière</label>
            <select
              value={formData.lightPref}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lightPref: e.target.value as
                    | "LOW"
                    | "MEDIUM"
                    | "BRIGHT"
                    | "DIRECT_SUN",
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
              value={formData.humidityPref}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  humidityPref: e.target.value as "DRY" | "NORMAL" | "HUMID",
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Température minimale (°C)
            </label>
            <input
              type="number"
              value={formData.minTemp}
              onChange={(e) =>
                setFormData({ ...formData, minTemp: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              step="0.5"
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={formData.validated}
                onChange={(e) =>
                  setFormData({ ...formData, validated: e.target.checked })
                }
                disabled={loading}
                className="w-4 h-4"
              />
              Validée
            </label>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Fiche d&apos;entretien</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Résumé</label>
            <textarea
              value={careSheet.summary}
              onChange={(e) =>
                setCareSheet({ ...careSheet, summary: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Conseils d&apos;arrosage
            </label>
            <textarea
              value={careSheet.watering.advice}
              onChange={(e) =>
                setCareSheet({
                  ...careSheet,
                  watering: {
                    ...careSheet.watering,
                    advice: e.target.value,
                  },
                })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Lumière
            </label>
            <textarea
              value={careSheet.light}
              onChange={(e) =>
                setCareSheet({ ...careSheet, light: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Humidité
            </label>
            <textarea
              value={careSheet.humidity}
              onChange={(e) =>
                setCareSheet({ ...careSheet, humidity: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Température
            </label>
            <textarea
              value={careSheet.temperature}
              onChange={(e) =>
                setCareSheet({ ...careSheet, temperature: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rempotage
            </label>
            <textarea
              value={careSheet.repotting}
              onChange={(e) =>
                setCareSheet({ ...careSheet, repotting: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Toxicité - Détails
            </label>
            <textarea
              value={careSheet.toxicity.details}
              onChange={(e) =>
                setCareSheet({
                  ...careSheet,
                  toxicity: {
                    ...careSheet.toxicity,
                    details: e.target.value,
                  },
                })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={careSheet.toxicity.pets}
                onChange={(e) =>
                  setCareSheet({
                    ...careSheet,
                    toxicity: {
                      ...careSheet.toxicity,
                      pets: e.target.checked,
                    },
                  })
                }
                disabled={loading}
                className="w-4 h-4"
              />
              Toxique pour les animaux
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={careSheet.toxicity.children}
                onChange={(e) =>
                  setCareSheet({
                    ...careSheet,
                    toxicity: {
                      ...careSheet.toxicity,
                      children: e.target.checked,
                    },
                  })
                }
                disabled={loading}
                className="w-4 h-4"
              />
              Toxique pour les enfants
            </label>
          </div>
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
