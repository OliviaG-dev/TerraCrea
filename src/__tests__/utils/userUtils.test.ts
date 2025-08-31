import { describe, it, expect } from "vitest";
import {
  isArtisan,
  isBuyer,
  canCreateProduct,
  canPurchase,
  isVerifiedArtisan,
  hasArtisanProfile,
  getArtisanDisplayName,
  getUserDisplayName,
  createDefaultArtisanProfile,
  validateArtisanProfile,
  validateUserProfile,
  getUserCapabilities,
  validateCredentials,
  type UserCapabilities,
  type CredentialValidation,
} from "../../utils/userUtils";
import { User, ArtisanProfile } from "../../types/User";

// Mock des types pour les tests
const mockUser: User = {
  id: "1",
  email: "test@example.com",
  username: "testuser",
  firstName: "John",
  lastName: "Doe",
  bio: "Test bio",
  isArtisan: false,
  isBuyer: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockArtisanUser: User = {
  ...mockUser,
  id: "2",
  isArtisan: true,
  isBuyer: false,
  artisanProfile: {
    businessName: "Test Business",
    location: "Paris, France",
    specialties: ["Pottery", "Ceramics"],
    description: "A test artisan business with pottery and ceramics",
    verified: true,
    totalSales: 100,
  },
};

const mockUnverifiedArtisanUser: User = {
  ...mockUser,
  id: "3",
  isArtisan: true,
  isBuyer: false,
  artisanProfile: {
    businessName: "Unverified Business",
    location: "Lyon, France",
    specialties: ["Woodworking"],
    description: "An unverified artisan business",
    verified: false,
    totalSales: 0,
  },
};

describe("userUtils", () => {
  describe("Vérifications de rôles", () => {
    describe("isArtisan", () => {
      it("devrait retourner true pour un utilisateur artisan", () => {
        expect(isArtisan(mockArtisanUser)).toBe(true);
      });

      it("devrait retourner false pour un utilisateur non-artisan", () => {
        expect(isArtisan(mockUser)).toBe(false);
      });

      it("devrait retourner false pour un utilisateur null", () => {
        expect(isArtisan(null)).toBe(false);
      });
    });

    describe("isBuyer", () => {
      it("devrait retourner true pour un utilisateur acheteur", () => {
        expect(isBuyer(mockUser)).toBe(true);
      });

      it("devrait retourner false pour un utilisateur non-acheteur", () => {
        expect(isBuyer(mockArtisanUser)).toBe(false);
      });

      it("devrait retourner false pour un utilisateur null", () => {
        expect(isBuyer(null)).toBe(false);
      });
    });

    describe("canCreateProduct", () => {
      it("devrait retourner true pour un artisan", () => {
        expect(canCreateProduct(mockArtisanUser)).toBe(true);
      });

      it("devrait retourner false pour un non-artisan", () => {
        expect(canCreateProduct(mockUser)).toBe(false);
      });

      it("devrait retourner false pour un utilisateur null", () => {
        expect(canCreateProduct(null)).toBe(false);
      });
    });

    describe("canPurchase", () => {
      it("devrait retourner true pour un acheteur", () => {
        expect(canPurchase(mockUser)).toBe(true);
      });

      it("devrait retourner false pour un non-acheteur", () => {
        expect(canPurchase(mockArtisanUser)).toBe(false);
      });

      it("devrait retourner false pour un utilisateur null", () => {
        expect(canPurchase(null)).toBe(false);
      });
    });

    describe("isVerifiedArtisan", () => {
      it("devrait retourner true pour un artisan vérifié", () => {
        expect(isVerifiedArtisan(mockArtisanUser)).toBe(true);
      });

      it("devrait retourner false pour un artisan non vérifié", () => {
        expect(isVerifiedArtisan(mockUnverifiedArtisanUser)).toBe(false);
      });

      it("devrait retourner false pour un non-artisan", () => {
        expect(isVerifiedArtisan(mockUser)).toBe(false);
      });

      it("devrait retourner false pour un utilisateur null", () => {
        expect(isVerifiedArtisan(null)).toBe(false);
      });
    });
  });

  describe("Gestion du profil artisan", () => {
    describe("hasArtisanProfile", () => {
      it("devrait retourner true pour un utilisateur avec profil artisan", () => {
        expect(hasArtisanProfile(mockArtisanUser)).toBe(true);
      });

      it("devrait retourner false pour un utilisateur sans profil artisan", () => {
        expect(hasArtisanProfile(mockUser)).toBe(false);
      });

      it("devrait retourner false pour un utilisateur null", () => {
        expect(hasArtisanProfile(null)).toBe(false);
      });
    });

    describe("getArtisanDisplayName", () => {
      it("devrait retourner le nom de l'entreprise si disponible", () => {
        expect(getArtisanDisplayName(mockArtisanUser)).toBe("Test Business");
      });

      it("devrait retourner le nom complet si pas de nom d'entreprise", () => {
        const userWithoutBusinessName = {
          ...mockArtisanUser,
          artisanProfile: {
            ...mockArtisanUser.artisanProfile!,
            businessName: undefined,
          },
        };
        expect(getArtisanDisplayName(userWithoutBusinessName)).toBe("John Doe");
      });

      it("devrait retourner le nom d'utilisateur si pas de nom complet", () => {
        const userWithoutNames = {
          ...mockArtisanUser,
          firstName: undefined,
          lastName: undefined,
          artisanProfile: {
            ...mockArtisanUser.artisanProfile!,
            businessName: undefined,
          },
        };
        expect(getArtisanDisplayName(userWithoutNames)).toBe("testuser");
      });

      it("devrait retourner l'email si pas de nom d'utilisateur", () => {
        const userWithoutUsername = {
          ...mockArtisanUser,
          firstName: undefined,
          lastName: undefined,
          username: undefined,
          artisanProfile: {
            ...mockArtisanUser.artisanProfile!,
            businessName: undefined,
          },
        };
        expect(getArtisanDisplayName(userWithoutUsername)).toBe(
          "test@example.com"
        );
      });

      it("devrait retourner 'Artisan' par défaut", () => {
        const userWithoutAnyName = {
          ...mockArtisanUser,
          firstName: undefined,
          lastName: undefined,
          username: undefined,
          email: undefined,
          artisanProfile: {
            ...mockArtisanUser.artisanProfile!,
            businessName: undefined,
          },
        };
        expect(getArtisanDisplayName(userWithoutAnyName)).toBe("Artisan");
      });

      it("devrait retourner une chaîne vide pour un utilisateur null", () => {
        expect(getArtisanDisplayName(null)).toBe("");
      });
    });

    describe("getUserDisplayName", () => {
      it("devrait retourner le nom complet si disponible", () => {
        expect(getUserDisplayName(mockUser)).toBe("John Doe");
      });

      it("devrait retourner le nom d'utilisateur si pas de nom complet", () => {
        const userWithoutNames = {
          ...mockUser,
          firstName: undefined,
          lastName: undefined,
        };
        expect(getUserDisplayName(userWithoutNames)).toBe("testuser");
      });

      it("devrait retourner l'email si pas de nom d'utilisateur", () => {
        const userWithoutUsername = {
          ...mockUser,
          firstName: undefined,
          lastName: undefined,
          username: undefined,
        };
        expect(getUserDisplayName(userWithoutUsername)).toBe(
          "test@example.com"
        );
      });

      it("devrait retourner 'Utilisateur' par défaut", () => {
        const userWithoutAnyName = {
          ...mockUser,
          firstName: undefined,
          lastName: undefined,
          username: undefined,
          email: undefined,
        };
        expect(getUserDisplayName(userWithoutAnyName)).toBe("Utilisateur");
      });

      it("devrait retourner une chaîne vide pour un utilisateur null", () => {
        expect(getUserDisplayName(null)).toBe("");
      });
    });
  });

  describe("Création de profil", () => {
    describe("createDefaultArtisanProfile", () => {
      it("devrait créer un profil artisan par défaut", () => {
        const profile = createDefaultArtisanProfile();

        expect(profile).toEqual({
          specialties: [],
          verified: false,
          totalSales: 0,
        });
      });

      it("devrait retourner un objet avec les bonnes propriétés", () => {
        const profile = createDefaultArtisanProfile();

        expect(profile).toHaveProperty("specialties");
        expect(profile).toHaveProperty("verified");
        expect(profile).toHaveProperty("totalSales");
      });
    });
  });

  describe("Validation des profils", () => {
    describe("validateArtisanProfile", () => {
      it("devrait valider un profil artisan complet", () => {
        const profile = {
          businessName: "Test Business",
          location: "Paris, France",
          specialties: ["Pottery"],
          description: "A test artisan business with pottery",
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toEqual([]);
      });

      it("devrait détecter un nom d'entreprise manquant", () => {
        const profile = {
          location: "Paris, France",
          specialties: ["Pottery"],
          description: "A test artisan business with pottery",
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toContain(
          "• Le nom de votre entreprise/atelier est obligatoire"
        );
      });

      it("devrait détecter une localisation manquante", () => {
        const profile = {
          businessName: "Test Business",
          specialties: ["Pottery"],
          description: "A test artisan business with pottery",
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toContain(
          "• Votre localisation est obligatoire (ex: Lyon, France)"
        );
      });

      it("devrait détecter des spécialités manquantes", () => {
        const profile = {
          businessName: "Test Business",
          location: "Paris, France",
          description: "A test artisan business with pottery",
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toContain(
          "• Veuillez sélectionner au moins une spécialité"
        );
      });

      it("devrait détecter une description manquante", () => {
        const profile = {
          businessName: "Test Business",
          location: "Paris, France",
          specialties: ["Pottery"],
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toContain(
          "• Une description de votre activité est obligatoire"
        );
      });

      it("devrait détecter une description trop courte", () => {
        const profile = {
          businessName: "Test Business",
          location: "Paris, France",
          specialties: ["Pottery"],
          description: "Short",
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toContain(
          "• La description doit contenir au moins 20 caractères"
        );
      });

      it("devrait gérer les chaînes vides et espaces", () => {
        const profile = {
          businessName: "   ",
          location: "",
          specialties: [],
          description: "   ",
        };

        const errors = validateArtisanProfile(profile);
        expect(errors).toContain(
          "• Le nom de votre entreprise/atelier est obligatoire"
        );
        expect(errors).toContain(
          "• Votre localisation est obligatoire (ex: Lyon, France)"
        );
        expect(errors).toContain(
          "• Veuillez sélectionner au moins une spécialité"
        );
        expect(errors).toContain(
          "• Une description de votre activité est obligatoire"
        );
      });
    });

    describe("validateUserProfile", () => {
      it("devrait valider un profil utilisateur complet", () => {
        const profile = {
          username: "testuser",
          firstName: "John",
          lastName: "Doe",
          bio: "A test bio",
        };

        const errors = validateUserProfile(profile);
        expect(errors).toEqual([]);
      });

      it("devrait détecter un nom d'utilisateur manquant", () => {
        const profile = {
          firstName: "John",
          lastName: "Doe",
        };

        const errors = validateUserProfile(profile);
        expect(errors).toContain("• Le nom d'utilisateur est obligatoire");
      });

      it("devrait détecter un nom d'utilisateur trop court", () => {
        const profile = {
          username: "ab",
          firstName: "John",
          lastName: "Doe",
        };

        const errors = validateUserProfile(profile);
        expect(errors).toContain(
          "• Le nom d'utilisateur doit contenir au moins 3 caractères"
        );
      });

      it("devrait détecter un prénom manquant", () => {
        const profile = {
          username: "testuser",
          lastName: "Doe",
        };

        const errors = validateUserProfile(profile);
        expect(errors).toContain("• Le prénom est obligatoire");
      });

      it("devrait détecter un nom de famille manquant", () => {
        const profile = {
          username: "testuser",
          firstName: "John",
        };

        const errors = validateUserProfile(profile);
        expect(errors).toContain("• Le nom de famille est obligatoire");
      });

      it("devrait détecter une bio trop longue", () => {
        const longBio = "a".repeat(501);
        const profile = {
          username: "testuser",
          firstName: "John",
          lastName: "Doe",
          bio: longBio,
        };

        const errors = validateUserProfile(profile);
        expect(errors).toContain(
          "• La bio ne peut pas dépasser 500 caractères"
        );
      });

      it("devrait gérer les chaînes vides et espaces", () => {
        const profile = {
          username: "   ",
          firstName: "",
          lastName: "   ",
        };

        const errors = validateUserProfile(profile);
        expect(errors).toContain("• Le nom d'utilisateur est obligatoire");
        expect(errors).toContain("• Le prénom est obligatoire");
        expect(errors).toContain("• Le nom de famille est obligatoire");
      });
    });
  });

  describe("Capacités utilisateur", () => {
    describe("getUserCapabilities", () => {
      it("devrait retourner des capacités par défaut pour un utilisateur null", () => {
        const capabilities = getUserCapabilities(null);

        expect(capabilities).toEqual({
          canCreateProducts: false,
          canPurchase: false,
          canUpgradeToArtisan: false,
          isVerified: false,
          needsArtisanSetup: false,
        });
      });

      it("devrait retourner les bonnes capacités pour un acheteur", () => {
        const capabilities = getUserCapabilities(mockUser);

        expect(capabilities).toEqual({
          canCreateProducts: false,
          canPurchase: true,
          canUpgradeToArtisan: true,
          isVerified: false,
          needsArtisanSetup: false,
        });
      });

      it("devrait retourner les bonnes capacités pour un artisan vérifié", () => {
        const capabilities = getUserCapabilities(mockArtisanUser);

        expect(capabilities).toEqual({
          canCreateProducts: true,
          canPurchase: false,
          canUpgradeToArtisan: false,
          isVerified: true,
          needsArtisanSetup: false,
        });
      });

      it("devrait retourner les bonnes capacités pour un artisan non vérifié", () => {
        const capabilities = getUserCapabilities(mockUnverifiedArtisanUser);

        expect(capabilities).toEqual({
          canCreateProducts: true,
          canPurchase: false,
          canUpgradeToArtisan: false,
          isVerified: false,
          needsArtisanSetup: false,
        });
      });

      it("devrait détecter qu'un artisan a besoin de configuration", () => {
        const artisanWithoutProfile = {
          ...mockUser,
          isArtisan: true,
          isBuyer: false,
          artisanProfile: undefined,
        };

        const capabilities = getUserCapabilities(artisanWithoutProfile);

        expect(capabilities.needsArtisanSetup).toBe(true);
      });

      it("devrait retourner un objet UserCapabilities valide", () => {
        const capabilities = getUserCapabilities(mockUser);

        expect(capabilities).toHaveProperty("canCreateProducts");
        expect(capabilities).toHaveProperty("canPurchase");
        expect(capabilities).toHaveProperty("canUpgradeToArtisan");
        expect(capabilities).toHaveProperty("isVerified");
        expect(capabilities).toHaveProperty("needsArtisanSetup");

        // Vérifier que toutes les propriétés sont des booléens
        Object.values(capabilities).forEach((value) => {
          expect(typeof value).toBe("boolean");
        });
      });
    });

    describe("Validation des credentials", () => {
      describe("validateCredentials", () => {
        it("devrait valider des credentials corrects", () => {
          const result = validateCredentials("test@example.com", "password123");

          expect(result.emailFormat).toBe(true);
          expect(result.passwordLength).toBe(true);
          expect(result.isValid).toBe(true);
        });

        it("devrait détecter un format d'email invalide", () => {
          const result = validateCredentials("invalid-email", "password123");

          expect(result.emailFormat).toBe(false);
          expect(result.passwordLength).toBe(true);
          expect(result.isValid).toBe(false);
        });

        it("devrait détecter un mot de passe trop court", () => {
          const result = validateCredentials("test@example.com", "123");

          expect(result.emailFormat).toBe(true);
          expect(result.passwordLength).toBe(false);
          expect(result.isValid).toBe(false);
        });

        it("devrait détecter des credentials invalides (email et mot de passe)", () => {
          const result = validateCredentials("invalid-email", "123");

          expect(result.emailFormat).toBe(false);
          expect(result.passwordLength).toBe(false);
          expect(result.isValid).toBe(false);
        });

        it("devrait gérer les espaces dans l'email", () => {
          const result = validateCredentials(
            "  test@example.com  ",
            "password123"
          );

          expect(result.emailFormat).toBe(true);
          expect(result.passwordLength).toBe(true);
          expect(result.isValid).toBe(true);
        });

        it("devrait accepter un mot de passe de 6 caractères exactement", () => {
          const result = validateCredentials("test@example.com", "123456");

          expect(result.emailFormat).toBe(true);
          expect(result.passwordLength).toBe(true);
          expect(result.isValid).toBe(true);
        });

        it("devrait rejeter un mot de passe de 5 caractères", () => {
          const result = validateCredentials("test@example.com", "12345");

          expect(result.emailFormat).toBe(true);
          expect(result.passwordLength).toBe(false);
          expect(result.isValid).toBe(false);
        });

        it("devrait valider différents formats d'email valides", () => {
          const validEmails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.org",
            "123@domain.net",
          ];

          validEmails.forEach((email) => {
            const result = validateCredentials(email, "password123");
            expect(result.emailFormat).toBe(true);
            expect(result.isValid).toBe(true);
          });
        });

        it("devrait rejeter des formats d'email invalides", () => {
          const invalidEmails = [
            "plainaddress",
            "@missingdomain.com",
            "missing@.com",
            "missing.domain@.com",
            "two@@domain.com",
            "domain.com",
            "",
          ];

          invalidEmails.forEach((email) => {
            const result = validateCredentials(email, "password123");
            expect(result.emailFormat).toBe(false);
            expect(result.isValid).toBe(false);
          });
        });
      });
    });
  });
});
