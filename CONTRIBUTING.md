# Contributing to CinéNext

Merci de votre intérêt pour contribuer à CinéNext ! 🎬

## 🚀 Pour commencer

1. **Fork** le repository
2. **Clone** votre fork : `git clone https://github.com/VOTRE_USERNAME/app-cine-next.git`
3. **Installez** les dépendances : `npm install`
4. **Lancez** le projet : `npm run dev`

## 📝 Guidelines

### Code style

- Utilisez **TypeScript** pour tout nouveau code
- Suivez les règles ESLint existantes
- Nommez vos composants en PascalCase (`MonComposant.tsx`)
- Utilisez les hooks personnalisés pour la logique réutilisable

### Commits

Utilisez des messages de commit conventionnels :

```
feat: ajouter une nouvelle fonctionnalité
fix: corriger un bug
docs: modifier la documentation
style: changements de formatage (pas de changement de code)
refactor: refactorisation du code
test: ajouter des tests
chore: tâches de maintenance
```

Exemple : `feat: ajouter le support pour Pathé Gaumont`

### Branches

- `main` : branche stable, production
- `feature/nom-feature` : nouvelles fonctionnalités
- `fix/nom-bug` : corrections de bugs
- `docs/nom-doc` : documentation

### Pull Requests

1. Assurez-vous que `npm run build` et `npm run lint` passent sans erreur
2. Décrivez clairement ce que fait votre PR
3. Mentionnez les issues liées avec `Fixes #123`
4. Demandez une review quand c'est prêt

## 🧪 Tests

Avant de soumettre une PR :

```bash
# Vérifier le linting
npm run lint

# Build pour production
npm run build

# Vérifier le preview
npm run preview
```

## 🎯 Idées de contributions

- [ ] Ajouter d'autres sources que AlloCiné
- [ ] Support multi-modèles avec fallback
- [ ] Export des séances (CSV, ICS)
- [ ] Notifications push pour les séances
- [ ] Mode offline avec PWA
- [ ] Tests unitaires (Jest/Vitest)
- [ ] Internationalisation (i18n)
- [ ] Mode sombre

## 💬 Questions ?

Ouvrez une **issue** ou rejoignez la discussion !

Merci ! 🍿
