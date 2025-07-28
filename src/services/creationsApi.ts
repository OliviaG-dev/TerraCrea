import { supabase } from "./supabase";
import { CreationCategory, CreationWithArtisan } from "../types/Creation";
import { useState, useEffect } from "react";

// =============================================
// INTERFACES POUR LES RÉPONSES SUPABASE
// =============================================

interface SupabaseCreationWithUser {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category_id: CreationCategory;
  artisan_id: string;
  materials: string[];
  is_available: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at?: string;
  tags: string[]; // Tags directement dans creations_full
  // Données jointes de la table artisans (structure réelle)
  artisans: {
    id: string;
    name: string;
    location?: string;
    profile_image_url?: string;
    bio?: string;
    email?: string;
    phone?: string;
    is_verified: boolean;
    joined_at: string;
    updated_at: string;
  } | null;
}

interface CategoryWithCount {
  id: string;
  label: string;
  creation_count: number;
}

// =============================================
// FONCTIONS DE TRANSFORMATION
// =============================================

/**
 * Transforme une création Supabase avec données utilisateur en format attendu par l'app
 */
const transformSupabaseCreationWithUser = (
  supabaseCreation: SupabaseCreationWithUser
): CreationWithArtisan => {
  const artisan = supabaseCreation.artisans || {
    id: supabaseCreation.artisan_id,
    name: "Artisan inconnu",
    location: "",
    is_verified: false,
    joined_at: "",
    updated_at: "",
  };

  // Créer le nom d'affichage de l'artisan avec les données de la table artisans
  const getArtisanDisplayName = () => {
    // Utiliser le nom de l'artisan directement
    if (artisan.name && artisan.name.trim()) {
      return artisan.name.trim();
    }

    // Fallback avec email (première partie) si pas de nom
    if (artisan.email) {
      return artisan.email.split("@")[0];
    }

    // Dernier recours
    return "Artisan";
  };

  // Séparer le nom en prénom et nom de famille pour compatibilité
  const [firstName = "", ...lastNameParts] = artisan.name?.split(" ") || [];
  const lastName = lastNameParts.join(" ");

  return {
    id: supabaseCreation.id,
    title: supabaseCreation.title,
    description: supabaseCreation.description,
    price: supabaseCreation.price,
    imageUrl: supabaseCreation.image_url,
    category: supabaseCreation.category_id || CreationCategory.OTHER,
    artisanId: supabaseCreation.artisan_id,
    materials: supabaseCreation.materials || [],
    isAvailable: supabaseCreation.is_available,
    rating: supabaseCreation.rating,
    reviewCount: supabaseCreation.review_count,
    createdAt: supabaseCreation.created_at,
    updatedAt: supabaseCreation.updated_at,
    tags: supabaseCreation.tags || [],
    artisan: {
      id: artisan.id,
      username: artisan.email?.split("@")[0], // Généré à partir de l'email
      firstName: firstName,
      lastName: lastName,
      profileImage: artisan.profile_image_url,
      displayName: getArtisanDisplayName(),
      artisanProfile: {
        businessName: artisan.name, // Le nom peut servir de nom de commerce
        location: artisan.location,
        verified: artisan.is_verified,
        rating: supabaseCreation.rating, // Utiliser la note de la création
      },
    },
  };
};

// =============================================
// SERVICE API POUR LES CRÉATIONS
// =============================================

export class CreationsApi {
  /**
   * Récupère toutes les créations disponibles avec informations artisan
   */
  static async getAllCreations(): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations_full")
        .select(
          `
            *,
            artisans:artisan_id (
              id,
              name,
              location,
              profile_image_url,
              bio,
              email,
              phone,
              is_verified,
              joined_at,
              updated_at
            )
          `
        )
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Recherche des créations par terme de recherche
   */
  static async searchCreations(
    searchQuery: string,
    category?: CreationCategory | "all"
  ): Promise<CreationWithArtisan[]> {
    try {
      let query = supabase
        .from("creations_full")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `
        )
        .eq("is_available", true);

      // Filtre par catégorie si spécifié et différent de 'all'
      if (category && category !== "all") {
        query = query.eq("category_id", category);
      }

      // Filtre par terme de recherche si fourni
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Filtre les créations par catégorie
   */
  static async getCreationsByCategory(
    category: CreationCategory
  ): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `
        )
        .eq("is_available", true)
        .eq("category_id", category);

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Récupère les créations les mieux notées
   */
  static async getTopRatedCreations(
    limit: number = 10
  ): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `
        )
        .eq("is_available", true)
        .gte("review_count", 5) // Minimum 5 avis
        .order("rating", { ascending: false })
        .order("review_count", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Récupère les créations récentes
   */
  static async getRecentCreations(
    limit: number = 20
  ): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `
        )
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Recherche par matériaux
   */
  static async getCreationsByMaterial(
    material: string
  ): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `
        )
        .eq("is_available", true)
        .contains("materials", [material])
        .order("rating", { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Recherche par tags
   */
  static async getCreationsByTag(tag: string): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `
        )
        .eq("is_available", true)
        .contains("tags", [tag])
        .order("rating", { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Récupère les catégories avec le nombre de créations
   */
  static async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(
          `
          id,
          label,
          creations!inner(count)
        `
        )
        .eq("creations.is_available", true);

      if (error) {
        throw error;
      }

      // Transformation manuelle pour le comptage
      return (
        data?.map((cat) => ({
          id: cat.id,
          label: cat.label,
          creation_count: Array.isArray(cat.creations)
            ? cat.creations.length
            : 0,
        })) || []
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Recherche textuelle avancée avec PostgreSQL
   */
  static async advancedTextSearch(
    searchQuery: string
  ): Promise<CreationWithArtisan[]> {
    try {
      // Utilise la recherche textuelle PostgreSQL pour de meilleurs résultats
      const { data, error } = await supabase.rpc("search_creations_fulltext", {
        search_term: searchQuery,
      });

      if (error) {
        // Fallback vers la recherche simple
        return this.searchCreations(searchQuery);
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      // Fallback vers la recherche simple
      return this.searchCreations(searchQuery);
    }
  }

  /**
   * Récupération avec pagination
   */
  static async getCreationsWithPagination(
    page: number = 0,
    pageSize: number = 20,
    category?: CreationCategory | "all",
    searchQuery?: string
  ): Promise<{
    creations: CreationWithArtisan[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      let query = supabase
        .from("creations_full")
        .select(
          `
          *,
          artisans:artisan_id (
            id,
            name,
            location,
            profile_image_url,
            bio,
            email,
            phone,
            is_verified,
            joined_at,
            updated_at
          )
        `,
          { count: "exact" }
        )
        .eq("is_available", true);

      // Filtre par catégorie
      if (category && category !== "all") {
        query = query.eq("category_id", category);
      }

      // Filtre par recherche
      if (searchQuery?.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        throw error;
      }

      const creations = data?.map(transformSupabaseCreationWithUser) || [];
      const totalCount = count || 0;
      const hasMore = (page + 1) * pageSize < totalCount;

      return {
        creations,
        totalCount,
        hasMore,
      };
    } catch (error) {
      return {
        creations: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Ajouter une création aux favoris
   */
  static async addToFavorites(creationId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { error } = await supabase.from("user_favorites").insert({
        user_id: user.id,
        creation_id: creationId,
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retirer une création des favoris
   */
  static async removeFromFavorites(creationId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("creation_id", creationId);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Vérifier si une création est en favoris
   */
  static async isFavorite(creationId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("creation_id", creationId)
        .single();

      if (error && error.code !== "PGRST116") {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupérer les favoris de l'utilisateur connecté
   */
  static async getUserFavorites(): Promise<CreationWithArtisan[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_favorites")
        .select(
          `
          creation_id,
          creations:creation_id (
            *,
            artisans:artisan_id (
              id,
              name,
              location,
              profile_image_url,
              bio,
              email,
              phone,
              is_verified,
              joined_at,
              updated_at
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return [];
      }

      return (
        data
          ?.map((fav: any) => transformSupabaseCreationWithUser(fav.creations))
          .filter(Boolean) || []
      );
    } catch (error) {
      return [];
    }
  }
}

// =============================================
// HOOKS PERSONNALISÉS POUR REACT
// =============================================

/**
 * Hook pour gérer les favoris
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<CreationWithArtisan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CreationsApi.getUserFavorites();
      setFavorites(data);
    } catch (err) {
      setError("Erreur lors du chargement des favoris");
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (creationId: string) => {
    try {
      const success = await CreationsApi.addToFavorites(creationId);
      if (success) {
        await loadFavorites(); // Recharger les favoris
      }
      return success;
    } catch (err) {
      setError("Erreur lors de l'ajout aux favoris");
      return false;
    }
  };

  const removeFromFavorites = async (creationId: string) => {
    try {
      const success = await CreationsApi.removeFromFavorites(creationId);
      if (success) {
        await loadFavorites(); // Recharger les favoris
      }
      return success;
    } catch (err) {
      setError("Erreur lors de la suppression des favoris");
      return false;
    }
  };

  const toggleFavorite = async (creationId: string) => {
    const isFav = await CreationsApi.isFavorite(creationId);
    if (isFav) {
      return await removeFromFavorites(creationId);
    } else {
      return await addToFavorites(creationId);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refetch: loadFavorites,
  };
};

// =============================================
// FONCTION POUR CRÉER LA FONCTION POSTGRESQL
// =============================================

/*
Pour utiliser la recherche textuelle avancée, ajoutez cette fonction à votre base Supabase :

CREATE OR REPLACE FUNCTION search_creations_fulltext(search_term text)
RETURNS TABLE(LIKE creations_full) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM creations_full c
  WHERE c.is_available = true
    AND (
      to_tsvector('french', c.title) @@ plainto_tsquery('french', search_term)
      OR to_tsvector('french', c.description) @@ plainto_tsquery('french', search_term)
      OR search_term ILIKE ANY(c.materials)
      OR search_term ILIKE ANY(c.tags)
    )
  ORDER BY 
    ts_rank(to_tsvector('french', c.title || ' ' || c.description), plainto_tsquery('french', search_term)) DESC,
    c.rating DESC;
END;
$$ LANGUAGE plpgsql;
*/
