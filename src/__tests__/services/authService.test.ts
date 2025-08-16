import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../../services/authService";
import { supabase } from "../../services/supabase";
import { isTimeSyncError, getTimeSyncHelpMessage } from "../../utils/timeUtils";

// Mock de Supabase
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock des utilitaires
vi.mock("../../utils/timeUtils", () => ({
  isTimeSyncError: vi.fn(),
  getTimeSyncHelpMessage: vi.fn(),
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EXPO_PUBLIC_APP_URL = "http://localhost:8081";
  });

  describe("signUpWithEmailConfirmation", () => {
    const signUpData = {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
    };

    it("should sign up successfully with email confirmation", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        email_confirmed_at: null,
      };

      (supabase.auth.signUp as vi.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.signUpWithEmailConfirmation(signUpData);

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(result.needsConfirmation).toBe(true);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: "http://localhost:8081/email-confirmed",
          data: {
            username: "johndoe",
            firstName: "John",
            lastName: "Doe",
            isBuyer: true,
            isArtisan: false,
          },
        },
      });
    });

    it("should handle signup error", async () => {
      const mockError = new Error("Signup failed");
      (supabase.auth.signUp as vi.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await AuthService.signUpWithEmailConfirmation(signUpData);

      expect(result.data.user).toBeNull();
      expect(result.error).toBe(mockError);
      expect(result.needsConfirmation).toBe(false);
    });

    it("should use email prefix as username when not provided", async () => {
      const signUpDataWithoutUsername = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      (supabase.auth.signUp as vi.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await AuthService.signUpWithEmailConfirmation(signUpDataWithoutUsername);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: "http://localhost:8081/email-confirmed",
          data: {
            username: "test",
            firstName: "John",
            lastName: "Doe",
            isBuyer: true,
            isArtisan: false,
          },
        },
      });
    });
  });

  describe("resendConfirmation", () => {
    it("should resend confirmation email successfully", async () => {
      (supabase.auth.resend as vi.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.resendConfirmation("test@example.com");

      expect(result.error).toBeNull();
      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: "signup",
        email: "test@example.com",
      });
    });

    it("should handle resend error", async () => {
      const mockError = new Error("Resend failed");
      (supabase.auth.resend as vi.Mock).mockResolvedValue({
        error: mockError,
      });

      const result = await AuthService.resendConfirmation("test@example.com");

      expect(result.error).toBe(mockError);
    });
  });

  describe("checkEmailConfirmed", () => {
    it("should return true when email is confirmed", async () => {
      const mockUser = {
        email_confirmed_at: "2023-01-01T00:00:00Z",
      };

      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.checkEmailConfirmed();

      expect(result).toBe(true);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it("should return false when email is not confirmed", async () => {
      const mockUser = {
        email_confirmed_at: null,
      };

      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.checkEmailConfirmed();

      expect(result).toBe(false);
    });

    it("should return false when no user", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.checkEmailConfirmed();

      expect(result).toBe(false);
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      (supabase.auth.resetPasswordForEmail as vi.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await AuthService.resetPassword("test@example.com");

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        {
          redirectTo: "http://localhost:8081/reset-password",
        }
      );
    });

    it("should handle missing email", async () => {
      const result = await AuthService.resetPassword("");

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("Email requis");
    });

    it("should handle invalid email format", async () => {
      const result = await AuthService.resetPassword("invalid-email");

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("Format d'email invalide");
    });

    it("should handle user not found error", async () => {
      const mockError = { message: "User not found" };
      (supabase.auth.resetPasswordForEmail as vi.Mock).mockResolvedValue({
        data: {},
        error: mockError,
      });

      const result = await AuthService.resetPassword("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("Aucun compte trouvé avec cet email");
    });

    it("should handle too many requests error", async () => {
      const mockError = { message: "Too many requests" };
      (supabase.auth.resetPasswordForEmail as vi.Mock).mockResolvedValue({
        data: {},
        error: mockError,
      });

      const result = await AuthService.resetPassword("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error.message).toBe(
        "Trop de tentatives. Veuillez réessayer plus tard"
      );
    });

    it("should handle time sync error", async () => {
      const mockError = { message: "Time sync error" };
      (supabase.auth.resetPasswordForEmail as vi.Mock).mockResolvedValue({
        data: {},
        error: mockError,
      });

      (isTimeSyncError as vi.Mock).mockReturnValue(true);
      (getTimeSyncHelpMessage as vi.Mock).mockReturnValue(
        "Time sync help message"
      );

      const result = await AuthService.resetPassword("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("Time sync help message");
    });

    it("should handle generic error", async () => {
      const mockError = { message: "Generic error" };
      (supabase.auth.resetPasswordForEmail as vi.Mock).mockResolvedValue({
        data: {},
        error: mockError,
      });

      (isTimeSyncError as vi.Mock).mockReturnValue(false);

      const result = await AuthService.resetPassword("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("Generic error");
    });
  });

  describe("signInWithPassword", () => {
    it("should sign in successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      const result = await AuthService.signInWithPassword(
        "test@example.com",
        "password123"
      );

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should handle sign in error", async () => {
      const mockError = new Error("Invalid credentials");
      (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await AuthService.signInWithPassword(
        "test@example.com",
        "password123"
      );

      expect(result.data.user).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      (supabase.auth.signOut as vi.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("should handle sign out error", async () => {
      const mockError = new Error("Sign out failed");
      (supabase.auth.signOut as vi.Mock).mockResolvedValue({
        error: mockError,
      });

      const result = await AuthService.signOut();

      expect(result.error).toBe(mockError);
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should handle no current user", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result.data.user).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
      };

      (supabase.auth.updateUser as vi.Mock).mockResolvedValue({
        data: { user: { ...updateData } },
        error: null,
      });

      const result = await AuthService.updateUserProfile(updateData);

      expect(result.data.user).toEqual(expect.objectContaining(updateData));
      expect(result.error).toBeNull();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: updateData,
      });
    });

    it("should handle update error", async () => {
      const mockError = new Error("Update failed");
      (supabase.auth.updateUser as vi.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await AuthService.updateUserProfile({ firstName: "Jane" });

      expect(result.data.user).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });

  describe("onAuthStateChange", () => {
    it("should set up auth state change listener", () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (supabase.auth.onAuthStateChange as vi.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const result = AuthService.onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        mockCallback
      );
      expect(result).toBeDefined();
    });
  });

  describe("createArtisanProfile", () => {
    it("should create artisan profile successfully", async () => {
      const artisanData = {
        userId: "user-123",
        specialty: "Pottery",
        description: "Handmade pottery",
        location: "Paris",
      };

      const mockResponse = {
        data: [{ id: "artisan-123", ...artisanData }],
        error: null,
      };

      (supabase.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse),
        }),
      });

      const result = await AuthService.createArtisanProfile(artisanData);

      expect(result.data).toEqual(mockResponse.data);
      expect(result.error).toBeNull();
    });

    it("should handle creation error", async () => {
      const artisanData = {
        userId: "user-123",
        specialty: "Pottery",
        description: "Handmade pottery",
        location: "Paris",
      };

      const mockError = new Error("Creation failed");
      (supabase.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await AuthService.createArtisanProfile(artisanData);

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });

  describe("getArtisanProfile", () => {
    it("should return artisan profile", async () => {
      const mockProfile = {
        id: "artisan-123",
        userId: "user-123",
        specialty: "Pottery",
      };

      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await AuthService.getArtisanProfile("user-123");

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it("should handle profile not found", async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      const result = await AuthService.getArtisanProfile("user-123");

      expect(result.data).toBeNull();
      expect(result.error.code).toBe("PGRST116");
    });
  });

  describe("updateArtisanProfile", () => {
    it("should update artisan profile successfully", async () => {
      const updateData = {
        specialty: "Ceramics",
        description: "Updated description",
      };

      const mockResponse = {
        data: [{ id: "artisan-123", ...updateData }],
        error: null,
      };

      (supabase.from as vi.Mock).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      });

      const result = await AuthService.updateArtisanProfile(
        "user-123",
        updateData
      );

      expect(result.data).toEqual(mockResponse.data);
      expect(result.error).toBeNull();
    });

    it("should handle update error", async () => {
      const updateData = {
        specialty: "Ceramics",
      };

      const mockError = new Error("Update failed");
      (supabase.from as vi.Mock).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await AuthService.updateArtisanProfile(
        "user-123",
        updateData
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });
});
