import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { User, createDefaultUser } from "../types/User";
import { AuthService, SignUpData } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Créer un objet utilisateur par défaut si nécessaire
        const userData = createDefaultUser(session.user as Partial<User>);
        setUser(userData);
      }
      setLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = createDefaultUser(session.user as Partial<User>);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    additionalData?: Partial<SignUpData>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const signUpData: SignUpData = {
        email,
        password,
        ...additionalData,
      };

      const result = await AuthService.signUpWithEmailConfirmation(signUpData);

      if (result.error) {
        setError(result.error.message);
        return {
          success: false,
          error: result.error.message,
          needsConfirmation: false,
        };
      }

      return {
        success: true,
        data: result.data,
        needsConfirmation: result.needsConfirmation,
      };
    } catch (error) {
      const errorMessage = "Erreur lors de l'inscription";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        needsConfirmation: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validation côté client
      if (!email.trim() || !password.trim()) {
        const errorMessage = "Email et mot de passe requis";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          needsConfirmation: false,
        };
      }

      const result = await AuthService.signInWithEmailPassword(email, password);

      // Gestion de l'OTP
      if (result.needsOtp) {
        const message = "Un lien de connexion a été envoyé à votre email";
        return {
          success: false,
          error: message,
          needsOtp: true,
        };
      }

      // Gestion des erreurs avec messages détaillés
      if (result.error) {
        let enhancedError = result.error.message;

        // Ajouter des conseils selon le type d'erreur
        if (result.error.message.includes("Email ou mot de passe incorrect")) {
          enhancedError =
            "Email ou mot de passe incorrect. Vérifiez vos informations ou utilisez 'Mot de passe oublié'.";
        } else if (result.error.message.includes("Trop de tentatives")) {
          enhancedError =
            "Trop de tentatives de connexion. Veuillez attendre quelques minutes avant de réessayer.";
        } else if (result.error.message.includes("Format d'email invalide")) {
          enhancedError =
            "Le format de l'email n'est pas valide. Exemple: nom@domaine.com";
        } else if (
          result.error.message.includes("network") ||
          result.error.message.includes("fetch")
        ) {
          enhancedError =
            "Problème de connexion internet. Vérifiez votre connexion et réessayez.";
        }

        setError(enhancedError);
        return {
          success: false,
          error: enhancedError,
          needsConfirmation: false,
        };
      }

      // Connexion réussie
      setError(null);
      return {
        success: true,
        data: result.data,
        needsConfirmation: false,
      };
    } catch (error: any) {
      let errorMessage = "Erreur inattendue lors de la connexion";

      // Gestion des erreurs spécifiques
      if (error?.name === "NetworkError" || error?.message?.includes("fetch")) {
        errorMessage =
          "Problème de connexion internet. Vérifiez votre connexion.";
      } else if (error?.message?.includes("timeout")) {
        errorMessage = "La connexion a pris trop de temps. Veuillez réessayer.";
      } else if (error?.message) {
        errorMessage = `Erreur: ${error.message}`;
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        needsConfirmation: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      return { success: true };
    } catch (error) {
      const errorMessage = "Erreur lors de la déconnexion";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const result = await AuthService.resendConfirmation(email);
      return result;
    } catch (error) {
      return { error: "Erreur lors du renvoi de l'email" };
    }
  };

  const checkEmailConfirmed = async () => {
    try {
      return await AuthService.checkEmailConfirmed();
    } catch (error) {
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.resetPassword(email);

      if (!result.success) {
        setError(result.error?.message || "Erreur lors de l'envoi de l'email");
        return {
          success: false,
          error: result.error?.message || "Erreur lors de l'envoi de l'email",
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      const errorMessage =
        "Erreur lors de l'envoi de l'email de réinitialisation";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.updatePassword(newPassword);

      if (!result.success) {
        setError(
          result.error?.message ||
            "Erreur lors de la mise à jour du mot de passe"
        );
        return {
          success: false,
          error:
            result.error?.message ||
            "Erreur lors de la mise à jour du mot de passe",
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      const errorMessage = "Erreur lors de la mise à jour du mot de passe";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    checkEmailConfirmed,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  };
};
