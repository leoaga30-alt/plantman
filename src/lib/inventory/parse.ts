import { z } from "zod";

// Pure parser for data/inventaire.md (no Prisma, no Next).

const LIGHT = {
  faible: "LOW",
  moyenne: "MEDIUM",
  vive: "BRIGHT",
  "soleil direct": "DIRECT_SUN",
} as const;

const HUMIDITY = { seche: "DRY", normale: "NORMAL", humide: "HUMID" } as const;

const YES_NO = { oui: true, non: false } as const;

const POT_MATERIALS: [RegExp, "PLASTIC" | "TERRACOTTA" | "GLAZED_CERAMIC" | "OTHER"][] = [
  [/plastique/, "PLASTIC"],
  [/terre ?cuite|terracotta/, "TERRACOTTA"],
  [/ceramique|emaille|gres/, "GLAZED_CERAMIC"],
  [/autre/, "OTHER"],
];

const RoomEntrySchema = z.object({
  name: z.string().min(1, "nom manquant"),
  light: z.enum(["LOW", "MEDIUM", "BRIGHT", "DIRECT_SUN"]),
  humidity: z.enum(["DRY", "NORMAL", "HUMID"]),
  tempSummer: z.number().min(-50).max(50),
  tempWinter: z.number().min(-50).max(50),
  nearHeater: z.boolean(),
  notes: z.string().optional(),
});

const PlantEntrySchema = z.object({
  name: z.string().min(1, "surnom manquant"),
  species: z.string().min(1, "espèce manquante"),
  room: z.string().min(1, "pièce manquante"),
  potDiameterCm: z.number().int().positive().optional(),
  potMaterial: z.enum(["PLASTIC", "TERRACOTTA", "GLAZED_CERAMIC", "OTHER"]).optional(),
  description: z.string().optional(),
});

export type RoomEntry = z.infer<typeof RoomEntrySchema>;
export type PlantEntry = z.infer<typeof PlantEntrySchema>;

export interface Inventory {
  rooms: RoomEntry[];
  plants: PlantEntry[];
  /** Unique botanical names, first spelling kept. */
  species: string[];
}

export class InventoryError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Inventaire invalide :\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "InventoryError";
  }
}

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function pick<T>(map: Record<string, T>, value: string, label: string): T {
  const found = map[normalize(value)];
  if (found === undefined) {
    throw new Error(
      `${label} inconnu(e) « ${value} » (attendu : ${Object.keys(map).join(" / ")})`
    );
  }
  return found;
}

function toNumber(value: string, label: string): number {
  const n = Number(value.replace(",", "."));
  if (value.trim() === "" || Number.isNaN(n)) {
    throw new Error(`${label} invalide « ${value} »`);
  }
  return n;
}

function parsePot(raw: string): Pick<PlantEntry, "potDiameterCm" | "potMaterial"> {
  const text = raw.trim();
  if (!text) return {};

  const diameter = text.match(/(\d+(?:[.,]\d+)?)\s*(?:cm)?/i);
  const rest = normalize(text.replace(diameter?.[0] ?? "", "")).replace(/[+,]/g, " ").trim();

  let potMaterial: PlantEntry["potMaterial"];
  if (rest) {
    potMaterial = POT_MATERIALS.find(([pattern]) => pattern.test(rest))?.[1];
    if (!potMaterial) {
      throw new Error(`matière de pot inconnue « ${rest} » (plastique / terre cuite / céramique / autre)`);
    }
  }

  return {
    potDiameterCm: diameter ? Math.round(toNumber(diameter[1], "diamètre du pot")) : undefined,
    potMaterial,
  };
}

function splitColumns(line: string, expected: number): string[] {
  const cols = line.split("|").map((c) => c.trim());
  const extra = cols.slice(expected).filter(Boolean);
  if (extra.length > 0) {
    throw new Error(`trop de colonnes (${expected} attendues) — un « | » dans une remarque ?`);
  }
  while (cols.length < expected) cols.push("");
  return cols.slice(0, expected);
}

function parseRoom(line: string): RoomEntry {
  const [name, light, summer, winter, humidity, heater, notes] = splitColumns(line, 7);
  return RoomEntrySchema.parse({
    name,
    light: pick(LIGHT, light, "lumière"),
    humidity: pick(HUMIDITY, humidity, "humidité"),
    tempSummer: toNumber(summer, "température d'été"),
    tempWinter: toNumber(winter, "température d'hiver"),
    nearHeater: pick(YES_NO, heater, "radiateur"),
    notes: notes || undefined,
  });
}

function parsePlant(line: string): PlantEntry {
  const [name, species, room, pot, notes] = splitColumns(line, 5);
  return PlantEntrySchema.parse({
    name,
    species,
    room,
    ...parsePot(pot),
    description: notes || undefined,
  });
}

function zodMessage(err: unknown): string {
  if (err instanceof z.ZodError) {
    return err.issues.map((i) => `${i.path.join(".") || "ligne"} : ${i.message}`).join(", ");
  }
  return err instanceof Error ? err.message : String(err);
}

export function parseInventory(markdown: string): Inventory {
  // Blank out <!-- --> comments but keep line numbers for error messages.
  const text = markdown.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ""));

  const rooms: RoomEntry[] = [];
  const plants: PlantEntry[] = [];
  const problems: string[] = [];
  let section: "rooms" | "plants" | null = null;

  text.split("\n").forEach((raw, index) => {
    const line = raw.trim();
    const where = `ligne ${index + 1}`;

    if (!line || line.startsWith(">") || /^#\s/.test(line)) return;

    if (line.startsWith("##")) {
      const title = normalize(line.replace(/^#+/, ""));
      if (title.startsWith("piece")) section = "rooms";
      else if (title.startsWith("plante")) section = "plants";
      else {
        section = null;
        problems.push(`${where} : section inconnue « ${line} »`);
      }
      return;
    }

    if (!section) {
      problems.push(`${where} : ligne hors section « ${line} »`);
      return;
    }

    try {
      if (section === "rooms") rooms.push(parseRoom(line));
      else plants.push(parsePlant(line));
    } catch (err) {
      problems.push(`${where} : ${zodMessage(err)}`);
    }
  });

  const roomNames = new Set<string>();
  for (const room of rooms) {
    const key = normalize(room.name);
    if (roomNames.has(key)) problems.push(`pièce en double « ${room.name} »`);
    roomNames.add(key);
  }

  const plantNames = new Set<string>();
  for (const plant of plants) {
    if (!roomNames.has(normalize(plant.room))) {
      problems.push(`plante « ${plant.name} » : pièce inconnue « ${plant.room} »`);
    }
    const key = normalize(plant.name);
    if (plantNames.has(key)) problems.push(`plante en double « ${plant.name} »`);
    plantNames.add(key);
  }

  if (problems.length > 0) throw new InventoryError(problems);

  const species = new Map<string, string>();
  for (const plant of plants) {
    const key = normalize(plant.species);
    if (!species.has(key)) species.set(key, plant.species);
  }

  return { rooms, plants, species: [...species.values()] };
}
