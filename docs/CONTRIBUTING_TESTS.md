# Guide de contribution - Tests TerraCréa

## 🎯 Objectif

Ce guide explique comment contribuer efficacement aux tests du projet TerraCréa. Il s'adresse aux développeurs qui souhaitent ajouter, modifier ou améliorer les tests existants.

## 📋 Prérequis

### Connaissances requises

- JavaScript/TypeScript
- Concepts de base des tests unitaires
- React Native (pour les tests de composants)
- Bases de Supabase

### Outils nécessaires

- Node.js 16+
- npm ou yarn
- IDE avec support TypeScript

## 🚀 Démarrage

### 1. Configuration initiale

```bash
# Cloner le projet
git clone <repository-url>
cd terracrea

# Installer les dépendances
npm install

# Lancer les tests pour vérifier l'environnement
npm test
```

### 2. Structure à comprendre

```
src/
├── __tests__/              # Tous les tests
│   ├── services/           # Tests des services API
│   ├── integration/        # Tests d'intégration
│   ├── components/         # Tests des composants (futur)
│   └── utils/              # Tests des utilitaires
├── test-utils/             # Utilitaires de test
│   ├── mocks/              # Mocks réutilisables
│   ├── fixtures/           # Données de test
│   └── setup.ts            # Configuration globale
└── services/               # Code source à tester
```

## 📝 Types de contributions

### 1. Ajouter des tests pour un nouveau service

```typescript
// 1. Créer le fichier de test
// src/__tests__/services/newService.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NewService } from "../../services/newService";

describe("NewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configuration des mocks spécifiques
  });

  describe("mainMethod", () => {
    it("should handle success case", async () => {
      // Arrange
      const mockData = { id: "test-id" };
      setupSuccessMock(mockData);

      // Act
      const result = await NewService.mainMethod("param");

      // Assert
      expect(result).toEqual(mockData);
    });

    it("should handle error case", async () => {
      // Arrange
      setupErrorMock();

      // Act & Assert
      await expect(NewService.mainMethod("param")).rejects.toThrow();
    });
  });
});
```

### 2. Améliorer des tests existants

```typescript
// Ajouter des cas de test manquants
describe("ExistingService", () => {
  // Tests existants...

  describe("newFeature", () => {
    it("should handle new scenario", async () => {
      // Nouveau test pour une fonctionnalité ajoutée
    });
  });

  // Améliorer les tests existants
  describe("existingMethod", () => {
    it("should handle edge case with empty data", async () => {
      // Test d'un cas limite non couvert
    });
  });
});
```

### 3. Créer des utilitaires de test

```typescript
// src/test-utils/helpers.ts

export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  ...overrides,
});

export const setupAuthMock = (user = null) => {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
};
```

### 4. Ajouter des tests d'intégration

```typescript
// src/__tests__/integration/new-workflow.test.ts

describe("New Workflow Integration", () => {
  it("should complete end-to-end scenario", async () => {
    // Test d'un flux complet entre plusieurs services
    const step1Result = await Service1.method();
    expect(step1Result).toBeDefined();

    const step2Result = await Service2.method(step1Result.id);
    expect(step2Result).toBeDefined();
  });
});
```

## 🎭 Guide des mocks

### Patterns de mocking recommandés

#### 1. Mock simple pour queries

```typescript
const setupSimpleQuery = (data: any, error: any = null) => {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  });
};
```

#### 2. Mock pour mutations

```typescript
const setupMutation = (result: any, error: any = null) => {
  supabaseMock.from.mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: result, error }),
      }),
      error,
    }),
  });
};
```

#### 3. Mock pour opérations complexes

```typescript
const setupComplexMock = () => {
  supabaseMock.from.mockImplementation((table: string) => {
    switch (table) {
      case "users":
        return createUserMock();
      case "creations":
        return createCreationMock();
      default:
        return createDefaultMock();
    }
  });
};
```

### Mocks réutilisables

```typescript
// src/test-utils/mocks/serviceMocks.ts

export const mockAuthService = {
  success: (user: any) => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    });
  },

  failure: (error: string) => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error(error),
    });
  },
};
```

## ✅ Checklist de qualité

### Avant de soumettre un test

- [ ] **Nommage descriptif** : Le nom du test explique clairement ce qui est testé
- [ ] **Arrange-Act-Assert** : Structure claire du test
- [ ] **Cas d'erreur** : Tests des scénarios d'échec
- [ ] **Données minimales** : Utilisation des données strictement nécessaires
- [ ] **Mocks propres** : Nettoyage des mocks entre les tests
- [ ] **Documentation** : Commentaires pour les cas complexes

### Standards de code

```typescript
// ✅ Bon exemple
describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("should return user profile when user exists", async () => {
      // Arrange
      const mockUser = { id: "user-123", name: "John" };
      setupUserMock(mockUser);

      // Act
      const result = await UserService.getUserProfile("user-123");

      // Assert
      expect(result).toEqual(mockUser);
      expect(supabaseMock.from).toHaveBeenCalledWith("users");
    });

    it("should return null when user does not exist", async () => {
      // Arrange
      setupUserMock(null);

      // Act
      const result = await UserService.getUserProfile("non-existent");

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

```typescript
// ❌ Exemple à éviter
describe("UserService", () => {
  it("should work", async () => {
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "user-123",
              name: "John",
              email: "john@example.com",
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
              // ... beaucoup d'autres propriétés inutiles
            },
            error: null,
          }),
        }),
      }),
    });

    const result = await UserService.getUserProfile("user-123");
    expect(result).toBeDefined(); // Assertion trop vague
  });
});
```

## 🐛 Debug et dépannage

### Techniques de debug

```typescript
// 1. Logs temporaires
it("should debug test", async () => {
  console.log("Mock calls:", supabaseMock.from.mock.calls);

  const result = await service.method();
  console.log("Result:", JSON.stringify(result, null, 2));

  expect(result).toBeDefined();
});

// 2. Vérifications intermédiaires
it("should track mock usage", async () => {
  const result = await service.method();

  // Vérifier les appels aux mocks
  expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  expect(supabaseMock.from).toHaveBeenCalledWith("expected_table");
});
```

### Problèmes fréquents et solutions

#### Mock non appliqué

```typescript
// Problème : Mock configuré après l'import du service
import { Service } from './service'; // ❌ Mauvais ordre
vi.mock('./supabase', () => ({ ... }));

// Solution : Mock avant l'import
vi.mock('./supabase', () => ({ ... })); // ✅ Bon ordre
import { Service } from './service';
```

#### Tests asynchrones instables

```typescript
// Problème : Oubli d'async/await
it("should handle async", () => {
  // ❌ Pas d'async
  const result = service.asyncMethod(); // ❌ Pas d'await
  expect(result).toBeDefined();
});

// Solution : Gestion correcte de l'asynchrone
it("should handle async", async () => {
  // ✅ async
  const result = await service.asyncMethod(); // ✅ await
  expect(result).toBeDefined();
});
```

## 📊 Métriques et couverture

### Commandes utiles

```bash
# Couverture globale
npm test -- --coverage

# Couverture d'un service spécifique
npm test -- --coverage src/__tests__/services/authService.test.ts

# Tests en mode watch pour développement
npm test -- --watch src/__tests__/services/

# Tests avec logs détaillés
npm test -- --reporter=verbose
```

### Objectifs de couverture

- **Services** : 95%+ de couverture
- **Cas d'erreur** : Tous les chemins d'erreur testés
- **Cas limites** : Données nulles, vides, invalides
- **Intégration** : Workflows principaux couverts

## 🔄 Processus de contribution

### 1. Préparation

```bash
# Créer une branche pour les tests
git checkout -b tests/new-feature-tests

# Lancer les tests existants
npm test
```

### 2. Développement

```bash
# Développer en mode watch
npm test -- --watch

# Tester un fichier spécifique
npm test -- src/__tests__/services/myService.test.ts
```

### 3. Validation

```bash
# Vérifier tous les tests
npm test

# Vérifier la couverture
npm test -- --coverage

# Vérifier le style de code
npm run lint
```

### 4. Soumission

```bash
# Commit avec message descriptif
git add src/__tests__/
git commit -m "test: add comprehensive tests for NewService

- Add unit tests for all public methods
- Cover error cases and edge cases
- Add integration tests for main workflow
- Update test documentation"

# Push et créer PR
git push origin tests/new-feature-tests
```

## 📚 Ressources

### Documentation

- [Guide principal des tests](./TESTING.md)
- [README des tests](../src/__tests__/README.md)
- [Vitest Documentation](https://vitest.dev/)

### Exemples de référence

- `src/__tests__/services/authService.test.ts` - Tests complets avec mocks
- `src/__tests__/services/creationsApi.test.ts` - Transformations de données
- `src/__tests__/integration/services-integration.test.ts` - Tests d'intégration

### Outils

```bash
# Script d'aide personnalisé
node scripts/test-helper.js help

# Commandes fréquentes
node scripts/test-helper.js services  # Tests des services
node scripts/test-helper.js debug     # Mode debug
node scripts/test-helper.js stats     # Statistiques
```

## 🎯 Conseils pour les nouveaux contributeurs

### Par où commencer

1. **Lire la documentation** : Commencer par [TESTING.md](./TESTING.md)
2. **Explorer les tests existants** : Regarder `authService.test.ts` comme exemple
3. **Lancer les tests** : `npm test` pour comprendre l'environnement
4. **Contribuer progressivement** : Commencer par des tests simples

### Questions fréquentes

**Q: Comment tester une nouvelle fonctionnalité ?**
R: Créer un nouveau `describe` dans le fichier de test du service concerné.

**Q: Comment mocker une API externe ?**
R: Utiliser `vi.mock()` au niveau du module et configurer les retours dans `beforeEach`.

**Q: Faut-il tester les cas d'erreur ?**
R: Oui, absolument. Chaque méthode doit avoir au moins un test de cas d'erreur.

**Q: Comment débugger un test qui échoue ?**
R: Ajouter des `console.log` temporaires et utiliser `--reporter=verbose`.

---

💡 **Conseil** : N'hésitez pas à demander de l'aide ! L'équipe est là pour vous accompagner dans vos contributions aux tests.
