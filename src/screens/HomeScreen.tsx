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
const CARD_SPACING = 12;

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
      return (
        <CommonButton
          title="Explorez"
          variant="primary"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
        />
      );
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

        <View style={styles.productsContainer}>
          <View style={styles.productCard}>
            <View style={styles.productImage1}>
              <View style={styles.jewelryDisplay}>
                <View style={styles.earringSet}>
                  <View style={[styles.earring, styles.earringGold]} />
                  <View style={[styles.earring, styles.earringPink]} />
                  <View style={[styles.earring, styles.earringGold]} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={styles.productImage2}>
              <View style={styles.ceramicVase} />
              <View style={styles.frameDecor} />
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={styles.productImage3}>
              <View style={styles.basketContainer}>
                <View style={styles.basket} />
                <View style={styles.utensils} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Footer dynamique */}
      <View style={styles.footerSection}>{renderFooterButtons()}</View>

      {/* Bouton flottant des favoris pour les utilisateurs connectés */}
      {isAuthenticated && <FloatingFavoritesButton />}

      {/* Bouton flottant de recherche pour les utilisateurs connectés */}
      {isAuthenticated && <FloatingSearchButton />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  headerSection: {
    flex: 0.3,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: 40,
    paddingBottom: 20,
  },

  // Styles pour visiteur
  authButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 25,
    gap: 16,
  },
  loginButton: {
    width: 120,
  },
  signupButton: {
    width: 120,
  },
  contentSection: {
    flex: 0.56,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
  },
  footerSection: {
    flex: 0.14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingBottom: 25,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  logoImage: {
    width: 300,
    height: 95,
    alignSelf: "center",
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#4a5c4a",
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: 0.5,
    paddingHorizontal: HORIZONTAL_PADDING + 10,
    fontFamily: "System",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#7a8a7a",
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.3,
    paddingHorizontal: HORIZONTAL_PADDING + 20,
    fontFamily: "System",
    marginBottom: 20,
  },
  productsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: HORIZONTAL_PADDING,
    width: "100%",
    marginTop: 10,
  },
  productCard: {
    width: Math.min(
      (width - HORIZONTAL_PADDING * 2 - CARD_SPACING * 2 - 4) / 3,
      width * 0.28
    ), // Limite la largeur maximale
    height: 70,
  },
  productImage1: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  productImage2: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  productImage3: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  jewelryDisplay: {
    width: 40,
    height: 40,
    backgroundColor: "#d4a574",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  earringSet: {
    flexDirection: "row",
    gap: 3,
  },
  earring: {
    width: 8,
    height: 12,
    borderRadius: 4,
  },
  earringGold: {
    backgroundColor: "#c49969",
  },
  earringPink: {
    backgroundColor: "#d4a574",
  },
  ceramicVase: {
    width: 30,
    height: 40,
    backgroundColor: "#b8a892",
    borderRadius: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  frameDecor: {
    position: "absolute",
    top: 10,
    width: 25,
    height: 20,
    backgroundColor: "#ddd5c7",
    borderRadius: 2,
  },
  basketContainer: {
    alignItems: "center",
  },
  basket: {
    width: 35,
    height: 25,
    backgroundColor: "#c4a068",
    borderRadius: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  utensils: {
    marginTop: 5,
    width: 20,
    height: 2,
    backgroundColor: "#8b6f47",
    borderRadius: 1,
  },
  // Footer buttons
  getStartedButton: {
    width: 200,
    alignSelf: "center",
  },
  primaryButton: {
    width: 200,
    alignSelf: "center",
  },
});
