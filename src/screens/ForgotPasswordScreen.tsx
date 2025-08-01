import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { ScreenNavigationProp } from "../types/Navigation";

type ForgotPasswordScreenNavigationProp =
  ScreenNavigationProp<"ForgotPassword">;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useUserContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const handleResetPassword = async () => {
    // Validation basique
    if (!email.trim()) {
      setNotification({
        visible: true,
        title: "⚠️ Email requis",
        message: "Veuillez saisir votre adresse email.",
        type: "warning",
      });
      return;
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setNotification({
        visible: true,
        title: "⚠️ Format invalide",
        message: "Veuillez saisir une adresse email valide.",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        setNotification({
          visible: true,
          title: "✅ Email envoyé !",
          message:
            "Un lien de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception et vos spams.",
          type: "success",
        });
        setEmail("");
      } else {
        setNotification({
          visible: true,
          title: "❌ Erreur",
          message:
            result.error ||
            "Erreur lors de l'envoi de l'email de réinitialisation.",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NotificationToast
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        duration={5000}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre adresse email pour recevoir un lien de
              réinitialisation
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre.email@exemple.com"
                placeholderTextColor="#8a9a8a"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading
                  ? "Envoi en cours..."
                  : "Envoyer le lien de réinitialisation"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              Vous vous souvenez de votre mot de passe ?{" "}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("Login", {})}
              >
                Se connecter
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: "#4a5c4a",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4a5c4a",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "#7a8a7a",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "System",
    letterSpacing: 0.2,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 8,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e8e9e8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#4a5c4a",
    fontFamily: "System",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  primaryButton: {
    backgroundColor: "#4a5c4a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "rgba(74, 92, 74, 0.25)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#3d4f3d",
  },
  buttonDisabled: {
    backgroundColor: "#8a9a8a",
    elevation: 1,
    shadowOpacity: 0.1,
  },
  primaryButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  helpSection: {
    alignItems: "center",
  },
  helpText: {
    fontSize: 14,
    color: "#7a8a7a",
    textAlign: "center",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  linkText: {
    color: "#4a5c4a",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
