import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { ScreenNavigationProp } from "../types/Navigation";
import { COLORS } from "../utils/colors";

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

  // Styles dynamiques basés sur le thème
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    backButton: {
      alignSelf: "flex-start",
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    backButtonText: {
      color: COLORS.textPrimary,
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
      color: COLORS.textPrimary,
      marginBottom: 12,
      textAlign: "center",
      fontFamily: "System",
      letterSpacing: 0.3,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
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
      color: COLORS.textPrimary,
      marginBottom: 8,
      fontFamily: "System",
      letterSpacing: 0.2,
    },
    input: {
      borderWidth: 1.5,
      borderColor: COLORS.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: COLORS.cardBackground,
      color: COLORS.textPrimary,
      fontFamily: "System",
      elevation: 1,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    buttonDisabled: {
      backgroundColor: COLORS.textSecondary,
      elevation: 1,
      shadowOpacity: 0.1,
    },
    primaryButtonText: {
      color: COLORS.textOnPrimary,
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
      color: COLORS.textSecondary,
      textAlign: "center",
      fontFamily: "System",
      letterSpacing: 0.2,
      marginTop: 8,
    },
    linkText: {
      color: COLORS.textPrimary,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
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
            style={dynamicStyles.backButton}
            onPress={() => navigation.navigate("Login", {})}
          >
            <Text style={dynamicStyles.backButtonText}>
              ← Retour à la connexion
            </Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.mainContent}>
          <View style={dynamicStyles.titleSection}>
            <Text style={dynamicStyles.title}>Nouveau mot de passe</Text>
            <Text style={dynamicStyles.subtitle}>
              Définissez votre nouveau mot de passe
            </Text>
          </View>

          <View style={dynamicStyles.formSection}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={dynamicStyles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Text style={dynamicStyles.helpText}>Minimum 6 caractères</Text>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={dynamicStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                dynamicStyles.primaryButton,
                loading && dynamicStyles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={dynamicStyles.primaryButtonText}>
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.helpSection}>
            <Text style={dynamicStyles.helpText}>
              Vous vous souvenez de votre mot de passe ?{" "}
              <Text
                style={dynamicStyles.linkText}
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  helpSection: {
    alignItems: "center",
  },
});
