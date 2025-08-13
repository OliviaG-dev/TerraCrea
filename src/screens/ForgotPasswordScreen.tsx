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
            onPress={() => navigation.goBack()}
          >
            <Text style={dynamicStyles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.mainContent}>
          <View style={dynamicStyles.titleSection}>
            <Text style={dynamicStyles.title}>Mot de passe oublié</Text>
            <Text style={dynamicStyles.subtitle}>
              Entrez votre adresse email pour recevoir un lien de
              réinitialisation
            </Text>
          </View>

          <View style={dynamicStyles.formSection}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Adresse email</Text>
              <TextInput
                style={dynamicStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre.email@exemple.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
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
                {loading
                  ? "Envoi en cours..."
                  : "Envoyer le lien de réinitialisation"}
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
