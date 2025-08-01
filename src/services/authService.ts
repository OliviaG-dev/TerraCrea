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
            process.env.EXPO_PUBLIC_APP_URL || "http://localhost:8081"
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
          error.message.includes("New password should be different from the old password")
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

  // Connexion sans vérification de confirmation obligatoire
  static async signInWithEmailPassword(email: string, password: string) {
    try {
      // Vérification des données avant envoi
      if (!email || !password) {
        return {
          data: null,
          error: { message: "Email et mot de passe requis" },
          needsConfirmation: false,
        };
      }

      // Vérification du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          data: null,
          error: { message: "Format d'email invalide" },
          needsConfirmation: false,
        };
      }

      // Essayer d'abord la connexion normale
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      // Si la connexion par mot de passe échoue, essayer avec OTP
      if (error && (error.status === 400 || error.status === 422)) {
        console.log("🔄 Tentative de connexion alternative avec OTP...");

        const { data: otpData, error: otpError } =
          await supabase.auth.signInWithOtp({
            email: email.trim(),
          });

        if (!otpError) {
          console.log("✅ OTP envoyé, connexion en cours...");
          return {
            data: otpData,
            error: null,
            needsConfirmation: false,
            needsOtp: true,
          };
        }
      }

      console.log("🔍 Résultat connexion:", {
        success: !error,
        error: error
          ? {
              message: error.message,
              status: error.status,
              name: error.name,
            }
          : null,
      });

      // Si erreur 400 avec "Email not confirmed", essayer une approche alternative
      if (
        error &&
        error.status === 400 &&
        error.message.includes("Email not confirmed")
      ) {
        console.log("🔄 Tentative de récupération de session...");
        // Essayer de récupérer la session existante
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          console.log("✅ Session trouvée!");
          return { data: sessionData, error: null, needsConfirmation: false };
        }
      }

      if (error) {
        // Gestion spécifique des erreurs Supabase
        let errorMessage = "Erreur de connexion";

        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          // Permettre la connexion même si l'email n'est pas confirmé
          return {
            data,
            error: null,
            needsConfirmation: false,
          };
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
        } else if (isTimeSyncError(error)) {
          errorMessage = getTimeSyncHelpMessage();
        } else if (error.status === 400) {
          // Gestion spécifique de l'erreur 400
          if (error.message.includes("Email not confirmed")) {
            return {
              data,
              error: null,
              needsConfirmation: false,
            };
          } else {
            errorMessage =
              "Données de connexion invalides. Vérifiez vos informations.";
          }
        } else if (error.status === 422) {
          errorMessage =
            "Données de connexion invalides. Vérifiez votre email et mot de passe.";
        } else {
          errorMessage = error.message;
        }

        return {
          data: null,
          error: { ...error, message: errorMessage },
          needsConfirmation: false,
        };
      }
      // Ne pas bloquer la connexion si l'email n'est pas confirmé
      return { data, error: null, needsConfirmation: false };
    } catch (error) {
      return {
        data: null,
        error: { message: "Erreur inattendue lors de la connexion" },
        needsConfirmation: false,
      };
    }
  }
}
