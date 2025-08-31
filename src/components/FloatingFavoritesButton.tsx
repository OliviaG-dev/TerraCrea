import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/colors";
import { useFavorites } from "../context/FavoritesContext";
import Svg, { Path } from "react-native-svg";

export const FloatingFavoritesButton: React.FC = () => {
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);
  const { getFavoritesCount } = useFavorites();
  const favoritesCount = getFavoritesCount();

  const handlePress = () => {
    // Animation de pression
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation vers l'écran des favoris
    navigation.navigate("Favorites" as never);
  };

  // Composant SVG pour le cœur personnalisé
  const HeartIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="white"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
    </Svg>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <HeartIcon />

        {/* Badge avec le nombre de favoris */}
        {favoritesCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {favoritesCount > 99 ? "99+" : favoritesCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1001,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
