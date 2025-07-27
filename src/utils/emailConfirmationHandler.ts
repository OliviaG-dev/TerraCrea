import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import { ScreenNavigationProp } from "../types/Navigation";

export const useEmailConfirmationHandler = () => {
  const navigation = useNavigation<ScreenNavigationProp<keyof any>>();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event, "Session:", session?.user?.email);

        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          // L'utilisateur vient de confirmer son email
          console.log("Email confirmé, redirection vers EmailConfirmed");
          navigation.navigate("EmailConfirmed" as any);
        }

        if (event === "TOKEN_REFRESHED" && session?.user?.email_confirmed_at) {
          // Confirmation détectée lors du refresh du token
          console.log("Confirmation détectée lors du refresh");
          navigation.navigate("EmailConfirmed" as any);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigation]);
};

// Utilitaire pour vérifier manuellement le statut de confirmation
export const checkAndRedirectIfConfirmed = async (navigation: any) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email_confirmed_at) {
      console.log("Utilisateur confirmé trouvé, redirection...");
      navigation.navigate("EmailConfirmed");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification de confirmation:", error);
    return false;
  }
};

// Fonction pour gérer les liens de confirmation d'email
export const handleEmailConfirmationLink = async (
  url: string,
  navigation: any
) => {
  try {
    // Parser l'URL pour extraire les tokens
    const urlObject = new URL(url);
    const accessToken = urlObject.searchParams.get("access_token");
    const refreshToken = urlObject.searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Définir la session avec les tokens de confirmation
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Erreur lors de la confirmation:", error);
        return false;
      }

      if (data.user && data.user.email_confirmed_at) {
        console.log("Email confirmé avec succès");
        navigation.navigate("EmailConfirmed");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erreur lors du traitement du lien de confirmation:", error);
    return false;
  }
};
