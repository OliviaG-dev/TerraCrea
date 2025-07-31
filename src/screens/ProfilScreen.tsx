import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import {
  validateArtisanProfile,
  validateUserProfile,
  getUserDisplayName,
} from "../utils/userUtils";
import { CATEGORY_LABELS, CreationCategory } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";

type ProfilScreenNavigationProp = ScreenNavigationProp<"Profil">;

export const ProfilScreen = () => {
  const navigation = useNavigation<ProfilScreenNavigationProp>();
  const {
    user,
    capabilities,
    updateProfile,
    upgradeToArtisan,
    updateArtisanProfile,
    signOut,
  } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profil" | "artisan">("profil");

  // État pour le profil utilisateur
  const [userForm, setUserForm] = useState({
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
  });

  // État pour le profil artisan
  const [artisanForm, setArtisanForm] = useState({
    businessName: user?.artisanProfile?.businessName || "",
    location: user?.artisanProfile?.location || "",
    description: user?.artisanProfile?.description || "",
    establishedYear:
      user?.artisanProfile?.establishedYear || new Date().getFullYear(),
    specialties: user?.artisanProfile?.specialties || ([] as string[]),
  });

  const handleSpecialtyToggle = (category: CreationCategory) => {
    const categoryValue = category as string;
    setArtisanForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(categoryValue)
        ? prev.specialties.filter((s) => s !== categoryValue)
        : [...prev.specialties, categoryValue],
    }));
  };

  const handleUpdateProfile = async () => {
    // Validation des données avant envoi
    const errors = validateUserProfile(userForm);
    if (errors.length > 0) {
      Alert.alert("⚠️ Erreurs de validation", errors.join("\n"), [
        { text: "Corriger", style: "default" },
      ]);
      return;
    }

    setLoading(true);
    try {
      await updateProfile(userForm);
      Alert.alert(
        "✅ Profil mis à jour !",
        "Vos informations personnelles ont été modifiées avec succès.",
        [{ text: "Parfait", style: "default" }]
      );
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
      Alert.alert(
        "❌ Erreur de mise à jour",
        `Impossible de mettre à jour votre profil : ${errorMessage}`,
        [{ text: "Réessayer", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToArtisan = async () => {
    const errors = validateArtisanProfile(artisanForm);
    if (errors.length > 0) {
      Alert.alert("⚠️ Erreurs de validation", errors.join("\n"), [
        { text: "Corriger", style: "default" },
      ]);
      return;
    }

    setLoading(true);
    try {
      await upgradeToArtisan(artisanForm);
      Alert.alert(
        "🎉 Félicitations !",
        "Votre compte artisan a été créé avec succès. Vous pouvez maintenant commencer à vendre vos créations !",
        [{ text: "Super !", style: "default" }]
      );
      setActiveTab("artisan");
    } catch (error) {
      console.error("Erreur création profil artisan:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
      Alert.alert(
        "❌ Erreur de création",
        `Impossible de créer votre profil artisan : ${errorMessage}`,
        [{ text: "Réessayer", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArtisanProfile = async () => {
    const errors = validateArtisanProfile(artisanForm);
    if (errors.length > 0) {
      Alert.alert("⚠️ Erreurs de validation", errors.join("\n"), [
        { text: "Corriger", style: "default" },
      ]);
      return;
    }

    setLoading(true);
    try {
      await updateArtisanProfile(artisanForm);
      Alert.alert(
        "✅ Profil artisan mis à jour !",
        "Vos informations d'artisan ont été modifiées avec succès.",
        [{ text: "Parfait", style: "default" }]
      );
    } catch (error) {
      console.error("Erreur mise à jour profil artisan:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
      Alert.alert(
        "❌ Erreur de mise à jour",
        `Impossible de mettre à jour votre profil artisan : ${errorMessage}`,
        [{ text: "Réessayer", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Vous devez être connecté pour accéder à votre profil.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => (navigation as any).navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Bonjour {getUserDisplayName(user)} !
            </Text>

            {capabilities.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Artisan Vérifié</Text>
              </View>
            )}
          </View>

          {/* Bouton retour à l'accueil */}
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backToHomeText}>← Retour à l'accueil</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "profil" && styles.activeTab]}
              onPress={() => setActiveTab("profil")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profil" && styles.activeTabText,
                ]}
              >
                Profil Personnel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "artisan" && styles.activeTab]}
              onPress={() => setActiveTab("artisan")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "artisan" && styles.activeTabText,
                ]}
              >
                {capabilities.canCreateProducts
                  ? "Profil Artisan"
                  : "Devenir Artisan"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenu selon l'onglet actif */}
          {activeTab === "profil" ? (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <TextInput
                  style={styles.input}
                  value={userForm.username}
                  onChangeText={(text) =>
                    setUserForm((prev) => ({ ...prev, username: text }))
                  }
                  placeholder="Votre nom d'utilisateur"
                  placeholderTextColor="#8a9a8a"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={userForm.firstName}
                  onChangeText={(text) =>
                    setUserForm((prev) => ({ ...prev, firstName: text }))
                  }
                  placeholder="Votre prénom"
                  placeholderTextColor="#8a9a8a"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={userForm.lastName}
                  onChangeText={(text) =>
                    setUserForm((prev) => ({ ...prev, lastName: text }))
                  }
                  placeholder="Votre nom"
                  placeholderTextColor="#8a9a8a"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={userForm.bio}
                  onChangeText={(text) =>
                    setUserForm((prev) => ({ ...prev, bio: text }))
                  }
                  placeholder="Parlez-nous de vous..."
                  placeholderTextColor="#8a9a8a"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {userForm.bio.length}/500 caractères
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Mise à jour..." : "Mettre à jour le profil"}
                </Text>
              </TouchableOpacity>

              {/* Section compte */}
              <View style={styles.accountSection}>
                <Text style={styles.sectionTitle}>Gestion du compte</Text>

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email :</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              {!capabilities.canCreateProducts ? (
                // Section "Devenir Artisan"
                <>
                  <Text style={styles.sectionTitle}>Devenir Artisan</Text>
                  <Text style={styles.sectionDescription}>
                    Créez votre profil artisan pour commencer à vendre vos
                    créations sur TerraCréa
                  </Text>
                </>
              ) : (
                // Section "Profil Artisan"
                <>
                  <Text style={styles.sectionTitle}>Votre Profil Artisan</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>
                        {user.artisanProfile?.totalSales || 0}
                      </Text>
                      <Text style={styles.statLabel}>Ventes</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>
                        {user.artisanProfile?.rating || 0}⭐
                      </Text>
                      <Text style={styles.statLabel}>Note</Text>
                    </View>
                  </View>
                </>
              )}

              {/* Formulaire artisan */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nom de votre entreprise/atelier *
                </Text>
                <TextInput
                  style={styles.input}
                  value={artisanForm.businessName}
                  onChangeText={(text) =>
                    setArtisanForm((prev) => ({ ...prev, businessName: text }))
                  }
                  placeholder="Ex: Atelier du Bois"
                  placeholderTextColor="#8a9a8a"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Localisation *</Text>
                <TextInput
                  style={styles.input}
                  value={artisanForm.location}
                  onChangeText={(text) =>
                    setArtisanForm((prev) => ({ ...prev, location: text }))
                  }
                  placeholder="Ex: Lyon, France"
                  placeholderTextColor="#8a9a8a"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Description de votre activité *
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={artisanForm.description}
                  onChangeText={(text) =>
                    setArtisanForm((prev) => ({ ...prev, description: text }))
                  }
                  placeholder="Décrivez votre passion, votre savoir-faire, votre histoire..."
                  placeholderTextColor="#8a9a8a"
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                />
                <Text style={styles.charCount}>
                  {artisanForm.description.length}/1000 caractères
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Année de création</Text>
                <TextInput
                  style={styles.input}
                  value={artisanForm.establishedYear.toString()}
                  onChangeText={(text) =>
                    setArtisanForm((prev) => ({
                      ...prev,
                      establishedYear:
                        parseInt(text) || new Date().getFullYear(),
                    }))
                  }
                  placeholder="2024"
                  placeholderTextColor="#8a9a8a"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Vos spécialités * (sélectionnez au moins une)
                </Text>
                <View style={styles.specialtiesGrid}>
                  {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.specialtyChip,
                        artisanForm.specialties.includes(category) &&
                          styles.specialtyChipSelected,
                      ]}
                      onPress={() =>
                        handleSpecialtyToggle(category as CreationCategory)
                      }
                    >
                      <Text
                        style={[
                          styles.specialtyText,
                          artisanForm.specialties.includes(category) &&
                            styles.specialtyTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={
                  capabilities.canCreateProducts
                    ? handleUpdateArtisanProfile
                    : handleUpgradeToArtisan
                }
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading
                    ? "Enregistrement..."
                    : capabilities.canCreateProducts
                    ? "Mettre à jour le profil artisan"
                    : "Devenir Artisan"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#7a8a7a",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    backgroundColor: "#d4a574",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4a5c4a",
  },
  tabText: {
    fontSize: 14,
    color: "#8a9a8a",
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: "#4a5c4a",
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 16,
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#7a8a7a",
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 8,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e8e9e8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#4a5c4a",
    fontFamily: "System",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#4a5c4a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "rgba(74, 92, 74, 0.25)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#3d4f3d",
  },
  buttonDisabled: {
    backgroundColor: "#8a9a8a",
    elevation: 1,
    shadowOpacity: 0.1,
  },
  primaryButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e8e9e8",
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  specialtyChipSelected: {
    backgroundColor: "#4a5c4a",
    borderColor: "#4a5c4a",
  },
  specialtyText: {
    fontSize: 14,
    color: "#7a8a7a",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  specialtyTextSelected: {
    color: "#fafaf9",
  },
  accountSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e8e9e8",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#e8e9e8",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7a8a7a",
    width: 80,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 14,
    color: "#4a5c4a",
    flex: 1,
    fontFamily: "System",
    letterSpacing: 0.2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#e8e9e8",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a5c4a",
    marginBottom: 4,
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 12,
    color: "#7a8a7a",
    textTransform: "uppercase",
    fontFamily: "System",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#7a8a7a",
    textAlign: "center",
    padding: 20,
    fontFamily: "System",
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: "#4a5c4a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: "rgba(74, 92, 74, 0.25)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#3d4f3d",
  },
  loginButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  backToHomeButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4a5c4a",
    alignSelf: "flex-start",
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backToHomeText: {
    color: "#4a5c4a",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  charCount: {
    fontSize: 12,
    color: "#8a9a8a",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
});
