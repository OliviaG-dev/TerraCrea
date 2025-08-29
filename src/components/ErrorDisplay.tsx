import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  style,
}) => {
  if (!error) return null;

  // Déterminer le type d'erreur pour l'icône
  const getErrorIcon = (errorMessage: string) => {
    if (
      errorMessage.includes("connexion internet") ||
      errorMessage.includes("network")
    ) {
      return "🌐";
    } else if (errorMessage.includes("Email ou mot de passe incorrect")) {
      return "🔐";
    } else if (errorMessage.includes("Format d'email invalide")) {
      return "📧";
    } else if (errorMessage.includes("Trop de tentatives")) {
      return "⏱️";
    } else {
      return "❌";
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getErrorIcon(error)}</Text>
        <Text style={styles.message}>{error}</Text>
      </View>

      <View style={styles.actions}>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Fermer</Text>
          </TouchableOpacity>
        )}
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff5f5",
    borderColor: "#fed7d7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: "#c53030",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dismissText: {
    color: "#718096",
    fontSize: 14,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#4a5c4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
