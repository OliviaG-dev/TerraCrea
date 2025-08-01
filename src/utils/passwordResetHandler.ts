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

// Fonction pour gérer les liens de réinitialisation de mot de passe
export const handlePasswordResetLink = async (url: string, navigation: any) => {
  try {
    // Parser l'URL pour extraire les tokens
    const urlObject = new URL(url);
    const accessToken = urlObject.searchParams.get("access_token");
    const refreshToken = urlObject.searchParams.get("refresh_token");
    const type = urlObject.searchParams.get("type");

    // Vérifier si c'est un lien de réinitialisation de mot de passe
    if (type === "recovery" && accessToken && refreshToken) {
      // Définir la session avec les tokens de réinitialisation
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error(
          "Erreur lors de la définition de la session de réinitialisation:",
          error
        );
        return false;
      }

      if (data.user) {
        // Rediriger vers l'écran de réinitialisation de mot de passe
        navigation.navigate("ResetPassword");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(
      "Erreur lors du traitement du lien de réinitialisation:",
      error
    );
    return false;
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
