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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { validateArtisanProfile, getUserDisplayName } from "../utils/userUtils";
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
    setLoading(true);
    try {
      await updateProfile(userForm);
      Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToArtisan = async () => {
    const errors = validateArtisanProfile(artisanForm);
    if (errors.length > 0) {
      Alert.alert("Erreurs de validation", errors.join("\n"));
      return;
    }

    setLoading(true);
    try {
      await upgradeToArtisan(artisanForm);
      Alert.alert(
        "Félicitations !",
        "Votre compte artisan a été créé avec succès.",
        [{ text: "OK" }]
      );
      setActiveTab("artisan");
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la création de votre profil artisan."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArtisanProfile = async () => {
    const errors = validateArtisanProfile(artisanForm);
    if (errors.length > 0) {
      Alert.alert("Erreurs de validation", errors.join("\n"));
      return;
    }

    setLoading(true);
    try {
      await updateArtisanProfile(artisanForm);
      Alert.alert("Succès", "Profil artisan mis à jour avec succès");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil artisan");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.navigate("Home");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
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
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.welcomeText}>
          Bonjour {getUserDisplayName(user)} !
        </Text>

        {capabilities.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Artisan Vérifié</Text>
          </View>
        )}
      </View>

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
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Mise à jour..." : "Mettre à jour le profil"}
            </Text>
          </TouchableOpacity>

          {/* Section compte */}
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Gestion du compte</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email :</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.tabContent}>
          {!capabilities.canCreateProducts ? (
            // Section "Devenir Artisan"
            <>
              <Text style={styles.sectionTitle}>Devenir Artisan</Text>
              <Text style={styles.sectionDescription}>
                Créez votre profil artisan pour commencer à vendre vos créations
                sur TerraCréa
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
            <Text style={styles.label}>Nom de votre entreprise/atelier *</Text>
            <TextInput
              style={styles.input}
              value={artisanForm.businessName}
              onChangeText={(text) =>
                setArtisanForm((prev) => ({ ...prev, businessName: text }))
              }
              placeholder="Ex: Atelier du Bois"
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description de votre activité *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={artisanForm.description}
              onChangeText={(text) =>
                setArtisanForm((prev) => ({ ...prev, description: text }))
              }
              placeholder="Décrivez votre passion, votre savoir-faire, votre histoire..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Année de création</Text>
            <TextInput
              style={styles.input}
              value={artisanForm.establishedYear.toString()}
              onChangeText={(text) =>
                setArtisanForm((prev) => ({
                  ...prev,
                  establishedYear: parseInt(text) || new Date().getFullYear(),
                }))
              }
              placeholder="2024"
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
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={
              capabilities.canCreateProducts
                ? handleUpdateArtisanProfile
                : handleUpgradeToArtisan
            }
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Enregistrement..."
                : capabilities.canCreateProducts
                ? "Mettre à jour le profil artisan"
                : "Devenir Artisan"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#6c757d",
  },
  verifiedBadge: {
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007bff",
  },
  tabText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007bff",
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
  },
  specialtyChipSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  specialtyText: {
    fontSize: 14,
    color: "#6c757d",
  },
  specialtyTextSelected: {
    color: "#fff",
  },
  accountSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    flex: 1,
  },
  signOutButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  signOutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    padding: 20,
  },
  loginButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
