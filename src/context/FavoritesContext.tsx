import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Creation } from "../types/Creation";
import { FavoritesApi } from "../services/favoritesApi";
import { useUserContext } from "./UserContext";

interface FavoritesContextProps {
  favorites: Creation[];
  loading: boolean;
  error: string | null;
  addToFavorites: (creationId: string) => Promise<boolean>;
  removeFromFavorites: (creationId: string) => Promise<boolean>;
  toggleFavorite: (creationId: string) => Promise<boolean>;
  isFavorite: (creationId: string) => boolean;
  getFavoritesCount: () => number;
  loadFavorites: () => Promise<void>;
  clearError: () => void;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useUserContext();
  const [favorites, setFavorites] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userFavorites = await FavoritesApi.getUserFavorites();
      setFavorites(userFavorites);
    } catch (err) {
      setError("Impossible de charger vos favoris");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToFavorites = useCallback(
    async (creationId: string) => {
      try {
        const success = await FavoritesApi.addToFavorites(creationId);
        if (success) {
          // Recharger la liste des favoris
          await loadFavorites();
        }
        return success;
      } catch (err) {
        setError("Impossible d'ajouter aux favoris");
        return false;
      }
    },
    [loadFavorites]
  );

  const removeFromFavorites = useCallback(async (creationId: string) => {
    try {
      const success = await FavoritesApi.removeFromFavorites(creationId);
      if (success) {
        // Mettre à jour la liste locale immédiatement pour une meilleure UX
        setFavorites((prev) => prev.filter((fav) => fav.id !== creationId));
      }
      return success;
    } catch (err) {
      setError("Impossible de retirer des favoris");
      return false;
    }
  }, []);

  const toggleFavorite = useCallback(
    async (creationId: string) => {
      try {
        const success = await FavoritesApi.toggleFavorite(creationId);
        if (success) {
          // Recharger la liste des favoris
          await loadFavorites();
        }
        return success;
      } catch (err) {
        setError("Impossible de modifier les favoris");
        return false;
      }
    },
    [loadFavorites]
  );

  const isFavorite = useCallback(
    (creationId: string) => {
      return favorites.some((fav) => fav.id === creationId);
    },
    [favorites]
  );

  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  // Charger les favoris au montage du composant et quand l'authentification change
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        loadFavorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        getFavoritesCount,
        clearError: () => setError(null),
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
