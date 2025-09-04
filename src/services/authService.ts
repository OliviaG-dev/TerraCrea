import { supabase } from "./supabase";
import { isTimeSyncError, getTimeSyncHelpMessage } from "../utils/timeUtils";

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export class AuthService {
  // Inscription avec confirmation email
  static async signUpWithEmailConfirmation(signUpData: SignUpData) {
    const { email, password, firstName, lastName, username } = signUpData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.EXPO_PUBLIC_APP_URL || "http://localhost:8081"
        }/email-confirmed`,
        data: {
          username: username || email.split("@")[0],
          firstName: firstName || "",
          lastName: lastName || "",
          isBuyer: true,
          isArtisan: false,
        },
      },
    });

    return {
      data,
      error,
      needsConfirmation: !error && !data.user?.email_confirmed_at,
    };
  }

  // Renvoyer l'email de confirmation
  static async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    return { error };
  }

  // Vérifier le statut de confirmation
  static async checkEmailConfirmed() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email_confirmed_at ? true : false;
  }

  // Envoyer un email de réinitialisation de mot de passe
  static async resetPassword(email: string) {
    try {
      // Vérification des données avant envoi
      if (!email) {
        return {
          success: false,
          error: { message: "Email requis" },
        };
      }

      // Vérification du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: { message: "Format d'email invalide" },
        };
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${
            process.env.EXPO_PUBLIC_APP_URL || "http://localhost:19006"
          }/reset-password`,
        }
      );

      if (error) {
        let errorMessage =
          "Erreur lors de l'envoi de l'email de réinitialisation";

        if (error.message.includes("User not found")) {
          errorMessage = "Aucun compte trouvé avec cet email";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
        } else if (isTimeSyncError(error)) {
          errorMessage = getTimeSyncHelpMessage();
        } else {
          errorMessage = error.message;
        }

        return {
          success: false,
          error: { ...error, message: errorMessage },
        };
      }

      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: { message: "Erreur inattendue lors de l'envoi de l'email" },
      };
    }
  }

  // Mettre à jour le mot de passe (après réinitialisation)
  static async updatePassword(newPassword: string) {
    try {
      // Vérification des données avant envoi
      if (!newPassword) {
        return {
          success: false,
          error: { message: "Nouveau mot de passe requis" },
        };
      }

      // Vérification de la force du mot de passe
      if (newPassword.length < 6) {
        return {
          success: false,
          error: {
            message: "Le mot de passe doit contenir au moins 6 caractères",
          },
        };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        let errorMessage = "Erreur lors de la mise à jour du mot de passe";

        if (error.message.includes("Password should be at least")) {
          errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
        } else if (error.message.includes("Invalid password")) {
          errorMessage =
            "Le mot de passe ne respecte pas les critères de sécurité";
        } else if (
          error.message.includes(
            "New password should be different from the old password"
          )
        ) {
          errorMessage =
            "Le nouveau mot de passe ne peut pas être identique à l'ancien";
        } else {
          errorMessage = error.message;
        }

        return {
          success: false,
          error: { ...error, message: errorMessage },
        };
      }

      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Erreur inattendue lors de la mise à jour du mot de passe",
        },
      };
    }
  }

  // Fonction pour vérifier si un utilisateur existe
  static async checkUserExists(email: string) {
    try {
      // Tenter une récupération de mot de passe pour voir si l'utilisateur existe
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${
          process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000"
        }/reset-password`,
      });

      // Si pas d'erreur ou erreur "Email rate limit", l'utilisateur existe probablement
      return !error || !error.message.includes("User not found");
    } catch {
      return false;
    }
  }

  // Connexion simplifiée sans gestion complexe
  static async signInWithEmailPassword(email: string, password: string) {
    try {
      // Validation basique
      if (!email?.trim() || !password?.trim()) {
        return {
          data: { user: null, session: null },
          error: { message: "Email et mot de passe requis" },
          needsConfirmation: false,
        };
      }

      // Validation format email simple
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return {
          data: { user: null, session: null },
          error: { message: "Format d'email invalide" },
          needsConfirmation: false,
        };
      }

      // Connexion directe avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        // Gestion simplifiée des erreurs
        let errorMessage = "Erreur de connexion";

        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "Email ou mot de passe incorrect";
            break;
          case "Email not confirmed":
            errorMessage =
              "Veuillez confirmer votre email avant de vous connecter";
            break;
          case "Too Many Requests":
            errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
            break;
          default:
            if (error.message.includes("Invalid login credentials")) {
              errorMessage = "Email ou mot de passe incorrect";
            } else if (error.message.includes("User not found")) {
              errorMessage = "Aucun compte trouvé avec cet email";
            } else if (error.message.includes("Password")) {
              errorMessage = "Mot de passe incorrect";
            } else if (isTimeSyncError(error)) {
              errorMessage = getTimeSyncHelpMessage();
            } else {
              errorMessage = error.message;
            }
        }

        console.error("Erreur de connexion Supabase:", error);

        return {
          data: { user: null, session: null },
          error: { message: errorMessage, originalError: error },
          needsConfirmation: false,
        };
      }

      // Connexion réussie
      return {
        data,
        error: null,
        needsConfirmation: false,
      };
    } catch (error: any) {
      console.error("Erreur inattendue lors de la connexion:", error);

      let errorMessage = "Erreur inattendue lors de la connexion";

      if (error?.name === "NetworkError" || error?.code === "NETWORK_ERROR") {
        errorMessage =
          "Problème de connexion internet. Vérifiez votre connexion.";
      } else if (error?.message?.includes("fetch")) {
        errorMessage =
          "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
      } else if (error?.message) {
        errorMessage = `Erreur: ${error.message}`;
      }

      return {
        data: { user: null, session: null },
        error: { message: errorMessage, originalError: error },
        needsConfirmation: false,
      };
    }
  }

  // Alias pour compatibilité avec les tests
  static async signInWithPassword(email: string, password: string) {
    return this.signInWithEmailPassword(email, password);
  }

  // Déconnexion
  static async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: { message: "Erreur lors de la déconnexion" } };
    }
  }

  // Récupérer l'utilisateur actuel
  static async getCurrentUser(): Promise<{ data: { user: any }; error: any }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      return { data: { user }, error };
    } catch (error) {
      return { data: { user: null }, error: null };
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateUserProfile(updateData: {
    firstName?: string;
    lastName?: string;
    username?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updateData,
      });
      return { data, error };
    } catch (error) {
      return {
        data: null,
        error: { message: "Erreur lors de la mise à jour du profil" },
      };
    }
  }

  // Créer un profil artisan
  static async createArtisanProfile(artisanData: {
    businessName: string;
    location: string;
    description: string;
    specialties: string[];
    establishedYear: number;
  }): Promise<{ data: any; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: { message: "Utilisateur non connecté" } };
      }

      const { data, error } = await supabase
        .from("artisans")
        .insert({
          id: user.id,
          business_name: artisanData.businessName,
          location: artisanData.location,
          description: artisanData.description,
          specialties: artisanData.specialties,
          established_year: artisanData.establishedYear,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return {
        data: null,
        error: { message: "Erreur lors de la création du profil artisan" },
      };
    }
  }

  // Récupérer le profil artisan
  static async getArtisanProfile(
    userId: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from("artisans")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Mettre à jour le profil artisan
  static async updateArtisanProfile(
    userId: string,
    updateData: {
      businessName?: string;
      location?: string;
      description?: string;
      specialties?: string[];
      establishedYear?: number;
    }
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from("artisans")
        .update({
          business_name: updateData.businessName,
          location: updateData.location,
          description: updateData.description,
          specialties: updateData.specialties,
          established_year: updateData.establishedYear,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return {
        data: null,
        error: { message: "Erreur lors de la mise à jour du profil artisan" },
      };
    }
  }

  // Écouter les changements d'état d'authentification
  static onAuthStateChange(callback: (event: string, session: any) => void): {
    data: { subscription: any };
  } {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);
    return { data: { subscription } };
  }
}
