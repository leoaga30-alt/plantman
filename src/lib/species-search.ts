import { prisma } from "@/lib/db";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export async function findExistingSpecies(
  commonName: string
): Promise<{ id: string; commonName: string; scientificName: string | null } | null> {
  const normalized = normalize(commonName);

  const species = await prisma.species.findMany();

  for (const s of species) {
    if (normalize(s.commonName) === normalized) {
      return {
        id: s.id,
        commonName: s.commonName,
        scientificName: s.scientificName,
      };
    }

    if (s.scientificName && normalize(s.scientificName) === normalized) {
      return {
        id: s.id,
        commonName: s.commonName,
        scientificName: s.scientificName,
      };
    }

    for (const alias of s.aliases) {
      if (normalize(alias) === normalized) {
        return {
          id: s.id,
          commonName: s.commonName,
          scientificName: s.scientificName,
        };
      }
    }
  }

  return null;
}
