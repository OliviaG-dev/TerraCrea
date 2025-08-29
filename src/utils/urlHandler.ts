import { supabase } from "../services/supabase";

// Gérer les URLs de réinitialisation de mot de passe
export const handleResetPasswordUrl = async (url: string, navigation: any) => {
  try {
    console.log("🔗 Gestion de l'URL de réinitialisation:", url);

    // Extraire les paramètres de l'URL
    const urlObj = new URL(url);
    const fragments = new URLSearchParams(urlObj.hash.substring(1)); // Retirer le #

    const accessToken = fragments.get("access_token");
    const refreshToken = fragments.get("refresh_token");
    const type = fragments.get("type");

    console.log("📋 Paramètres extraits:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type,
    });

    if (type === "recovery" && accessToken && refreshToken) {
      // Définir la session avec les tokens
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("❌ Erreur lors de la définition de la session:", error);
        throw error;
      }

      console.log("✅ Session de récupération définie avec succès");

      // Rediriger vers l'écran de réinitialisation
      navigation.navigate("ResetPassword");
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Erreur lors de la gestion de l'URL:", error);
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
