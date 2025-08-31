import { supabase } from "../services/supabase";

// Gérer les URLs de réinitialisation de mot de passe
export const handleResetPasswordUrl = async (url: string, navigation: any) => {
  try {
    // Extraire les paramètres de l'URL
    const urlObj = new URL(url);
    const fragments = new URLSearchParams(urlObj.hash.substring(1)); // Retirer le #

    const accessToken = fragments.get("access_token");
    const refreshToken = fragments.get("refresh_token");
    const type = fragments.get("type");

    if (type === "recovery" && accessToken && refreshToken) {
      // Définir la session avec les tokens
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }

      // Rediriger vers l'écran de réinitialisation
      navigation.navigate("ResetPassword");
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

// Détecter si on est dans un processus de réinitialisation
export const checkForPasswordReset = () => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(hash.substring(1));
    return searchParams.get("type") === "recovery";
  }
  return false;
};

// Extraire les tokens de l'URL actuelle
export const extractTokensFromUrl = () => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(hash.substring(1));

    return {
      access_token: searchParams.get("access_token"),
      refresh_token: searchParams.get("refresh_token"),
      type: searchParams.get("type"),
    };
  }
  return null;
};
