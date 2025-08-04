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
  category_label: string; // Label de la catégorie depuis la jointure
  // Données artisan depuis la jointure avec la table artisans
  artisan_name?: string;
  artisan_location?: string;
  artisan_profile_image_url?: string;
  artisan_bio?: string;
  artisan_email?: string;
  artisan_phone?: string;
  artisan_is_verified?: boolean;
  artisan_joined_at?: string;
  artisan_updated_at?: string;
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
  // Créer le nom d'affichage de l'artisan avec les données de la table artisans
  const getArtisanDisplayName = () => {
    // Utiliser le nom de l'artisan directement
    if (supabaseCreation.artisan_name && supabaseCreation.artisan_name.trim()) {
      return supabaseCreation.artisan_name.trim();
    }

    // Fallback avec email (première partie) si pas de nom
    if (supabaseCreation.artisan_email) {
      return supabaseCreation.artisan_email.split("@")[0];
    }

    // Dernier recours
    return "Artisan";
  };

  // Séparer le nom en prénom et nom de famille pour compatibilité
  const [firstName = "", ...lastNameParts] =
    supabaseCreation.artisan_name?.split(" ") || [];
  const lastName = lastNameParts.join(" ");

  return {
    id: supabaseCreation.id,
    title: supabaseCreation.title,
    description: supabaseCreation.description,
    price: supabaseCreation.price,
    imageUrl: supabaseCreation.image_url,
    category: supabaseCreation.category_id || CreationCategory.OTHER,
    categoryLabel: supabaseCreation.category_label || "Autre",
    artisanId: supabaseCreation.artisan_id,
    materials: supabaseCreation.materials || [],
    isAvailable: supabaseCreation.is_available,
    rating: supabaseCreation.rating,
    reviewCount: supabaseCreation.review_count,
    createdAt: supabaseCreation.created_at,
    updatedAt: supabaseCreation.updated_at,
    tags: supabaseCreation.tags || [],
    artisan: {
      id: supabaseCreation.artisan_id,
      username: supabaseCreation.artisan_email?.split("@")[0], // Généré à partir de l'email
      firstName: firstName,
      lastName: lastName,
      profileImage: supabaseCreation.artisan_profile_image_url,
      displayName: getArtisanDisplayName(),
      artisanProfile: {
        businessName: supabaseCreation.artisan_name, // Le nom peut servir de nom de commerce
        location: supabaseCreation.artisan_location,
        verified: supabaseCreation.artisan_is_verified || false,
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
        .select("*")
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
      let query = supabase.from("creations_full").select("*");

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
        .from("creations_full")
        .select("*")
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
        .from("creations_full")
        .select("*")
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
        .from("creations_full")
        .select("*")
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
        .from("creations_full")
        .select("*")
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
        .from("creations_full")
        .select("*")
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
   * Récupère toutes les catégories disponibles
   */
  static async getAllCategories(): Promise<{ id: string; label: string }[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, label")
        .order("label");

      if (error) {
        throw error;
      }

      return data || [];
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
        .select("*", { count: "exact" });

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
          creations:creation_id (*)
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

  /**
   * Récupérer les créations d'un artisan spécifique
   */
  static async getUserCreations(
    artisanId: string
  ): Promise<CreationWithArtisan[]> {
    try {
      const { data, error } = await supabase
        .from("creations_full")
        .select("*")
        .eq("artisan_id", artisanId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(transformSupabaseCreationWithUser) || [];
    } catch (error) {
      throw new Error("Erreur lors de la récupération des créations");
    }
  }

  /**
   * Créer une nouvelle création
   */
  static async createCreation(creationData: {
    title: string;
    description: string;
    price: number;
    category: CreationCategory;
    materials: string[];
    tags: string[];
    artisanId: string;
    imageUrl?: string;
  }): Promise<CreationWithArtisan> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Vérifier que l'utilisateur est bien l'artisan
      if (user.id !== creationData.artisanId) {
        throw new Error(
          "Vous ne pouvez créer des créations que pour votre propre compte"
        );
      }

      const { data, error } = await supabase
        .from("creations")
        .insert({
          title: creationData.title,
          description: creationData.description,
          price: creationData.price,
          category_id: creationData.category,
          artisan_id: creationData.artisanId,
          materials: creationData.materials,
          tags: creationData.tags,
          image_url: creationData.imageUrl || null,
          is_available: true,
          rating: 0,
          review_count: 0,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Erreur insertion création:", error);
        throw error;
      }

      // Récupérer la création complète avec les données artisan
      const { data: fullCreation, error: fetchError } = await supabase
        .from("creations_full")
        .select("*")
        .eq("id", data.id)
        .single();

      if (fetchError) {
        console.error("Erreur récupération création complète:", fetchError);
        throw fetchError;
      }

      return transformSupabaseCreationWithUser(fullCreation);
    } catch (error) {
      console.error("Erreur complète création:", error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Erreur lors de la création");
      }
    }
  }

  /**
   * Test de diagnostic pour vérifier les permissions
   */
  static async testPermissions(): Promise<{
    user: any;
    artisan: any;
    categories: any[];
    canCreate: boolean;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Vérifier le profil artisan
      const { data: artisan, error: artisanError } = await supabase
        .from("artisans")
        .select("*")
        .eq("id", user.id)
        .single();

      // Vérifier les catégories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*");

      // Test d'insertion simple
      const { data: testInsert, error: insertError } = await supabase
        .from("creations")
        .insert({
          title: "Test diagnostic",
          description: "Test",
          price: 10,
          category_id: "CERAMICS",
          artisan_id: user.id,
          materials: ["test"],
          tags: ["test"],
          is_available: true,
          rating: 0,
          review_count: 0,
        })
        .select("id")
        .single();

      // Supprimer le test
      if (testInsert) {
        await supabase.from("creations").delete().eq("id", testInsert.id);
      }

      return {
        user: { id: user.id, email: user.email },
        artisan: artisan || null,
        categories: categories || [],
        canCreate: !insertError,
      };
    } catch (error) {
      console.error("Erreur test permissions:", error);
      return {
        user: null,
        artisan: null,
        categories: [],
        canCreate: false,
      };
    }
  }

  /**
   * Mettre à jour une création existante
   */
  static async updateCreation(
    creationId: string,
    updateData: {
      title?: string;
      description?: string;
      price?: number;
      category?: CreationCategory;
      materials?: string[];
      tags?: string[];
      imageUrl?: string;
      isAvailable?: boolean;
    }
  ): Promise<CreationWithArtisan> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Vérifier que l'utilisateur est propriétaire de la création
      const { data: existingCreation, error: fetchError } = await supabase
        .from("creations")
        .select("artisan_id")
        .eq("id", creationId)
        .single();

      if (fetchError || !existingCreation) {
        throw new Error("Création non trouvée");
      }

      if (existingCreation.artisan_id !== user.id) {
        throw new Error("Vous ne pouvez modifier que vos propres créations");
      }

      const { data, error } = await supabase
        .from("creations")
        .update({
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description && {
            description: updateData.description,
          }),
          ...(updateData.price && { price: updateData.price }),
          ...(updateData.category && { category_id: updateData.category }),
          ...(updateData.materials && { materials: updateData.materials }),
          ...(updateData.tags && { tags: updateData.tags }),
          ...(updateData.imageUrl && { image_url: updateData.imageUrl }),
          ...(typeof updateData.isAvailable === "boolean" && {
            is_available: updateData.isAvailable,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", creationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Récupérer la création complète avec les données artisan
      const { data: fullCreation, error: fetchFullError } = await supabase
        .from("creations_full")
        .select("*")
        .eq("id", creationId)
        .single();

      if (fetchFullError) {
        throw fetchFullError;
      }

      return transformSupabaseCreationWithUser(fullCreation);
    } catch (error) {
      throw new Error("Erreur lors de la mise à jour");
    }
  }

  /**
   * Supprimer une création
   */
  static async deleteCreation(creationId: string): Promise<boolean> {
    try {
      console.log("🔄 deleteCreation appelé avec ID:", creationId);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Utilisateur non connecté");
        throw new Error("Utilisateur non connecté");
      }

      console.log("✅ Utilisateur connecté:", user.id);

      // Vérifier que l'utilisateur est propriétaire de la création
      console.log("🔄 Vérification de la propriété de la création...");
      const { data: existingCreation, error: fetchError } = await supabase
        .from("creations")
        .select("artisan_id, image_url")
        .eq("id", creationId)
        .single();

      if (fetchError || !existingCreation) {
        console.error("❌ Création non trouvée:", fetchError);
        throw new Error("Création non trouvée");
      }

      console.log("✅ Création trouvée:", existingCreation);
      console.log(
        "🔄 Comparaison artisan_id:",
        existingCreation.artisan_id,
        "vs user.id:",
        user.id
      );

      if (existingCreation.artisan_id !== user.id) {
        console.error("❌ L'utilisateur n'est pas propriétaire de la création");
        throw new Error("Vous ne pouvez supprimer que vos propres créations");
      }

      console.log("✅ L'utilisateur est propriétaire de la création");

      // Supprimer l'image si elle existe
      if (existingCreation.image_url) {
        try {
          const imagePath = existingCreation.image_url.split("/").pop();
          if (imagePath) {
            await supabase.storage.from("creation-images").remove([imagePath]);
          }
        } catch (storageError) {
          console.warn(
            "Erreur lors de la suppression de l'image:",
            storageError
          );
        }
      }

      console.log("🔄 Suppression de la création de la base de données...");
      const { error } = await supabase
        .from("creations")
        .delete()
        .eq("id", creationId);

      if (error) {
        console.error("❌ Erreur lors de la suppression:", error);
        throw error;
      }

      console.log("✅ Création supprimée avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur générale dans deleteCreation:", error);
      throw new Error(
        `Erreur lors de la suppression: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  }

  /**
   * Uploader une image pour une création
   */
  static async uploadCreationImage(
    file: File | Blob | string,
    fileName: string
  ): Promise<string> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const uniqueFileName = `${user.id}_${timestamp}_${fileName}`;

      let fileToUpload: File | Blob;

      // Si c'est une URI string (React Native), la convertir en Blob
      if (typeof file === "string") {
        const response = await fetch(file);
        fileToUpload = await response.blob();
      } else {
        fileToUpload = file;
      }

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from("creation-images")
        .upload(uniqueFileName, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("creation-images")
        .getPublicUrl(uniqueFileName);

      // Vérifier que l'URL est valide
      if (!urlData.publicUrl) {
        throw new Error("Impossible de générer l'URL publique de l'image");
      }

      // Attendre un peu pour s'assurer que l'image est disponible
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return urlData.publicUrl;
    } catch (error) {
      throw new Error("Erreur lors de l'upload de l'image");
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
