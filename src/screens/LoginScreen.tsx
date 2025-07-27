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
import { useAuth } from "../hooks/useAuth";
import { ScreenNavigationProp } from "../types/Navigation";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// Constantes pour éviter le débordement horizontal
const HORIZONTAL_PADDING = 16;

type LoginScreenNavigationProp = ScreenNavigationProp<"Login">;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
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
            "Confirmation requise",
            "Veuillez confirmer votre email avant de vous connecter.",
            [{ text: "OK" }]
          );
        } else if (result?.success) {
          Alert.alert("Connexion réussie !", "Bienvenue sur TerraCréa", [
            { text: "OK", onPress: () => navigation.navigate("Home") },
          ]);
        } else {
          Alert.alert(
            "Erreur de connexion",
            result?.error || "Une erreur est survenue"
          );
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur inattendue s'est produite");
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
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Prénom *</Text>
                <TextInput
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom *</Text>
                <TextInput
                  style={styles.textInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Votre nom"
                  autoComplete="family-name"
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe *</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? "Chargement..."
                : isSignUp
                ? "Créer le compte"
                : "Se connecter"}
            </Text>
          </TouchableOpacity>
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
  },
  headerSection: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    minHeight: screenHeight * 0.25,
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#4a5c4a",
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: 1,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "#7a8a7a",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    marginBottom: 25,
    fontFamily: "System",
  },
  formContainer: {
    width: "100%",
    maxWidth: Math.min(400, screenWidth - (HORIZONTAL_PADDING + 10) * 2),
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4a5c4a",
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: "System",
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#4a5c4a",
    backgroundColor: "#ffffff",
    fontFamily: "System",
  },
  submitButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  submitButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
    fontFamily: "System",
  },
  footerSection: {
    height: screenHeight * 0.12,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15,
  },
  switchText: {
    fontSize: 14,
    color: "#7a8a7a",
    marginBottom: 8,
    fontFamily: "System",
  },
  switchButtonText: {
    fontSize: 14,
    color: "#4a5c4a",
    fontWeight: "500",
    letterSpacing: 0.3,
    textDecorationLine: "underline",
    fontFamily: "System",
  },
  backToHomeButton: {
    marginTop: 10,
  },
  backToHomeText: {
    fontSize: 14,
    color: "#4a5c4a",
    fontWeight: "500",
    letterSpacing: 0.3,
    textDecorationLine: "underline",
    fontFamily: "System",
  },
});

export default LoginScreen;
