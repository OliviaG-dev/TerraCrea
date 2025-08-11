import { supabase } from "./supabase";

export interface UserRating {
  id: string;
  userId: string;
  creationId: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
}

export class RatingsApi {
  // Récupérer la notation d'un utilisateur pour une création
  static async getUserRating(creationId: string): Promise<number | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("creation_id", creationId)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          // Aucune notation trouvée, c'est normal
          return null;
        }
        return null;
      }

      return data?.rating || null;
    } catch (error) {
      return null;
    }
  }

  // Sauvegarder ou mettre à jour la notation d'un utilisateur
  static async saveUserRating(
    creationId: string,
    rating: number
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Vérifier si l'utilisateur est le créateur de la création
      const { data: creation } = await supabase
        .from("creations")
        .select("artisan_id")
        .eq("id", creationId)
        .single();

      if (creation?.artisan_id === user.id) {
        throw new Error("Vous ne pouvez pas noter vos propres créations");
      }

      // Vérifier si une notation existe déjà
      const { data: existingRating } = await supabase
        .from("user_ratings")
        .select("id")
        .eq("user_id", user.id)
        .eq("creation_id", creationId)
        .single();

      if (existingRating) {
        // Mettre à jour la notation existante
        const { error } = await supabase
          .from("user_ratings")
          .update({
            rating,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRating.id);

        if (error) throw error;
      } else {
        // Créer une nouvelle notation
        const { error } = await supabase.from("user_ratings").insert({
          user_id: user.id,
          creation_id: creationId,
          rating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      // Mettre à jour la note moyenne de la création
      await this.updateCreationAverageRating(creationId);

      return true;
    } catch (error) {
      return false;
    }
  }

  // Mettre à jour la note moyenne d'une création
  private static async updateCreationAverageRating(
    creationId: string
  ): Promise<void> {
    try {
      const { data: ratings } = await supabase
        .from("user_ratings")
        .select("rating")
        .eq("creation_id", creationId);

      if (ratings && ratings.length > 0) {
        const averageRating =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        const reviewCount = ratings.length;

        // Mettre à jour la création avec la nouvelle note moyenne
        await supabase
          .from("creations")
          .update({
            rating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
            review_count: reviewCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", creationId);
      }
    } catch (error) {
      // Erreur silencieuse pour la mise à jour de la note moyenne
    }
  }

  // Récupérer toutes les notations d'une création
  static async getCreationRatings(creationId: string): Promise<UserRating[]> {
    try {
      const { data, error } = await supabase
        .from("user_ratings")
        .select(
          `
          id,
          user_id,
          creation_id,
          rating,
          created_at,
          updated_at
        `
        )
        .eq("creation_id", creationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mapper les données snake_case vers camelCase pour correspondre à l'interface UserRating
      return (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        creationId: item.creation_id,
        rating: item.rating,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      return [];
    }
  }
}
