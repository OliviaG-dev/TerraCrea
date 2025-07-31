import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";

interface NotificationToastProps {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}

const { width } = Dimensions.get("window");

export const NotificationToast: React.FC<NotificationToastProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-fermeture
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#4a5c4a"; // Couleur principale du projet
      case "error":
        return "#d4a574"; // Couleur d'accent du projet
      case "warning":
        return "#8a9a8a"; // Couleur secondaire du projet
      case "info":
        return "#4a5c4a"; // Couleur principale du projet
      default:
        return "#4a5c4a";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "!";
      case "info":
        return "i";
      default:
        return "✓";
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "rgba(74, 92, 74, 0.25)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#3d4f3d",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fafaf9",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  message: {
    color: "#fafaf9",
    fontSize: 14,
    opacity: 0.9,
    fontFamily: "System",
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: "#fafaf9",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
});
