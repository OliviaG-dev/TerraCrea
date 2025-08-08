import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { getUserDisplayName } from "../utils/userUtils";
import { RootStackParamList } from "../types/Navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../utils/colors";
import { supabase } from "../services/supabase";

export const NavigationHeader: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut, isAuthenticated } = useUserContext();

  const handleSignOut = async () => {
    try {
      const result = await signOut();

      if (!result?.success) {
        // Essayer directement avec Supabase
        await supabase.auth.signOut();
      }
    } catch (error) {
      // Gestion silencieuse des erreurs
    }
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate("Profil");
    } else {
      navigation.navigate("Login", {});
    }
  };

  const getUserDisplay = () => {
    if (!user) return "";

    if (user.username && user.username.trim()) {
      return user.username.trim();
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "Utilisateur";
  };

  // Styles dynamiques basés sur le thème
  const dynamicStyles = StyleSheet.create({
    userIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    userIconInactive: {
      backgroundColor: COLORS.textSecondary,
    },
    userIconArtisan: {
      backgroundColor: COLORS.accent, // Couleur orange pour les artisans
    },
    userIconText: {
      fontSize: 14,
      color: COLORS.textOnPrimary,
      textAlign: "center",
      lineHeight: 28,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    userName: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.textPrimary,
      flex: 1,
    },
    profileButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: COLORS.primary,
    },
    profileButtonText: {
      fontSize: 10,
      color: COLORS.textOnPrimary,
      fontWeight: "500",
    },
    signOutButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: COLORS.danger,
    },
    signOutText: {
      fontSize: 10,
      color: COLORS.danger,
      fontWeight: "500",
    },
    loginButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: COLORS.primary,
    },
    loginButtonText: {
      fontSize: 10,
      color: COLORS.textOnPrimary,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <View style={styles.authenticatedContainer}>
          <View style={styles.userInfo}>
            <View
              style={[
                dynamicStyles.userIcon,
                (user?.isArtisan || user?.user_metadata?.isArtisan) &&
                  dynamicStyles.userIconArtisan,
              ]}
            >
              <Text style={dynamicStyles.userIconText}>★</Text>
            </View>
            <Text style={dynamicStyles.userName} numberOfLines={1}>
              {getUserDisplay()}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={dynamicStyles.profileButton}
              onPress={handleProfilePress}
            >
              <Text style={dynamicStyles.profileButtonText}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={dynamicStyles.signOutText}>Déco</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <View
            style={[dynamicStyles.userIcon, dynamicStyles.userIconInactive]}
          >
            <Text style={dynamicStyles.userIconText}>☆</Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.loginButton}
            onPress={() => navigation.navigate("Login", {})}
          >
            <Text style={dynamicStyles.loginButtonText}>Connexion</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  authenticatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 120,
  },
  // userIcon, userIconInactive, userIconArtisan, userIconText supprimés - maintenant dans dynamicStyles
  // userName supprimé - maintenant dans dynamicStyles
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  // profileButton, profileButtonText supprimés - maintenant dans dynamicStyles
  // signOutButton, signOutText supprimés - maintenant dans dynamicStyles
  guestContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // loginButton, loginButtonText supprimés - maintenant dans dynamicStyles
});
