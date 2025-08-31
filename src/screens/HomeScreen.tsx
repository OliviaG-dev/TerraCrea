import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  CommonButton,
  FloatingFavoritesButton,
  FloatingSearchButton,
} from "../components";
import { useUserContext } from "../context/UserContext";
import { ScreenNavigationProp } from "../types/Navigation";

const { width } = Dimensions.get("window");

// Constantes pour éviter le débordement horizontal
const HORIZONTAL_PADDING = 16;

type HomeScreenNavigationProp = ScreenNavigationProp<"Home">;

export const HomeScreen: React.FC = () => {
  const { user, signOut, isAuthenticated } = useUserContext();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate("Explore");
  };

  const handleLogin = () => {
    (navigation as any).navigate("Login");
  };

  const handleSignUp = () => {
    (navigation as any).navigate("Login", { mode: "signup" });
  };

  const handleContinue = () => {
    navigation.navigate("Explore");
  };

  // Interface pour utilisateur connecté
  const renderAuthenticatedHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  // Interface pour visiteur non connecté
  const renderGuestHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.authButtons}>
        <CommonButton
          title="Se connecter"
          variant="secondary"
          onPress={handleLogin}
          style={styles.loginButton}
        />
        <CommonButton
          title="S'inscrire"
          variant="primary"
          onPress={handleSignUp}
          style={styles.signupButton}
        />
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  // Boutons du footer adaptés
  const renderFooterButtons = () => {
    if (isAuthenticated) {
      return null; // Le bouton Explorez sera maintenant positionné de manière absolue
    }

    return (
      <CommonButton
        title="Continuer"
        variant="primary"
        onPress={handleContinue}
        style={styles.primaryButton}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header dynamique */}
      {isAuthenticated ? renderAuthenticatedHeader() : renderGuestHeader()}

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.mainTitle}>La création prend{"\n"}racine ici</Text>

        <Text style={styles.subtitle}>
          {isAuthenticated
            ? "Découvrez des bijoux, poterie,\ndécorations et plus encore fabriqués localement."
            : "Achetez des bijoux, poterie,\ndécorations et plus encore fabriqués localement."}
        </Text>

        <View style={styles.heroImageContainer}>
          <Image
            source={require("../../assets/image-home.jpg")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Footer dynamique */}
      <View style={styles.footerSection}>{renderFooterButtons()}</View>

      {/* Bouton flottant des favoris pour les utilisateurs connectés */}
      {isAuthenticated && <FloatingFavoritesButton />}

      {/* Bouton flottant de recherche pour les utilisateurs connectés */}
      {isAuthenticated && <FloatingSearchButton />}

      {/* Bouton Explorez centré entre les boutons flottants */}
      {isAuthenticated && (
        <View style={styles.exploreButtonContainer}>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.exploreButtonText}>Explorez</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  headerSection: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  // Styles pour visiteur
  authButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 15,
    gap: 16,
  },
  loginButton: {
    width: 120,
  },
  signupButton: {
    width: 120,
  },
  contentSection: {
    flex: 0.66,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
  },
  footerSection: {
    flex: 0.08,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logoImage: {
    width: 300,
    height: 95,
    alignSelf: "center",
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2d3748",
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: 0.8,
    paddingHorizontal: HORIZONTAL_PADDING + 10,
    fontFamily: "System",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4a5568",
    textAlign: "center",
    lineHeight: 26,
    letterSpacing: 0.4,
    paddingHorizontal: HORIZONTAL_PADDING + 20,
    fontFamily: "System",
    marginBottom: 30,
    opacity: 0.9,
  },
  heroImageContainer: {
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 20,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  // Footer buttons
  exploreButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center", // Centre le bouton dans le conteneur
    zIndex: 999, // Inférieur aux floating buttons
    pointerEvents: "box-none", // Permet aux touches de passer à travers le conteneur
  },
  exploreButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  exploreButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
    textAlign: "center",
  },
  primaryButton: {
    width: 200,
    alignSelf: "center",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 20,
    gap: 16,
  },
});
