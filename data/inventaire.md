# Inventaire — pièces & plantes

> Fichier lu par `prisma/seed.ts` (phase 4). À placer dans `data/inventaire.md`.
> Les lignes `<!-- -->` sont des commentaires.
> ⚠️ Les valeurs des pièces (lumière, températures, humidité, radiateur) sont des **estimations** : à corriger avant le seed, surtout la véranda en hiver.

## Pièces
<!-- nom | lumière (faible / moyenne / vive / soleil direct) | temp été °C | temp hiver °C | humidité (sèche / normale / humide) | radiateur proche (oui / non) | remarque -->
Salon | moyenne | 23 | 20 | normale | oui |
Salle à manger | moyenne | 23 | 20 | normale | oui |
Véranda | soleil direct | 28 | 12 | normale | non | semi-chauffée
Cuisine | moyenne | 23 | 20 | normale | non |
Entrée sous-sol | faible | 20 | 15 | normale | non |

## Plantes
<!-- surnom | espèce (nom botanique, sert à générer la fiche) | pièce | pot : diamètre cm + matière (optionnel) | remarque (optionnel) -->
Araucaria | Araucaria heterophylla | Véranda | |
Zamioculcas | Zamioculcas zamiifolia | Salle à manger | |
Sansevieria | Sansevieria trifasciata | Véranda | | espèce supposée
Ficus | Ficus elastica 'Robusta' | Entrée sous-sol | |
Monstera n°1 | Monstera deliciosa | Salle à manger | |
Monstera n°2 | Monstera deliciosa | Véranda | |
Kalanchoe | Kalanchoe blossfeldiana | Salle à manger | | espèce supposée
Peyotl | Lophophora williamsii | Véranda | | cactus, repos hivernal au sec
