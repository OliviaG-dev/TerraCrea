import React, { createContext, ReactNode, useContext } from "react";
import { User, ArtisanProfileUpdate, UserProfileUpdate } from "../types/User";
import { useAuth } from "../hooks/useAuth";
import { getUserCapabilities, UserCapabilities } from "../utils/userUtils";

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

  // Calcul des capacités utilisateur
  const capabilities = getUserCapabilities(auth.user);

  // Fonctions de mise à jour de profil (à implémenter dans useAuth)
  const updateProfile = async (data: UserProfileUpdate) => {
    // TODO: Implémenter la mise à jour du profil via Supabase
  };

  const upgradeToArtisan = async (artisanData: ArtisanProfileUpdate) => {
    // TODO: Implémenter l'upgrade vers artisan via Supabase
  };

  const updateArtisanProfile = async (data: ArtisanProfileUpdate) => {
    // TODO: Implémenter la mise à jour du profil artisan via Supabase
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
