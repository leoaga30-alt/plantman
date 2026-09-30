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
