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

type ResetPasswordScreenNavigationProp = ScreenNavigationProp<"ResetPassword">;

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const { updatePassword } = useUserContext();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (!newPassword.trim()) {
      setNotification({
        visible: true,
        title: "⚠️ Mot de passe requis",
        message: "Veuillez saisir un nouveau mot de passe.",
        type: "warning",
      });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({
        visible: true,
        title: "⚠️ Mot de passe trop court",
        message: "Le mot de passe doit contenir au moins 6 caractères.",
        type: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification({
        visible: true,
        title: "⚠️ Mots de passe différents",
        message: "Les mots de passe ne correspondent pas.",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(newPassword.trim());

      if (result.success) {
        setNotification({
          visible: true,
          title: "✅ Mot de passe mis à jour !",
          message:
            "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.",
          type: "success",
        });

        // Rediriger vers la connexion après un délai
        setTimeout(() => {
          navigation.navigate("Login", {});
        }, 2000);
      } else {
        setNotification({
          visible: true,
          title: "❌ Erreur",
          message:
            result.error || "Erreur lors de la mise à jour du mot de passe.",
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
            onPress={() => navigation.navigate("Login", {})}
          >
            <Text style={styles.backButtonText}>← Retour à la connexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Définissez votre nouveau mot de passe
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                placeholderTextColor="#8a9a8a"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Text style={styles.helpText}>Minimum 6 caractères</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#8a9a8a"
                secureTextEntry
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
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
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
    marginTop: 8,
  },
  linkText: {
    color: "#4a5c4a",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
