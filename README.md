# ChainCacao Frontend

Prototype frontend complet du projet ChainCacao, construit avec React, Vite et Chakra UI. Cette interface couvre l’essentiel du MVP demandé par le jury : authentification, navigation par rôle, capture de lots, gestion locale hors ligne, consultation publique, tableau coopérative, espace vérificateur et base PWA.

Le frontend pointe par défaut vers le backend Render: https://tg-45-backend.onrender.com

## Description de la solution

L’application fournit une interface métier mobile-first pour les acteurs de la filière cacao. Elle permet de créer et suivre des lots, préparer des captures avec photo, conserver des brouillons locaux, synchroniser les mutations dès que la connexion revient et vérifier publiquement un lot sans compte.

## Technologies utilisées

- React 19
- Vite
- TypeScript
- React Router 6
- Chakra UI 3
- Framer Motion
- Zod
- IndexedDB et localStorage
- Vitest et Testing Library

## Installation

```bash
npm install
```

## Lancement en local

```bash
npm run dev
```

## Vérifications qualité

```bash
npm run build
npm run lint
npm run test:run
```

## Fonctionnalités principales

- Connexion avec routage selon le rôle
- Tableau de bord agriculteur
- Capture de lot avec photo et brouillon local
- File de synchronisation hors ligne et reprise automatique
- Liste, recherche et détail des lots
- Espace coopérative pour le traitement des lots
- Espace vérificateur et flux de certification
- Vérification publique d’un lot via code
- Interface accessible, responsive et compatible PWA

## Organisation du dépôt

- `src/` : code source du frontend
- `public/` : manifeste PWA et service worker
- `src/test/` : tests unitaires et d’intégration


