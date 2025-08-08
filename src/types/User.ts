export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  aud?: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  invited_at?: string;
  action_link?: string;
  role?: string;

  // Profil général
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  bio?: string;

  // Capacités utilisateur
  isArtisan: boolean; // Peut créer/vendre
  isBuyer: boolean; // Peut acheter (true par défaut)

  // Informations artisan (optionnelles)
  artisanProfile?: ArtisanProfile;
}

export interface ArtisanProfile {
  businessName?: string;
  location?: string;
  specialties: string[]; // Categories d'artisanat
  verified: boolean;
  rating?: number;
  totalSales?: number;
  description?: string;
  establishedYear?: number;
  phone?: string;
}

// Fonction utilitaire pour créer un utilisateur par défaut
export const createDefaultUser = (baseUser: Partial<User>): User =>
  ({
    ...baseUser,
    id: baseUser.id || "",
    isArtisan: false,
    isBuyer: true,
    artisanProfile: undefined,
  } as User);

// Types pour les mises à jour de profil
export interface UserProfileUpdate {
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  bio?: string;
}

export interface ArtisanProfileUpdate {
  businessName?: string;
  location?: string;
  specialties?: string[];
  description?: string;
  establishedYear?: number;
  phone?: string;
}
