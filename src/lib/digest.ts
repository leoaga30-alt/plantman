import { formatDayLong, type DayKey } from "./dates";
import { DEFAULT_POT_DIAMETER_CM, formatQuantity } from "./watering/quantity";

// Daily reminder email: which plants to water today, and how much. Pure: no I/O.

export interface DigestPlant {
  name: string;
  room: string;
  species: string;
  overdueDays: number;
  quantityMl: number;
  /** The pot diameter is unknown: the quantity assumes a default pot. */
  quantityEstimated: boolean;
}

export interface Digest {
  subject: string;
  text: string;
  html: string;
  count: number;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

function lateText(days: number): string {
  return `${days} jour${days > 1 ? "s" : ""} de retard`;
}

/** Rooms in alphabetical order; inside a room the most overdue plants come first. */
function groupByRoom(plants: DigestPlant[]): [string, DigestPlant[]][] {
  const rooms = new Map<string, DigestPlant[]>();
  for (const plant of plants) {
    rooms.set(plant.room, [...(rooms.get(plant.room) ?? []), plant]);
  }

  return [...rooms.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([room, items]): [string, DigestPlant[]] => [
      room,
      items.sort((a, b) => b.overdueDays - a.overdueDays || a.name.localeCompare(b.name, "fr")),
    ]);
}

export function buildDigest(
  plants: DigestPlant[],
  options: { today: DayKey; appUrl?: string }
): Digest | null {
  if (plants.length === 0) return null;

  const count = plants.length;
  const rooms = groupByRoom(plants);
  const estimated = plants.filter((p) => p.quantityEstimated);
  const day = formatDayLong(options.today);
  const intro = `${count} ${plural(count, "plante à arroser", "plantes à arroser")} aujourd'hui (${day})`;
  const estimateNote = `* Diamètre du pot non renseigné : quantité calculée pour un pot de ${DEFAULT_POT_DIAMETER_CM} cm. Indique-le dans la fiche de la plante pour l'affiner.`;
  const adviceNote = "Quantités indicatives, calculées d'après la taille du pot.";

  const subject = `🌿 PlantMan : ${count} ${plural(count, "plante à arroser", "plantes à arroser")} aujourd'hui`;

  // ---- plain text
  const textLines = ["Bonjour,", "", `${intro} :`, ""];
  for (const [room, items] of rooms) {
    textLines.push(room);
    for (const p of items) {
      const quantity = `environ ${formatQuantity(p.quantityMl)}${p.quantityEstimated ? " *" : ""}`;
      const late = p.overdueDays > 0 ? ` (${lateText(p.overdueDays)})` : "";
      textLines.push(`- ${p.name} (${p.species}) : ${quantity}${late}`);
    }
    textLines.push("");
  }
  if (estimated.length > 0) textLines.push(estimateNote, "");
  textLines.push(adviceNote);
  if (options.appUrl) textLines.push("", `Ouvrir PlantMan : ${options.appUrl}`);

  // ---- HTML (inline styles: email clients ignore stylesheets and CSS variables)
  const roomBlocks = rooms
    .map(([room, items]) => {
      const rows = items
        .map((p) => {
          const late =
            p.overdueDays > 0
              ? `<div style="font-size:14px;font-weight:700;color:#b23a0b;">${escapeHtml(lateText(p.overdueDays))}</div>`
              : "";
          return `<tr>
<td style="padding:12px 0;border-bottom:1px solid #e3dac6;">
<div style="font-size:17px;font-weight:700;color:#1b2a21;">${escapeHtml(p.name)}</div>
<div style="font-size:14px;color:#55604f;">${escapeHtml(p.species)}</div>${late}
</td>
<td align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid #e3dac6;white-space:nowrap;vertical-align:top;">
<div style="font-size:12px;color:#55604f;">environ</div>
<div style="font-size:20px;font-weight:800;color:#1a62c4;">${escapeHtml(formatQuantity(p.quantityMl))}${p.quantityEstimated ? "&nbsp;*" : ""}</div>
</td>
</tr>`;
        })
        .join("\n");

      return `<h2 style="margin:24px 0 4px;font-size:15px;font-weight:700;color:#2d6a4f;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(room)}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${rows}
</table>`;
    })
    .join("\n");

  const button = options.appUrl
    ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(options.appUrl)}" style="display:inline-block;background:#2d6a4f;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:12px;">Ouvrir PlantMan</a></p>`
    : "";

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#faf7ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px 24px;">
<h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#1b2a21;">🌿 ${escapeHtml(intro)}</h1>
${roomBlocks}
${estimated.length > 0 ? `<p style="margin:20px 0 0;font-size:13px;color:#55604f;">${escapeHtml(estimateNote)}</p>` : ""}
<p style="margin:${estimated.length > 0 ? "8px" : "20px"} 0 0;font-size:13px;color:#55604f;">${escapeHtml(adviceNote)}</p>
${button}
</div>
</body>
</html>`;

  return { subject, text: textLines.join("\n"), html, count };
}
