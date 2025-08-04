import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserContext } from "../context/UserContext";
import { HomeScreen } from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import ExploreScreen from "../screens/ExploreScreen";
import { ProfilScreen } from "../screens/ProfilScreen";
import { EmailConfirmationScreen } from "../screens/EmailConfirmationScreen";
import { EmailConfirmedScreen } from "../screens/EmailConfirmedScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { CreationsScreen } from "../screens/CreationsScreen";
import { AddCreationScreen } from "../screens/AddCreationScreen";
import { EditCreationScreen } from "../screens/EditCreationScreen";
import { NavigationHeader } from "./NavigationHeader";
import { RootStackParamList } from "../types/Navigation";
import {
  useEmailConfirmationHandler,
  handleEmailConfirmationLink,
} from "../utils/emailConfirmationHandler";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useUserContext();

  // Ne pas utiliser useEmailConfirmationHandler ici pour éviter les redirections automatiques
  // useEmailConfirmationHandler();

  // Déterminer la route initiale basée sur l'état d'authentification
  const getInitialRoute = (): keyof RootStackParamList => {
    return "Home"; // Toujours commencer par Home
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#4a5c4a",
        headerTitleStyle: {
          fontWeight: "600",
          fontFamily: "System",
        },
        headerShadowVisible: true,
        headerBackTitle: "Retour",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "TerraCréa",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Connexion",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explorer",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="Profil"
        component={ProfilScreen}
        options={{
          title: "Mon Profil",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="EmailConfirmation"
        component={EmailConfirmationScreen}
        options={{
          title: "Confirmation Email",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="EmailConfirmed"
        component={EmailConfirmedScreen}
        options={{
          title: "Email Confirmé",
          headerLeft: () => null, // Empêche le retour
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: "Mot de passe oublié",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: "Nouveau mot de passe",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="Creations"
        component={CreationsScreen}
        options={{
          title: "Mes Créations",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="AddCreation"
        component={AddCreationScreen}
        options={{
          title: "Nouvelle Création",
          headerRight: () => <NavigationHeader />,
        }}
      />
      <Stack.Screen
        name="EditCreation"
        component={EditCreationScreen}
        options={{
          title: "Modifier la création",
          headerRight: () => <NavigationHeader />,
        }}
      />
    </Stack.Navigator>
  );
};
