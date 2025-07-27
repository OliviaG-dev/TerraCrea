import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen"; // Named export
import LoginScreen from "../screens/LoginScreen"; // Default export
import ExploreScreen from "../screens/ExploreScreen"; // Default export
import { ProfilScreen } from "../screens/ProfilScreen"; // Named export
import { EmailConfirmationScreen } from "../screens/EmailConfirmationScreen"; // Named export
import { EmailConfirmedScreen } from "../screens/EmailConfirmedScreen"; // Named export

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
};

export default RootNavigator;
