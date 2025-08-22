import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuth } from "../../hooks/useAuth";

// Mock des services
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock("../../services/authService", () => ({
  AuthService: {
    signUpWithEmailConfirmation: vi.fn(),
    signInWithEmailPassword: vi.fn(),
    resendConfirmation: vi.fn(),
    checkEmailConfirmed: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock("../../types/User", () => ({
  createDefaultUser: vi.fn((user) => ({
    id: user.id || "test-user-id",
    email: user.email || "test@example.com",
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    isArtisan: false,
    isBuyer: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  })),
}));

import { supabase } from "../../services/supabase";
import { AuthService } from "../../services/authService";
import { createDefaultUser } from "../../types/User";

const mockSupabase = vi.mocked(supabase);
const mockAuthService = vi.mocked(AuthService);
const mockCreateDefaultUser = vi.mocked(createDefaultUser);

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock par défaut pour getSession
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Mock par défaut pour onAuthStateChange
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should load existing session on mount", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      const mockSession = { user: mockUser };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockCreateDefaultUser.mockReturnValue({
        id: "user-123",
        email: "user@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        isArtisan: false,
        isBuyer: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.id).toBe("user-123");
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle session loading error gracefully", async () => {
      // Mock une erreur qui ne casse pas le composant
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Session error" },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Authentication State Changes", () => {
    it("should handle auth state change to signed in", async () => {
      const mockUser = { id: "user-123", email: "user@example.com" };
      let authStateCallback: (event: string, session: any) => void;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      });

      mockCreateDefaultUser.mockReturnValue({
        id: "user-123",
        email: "user@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        isArtisan: false,
        isBuyer: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });

      const { result } = renderHook(() => useAuth());

      // Simuler un changement d'état d'authentification
      act(() => {
        authStateCallback("SIGNED_IN", { user: mockUser });
      });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
      });
    });

    it("should handle auth state change to signed out", async () => {
      let authStateCallback: (event: string, session: any) => void;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      });

      const { result } = renderHook(() => useAuth());

      // Simuler une déconnexion
      act(() => {
        authStateCallback("SIGNED_OUT", null);
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Sign Up", () => {
    it("should handle successful sign up", async () => {
      const mockSignUpResult = {
        success: true,
        data: { user: { id: "user-123" } },
        needsConfirmation: true,
      };

      mockAuthService.signUpWithEmailConfirmation.mockResolvedValue(
        mockSignUpResult
      );

      const { result } = renderHook(() => useAuth());

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password123"
        );
      });

      expect(signUpResult).toEqual(mockSignUpResult);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle sign up error", async () => {
      const mockError = { message: "Email already exists" };
      const mockSignUpResult = {
        error: mockError,
      };

      mockAuthService.signUpWithEmailConfirmation.mockResolvedValue(
        mockSignUpResult
      );

      const { result } = renderHook(() => useAuth());

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password123"
        );
      });

      expect(signUpResult.success).toBe(false);
      expect(signUpResult.error).toBe("Email already exists");
      expect(result.current.error).toBe("Email already exists");
      expect(result.current.loading).toBe(false);
    });

    it("should handle sign up exception", async () => {
      mockAuthService.signUpWithEmailConfirmation.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth());

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password123"
        );
      });

      expect(signUpResult.success).toBe(false);
      expect(signUpResult.error).toBe("Erreur lors de l'inscription");
      expect(result.current.error).toBe("Erreur lors de l'inscription");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Sign In", () => {
    it("should handle successful sign in", async () => {
      const mockSignInResult = {
        success: true,
        data: { user: { id: "user-123" } },
        needsConfirmation: false,
      };

      mockAuthService.signInWithEmailPassword.mockResolvedValue(
        mockSignInResult
      );

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      expect(signInResult).toEqual(mockSignInResult);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle OTP requirement", async () => {
      const mockSignInResult = {
        success: false,
        needsOtp: true,
        error: "Un lien de connexion a été envoyé à votre email",
      };

      mockAuthService.signInWithEmailPassword.mockResolvedValue(
        mockSignInResult
      );

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      expect(signInResult.needsOtp).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it("should handle sign in error", async () => {
      const mockError = { message: "Invalid credentials" };
      const mockSignInResult = {
        error: mockError,
      };

      mockAuthService.signInWithEmailPassword.mockResolvedValue(
        mockSignInResult
      );

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      expect(signInResult.success).toBe(false);
      expect(signInResult.error).toBe("Invalid credentials");
      expect(result.current.error).toBe("Invalid credentials");
      expect(result.current.loading).toBe(false);
    });

    it("should handle sign in exception", async () => {
      mockAuthService.signInWithEmailPassword.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      expect(signInResult.success).toBe(false);
      expect(signInResult.error).toBe("Erreur lors de la connexion");
      expect(result.current.error).toBe("Erreur lors de la connexion");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Sign Out", () => {
    it("should handle successful sign out", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      let signOutResult;
      await act(async () => {
        signOutResult = await result.current.signOut();
      });

      expect(signOutResult.success).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it("should handle sign out error", async () => {
      const mockError = { message: "Sign out failed" };
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => useAuth());

      let signOutResult;
      await act(async () => {
        signOutResult = await result.current.signOut();
      });

      expect(signOutResult.success).toBe(false);
      expect(signOutResult.error).toBe("Sign out failed");
      expect(result.current.error).toBe("Sign out failed");
      expect(result.current.loading).toBe(false);
    });

    it("should handle sign out exception", async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      let signOutResult;
      await act(async () => {
        signOutResult = await result.current.signOut();
      });

      expect(signOutResult.success).toBe(false);
      expect(signOutResult.error).toBe("Erreur lors de la déconnexion");
      expect(result.current.error).toBe("Erreur lors de la déconnexion");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Password Management", () => {
    it("should handle password reset", async () => {
      const mockResetResult = {
        success: true,
        data: { message: "Reset email sent" },
      };

      mockAuthService.resetPassword.mockResolvedValue(mockResetResult);

      const { result } = renderHook(() => useAuth());

      let resetResult;
      await act(async () => {
        resetResult = await result.current.resetPassword("test@example.com");
      });

      expect(resetResult).toEqual(mockResetResult);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle password update", async () => {
      const mockUpdateResult = {
        success: true,
        data: { message: "Password updated" },
      };

      mockAuthService.updatePassword.mockResolvedValue(mockUpdateResult);

      const { result } = renderHook(() => useAuth());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updatePassword("newpassword123");
      });

      expect(updateResult).toEqual(mockUpdateResult);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Email Confirmation", () => {
    it("should handle resend confirmation", async () => {
      const mockResendResult = { success: true };
      mockAuthService.resendConfirmation.mockResolvedValue(mockResendResult);

      const { result } = renderHook(() => useAuth());

      const resendResult = await result.current.resendConfirmation(
        "test@example.com"
      );
      expect(resendResult).toEqual(mockResendResult);
    });

    it("should handle check email confirmed", async () => {
      mockAuthService.checkEmailConfirmed.mockResolvedValue(true);

      const { result } = renderHook(() => useAuth());

      const isConfirmed = await result.current.checkEmailConfirmed();
      expect(isConfirmed).toBe(true);
    });
  });

  describe("Loading States", () => {
    it("should set loading to true during async operations", async () => {
      // Mock a slow operation
      mockAuthService.signInWithEmailPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);

      // Start sign in
      act(() => {
        result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.loading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    it("should clear previous errors when starting new operation", async () => {
      // Set an initial error
      const { result } = renderHook(() => useAuth());
      result.current.error = "Previous error";

      // Mock successful operation
      mockAuthService.signInWithEmailPassword.mockResolvedValue({
        success: true,
        data: { user: { id: "user-123" } },
        needsOtp: false,
        needsConfirmation: false,
      });

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.error).toBeNull();
    });
  });
});
