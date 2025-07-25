import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../navigation/RootNavigator";

const { height: screenHeight } = Dimensions.get("window");

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (isSignUp) {
      const result = await signUp(email, password);
      if (result?.success) {
        Alert.alert(
          "Inscription réussie",
          "Vérifiez votre email pour confirmer votre compte"
        );
        setIsSignUp(false);
      } else {
        Alert.alert(
          "Erreur d'inscription",
          result?.error || "Une erreur est survenue"
        );
      }
    } else {
      const result = await signIn(email, password);
      if (result?.success) {
        // Connexion réussie, retour automatique à l'écran d'accueil
        navigation.goBack();
      } else {
        Alert.alert(
          "Erreur de connexion",
          result?.error || "Une erreur est survenue"
        );
      }
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Bouton de fermeture */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Header avec logo */}
      <View style={styles.headerSection}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Contenu principal */}
      <View style={styles.contentSection}>
        <Text style={styles.welcomeTitle}>
          {isSignUp ? "Rejoignez\nTerraCréa" : "Bon retour\nsur TerraCréa"}
        </Text>

        <Text style={styles.subtitle}>
          {isSignUp
            ? "Créez votre compte pour découvrir\nles créations locales"
            : "Connectez-vous pour continuer\nvotre découverte"}
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor="#a0a0a0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#a0a0a0"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
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
            {loading ? (
              <ActivityIndicator color="#fafaf9" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? "Créer un compte" : "Se connecter"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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

        <TouchableOpacity style={styles.backToHomeButton} onPress={handleClose}>
          <Text style={styles.backToHomeText}>← Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
    marginTop: -1,
  },
  headerSection: {
    height: screenHeight * 0.25,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  logoImage: {
    width: 240,
    height: 80,
  },
  contentSection: {
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#4a5c4a",
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: 1.2,
    marginBottom: 20,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "#7a8a7a",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    marginBottom: 40,
    fontFamily: "System",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
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
    marginTop: 20,
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
    height: screenHeight * 0.15,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
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
