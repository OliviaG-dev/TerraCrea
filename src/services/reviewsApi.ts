import { supabase } from "./supabase";

export interface UserReview {
  id: string;
  userId: string;
  creationId: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  userNickname?: string; // Ajout du surnom de l'utilisateur
}

export class ReviewsApi {
  // Récupérer l'avis d'un utilisateur pour une création
  static async getUserReview(creationId: string): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Essayer d'abord avec une requête simple
      try {
        const { data, error } = await supabase
          .from("user_reviews")
          .select("comment")
          .eq("user_id", user.id)
          .eq("creation_id", creationId)
          .maybeSingle();

        if (error) {
          if (error.code === "PGRST116") {
            // Aucun avis trouvé, c'est normal
            return null;
          }
          return null;
        }

        return data?.comment || null;
      } catch (queryError) {
        // Fallback : essayer avec une requête encore plus simple
        try {
          const { data, error } = await supabase
            .from("user_reviews")
            .select("*")
            .eq("user_id", user.id)
            .eq("creation_id", creationId)
            .limit(1);

          if (error) {
            return null;
          }

          return data && data.length > 0 ? data[0].comment : null;
        } catch (fallbackError) {
          return null;
        }
      }
    } catch (error) {
      return null;
    }
  }

  // Sauvegarder ou mettre à jour l'avis d'un utilisateur
  static async saveUserReview(
    creationId: string,
    comment: string
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
        throw new Error("Vous ne pouvez pas commenter vos propres créations");
      }

      // Vérifier si un avis existe déjà
      const { data: existingReview } = await supabase
        .from("user_reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("creation_id", creationId)
        .single();

      if (existingReview) {
        // Mettre à jour l'avis existant
        const { error } = await supabase
          .from("user_reviews")
          .update({
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (error) throw error;
      } else {
        // Créer un nouvel avis
        const { error } = await supabase.from("user_reviews").insert({
          user_id: user.id,
          creation_id: creationId,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Récupérer tous les avis d'une création avec le surnom de l'utilisateur
  static async getCreationReviews(creationId: string): Promise<UserReview[]> {
    try {
      // Essayer d'abord avec une requête simple
      let reviews: any[] = [];
      let reviewsError: any = null;

      try {
        const { data, error } = await supabase
          .from("user_reviews")
          .select("*")
          .eq("creation_id", creationId)
          .order("created_at", { ascending: false });

        reviews = data || [];
        reviewsError = error;
      } catch (queryError) {
        // Fallback : essayer avec une requête encore plus basique
        try {
          const { data, error } = await supabase
            .from("user_reviews")
            .select("id, user_id, creation_id, comment, created_at, updated_at")
            .eq("creation_id", creationId);

          reviews = data || [];
          reviewsError = error;
        } catch (fallbackError) {
          return [];
        }
      }

      if (reviewsError) {
        return [];
      }

      if (!reviews || reviews.length === 0) {
        return [];
      }

      try {
        // Récupérer les usernames pour tous les utilisateurs qui ont laissé des avis
        const userIds = reviews.map((review) => review.user_id);

        if (userIds.length === 0) {
          return reviews.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            creationId: item.creation_id,
            comment: item.comment,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            userNickname: `Utilisateur ${item.user_id.slice(0, 8)}...`,
          }));
        }

        // Essayer de récupérer les usernames
        let users: any[] = [];
        try {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, username")
            .in("id", userIds);

          if (usersError) {
            // Continuer sans les usernames
          } else {
            users = usersData || [];
          }
        } catch (usersQueryError) {
          // Continuer sans les usernames
        }

        // Créer un map des usernames par userId
        const usernameMap = new Map();
        if (users) {
          users.forEach((user) => {
            usernameMap.set(user.id, user.username);
          });
        }

        // Mapper les données snake_case vers camelCase pour correspondre à l'interface UserReview
        return reviews.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          creationId: item.creation_id,
          comment: item.comment,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          userNickname:
            usernameMap.get(item.user_id) ||
            `Utilisateur ${item.user_id.slice(0, 8)}...`,
        }));
      } catch (innerError) {
        // En cas d'erreur avec les usernames, retourner les avis sans les noms
        return reviews.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          creationId: item.creation_id,
          comment: item.comment,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          userNickname: `Utilisateur ${item.user_id.slice(0, 8)}...`,
        }));
      }
    } catch (error) {
      return [];
    }
  }

  // Supprimer un avis (seulement pour l'utilisateur qui l'a créé)
  static async deleteUserReview(creationId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("user_reviews")
        .delete()
        .eq("user_id", user.id)
        .eq("creation_id", creationId);

      if (error) throw error;

      return true;
    } catch (error) {
      return false;
    }
  }
}
