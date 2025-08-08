import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenNavigationProp } from "../types/Navigation";
import { COLORS } from "../utils/colors";

export const EmailConfirmedScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp<"EmailConfirmed">>();
  
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation d'apparition
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();

    // Redirection automatique après 3 secondes
    const timer = setTimeout(() => {
      navigation.navigate("Profil");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim]);

  // Styles dynamiques basés sur le thème
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    checkIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.success,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    checkText: {
      fontSize: 40,
      color: COLORS.textOnPrimary,
      fontWeight: "bold",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.success,
      marginBottom: 16,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 22,
    },
    continueButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
      marginBottom: 16,
    },
    continueText: {
      color: COLORS.textOnPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    homeText: {
      color: COLORS.textSecondary,
      fontSize: 14,
      textDecorationLine: "underline",
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={dynamicStyles.checkIcon}>
          <Text style={dynamicStyles.checkText}>✓</Text>
        </View>

        <Text style={dynamicStyles.title}>Email confirmé !</Text>
        <Text style={dynamicStyles.subtitle}>
          Votre compte a été activé avec succès. Vous allez être redirigé vers
          votre profil.
        </Text>

        <TouchableOpacity
          style={dynamicStyles.continueButton}
          onPress={() => navigation.navigate("Profil")}
        >
          <Text style={dynamicStyles.continueText}>Continuer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={dynamicStyles.homeText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // container supprimé - maintenant dans dynamicStyles
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  // checkIcon, checkText supprimés - maintenant dans dynamicStyles
  // title, subtitle supprimés - maintenant dans dynamicStyles
  // continueButton, continueText supprimés - maintenant dans dynamicStyles
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  // homeText supprimé - maintenant dans dynamicStyles
});
