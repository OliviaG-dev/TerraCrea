import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthService } from "../services/authService";
import { ScreenNavigationProp } from "../types/Navigation";
import { useEmailConfirmationHandler } from "../utils/emailConfirmationHandler";

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
      Alert.alert("Erreur", "Impossible de renvoyer l'email");
    } else {
      Alert.alert("Email renvoyé", "Vérifiez votre boîte de réception");
      setCanResend(false);
      setCountdown(60);
    }
  };

  const openEmailApp = async () => {
    // Tenter d'ouvrir l'app email par défaut
    const emailUrls = [
      "message://", // iOS Mail
      "mailto:", // Email générique
    ];

    for (const url of emailUrls) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          break;
        }
      } catch (error) {
        // Gestion silencieuse de l'erreur
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vérifiez votre email</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un email de confirmation à :
        </Text>
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instructions}>
          Cliquez sur le lien dans l'email pour activer votre compte.
        </Text>

        <TouchableOpacity style={styles.emailButton} onPress={openEmailApp}>
          <Text style={styles.emailButtonText}>Ouvrir l'app Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resendButton, !canResend && styles.disabledButton]}
          onPress={handleResendEmail}
          disabled={!canResend}
        >
          <Text style={[styles.resendText, !canResend && styles.disabledText]}>
            {canResend ? "Renvoyer l'email" : `Renvoyer dans ${countdown}s`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
    marginBottom: 24,
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  emailButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  resendText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  disabledText: {
    color: "#6c757d",
    textDecorationLine: "none",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    color: "#6c757d",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
