# Documentation des Tests - TerraCréa

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des tests](#architecture-des-tests)
3. [Configuration et outils](#configuration-et-outils)
4. [Types de tests](#types-de-tests)
5. [Conventions de nommage](#conventions-de-nommage)
6. [Stratégie de mocking](#stratégie-de-mocking)
7. [Tests par service](#tests-par-service)
8. [Tests d'intégration](#tests-dintégration)
9. [Utilitaires de test](#utilitaires-de-test)
10. [Commandes utiles](#commandes-utiles)
11. [Bonnes pratiques](#bonnes-pratiques)
12. [Dépannage](#dépannage)

## 📖 Vue d'ensemble

TerraCréa utilise une suite de tests complète basée sur **Vitest** pour assurer la qualité et la fiabilité du code. Les tests couvrent :

- **Services API** : Communication avec Supabase
- **Hooks React** : Logique métier côté client
- **Composants React** : Interface utilisateur
- **Utilitaires** : Fonctions helper
- **Intégration** : Flux de données entre services

### Statistiques des tests

```
📊 Couverture actuelle :
- Services: 147 tests ✅
- Intégration: 14 tests ✅
- Utils: 2 tests ✅
- Total: 163+ tests
```

## 🏗️ Architecture des tests

```
src/
├── __tests__/
│   ├── components/          # Tests des composants React
│   ├── context/             # Tests des contexts React
│   ├── hooks/               # Tests des hooks personnalisés
│   ├── integration/         # Tests d'intégration entre services
│   │   └── services-integration.test.ts
│   ├── services/            # Tests unitaires des services
│   │   ├── authService.test.ts
│   │   ├── creationsApi.test.ts
│   │   ├── favoritesApi.test.ts
│   │   ├── ratingsApi.test.ts
│   │   ├── reviewsApi.test.ts
│   │   ├── suggestionsService.test.ts
│   │   └── supabase.test.ts
│   └── utils/               # Tests des utilitaires
│       └── example.test.js
├── test-utils/              # Utilitaires et configuration
│   ├── fixtures/            # Données de test
│   ├── mocks/               # Mocks réutilisables
│   │   ├── animatedHelperMock.ts
│   │   ├── reactNativeMock.ts
│   │   └── supabaseMock.ts
│   ├── globalMocks.ts       # Mocks globaux
│   ├── index.ts             # Point d'entrée
│   └── setup.ts             # Configuration Vitest
└── services/                # Code source des services
```

## ⚙️ Configuration et outils

### Stack technologique

- **Framework de test** : [Vitest](https://vitest.dev/)
- **Mocking** : Vitest Mock Functions
- **Base de données** : Supabase (mockée)
- **React Native** : Mock complet pour l'environnement Node.js

### Configuration principale

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test-utils/setup.ts"],
    globals: true,
  },
});
```

### Setup global

```typescript
// src/test-utils/setup.ts
import { vi } from "vitest";
import "./mocks/reactNativeMock";
import "./mocks/animatedHelperMock";

// Configuration des mocks globaux
beforeEach(() => {
  vi.clearAllMocks();
});
```

## 🧪 Types de tests

### 1. Tests unitaires des services

**Objectif** : Tester chaque service de manière isolée

```typescript
// Exemple : authService.test.ts
describe("AuthService", () => {
  describe("signUpWithEmailConfirmation", () => {
    it("should create user successfully", async () => {
      // Arrange
      const mockUser = { id: "user-123", email: "test@example.com" };
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await AuthService.signUpWithEmailConfirmation({
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });

      // Assert
      expect(result.data.user).toEqual(mockUser);
      expect(result.needsConfirmation).toBe(true);
    });
  });
});
```

### 2. Tests d'intégration

**Objectif** : Tester les interactions entre plusieurs services

```typescript
// Exemple : services-integration.test.ts
describe("Data Flow Integration", () => {
  it("should test creation service individually", async () => {
    // Mock pour la création
    (supabase.from as vi.Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "creation-123" },
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "creation-123" },
            error: null,
          }),
        }),
        error: null,
      }),
    }));

    const result = await CreationsApi.createCreation({
      title: "Test Creation",
      description: "Test Description",
      price: 100,
      category: "jewelry",
      materials: ["test"],
      tags: ["test"],
      artisanId: "user-123",
    });

    expect(result).toBeDefined();
  });
});
```

### 3. Tests de composants

**Objectif** : Tester l'interface utilisateur React Native

```typescript
// Structure pour les futurs tests de composants
describe("CreationCard", () => {
  it("should render creation details correctly", () => {
    // Tests avec React Native Testing Library
  });
});
```

## 📝 Conventions de nommage

### Fichiers de test

```
[NomDuFichier].test.[ts|js]
```

### Structure des tests

```typescript
describe('[NomDuService/Composant]', () => {
  describe('[nomDeLaMethode]', () => {
    it('should [comportement attendu] when [condition]', async () => {
      // Arrange - Préparation
      // Act - Action
      // Assert - Vérification
    });

    it('should handle [cas d'erreur] gracefully', async () => {
      // Test des cas d'erreur
    });
  });
});
```

### Nommage des mocks

```typescript
const mockUser = {
  /* données */
};
const mockCreation = {
  /* données */
};
const mockSupabaseCreation = {
  /* données brutes Supabase */
};
```

## 🎭 Stratégie de mocking

### Mock global de Supabase

```typescript
// src/test-utils/mocks/supabaseMock.ts
export const supabaseMock = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    // ... autres méthodes
  },
  from: vi.fn(),
  storage: { from: vi.fn() },
  rpc: vi.fn(),
};

// Configuration globale
vi.mock("../services/supabase", () => ({
  supabase: supabaseMock,
}));
```

### Patterns de mocking par service

#### 1. Mock simple pour les queries

```typescript
supabaseMock.from.mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      }),
    }),
  }),
});
```

#### 2. Mock pour les mutations

```typescript
supabaseMock.from.mockReturnValue({
  insert: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: { id: "new-id" },
        error: null,
      }),
    }),
    error: null,
  }),
});
```

#### 3. Mock pour les erreurs

```typescript
supabaseMock.from.mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockRejectedValue(new Error("Database error")),
  }),
});
```

## 🔧 Tests par service

### AuthService (30 tests)

**Fonctionnalités testées :**

- Inscription avec confirmation email
- Connexion avec email/mot de passe
- Déconnexion
- Création de profil artisan
- Réinitialisation de mot de passe
- Gestion des erreurs d'authentification

**Points clés :**

- Mock de `supabase.auth`
- Validation des données utilisateur
- Gestion des erreurs réseau

### CreationsApi (18 tests)

**Fonctionnalités testées :**

- CRUD des créations
- Recherche et filtrage
- Gestion des favoris
- Upload d'images
- Transformation des données Supabase

**Données de test :**

```typescript
const mockSupabaseCreation = {
  id: "creation-123",
  title: "Test Creation",
  description: "Test Description",
  price: 100,
  image_url: "https://example.com/image.jpg",
  category_id: "jewelry",
  artisan_id: "artisan-123",
  materials: ["test"],
  is_available: true,
  rating: 4.0,
  review_count: 5,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  tags: ["test"],
  creation_tags: ["test"],
  category_label: "Bijoux",
  // Données artisan depuis la jointure
  artisan_name: "Test Artisan",
  artisan_location: "Paris",
  // ... autres champs artisan
};
```

### FavoritesApi (16 tests)

**Fonctionnalités testées :**

- Ajout/suppression de favoris
- Récupération des favoris utilisateur
- Vérification du statut favori
- Toggle favori
- Comptage des favoris

### RatingsApi (17 tests)

**Fonctionnalités testées :**

- Notation des créations
- Récupération des notes utilisateur
- Calcul de moyenne
- Prévention auto-notation
- Mise à jour des notes

### ReviewsApi (22 tests)

**Fonctionnalités testées :**

- Création/modification d'avis
- Récupération des avis par création
- Suppression d'avis
- Prévention auto-commentaire
- Gestion des noms d'utilisateur

### SuggestionsService (26 tests)

**Fonctionnalités testées :**

- Suggestions de recherche
- Cache des suggestions
- Filtrage intelligent
- Gestion des erreurs réseau

## 🔗 Tests d'intégration

### Services Integration (14 tests)

**Scénarios testés :**

1. **Workflow utilisateur complet**

   - Inscription → Profil artisan → Création

2. **Gestion d'erreurs**

   - Erreurs d'authentification
   - Erreurs de base de données

3. **Cohérence des données**

   - Synchronisation entre services
   - Opérations en cascade

4. **Performance**

   - Opérations concurrentes
   - Cache efficace

5. **Sécurité**

   - Permissions appropriées
   - Prévention auto-actions

6. **Flux de données**
   - Test individuel par service
   - Validation des transformations

### Exemple de test d'intégration

```typescript
describe("Data Consistency Integration", () => {
  it("should maintain data consistency between related services", async () => {
    // Mock pour les créations (données Supabase brutes)
    const mockCreationsFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockSupabaseCreation,
            error: null,
          }),
        }),
      }),
    });

    // Mock pour les notations
    const mockRatingsFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { rating: 4 },
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as vi.Mock)
      .mockImplementationOnce(mockCreationsFrom)
      .mockImplementationOnce(mockRatingsFrom);

    // Récupérer une création et sa notation
    const creationResult = await CreationsApi.getCreationById("creation-123");
    const ratingResult = await RatingsApi.getUserRating("creation-123");

    expect(creationResult).toEqual(mockCreation);
    expect(ratingResult).toBe(4);
  });
});
```

## 🛠️ Utilitaires de test

### Fixtures de données

```typescript
// src/test-utils/fixtures/
export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  ...overrides,
});

export const createMockCreation = (overrides = {}) => ({
  id: "creation-123",
  title: "Test Creation",
  description: "Test Description",
  price: 100,
  ...overrides,
});
```

### Helpers de test

```typescript
// src/test-utils/helpers.ts
export const mockSupabaseQuery = (data: any, error: any = null) => ({
  data,
  error,
});

export const mockSupabaseMethod = (returnValue: any) =>
  vi.fn().mockResolvedValue(returnValue);
```

## 🚀 Commandes utiles

### Exécution des tests

```bash
# Tous les tests
npm test

# Tests spécifiques
npm test -- src/__tests__/services/authService.test.ts

# Tests en mode watch
npm test -- --watch

# Tests avec couverture
npm test -- --coverage

# Tests d'un dossier
npm test -- src/__tests__/services/

# Tests avec pattern
npm test -- --grep "AuthService"
```

### Debug des tests

```bash
# Mode verbose
npm test -- --reporter=verbose

# Tests avec logs
npm test -- --reporter=verbose --no-silent

# Tests individuels en debug
npm test -- src/__tests__/services/authService.test.ts --reporter=verbose
```

## ✅ Bonnes pratiques

### 1. Structure des tests

```typescript
describe("ServiceName", () => {
  // Configuration commune
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup spécifique
  });

  describe("methodName", () => {
    it("should handle success case", async () => {
      // Arrange
      const mockData = {
        /* test data */
      };
      setupMocks(mockData);

      // Act
      const result = await service.method(params);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockFunction).toHaveBeenCalledWith(expectedParams);
    });

    it("should handle error case", async () => {
      // Test des cas d'erreur
      setupErrorMocks();

      await expect(service.method(params)).rejects.toThrow("Expected error");
    });
  });
});
```

### 2. Mocking efficace

```typescript
// ✅ Bon : Mock spécifique et réutilisable
const setupSuccessMock = (data: any) => {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  });
};

// ❌ Mauvais : Mock trop verbeux et non réutilisable
supabaseMock.from.mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: {
          /* données hardcodées */
        },
        error: null,
      }),
    }),
  }),
});
```

### 3. Tests lisibles

```typescript
// ✅ Bon : Test descriptif et focalisé
it("should return user profile when user exists and is authenticated", async () => {
  // Test spécifique avec contexte clair
});

// ❌ Mauvais : Test trop vague
it("should work", async () => {
  // Test peu descriptif
});
```

### 4. Données de test

```typescript
// ✅ Bon : Données minimales et pertinentes
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

// ❌ Mauvais : Données complètes inutiles
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  // ... 20 autres propriétés non utilisées
};
```

## 🐛 Dépannage

### Problèmes fréquents

#### 1. Mock non appliqué

**Symptôme :** Tests qui échouent avec "Cannot read property of undefined"

**Solution :**

```typescript
// Vérifier que le mock est bien configuré
beforeEach(() => {
  vi.clearAllMocks();
  // Reconfigurer les mocks nécessaires
});
```

#### 2. Chaînage de méthodes Supabase

**Symptôme :** "mockReturnValue(...).eq is not a function"

**Solution :**

```typescript
// Structure complète du mock
supabaseMock.from.mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data, error: null }),
    }),
  }),
});
```

#### 3. Tests asynchrones

**Symptôme :** Tests qui passent parfois et échouent parfois

**Solution :**

```typescript
// Toujours utiliser async/await
it("should handle async operation", async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

#### 4. Données de transformation

**Symptôme :** Tests qui échouent sur la transformation des données

**Solution :**

```typescript
// Utiliser les bonnes structures de données
const mockSupabaseData = {
  // Format snake_case de Supabase
  created_at: "2024-01-01T00:00:00Z",
  user_id: "user-123",
};

const expectedAppData = {
  // Format camelCase de l'app
  createdAt: "2024-01-01T00:00:00Z",
  userId: "user-123",
};
```

### Debug avancé

```typescript
// Ajouter des logs temporaires
it("should debug failing test", async () => {
  console.log("Mock calls:", supabaseMock.from.mock.calls);

  const result = await service.method();
  console.log("Result:", result);

  expect(result).toBeDefined();
});
```

## 📈 Métriques et évolution

### Couverture actuelle

- **Services** : 95%+ de couverture
- **Intégration** : Scénarios principaux couverts
- **Cas d'erreur** : Gestion robuste des erreurs

### Prochaines étapes

1. **Tests de composants React Native**
2. **Tests E2E avec Detox**
3. **Tests de performance**
4. **Tests d'accessibilité**

### Contribution

Pour ajouter de nouveaux tests :

1. Suivre les conventions de nommage
2. Utiliser les mocks existants
3. Ajouter des cas d'erreur
4. Documenter les cas complexes
5. Maintenir la couverture élevée

---

📚 **Cette documentation est maintenue à jour avec l'évolution du projet. Pour toute question, consultez les tests existants ou contactez l'équipe.**
