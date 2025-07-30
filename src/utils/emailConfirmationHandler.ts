import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import { ScreenNavigationProp } from "../types/Navigation";

export const useEmailConfirmationHandler = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ne rediriger vers EmailConfirmed que si on vient spécifiquement d'une confirmation
        // et non pas lors d'un simple refresh ou redémarrage de l'app
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          // Vérifier si c'est une vraie confirmation récente
          const now = new Date();
          const confirmedAt = new Date(session.user.email_confirmed_at);
          const timeDiff = now.getTime() - confirmedAt.getTime();

          // Si la confirmation date de moins de 5 minutes, rediriger
          if (timeDiff < 5 * 60 * 1000) {
            navigation.navigate("EmailConfirmed" as any);
          }
        }

        // Supprimer la redirection automatique sur TOKEN_REFRESHED
        // car cela peut se déclencher lors du redémarrage de l'app
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
      // Ne rediriger que si c'est une confirmation récente (moins de 5 minutes)
      const now = new Date();
      const confirmedAt = new Date(user.email_confirmed_at);
      const timeDiff = now.getTime() - confirmedAt.getTime();

      if (timeDiff < 5 * 60 * 1000) {
        navigation.navigate("EmailConfirmed");
        return true;
      }
    }

    return false;
  } catch (error) {
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
        return false;
      }

      if (data.user && data.user.email_confirmed_at) {
        // Rediriger vers EmailConfirmed seulement si c'est une vraie confirmation
        navigation.navigate("EmailConfirmed");
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};
