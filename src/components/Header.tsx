import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/Navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../utils/colors";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  // Styles dynamiques basés sur le thème
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      backgroundColor: COLORS.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      elevation: 2,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: COLORS.cardBackground,
      minHeight: 60,
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: COLORS.lightGray,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    backButtonText: {
      fontSize: 18,
      color: COLORS.textPrimary,
      fontWeight: "600",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.textPrimary,
      fontFamily: "System",
      letterSpacing: 0.3,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.header}>
        {/* Section gauche - Bouton retour ou titre */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={dynamicStyles.backButton}
              onPress={handleBackPress}
            >
              <Text style={dynamicStyles.backButtonText}>←</Text>
            </TouchableOpacity>
          ) : (
            <Text style={dynamicStyles.title}>{title || "TerraCréa"}</Text>
          )}
        </View>

        {/* Section centrale - Titre si bouton retour présent */}
        {showBackButton && title && (
          <View style={styles.centerSection}>
            <Text style={dynamicStyles.title}>{title}</Text>
          </View>
        )}

        {/* Section droite - Vide */}
        <View style={styles.rightSection} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // safeArea, header supprimés - maintenant dans dynamicStyles
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  // backButton, backButtonText, title supprimés - maintenant dans dynamicStyles
});
