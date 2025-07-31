import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { getUserDisplayName } from "../utils/userUtils";
import { RootStackParamList } from "../types/Navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <View style={styles.authenticatedContainer}>
          <View style={styles.userInfo}>
            <View style={styles.userIcon}>
              <Text style={styles.userIconText}>★</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {getUserDisplay()}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              <Text style={styles.profileButtonText}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Déco</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <View style={[styles.userIcon, styles.userIconInactive]}>
            <Text style={styles.userIconText}>☆</Text>
          </View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login", {})}
          >
            <Text style={styles.loginButtonText}>Connexion</Text>
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
  userIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4a5c4a",
    justifyContent: "center",
    alignItems: "center",
  },
  userIconInactive: {
    backgroundColor: "#8a9a8a",
  },
  userIconText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  userName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a5c4a",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  profileButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#4a5c4a",
  },
  profileButtonText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
  signOutButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  signOutText: {
    fontSize: 10,
    color: "#dc3545",
    fontWeight: "500",
  },
  guestContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#4a5c4a",
  },
  loginButtonText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
});
