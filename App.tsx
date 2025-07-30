import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking } from "react-native";

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
import { AuthNavigator } from "./src/components/AuthNavigator";

import { supabase } from "./src/services/supabase";

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
  return <AuthNavigator />;
};

// Composant NavigationContainer principal
const RootNavigator = () => {
  return (
    <NavigationContainer linking={linking} onStateChange={(state) => {}}>
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
      .then(({ data, error }) => {});
  }, []);

  return (
    <UserProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </UserProvider>
  );
}
