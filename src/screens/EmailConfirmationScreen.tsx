import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthService } from "../services/authService";
import { ScreenNavigationProp } from "../types/Navigation";
import { useEmailConfirmationHandler } from "../utils/emailConfirmationHandler";
import { COLORS } from "../utils/colors";
import { useToast } from "../context/ToastContext";

type EmailConfirmationScreenProps = {
  route: {
    params: {
      email: string;
    };
  };
};

export const EmailConfirmationScreen = ({
  route,
}: EmailConfirmationScreenProps) => {
  const navigation = useNavigation<ScreenNavigationProp<"EmailConfirmation">>();
  const { showError, showSuccess } = useToast();

  const { email } = route.params;

  // Utiliser le handler de confirmation d'email sur cet écran
  useEmailConfirmationHandler();
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    const { error } = await AuthService.resendConfirmation(email);
    if (error) {
      showError("Impossible de renvoyer l'email");
    } else {
      showSuccess("Email renvoyé ! Vérifiez votre boîte de réception");
      setCanResend(false);
      setCountdown(60);
    }
  };

  // Styles dynamiques basés sur le thème
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.textPrimary,
      marginBottom: 16,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },
    email: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.primary,
      marginBottom: 24,
      textAlign: "center",
    },
    instructions: {
      fontSize: 14,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 20,
    },
    resendText: {
      color: COLORS.primary,
      fontSize: 14,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
    disabledText: {
      color: COLORS.textSecondary,
      textDecorationLine: "none",
    },
    backText: {
      color: COLORS.textSecondary,
      fontSize: 14,
      textDecorationLine: "underline",
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={styles.content}>
        <Text style={dynamicStyles.title}>Vérifiez votre email</Text>
        <Text style={dynamicStyles.subtitle}>
          Nous avons envoyé un email de confirmation à :
        </Text>
        <Text style={dynamicStyles.email}>{email}</Text>

        <Text style={dynamicStyles.instructions}>
          Cliquez sur le lien dans l'email pour activer votre compte.
        </Text>

        <TouchableOpacity
          style={[styles.resendButton, !canResend && styles.disabledButton]}
          onPress={handleResendEmail}
          disabled={!canResend}
        >
          <Text
            style={[
              dynamicStyles.resendText,
              !canResend && dynamicStyles.disabledText,
            ]}
          >
            {canResend ? "Renvoyer l'email" : `Renvoyer dans ${countdown}s`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // container supprimé - maintenant dans dynamicStyles
  content: {
    alignItems: "center",
  },
  // title, subtitle, email, instructions supprimés - maintenant dans dynamicStyles
  // emailButton, emailButtonText supprimés - maintenant dans dynamicStyles
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // resendText, disabledText supprimés - maintenant dans dynamicStyles
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  // backText supprimé - maintenant dans dynamicStyles
});
