import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserProvider } from "./src/context/UserContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import { ProfilScreen } from "./src/screens/ProfilScreen";
import { EmailConfirmationScreen } from "./src/screens/EmailConfirmationScreen";
import { EmailConfirmedScreen } from "./src/screens/EmailConfirmedScreen";
import AccessibilityConfig from "./src/utils/accessibilityConfig";
import {
  useEmailConfirmationHandler,
  handleEmailConfirmationLink,
} from "./src/utils/emailConfirmationHandler";
import { RootStackParamList } from "./src/types/Navigation";

import { supabase } from "./src/services/supabase";

// Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configuration des liens profonds
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["terracrea://", "http://localhost:8081", "https://yourapp.com"],
  config: {
    screens: {
      Home: "",
      Login: "login",
      Explore: "explore",
      Profil: "profil",
      EmailConfirmation: "email-confirmation",
      EmailConfirmed: "email-confirmed",
    },
  },
  async getInitialURL() {
    // Vérifier s'il y a une URL de lancement (liens profonds)
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    // Écouter les liens profonds pendant que l'app est active
    const onReceiveURL = ({ url }: { url: string }) => {
      console.log("Lien reçu:", url);
      listener(url);
    };

    const subscription = Linking.addEventListener("url", onReceiveURL);

    return () => {
      subscription?.remove();
    };
  },
};

// Composant wrapper pour les écrans avec gestion des confirmations email
const NavigationHandler = () => {
  useEmailConfirmationHandler(); // Maintenant à l'intérieur du NavigationContainer

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "TerraCréa" }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Connexion" }}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: "Explorer" }}
      />
      <Stack.Screen
        name="Profil"
        component={ProfilScreen}
        options={{
          title: "Mon Profil",
          headerBackTitle: "Retour",
        }}
      />
      <Stack.Screen
        name="EmailConfirmation"
        component={EmailConfirmationScreen}
        options={{
          title: "Confirmation Email",
          headerBackTitle: "Retour",
        }}
      />
      <Stack.Screen
        name="EmailConfirmed"
        component={EmailConfirmedScreen}
        options={{
          title: "Email Confirmé",
          headerLeft: () => null, // Empêche le retour
        }}
      />
    </Stack.Navigator>
  );
};

// Composant NavigationContainer principal
const RootNavigator = () => {
  return (
    <NavigationContainer
      linking={linking}
      onStateChange={(state) => {
        console.log("Navigation state changed:", state);
      }}
    >
      <NavigationHandler />
    </NavigationContainer>
  );
};

export default function App() {
  // Initialiser la configuration d'accessibilité
  useEffect(() => {
    AccessibilityConfig.configureOverlayAccessibility();
  }, []);

  // Test de connexion Supabase (temporaire)
  useEffect(() => {
    supabase
      .from("categories")
      .select("count")
      .then(({ data, error }) => {
        console.log(data ? "✅ Supabase connecté!" : "❌ Erreur:", error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </UserProvider>
    </QueryClientProvider>
  );
}
