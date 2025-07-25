# TerraCréa 🌱

Une plateforme React Native pour découvrir et acheter des créations artisanales locales, construite avec TypeScript, Expo et Supabase.

## 📋 Vue d'ensemble

TerraCréa est une application React Native moderne qui connecte les créateurs locaux avec les amateurs d'artisanat. L'application propose un système d'authentification flexible permettant aux utilisateurs de découvrir les créations en tant que visiteur ou de s'inscrire pour une expérience complète.

## ✨ Fonctionnalités principales

### 🔐 **Authentification avec Supabase**

- ✅ **Connexion/Inscription** avec email et mot de passe
- ✅ **Gestion des sessions** automatique et persistante
- ✅ **Navigation conditionnelle** selon l'état d'authentification
- ✅ **Mode visiteur** pour explorer sans compte
- ✅ **Déconnexion sécurisée** avec confirmation

### 🎨 **Interface utilisateur moderne**

- ✅ **Écran d'accueil adaptatif** selon l'état de connexion
- ✅ **Écran de connexion modal** avec design élégant
- ✅ **Navigation fluide** avec React Navigation
- ✅ **Design cohérent** avec palette de couleurs terre
- ✅ **Responsive design** pour toutes les tailles d'écran

### 🏗️ **Architecture technique**

- ✅ **TypeScript strict** pour la sécurité des types
- ✅ **Hooks personnalisés** pour la gestion d'état
- ✅ **Context API** pour l'état global utilisateur
- ✅ **Services centralisés** pour l'API Supabase
- ✅ **Composants réutilisables** et modulaires

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
│   └── UserContext.tsx    # Gestion état utilisateur avec auth
├── hooks/           # Hooks personnalisés
│   ├── useUser.ts
│   └── useAuth.ts         # Hook d'authentification Supabase
├── navigation/      # Configuration de navigation
│   └── RootNavigator.tsx  # Navigation conditionnelle auth/non-auth
├── screens/         # Écrans de l'application
│   ├── HomeScreen.tsx     # Écran d'accueil adaptatif
│   └── LoginScreen.tsx    # Écran de connexion/inscription
├── services/        # Services API
│   ├── api.ts
│   └── supabase.ts        # Configuration et services Supabase
├── types/          # Types TypeScript
│   └── User.ts            # Types utilisateur compatibles Supabase
└── utils/          # Utilitaires
    └── formatDate.ts
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
  - Bouton "Continuer" principal (vers nouveau screen)
  - Interface d'exploration libre

- **Utilisateurs connectés** :
  - Message de bienvenue personnalisé avec email
  - Bouton "Explorez" pour accéder aux fonctionnalités complètes
  - Bouton de déconnexion discret

### 🔐 **Authentification**

- **Modal de connexion/inscription** accessible depuis l'accueil
- **Basculement facile** entre connexion et inscription
- **Retour automatique** à l'accueil après connexion
- **Fermeture possible** pour rester en mode visiteur

### 🔄 **Gestion des sessions**

- **Sessions persistantes** - L'utilisateur reste connecté
- **Vérification automatique** de la session au démarrage
- **Écoute des changements** d'état d'authentification
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

## 🧪 Fonctionnalités à venir

- [ ] **Écran d'exploration** des créations
- [ ] **Profils créateurs** avec portfolios
- [ ] **Système de favoris** et collections
- [ ] **Messagerie** créateur-acheteur
- [ ] **Géolocalisation** des créateurs locaux
- [ ] **Notifications push** pour nouveautés
- [ ] **Reset de mot de passe** par email
- [ ] **Authentification sociale** (Google, Apple)

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
    │   ├── ✅ Connexion → Retour HomeScreen (connecté)
    │   ├── ✅ Inscription → Confirmation email
    │   └── ❌ Fermer → Mode visiteur
    │
    └── ✅ Connecté → Interface personnalisée + Fonctionnalités complètes
```

### 🎯 **Hooks et Context**

- **`useAuth`** : Gestion complète de l'authentification
- **`UserContext`** : État global utilisateur partagé
- **`useUserContext`** : Hook pour accéder au contexte utilisateur

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
