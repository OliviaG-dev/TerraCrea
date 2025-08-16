// Configuration globale pour les tests Jest
import { vi, beforeAll, afterAll, beforeEach } from "vitest";
import mockSupabase, { resetAllMocks } from "./mocks/supabaseMock";

// Déclaration de type pour global
declare global {
  var supabaseMock: typeof mockSupabase;
}

// Supprimer les avertissements de console pendant les tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Configuration des variables d'environnement pour les tests
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.EXPO_PUBLIC_APP_URL = "http://localhost:8081";

// Mock global de Supabase pour tous les tests
global.supabaseMock = mockSupabase;

// Mock du module supabase
vi.mock("../services/supabase", () => ({
  supabase: mockSupabase,
}));

// Configuration des mocks par défaut avant chaque test
beforeEach(() => {
  resetAllMocks();
});

// Fonction utilitaire simple pour créer des mocks Supabase
export const createSupabaseMock = () => {
  return mockSupabase;
};

// Fonction utilitaire simple pour configurer des réponses de mock
export const configureMockResponse = (mock: any, response: any) => {
  if (response && typeof response === "object") {
    if ("data" in response) {
      mock.mockResolvedValue(response);
    } else if ("error" in response) {
      mock.mockRejectedValue(response.error);
    }
  }
};
