import { z } from "zod";

export const CareSheetSchema = z.object({
  summary: z.string(),
  watering: z.object({
    advice: z.string(),
    method: z.string(),
    underwateringSigns: z.array(z.string()),
    overwateringSigns: z.array(z.string()),
  }),
  light: z.string(),
  humidity: z.string(),
  temperature: z.string(),
  fertilizer: z.object({
    period: z.string(),
    frequency: z.string(),
  }),
  repotting: z.string(),
  maintenance: z.array(z.string()),
  toxicity: z.object({
    pets: z.boolean(),
    children: z.boolean(),
    details: z.string(),
  }),
  commonProblems: z.array(
    z.object({
      symptom: z.string(),
      likelyCause: z.string(),
      fix: z.string(),
    })
  ),
});

export type CareSheet = z.infer<typeof CareSheetSchema>;

export const SpeciesProfileSchema = z.object({
  status: z.enum(["ok", "ambiguous"]),
  candidates: z
    .array(
      z.object({
        commonName: z.string(),
        scientificName: z.string(),
      })
    )
    .optional(),
  commonName: z.string(),
  scientificName: z.string().optional(),
  aliases: z.array(z.string()),
  waterNeed: z.enum(["LOW", "MEDIUM", "HIGH"]),
  intervals: z.object({
    spring: z.number().min(1).max(60),
    summer: z.number().min(1).max(60),
    autumn: z.number().min(1).max(60),
    winter: z.number().min(1).max(60),
  }),
  minTemp: z.number(),
  lightPref: z.enum(["LOW", "MEDIUM", "BRIGHT", "DIRECT_SUN"]),
  humidityPref: z.enum(["DRY", "NORMAL", "HUMID"]),
  winterRest: z.boolean(),
  care: CareSheetSchema,
  confidence: z.number().min(0).max(1),
});

export type SpeciesProfile = z.infer<typeof SpeciesProfileSchema>;

export const DiagnosisResultSchema = z.object({
  summary: z.string(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  likelyCauses: z.array(
    z.object({
      cause: z.string(),
      probability: z.number(),
      evidence: z.string(),
    })
  ),
  actions: z.array(
    z.object({
      step: z.string(),
      when: z.enum(["NOW", "THIS_WEEK", "ONGOING"]),
    })
  ),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
  wateringAdjustment: z
    .object({
      factor: z.number().min(0.5).max(2),
      reason: z.string(),
    })
    .nullable(),
  pestsSuspected: z.boolean(),
  isolatePlant: z.boolean(),
  followUp: z.string(),
  betterPhotoNeeded: z.string().nullable(),
});

export type DiagnosisResult = z.infer<typeof DiagnosisResultSchema>;
