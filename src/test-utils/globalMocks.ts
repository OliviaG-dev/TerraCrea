// Mocks globaux pour les tests
import { vi } from "vitest";

// Mock global de Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  rpc: vi.fn(),
};

// Configuration des mocks par défaut
const configureDefaultMocks = () => {
  // Mock de la méthode `from` avec chaînage complet
  const createMockFrom = () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn(),
          limit: vi.fn(),
        }),
        single: vi.fn(),
        maybeSingle: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        in: vi.fn(),
      }),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      in: vi.fn(),
    });

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn(),
      error: null,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn(),
        error: null,
      }),
      select: vi.fn(),
      error: null,
    });

    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null,
        }),
        error: null,
      }),
      error: null,
    });

    return vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });
  };

  // Mock de la méthode `storage.from`
  const createMockStorage = () => {
    return vi.fn().mockReturnValue({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
    });
  };

  mockSupabase.from = createMockFrom();
  mockSupabase.storage.from = createMockStorage();

  // Configuration des réponses par défaut
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: { id: "user-123", email: "test@example.com" } },
    error: null,
  });

  // Configuration des chaînes de méthodes par défaut
  const mockFrom = mockSupabase.from();
  const mockSelect = mockFrom.select();
  const mockEq1 = mockSelect.eq();
  const mockEq2 = mockEq1.eq();

  // Configuration par défaut pour maybeSingle
  mockEq2.maybeSingle.mockResolvedValue({
    data: null,
    error: null,
  });

  // Configuration par défaut pour single
  mockEq1.single.mockResolvedValue({
    data: null,
    error: null,
  });

  // Configuration par défaut pour order
  mockEq1.order.mockResolvedValue({
    data: [],
    error: null,
  });

  // Configuration par défaut pour limit
  mockEq1.limit.mockResolvedValue({
    data: [],
    error: null,
  });

  // Configuration par défaut pour in
  mockSelect.in.mockResolvedValue({
    data: [],
    error: null,
  });

  // Configuration par défaut pour insert
  const mockInsert = mockFrom.insert();
  mockInsert.select.mockResolvedValue({
    data: [],
    error: null,
  });

  // Configuration par défaut pour update
  const mockUpdate = mockFrom.update();
  mockUpdate.eq.mockReturnValue({
    select: vi.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  });

  // Configuration par défaut pour delete
  const mockDelete = mockFrom.delete();
  mockDelete.eq.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      error: null,
    }),
  });
};

// Configuration initiale
configureDefaultMocks();

// Fonction pour réinitialiser tous les mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  configureDefaultMocks();
};

// Fonction pour configurer des réponses spécifiques
export const configureMockResponse = (method: string, response: any) => {
  const mock = mockSupabase.from();

  if (method === "select") {
    const selectMock = mock.select();
    if (response.data !== undefined) {
      selectMock.eq().eq().maybeSingle.mockResolvedValue(response);
      selectMock.eq().single.mockResolvedValue(response);
      selectMock.eq().order.mockResolvedValue(response);
      selectMock.eq().limit.mockResolvedValue(response);
      selectMock.in.mockResolvedValue(response);
    }
  } else if (method === "insert") {
    const insertMock = mock.insert();
    if (response.data !== undefined) {
      insertMock.select.mockResolvedValue(response);
    }
  } else if (method === "update") {
    const updateMock = mock.update();
    if (response.data !== undefined) {
      updateMock.eq().select.mockResolvedValue(response);
    }
  } else if (method === "delete") {
    const deleteMock = mock.delete();
    if (response.error) {
      deleteMock.eq().eq().error = response.error;
    }
  }
};

// Fonction pour configurer des réponses d'authentification
export const configureAuthResponse = (userData: any = null) => {
  if (userData) {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: userData },
      error: null,
    });
  } else {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  }
};

// Export du mock Supabase
export default mockSupabase;
