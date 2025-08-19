/**
 * EXEMPLES DE TESTS - Guide pratique
 *
 * Ce fichier montre les patterns les plus courants pour écrire des tests
 * dans le projet TerraCréa. Utilisez ces exemples comme référence.
 *
 * ⚠️ Ce fichier n'est PAS exécuté dans la suite de tests (extension .example.ts)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// === EXEMPLE 1: Test de service simple ===

/**
 * Test d'un service avec une seule méthode
 */
describe("EXEMPLE: Service simple", () => {
  // Configuration commune pour tous les tests de ce service
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup des mocks communs
  });

  describe("getUserById", () => {
    it("should return user when user exists", async () => {
      // 🔧 ARRANGE - Préparer les données et mocks
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "John Doe",
      };

      // Mock de la réponse Supabase
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null,
              }),
            }),
          }),
        }),
      };

      // 🚀 ACT - Exécuter la méthode à tester
      // const result = await UserService.getUserById('user-123');

      // ✅ ASSERT - Vérifier les résultats
      // expect(result).toEqual(mockUser);
      // expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it("should return null when user does not exist", async () => {
      // Test du cas où l'utilisateur n'existe pas
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" }, // Code d'erreur Supabase pour "non trouvé"
              }),
            }),
          }),
        }),
      };

      // const result = await UserService.getUserById('non-existent');
      // expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      // Test de gestion d'erreur
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockRejectedValue(new Error("Database connection failed")),
          }),
        }),
      };

      // Le service devrait gérer l'erreur gracieusement
      // const result = await UserService.getUserById('user-123');
      // expect(result).toBeNull(); // ou une valeur par défaut appropriée
    });
  });
});

// === EXEMPLE 2: Test avec authentification ===

/**
 * Test d'un service qui nécessite une authentification
 */
describe("EXEMPLE: Service avec authentification", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de l'utilisateur connecté par défaut
    // supabaseMock.auth.getUser.mockResolvedValue({
    //   data: { user: mockUser },
    //   error: null,
    // });
  });

  describe("createUserProfile", () => {
    it("should create profile when user is authenticated", async () => {
      const profileData = {
        firstName: "John",
        lastName: "Doe",
        bio: "Test bio",
      };

      // Mock pour l'insertion
      // supabaseMock.from.mockReturnValue({
      //   insert: vi.fn().mockReturnValue({
      //     select: vi.fn().mockReturnValue({
      //       single: vi.fn().mockResolvedValue({
      //         data: { id: 'profile-123', ...profileData },
      //         error: null,
      //       }),
      //     }),
      //   }),
      // });

      // const result = await ProfileService.createUserProfile(profileData);
      // expect(result).toBeDefined();
      // expect(result.firstName).toBe('John');
    });

    it("should throw error when user is not authenticated", async () => {
      // Mock d'utilisateur non connecté
      // supabaseMock.auth.getUser.mockResolvedValue({
      //   data: { user: null },
      //   error: null,
      // });
      // await expect(ProfileService.createUserProfile({})).rejects.toThrow(
      //   'Utilisateur non connecté'
      // );
    });
  });
});

// === EXEMPLE 3: Test avec transformation de données ===

/**
 * Test d'un service qui transforme les données Supabase
 */
describe("EXEMPLE: Service avec transformation de données", () => {
  it("should transform Supabase data to app format", async () => {
    // Données brutes de Supabase (snake_case)
    const supabaseData = {
      id: "creation-123",
      title: "Test Creation",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      artisan_id: "artisan-123",
      image_url: "https://example.com/image.jpg",
      is_available: true,
    };

    // Données attendues par l'app (camelCase)
    const expectedAppData = {
      id: "creation-123",
      title: "Test Creation",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      artisanId: "artisan-123",
      imageUrl: "https://example.com/image.jpg",
      isAvailable: true,
    };

    // Mock avec les données Supabase
    // supabaseMock.from.mockReturnValue({
    //   select: vi.fn().mockReturnValue({
    //     eq: vi.fn().mockReturnValue({
    //       single: vi.fn().mockResolvedValue({
    //         data: supabaseData,
    //         error: null,
    //       }),
    //     }),
    //   }),
    // });

    // const result = await CreationsService.getCreation('creation-123');
    // expect(result).toEqual(expectedAppData);
  });
});

// === EXEMPLE 4: Test avec opérations CRUD ===

/**
 * Test complet des opérations CRUD
 */
describe("EXEMPLE: Tests CRUD complets", () => {
  const mockItem = {
    id: "item-123",
    title: "Test Item",
    description: "Test description",
  };

  describe("CREATE", () => {
    it("should create new item successfully", async () => {
      const newItemData = {
        title: "New Item",
        description: "New description",
      };

      // Mock pour l'insertion
      // supabaseMock.from.mockReturnValue({
      //   insert: vi.fn().mockReturnValue({
      //     select: vi.fn().mockReturnValue({
      //       single: vi.fn().mockResolvedValue({
      //         data: { id: 'new-item-123', ...newItemData },
      //         error: null,
      //       }),
      //     }),
      //   }),
      // });

      // const result = await ItemService.createItem(newItemData);
      // expect(result).toBeDefined();
      // expect(result.title).toBe('New Item');
    });
  });

  describe("READ", () => {
    it("should read item by id", async () => {
      // Mock pour la lecture
      // supabaseMock.from.mockReturnValue({
      //   select: vi.fn().mockReturnValue({
      //     eq: vi.fn().mockReturnValue({
      //       single: vi.fn().mockResolvedValue({
      //         data: mockItem,
      //         error: null,
      //       }),
      //     }),
      //   }),
      // });
      // const result = await ItemService.getItem('item-123');
      // expect(result).toEqual(mockItem);
    });

    it("should read all items", async () => {
      // Mock pour lister tous les éléments
      // supabaseMock.from.mockReturnValue({
      //   select: vi.fn().mockReturnValue({
      //     order: vi.fn().mockResolvedValue({
      //       data: [mockItem],
      //       error: null,
      //     }),
      //   }),
      // });
      // const result = await ItemService.getAllItems();
      // expect(result).toHaveLength(1);
      // expect(result[0]).toEqual(mockItem);
    });
  });

  describe("UPDATE", () => {
    it("should update item successfully", async () => {
      const updateData = { title: "Updated Title" };
      const updatedItem = { ...mockItem, ...updateData };

      // Mock pour la mise à jour
      // supabaseMock.from.mockReturnValue({
      //   update: vi.fn().mockReturnValue({
      //     eq: vi.fn().mockReturnValue({
      //       select: vi.fn().mockReturnValue({
      //         single: vi.fn().mockResolvedValue({
      //           data: updatedItem,
      //           error: null,
      //         }),
      //       }),
      //     }),
      //   }),
      // });

      // const result = await ItemService.updateItem('item-123', updateData);
      // expect(result.title).toBe('Updated Title');
    });
  });

  describe("DELETE", () => {
    it("should delete item successfully", async () => {
      // Mock pour la suppression
      // supabaseMock.from.mockReturnValue({
      //   delete: vi.fn().mockReturnValue({
      //     eq: vi.fn().mockResolvedValue({
      //       error: null,
      //     }),
      //   }),
      // });
      // const result = await ItemService.deleteItem('item-123');
      // expect(result).toBe(true);
    });
  });
});

// === EXEMPLE 5: Test d'intégration ===

/**
 * Test d'intégration entre plusieurs services
 */
describe("EXEMPLE: Test d'intégration", () => {
  it("should complete full user workflow", async () => {
    // Workflow: Créer utilisateur → Créer profil → Créer item
    // 1. Créer utilisateur
    // supabaseMock.auth.signUp.mockResolvedValue({
    //   data: { user: { id: 'user-123', email: 'test@example.com' } },
    //   error: null,
    // });
    // const userResult = await AuthService.signUp({
    //   email: 'test@example.com',
    //   password: 'password123',
    // });
    // expect(userResult.data.user).toBeDefined();
    // 2. Créer profil
    // supabaseMock.from.mockReturnValueOnce({
    //   insert: vi.fn().mockReturnValue({
    //     select: vi.fn().mockReturnValue({
    //       single: vi.fn().mockResolvedValue({
    //         data: { id: 'profile-123' },
    //         error: null,
    //       }),
    //     }),
    //   }),
    // });
    // const profileResult = await ProfileService.createProfile({
    //   firstName: 'John',
    //   lastName: 'Doe',
    // });
    // expect(profileResult).toBeDefined();
    // 3. Créer item
    // supabaseMock.from.mockReturnValueOnce({
    //   insert: vi.fn().mockReturnValue({
    //     select: vi.fn().mockReturnValue({
    //       single: vi.fn().mockResolvedValue({
    //         data: { id: 'item-123', title: 'Test Item' },
    //         error: null,
    //       }),
    //     }),
    //   }),
    // });
    // const itemResult = await ItemService.createItem({
    //   title: 'Test Item',
    //   description: 'Test description',
    // });
    // expect(itemResult).toBeDefined();
    // Vérifier que tout le workflow s'est bien passé
    // expect(userResult.data.user.id).toBe('user-123');
    // expect(profileResult.id).toBe('profile-123');
    // expect(itemResult.id).toBe('item-123');
  });
});

// === EXEMPLE 6: Helpers de test réutilisables ===

/**
 * Fonctions helper pour simplifier les tests
 */

// Helper pour créer des mocks utilisateur
const createUserMock = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  ...overrides,
});

// Helper pour setup l'authentification
const setupAuthMock = (user: any = null) => {
  // supabaseMock.auth.getUser.mockResolvedValue({
  //   data: { user },
  //   error: null,
  // });
};

// Helper pour setup une query simple
const setupSimpleQuery = (table: string, data: any, error = null) => {
  // supabaseMock.from.mockImplementation((tableName) => {
  //   if (tableName === table) {
  //     return {
  //       select: vi.fn().mockReturnValue({
  //         eq: vi.fn().mockReturnValue({
  //           single: vi.fn().mockResolvedValue({ data, error }),
  //         }),
  //       }),
  //     };
  //   }
  //   return createDefaultMock();
  // });
};

// Helper pour setup une mutation
const setupMutation = (table: string, result: any, error = null) => {
  // supabaseMock.from.mockImplementation((tableName) => {
  //   if (tableName === table) {
  //     return {
  //       insert: vi.fn().mockReturnValue({
  //         select: vi.fn().mockReturnValue({
  //           single: vi.fn().mockResolvedValue({ data: result, error }),
  //         }),
  //       }),
  //     };
  //   }
  //   return createDefaultMock();
  // });
};

// Exemple d'utilisation des helpers
describe("EXEMPLE: Utilisation des helpers", () => {
  it("should use helpers for cleaner tests", async () => {
    // Utilisation simple des helpers
    const mockUser = createUserMock({ name: "John Doe" });
    setupAuthMock(mockUser);
    setupSimpleQuery("users", mockUser);

    // Le test devient plus lisible
    // const result = await UserService.getCurrentUser();
    // expect(result).toEqual(mockUser);
  });
});

// === BONNES PRATIQUES ===

/**
 * 📝 CONVENTIONS DE NOMMAGE
 *
 * Tests descriptifs:
 * ✅ "should return user profile when user exists"
 * ✅ "should throw error when user is not authenticated"
 * ❌ "should work"
 * ❌ "test user"
 *
 * Variables:
 * ✅ mockUser, expectedResult, userData
 * ❌ data, result, stuff
 */

/**
 * 🎯 STRUCTURE DES TESTS
 *
 * 1. Arrange - Préparer les données et mocks
 * 2. Act - Exécuter la méthode à tester
 * 3. Assert - Vérifier les résultats
 *
 * Toujours dans cet ordre !
 */

/**
 * 🔧 MOCKS EFFICACES
 *
 * ✅ Mocks spécifiques au test
 * ✅ Données minimales nécessaires
 * ✅ Nettoyage entre les tests (beforeEach)
 * ❌ Mocks globaux trop complexes
 * ❌ Données complètes inutiles
 */

/**
 * 🚨 GESTION D'ERREURS
 *
 * Toujours tester:
 * - Cas de succès
 * - Cas d'erreur (base de données, réseau, etc.)
 * - Cas limites (données nulles, vides, invalides)
 * - Cas d'authentification (connecté/déconnecté)
 */

/**
 * 📊 ASSERTIONS
 *
 * ✅ Assertions précises:
 * expect(result).toEqual(expectedData);
 * expect(result.status).toBe('success');
 * expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
 *
 * ❌ Assertions vagues:
 * expect(result).toBeDefined();
 * expect(result).toBeTruthy();
 */

export {
  // Export des helpers pour réutilisation
  createUserMock,
  setupAuthMock,
  setupSimpleQuery,
  setupMutation,
};
