import { describe, expect, it } from "vitest";
import { buildDigest, escapeHtml, type DigestPlant } from "../digest";

const plant = (overrides: Partial<DigestPlant> = {}): DigestPlant => ({
  name: "Monstera n°1",
  room: "Salle à manger",
  species: "Monstera",
  overdueDays: 0,
  quantityMl: 300,
  quantityEstimated: false,
  ...overrides,
});

const options = { today: "2026-10-09", appUrl: "https://plantman.example" };

describe("buildDigest", () => {
  it("sends nothing when no plant needs water", () => {
    expect(buildDigest([], options)).toBeNull();
  });

  it("names each plant with its quantity, grouped by room", () => {
    const digest = buildDigest(
      [
        plant(),
        plant({ name: "Peyotl", room: "Véranda", species: "Peyotl", quantityMl: 175 }),
        plant({ name: "Zamioculcas", species: "Zamioculcas", quantityMl: 175, overdueDays: 2 }),
      ],
      options
    )!;

    expect(digest.count).toBe(3);
    expect(digest.subject).toBe("🌿 PlantMan : 3 plantes à arroser aujourd'hui");
    expect(digest.text).toContain("3 plantes à arroser aujourd'hui (vendredi 9 octobre)");
    expect(digest.text).toContain("- Monstera n°1 (Monstera) : environ 300 ml");
    expect(digest.text).toContain("- Zamioculcas (Zamioculcas) : environ 175 ml (2 jours de retard)");
    expect(digest.text).toContain("- Peyotl (Peyotl) : environ 175 ml");

    // Rooms alphabetically, most overdue first inside a room
    const text = digest.text;
    expect(text.indexOf("Salle à manger")).toBeLessThan(text.indexOf("Véranda"));
    expect(text.indexOf("Zamioculcas")).toBeLessThan(text.indexOf("Monstera n°1"));
  });

  it("uses the singular for a single plant", () => {
    const digest = buildDigest([plant({ overdueDays: 1 })], options)!;
    expect(digest.subject).toBe("🌿 PlantMan : 1 plante à arroser aujourd'hui");
    expect(digest.text).toContain("(1 jour de retard)");
  });

  it("formats litres for big pots", () => {
    expect(buildDigest([plant({ quantityMl: 1400 })], options)!.text).toContain("environ 1,4 L");
  });

  it("flags quantities computed for an unknown pot, and only then", () => {
    const withEstimate = buildDigest([plant({ quantityEstimated: true })], options)!;
    expect(withEstimate.text).toContain("environ 300 ml *");
    expect(withEstimate.text).toContain("Diamètre du pot non renseigné");
    expect(withEstimate.html).toContain("300 ml&nbsp;*");

    const known = buildDigest([plant()], options)!;
    expect(known.text).not.toContain("non renseigné");
    expect(known.html).not.toContain("&nbsp;*");
  });

  it("links to the app, or omits the link when the URL is unknown", () => {
    const withLink = buildDigest([plant()], options)!;
    expect(withLink.text).toContain("Ouvrir PlantMan : https://plantman.example");
    expect(withLink.html).toContain('href="https://plantman.example"');

    const withoutLink = buildDigest([plant()], { today: options.today })!;
    expect(withoutLink.text).not.toContain("Ouvrir PlantMan");
    expect(withoutLink.html).not.toContain("<a ");
  });

  it("escapes user-provided names in the HTML", () => {
    const html = buildDigest(
      [plant({ name: '<script>alert("x")</script>', room: "Salon & cuisine", species: "O'Neil <b>" })],
      options
    )!.html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("Salon &amp; cuisine");
    expect(html).toContain("O&#39;Neil &lt;b&gt;");
  });

  it("is a complete French HTML document", () => {
    const html = buildDigest([plant()], options)!.html;
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('<meta charset="utf-8">'); // accents must survive outside the email envelope
    expect(html).toContain("<title>🌿 PlantMan : 1 plante à arroser aujourd&#39;hui</title>");
  });
});

describe("escapeHtml", () => {
  it("escapes the five dangerous characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
