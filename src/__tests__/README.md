# Tests - TerraCréa

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec couverture
npm test -- --coverage
```

## 📁 Structure

```
__tests__/
├── components/          # Tests des composants React Native
├── context/             # Tests des contexts React
├── hooks/               # Tests des hooks personnalisés
├── integration/         # Tests d'intégration entre services
├── services/            # Tests unitaires des services API
└── utils/               # Tests des fonctions utilitaires
```

## 📊 Statistiques

- **Total** : 163+ tests
- **Services** : 147 tests (AuthService, CreationsApi, FavoritesApi, etc.)
- **Intégration** : 14 tests (Flux de données, sécurité, performance)
- **Utilitaires** : 2 tests

## 🎯 Tests par service

### Services API (147 tests)

| Service                      | Tests | Description                        |
| ---------------------------- | ----- | ---------------------------------- |
| `authService.test.ts`        | 30    | Authentification, profils artisan  |
| `creationsApi.test.ts`       | 18    | CRUD créations, recherche, favoris |
| `favoritesApi.test.ts`       | 16    | Gestion des favoris utilisateur    |
| `ratingsApi.test.ts`         | 17    | Système de notation                |
| `reviewsApi.test.ts`         | 22    | Avis et commentaires               |
| `suggestionsService.test.ts` | 26    | Suggestions de recherche           |
| `supabase.test.ts`           | 5     | Configuration base de données      |

### Intégration (14 tests)

| Catégorie             | Tests | Description                             |
| --------------------- | ----- | --------------------------------------- |
| Workflow utilisateur  | 1     | Parcours complet inscription → création |
| Gestion d'erreurs     | 2     | Erreurs auth et base de données         |
| Cohérence des données | 2     | Synchronisation entre services          |
| Performance           | 2     | Opérations concurrentes et cache        |
| Sécurité              | 3     | Permissions et auto-actions             |
| Flux de données       | 4     | Tests individuels par service           |

## 🛠️ Configuration

### Framework de test

- **Vitest** : Framework de test rapide
- **Node.js** : Environnement d'exécution
- **Mocks** : Supabase, React Native

### Fichiers de configuration

- `vitest.config.ts` : Configuration principale
- `src/test-utils/setup.ts` : Setup global
- `src/test-utils/mocks/` : Mocks réutilisables

## 🎭 Mocking

### Supabase

```typescript
// Mock global configuré dans setup.ts
const supabaseMock = {
  auth: { getUser: vi.fn(), signUp: vi.fn() /* ... */ },
  from: vi.fn(),
  storage: { from: vi.fn() },
  rpc: vi.fn(),
};
```

### React Native

```typescript
// Mock complet pour environnement Node.js
// Configuré dans src/test-utils/mocks/reactNativeMock.ts
```

## 📝 Conventions

### Nommage des fichiers

```
[ServiceName].test.[ts|js]
```

### Structure des tests

```typescript
describe("ServiceName", () => {
  describe("methodName", () => {
    it("should [behavior] when [condition]", async () => {
      // Arrange - Préparation
      // Act - Action
      // Assert - Vérification
    });
  });
});
```

### Données de test

```typescript
const mockUser = { id: "user-123", email: "test@example.com" };
const mockCreation = { id: "creation-123", title: "Test Creation" };
```

## 🚨 Cas d'usage fréquents

### Tester une méthode d'API

```typescript
it("should fetch user data successfully", async () => {
  // Mock de la réponse Supabase
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      }),
    }),
  });

  // Appel de la méthode
  const result = await AuthService.getUserProfile("user-123");

  // Vérifications
  expect(result).toEqual(mockUser);
  expect(supabaseMock.from).toHaveBeenCalledWith("users");
});
```

### Tester la gestion d'erreurs

```typescript
it("should handle database errors gracefully", async () => {
  // Mock d'une erreur
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockRejectedValue(new Error("Database error")),
    }),
  });

  // Vérification que l'erreur est gérée
  const result = await Service.getData();
  expect(result).toEqual([]);
});
```

### Tester des transformations de données

```typescript
it("should transform Supabase data to app format", async () => {
  const supabaseData = {
    created_at: "2024-01-01T00:00:00Z",
    user_id: "user-123",
  };

  const expectedAppData = {
    createdAt: "2024-01-01T00:00:00Z",
    userId: "user-123",
  };

  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: supabaseData,
        error: null,
      }),
    }),
  });

  const result = await Service.getData();
  expect(result).toEqual(expectedAppData);
});
```

## 🐛 Dépannage

### Erreur : "Mock not applied"

```typescript
// Solution : Nettoyer les mocks avant chaque test
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Erreur : "Cannot read property of undefined"

```typescript
// Solution : Vérifier la structure du mock
supabaseMock.from.mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
});
```

### Tests asynchrones qui échouent

```typescript
// Solution : Toujours utiliser async/await
it("should handle async operation", async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

## 📈 Bonnes pratiques

### ✅ À faire

- Noms de tests descriptifs
- Données de test minimales
- Tester les cas d'erreur
- Nettoyer les mocks
- Un concept par test

### ❌ À éviter

- Tests trop complexes
- Données hardcodées
- Mocks trop verbeux
- Tests interdépendants
- Noms de tests vagues

## 🔗 Liens utiles

- [Documentation complète](../../docs/TESTING.md)
- [Vitest Documentation](https://vitest.dev/)
- [Mock Functions Guide](https://vitest.dev/guide/mocking.html)

---

💡 **Conseil** : Commencez par lire la documentation complète dans `docs/TESTING.md` pour une compréhension approfondie du système de tests.
