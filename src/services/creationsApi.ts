import { supabase } from "./supabase";
import {
  CreationCategory,
  CreationWithArtisan,
  CATEGORY_LABELS,
} from "../types/Creation";

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
  tags: string[]; // Tags existants de la table creations
  creation_tags: string[]; // Nouveaux tags depuis la table creation_tags
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
  artisan_established_year?: number;
  artisan_specialties?: string[];
  artisan_total_sales?: number;
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
    tags: (() => {
      // Fonction pour nettoyer et valider les tags
      const cleanTags = (tagArray: any[] | null | undefined): string[] => {
        if (!tagArray || !Array.isArray(tagArray)) {
          return [];
        }

        // Version plus robuste qui gère différents types
        const validTags: string[] = [];

        for (let i = 0; i < tagArray.length; i++) {
          const tag = tagArray[i];

          // Convertir en string si ce n'est pas déjà le cas
          let tagString: string;
          if (typeof tag === "string") {
            tagString = tag;
          } else if (tag && typeof tag === "object" && tag.toString) {
            tagString = tag.toString();
          } else if (tag !== null && tag !== undefined) {
            tagString = String(tag);
          } else {
            continue;
          }

          // Nettoyer et valider
          const trimmedTag = tagString.trim();
          if (trimmedTag.length > 0) {
            validTags.push(trimmedTag);
          }
        }

        return validTags;
      };

      // Priorité: creation_tags, puis tags, puis tableau vide
      let tags: string[] = [];

      if (
        supabaseCreation.creation_tags &&
        Array.isArray(supabaseCreation.creation_tags)
      ) {
        tags = cleanTags(supabaseCreation.creation_tags);
      }

      if (
        tags.length === 0 &&
        supabaseCreation.tags &&
        Array.isArray(supabaseCreation.tags)
      ) {
        tags = cleanTags(supabaseCreation.tags);
      }

      return tags;
    })(),
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
        joinedAt: supabaseCreation.artisan_joined_at,
        updatedAt: supabaseCreation.artisan_updated_at,
        description: supabaseCreation.artisan_bio,
        establishedYear: supabaseCreation.artisan_established_year,
        specialties: supabaseCreation.artisan_specialties || [],
        totalSales: supabaseCreation.artisan_total_sales || 0,
        email: supabaseCreation.artisan_email,
        phone: supabaseCreation.artisan_phone,
      },
    },
  };
};

// =============================================
// SERVICE API POUR LES CRÉATIONS
// =============================================

export class CreationsApi {
  static deleteCreation = async (creationId: string): Promise<boolean> => {
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
        .select("artisan_id, image_url")
        .eq("id", creationId)
        .single();

      if (fetchError || !existingCreation) {
        throw new Error("Création non trouvée");
      }

      if (existingCreation.artisan_id !== user.id) {
        throw new Error("Vous ne pouvez supprimer que vos propres créations");
      }

      // Supprimer l'image si elle existe
      if (existingCreation.image_url) {
        try {
          const imagePath = existingCreation.image_url.split("/").pop();
          if (imagePath) {
            await supabase.storage.from("creation-images").remove([imagePath]);
          }
        } catch (storageError) {
          // Erreur silencieuse lors de la suppression de l'image
        }
      }

      const { error } = await supabase
        .from("creations")
        .delete()
        .eq("id", creationId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw new Error(
        `Erreur lors de la suppression: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  };

  static uploadCreationImage = async (
    file: File | Blob | string,
    fileName: string
  ): Promise<string> => {
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
  };

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
        // Utiliser category_label au lieu de category_id car les valeurs de CreationCategory correspondent aux labels
        const categoryLabel = CATEGORY_LABELS[category as CreationCategory];
        if (categoryLabel) {
          query = query.eq("category_label", categoryLabel);
        }
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
   * Récupère tous les créateurs disponibles
   */
  static async getAllCreators(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("creations_full")
        .select(
          "artisan_id, artisan_name, artisan_location, artisan_profile_image_url, artisan_bio, artisan_is_verified, artisan_joined_at, artisan_established_year, artisan_specialties, artisan_total_sales, rating"
        )
        .not("artisan_id", "is", null)
        .order("rating", { ascending: false });

      if (error) {
        throw error;
      }

      // Grouper par artisan et calculer les statistiques
      const artisansMap = new Map();

      data?.forEach((item) => {
        if (!artisansMap.has(item.artisan_id)) {
          artisansMap.set(item.artisan_id, {
            id: item.artisan_id,
            displayName: item.artisan_name || "Artisan",
            profileImage: item.artisan_profile_image_url,
            artisanProfile: {
              businessName: item.artisan_name,
              location: item.artisan_location,
              verified: item.artisan_is_verified || false,
              rating: item.rating || 0,
              joinedAt: item.artisan_joined_at,
              description: item.artisan_bio,
              establishedYear: item.artisan_established_year,
              specialties: item.artisan_specialties || [],
              totalSales: item.artisan_total_sales || 0,
            },
            creationCount: 1,
            totalRating: item.rating || 0,
          });
        } else {
          const existing = artisansMap.get(item.artisan_id);
          existing.creationCount += 1;
          existing.totalRating += item.rating || 0;
          existing.artisanProfile.rating =
            existing.totalRating / existing.creationCount;
        }
      });

      return Array.from(artisansMap.values());
    } catch (error) {
      return [];
    }
  }

  /**
   * Recherche des créateurs par terme de recherche
   */
  static async searchCreators(searchQuery: string): Promise<any[]> {
    try {
      let query = supabase
        .from("creations_full")
        .select(
          "artisan_id, artisan_name, artisan_location, artisan_profile_image_url, artisan_bio, artisan_is_verified, artisan_joined_at, artisan_established_year, artisan_specialties, artisan_total_sales, rating"
        )
        .not("artisan_id", "is", null);

      // Filtre par terme de recherche si fourni
      if (searchQuery.trim()) {
        query = query.or(
          `artisan_name.ilike.%${searchQuery}%,artisan_bio.ilike.%${searchQuery}%,artisan_specialties.cs.{${searchQuery}}`
        );
      }

      const { data, error } = await query.order("rating", { ascending: false });

      if (error) {
        throw error;
      }

      // Grouper par artisan et calculer les statistiques
      const artisansMap = new Map();

      data?.forEach((item) => {
        if (!artisansMap.has(item.artisan_id)) {
          artisansMap.set(item.artisan_id, {
            id: item.artisan_id,
            displayName: item.artisan_name || "Artisan",
            profileImage: item.artisan_profile_image_url,
            artisanProfile: {
              businessName: item.artisan_name,
              location: item.artisan_location,
              verified: item.artisan_is_verified || false,
              rating: item.rating || 0,
              joinedAt: item.artisan_joined_at,
              description: item.artisan_bio,
              establishedYear: item.artisan_established_year,
              specialties: item.artisan_specialties || [],
              totalSales: item.artisan_total_sales || 0,
            },
            creationCount: 1,
            totalRating: item.rating || 0,
          });
        } else {
          const existing = artisansMap.get(item.artisan_id);
          existing.creationCount += 1;
          existing.totalRating += item.rating || 0;
          existing.artisanProfile.rating =
            existing.totalRating / existing.creationCount;
        }
      });

      return Array.from(artisansMap.values());
    } catch (error) {
      return [];
    }
  }

  /**
   * Recherche par ville - retourne les statistiques et les créations
   */
  static async searchByCity(cityQuery: string): Promise<{
    cityStats: { city: string; creatorCount: number; creationCount: number };
    creations: CreationWithArtisan[];
  }> {
    try {
      if (!cityQuery.trim()) {
        return {
          cityStats: { city: "", creatorCount: 0, creationCount: 0 },
          creations: [],
        };
      }

      const { data, error } = await supabase
        .from("creations_full")
        .select("*")
        .ilike("artisan_location", `%${cityQuery}%`)
        .not("artisan_id", "is", null);

      if (error) {
        throw error;
      }

      // Calculer les statistiques de la ville
      const creators = new Set();
      let creationCount = 0;

      data?.forEach((item) => {
        creators.add(item.artisan_id);
        creationCount++;
      });

      const cityStats = {
        city: cityQuery,
        creatorCount: creators.size,
        creationCount: creationCount,
      };

      // Transformer les données en CreationWithArtisan
      const creations = data?.map(transformSupabaseCreationWithUser) || [];

      return { cityStats, creations };
    } catch (error) {
      return {
        cityStats: { city: "", creatorCount: 0, creationCount: 0 },
        creations: [],
      };
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

      // Vérifier d'abord si la création existe
      const { data: creationExists } = await supabase
        .from("creations")
        .select("id")
        .eq("id", creationId)
        .single();

      if (!creationExists) {
        throw new Error("Création non trouvée");
      }

      // Vérifier si déjà en favoris
      const isAlreadyFavorite = await this.isFavorite(creationId);
      if (isAlreadyFavorite) {
        return true; // Déjà en favoris
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

      // Vérifier si en favoris avant de supprimer
      const isFavorite = await this.isFavorite(creationId);
      if (!isFavorite) {
        return true; // Pas en favoris, considérer comme succès
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

      // Vérifier d'abord si la création existe
      const { data: creationExists } = await supabase
        .from("creations")
        .select("id")
        .eq("id", creationId)
        .single();

      if (!creationExists) {
        return false;
      }

      const { data, error } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("creation_id", creationId)
        .maybeSingle();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  static async toggleFavorite(creationId: string): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(creationId);
      if (isFav) {
        return await this.removeFromFavorites(creationId);
      } else {
        return await this.addToFavorites(creationId);
      }
    } catch (error) {
      throw new Error("Erreur lors de la modification des favoris");
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

      // Vérifier que l'utilisateur existe dans la table artisans
      const { data: artisan, error: artisanError } = await supabase
        .from("artisans")
        .select("*")
        .eq("id", user.id)
        .single();

      if (artisanError || !artisan) {
        throw new Error("Vous devez être artisan pour créer une création");
      }

      // Insérer d'abord la création
      const { data: creationResult, error: creationError } = await supabase
        .from("creations")
        .insert({
          title: creationData.title,
          description: creationData.description,
          price: creationData.price,
          category_id: creationData.category,
          artisan_id: creationData.artisanId,
          materials: creationData.materials,
          tags: creationData.tags, // Ajouter les tags ici !
          ...(creationData.imageUrl && { image_url: creationData.imageUrl }), // N'inclure que si imageUrl existe
          is_available: true,
          rating: 0,
          review_count: 0,
        })
        .select("id")
        .single();

      if (creationError) {
        throw creationError;
      }

      // Les tags sont déjà inclus dans creationData.tags
      // Pas besoin d'insertion séparée dans creation_tags

      // Récupérer la création complète avec les données artisan
      const { data: fullCreation, error: fetchError } = await supabase
        .from("creations_full")
        .select("*")
        .eq("id", creationResult.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return transformSupabaseCreationWithUser(fullCreation);
    } catch (error) {
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
    favoritesTest: any;
    tagsTest: any;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Test des permissions artisan
      const { data: artisan, error: artisanError } = await supabase
        .from("artisans")
        .select("*")
        .eq("id", user.id)
        .single();

      // Test des catégories
      const { data: categories, error: categoriesError } = await supabase
        .from("creation_categories")
        .select("*")
        .order("label");

      // Test des favoris
      const { data: favoritesTest, error: favoritesError } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      // Test des tags - utiliser directement le champ tags des créations
      const { data: tagsTest, error: tagsError } = await supabase
        .from("creations")
        .select("id, tags")
        .not("tags", "is", null)
        .limit(5);

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        artisan: artisan || null,
        categories: categories || [],
        canCreate: !artisanError && artisan,
        favoritesTest: favoritesError ? null : favoritesTest,
        tagsTest: tagsError ? null : tagsTest,
      };
    } catch (error) {
      throw error;
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

      // Mettre à jour la création directement
      const updateFields: any = {};
      if (updateData.title !== undefined) updateFields.title = updateData.title;
      if (updateData.description !== undefined)
        updateFields.description = updateData.description;
      if (updateData.price !== undefined) updateFields.price = updateData.price;
      if (updateData.category !== undefined)
        updateFields.category_id = updateData.category;
      if (updateData.materials !== undefined)
        updateFields.materials = updateData.materials;
      if (updateData.imageUrl !== undefined)
        updateFields.image_url = updateData.imageUrl;
      if (updateData.isAvailable !== undefined)
        updateFields.is_available = updateData.isAvailable;

      const { error: updateError } = await supabase
        .from("creations")
        .update(updateFields)
        .eq("id", creationId);

      if (updateError) {
        throw new Error("Erreur lors de la mise à jour de la création");
      }

      // Mettre à jour les tags si fournis
      if (updateData.tags !== undefined) {
        // Mettre à jour directement le champ tags dans creations
        const { error: updateTagsError } = await supabase
          .from("creations")
          .update({ tags: updateData.tags })
          .eq("id", creationId);

        if (updateTagsError) {
          throw new Error("Erreur lors de la mise à jour des tags");
        }
      }

      // Récupérer la création mise à jour
      const { data: updatedCreation, error: fetchError2 } = await supabase
        .from("creations_full")
        .select("*")
        .eq("id", creationId)
        .single();

      if (fetchError2 || !updatedCreation) {
        throw new Error(
          "Erreur lors de la récupération de la création mise à jour"
        );
      }

      return transformSupabaseCreationWithUser(updatedCreation);
    } catch (error) {
      throw error;
    }
  }
}

// =============================================
// HOOKS PERSONNALISÉS POUR REACT
// =============================================

// Le hook useFavorites a été déplacé vers src/context/FavoritesContext.tsx
// pour permettre un partage global de l'état des favoris entre tous les composants

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
