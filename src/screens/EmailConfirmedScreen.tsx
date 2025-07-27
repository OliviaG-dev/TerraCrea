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

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.checkIcon}>
          <Text style={styles.checkText}>✓</Text>
        </View>

        <Text style={styles.title}>Email confirmé !</Text>
        <Text style={styles.subtitle}>
          Votre compte a été activé avec succès. Vous allez être redirigé vers
          votre profil.
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("Profil")}
        >
          <Text style={styles.continueText}>Continuer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.homeText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  checkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  checkText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  homeText: {
    color: "#6c757d",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
