# TerraCréa 🌱

Une plateforme React Native pour découvrir et acheter des créations artisanales locales, construite avec TypeScript, Expo et Supabase.

## 📋 Vue d'ensemble

TerraCréa est une application React Native moderne qui connecte les créateurs locaux avec les amateurs d'artisanat. L'application propose un système d'authentification flexible permettant aux utilisateurs de découvrir les créations en tant que visiteur ou de s'inscrire pour une expérience complète avec profils artisan, favoris et messagerie.

## ✨ Fonctionnalités principales

### 🔐 **Authentification avec Supabase**

- ✅ **Connexion/Inscription** avec email et mot de passe
- ✅ **Confirmation par email** avec écrans dédiés et renvoi possible
- ✅ **Gestion des sessions** automatique et persistante
- ✅ **Navigation conditionnelle** selon l'état d'authentification
- ✅ **Mode visiteur** pour explorer sans compte
- ✅ **Déconnexion sécurisée** avec confirmation

### 🎨 **Interface utilisateur moderne**

- ✅ **Écran d'accueil adaptatif** selon l'état de connexion
- ✅ **Écran de connexion modal** avec design élégant
- ✅ **Écran d'exploration** des créations avec recherche et filtres
- ✅ **Écran de profil** utilisateur et artisan complet
- ✅ **Navigation fluide** avec React Navigation
- ✅ **Design cohérent** avec palette de couleurs terre
- ✅ **Responsive design** pour toutes les tailles d'écran

### 🛍️ **Exploration et découverte**

- ✅ **Catalogue de créations** avec affichage en grille
- ✅ **Recherche textuelle** dans titres et descriptions
- ✅ **Filtres par catégorie** (Bijoux, Poterie, Décoration, Textiles, Bois, Métal)
- ✅ **Système de favoris** pour les créations préférées
- ✅ **Informations artisan** intégrées à chaque création
- ✅ **Pagination** pour optimiser les performances
- ✅ **Dates de création** et statut de disponibilité

### 👥 **Profils et communauté**

- ✅ **Profils utilisateur** personnalisables (nom, bio, photo)
- ✅ **Profils artisan** avec informations métier
- ✅ **Système dual** : Acheteur et/ou Artisan
- ✅ **Spécialités artisan** par catégories
- ✅ **Informations business** (nom, localisation, année création)
- ✅ **Validation de profil** avec vérification
- ✅ **Upgrade vers artisan** depuis le profil utilisateur

### 🏗️ **Architecture technique**

- ✅ **TypeScript strict** pour la sécurité des types
- ✅ **Hooks personnalisés** pour la gestion d'état
- ✅ **Context API** pour l'état global utilisateur
- ✅ **Services centralisés** pour l'API Supabase
- ✅ **API de créations** complète avec CRUD operations
- ✅ **Composants réutilisables** et modulaires
- ✅ **Gestion d'erreurs** centralisée et user-friendly

## 🚀 Technologies utilisées

- **React Native** 0.79.5
- **React** 19.0.0
- **TypeScript** ~5.8.3
- **Expo** ~53.0.17
- **Supabase** ^2.45.4 (Authentification et Backend)
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
│   └── UserContext.tsx        # Gestion état utilisateur avec auth
├── hooks/           # Hooks personnalisés
│   ├── useUser.ts
│   └── useAuth.ts             # Hook d'authentification Supabase
├── navigation/      # Configuration de navigation
│   └── RootNavigator.tsx      # Navigation conditionnelle auth/non-auth
├── screens/         # Écrans de l'application
│   ├── HomeScreen.tsx         # Écran d'accueil adaptatif
│   ├── LoginScreen.tsx        # Écran de connexion/inscription
│   ├── ExploreScreen.tsx      # Écran d'exploration des créations
│   ├── ProfilScreen.tsx       # Écran de profil utilisateur/artisan
│   ├── EmailConfirmationScreen.tsx  # Attente de confirmation email
│   └── EmailConfirmedScreen.tsx     # Confirmation réussie
├── services/        # Services API
│   ├── api.ts
│   ├── supabase.ts            # Configuration et services Supabase
│   ├── authService.ts         # Service d'authentification avancé
│   └── creationsApi.ts        # API complète pour les créations
├── types/          # Types TypeScript
│   ├── User.ts                # Types utilisateur et artisan
│   ├── Creation.ts            # Types créations et catégories
│   └── Navigation.ts          # Types de navigation
└── utils/          # Utilitaires
    ├── formatDate.ts
    ├── userUtils.ts           # Utilitaires pour profils utilisateur
    └── emailConfirmationHandler.ts
```

## 🔧 Installation

### Prérequis

- **Node.js** 22.0.0 ou plus récent
- **npm** ou **yarn**
- **Compte Supabase** (gratuit)

### Configuration Supabase

1. **Créer un projet Supabase**

   - Aller sur [supabase.com](https://supabase.com)
   - Créer un compte et un nouveau projet
   - Noter l'URL du projet et la clé API anonyme

2. **Configurer les clés dans l'application**

   ```typescript
   // Dans src/services/supabase.ts
   const supabaseUrl = "VOTRE_URL_SUPABASE";
   const supabaseKey = "VOTRE_CLE_ANONYME";
   ```

3. **Configuration de l'authentification**
   - Dans le dashboard Supabase, aller dans **Authentication** > **Settings**
   - Site URL : `http://localhost:19006` (développement)
   - Activer les confirmations email (recommandé)

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

3. **Configurer Supabase**
   - Modifier `src/services/supabase.ts` avec vos clés
4. **Démarrer l'application**
   ```bash
   npm start
   ```

## 🚀 Développement

### Scripts disponibles

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur différentes plateformes
npm run android    # Android
npm run ios        # iOS
npm run web        # Web

# Utilitaires
npm run check-node # Vérifier la version Node.js
```

## 📱 Parcours utilisateur

### 🏠 **Écran d'accueil**

- **Visiteurs non connectés** :

  - Boutons "Se connecter" et "S'inscrire" en en-tête
  - Bouton "Continuer" principal vers l'exploration
  - Interface d'exploration libre accessible

- **Utilisateurs connectés** :
  - Message de bienvenue personnalisé avec email
  - Bouton "Explorez" pour accéder aux fonctionnalités complètes
  - Accès direct au profil depuis l'en-tête
  - Bouton de déconnexion discret

### 🔍 **Exploration des créations**

- **Catalogue complet** avec affichage en grille responsive
- **Barre de recherche** pour rechercher par nom ou description
- **Filtres par catégorie** : Tout, Bijoux, Poterie, Décoration, etc.
- **Cartes de création** avec image, prix, artisan et favoris
- **Informations artisan** intégrées (nom, localisation, vérification)
- **Système de favoris** pour utilisateurs connectés
- **Pagination automatique** pour de meilleures performances

### 👤 **Profils utilisateur**

- **Profil personnel** : nom, prénom, bio, nom d'utilisateur
- **Profil artisan** (optionnel) :
  - Nom d'entreprise et localisation
  - Spécialités par catégories
  - Description et année de création
  - Statut de vérification
- **Upgrade artisan** depuis le profil utilisateur
- **Validation des données** avant sauvegarde

### 🔐 **Authentification complète**

- **Modal de connexion/inscription** accessible depuis l'accueil
- **Confirmation par email** obligatoire avec écrans dédiés
- **Renvoi d'email** en cas de non-réception
- **Écrans de confirmation** avec animations et redirections
- **Retour automatique** à l'accueil après connexion
- **Mode visiteur** toujours accessible

### 🔄 **Gestion des sessions**

- **Sessions persistantes** - L'utilisateur reste connecté
- **Vérification automatique** de la session au démarrage
- **Écoute des changements** d'état d'authentification
- **Gestion des profils** artisan et acheteur séparément
- **Déconnexion sécurisée** avec confirmation

## 🎨 Design et UX

### 🎯 **Palette de couleurs**

- **Primaire** : `#4a5c4a` (vert terre)
- **Fond** : `#fafaf9` (blanc cassé)
- **Texte secondaire** : `#7a8a7a` (gris vert)
- **Accents** : Tons terre et naturels

### 📐 **Principes de design**

- **Design cohérent** sur tous les écrans
- **Navigation intuitive** et accessible
- **Feedback visuel** approprié (loading, erreurs)
- **Expérience fluide** entre modes visiteur/connecté

## 🔒 Sécurité

- **Mots de passe sécurisés** gérés par Supabase
- **Sessions chiffrées** et tokens sécurisés
- **Navigation protégée** selon l'état d'authentification
- **Gestion d'erreurs** appropriée sans exposer de données sensibles

## 🏗️ Architecture

### 🔗 **Flux d'authentification**

```
📱 App Launch
    ↓
🔍 Session Check (useAuth)
    ↓
🏠 HomeScreen
    ├── 👤 Non connecté → Boutons Auth + Exploration libre
    │   ↓
    │   🔐 LoginScreen (modal)
    │   ├── ✅ Connexion → Vérification email → HomeScreen (connecté)
    │   ├── ✅ Inscription → EmailConfirmationScreen → EmailConfirmedScreen
    │   └── ❌ Fermer → Mode visiteur (ExploreScreen)
    │
    └── ✅ Connecté → Interface personnalisée + Profil + Favoris
        ↓
        🔍 ExploreScreen (Recherche + Filtres + Favoris)
        ↓
        👤 ProfilScreen (Utilisateur ↔️ Artisan)
```

### 🎯 **Services et API**

- **`AuthService`** : Authentification avec confirmation email
- **`CreationsApi`** : CRUD complet pour les créations
  - Récupération avec pagination
  - Recherche et filtrage
  - Gestion des favoris
  - Transformations de données Supabase
- **`useAuth`** : Hook de gestion complète de l'authentification
- **`UserContext`** : État global utilisateur avec profils artisan
- **`useFavorites`** : Hook pour la gestion des favoris

### 📊 **Modèles de données**

- **`User`** : Profil utilisateur avec capacités artisan/acheteur
- **`ArtisanProfile`** : Profil métier spécialisé
- **`Creation`** : Créations avec catégories et métadonnées
- **`CreationWithArtisan`** : Créations enrichies avec données artisan
- **`CreationCategory`** : Enum des catégories disponibles

## 🧪 Fonctionnalités à venir

- [ ] **Messagerie** créateur-acheteur
- [ ] **Géolocalisation** des créateurs locaux
- [ ] **Notifications push** pour nouveautés et favoris
- [ ] **Reset de mot de passe** par email
- [ ] **Authentification sociale** (Google, Apple)
- [ ] **Système de commandes** et panier
- [ ] **Évaluations et commentaires** sur les créations
- [ ] **Photos multiples** par création
- [ ] **Gestion de stock** pour les artisans
- [ ] **Tableau de bord artisan** avec statistiques

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

Fait avec ❤️ et React Native pour promouvoir l'artisanat local 🎨
