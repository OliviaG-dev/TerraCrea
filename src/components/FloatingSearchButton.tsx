import React from "react";
import { TouchableOpacity, StyleSheet, Animated, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/colors";
import Svg, { Path } from "react-native-svg";

export const FloatingSearchButton: React.FC = () => {
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);

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

    // Navigation vers l'écran de recherche
    navigation.navigate("Search" as never);
  };

  // Composant SVG pour la loupe personnalisée
  const SearchIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        <SearchIcon />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: 20,
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
});
