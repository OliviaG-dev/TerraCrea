import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { COLORS } from "../utils/colors";

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
    }
  }, [visible]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
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
        return COLORS.primary; // Couleur principale du projet
      case "error":
        return COLORS.danger; // Couleur de danger
      case "warning":
        return COLORS.warning; // Couleur d'avertissement
      case "info":
        return COLORS.primary; // Couleur principale du projet
      default:
        return COLORS.primary;
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

  // Styles dynamiques basés sur le thème
  const dynamicStyles = StyleSheet.create({
    container: {
      position: "absolute",
      top: 80,
      left: 20,
      right: 20,
      borderRadius: 12,
      elevation: 3,
      shadowColor: COLORS.overlay,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 4,
      zIndex: 1000,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    icon: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.textOnPrimary,
    },
    title: {
      color: COLORS.textOnPrimary,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      fontFamily: "System",
      letterSpacing: 0.3,
    },
    message: {
      color: COLORS.textOnPrimary,
      fontSize: 14,
      opacity: 0.9,
      fontFamily: "System",
      letterSpacing: 0.2,
      lineHeight: 20,
    },
    closeText: {
      color: COLORS.textOnPrimary,
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: "System",
      letterSpacing: 0.3,
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        dynamicStyles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={dynamicStyles.icon}>{getIcon()}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={dynamicStyles.title}>{title}</Text>
          <Text style={dynamicStyles.message}>{message}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <Text style={dynamicStyles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // container supprimé - maintenant dans dynamicStyles
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  // icon supprimé - maintenant dans dynamicStyles
  textContainer: {
    flex: 1,
  },
  // title, message supprimés - maintenant dans dynamicStyles
  closeButton: {
    padding: 4,
  },
  // closeText supprimé - maintenant dans dynamicStyles
});
