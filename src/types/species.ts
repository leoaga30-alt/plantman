export interface CareSheet {
  summary: string;
  watering: {
    advice: string;
    method: string;
    underwateringSigns: string[];
    overwateringSigns: string[];
  };
  light: string;
  humidity: string;
  temperature: string;
  fertilizer: { period: string; frequency: string };
  repotting: string;
  maintenance: string[];
  toxicity: { pets: boolean; children: boolean; details: string };
  commonProblems: {
    symptom: string;
    likelyCause: string;
    fix: string;
  }[];
}

export interface SpeciesFormData {
  commonName: string;
  scientificName?: string;
  aliases: string[];
  waterNeed: "LOW" | "MEDIUM" | "HIGH";
  intervalSpring: number;
  intervalSummer: number;
  intervalAutumn: number;
  intervalWinter: number;
  minTemp?: number;
  lightPref: "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN";
  humidityPref: "DRY" | "NORMAL" | "HUMID";
  winterRest: boolean;
  care: CareSheet;
  validated: boolean;
}

export interface PlantFormData {
  name: string;
  description?: string;
  speciesId: string;
  roomId: string;
  potDiameterCm?: number;
  potMaterial: "PLASTIC" | "TERRACOTTA" | "GLAZED_CERAMIC" | "OTHER";
  acquiredAt?: string;
}
