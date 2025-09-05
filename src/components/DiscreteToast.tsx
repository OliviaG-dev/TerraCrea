import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { COLORS } from "../utils/colors";

interface DiscreteToastProps {
  visible: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onHide: () => void;
  duration?: number;
}

const { width } = Dimensions.get("window");

export const DiscreteToast: React.FC<DiscreteToastProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 3000,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-80));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      // Animation d'entrée fluide avec effet de slide et scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide après la durée spécifiée
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          background: "#6b8e6b", // Vert sauge doux, plus naturel
          border: "#5a7a5a",
          text: "#ffffff",
          icon: "✓",
        };
      case "error":
        return {
          background: "#a87070", // Rouge terreux doux
          border: "#946060",
          text: "#ffffff",
          icon: "✕",
        };
      case "warning":
        return {
          background: "#b8956b", // Orange/brun doux, terre cuite
          border: "#a08359",
          text: "#ffffff",
          icon: "⚠",
        };
      case "info":
        return {
          background: "#7a8a8a", // Gris-bleu doux
          border: "#6b7b7b",
          text: "#ffffff",
          icon: "ℹ",
        };
      default:
        return {
          background: "#8a9a8a", // Gris-vert doux
          border: "#7a8a7a",
          text: "#ffffff",
          icon: "•",
        };
    }
  };

  const colors = getColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: colors.text }]}>
            {colors.icon}
          </Text>
        </View>
        <Text
          style={[styles.message, { color: colors.text }]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>

      {/* Barre de progression pour indiquer le temps restant */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.text,
            opacity: 0.3,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 1000,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 14,
    fontWeight: "bold",
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  progressBar: {
    height: 3,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});
