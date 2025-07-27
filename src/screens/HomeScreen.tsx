import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

  const handleSignOut = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          const result = await signOut();
          if (!result?.success) {
            Alert.alert("Erreur", "Impossible de se déconnecter");
          }
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleContinue = () => {
    navigation.navigate("Explore");
  };

  // Interface pour utilisateur connecté
  const renderAuthenticatedHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Bonjour,</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profil")}
        >
          <Text style={styles.profileButtonText}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Déconnexion</Text>
        </TouchableOpacity>
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

  // Interface pour visiteur non connecté
  const renderGuestHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.authButtons}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={handleLogin}>
          <Text style={styles.signupButtonText}>S'inscrire</Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Explorez</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
        <Text style={styles.primaryButtonText}>Continuer</Text>
      </TouchableOpacity>
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
    paddingTop: 25,
  },
  // Styles pour utilisateur connecté
  userInfo: {
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#7a8a7a",
    fontFamily: "System",
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4a5c4a",
    marginTop: 4,
    fontFamily: "System",
  },
  signOutButton: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  headerButtons: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  profileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4a5c4a",
    backgroundColor: "#4a5c4a",
  },
  profileButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "400",
    fontFamily: "System",
  },
  signOutText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400",
    fontFamily: "System",
  },
  // Styles pour visiteur
  authButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4a5c4a",
  },
  loginButtonText: {
    color: "#4a5c4a",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  signupButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  signupButtonText: {
    color: "#fafaf9",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  contentSection: {
    flex: 0.56,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  footerSection: {
    flex: 0.14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logoImage: {
    width: 280,
    height: 90,
    alignSelf: "center",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#4a5c4a",
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: 1.2,
    paddingHorizontal: HORIZONTAL_PADDING + 10,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "#7a8a7a",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    paddingHorizontal: HORIZONTAL_PADDING + 20,
    fontFamily: "System",
  },
  productsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: HORIZONTAL_PADDING,
    width: "100%",
  },
  productCard: {
    width: (width - HORIZONTAL_PADDING * 2 - CARD_SPACING * 2 - 4) / 3, // -4 marge de sécurité
    height: 60,
    maxWidth: width * 0.28, // Limite la largeur maximale
  },
  productImage1: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  productImage2: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  productImage3: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
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
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a0a0a0",
    width: 200,
    alignSelf: "center",
  },
  getStartedText: {
    color: "#6a6a6a",
    fontSize: 14,
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: 0.8,
    fontFamily: "System",
  },
  primaryButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  primaryButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
    fontFamily: "System",
  },
});
