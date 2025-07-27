import { User, ArtisanProfile } from "../types/User";

/**
 * Utilitaires pour gérer les rôles et capacités utilisateur
 */

// Vérifications de rôles
export const isArtisan = (user: User | null): boolean => {
  return user?.isArtisan === true;
};

export const isBuyer = (user: User | null): boolean => {
  return user?.isBuyer === true;
};

export const canCreateProduct = (user: User | null): boolean => {
  return isArtisan(user);
};

export const canPurchase = (user: User | null): boolean => {
  return isBuyer(user);
};

export const isVerifiedArtisan = (user: User | null): boolean => {
  return isArtisan(user) && user?.artisanProfile?.verified === true;
};

// Gestion du profil artisan
export const hasArtisanProfile = (user: User | null): boolean => {
  return user?.artisanProfile !== undefined;
};

export const getArtisanDisplayName = (user: User | null): string => {
  if (!user) return "";

  const profile = user.artisanProfile;
  if (profile?.businessName) {
    return profile.businessName;
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  return user.username || user.email || "Artisan";
};

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return "";

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  return user.username || user.email || "Utilisateur";
};

// Création d'un profil artisan par défaut
export const createDefaultArtisanProfile = (): ArtisanProfile => ({
  specialties: [],
  verified: false,
  totalSales: 0,
});

// Validation des données artisan
export const validateArtisanProfile = (
  profile: Partial<ArtisanProfile>
): string[] => {
  const errors: string[] = [];

  if (!profile.businessName?.trim()) {
    errors.push("Le nom d'entreprise est requis");
  }

  if (!profile.location?.trim()) {
    errors.push("La localisation est requise");
  }

  if (!profile.specialties || profile.specialties.length === 0) {
    errors.push("Au moins une spécialité est requise");
  }

  if (!profile.description?.trim()) {
    errors.push("Une description est requise");
  }

  return errors;
};

// Types d'état pour l'interface utilisateur
export interface UserCapabilities {
  canCreateProducts: boolean;
  canPurchase: boolean;
  canUpgradeToArtisan: boolean;
  isVerified: boolean;
  needsArtisanSetup: boolean;
}

export const getUserCapabilities = (user: User | null): UserCapabilities => {
  if (!user) {
    return {
      canCreateProducts: false,
      canPurchase: false,
      canUpgradeToArtisan: false,
      isVerified: false,
      needsArtisanSetup: false,
    };
  }

  return {
    canCreateProducts: canCreateProduct(user),
    canPurchase: canPurchase(user),
    canUpgradeToArtisan: !isArtisan(user),
    isVerified: isVerifiedArtisan(user),
    needsArtisanSetup: isArtisan(user) && !hasArtisanProfile(user),
  };
};
