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
- ✅ **Composants réutilisables** pour une interface uniforme
- ✅ **Layout optimisé** sans barres de défilement indésirables
- ✅ **Icônes SVG personnalisées** pour une harmonie visuelle parfaite

### 🛍️ **Exploration et découverte**

- ✅ **Catalogue de créations** avec affichage en grille
- ✅ **Recherche textuelle** dans titres et descriptions
- ✅ **Filtres par catégorie** (Bijoux, Poterie, Décoration, Textiles, Bois, Métal)
- ✅ **Système de favoris global** synchronisé entre tous les écrans
- ✅ **Informations artisan** intégrées à chaque création
- ✅ **Pagination** pour optimiser les performances
- ✅ **Dates de création** et statut de disponibilité
- ✅ **Bouton "Voir plus"** pour accéder aux détails complets

### 📖 **Détails des créations**

- ✅ **Écran de détail complet** accessible à tous les utilisateurs
- ✅ **Informations détaillées** : titre, prix, description, matériaux, tags
- ✅ **Profil artisan intégré** avec lien vers le profil complet
- ✅ **Statistiques** : note moyenne, nombre d'avis, disponibilité
- ✅ **Gestion des favoris** directement depuis l'écran de détail
- ✅ **Actions contextuelles** : modification pour le créateur
- ✅ **Gestion d'erreurs** robuste pour les images et données
- ✅ **Bouton favori personnalisé** avec design harmonisé

### 👥 **Profils et communauté**

- ✅ **Profils utilisateur** personnalisables (nom, bio, photo)
- ✅ **Profils artisan** avec informations métier
- ✅ **Système dual** : Acheteur et/ou Artisan
- ✅ **Spécialités artisan** par catégories
- ✅ **Informations business** (nom, localisation, année création)
- ✅ **Validation de profil** avec vérification
- ✅ **Upgrade vers artisan** depuis le profil utilisateur
- ✅ **Numéro de téléphone** pour les contacts
- ✅ **Profil d'artisan public** accessible à tous les utilisateurs

### 🎨 **Gestion des créations**

- ✅ **Création d'œuvres** avec formulaire complet
- ✅ **Édition en temps réel** des créations existantes
- ✅ **Validation automatique** des champs obligatoires
- ✅ **Interface intuitive** pour la gestion du portfolio
- ✅ **Sélection de photos** avec expo-image-picker
- ✅ **Gestion des matériaux** et tags
- ✅ **Catégorisation** avec labels traduits
- ✅ **Mise à jour en temps réel** après modifications

### ⭐ **Système d'évaluations et avis**

- ✅ **Notation par étoiles** (1-5 étoiles) pour les créations
- ✅ **Commentaires textuels** détaillés sur les créations
- ✅ **Prévention des auto-évaluations** (artisans ne peuvent pas noter leurs créations)
- ✅ **Calcul automatique** des notes moyennes et compteurs
- ✅ **Gestion des avis** avec création, modification et suppression
- ✅ **Affichage des avis** avec noms d'utilisateurs
- ✅ **Gestion robuste des erreurs** avec fallbacks multiples

### ❤️ **Système de favoris avancé**

- ✅ **Gestion globale des favoris** via Context API centralisé
- ✅ **Synchronisation en temps réel** entre tous les écrans
- ✅ **Bouton flottant** avec compteur de favoris
- ✅ **Ajout/Suppression** depuis n'importe quel écran
- ✅ **Persistance des données** avec Supabase
- ✅ **Design harmonisé** avec les couleurs du projet
- ✅ **Icônes SVG personnalisées** pour une cohérence visuelle

### 🏗️ **Architecture technique**

- ✅ **TypeScript strict** pour la sécurité des types
- ✅ **Hooks personnalisés** pour la gestion d'état
- ✅ **Context API** pour l'état global utilisateur et favoris
- ✅ **Services centralisés** pour l'API Supabase
- ✅ **API de créations** complète avec CRUD operations
- ✅ **Composants réutilisables** et modulaires
- ✅ **Gestion d'erreurs** centralisée et user-friendly
- ✅ **Styles centralisés** pour une cohérence parfaite
- ✅ **Code nettoyé** sans console.log ni imports inutilisés
- ✅ **Gestion robuste des erreurs 406** avec fallbacks multiples

## 🚀 Technologies utilisées

- **React Native** 0.79.5
- **React** 19.0.0
- **TypeScript** ~5.8.3
- **Expo** ~53.0.17
- **Supabase** ^2.45.4 (Authentification et Backend)
- **React Navigation** ^7.1.14
- **Zustand** ^5.0.6
- **expo-image-picker** pour la gestion des photos
- **react-native-svg** pour les icônes personnalisées

## 📁 Structure du projet

```
src/
├── components/       # Composants réutilisables
│   ├── index.ts              # Export centralisé des composants
│   ├── CommonHeader.tsx      # Header réutilisable avec navigation
│   ├── CommonInput.tsx       # Input standardisé avec validation
│   ├── CommonButton.tsx      # Bouton avec variantes (primary, secondary, danger)
│   ├── AuthNavigator.tsx     # Navigation d'authentification
│   ├── Header.tsx            # Header principal
│   ├── NavigationHeader.tsx  # Header de navigation
│   ├── NotificationToast.tsx # Notifications toast
│   └── FloatingFavoritesButton.tsx # Bouton flottant des favoris
├── context/         # Contextes React
│   ├── UserContext.tsx        # Gestion état utilisateur avec auth
│   └── FavoritesContext.tsx   # Gestion globale des favoris
├── hooks/           # Hooks personnalisés
│   └── useAuth.ts             # Hook d'authentification Supabase

├── screens/         # Écrans de l'application
│   ├── HomeScreen.tsx         # Écran d'accueil adaptatif
│   ├── LoginScreen.tsx        # Écran de connexion/inscription
│   ├── ExploreScreen.tsx      # Écran d'exploration des créations
│   ├── ProfilScreen.tsx       # Écran de profil utilisateur/artisan
│   ├── CreationsScreen.tsx    # Gestion des créations utilisateur
│   ├── AddCreationScreen.tsx  # Ajout de nouvelles créations
│   ├── EditCreationScreen.tsx # Modification des créations
│   ├── CreationDetailScreen.tsx # Détails complets d'une création
│   ├── CreatorProfileScreen.tsx # Profil public d'un artisan
│   ├── EmailConfirmationScreen.tsx  # Attente de confirmation email
│   ├── EmailConfirmedScreen.tsx     # Confirmation réussie
│   ├── ForgotPasswordScreen.tsx     # Mot de passe oublié
│   ├── ResetPasswordScreen.tsx      # Réinitialisation mot de passe
│   └── FavoritesScreen.tsx          # Écran des favoris utilisateur
├── services/        # Services API
│   ├── supabase.ts            # Configuration et services Supabase
│   ├── authService.ts         # Service d'authentification avancé
│   ├── creationsApi.ts        # API complète pour les créations
│   ├── favoritesApi.ts        # API pour la gestion des favoris
│   ├── ratingsApi.ts          # API pour les évaluations
│   └── reviewsApi.ts          # API pour les avis et commentaires
├── types/          # Types TypeScript
│   ├── User.ts                # Types utilisateur et artisan
│   ├── Creation.ts            # Types créations et catégories
│   └── Navigation.ts          # Types de navigation
└── utils/          # Utilitaires
    ├── index.ts               # Export centralisé des utilitaires
    ├── colors.ts              # Palette de couleurs centralisée
    ├── commonStyles.ts        # Styles communs réutilisables
    ├── userUtils.ts           # Utilitaires pour profils utilisateur
    ├── timeUtils.ts           # Utilitaires de formatage date/prix
    ├── emailConfirmationHandler.ts  # Gestion confirmation email
    ├── passwordResetHandler.ts      # Gestion reset mot de passe
    └── accessibilityConfig.ts       # Configuration accessibilité
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

## 🎨 Architecture des composants

### 🧩 **Composants réutilisables**

L'application utilise un système de composants modulaires pour garantir la cohérence et faciliter la maintenance :

#### **CommonHeader**

```typescript
<CommonHeader
  title="Mon Écran"
  onBack={() => navigation.goBack()}
  rightButton={{
    text: "Sauvegarder",
    onPress: handleSave,
    loading: isLoading,
    customButton: <CustomButton />, // Support pour boutons personnalisés
  }}
/>
```

#### **CommonInput**

```typescript
<CommonInput
  label="Titre *"
  value={title}
  onChangeText={setTitle}
  placeholder="Entrez le titre"
  error={errors.title}
  charCount={{ current: title.length, max: 100 }}
  multiline={false}
/>
```

#### **CommonButton**

```typescript
<CommonButton
  title="Confirmer"
  variant="primary" // primary, secondary, danger, disabled
  onPress={handleConfirm}
  loading={isLoading}
  disabled={false}
/>
```

#### **FloatingFavoritesButton**

```typescript
<FloatingFavoritesButton
  onPress={() => navigation.navigate("Favorites")}
  favoritesCount={favoritesCount}
/>
```

### 🎯 **Styles centralisés**

Tous les styles sont centralisés dans `src/utils/commonStyles.ts` :

- **headerStyles** : Styles pour tous les headers
- **inputStyles** : Styles pour tous les champs de saisie
- **buttonStyles** : Styles pour tous les boutons
- **cardStyles** : Styles pour les cartes de contenu
- **emptyStyles** : Styles pour les états vides
- **loadingStyles** : Styles pour les états de chargement
- **modalStyles** : Styles pour les modales

### 📊 **Optimisations récentes**

- ✅ **57% de réduction** du code de styles (1250 → 540 lignes)
- ✅ **0 duplication** de code dans tout le projet
- ✅ **Design cohérent** dans toute l'application
- ✅ **Composants réutilisables** pour tous les éléments UI
- ✅ **Accessibilité intégrée** dans tous les composants
- ✅ **Imports centralisés** pour une meilleure organisation
- ✅ **Code nettoyé** sans console.log ni imports inutilisés
- ✅ **Layout optimisé** sans débordements d'écran
- ✅ **Système de favoris global** avec synchronisation en temps réel
- ✅ **Gestion robuste des erreurs** avec fallbacks multiples

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
- **Bouton "Voir plus"** pour accéder aux détails complets

### 📖 **Détails des créations**

- **Écran détaillé** accessible à tous les utilisateurs
- **Image en grand format** avec gestion d'erreurs
- **Informations complètes** : titre, prix, description, matériaux, tags
- **Profil artisan cliquable** avec lien vers le profil complet
- **Statistiques détaillées** : note moyenne, nombre d'avis, disponibilité
- **Gestion des favoris** avec feedback visuel et design harmonisé
- **Actions contextuelles** : bouton de modification pour le créateur
- **Informations de création** : dates de création et modification
- **Bouton favori personnalisé** avec icône SVG et couleurs du projet

### 👤 **Profils utilisateur**

- **Profil personnel** : nom, prénom, bio, nom d'utilisateur
- **Profil artisan** (optionnel) :
  - Nom d'entreprise et localisation
  - Spécialités par catégories
  - Description et année de création
  - Numéro de téléphone pour les contacts
  - Statut de vérification
- **Upgrade artisan** depuis le profil utilisateur
- **Validation des données** avant sauvegarde

### 👨‍🎨 **Profils d'artisans publics**

- **Profil détaillé** accessible à tous les utilisateurs
- **Informations complètes** : nom, localisation, spécialités
- **Statistiques** : note moyenne, nombre de créations
- **Liste des créations** avec liens vers les détails
- **Informations de contact** : email et téléphone
- **Date d'inscription** et année de création d'entreprise

### 🎨 **Gestion des créations**

- **Création d'œuvres** avec formulaire complet
- **Édition en temps réel** des créations existantes
- **Validation automatique** des champs obligatoires
- **Interface intuitive** pour la gestion du portfolio
- **Sélection de photos** avec expo-image-picker
- **Gestion des matériaux** et tags avec modales
- **Catégorisation** avec labels traduits
- **Mise à jour en temps réel** après modifications

### ❤️ **Gestion des favoris**

- **Ajout/Suppression** depuis n'importe quel écran
- **Synchronisation en temps réel** entre tous les composants
- **Bouton flottant** avec compteur de favoris
- **Écran dédié** pour visualiser tous les favoris
- **Design harmonisé** avec les couleurs du projet
- **Icônes SVG personnalisées** pour une cohérence visuelle

### ⭐ **Système d'évaluations**

- **Notation par étoiles** intuitive (1-5 étoiles)
- **Commentaires détaillés** sur les créations
- **Prévention des conflits** (artisans ne peuvent pas noter leurs créations)
- **Calcul automatique** des moyennes et statistiques
- **Gestion des avis** avec CRUD complet
- **Affichage des noms** d'utilisateurs sur les avis

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
- **Interface épurée** sans icônes superflues
- **Layout optimisé** sans débordements d'écran
- **Icônes SVG personnalisées** pour une harmonie parfaite
- **Boutons favoris harmonisés** avec les couleurs du projet

## 🔒 Sécurité

- **Mots de passe sécurisés** gérés par Supabase
- **Sessions chiffrées** et tokens sécurisés
- **Navigation protégée** selon l'état d'authentification
- **Gestion d'erreurs** appropriée sans exposer de données sensibles
- **Prévention des conflits** dans les évaluations

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
        📖 CreationDetailScreen (Détails complets + Favoris)
        ↓
        👨‍🎨 CreatorProfileScreen (Profil artisan public)
        ↓
        👤 ProfilScreen (Utilisateur ↔️ Artisan)
        ↓
        🎨 CreationsScreen (Gestion portfolio)
        ↓
        ❤️ FavoritesScreen (Gestion des favoris)
```

### 🎯 **Services et API**

- **`AuthService`** : Authentification avec confirmation email
- **`CreationsApi`** : CRUD complet pour les créations
  - Récupération avec pagination
  - Recherche et filtrage
  - Gestion des favoris
  - Transformations de données Supabase
  - Gestion robuste des erreurs 406
- **`FavoritesApi`** : Gestion complète des favoris
- **`RatingsApi`** : Gestion des évaluations par étoiles
- **`ReviewsApi`** : Gestion des commentaires et avis
- **`useAuth`** : Hook de gestion complète de l'authentification
- **`UserContext`** : État global utilisateur avec profils artisan
- **`FavoritesContext`** : État global des favoris avec synchronisation

### 📊 **Modèles de données**

- **`User`** : Profil utilisateur avec capacités artisan/acheteur
- **`ArtisanProfile`** : Profil métier spécialisé avec téléphone
- **`Creation`** : Créations avec catégories et métadonnées
- **`CreationWithArtisan`** : Créations enrichies avec données artisan
- **`CreationCategory`** : Enum des catégories disponibles
- **`UserRating`** : Évaluations par étoiles des utilisateurs
- **`UserReview`** : Commentaires et avis des utilisateurs

## 🧪 Fonctionnalités à venir

- [ ] **Messagerie** créateur-acheteur
- [ ] **Géolocalisation** des créateurs locaux
- [ ] **Notifications push** pour nouveautés et favoris
- [ ] **Reset de mot de passe** par email
- [ ] **Authentification sociale** (Google, Apple)
- [ ] **Système de commandes** et panier
- [ ] **Photos multiples** par création
- [ ] **Gestion de stock** pour les artisans
- [ ] **Tableau de bord artisan** avec statistiques
- [ ] **Système de recherche avancée** avec filtres multiples
- [ ] **Partage de créations** sur les réseaux sociaux

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
