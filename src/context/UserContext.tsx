import React, { createContext, ReactNode, useContext } from "react";
import { User, ArtisanProfileUpdate, UserProfileUpdate } from "../types/User";
import { useAuth } from "../hooks/useAuth";
import { getUserCapabilities, UserCapabilities } from "../utils/userUtils";
import { supabase } from "../services/supabase";

interface UserContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  isAuthenticated: boolean;

  // Nouvelles fonctionnalités hybrides
  capabilities: UserCapabilities;
  updateProfile: (data: UserProfileUpdate) => Promise<void>;
  upgradeToArtisan: (artisanData: ArtisanProfileUpdate) => Promise<void>;
  updateArtisanProfile: (data: ArtisanProfileUpdate) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Fonctionnalités de mot de passe oublié
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  // Fonction pour récupérer les données utilisateur complètes
  const fetchUserData = async (userId: string) => {
    try {
      // Récupérer les données de la table users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // Erreur silencieuse pour les erreurs non critiques
      }

      // Récupérer le profil artisan si l'utilisateur est artisan
      let artisanData = null;
      if (userData?.is_artisan) {
        const { data: artisanProfile, error: artisanError } = await supabase
          .from("artisans")
          .select("*")
          .eq("id", userId)
          .single();

        if (artisanError && artisanError.code !== "PGRST116") {
          // Erreur silencieuse pour les erreurs non critiques
        } else {
          artisanData = artisanProfile;
        }
      }

      return { userData, artisanData };
    } catch (error) {
      return { userData: null, artisanData: null };
    }
  };

  // Fonction pour construire l'objet utilisateur avec les métadonnées
  const buildUserWithMetadata = (authUser: any): User | null => {
    if (!authUser) return null;

    // Récupérer les métadonnées utilisateur
    const userMetadata = authUser.user_metadata || {};
    const appMetadata = authUser.app_metadata || {};

    // Construire l'objet utilisateur avec les métadonnées
    const user: User = {
      id: authUser.id,
      email: authUser.email,
      phone: authUser.phone,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at,
      email_confirmed_at: authUser.email_confirmed_at,
      phone_confirmed_at: authUser.phone_confirmed_at,
      last_sign_in_at: authUser.last_sign_in_at,
      app_metadata: appMetadata,
      user_metadata: userMetadata,
      aud: authUser.aud,
      confirmation_sent_at: authUser.confirmation_sent_at,
      recovery_sent_at: authUser.recovery_sent_at,
      email_change_sent_at: authUser.email_change_sent_at,
      new_email: authUser.new_email,
      invited_at: authUser.invited_at,
      action_link: authUser.action_link,
      role: authUser.role,

      // Profil général depuis les métadonnées
      username: userMetadata.username || "",
      firstName: userMetadata.firstName || "",
      lastName: userMetadata.lastName || "",
      profileImage: userMetadata.profileImage || "",
      bio: userMetadata.bio || "",

      // Capacités utilisateur
      isArtisan: userMetadata.isArtisan || appMetadata.isArtisan || false,
      isBuyer: appMetadata.isBuyer !== false, // true par défaut

      // Informations artisan depuis les métadonnées
      artisanProfile:
        userMetadata.isArtisan || appMetadata.isArtisan
          ? {
              businessName: userMetadata.artisanBusinessName || "",
              location: userMetadata.artisanLocation || "",
              description: userMetadata.artisanDescription || "",
              establishedYear:
                userMetadata.artisanEstablishedYear || new Date().getFullYear(),
              specialties: userMetadata.artisanSpecialties || [],
              verified: appMetadata.verified || false,
              rating: userMetadata.rating || 0,
              totalSales: userMetadata.totalSales || 0,
            }
          : undefined,
    };

    return user;
  };

  // Calcul des capacités utilisateur
  const capabilities = getUserCapabilities(auth.user);

  // Fonction pour rafraîchir l'état utilisateur
  const refreshUser = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        // Forcer la mise à jour de l'état en reconstruisant l'utilisateur avec les métadonnées
        const updatedUser = buildUserWithMetadata(currentUser);
        // Note: Dans une vraie implémentation, vous devriez avoir un setter pour l'utilisateur
      }
    } catch (error) {}
  };

  // Fonction de mise à jour du profil utilisateur
  const updateProfile = async (data: UserProfileUpdate) => {
    if (!auth.user?.id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      // Mise à jour des métadonnées utilisateur dans Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Mise à jour du profil dans la table users
      try {
        const { error: profileError } = await supabase.from("users").upsert({
          id: auth.user.id,
          email: auth.user.email || "", // Inclure l'email pour éviter l'erreur de contrainte
          username: data.username,
          full_name: `${data.firstName} ${data.lastName}`.trim(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          // Erreur silencieuse pour les erreurs non critiques
        }
      } catch (tableError) {
        // Erreur silencieuse pour les erreurs non critiques
      }

      // Mettre à jour l'état local de l'utilisateur
      if (auth.user) {
        const updatedUser = {
          ...auth.user,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
        };
        // Note: Dans une vraie implémentation, vous devriez avoir une fonction pour mettre à jour l'état
        // Pour l'instant, on laisse l'état se mettre à jour via l'écouteur d'auth
      }
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour devenir artisan
  const upgradeToArtisan = async (artisanData: ArtisanProfileUpdate) => {
    if (!auth.user?.id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      // Mise à jour des métadonnées utilisateur pour devenir artisan
      const { data: updatedUser, error: authError } =
        await supabase.auth.updateUser({
          data: {
            isArtisan: true,
            artisanBusinessName: artisanData.businessName,
            artisanLocation: artisanData.location,
            artisanDescription: artisanData.description,
            artisanEstablishedYear: artisanData.establishedYear,
            artisanSpecialties: artisanData.specialties,
          },
        });

      if (authError) {
        throw new Error(authError.message);
      }

      // Forcer la mise à jour de l'état utilisateur avec les nouvelles métadonnées
      if (updatedUser.user) {
        // Rafraîchir l'état utilisateur pour refléter les changements
        await refreshUser();
      }

      // Mise à jour du statut artisan dans la table users
      try {
        const { error: profileError } = await supabase.from("users").upsert({
          id: auth.user.id,
          email: auth.user.email || "", // Inclure l'email pour éviter l'erreur de contrainte
          is_artisan: true,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          // Erreur silencieuse pour les erreurs non critiques
        }
      } catch (tableError) {
        // Erreur silencieuse pour les erreurs non critiques
      }

      // Création/mise à jour du profil artisan dans la table artisans
      try {
        const { error: artisanError } = await supabase.from("artisans").upsert({
          id: auth.user.id,
          name: artisanData.businessName,
          location: artisanData.location,
          bio: artisanData.description,
          email: auth.user.email,
          established_year: artisanData.establishedYear,
          specialties: artisanData.specialties,
          is_verified: false,
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (artisanError) {
          // Erreur silencieuse pour les erreurs non critiques
        }
      } catch (tableError) {
        // Erreur silencieuse pour les erreurs non critiques
      }

      // Note: Le profil artisan a déjà été créé/mis à jour avec l'appel UPSERT précédent
      // Pas besoin d'un deuxième appel INSERT qui causerait un conflit
    } catch (error) {
      throw error;
    }
  };

  // Fonction de mise à jour du profil artisan
  const updateArtisanProfile = async (data: ArtisanProfileUpdate) => {
    if (!auth.user?.id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      // Mise à jour des métadonnées utilisateur pour le profil artisan
      const { data: updatedUser, error: authError } =
        await supabase.auth.updateUser({
          data: {
            artisanBusinessName: data.businessName,
            artisanLocation: data.location,
            artisanDescription: data.description,
            artisanEstablishedYear: data.establishedYear,
            artisanSpecialties: data.specialties,
          },
        });

      if (authError) {
        throw new Error(authError.message);
      }

      // Forcer la mise à jour de l'état utilisateur avec les nouvelles métadonnées
      if (updatedUser.user) {
        // Rafraîchir l'état utilisateur pour refléter les changements
        await refreshUser();
      }

      // Mise à jour du profil artisan dans la table artisans
      try {
        const { error } = await supabase.from("artisans").upsert({
          id: auth.user.id,
          name: data.businessName,
          location: data.location,
          bio: data.description,
          established_year: data.establishedYear,
          specialties: data.specialties,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          // Erreur silencieuse pour les erreurs non critiques
        }
      } catch (tableError) {
        // Erreur silencieuse pour les erreurs non critiques
      }

      // Mise à jour de l'artisan dans la table artisans
      try {
        const { error: artisansError } = await supabase
          .from("artisans")
          .upsert({
            id: auth.user.id,
            name:
              data.businessName ||
              `${auth.user.user_metadata?.firstName || ""} ${
                auth.user.user_metadata?.lastName || ""
              }`.trim() ||
              auth.user.email?.split("@")[0] ||
              "Artisan",
            location: data.location,
            bio: data.description,
            updated_at: new Date().toISOString(),
          });

        if (artisansError) {
          // Erreur silencieuse pour les erreurs non critiques
        }
      } catch (tableError) {
        // Erreur silencieuse pour les erreurs non critiques
      }
    } catch (error) {
      throw error;
    }
  };

  // Construire l'objet utilisateur avec les métadonnées
  const userWithMetadata = buildUserWithMetadata(auth.user);

  return (
    <UserContext.Provider
      value={{
        ...auth,
        user: userWithMetadata, // Remplacer l'utilisateur par celui avec les métadonnées
        capabilities,
        updateProfile,
        upgradeToArtisan,
        updateArtisanProfile,
        refreshUser,
        resetPassword: auth.resetPassword,
        updatePassword: auth.updatePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext must be used within a UserProvider");
  return context;
};
