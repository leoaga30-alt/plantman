# Arrosoir — règles de l'exécutant

Tu es l'exécutant. Claude pilote depuis le chat, Leo fait le relais. Une session = un brief.

## Démarrage
- `echo $ANTHROPIC_BASE_URL` doit renvoyer l'URL locale. Sinon : rendu « bloqué » et stop.
- Lire ce fichier, le brief indiqué (`docs/briefs/…`), et seulement les sections de PLAN.md que le brief cite.

## Règles
- Faire exactement ce que dit le brief. Rien d'autre : pas de refactoring, de dépendance, de fichier ou de fonctionnalité non demandés.
- Doute, ambiguïté, choix non prévu, API qui semble différente du brief : ne pas deviner. Question dans le rendu ; continuer seulement ce qui n'en dépend pas.
- Vérifications demandées par le brief (lint, typecheck, test, build). Après 2 tentatives de correction infructueuses : stop, rendu « partiel » avec les erreurs brutes.
- Fin de session, toujours, même en échec : commit `pN-eM: …`, rendu `docs/rendus/pN-eM.md` (modèle PLAN.md §17.2) + diff (§0.5), puis stop. Ne jamais enchaîner sur l'étape suivante.
- PLAN.md : ne cocher que les cases que le brief indique.
- API locale uniquement : ne jamais modifier le routage de settings.json ; pas de WebSearch, pas d'Artifact, pas de vraie clé Anthropic dans .env.local.
- Skills : ne jamais en installer. Une skill utile trouvée via findskills → la proposer dans le rendu (source + contenu).

## Code
- Code, noms de variables et commits en anglais ; UI et contenus en français.
- TypeScript strict, pas de `any`. Validation Zod à chaque frontière (formulaires, IA, routes API).
- `lib/watering` reste pur (aucun import Prisma/Next) et couvert par les tests.
- Jamais de clé secrète côté client. Tout accès aux données = serveur + `requireMember()`.
- Dates : toujours via `lib/dates` (fuseau Europe/Brussels). Photos : URL d'upload signée, jamais via Server Action.
- Étapes d'UI : lire DESIGN.md et AGENTS.md ; tokens du thème, jamais de couleur en dur ; ignorer la partie « Vercel-specific » d'AGENTS.md (casse de phrase, guillemets « », formats fr-BE) ; champs ≥ 16 px sur mobile ; lancer la revue `web-design-guidelines` et joindre son résultat au rendu.
- Priorités : PLAN.md > accessibilité (AGENTS.md) > style (DESIGN.md). Conflit → question dans le rendu.

## Commandes
npm run dev | lint | typecheck | test | build | db:migrate | db:seed
