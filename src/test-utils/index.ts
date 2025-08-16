// Export des utilitaires de test
export * from "./setup";
export * from "./mocks/supabaseMock";

// Données de test communes
export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
};

export const mockArtisan = {
  id: "artisan-123",
  userId: "user-123",
  businessName: "Test Artisan",
  location: "Paris",
  description: "Test description",
  specialties: ["jewelry"],
  establishedYear: 2020,
  verified: true,
};

export const mockCreation = {
  id: "creation-123",
  title: "Test Creation",
  description: "Test Description",
  price: 100,
  imageUrl: "https://example.com/image.jpg",
  category: "jewelry" as any,
  artisanId: "artisan-123",
  materials: ["test"],
  isAvailable: true,
  rating: 4.0,
  reviewCount: 5,
  createdAt: "2024-01-01T00:00:00Z",
  tags: ["test"],
  artisan: {
    id: "artisan-123",
    artisanProfile: {
      businessName: "Test Artisan",
      verified: true,
    },
  } as any,
};

export const mockCreationWithArtisan = {
  ...mockCreation,
  artisan: mockArtisan,
};

export const mockRating = {
  id: "rating-123",
  userId: "user-123",
  creationId: "creation-123",
  rating: 5,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export const mockReview = {
  id: "review-123",
  userId: "user-123",
  creationId: "creation-123",
  comment: "Great creation!",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  userNickname: "johndoe",
};

export const mockFavorite = {
  id: "favorite-123",
  userId: "user-123",
  creationId: "creation-123",
  createdAt: "2024-01-01T00:00:00Z",
};

// Fonctions utilitaires pour les tests
export const createMockResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
});

export const createMockError = (message: string, code?: string) => ({
  message,
  code,
});

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Configuration des mocks Jest
export const setupJestMocks = () => {
  // Mock des modules externes
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

  // Mock des variables d'environnement
  process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  process.env.EXPO_PUBLIC_APP_URL = "http://localhost:8081";

  // Mock de console pour les tests
  global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
};

// Nettoyage des mocks Jest
export const cleanupJestMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
};
