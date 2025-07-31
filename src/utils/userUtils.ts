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
    errors.push("• Le nom de votre entreprise/atelier est obligatoire");
  }

  if (!profile.location?.trim()) {
    errors.push("• Votre localisation est obligatoire (ex: Lyon, France)");
  }

  if (!profile.specialties || profile.specialties.length === 0) {
    errors.push("• Veuillez sélectionner au moins une spécialité");
  }

  if (!profile.description?.trim()) {
    errors.push("• Une description de votre activité est obligatoire");
  }

  // Validation supplémentaire pour la description
  if (profile.description?.trim() && profile.description.trim().length < 20) {
    errors.push("• La description doit contenir au moins 20 caractères");
  }

  return errors;
};

// Validation des données utilisateur standard
export const validateUserProfile = (profile: Partial<User>): string[] => {
  const errors: string[] = [];

  if (!profile.username?.trim()) {
    errors.push("• Le nom d'utilisateur est obligatoire");
  } else if (profile.username.trim().length < 3) {
    errors.push("• Le nom d'utilisateur doit contenir au moins 3 caractères");
  }

  if (!profile.firstName?.trim()) {
    errors.push("• Le prénom est obligatoire");
  }

  if (!profile.lastName?.trim()) {
    errors.push("• Le nom de famille est obligatoire");
  }

  // Validation optionnelle pour la bio
  if (profile.bio?.trim() && profile.bio.trim().length > 500) {
    errors.push("• La bio ne peut pas dépasser 500 caractères");
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
