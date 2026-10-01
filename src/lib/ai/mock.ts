import { SpeciesProfile, DiagnosisResult } from "./schemas";

export const mockSpeciesProfiles: Record<string, SpeciesProfile> = {
  monstera: {
    status: "ok",
    commonName: "Monstera",
    scientificName: "Monstera deliciosa",
    aliases: ["Cheese Plant", "Plante à trous"],
    waterNeed: "MEDIUM",
    intervals: {
      spring: 7,
      summer: 7,
      autumn: 7,
      winter: 14,
    },
    minTemp: 13,
    lightPref: "MEDIUM",
    humidityPref: "NORMAL",
    winterRest: false,
    care: {
      summary:
        "Plante tropicale robuste avec feuilles aérées. Préfère une lumière indirecte moyenne et un arrosage modéré. Très tolérant aux conditions intérieures.",
      watering: {
        advice: "Arroser quand le terreau est sec en surface (2-3 cm). Réduire en hiver.",
        method: "Trempage ou versement, laisser drainer complètement",
        underwateringSigns: ["Feuilles molles", "Croissance ralentie"],
        overwateringSigns: ["Racines pourries", "Jaunissement des feuilles", "Odeur de moisi"],
      },
      light: "Lumière indirecte moyenne. Tolère l'ombre. Évite le soleil direct qui brûle les feuilles.",
      humidity: "Humidité normale (40-60%). Vaporiser occasionnellement pour nettoyer.",
      temperature: "18–28 °C. Minimum 13 °C.",
      fertilizer: {
        period: "Printemps-été",
        frequency: "1 fois par mois avec un engrais dilué",
      },
      repotting: "Tous les 2 ans au printemps dans un pot 2-3 cm plus grand",
      maintenance: ["Nettoyer les feuilles mensuellement", "Tailler pour contrôler la forme"],
      toxicity: {
        pets: true,
        children: true,
        details: "Sève irritante. Peut causer des dérangements digestifs chez les animaux et enfants.",
      },
      commonProblems: [
        {
          symptom: "Feuilles jaunes",
          likelyCause: "SurArrosage ou mauvais drainage",
          fix: "Laisser sécher, améliorer drainage, vérifier pourriture racinaire",
        },
        {
          symptom: "Nouvelles feuilles petites",
          likelyCause: "Lumière insuffisante ou faim de nutriments",
          fix: "Augmenter lumière ou fertiliser régulièrement",
        },
      ],
    },
    confidence: 0.95,
  },

  pothos: {
    status: "ok",
    commonName: "Pothos",
    scientificName: "Epipremnum aureum",
    aliases: ["Lierre du Diable", "Plante Araignée d'Or"],
    waterNeed: "LOW",
    intervals: {
      spring: 5,
      summer: 5,
      autumn: 7,
      winter: 10,
    },
    minTemp: 12,
    lightPref: "LOW",
    humidityPref: "NORMAL",
    winterRest: false,
    care: {
      summary:
        "Plante grimpante très facile, presque indestructible. Tolère des conditions de lumière faible et une sécheresse modérée.",
      watering: {
        advice: "Arroser lorsque le terreau est sec. Très tolérant à la sous-arrosage.",
        method: "Trempage, laisser drainer",
        underwateringSigns: ["Tiges molles"],
        overwateringSigns: ["Jaunissement des feuilles", "Odeur de pourri"],
      },
      light: "Tolère tout, y compris l'ombre partielle. Croissance plus rapide avec lumière indirecte.",
      humidity: "Basse à normale. Pas très exigeant.",
      temperature: "15–28 °C. Minimum 12 °C.",
      fertilizer: {
        period: "Printemps-été",
        frequency: "1 fois tous les 2 mois",
      },
      repotting: "Tous les 2-3 ans, ou quand racinaire visible en surface",
      maintenance: ["Pincer pour ramifier", "Nettoyer poussière"],
      toxicity: {
        pets: true,
        children: true,
        details: "Toxique si ingéré. Irritation buccale et gastrique.",
      },
      commonProblems: [
        {
          symptom: "Feuilles petites et espacées",
          likelyCause: "Lumière insuffisante",
          fix: "Déplacer vers plus de lumière",
        },
      ],
    },
    confidence: 0.92,
  },
};

export const mockDiagnosisResult: DiagnosisResult = {
  summary:
    "La plante présente des signes typiques de surArrosage avec possible pourriture racinaire. Vérifier les racines immédiatement.",
  confidence: "HIGH",
  likelyCauses: [
    {
      cause: "SurArrosage ou mauvais drainage",
      probability: 0.85,
      evidence: "Feuilles jaunes, terreau humide, odeur de moisi",
    },
    {
      cause: "Luminosité insuffisante",
      probability: 0.3,
      evidence: "Croissance ralentie, feuilles petites",
    },
  ],
  actions: [
    {
      step: "Vérifier les racines en sortant la plante du pot",
      when: "NOW",
    },
    {
      step: "Si racines noires/molles : rempoter dans une terre sèche après couper les racines mortes",
      when: "NOW",
    },
    {
      step: "Réduire fréquence d'arrosage",
      when: "ONGOING",
    },
  ],
  urgency: "MEDIUM",
  wateringAdjustment: {
    factor: 1.5,
    reason: "Intervalles allongés pour éviter future surArrosage",
  },
  pestsSuspected: false,
  isolatePlant: false,
  followUp: "Vérifier la récupération dans 2 semaines",
  betterPhotoNeeded: "Photos des racines et du terreau",
};

export function getMockProfile(commonName: string): SpeciesProfile | null {
  const key = commonName.toLowerCase();
  for (const [mockKey, profile] of Object.entries(mockSpeciesProfiles)) {
    if (
      mockKey === key ||
      profile.commonName.toLowerCase() === key ||
      profile.aliases.some((a) => a.toLowerCase() === key)
    ) {
      return profile;
    }
  }
  return null;
}
