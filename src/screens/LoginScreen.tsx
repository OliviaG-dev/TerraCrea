import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonInput, CommonButton } from "../components";
import { useAuth } from "../hooks/useAuth";
import { ScreenNavigationProp } from "../types/Navigation";
import { useUserContext } from "../context/UserContext";
import { useEmailConfirmationHandler } from "../utils/emailConfirmationHandler";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// Constantes pour éviter le débordement horizontal
const HORIZONTAL_PADDING = 16;

type LoginScreenNavigationProp = ScreenNavigationProp<"Login">;

type LoginScreenProps = {
  route: {
    params?: {
      mode?: string;
    };
  };
};

const LoginScreen: React.FC<LoginScreenProps> = ({ route }) => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signUp } = useAuth();
  const { user, isAuthenticated } = useUserContext();

  // Utiliser le handler de confirmation d'email seulement sur cet écran
  useEmailConfirmationHandler();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(route.params?.mode === "signup");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  const handleClose = () => {
    navigation.navigate("Home");
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs requis");
      return;
    }

    // Validation supplémentaire pour l'inscription
    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      Alert.alert("Erreur", "Veuillez remplir votre prénom et nom");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUp(email, password, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: email.split("@")[0], // Nom d'utilisateur par défaut
        });

        if (result?.needsConfirmation) {
          // Rediriger vers l'écran de confirmation
          navigation.navigate("EmailConfirmation", { email });
          Alert.alert(
            "Email envoyé !",
            "Un email de confirmation a été envoyé à votre adresse. Vérifiez votre boîte de réception.",
            [{ text: "OK" }]
          );
        } else if (result?.error) {
          Alert.alert("Erreur d'inscription", result.error);
        } else if (result?.success) {
          // Inscription réussie sans confirmation nécessaire
          Alert.alert(
            "Inscription réussie !",
            "Votre compte a été créé avec succès.",
            [{ text: "OK", onPress: () => navigation.navigate("Home") }]
          );
        }
      } else {
        const result = await signIn(email, password);

        if (result?.needsConfirmation) {
          // Rediriger vers l'écran de confirmation
          navigation.navigate("EmailConfirmation", { email });
          Alert.alert(
            "Email requis !",
            "Veuillez confirmer votre email avant de vous connecter.",
            [{ text: "OK" }]
          );
        } else if (result?.error) {
          Alert.alert("Erreur de connexion", result.error);
        } else if (result?.success) {
          // Connexion réussie - redirection directe
          navigation.navigate("Home");
        }
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur inattendue s'est produite. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            {isSignUp ? "Créer un compte" : "Se connecter"}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Rejoignez notre communauté d'artisans et découvrez des créations uniques"
              : "Accédez à votre compte pour découvrir des créations artisanales"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {isSignUp && (
            <>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>
                  Informations personnelles
                </Text>
              </View>

              <View style={styles.nameRow}>
                <View style={styles.halfWidth}>
                  <CommonInput
                    label="Prénom *"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Votre prénom"
                    autoComplete="given-name"
                  />
                </View>

                <View style={styles.halfWidth}>
                  <CommonInput
                    label="Nom *"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Votre nom"
                    autoComplete="family-name"
                  />
                </View>
              </View>

              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>
                  Informations de connexion
                </Text>
              </View>
            </>
          )}

          <CommonInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <CommonInput
            label="Mot de passe *"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />
          {!isSignUp && (
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          )}

          <CommonButton
            title={
              loading
                ? "Chargement..."
                : isSignUp
                ? "Créer le compte"
                : "Se connecter"
            }
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.switchText}>
            {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.switchButtonText}>
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={handleClose}
          >
            <Text style={styles.backToHomeText}>← Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 16,
    width: "100%",
  },
  headerSection: {
    flex: 0.25,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
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
  formContainer: {
    width: "100%",
    maxWidth: Math.min(380, screenWidth - HORIZONTAL_PADDING * 2),
    paddingVertical: 15,
  },
  submitButton: {
    marginTop: 10,
  },
  footerSection: {
    height: screenHeight * 0.12,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 15,
  },
  switchText: {
    fontSize: 14,
    color: "#7a8a7a",
    marginBottom: 10,
    fontFamily: "System",
  },
  switchButtonText: {
    fontSize: 14,
    color: "#4a5c4a",
    fontWeight: "500",
    letterSpacing: 0.2,
    textDecorationLine: "underline",
    fontFamily: "System",
  },
  backToHomeButton: {
    marginTop: 18,
  },
  backToHomeText: {
    fontSize: 14,
    color: "#4a5c4a",
    fontWeight: "500",
    letterSpacing: 0.2,
    textDecorationLine: "underline",
    fontFamily: "System",
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a5c4a",
    letterSpacing: 0.2,
    fontFamily: "System",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  halfWidth: {
    width: "48%",
  },
  inputContainerSignUp: {
    marginBottom: 20,
  },
  required: {
    color: "#e74c3c",
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#4a5c4a",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
});

export default LoginScreen;
