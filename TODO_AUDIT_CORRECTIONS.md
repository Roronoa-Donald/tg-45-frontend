# TODO Corrections Maquette ChainCacao

Objectif: corriger tous les points de la maquette (UI, UX, interactivite, logique, i18n, accessibilite, fiabilite demo).

## 1) Transversal
- [x] Uniformiser toutes les chaines de texte via i18n (FR/EN)
- [x] Supprimer tous les textes hardcodes visibles en interface
- [x] Uniformiser labels/aria-labels des boutons et selects
- [x] Verifier coherences de statuts et badges

## 2) Landing
- [x] Localiser tous les labels statiques (trajet, listes, footer)
- [x] Remplacer les liens footer inertes par actions "Bientot disponible"
- [x] Ameliorer accessibilite des CTA et alt textes

## 3) Farmer
- [x] Corriger KPI (compter depuis lots reels)
- [x] Corriger calcul de poids mensuel
- [x] Remplacer labels hardcodes du wizard nouveau lot
- [x] Rendre le bouton "Modifier" utile (retour edition)
- [x] Verifier generation d'ID lot (unicite)

## 4) Cooperative
- [x] Filtrer reellement les lots entrants a valider
- [x] Gerer lot selectionne pour validation
- [x] Rendre "Valider" fonctionnel (update status + journey)
- [x] Rendre "Rejeter" fonctionnel (update status + journey)
- [x] Rendre "Transferer" fonctionnel (selection + update status)
- [x] Localiser tous les entetes/labels d'onglets et formulaires
- [x] Ajouter switch langue mobile

## 5) Verify
- [x] Localiser timeline/roles/actions en EN
- [x] Localiser carte EUDR (GPS origine, deforestation)
- [x] Centrer la carte sur le lot affiche
- [x] Ajouter switch langue mobile

## 6) Exporter
- [x] Corriger warnings Recharts (rendu conditionnel propre)
- [x] Localiser tous les labels hardcodes (table, dates, options)
- [x] Ameliorer action "Exporter" (update status + journey)
- [x] Ajouter switch langue mobile

## 7) Composants globaux
- [x] Localiser `BlockchainBadge`
- [x] Localiser `GlobalQuickAccess` (labels + bouton reset)
- [x] Verifier navigation mobile/desktop coherente

## 8) Validation finale
- [x] npm run lint
- [x] npm run build
- [x] Verification rapide runtime des parcours critiques
- [x] Marquer tous les items comme termines

Statut: termine le 17/04/2026.
