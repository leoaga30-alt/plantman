# Plan de dev — Arrosoir 🌿 (nom de code)

> Outil web privé pour gérer l'arrosage des plantes d'un foyer (3–4 personnes), hébergé gratuitement, accès restreint.
> **Mode de travail : Claude Code (cloud Anthropic, au moindre coût) réalise tout, phase par phase ; Leo valide chaque fin de phase et fait les actions manuelles.**

---

## 0. Mode de travail

### 0.1 Rôles

| Qui | Rôle |
|---|---|
| **Claude Code** (cloud Anthropic) | lit ce plan, code, lance les vérifications, commit, coche les cases, résume chaque fin de phase |
| **Leo** | valide en fin de phase, fait les actions marquées **[Leo]** (comptes, tableaux de bord, tests sur téléphone) |

Ce plan est la source de vérité : en cas de doute sur le périmètre ou un choix d'architecture, Claude Code pose la question à Leo plutôt que de deviner.

### 0.2 Boucle par phase

1. Lire la phase dans la section 11 et seulement les sections du plan qu'elle cite.
2. La découper en petites étapes (0.3), à faire une à la fois, dans l'ordre.
3. À chaque étape : implémenter, lancer `lint` + `typecheck` + `test` + `build`, commit (0.5), cocher la case correspondante.
4. Case **[Leo]** : détailler à Leo ce qu'il doit faire, avancer sur ce qui n'en dépend pas, sinon attendre.
5. Fin de phase : revue avec la skill `web-design-guidelines` sur les écrans modifiés (phases avec UI), vérification du critère ✅, résumé court (fait, écarts, actions Leo, questions), puis **stop** jusqu'à validation de Leo.

Aucune fonctionnalité hors périmètre sans demander (voir backlog V2). Demander avant toute action irréversible : suppression de données, migration destructive, changement de fournisseur, push, déploiement.

### 0.3 Taille des étapes

- Une étape = un résultat vérifiable, environ 5 fichiers touchés au maximum, une seule notion nouvelle à la fois (« schéma Prisma + migration », pas « schéma + auth + écran »).
- Chaque case des checklists de la section 11 correspond à peu près à une étape ; elle peut être découpée ou regroupée.
- Les cases marquées **[Leo]** sont des actions manuelles : Claude Code les détaille et n'y touche pas.

### 0.4 Règles de travail

Reprises dans `CLAUDE.md` (section 13) :

- Faire ce que demande la phase : pas de refactoring, de dépendance ou de fonctionnalité non prévus.
- Doute, ambiguïté, API ou limite qui semble différente du plan : vérifier la doc officielle et signaler l'écart à Leo avant d'adapter.
- Vérifications en échec après 2 tentatives de correction : stop, rapport avec les erreurs brutes.
- Ne cocher une case qu'une fois l'étape terminée et les vérifications vertes.

### 0.5 Git

- Dépôt Git local ; un commit par étape : `pN-eM: <résumé>` (ex. `p1-e3: add requireMember guard`), en anglais.
- Pas de push ni de déploiement sans l'accord de Leo.
- `docs/briefs/` et `docs/rendus/` datent de l'ancien mode de travail (pilote / exécutant local) : conservés comme historique, plus alimentés.

### 0.6 Hypothèses par défaut (modifiables)

- Plantes d'intérieur uniquement, un seul foyer, interface en français.
- Un domaine perso est disponible pour envoyer les emails (sinon fallback SMTP Gmail, voir 3).

### 0.7 Outillage Claude Code (installé en phase 0)

**1. MCP findskills** — recherche dans un grand catalogue de skills d'agents (outils `search_skills`, `list_skills`, `get_skill`, `get_stats`, `list_tags`). Lecture seule : il trouve des skills, il ne les installe pas.

Config dans `.mcp.json` à la racine du projet (portée projet) :

```json
{
  "mcpServers": {
    "findskills": {
      "command": "npx",
      "args": ["-y", "findskills-mcp"]
    }
  }
}
```

- Node ≥ 20 requis. Si Claude Code ne trouve pas `npx` (nvm, fnm, volta) : `claude mcp add findskills -- $(which npx) -y findskills-mcp`.
- Usage : quand une étape s'y prête (Next.js, Prisma, Supabase, tests, accessibilité), chercher une skill ; filtrer sur les scores qualité / sécurité ; privilégier les sources connues (`anthropics`, `vercel-labs`).
- **Ne jamais installer une skill trouvée** sans avoir montré sa source et son contenu à Leo (une skill peut contenir des scripts).

**2. Vercel Web Interface Guidelines** (https://vercel.com/design/guidelines) — règles d'interface : interactions, animations, mise en page, contenu, formulaires, performance.

- Télécharger `AGENTS.md` à la racine : `curl -o AGENTS.md https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/AGENTS.md`. Claude Code le lit avant tout travail d'UI (section 13).
- Installer la skill de revue : `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines` (si la commande demande l'agent : Claude Code, portée projet). Elle sert à la revue de fin de phase (0.2).
- Arbitrages : la partie « Vercel-specific » (Title Case, etc.) ne s'applique pas → UI en français, casse de phrase, guillemets « », formats fr-BE. Ne jamais bloquer le zoom : champs de saisie ≥ 16 px sur mobile.

**3. DESIGN.md** (https://github.com/VoltAgent/awesome-design-md) — système de design en markdown (palette, typo, composants, espacements, do / don't) tiré d'un site connu. Copié à la racine, il donne une direction visuelle cohérente.

- `git clone --depth 1 https://github.com/VoltAgent/awesome-design-md.git /tmp/awesome-design-md`, puis copier le `DESIGN.md` du site choisi (dossier `design-md/`) à la racine. Chaque site a aussi `preview.html` et `preview-dark.html` pour voir le rendu avant de choisir.
- Choix à confirmer avec Leo en phase 0 (Leo compare les previews). Pistes pour une app de plantes mobile et photo : **Notion** (minimalisme chaleureux, surfaces douces), **Airbnb** (photos au premier plan, formes arrondies), **Starbucks** (palette vert / crème).
- Adapter, pas cloner : garder la structure et l'esprit, accent vert, polices propriétaires remplacées par des équivalents libres (Google Fonts), aucun logo ni nom de la marque d'origine.
- Traduire les tokens en variables CSS shadcn (`globals.css`) + thème Tailwind : une seule source de vérité, aucune couleur en dur dans les composants.

**Priorités en cas de conflit** : `PLAN.md` (fonctionnel) > règles d'accessibilité d'`AGENTS.md` > `DESIGN.md` (style).

### 0.8 Modèle et coûts (cloud Anthropic)

Claude Code tourne sur le cloud Anthropic, au moindre coût. L'ancienne piste « API locale / LM Studio » est abandonnée : `settings.json` ne doit plus router vers `localhost` (clés `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_*_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL`, `CLAUDE_CODE_MAX_CONTEXT_TOKENS`), et `CLAUDE.md` n'en tient plus compte. C'est Leo qui gère `settings.json`.

- **Modèle par défaut : Haiku 4.5** (`claude-haiku-4-5-20251001`, le moins cher). Sonnet (`claude-sonnet-5-5`) seulement pour les étapes à fort enjeu — auth + RLS (phase 1), moteur d'arrosage (phase 3), diagnostic (phase 5) — puis retour à Haiku. Pas d'Opus ni de Fable sans l'accord de Leo. Le changement de modèle se fait depuis le sélecteur de modèle, par Leo.
- **Sessions courtes** : une phase, ou une sous-phase, par session ; `/clear` entre deux. `CLAUDE.md` court.
- **Lecture ciblée** : `grep` et plages de lignes plutôt que fichiers entiers ; ne lire du plan que les sections utiles à l'étape.
- **Pas de sous-agents** ni de recherche large quand une lecture directe suffit.
- **Web** : WebFetch sur les URLs officielles citées dans ce plan ; WebSearch seulement si la doc officielle ne suffit pas.
- **Suivi** : point de consommation en fin de phase ; signaler à Leo tout usage anormal.
- **Plafond** : plafond de dépense mensuel dans la console Anthropic si Claude Code est facturé à l'API (inutile avec un abonnement).
- **L'app elle-même** : en dev, `AI_MOCK=true` (zéro coût), vrais appels ponctuels seulement. En prod, l'app appelle l'API Anthropic depuis Vercel (section 7.1).

---

## 1. Contexte & objectifs

- Maison en Belgique (hémisphère nord, climat tempéré), chauffée l'hiver → air sec d'octobre à avril environ.
- Plusieurs personnes arrosent : l'outil montre **qui a arrosé quoi et quand**, pour éviter les doubles arrosages.
- Principes : **simple**, **mobile-first** (on l'utilise l'arrosoir à la main), **2 taps max** pour marquer un arrosage.
- Le planning est un **guide** : l'app rappelle toujours de vérifier le sol (doigt enfoncé à 2–3 cm) avant d'arroser.

Non-objectifs : capteurs connectés, multi-foyers, inscription publique, app native.

---

## 2. Périmètre fonctionnel (MVP)

| # | Fonction | Résumé |
|---|---|---|
| F1 | Pièces | nom, lumière, humidité, température été / hiver, radiateur à proximité |
| F2 | Inventaire initial | coller la liste de toutes les plantes → fiches générées par IA → validation |
| F3 | Planning d'arrosage | fréquence calculée selon espèce × saison × pièce × température × pot ; vue « Aujourd'hui » + vue semaine |
| F4 | Conseils | fiche d'entretien générique par espèce (arrosage, lumière, humidité, engrais, rempotage, toxicité, problèmes fréquents) |
| F5 | Ajout en cours d'année | nom, photo, descriptif, pièce, pot, date d'arrivée ; fiche auto-générée |
| F6 | Diagnostic photo | 1–3 photos + symptômes → causes probables, actions, urgence, ajustement d'arrosage proposé |
| F7 | Accès restreint | seuls les emails autorisés peuvent se connecter |
| F8 | Rappel quotidien | email du matin « à arroser aujourd'hui » (opt-in par membre) |
| F9 | Capteurs | température / humidité réelles de 2 pièces (SwitchBot), alertes froid / chaud (section 16, phase 7) |

---

## 3. Stack & hébergement (gratuit)

| Brique | Choix | Pourquoi |
|---|---|---|
| Front + back | Next.js (App Router, TypeScript strict), Server Actions | un seul projet, déploiement simple |
| UI | Tailwind + shadcn/ui, lucide-react, thème tiré de `DESIGN.md` | rapide, propre, mobile, cohérent |
| Hébergement | Vercel Hobby (gratuit, usage perso non commercial) | déploiement Git, cron intégré |
| Base de données | Supabase Free — Postgres | 500 Mo, largement assez |
| Auth | Supabase Auth — code OTP par email | pas de mot de passe, fonctionne en PWA |
| Photos | Supabase Storage — bucket **privé** | 1 Go inclus |
| ORM | Prisma — URL poolée pour l'app, URL directe pour les migrations (suivre le guide officiel Prisma × Supabase pour la version courante) | |
| Validation | Zod | formulaires + sorties IA |
| Dates | date-fns + fuseau `Europe/Brussels` | |
| IA | API Claude (`@anthropic-ai/sdk`) | fiches espèces + diagnostic par vision |
| Emails | Resend (SMTP custom de Supabase Auth + digest quotidien) | |
| Tests | Vitest | moteur d'arrosage + schémas |
| Capteurs | 2 × SwitchBot Meter + 1 Hub Mini, API cloud SwitchBot v1.1 + webhook | mesures réelles (section 16) |

**Postes payants : l'API IA** de l'app (à l'usage) **et Claude Code** (abonnement ou API, section 0.8). → plafond de dépense mensuel dans la console Anthropic + quota journalier dans l'app (section 7).

### Contraintes des offres gratuites (à respecter dans le code)

- **Supabase met en pause un projet gratuit après 7 jours sans activité.** → le cron quotidien (F8) fait des requêtes en base tous les jours, ce qui garde le projet actif. Ne jamais le supprimer, même si les emails sont désactivés.
- **Supabase Free n'a pas de sauvegardes** → bouton d'export JSON (phase 6).
- **Cron Vercel Hobby : 1 exécution/jour max**, déclenchée à un moment quelconque dans l'heure prévue, en UTC. → un seul job `0 5 * * *` (≈ 6–7 h à Bruxelles), idempotent (un appel peut être raté ou doublé).
- **Stockage 1 Go** → compression des photos côté navigateur (WebP, 1600 px max, ~200–300 Ko) ≈ plusieurs milliers de photos.
- **Taille des requêtes vers les fonctions Vercel limitée (~4,5 Mo)** → les photos partent **directement du navigateur vers Supabase Storage** via une URL d'upload signée, jamais via une Server Action.
- **Le SMTP par défaut de Supabase est réservé aux tests** → configurer Resend comme SMTP custom dès la phase 1. Resend exige un domaine vérifié pour écrire à d'autres adresses que la tienne → utiliser un sous-domaine perso (ex. `plantes.mondomaine.be`). Fallback : SMTP Gmail avec mot de passe d'application.

---

## 4. Architecture

```
src/
  app/
    (auth)/login/            # email → code OTP
    (app)/                   # layout protégé
      page.tsx               # « Aujourd'hui »
      planning/              # vue 7 jours / 4 semaines
      plantes/               # liste, [id] (fiche + journal), nouvelle
      plantes/import/        # inventaire initial en lot
      pieces/                # CRUD pièces
      diagnostic/            # nouveau diagnostic + historique
      reglages/
    api/cron/daily/route.ts  # digest + keep-alive + relevé capteurs de secours (protégé par CRON_SECRET)
    api/sensors/switchbot/route.ts  # webhook capteurs (section 16)
    manifest.ts              # PWA
  lib/
    watering/                # moteur PUR (aucun accès DB/Next), 100 % testé
    ai/                      # client, prompts, schémas Zod, mock
    storage/                 # URLs signées upload / lecture
    sensors/                 # client SwitchBot, relevés, alertes (section 16)
    auth/                    # session, requireMember()
    dates/                   # helpers fuseau Europe/Brussels
    db.ts                    # client Prisma singleton
  components/
prisma/
  schema.prisma
  seed.ts                    # membres autorisés + pièces + inventaire initial
data/
  inventaire.md              # rempli par moi (section 14)
docs/
  briefs/, rendus/           # historique de l'ancien mode de travail (0.5), plus alimentés
```

- Toutes les lectures/écritures passent par le serveur (Server Components + Server Actions), avec vérification de la session **et** de l'appartenance à `Member`.
- Aucune clé secrète côté client (clé secrète Supabase, clé API IA).

---

## 5. Modèle de données (Prisma)

Blocs `generator` / `datasource` : suivre la doc Prisma de la version installée (URL poolée + URL directe).

```prisma
enum LightLevel  { LOW MEDIUM BRIGHT DIRECT_SUN }
enum Humidity    { DRY NORMAL HUMID }
enum PotMaterial { PLASTIC TERRACOTTA GLAZED_CERAMIC OTHER }
enum WaterNeed   { LOW MEDIUM HIGH }
enum CareType    { WATER SKIP FERTILIZE REPOT }
enum PhotoKind   { PROFILE PROGRESS DIAGNOSIS }
enum Source      { AI MANUAL }
enum AiKind      { PROFILE DIAGNOSIS }

model Member {
  id          String      @id @default(cuid())
  email       String      @unique
  name        String
  notifyDaily Boolean     @default(true)
  createdAt   DateTime    @default(now())
  events      CareEvent[]
  diagnoses   Diagnosis[]
  aiUsage     AiUsage[]
}

model Room {
  id         String     @id @default(cuid())
  name       String     @unique
  light      LightLevel @default(MEDIUM)
  humidity   Humidity   @default(NORMAL)
  tempSummer Float      @default(22)
  tempWinter Float      @default(20)
  nearHeater Boolean    @default(false)
  notes      String?
  plants     Plant[]
  sensor     Sensor?
}

model Species {
  id             String     @id @default(cuid())
  commonName     String
  scientificName String?    @unique
  aliases        String[]
  waterNeed      WaterNeed
  intervalSpring Int        // jours, conditions de référence (6.1)
  intervalSummer Int
  intervalAutumn Int
  intervalWinter Int
  minTemp        Float?
  lightPref      LightLevel
  humidityPref   Humidity
  winterRest     Boolean    @default(false) // repos hivernal au sec (cactus…), voir 6.8
  care           Json       // CareSheet, validé par Zod
  source         Source     @default(AI)
  validated      Boolean    @default(false)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  plants         Plant[]
}

model Plant {
  id               String      @id @default(cuid())
  name             String      // surnom, ex. « Le grand monstera »
  description      String?
  speciesId        String
  species          Species     @relation(fields: [speciesId], references: [id])
  roomId           String
  room             Room        @relation(fields: [roomId], references: [id])
  potDiameterCm    Int?
  potMaterial      PotMaterial @default(PLASTIC)
  intervalAdjust   Float       @default(1.0) // borné 0,5–2 (apprentissage / diagnostic)
  intervalOverride Int?        // forçage manuel en jours
  acquiredAt       DateTime?
  archivedAt       DateTime?
  coverPhotoPath   String?
  createdAt        DateTime    @default(now())
  events           CareEvent[]
  photos           Photo[]
  diagnoses        Diagnosis[]
}

model CareEvent {
  id       String   @id @default(cuid())
  plantId  String
  plant    Plant    @relation(fields: [plantId], references: [id], onDelete: Cascade)
  memberId String
  member   Member   @relation(fields: [memberId], references: [id])
  type     CareType
  at       DateTime @default(now())
  note     String?

  @@index([plantId, at])
}

model Photo {
  id          String     @id @default(cuid())
  plantId     String
  plant       Plant      @relation(fields: [plantId], references: [id], onDelete: Cascade)
  path        String     // chemin dans le bucket privé
  kind        PhotoKind
  takenAt     DateTime   @default(now())
  diagnosisId String?
  diagnosis   Diagnosis? @relation(fields: [diagnosisId], references: [id], onDelete: SetNull)
}

model Diagnosis {
  id              String    @id @default(cuid())
  plantId         String
  plant           Plant     @relation(fields: [plantId], references: [id], onDelete: Cascade)
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])
  symptoms        String[]
  description     String?
  result          Json      // DiagnosisResult, validé par Zod
  suggestedAdjust Float?
  appliedAt       DateTime?
  createdAt       DateTime  @default(now())
  photos          Photo[]
}

model AiUsage {
  id           String   @id @default(cuid())
  memberId     String
  member       Member   @relation(fields: [memberId], references: [id])
  kind         AiKind
  model        String
  inputTokens  Int
  outputTokens Int
  createdAt    DateTime @default(now())
}

model DigestLog {
  date   String   @id // AAAA-MM-JJ, date locale Europe/Brussels
  sentAt DateTime @default(now())
}

// --- Capteurs (phase 7, section 16) ---

enum ReadingSource { WEBHOOK POLL }
enum AlertKind     { COLD HEAT }

model Sensor {
  id         String          @id @default(cuid())
  provider   String          @default("switchbot")
  externalId String          @unique // deviceId SwitchBot (adresse MAC sans « : », majuscules)
  name       String
  roomId     String?         @unique
  room       Room?           @relation(fields: [roomId], references: [id])
  battery    Int?
  lastSeenAt DateTime?
  readings   SensorReading[]
}

model SensorReading {
  id          String        @id @default(cuid())
  sensorId    String
  sensor      Sensor        @relation(fields: [sensorId], references: [id], onDelete: Cascade)
  at          DateTime
  temperature Float
  humidity    Float
  source      ReadingSource

  @@index([sensorId, at])
}

model AlertLog {
  id     String    @id @default(cuid())
  roomId String
  kind   AlertKind
  value  Float
  sentAt DateTime  @default(now())

  @@index([roomId, kind, sentAt])
}
```

---

## 6. Moteur d'arrosage (`lib/watering`)

Fonctions pures, sans I/O, entièrement testées.

### 6.1 Intervalle de base selon la saison

Chaque espèce a 4 intervalles de référence (en jours), valables dans les **conditions de référence** : 20 °C, lumière moyenne, humidité normale, pot plastique de 12–25 cm.

Points d'ancrage : hiver = 15 janvier · printemps = 15 avril · été = 15 juillet · automne = 15 octobre. Entre deux ancrages : **interpolation linéaire** selon la date (pas de saut brutal au changement de saison).

### 6.2 Température de la pièce

`T(date)` = interpolation entre `tempWinter` (ancrée au 15 janvier) et `tempSummer` (ancrée au 15 juillet).
Saison de chauffe configurable (défaut 15 octobre → 15 avril).

Le moteur reçoit la température et l'humidité **en paramètres** et ignore leur origine : valeurs estimées (ci-dessus) ou mesurées par un capteur (section 16). Prévoir cette injection dès la phase 3 pour que la phase 7 ne demande aucun refactoring du moteur.

### 6.3 Facteurs

| Facteur | Règle |
|---|---|
| Température | `fT = clamp(1 − 0,04 × (T − 20), 0,7, 1,4)` (plus chaud → plus souvent) |
| Lumière de la pièce | LOW 1,25 · MEDIUM 1,0 · BRIGHT 0,9 · DIRECT_SUN 0,8 |
| Humidité de la pièce | DRY 0,9 · NORMAL 1,0 · HUMID 1,1 |
| Radiateur | `nearHeater` **et** saison de chauffe → 0,9 |
| Matière du pot | TERRACOTTA 0,85 · autres 1,0 |
| Taille du pot | < 12 cm 0,85 · 12–25 cm 1,0 · > 25 cm 1,15 · inconnue 1,0 |
| Ajustement plante | `intervalAdjust` (0,5–2) |

`intervalle = clamp(round(base × produit des facteurs), 1, 60)`. Si `intervalOverride` est défini, il remplace le calcul.

### 6.4 Prochaine date

- Prochaine date = dernier événement `WATER` + intervalle. Jamais arrosée → « à vérifier aujourd'hui ».
- Un `SKIP` (« sol encore humide ») postérieur au dernier arrosage → prochaine date = date du SKIP + 2 jours.
- « Aujourd'hui » = date locale Europe/Brussels. En retard → affiché en rouge avec le nombre de jours.

### 6.5 Transparence

`explainInterval()` renvoie un détail lisible, affiché sur la fiche plante, par exemple :

> Base automne 10 j × 0,92 (pièce à 22 °C) × 0,9 (lumière vive) × 0,85 (terre cuite) = **7 j**

### 6.6 Apprentissage léger

Si les 3 derniers cycles contiennent chacun au moins un SKIP → **proposer** (bannière, jamais automatique) d'allonger l'intervalle de 15 % (`intervalAdjust × 1,15`, borné).

### 6.7 Tests minimum

- Monstera, base été 7 j, salon à 24 °C l'été, lumière vive, pot plastique 25 cm, au 15 juillet → 7 × 0,84 × 0,9 = 5,29 → **5 j**.
- Même plante au 15 janvier, base hiver 14 j, 20 °C, radiateur à côté → 14 × 1,0 × 0,9 × 0,9 = 11,3 → **11 j**.
- Interpolation aux dates d'ancrage et entre deux ancrages, bornes 1 / 60, `intervalOverride`, SKIP, bornes de `intervalAdjust`.
- Fuseau : un arrosage à 23 h 30 heure belge compte pour ce jour-là (pas le lendemain en UTC).

### 6.8 Repos hivernal & alerte froid

- **Repos hivernal** : si `species.winterRest`, aucun arrosage planifié du 15 novembre au 28 février. La plante apparaît dans le planning avec « Repos hivernal — ne pas arroser ». Reprise le 1er mars (plante « à vérifier » ce jour-là).
- **Alerte froid** : si `T(date)` de la pièce < `species.minTemp` → bandeau d'alerte sur la fiche plante et dans « Aujourd'hui » (ex. « Véranda ≈ 12 °C, sous le minimum du Monstera : à rentrer dans une pièce chauffée »).
- Tests : aucune échéance pendant le repos ; reprise au 1er mars ; alerte déclenchée / non déclenchée autour de `minTemp`.

---

## 7. IA

### 7.1 Principes

- Modèles configurables par variables d'environnement : fiches → `AI_MODEL_PROFILE` (défaut `claude-haiku-4-5-20251001`), diagnostic → `AI_MODEL_DIAGNOSIS` (défaut `claude-haiku-4-5-20251001`, le moins cher ; passer à `claude-sonnet-5-5` si les diagnostics sont décevants). Vérifier les identifiants à jour dans la doc Anthropic.
- Sorties **JSON strict** (tool use / structured output), validées par Zod ; 1 nouvel essai si invalide, sinon message d'erreur propre.
- Appels uniquement côté serveur. Chaque appel est journalisé dans `AiUsage`. Quota `AI_DAILY_LIMIT` par membre (défaut 20/jour).
- `AI_MOCK=true` → renvoie des fixtures (dev + tests, zéro coût). **Valeur par défaut en dev.**
- Vrais appels en dev : ponctuels, avec `AI_MOCK=false` et une clé dédiée à plafond bas ; le reste du temps, mock. `ANTHROPIC_API_KEY` reste côté serveur uniquement : jamais dans le dépôt ni côté client.
- Coût maîtrisé : `max_tokens` borné par appel, photos réduites (~1500 px) avant envoi, réutilisation des `Species` existantes (7.2) → aucun appel inutile.
- Tout ce que produit l'IA est **modifiable** et marqué « à valider » tant qu'un humain ne l'a pas relu.

### 7.2 Génération de fiche espèce

- Entrée : nom saisi (+ photo optionnelle pour aider à identifier).
- Réutilisation : chercher d'abord une `Species` existante (nom commun, nom scientifique, alias ; comparaison sans accents ni casse) → pas d'appel IA si trouvée.
- Contexte donné au modèle : plante d'intérieur, Belgique, hémisphère nord ; intervalles demandés **aux conditions de référence** (6.1) pour que le moteur applique ensuite ses facteurs.
- Nom ambigu (« palmier », « ficus ») → le modèle renvoie 2–4 candidats, l'utilisateur choisit.

```ts
SpeciesProfile = {
  status: "ok" | "ambiguous",
  candidates?: { commonName: string; scientificName: string }[],
  commonName: string,
  scientificName: string,
  aliases: string[],
  waterNeed: "LOW" | "MEDIUM" | "HIGH",
  intervals: { spring: number; summer: number; autumn: number; winter: number }, // jours, entiers 1–60
  minTemp: number,
  lightPref: LightLevel,
  humidityPref: Humidity,
  winterRest: boolean, // true si la plante doit rester au sec l'hiver (cactus, certaines succulentes)
  care: CareSheet,
  confidence: number // 0–1
}

CareSheet = {
  summary: string, // 2–3 phrases
  watering: { advice: string; method: string; underwateringSigns: string[]; overwateringSigns: string[] },
  light: string,
  humidity: string,
  temperature: string,
  fertilizer: { period: string; frequency: string },
  repotting: string,
  maintenance: string[], // taille, dépoussiérage, rotation…
  toxicity: { pets: boolean; children: boolean; details: string },
  commonProblems: { symptom: string; likelyCause: string; fix: string }[]
}
```

Contenu rédigé en français.

### 7.3 Diagnostic photo

- Entrée : 1–3 photos (redimensionnées à ~1500 px côté serveur avant envoi), symptômes cochés (feuilles jaunes, brunes/sèches, molles, taches, chute de feuilles, tiges molles, moisissure sur la terre, moucherons, cochenilles, toiles…) + texte libre.
- Contexte ajouté automatiquement : espèce + fiche, pièce (lumière, température du moment, humidité, radiateur), pot, intervalle actuel, 5 derniers événements, date et saison.

```ts
DiagnosisResult = {
  summary: string,
  confidence: "LOW" | "MEDIUM" | "HIGH",
  likelyCauses: { cause: string; probability: number; evidence: string }[], // triées
  actions: { step: string; when: "NOW" | "THIS_WEEK" | "ONGOING" }[],
  urgency: "LOW" | "MEDIUM" | "HIGH",
  wateringAdjustment: { factor: number /* 0.5–2 */; reason: string } | null,
  pestsSuspected: boolean,
  isolatePlant: boolean,
  followUp: string,                 // ex. « reprendre une photo dans 10 jours »
  betterPhotoNeeded: string | null  // ex. « photo du dessous des feuilles »
}
```

UI : résultat lisible + bouton **« Appliquer l'ajustement d'arrosage »** (met à jour `intervalAdjust`, borné 0,5–2, horodaté dans `appliedAt`). Mention discrète : suggestion, pas une certitude. Le diagnostic et ses photos rejoignent le journal de la plante.

---

## 8. Accès restreint & sécurité

- Auth Supabase par **code OTP à 6 chiffres** plutôt qu'un lien magique (un lien s'ouvre dans le navigateur, pas dans la PWA installée sur iPhone).
- **Pas d'inscription libre** : `signInWithOtp({ shouldCreateUser: false })` + inscriptions désactivées dans Supabase ; le seed crée les comptes à partir de `ALLOWED_EMAILS`.
- Double verrou : le middleware/proxy Next.js (selon la version) vérifie la session **et** que l'email existe dans `Member` ; sinon déconnexion + page « accès refusé ». Helper `requireMember()` appelé dans chaque Server Action.
- **Verrouiller l'API REST Supabase** : RLS activé sur toutes les tables du schéma `public`, **sans aucune policy** → la clé publique (visible dans le navigateur) ne peut rien lire ni écrire ; seul Prisma, côté serveur, accède aux données. Vérifier par une requête REST avec la clé publique → résultat vide ou refus.
- Bucket photos **privé** ; upload via URL signée générée après contrôle d'accès ; affichage via URLs signées de courte durée (1 h).
- La compression dans le navigateur supprime les métadonnées EXIF (dont la position GPS).
- `robots: noindex`, pas de sitemap.
- `CRON_SECRET` vérifié sur `/api/cron/daily`.

---

## 9. Rappel quotidien (cron)

`/api/cron/daily`, 1 fois par jour :

1. Pour chaque membre avec `notifyDaily`, calcule les plantes en retard ou dues aujourd'hui, groupées par pièce.
2. Envoie un email court (rien à arroser → pas d'email), ex. : « 4 plantes aujourd'hui — Salon : Monstera, Pothos · Chambre : Calathea (2 j de retard) » + lien vers l'app.
3. Idempotent : `DigestLog` (date locale) empêche un double envoi.
4. Fait au moins une requête en base à chaque exécution (anti-pause Supabase).

---

## 10. Écrans (mobile-first, en français)

- **Aujourd'hui** : retards puis plantes du jour, groupées par pièce (= la tournée d'arrosage). Par plante : photo, nom, **« Arrosé ✓ »** (1 tap), **« Sol humide → +2 j »**. Par pièce : **« Tout arrosé »**. Affiche qui a arrosé en dernier et quand.
- **Planning** : 7 jours (par défaut) et 4 semaines, filtre par pièce.
- **Plantes** : grille de photos + recherche.
- **Fiche plante** : photo, pièce, intervalle actuel + explication (6.5), conseils (CareSheet), journal (arrosages, engrais, rempotages, photos, diagnostics), « Ajouter une photo de suivi », modifier / archiver.
- **Nouvelle plante** : nom (autocomplétion sur les espèces connues) → fiche existante ou « Générer la fiche » ; photo (`accept="image/*"`, caméra arrière sur mobile), descriptif, pièce, pot, date d'arrivée. Relecture de la fiche avant enregistrement.
- **Import initial** : zone de texte, une plante par ligne (`Nom ; Pièce ; pot`) → aperçu → génération **séquentielle** avec barre de progression (reprise possible si ça coupe) → écran de validation en lot.
- **Pièces** : CRUD + températures été / hiver, lumière, humidité, radiateur.
- **Diagnostic** : choix de la plante → photos → symptômes → résultat → appliquer l'ajustement.
- **Réglages** : membres (lecture seule), saison de chauffe, notifications, consommation IA du mois, export des données.
- **PWA** : manifest + icônes, installable sur l'écran d'accueil ; pas de mode hors-ligne au MVP.

---

## 11. Phases de développement

**[Leo]** = action manuelle, que Claude Code détaille sans l'exécuter. Le critère ✅ est vérifié en fin de phase (0.2).

### Phase 0 — Socle

- [x] Dépôt Git, `CLAUDE.md` (section 13), dossiers `docs/briefs/` et `docs/rendus/` (historique, 0.5)
- [ ] **[Leo]** Passer Claude Code sur le cloud (0.8) : retirer de `settings.json` le routage LM Studio, choisir Haiku 4.5 dans le sélecteur de modèle, fixer un plafond de dépense dans la console Anthropic si Claude Code est facturé à l'API
- [x] Init Next.js (TS strict, ESLint, Prettier), Tailwind, shadcn/ui
- [x] Vitest ; scripts `lint`, `typecheck`, `test`, `build`, `db:migrate`, `db:seed` ; `.env.example` (section 12)
- [ ] **[Leo]** Créer le projet Supabase (région UE) et renseigner `.env.local` (URLs de base, clés)
- [ ] Prisma + connexion Supabase (URL poolée / directe), première migration
- [ ] Outillage (0.7) : `.mcp.json` findskills, `AGENTS.md` Vercel, skill `web-design-guidelines`
- [ ] **[Leo + Claude]** Choix du `DESIGN.md` ; puis copie à la racine, adaptation, tokens traduits en variables CSS shadcn + thème Tailwind, page `/design` de démonstration (couleurs, typo, boutons, cartes, champs)
- [ ] **[Leo]** Dépôt GitHub privé connecté à Vercel, variables d'environnement dans Vercel, premier déploiement

✅ L'URL Vercel répond, la migration est appliquée sur Supabase, `/design` reflète le thème, `claude mcp list` affiche findskills.

### Phase 1 — Accès restreint

- [ ] **[Leo]** Resend : domaine vérifié, SMTP custom dans Supabase Auth, inscriptions désactivées dans le dashboard Supabase
- [ ] Login OTP, `shouldCreateUser: false`
- [ ] Table `Member` + seed depuis `ALLOWED_EMAILS` (création des comptes Auth)
- [ ] Garde serveur : middleware/proxy + `requireMember()`
- [ ] RLS activé sans policy sur toutes les tables

✅ Un email autorisé se connecte ; un email hors liste ne reçoit pas de code ; la clé publique ne lit rien via l'API REST.

### Phase 2 — Pièces, espèces, plantes (saisie manuelle)

- [ ] CRUD pièces
- [ ] CRUD espèces (formulaire manuel, CareSheet éditable)
- [ ] CRUD plantes + archivage
- [ ] Upload photo : compression navigateur → URL signée → bucket privé → ligne `Photo`

✅ Je crée une pièce, une espèce et une plante avec photo depuis mon téléphone.

### Phase 3 — Moteur d'arrosage & planning

- [ ] `lib/watering` (6.1 → 6.6, 6.8) + tests (6.7, 6.8)
- [ ] Écran « Aujourd'hui » : Arrosé ✓, Sol humide, Tout arrosé par pièce
- [ ] Écran Planning 7 j / 4 semaines
- [ ] Explication de l'intervalle sur la fiche plante
- [ ] Journal : ajout manuel engrais / rempotage

✅ Tests verts ; marquer un arrosage retire la plante de la liste du jour et la replanifie correctement ; les autres membres le voient.

### Phase 4 — IA : fiches, conseils, import

- [ ] Client IA, schémas Zod, mock, `AiUsage`, quota journalier
- [ ] Génération de fiche + noms ambigus + réutilisation d'une espèce existante
- [ ] Ajout de plante en cours d'année avec fiche auto
- [ ] Import initial en lot + écran de validation
- [ ] Seed depuis `data/inventaire.md`

✅ Je colle ma liste, j'obtiens toutes les fiches, je valide, le planning se remplit.

### Phase 5 — Diagnostic photo

- [ ] Formulaire (photos + symptômes + texte)
- [ ] Construction du contexte + appel vision + validation Zod
- [ ] Écran résultat + « Appliquer l'ajustement »
- [ ] Historique dans le journal de la plante

✅ Une photo de feuille jaune donne des causes classées, des actions et, si pertinent, un ajustement applicable.

### Phase 6 — Rappels, PWA, mise en prod

- [ ] Cron quotidien + email + `DigestLog` + `CRON_SECRET`
- [ ] **[Leo]** Variables de prod dans Vercel (`CRON_SECRET`, `ANTHROPIC_API_KEY`, `AI_MOCK=false`, `RESEND_API_KEY`…) ; plafond de dépense dans la console Anthropic
- [ ] Manifest PWA + icônes
- [ ] Export JSON des données (Réglages)
- [ ] Audit complet de l'UI avec la skill `web-design-guidelines` (accessibilité, cibles tactiles ≥ 44 px, contrastes, états vides / erreur) + corrections
- [ ] README : installation, variables, déploiement, export

✅ Je reçois l'email du matin ; l'app s'installe sur l'écran d'accueil ; le dashboard Supabase montre une activité quotidienne.

### Phase 7 — Capteurs SwitchBot

- [ ] **[Leo]** Prérequis SwitchBot (16.1) ; `SWITCHBOT_TOKEN`, `SWITCHBOT_SECRET`, `SENSOR_WEBHOOK_SECRET` dans `.env.local` et Vercel
- [ ] Modèles `Sensor`, `SensorReading`, `AlertLog` + migration
- [ ] Client API v1.1 : signature (testée), liste des Meter, statut
- [ ] Réglages › Capteurs : association capteur ↔ pièce, bouton « Activer le webhook »
- [ ] Route webhook + anti-bruit + relevé de secours dans le cron quotidien
- [ ] Température / humidité mesurées injectées dans le moteur, avec repli sur les estimations
- [ ] Alertes froid / chaud par email

✅ Les 2 capteurs remontent dans l'app ; l'explication de l'intervalle affiche « mesuré » ; une alerte froid provoquée (seuil temporairement relevé) arrive par email.

### Backlog V2 (pas sans validation)

- Notifications push web
- Planning d'engrais et de rempotage
- Météo extérieure pour plantes de balcon / terrasse
- Mode vacances (répartir les arrosages entre membres)
- Export calendrier (.ics)
- Identification d'espèce par photo seule
- Apprentissage automatique des intervalles

---

## 12. Variables d'environnement (`.env.example`)

```bash
# Base (Prisma)
DATABASE_URL=                          # URL poolée Supabase
DIRECT_URL=                            # URL directe (migrations)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # clé publique (ex-« anon »)
SUPABASE_SECRET_KEY=                   # clé secrète (ex-« service_role »), serveur uniquement
SUPABASE_BUCKET=plant-photos

# Accès
ALLOWED_EMAILS=toi@exemple.be,autre@exemple.be

# IA
ANTHROPIC_API_KEY=
AI_MODEL_PROFILE=claude-haiku-4-5-20251001
AI_MODEL_DIAGNOSIS=claude-haiku-4-5-20251001   # moins cher ; passer à claude-sonnet-5-5 si les diagnostics déçoivent
AI_DAILY_LIMIT=20
AI_MOCK=true                           # dev : true ; prod : false

# Emails
RESEND_API_KEY=
EMAIL_FROM="Arrosoir <plantes@mondomaine.be>"

# Capteurs SwitchBot (phase 7)
SWITCHBOT_TOKEN=
SWITCHBOT_SECRET=
SENSOR_WEBHOOK_SECRET=                 # chaîne aléatoire longue, mise dans l'URL du webhook
HEAT_ALERT_C=35

# Divers
CRON_SECRET=
APP_URL=https://arrosoir.vercel.app
APP_TIMEZONE=Europe/Brussels
HEATING_SEASON_START=10-15
HEATING_SEASON_END=04-15
```

---

## 13. Contenu de `CLAUDE.md`

Lu à chaque session. Volontairement court (coût du contexte).

```md
# Arrosoir — règles du projet

Claude Code (cloud Anthropic, au moindre coût) réalise le plan phase par phase ; Leo valide en fin de phase.

## Démarrage
- Lire ce fichier, puis PLAN.md : §0 (mode de travail) et seulement les sections utiles à l'étape en cours (§11 pour la phase).
- Cocher les cases de PLAN.md au fur et à mesure.

## Règles
- Pas de fonctionnalité, de dépendance ni de refactoring hors périmètre sans demander à Leo (backlog V2 = pas sans validation).
- Doute, ambiguïté, API ou limite qui semble différente du plan : vérifier la doc officielle, signaler l'écart avant d'adapter.
- Avant de clore une étape : lint, typecheck, test, build. Après 2 tentatives de correction infructueuses : stop, rapport avec les erreurs brutes.
- Un commit par étape `pN-eM: …`. Jamais de push, de déploiement ni d'action irréversible sans l'accord de Leo.
- Fin de phase : revue `web-design-guidelines` (phases avec UI), critère ✅ vérifié, résumé court, puis stop et attendre la validation.
- Coûts : modèle par défaut Haiku 4.5, lecture ciblée (grep, plages de lignes), sessions courtes (PLAN.md §0.8).
- Skills : chercher avec le MCP findskills quand une tâche s'y prête ; ne jamais installer une skill trouvée sans avoir montré sa source et son contenu à Leo.

## Code
- Code, noms de variables et commits en anglais ; UI et contenus en français.
- TypeScript strict, pas de `any`. Validation Zod à chaque frontière (formulaires, IA, routes API).
- `lib/watering` reste pur (aucun import Prisma/Next) et couvert par les tests.
- Jamais de clé secrète côté client. Tout accès aux données = serveur + `requireMember()`.
- Dates : toujours via `lib/dates` (fuseau Europe/Brussels). Photos : URL d'upload signée, jamais via Server Action.
- UI : lire DESIGN.md et AGENTS.md avant tout travail d'UI ; tokens du thème, jamais de couleur en dur ; ignorer la partie « Vercel-specific » d'AGENTS.md (casse de phrase, guillemets « », formats fr-BE) ; champs ≥ 16 px sur mobile.
- Priorités : PLAN.md > accessibilité (AGENTS.md) > style (DESIGN.md). Conflit → demander à Leo.

## Commandes
npm run dev | lint | typecheck | test | build | db:migrate | db:seed
```

---

## 14. Données initiales — `data/inventaire.md`

Fichier fourni (5 pièces, 8 plantes). Format :

- Pièces : `nom | lumière | temp été °C | temp hiver °C | humidité | radiateur proche | remarque`
- Plantes : `surnom | espèce (nom botanique) | pièce | pot (diamètre cm + matière, optionnel) | remarque (optionnel)`

Le seed ignore les commentaires `<!-- -->`, crée une seule `Species` par nom botanique (les deux Monstera partagent la même fiche), et signale toute pièce inconnue au lieu de l'inventer.

---

## 15. Points d'attention

- Les fiches IA peuvent se tromper → toujours relues, modifiables, marquées « à valider ».
- Pas de sauvegarde automatique sur Supabase Free → lancer l'export JSON de temps en temps.
- Si le projet Supabase est mis en pause malgré tout (cron raté plusieurs jours), il se relance depuis le dashboard.
- Les coûts variables sont l'IA de l'app et Claude Code : plafond dans la console Anthropic, quota dans l'app, sessions courtes (0.8).

---

## 16. Capteurs SwitchBot (phase 7)

Matériel : **2 × SwitchBot Meter + 1 Hub Mini**. Les Meter parlent en Bluetooth au hub, qui remonte les mesures au cloud SwitchBot ; l'app les récupère par l'API SwitchBot v1.1.
Référence : dépôt officiel `OpenWonderLabs/SwitchBotAPI` (README + `devices/sensors/meter.md` pour le format exact des événements Meter).

### 16.1 Prérequis (manuel, par moi)

- Ajouter le Hub Mini et les 2 Meter dans l'app SwitchBot, les nommer d'après leur pièce.
- Activer le service cloud pour les Meter (« Cloud Services » ou « Third-party Services » selon la version de l'app).
- Récupérer token + secret : Profil › Préférences › À propos › taper 10 fois sur la version de l'app › Options développeur › Get Token.

### 16.2 Client API (`lib/sensors/switchbot.ts`)

- Base `https://api.switch-bot.com`. En-têtes : `Authorization` (token), `t` (timestamp en ms, 13 chiffres), `nonce` (UUID), `sign`.
- `sign` = HMAC-SHA256 avec le secret sur `token + t + nonce`, encodé en base64. La doc parle aussi d'une mise en majuscules que son propre exemple JavaScript n'applique pas → suivre l'exemple JS ; en cas de 401, tester la variante en majuscules et garder celle qui fonctionne. Test unitaire sur la fonction de signature.
- `GET /v1.1/devices` → liste des appareils ; ne garder que les Meter.
- `GET /v1.1/devices/{deviceId}/status` → `temperature`, `humidity` (+ `battery` si présent).
- Webhook : `POST /v1.1/webhook/setupWebhook` avec `{ "action": "setupWebhook", "url": "…", "deviceList": "ALL" }` ; existent aussi `queryWebhook`, `updateWebhook`, `deleteWebhook`. Un seul webhook pour tout le compte.
- Quota : 10 000 appels/jour, usage personnel uniquement → on en consommera quelques dizaines.

### 16.3 Réception par webhook (source principale)

Route `POST /api/sensors/switchbot?key=<SENSOR_WEBHOOK_SECRET>` :

- Clé comparée en temps constant. SwitchBot ne signe pas ses webhooks : le secret dans l'URL sert d'authentification. Mauvaise clé → 401.
- Corps attendu : `{ eventType: "changeReport", eventVersion, context: { deviceType, deviceMac, temperature, humidity, timeOfSample, … } }`, validé par Zod en mode permissif (champs inconnus ignorés). Autre type d'appareil → 200 sans traitement.
- Rapprochement : `deviceMac` normalisé (sans `:`, en majuscules) = `Sensor.externalId`. En dev, journaliser le premier payload reçu pour confirmer le format.
- Anti-bruit : enregistrer une mesure seulement si ≥ 15 min depuis la précédente, ou si l'écart dépasse 0,5 °C ou 3 % HR.
- Répondre 200 rapidement, puis vérifier les alertes (16.5). Mettre à jour `lastSeenAt` et `battery`.

### 16.4 Relevé de secours

Le cron quotidien (section 9) appelle aussi `/status` pour chaque capteur associé → au moins un relevé par jour même si les webhooks s'arrêtent.

### 16.5 Utilisation dans l'app

- **Moteur** : pour une pièce avec capteur actif, `T` = moyenne des mesures des 7 derniers jours ; l'humidité mesurée remplace la catégorie (< 40 % → DRY, 40–65 % → NORMAL, > 65 % → HUMID). Aucune mesure depuis 24 h → retour aux valeurs estimées + badge « capteur muet ».
- **Transparence** : `explainInterval()` indique la source, ex. « 22,4 °C (mesuré, moyenne 7 j) » ou « 20 °C (estimé) ».
- **Alertes immédiates** par email aux membres `notifyDaily`, au plus 1 par pièce et par type toutes les 12 h (`AlertLog`) :
  - froid : dernière mesure < `minTemp` d'une plante de la pièce (remplace l'estimation de 6.8 quand un capteur existe) ;
  - chaud : dernière mesure > `HEAT_ALERT_C` (défaut 35 °C, pour la véranda l'été).
- **Écrans** : Pièces → température / humidité actuelles + mini-courbe 7 jours. Réglages › Capteurs → Meter du compte, association capteur ↔ pièce, « Activer le webhook », dernier relevé, batterie.
- Volume : quelques Mo par an, aucune purge nécessaire.
