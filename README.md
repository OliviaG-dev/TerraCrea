# TerraCréa 🌱

Une application React Native moderne construite avec TypeScript, Expo et les meilleures pratiques de développement.

## 📋 Vue d'ensemble

TerraCréa est une application React Native starter qui utilise les technologies les plus récentes et les meilleures pratiques de développement. Elle fournit une base solide pour développer des applications mobiles multiplateformes avec une architecture propre et modulaire.

## 🚀 Fonctionnalités

- ✅ **React Native** avec TypeScript strict
- ✅ **Expo** pour un développement rapide et un déploiement simplifié
- ✅ **React Navigation** pour la navigation entre écrans
- ✅ **TanStack Query** pour la gestion d'état et la mise en cache des données
- ✅ **Zustand** pour la gestion d'état globale
- ✅ **Axios** pour les requêtes HTTP
- ✅ **Context API** pour la gestion des utilisateurs
- ✅ **React Native Vector Icons** pour les icônes
- ✅ **Architecture modulaire** avec séparation des responsabilités

## 🛠️ Technologies utilisées

- **React Native** 0.79.5
- **React** 19.0.0
- **TypeScript** ~5.8.3
- **Expo** ~53.0.17
- **React Navigation** ^7.1.14
- **TanStack Query** ^5.82.0
- **Zustand** ^5.0.6
- **Axios** ^1.10.0

## 📁 Structure du projet

```
src/
├── components/       # Composants réutilisables
│   └── MyButton.tsx
├── context/         # Contextes React
│   └── UserContext.tsx
├── hooks/           # Hooks personnalisés
│   └── useUser.ts
├── navigation/      # Configuration de navigation
│   └── RootNavigator.tsx
├── screens/         # Écrans de l'application
│   └── HomeScreen.tsx
├── services/        # Services API
│   └── api.ts
├── types/          # Types TypeScript
│   └── User.ts
└── utils/          # Utilitaires
    └── formatDate.ts
```

## 🔧 Installation

### Prérequis

- **Node.js** 22.0.0 ou plus récent
- **npm** ou **yarn**

### Gestion des versions Node.js

Le projet utilise le fichier `.nvmrc` comme **source de vérité** pour la version Node.js. Cela garantit que :

- ✅ Le développement local et la CI/CD utilisent la même version
- ✅ Les mises à jour de version se font en un seul endroit
- ✅ Tous les développeurs utilisent la version correcte

Pour une gestion simplifiée des versions Node.js, vous pouvez utiliser **nvm** (Node Version Manager) :

```bash
# Installer nvm (Linux/Mac)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Ou pour Windows, installer nvm-windows
# https://github.com/coreybutler/nvm-windows

# Utiliser la version Node.js du projet
nvm install 22
nvm use 22

# Ou utiliser directement le fichier .nvmrc (Linux/Mac seulement)
nvm use

# Pour Windows, utiliser explicitement la version :
nvm use 22
```

**Note** : Les workflows GitHub Actions lisent automatiquement le fichier `.nvmrc` pour configurer la version Node.js.

### Installation

1. **Cloner le repository**

   ```bash
   git clone <repository-url>
   cd terracrea
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Installer Expo CLI** (si pas déjà installé)
   ```bash
   npm install -g @expo/cli
   ```

## 🚀 Développement

### Migration depuis Node.js 18

Si vous migrez depuis Node.js 18, voici les étapes recommandées :

1. **Vérifier la compatibilité des dépendances**

   ```bash
   npm outdated
   ```

2. **Mettre à jour Node.js**

   ```bash
   nvm install 22
   nvm use 22
   ```

3. **Nettoyer et réinstaller les dépendances**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Vérifier que tout fonctionne**
   ```bash
   npm run check-node
   npm start
   ```

### Démarrer l'application

```bash
# Démarrer le serveur de développement
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios

# Démarrer sur Web
npm run web
```

### Scripts disponibles

- `npm start` - Démarre le serveur de développement Expo
- `npm run android` - Lance l'application sur Android
- `npm run ios` - Lance l'application sur iOS
- `npm run web` - Lance l'application sur le web

## 📱 Fonctionnalités actuelles

- **Écran d'accueil** avec interface utilisateur de base
- **Composant bouton personnalisé** réutilisable
- **Configuration API** avec JSONPlaceholder pour les tests
- **Gestion des utilisateurs** avec Context API
- **Hook personnalisé** pour récupérer les données utilisateur
- **Formatage de dates** en français
- **Navigation** prête pour l'ajout d'écrans supplémentaires

## 🎨 Développement futur

Le projet est configuré pour supporter :

- Gestion d'état avancée avec Zustand
- Authentification utilisateur
- Écrans supplémentaires
- Intégration API complète
- Gestion des erreurs
- Tests unitaires et d'intégration

## 📝 Configuration

### TypeScript

Le projet utilise TypeScript en mode strict avec la configuration Expo de base.

### Expo

Configuration dans `app.json` avec support pour :

- iOS et Android
- Interface utilisateur adaptable
- Nouvelle architecture React Native activée
- Support web avec favicon

### API

Service API configuré avec Axios pointant vers JSONPlaceholder pour les tests de développement.

## 🚀 CI/CD et Déploiement

Le projet inclut des workflows GitHub Actions pour l'intégration continue et le déploiement automatique. Tous les workflows utilisent le fichier `.nvmrc` comme source de vérité pour la version Node.js :

### Workflows disponibles

#### 🔄 **CI (Intégration Continue)**

- **Déclenchement** : Push et Pull Request sur `main`, `master`, `develop`
- **Actions** : Vérification TypeScript, build web, validation Expo
- **Fichier** : `.github/workflows/ci.yml`

#### 🔍 **Code Quality (Qualité du code)**

- **Déclenchement** : Push et Pull Request sur `main`, `master`, `develop`
- **Actions** : Vérification TypeScript strict, audit sécurité, analyse des dépendances
- **Fichier** : `.github/workflows/code-quality.yml`

#### 📱 **EAS Build (Applications natives)**

- **Déclenchement** : Push sur `main`/`master`, tags `v*`, ou manuellement
- **Actions** : Build iOS et Android avec EAS (Expo Application Services)
- **Fichier** : `.github/workflows/eas-build.yml`
- **Profils** : `development`, `preview`, `production`

#### 🌐 **Web Deploy (GitHub Pages)**

- **Déclenchement** : Push sur `main`/`master` ou manuellement
- **Actions** : Build et déploiement de la version web sur GitHub Pages
- **Fichier** : `.github/workflows/web-deploy.yml`

#### 📦 **Expo Publish (Mises à jour OTA)**

- **Déclenchement** : Push sur `main`/`master` ou manuellement
- **Actions** : Publication de mises à jour over-the-air via EAS Update
- **Fichier** : `.github/workflows/expo-publish.yml`

### Configuration requise

#### Secrets GitHub à configurer :

1. **`EXPO_TOKEN`** : Token d'accès Expo
   - Créer sur : https://expo.dev/accounts/[username]/settings/access-tokens
   - Ajouter dans : Repository Settings > Secrets and variables > Actions

#### Pour GitHub Pages :

1. Activer GitHub Pages dans les paramètres du repository
2. Source : "GitHub Actions"

#### Pour les builds EAS :

1. Installer EAS CLI : `npm install -g @expo/eas-cli`
2. Login : `eas login`
3. Configurer le projet : `eas build:configure`

### Utilisation

```bash
# Déclenchement manuel des workflows
gh workflow run "EAS Build" --field platform=ios --field profile=preview
gh workflow run "Deploy Web to GitHub Pages"
gh workflow run "Expo Publish" --field message="Nouvelle fonctionnalité"
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur le repository GitHub.

---

Fait avec ❤️ et React Native
