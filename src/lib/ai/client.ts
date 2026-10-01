import Anthropic from "@anthropic-ai/sdk";
import { SpeciesProfileSchema, DiagnosisResultSchema, SpeciesProfile, DiagnosisResult } from "./schemas";
import { getMockProfile, mockDiagnosisResult } from "./mock";

const isMock = process.env.AI_MOCK === "true";

const client = isMock
  ? null
  : new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

const MODEL_PROFILE = process.env.AI_MODEL_PROFILE || "claude-haiku-4-5-20251001";
const MODEL_DIAGNOSIS =
  process.env.AI_MODEL_DIAGNOSIS || "claude-haiku-4-5-20251001";

export async function generateSpeciesProfile(
  commonName: string
): Promise<{
  profile: SpeciesProfile;
  tokensUsed: { input: number; output: number };
}> {
  if (isMock) {
    const mockProfile = getMockProfile(commonName);
    if (mockProfile) {
      return {
        profile: mockProfile,
        tokensUsed: { input: 0, output: 0 },
      };
    }
    // Return a generic mock for unmapped names
    return {
      profile: {
        status: "ok",
        commonName,
        scientificName: `${commonName} sp.`,
        aliases: [],
        waterNeed: "MEDIUM",
        intervals: { spring: 7, summer: 7, autumn: 7, winter: 14 },
        minTemp: 15,
        lightPref: "MEDIUM",
        humidityPref: "NORMAL",
        winterRest: false,
        care: {
          summary: `Plante ${commonName}. Besoins modérés en eau et lumière.`,
          watering: {
            advice: "Arroser quand le terreau est sec en surface",
            method: "Trempage",
            underwateringSigns: ["Feuilles molles"],
            overwateringSigns: ["Jaunissement"],
          },
          light: "Lumière indirecte moyenne",
          humidity: "Humidité normale",
          temperature: "15–25 °C",
          fertilizer: { period: "Printemps-été", frequency: "1 fois par mois" },
          repotting: "Tous les 2 ans",
          maintenance: [],
          toxicity: { pets: false, children: false, details: "Non toxique" },
          commonProblems: [],
        },
        confidence: 0.5,
      },
      tokensUsed: { input: 0, output: 0 },
    };
  }

  if (!client) {
    throw new Error("Anthropic client not initialized and AI_MOCK not enabled");
  }

  const prompt = `Tu es un expert en plantes d'intérieur. Génère un profil détaillé pour: "${commonName}".

Contexte: Belgique, hémisphère nord, plante d'intérieur.

Renvoie UNIQUEMENT du JSON valide (pas de markdown, pas de texte extra), conforme à ce schéma:
{
  "status": "ok" ou "ambiguous",
  "candidates": optionnel si ambigu (array de {commonName, scientificName}),
  "commonName": string,
  "scientificName": string ou null,
  "aliases": array de string,
  "waterNeed": "LOW" | "MEDIUM" | "HIGH",
  "intervals": {spring, summer, autumn, winter} en jours (1-60),
  "minTemp": number,
  "lightPref": "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN",
  "humidityPref": "DRY" | "NORMAL" | "HUMID",
  "winterRest": boolean,
  "care": {
    "summary": 2-3 phrases,
    "watering": {advice, method, underwateringSigns[], overwateringSigns[]},
    "light": string,
    "humidity": string,
    "temperature": string,
    "fertilizer": {period, frequency},
    "repotting": string,
    "maintenance": array de string,
    "toxicity": {pets: bool, children: bool, details: string},
    "commonProblems": array de {symptom, likelyCause, fix}
  },
  "confidence": 0-1
}

Contenu en français. Intervalles aux conditions de référence (20°C, lumière moyenne, humidité normale, pot plastique 12-25cm).`;

  const response = await client.messages.create({
    model: MODEL_PROFILE,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const parsed = JSON.parse(content.text);
  const validated = SpeciesProfileSchema.parse(parsed);

  return {
    profile: validated,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  };
}

export async function generateDiagnosis(
  plantContext: string,
  symptoms: string[],
  notes: string,
  photoDescriptions?: string[]
): Promise<{
  result: DiagnosisResult;
  tokensUsed: { input: number; output: number };
}> {
  if (isMock) {
    return {
      result: mockDiagnosisResult,
      tokensUsed: { input: 0, output: 0 },
    };
  }

  if (!client) {
    throw new Error("Anthropic client not initialized and AI_MOCK not enabled");
  }

  const prompt = `Tu es un vétérinaire des plantes. Diagnostic basé sur:
${plantContext}

Symptômes observés: ${symptoms.join(", ")}
Notes: ${notes}
${photoDescriptions ? `Descriptions photos: ${photoDescriptions.join("; ")}` : ""}

Renvoie UNIQUEMENT du JSON valide (pas de markdown):
{
  "summary": string,
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "likelyCauses": [{cause, probability (0-1), evidence}, ...],
  "actions": [{step, when: "NOW" | "THIS_WEEK" | "ONGOING"}, ...],
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "wateringAdjustment": {factor (0.5-2), reason} ou null,
  "pestsSuspected": boolean,
  "isolatePlant": boolean,
  "followUp": string,
  "betterPhotoNeeded": string ou null
}

Contenu en français.`;

  const response = await client.messages.create({
    model: MODEL_DIAGNOSIS,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const parsed = JSON.parse(content.text);
  const validated = DiagnosisResultSchema.parse(parsed);

  return {
    result: validated,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  };
}
