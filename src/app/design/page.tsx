import { contrastRatio, wcagLevel } from "@/lib/color";
import { DesignPreviews } from "./previews";

export const metadata = {
  title: "PlantMan - design",
};

// Renders `code` spans inside plain strings.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em] text-foreground">
            {part}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}

type Severity = "Critique" | "Important" | "Mineur";

const SEVERITY_STYLE: Record<Severity, string> = {
  Critique: "bg-destructive/10 text-destructive",
  Important: "bg-tint-sun text-foreground",
  Mineur: "bg-muted text-muted-foreground",
};

const FINDINGS: { severity: Severity; title: string; detail: string }[] = [
  {
    severity: "Critique",
    title: "La police n'était pas chargée : toute l'app s'affichait en Times",
    detail:
      "Dans `globals.css`, `--font-sans` se référençait lui-même : variable vide, donc police par défaut du navigateur (à empattements). Geist était téléchargée mais jamais utilisée. Corrigé : c'est la cause principale du côté « ennuyeux » et « fin ».",
  },
  {
    severity: "Critique",
    title: "Palette quasi monochrome : « fade »",
    detail:
      "Fond blanc pur et gris neutres (chroma 0) partout ; seul le vert primaire a une teinte. La palette de DESIGN.md (crème, sauge, teintes de cartes) n'est pas utilisée dans l'app.",
  },
  {
    severity: "Critique",
    title: "Le geste principal est le plus petit",
    detail:
      "« ✓ Arrosé » est un bouton de 28 px de haut, du même poids visuel que « +2j ». C'est l'action la plus fréquente de l'app et elle demande de viser. Cible tactile recommandée : 44 px minimum, 48 px pour l'action principale.",
  },
  {
    severity: "Important",
    title: "Trop fin : traits, textes et contrastes",
    detail:
      "Cartes à bordure de 1 px sans ombre ni couleur, infos clés (espèce, pièce, retard) en 12 px gris. Le gris secondaire sur fond gris clair n'atteint que 4,35:1 (seuil AA : 4,5:1).",
  },
  {
    severity: "Important",
    title: "Champs presque invisibles",
    detail:
      "Contour des champs à 1,28:1 contre le fond (WCAG 1.4.11 demande 3:1 pour les contrôles) : on distingue mal où saisir, surtout au soleil sur téléphone.",
  },
  {
    severity: "Important",
    title: "Le mode sombre perd la marque",
    detail:
      "En sombre, la couleur primaire devient blanche (`oklch(0.922 0 0)`) : plus aucun vert, l'app ressemble à un gabarit générique.",
  },
  {
    severity: "Important",
    title: "Hiérarchie plate sur « Aujourd'hui »",
    detail:
      "Toutes les plantes ont le même rendu, la pièce est un petit titre gris, il n'y a pas de résumé (« 4 à arroser sur 8 ») ni de retour visuel fort quand on arrose.",
  },
  {
    severity: "Mineur",
    title: "Incohérences avec les règles du projet",
    detail:
      "Couleurs en dur dans le journal (`text-green-600`), survol des listes en vert vif `#52b788`, police Geist alors que DESIGN.md prévoit Inter, valeurs brutes anglaises dans quelques listes (corrigé).",
  },
];

type Swatch = {
  name: string;
  usage: string;
  bg: string;
  fg: string;
  /** Border or icon colors need 3:1, text needs 4.5:1. */
  nonText?: boolean;
};

const CURRENT: Swatch[] = [
  { name: "Texte", usage: "Texte principal sur fond blanc", bg: "#ffffff", fg: "#171717" },
  { name: "Texte secondaire", usage: "Espèce, pièce, légendes sur bloc gris", bg: "#f5f5f5", fg: "#737373" },
  { name: "Primaire", usage: "Boutons (texte blanc)", bg: "#2d6a4f", fg: "#ffffff" },
  { name: "Contour des champs", usage: "Bordure d'un champ de saisie", bg: "#ffffff", fg: "#e5e3df", nonText: true },
];

const PROPOSED: Swatch[] = [
  { name: "Texte", usage: "Texte principal sur crème chaude", bg: "#fbf7ee", fg: "#1b2a21" },
  { name: "Texte secondaire", usage: "Espèce, pièce, légendes sur sable", bg: "#f1ebdd", fg: "#55604f" },
  { name: "Primaire (feuille)", usage: "Enregistrer, navigation active", bg: "#15764a", fg: "#ffffff" },
  { name: "Eau", usage: "Action « Arrosé », points du calendrier", bg: "#1a62c4", fg: "#ffffff" },
  { name: "Retard", usage: "Pastille « 2 j de retard »", bg: "#fbf7ee", fg: "#b23a0b" },
  { name: "Contour des champs", usage: "Bordure d'un champ de saisie", bg: "#ffffff", fg: "#7f8f82", nonText: true },
  { name: "Sombre : texte", usage: "Texte sur fond vert très sombre", bg: "#0f1a14", fg: "#eaf3ec" },
  { name: "Sombre : primaire", usage: "Bouton vert vif, texte sombre", bg: "#4cc38a", fg: "#06281a" },
];

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const ratio = contrastRatio(swatch.bg, swatch.fg);
  const pass = swatch.nonText ? ratio >= 3 : ratio >= 4.5;
  const verdict = swatch.nonText ? (pass ? "OK (≥ 3:1)" : "Insuffisant (< 3:1)") : wcagLevel(ratio);

  return (
    <li className="overflow-hidden rounded-xl border border-border">
      <div
        className="flex h-20 items-center justify-center text-lg font-semibold"
        style={{ backgroundColor: swatch.bg, color: swatch.nonText ? undefined : swatch.fg }}
      >
        {swatch.nonText ? (
          <span
            className="rounded-lg border-2 px-4 py-1.5 text-base text-foreground"
            style={{ borderColor: swatch.fg, backgroundColor: "#ffffff" }}
          >
            Champ
          </span>
        ) : (
          "Aa Texte"
        )}
      </div>
      <div className="space-y-0.5 p-3">
        <p className="text-sm font-semibold">{swatch.name}</p>
        <p className="text-xs text-muted-foreground">{swatch.usage}</p>
        <p className="pt-1 text-xs">
          <code>{swatch.fg}</code> sur <code>{swatch.bg}</code>
        </p>
        <p className={`text-sm font-bold ${pass ? "text-primary" : "text-destructive"}`}>
          {ratio.toFixed(2).replace(".", ",")}:1 · {verdict}
        </p>
      </div>
    </li>
  );
}

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-bold">Design : audit et proposition</h1>
        <p className="mb-12 max-w-2xl text-muted-foreground">
          Cette page compare l&apos;interface actuelle d&apos;Arrosoir avec une proposition plus
          directe, plus colorée et plus lisible. Rien n&apos;est appliqué dans l&apos;app tant que
          la proposition n&apos;est pas validée.
        </p>

        <section className="mb-16" aria-labelledby="audit">
          <h2 id="audit" className="mb-2 text-2xl font-semibold">
            1. Audit
          </h2>
          <p className="mb-6 text-muted-foreground">
            Public cible : usage quotidien sur téléphone, souvent d&apos;une main, parfois en plein
            jour.
          </p>
          <ol className="space-y-3">
            {FINDINGS.map((finding, index) => (
              <li key={finding.title} className="rounded-xl border border-border p-4">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">{index + 1}.</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[finding.severity]}`}>
                    {finding.severity}
                  </span>
                  <h3 className="font-semibold">{finding.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  <Inline text={finding.detail} />
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm">
            <strong>Ce qui est déjà bien :</strong> le thème passe par des variables (un seul
            fichier à changer), la barre de navigation a des cibles de 56 px et le calendrier du
            planning est accessible au clavier et au lecteur d&apos;écran.
          </p>
        </section>

        <section className="mb-16" aria-labelledby="palette">
          <h2 id="palette" className="mb-2 text-2xl font-semibold">
            2. Palette : « jardin vivant »
          </h2>
          <p className="mb-6 max-w-2xl text-muted-foreground">
            Fond crème chaud, vert feuille profond, et un <strong>bleu eau</strong> réservé à
            l&apos;action d&apos;arroser : une couleur = un sens. Les rapports de contraste
            ci-dessous sont calculés, pas estimés.
          </p>

          <h3 className="mb-3 text-lg font-semibold">Actuel</h3>
          <ul className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {CURRENT.map((swatch) => (
              <SwatchCard key={swatch.name} swatch={swatch} />
            ))}
          </ul>

          <h3 className="mb-3 text-lg font-semibold">Proposé</h3>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {PROPOSED.map((swatch) => (
              <SwatchCard key={swatch.name} swatch={swatch} />
            ))}
          </ul>
        </section>

        <section className="mb-16" aria-labelledby="ecrans">
          <h2 id="ecrans" className="mb-2 text-2xl font-semibold">
            3. Les écrans, côte à côte
          </h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Mêmes données, mêmes écrans : à gauche le rendu actuel, à droite la proposition.
          </p>
          <DesignPreviews />
        </section>

        <section className="mb-16" aria-labelledby="changements">
          <h2 id="changements" className="mb-4 text-2xl font-semibold">
            4. Ce qui change si vous validez
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Thème :</strong> nouvelles valeurs dans{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[0.85em] text-foreground">globals.css</code>{" "}
              (clair et sombre), plus deux jeux de couleurs : « eau » et cinq teintes pour les
              étiquettes.
            </li>
            <li>
              <strong className="text-foreground">Tailles :</strong> boutons de 48 px, texte de base
              16 px, infos clés en 14 px minimum, champs avec contour contrasté.
            </li>
            <li>
              <strong className="text-foreground">Cartes :</strong> coins plus arrondis, ombre
              douce, vignette de plante plus grande.
            </li>
            <li>
              <strong className="text-foreground">Aujourd&apos;hui :</strong> résumé « 4 à arroser
              sur 8 », bouton « Arrosé » pleine largeur en bleu eau, pièce repérée par une couleur.
            </li>
            <li>
              <strong className="text-foreground">Nettoyage :</strong> les couleurs en dur du
              journal passent aux jetons du thème.
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun changement de logique ni de données : uniquement du style, en un seul lot.
          </p>
        </section>

        <section aria-labelledby="decisions">
          <h2 id="decisions" className="mb-4 text-2xl font-semibold">
            5. À valider
          </h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Le bleu « eau » pour l&apos;action d&apos;arroser te convient-il, ou préfères-tu tout
              en vert ?
            </li>
            <li>Le fond crème chaud, ou un fond blanc avec les mêmes accents ?</li>
            <li>Garder le mode sombre (suit le réglage du téléphone) ?</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
