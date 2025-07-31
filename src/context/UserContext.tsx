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
        console.warn(
          "Erreur lors de la récupération des données utilisateur:",
          userError
        );
      }

      // Récupérer le profil artisan si l'utilisateur est artisan
      let artisanData = null;
      if (userData?.is_artisan) {
        const { data: artisanProfile, error: artisanError } = await supabase
          .from("artisan_profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (artisanError && artisanError.code !== "PGRST116") {
          console.warn(
            "Erreur lors de la récupération du profil artisan:",
            artisanError
          );
        } else {
          artisanData = artisanProfile;
        }
      }

      return { userData, artisanData };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error
      );
      return { userData: null, artisanData: null };
    }
  };

  // Calcul des capacités utilisateur
  const capabilities = getUserCapabilities(auth.user);

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
          username: data.username,
          full_name: `${data.firstName} ${data.lastName}`.trim(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn(
            "Erreur lors de la mise à jour de la table 'users':",
            profileError.message
          );
        } else {
          console.log("✅ Profil utilisateur mis à jour dans la table 'users'");
        }
      } catch (tableError) {
        console.warn(
          "Erreur lors de la mise à jour de la table 'users':",
          tableError
        );
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
      console.error("Erreur lors de la mise à jour du profil:", error);
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
      const { error: authError } = await supabase.auth.updateUser({
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

      // Mise à jour du statut artisan dans la table users
      try {
        const { error: profileError } = await supabase.from("users").upsert({
          id: auth.user.id,
          is_artisan: true,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn(
            "Erreur lors de la mise à jour du statut artisan dans la table 'users':",
            profileError.message
          );
        }
      } catch (tableError) {
        console.warn(
          "Erreur lors de la mise à jour du statut artisan dans la table 'users':",
          tableError
        );
      }

      // Tentative de création du profil artisan (optionnel)
      try {
        const { error: artisanError } = await supabase
          .from("artisan_profiles")
          .insert({
            user_id: auth.user.id,
            business_name: artisanData.businessName,
            location: artisanData.location,
            description: artisanData.description,
            established_year: artisanData.establishedYear,
            specialties: artisanData.specialties,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (artisanError) {
          console.warn(
            "Erreur lors de la création du profil artisan dans la table 'artisan_profiles':",
            artisanError.message
          );
        } else {
          console.log(
            "✅ Profil artisan créé dans la table 'artisan_profiles'"
          );
        }
      } catch (tableError) {
        console.warn(
          "Table 'artisan_profiles' non disponible, utilisation des métadonnées uniquement:",
          tableError
        );
      }
    } catch (error) {
      console.error("Erreur lors de la création du profil artisan:", error);
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
      const { error: authError } = await supabase.auth.updateUser({
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

      // Tentative de mise à jour du profil artisan dans la table (optionnel)
      try {
        const { error } = await supabase.from("artisan_profiles").upsert({
          user_id: auth.user.id,
          business_name: data.businessName,
          location: data.location,
          description: data.description,
          established_year: data.establishedYear,
          specialties: data.specialties,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.warn(
            "Erreur lors de la mise à jour du profil artisan dans la table 'artisan_profiles':",
            error.message
          );
        } else {
          console.log(
            "✅ Profil artisan mis à jour dans la table 'artisan_profiles'"
          );
        }
      } catch (tableError) {
        console.warn(
          "Table 'artisan_profiles' non disponible, utilisation des métadonnées uniquement:",
          tableError
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil artisan:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        ...auth,
        capabilities,
        updateProfile,
        upgradeToArtisan,
        updateArtisanProfile,
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
