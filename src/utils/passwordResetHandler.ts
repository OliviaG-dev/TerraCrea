import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import { ScreenNavigationProp } from "../types/Navigation";

export const usePasswordResetHandler = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Rediriger vers ResetPassword si l'utilisateur a un token de réinitialisation
        if (event === "PASSWORD_RECOVERY" && session?.user) {
          navigation.navigate("ResetPassword" as any);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigation]);
};

export const handlePasswordResetLink = async (url: string, navigation: any) => {
  try {
    // Extraire le token de réinitialisation de l'URL
    const urlParams = new URLSearchParams(url.split("?")[1]);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      throw new Error("Tokens de réinitialisation manquants");
    }

    // Définir la session avec les nouveaux tokens
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    // Navigation vers l'écran de réinitialisation de mot de passe
    navigation.navigate("ResetPassword");
  } catch (error) {
    // Gestion silencieuse des erreurs
  }
};

// Fonction pour vérifier si l'utilisateur est en mode réinitialisation
export const isInPasswordResetMode = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérifier si l'utilisateur a un token de réinitialisation
    // Cela peut être détecté par la présence de certains paramètres dans la session
    return user !== null && user.app_metadata?.provider === "email";
  } catch (error) {
    return false;
  }
};
