# CinéNext

Application React + TypeScript + Vite pour récupérer les séances de cinéma à venir (dans les 30 prochaines minutes) depuis des pages AlloCiné.

## Fonctionnalités

- **Récupération automatique** des séances depuis les pages AlloCiné de vos cinémas favoris
- **Extraction IA** via OpenRouter (modèle Claude) pour parser le HTML
- **Cache local** configurable pour éviter les appels API répétés
- **Logs détaillés** de tous les appels (Jina AI, OpenRouter, cache)
- **Interface brutalisme** avec Tailwind CSS

## Architecture

### Stack technique
- **Framework** : React 19 + TypeScript
- **Build** : Vite 7
- **Styling** : Tailwind CSS 4
- **Linting** : ESLint 9

### Structure du projet
```
src/
├── App.tsx                    # Point d'entrée, navigation entre pages
├── main.tsx                   # Bootstrap React
├── types/index.ts             # Types TypeScript (Cinema, Showtime, Config...)
├── pages/
│   ├── HomePage.tsx           # Page principale - liste des séances
│   ├── ConfigurationPage.tsx  # Gestion config (API key, cinémas, cache)
│   └── LogsPage.tsx           # Visualisation des logs
├── components/
│   ├── Navigation.tsx         # Barre de navigation
│   ├── CinemaCard.tsx         # Carte d'affichage d'un cinéma + ses séances
│   ├── CinemaList.tsx         # Liste des cinémas configurés
│   └── ApiKeyInput.tsx        # Input pour la clé API
├── hooks/
│   ├── useConfig.ts           # Gestion de la config (localStorage)
│   └── useCache.ts            # Gestion du cache (localStorage)
└── services/
    ├── showtimes.ts           # Logique de récupération des séances
    └── logging.ts             # Service de logging
```

## Flux de données

1. **HomePage** appelle `fetchShowtimes(cinema, config)`
2. **showtimes.ts** :
   - Récupère le markdown via Jina AI (`r.jina.ai/`)
   - Appelle OpenRouter avec un prompt système pour extraire les séances
   - Filtre les séances dans les 30 prochaines minutes
   - Retourne les séances formatées
3. **useCache** met en cache les résultats dans localStorage
4. **Logs** enregistrent tous les appels pour debugging

## Configuration requise

### 1. Clé API OpenRouter
- Créer un compte sur [openrouter.ai](https://openrouter.ai)
- Générer une clé API
- La configurer dans l'onglet "Configuration"

### 2. Cinémas
- Ajouter des cinémas avec leur URL AlloCiné
- Format attendu : `https://www.allocine.fr/seance/salle_gen_csalle=[CODE].html`

Exemples :
- MK2 Beaubourg : `https://www.allocine.fr/seance/salle_gen_csalle=C0071.html`
- UGC Ciné Cité Les Halles : `https://www.allocine.fr/seance/salle_gen_csalle=C0159.html`

### 3. Cache
- Durée configurable (défaut: 15 minutes)
- Évite les appels API répétés pour les mêmes données

## Scripts disponibles

```bash
# Développement (accessible sur dev.hosakka.studio)
npm run dev

# Build production
npm run build

# Linting
npm run lint

# Preview build
npm run preview
```

## Déploiement

L'application est configurée pour fonctionner sur `dev.hosakka.studio` (voir `vite.config.ts`) :
```ts
server: {
  host: '0.0.0.0',
  allowedHosts: ['dev.hosakka.studio'],
}
```

## Points clés du code

### Extraction des séances (`services/showtimes.ts`)
- Utilise Jina AI pour convertir les pages HTML en markdown
- Envoie le markdown à OpenRouter (Claude) avec un prompt spécifique
- Parse la réponse JSON pour extraire les séances
- Filtre côté client pour ne garder que les séances dans les 30 prochaines minutes

### Configuration persistante (`hooks/useConfig.ts`)
- Stockée dans localStorage sous la clé `cinenext-config`
- Contient : apiKey, cinemas, cacheDurationMinutes
- Les modèles IA sont hardcodés (`anthropic/claude-haiku-4.5`)

### Cache (`hooks/useCache.ts`)
- Clé : `cinenext-cache-{cinemaId}`
- TTL configurable (en minutes)
- Stocke markdown + showtimes + timestamp

### Logs (`services/logging.ts`)
- Stockés dans localStorage sous `cinenext-logs`
- Maximum 100 entrées
- Niveaux : info, success, error, warning
- Services : jina, openrouter, cache, app

## Modèles IA utilisés

Actuellement : `anthropic/claude-haiku-4.5`

Le prompt système est conçu pour extraire :
- Titre du film
- Horaire (HH:MM)
- Salle (optionnel)
- Version VF/VO/3D (optionnel)
- URL AlloCiné du film

## Améliorations possibles

- [ ] Ajouter d'autres sources que AlloCiné
- [ ] Support multi-modèles avec fallback
- [ ] Export des séances (CSV, ICS)
- [ ] Notifications push pour les séances
- [ ] Mode offline avec PWA
- [ ] Tests unitaires (Jest/Vitest)

## Notes de développement

- L'application utilise des événements custom (`navigate`, `navigate-to-logs`) pour la navigation
- Les styles utilisent une approche "brutaliste" (bordures épaisses, ombres dures)
- Le parsing des horaires est fait côté client comme sécurité supplémentaire
