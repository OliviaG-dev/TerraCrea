import { vi } from "vitest";

// Mock robuste de Supabase qui gère les chaînes de méthodes
export const createMockSupabaseChain = (response: any) => {
  const mockMaybeSingle = vi.fn().mockResolvedValue(response);
  const mockSingle = vi.fn().mockResolvedValue(response);
  const mockLimit = vi.fn().mockResolvedValue(response);
  const mockOrder = vi.fn().mockResolvedValue(response);
  const mockIn = vi.fn().mockResolvedValue(response);

  const mockEq2 = vi.fn().mockReturnValue({
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
    limit: mockLimit,
    order: mockOrder,
  });
  const mockEq1 = vi.fn().mockReturnValue({
    eq: mockEq2,
    single: mockSingle,
    limit: mockLimit,
    order: mockOrder,
  });
  const mockSelect = vi.fn().mockReturnValue({
    eq: mockEq1,
    single: mockSingle,
    limit: mockLimit,
    order: mockOrder,
    in: mockIn,
  });

  const mockInsert = vi.fn().mockReturnValue({
    select: vi.fn().mockResolvedValue(response),
    error: response.error || null,
  });

  const mockUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(response),
      error: response.error || null,
    }),
    error: response.error || null,
  });

  const mockDelete = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        error: response.error || null,
      }),
      error: response.error || null,
    }),
    error: response.error || null,
  });

  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  });

  return {
    mockFrom,
    mockSelect,
    mockEq1,
    mockEq2,
    mockMaybeSingle,
    mockSingle,
    mockLimit,
    mockOrder,
    mockIn,
    mockInsert,
    mockUpdate,
    mockDelete,
  };
};

// Mock ultra-simple de Supabase pour éviter tous les conflits TypeScript
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
  // Mock simple de la méthode `from`
  const mockFrom = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  // Mock de select avec chaînage
  const mockSelect = {
    eq: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    in: vi.fn(),
  };

  const mockEq1 = {
    eq: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };

  const mockEq2 = {
    single: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };

  // Configuration des chaînes
  mockEq2.maybeSingle.mockResolvedValue({ data: null, error: null });
  mockEq1.single.mockResolvedValue({ data: null, error: null });
  mockEq1.order.mockResolvedValue({ data: [], error: null });
  mockEq1.limit.mockResolvedValue({ data: [], error: null });
  mockSelect.in.mockResolvedValue({ data: [], error: null });

  // Configuration des chaînes
  mockEq1.eq.mockReturnValue(mockEq2);
  mockSelect.eq.mockReturnValue(mockEq1);

  // Mock de insert
  mockFrom.insert.mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
  });

  // Mock de update
  mockFrom.update.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  });

  // Mock de delete
  mockFrom.delete.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ error: null }),
    }),
  });

  // Configuration de from
  mockFrom.select.mockReturnValue(mockSelect);

  mockSupabase.from.mockReturnValue(mockFrom);

  // Mock de storage
  mockSupabase.storage.from.mockReturnValue({
    upload: vi.fn(),
    download: vi.fn(),
    remove: vi.fn(),
  });

  // Configuration de l'authentification
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: { id: "user-123", email: "test@example.com" } },
    error: null,
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

// Fonction simple pour configurer des réponses
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
