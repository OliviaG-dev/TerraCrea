# Tests des Services API - TerraCréa

Ce dossier contient tous les tests unitaires et d'intégration pour les services API de l'application TerraCréa.

## 📁 Structure des Tests

```
src/__tests__/
├── services/                    # Tests unitaires des services
│   ├── authService.test.ts     # Tests du service d'authentification
│   ├── creationsApi.test.ts    # Tests du service des créations
│   ├── favoritesApi.test.ts    # Tests du service des favoris
│   ├── ratingsApi.test.ts      # Tests du service des notes
│   ├── reviewsApi.test.ts      # Tests du service des avis
│   ├── suggestionsService.test.ts # Tests du service de suggestions
│   └── supabase.test.ts        # Tests de configuration Supabase
├── integration/                 # Tests d'intégration
│   └── services-integration.test.ts # Tests d'intégration des services
└── README.md                   # Ce fichier
```

## 🚀 Exécution des Tests

### Tous les tests

```bash
npm test
```

### Tests en mode watch

```bash
npm run test:watch
```

### Tests avec couverture

```bash
npm run test:coverage
```

### Tests spécifiques aux services

```bash
# Tests des services uniquement
npm test -- --testPathPattern="services"

# Test d'un service spécifique
npm test -- --testPathPattern="creationsApi"
npm test -- --testPathPattern="authService"
```

## 🧪 Services Testés

### 1. **CreationsApi** (`creationsApi.test.ts`)

- ✅ Récupération de toutes les créations
- ✅ Recherche de créations par terme et catégorie
- ✅ Récupération de tous les artisans
- ✅ Recherche d'artisans
- ✅ Recherche par ville
- ✅ Filtrage par catégorie, matériaux, tags
- ✅ Gestion des favoris (ajout/suppression)
- ✅ CRUD des créations (création, lecture, mise à jour, suppression)
- ✅ Upload d'images
- ✅ Tests de permissions

### 2. **AuthService** (`authService.test.ts`)

- ✅ Inscription avec confirmation email
- ✅ Connexion/déconnexion
- ✅ Réinitialisation de mot de passe
- ✅ Gestion des profils utilisateur
- ✅ Création et gestion des profils artisan
- ✅ Vérification des permissions

### 3. **FavoritesApi** (`favoritesApi.test.ts`)

- ✅ Récupération des favoris utilisateur
- ✅ Ajout/suppression de favoris
- ✅ Vérification du statut favori
- ✅ Basculement du statut favori
- ✅ Comptage des favoris

### 4. **RatingsApi** (`ratingsApi.test.ts`)

- ✅ Récupération des notes utilisateur
- ✅ Sauvegarde/mise à jour des notes
- ✅ Calcul des moyennes de notes
- ✅ Récupération de toutes les notes d'une création
- ✅ Vérification des permissions (pas de note sur ses propres créations)

### 5. **ReviewsApi** (`reviewsApi.test.ts`)

- ✅ Récupération des avis utilisateur
- ✅ Sauvegarde/mise à jour des avis
- ✅ Récupération de tous les avis d'une création
- ✅ Suppression d'avis
- ✅ Gestion des usernames et fallbacks
- ✅ Vérification des permissions

### 6. **SuggestionsService** (`suggestionsService.test.ts`)

- ✅ Suggestions de créations (titres, matériaux, tags, catégories)
- ✅ Suggestions d'artisans (noms, spécialités, localisations)
- ✅ Suggestions de villes
- ✅ Système de cache avec expiration
- ✅ Gestion des erreurs et fallbacks

### 7. **Supabase** (`supabase.test.ts`)

- ✅ Configuration du client Supabase
- ✅ Vérification des variables d'environnement
- ✅ Disponibilité des méthodes (auth, database, storage, RPC)

## 🔧 Configuration des Tests

### Mocks

Tous les services utilisent des mocks de Supabase pour éviter les appels réseau réels :

- `supabase.auth.*` - Méthodes d'authentification
- `supabase.from()` - Requêtes de base de données
- `supabase.storage.*` - Gestion des fichiers
- `supabase.rpc()` - Appels de fonctions PostgreSQL

### Données de Test

Chaque test utilise des données mockées réalistes :

- Utilisateurs avec IDs et emails
- Créations avec tous les champs requis
- Artisans avec profils complets
- Notes et avis avec timestamps

### Gestion des Erreurs

Les tests couvrent tous les scénarios d'erreur :

- Erreurs de base de données
- Utilisateurs non authentifiés
- Permissions insuffisantes
- Données manquantes ou invalides

## 📊 Couverture des Tests

### Objectifs de Couverture

- **Services API** : 90%+ (critique)
- **Gestion d'erreurs** : 95%+ (sécurité)
- **Logique métier** : 85%+ (qualité)
- **Intégration** : 80%+ (robustesse)

### Métriques Mesurées

- **Statements** : Instructions exécutées
- **Branches** : Chemins conditionnels
- **Functions** : Fonctions appelées
- **Lines** : Lignes de code couvertes

## 🚨 Scénarios Critiques Testés

### 1. **Sécurité**

- ✅ Utilisateurs ne peuvent pas noter leurs propres créations
- ✅ Utilisateurs ne peuvent pas commenter leurs propres créations
- ✅ Vérification des permissions avant modification/suppression
- ✅ Gestion des utilisateurs non authentifiés

### 2. **Robustesse**

- ✅ Gestion gracieuse des erreurs de base de données
- ✅ Fallbacks en cas d'échec des requêtes complexes
- ✅ Validation des données d'entrée
- ✅ Gestion des cas limites (données vides, null, undefined)

### 3. **Performance**

- ✅ Système de cache pour les suggestions
- ✅ Requêtes optimisées avec pagination
- ✅ Gestion des opérations concurrentes
- ✅ Limitation des appels API

## 🔍 Tests d'Intégration

Le fichier `services-integration.test.ts` teste :

- **Workflow complet utilisateur** : Inscription → Profil → Création → Favoris → Notes → Avis
- **Gestion d'erreurs cohérente** : Tous les services gèrent les erreurs de la même manière
- **Cohérence des données** : Vérification que les IDs et références sont cohérents
- **Performance** : Tests des opérations concurrentes
- **Cache** : Vérification du système de cache
- **Sécurité** : Tests des permissions à travers tous les services

## 🛠️ Développement

### Ajouter de nouveaux tests

1. Créer le fichier de test dans le bon dossier
2. Suivre la convention de nommage : `serviceName.test.ts`
3. Utiliser les mocks existants pour Supabase
4. Tester les cas de succès ET d'échec
5. Ajouter des tests d'intégration si nécessaire

### Exécuter des tests spécifiques

```bash
# Test d'un fichier spécifique
npm test -- src/__tests__/services/creationsApi.test.ts

# Test avec pattern
npm test -- --testNamePattern="should create creation successfully"

# Test en mode debug
npm run test:debug
```

### Déboguer les tests

```bash
# Mode verbose
npm test -- --verbose

# Mode debug avec Jest
npm test -- --detectOpenHandles --forceExit

# Tests avec console.log
npm test -- --silent=false
```

## 📈 Améliorations Futures

### Tests à ajouter

- [ ] Tests de performance avec métriques de temps
- [ ] Tests de charge avec de grandes quantités de données
- [ ] Tests de sécurité avec injection SQL simulée
- [ ] Tests de compatibilité navigateur (React Native)
- [ ] Tests de migration de base de données

### Outils à intégrer

- [ ] Jest-extended pour assertions avancées
- [ ] MSW pour mocking des API externes
- [ ] TestCafe pour tests E2E
- [ ] SonarQube pour analyse de qualité

## 🆘 Dépannage

### Erreurs communes

1. **Mocks non définis** : Vérifier que tous les mocks sont configurés dans `beforeEach`
2. **Tests qui échouent aléatoirement** : Ajouter `jest.setTimeout(10000)` pour les tests async
3. **Erreurs de Supabase** : Vérifier que les mocks simulent correctement les réponses

### Support

Pour toute question sur les tests :

1. Vérifier ce README
2. Consulter la documentation Jest
3. Examiner les tests existants comme exemples
4. Créer un ticket avec le contexte d'erreur
