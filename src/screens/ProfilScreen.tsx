import React, { useState, useEffect } from "react";
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
import { NotificationToast } from "../components/NotificationToast";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import {
  validateArtisanProfile,
  validateUserProfile,
  getUserDisplayName,
} from "../utils/userUtils";
import { CATEGORY_LABELS, CreationCategory } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";

// Fonction utilitaire pour gérer les erreurs
const handleError = (error: unknown, context: string) => {
  let errorTitle = `❌ Erreur ${context}`;
  let errorMessage = "Une erreur inconnue est survenue";

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("utilisateur non connecté")) {
      errorTitle = "🔐 Session expirée";
      errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
    } else if (message.includes("email")) {
      errorTitle = "📧 Erreur email";
      errorMessage =
        "Problème avec votre adresse email. Vérifiez qu'elle est valide.";
    } else if (
      message.includes("business_name") ||
      message.includes("location")
    ) {
      errorTitle = "📝 Informations manquantes";
      errorMessage = "Veuillez remplir tous les champs obligatoires.";
    } else if (message.includes("specialties")) {
      errorTitle = "🏷️ Spécialités requises";
      errorMessage = "Veuillez sélectionner au moins une spécialité.";
    } else if (message.includes("network") || message.includes("fetch")) {
      errorTitle = "🌐 Erreur de connexion";
      errorMessage =
        "Problème de connexion internet. Vérifiez votre connexion et réessayez.";
    } else if (message.includes("timeout")) {
      errorTitle = "⏰ Délai dépassé";
      errorMessage = "La requête a pris trop de temps. Veuillez réessayer.";
    } else if (
      message.includes("permission") ||
      message.includes("unauthorized")
    ) {
      errorTitle = "🚫 Accès refusé";
      errorMessage =
        "Vous n'avez pas les permissions nécessaires pour cette action.";
    } else if (
      message.includes("already exists") ||
      message.includes("duplicate")
    ) {
      errorTitle = "⚠️ Profil existant";
      errorMessage =
        "Vous avez déjà un profil artisan. Utilisez l'onglet 'Profil Artisan' pour le modifier.";
    } else if (
      message.includes("not found") ||
      message.includes("doesn't exist")
    ) {
      errorTitle = "🔍 Profil introuvable";
      errorMessage =
        "Votre profil artisan n'existe pas. Créez d'abord votre profil artisan.";
    } else {
      errorMessage = `Erreur technique : ${error.message}`;
    }
  }

  return { errorTitle, errorMessage };
};

// Fonction de validation en temps réel pour le profil utilisateur
const validateUserField = (field: string, value: string) => {
  switch (field) {
    case "username":
      if (!value.trim()) return "Le nom d'utilisateur est requis";
      if (value.length < 3)
        return "Le nom d'utilisateur doit contenir au moins 3 caractères";
      if (value.length > 20)
        return "Le nom d'utilisateur ne peut pas dépasser 20 caractères";
      if (!/^[a-zA-Z0-9_]+$/.test(value))
        return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores";
      return "";
    case "firstName":
      if (!value.trim()) return "Le prénom est requis";
      if (value.length < 2)
        return "Le prénom doit contenir au moins 2 caractères";
      if (value.length > 30)
        return "Le prénom ne peut pas dépasser 30 caractères";
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value))
        return "Le prénom ne peut contenir que des lettres";
      return "";
    case "lastName":
      if (!value.trim()) return "Le nom est requis";
      if (value.length < 2) return "Le nom doit contenir au moins 2 caractères";
      if (value.length > 30) return "Le nom ne peut pas dépasser 30 caractères";
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value))
        return "Le nom ne peut contenir que des lettres";
      return "";
    case "bio":
      if (value.length > 500)
        return "La bio ne peut pas dépasser 500 caractères";
      return "";
    default:
      return "";
  }
};

// Fonction de validation en temps réel pour le profil artisan
const validateArtisanField = (
  field: string,
  value: string | number | string[]
) => {
  switch (field) {
    case "businessName":
      if (!value || !value.toString().trim())
        return "Le nom de l'entreprise est requis";
      if (value.toString().length < 3)
        return "Le nom de l'entreprise doit contenir au moins 3 caractères";
      if (value.toString().length > 50)
        return "Le nom de l'entreprise ne peut pas dépasser 50 caractères";
      return "";
    case "location":
      if (!value || !value.toString().trim())
        return "La localisation est requise";
      if (value.toString().length < 3)
        return "La localisation doit contenir au moins 3 caractères";
      if (value.toString().length > 100)
        return "La localisation ne peut pas dépasser 100 caractères";
      return "";
    case "description":
      if (!value || !value.toString().trim())
        return "La description est requise";
      if (value.toString().length < 20)
        return "La description doit contenir au moins 20 caractères";
      if (value.toString().length > 1000)
        return "La description ne peut pas dépasser 1000 caractères";
      return "";
    case "establishedYear":
      const year = parseInt(value.toString());
      const currentYear = new Date().getFullYear();
      if (isNaN(year)) return "L'année doit être un nombre valide";
      if (year < 1900) return "L'année ne peut pas être antérieure à 1900";
      if (year > currentYear) return "L'année ne peut pas être dans le futur";
      return "";
    case "specialties":
      if (!Array.isArray(value) || value.length === 0)
        return "Veuillez sélectionner au moins une spécialité";
      return "";
    default:
      return "";
  }
};

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
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // État pour le profil utilisateur
  const [userForm, setUserForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
  });

  // État pour les erreurs du profil utilisateur
  const [userErrors, setUserErrors] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
  });

  // État pour le profil artisan
  const [artisanForm, setArtisanForm] = useState({
    businessName: "",
    location: "",
    description: "",
    establishedYear: new Date().getFullYear(),
    specialties: [] as string[],
  });

  // État pour les erreurs du profil artisan
  const [artisanErrors, setArtisanErrors] = useState({
    businessName: "",
    location: "",
    description: "",
    establishedYear: "",
    specialties: "",
  });

  // Clé pour forcer le re-rendu des formulaires
  const [formKey, setFormKey] = useState(0);

  // Initialiser les formulaires avec les données utilisateur existantes
  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    if (user && user.id) {
      // Vérifier que l'utilisateur est complètement chargé
      console.log("User data:", {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        artisanProfile: user.artisanProfile,
      });

      // Initialiser le formulaire utilisateur
      const newUserForm = {
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
      };
      console.log("Setting userForm:", newUserForm);
      setUserForm(newUserForm);

      // Initialiser le formulaire artisan si l'utilisateur a un profil artisan
      if (user.artisanProfile) {
        const newArtisanForm = {
          businessName: user.artisanProfile.businessName || "",
          location: user.artisanProfile.location || "",
          description: user.artisanProfile.description || "",
          establishedYear:
            user.artisanProfile.establishedYear || new Date().getFullYear(),
          specialties: user.artisanProfile.specialties || [],
        };
        console.log("Setting artisanForm:", newArtisanForm);
        setArtisanForm(newArtisanForm);
      }

      // Forcer le re-rendu des formulaires
      setFormKey((prev) => prev + 1);
    }
  }, [user]);

  // Fonction pour mettre à jour le formulaire utilisateur avec validation
  const updateUserForm = (field: string, value: string) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    const error = validateUserField(field, value);
    setUserErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Fonction pour mettre à jour le formulaire artisan avec validation
  const updateArtisanForm = (
    field: string,
    value: string | number | string[]
  ) => {
    setArtisanForm((prev) => ({ ...prev, [field]: value }));
    const error = validateArtisanField(field, value);
    setArtisanErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSpecialtyToggle = (category: CreationCategory) => {
    const categoryValue = category as string;
    const newSpecialties = artisanForm.specialties.includes(categoryValue)
      ? artisanForm.specialties.filter((s) => s !== categoryValue)
      : [...artisanForm.specialties, categoryValue];

    updateArtisanForm("specialties", newSpecialties);
  };

  const handleUpdateProfile = async () => {
    // Validation des données avant envoi
    const errors = validateUserProfile(userForm);
    if (errors.length > 0) {
      const errorMessage =
        errors.length === 1
          ? errors[0]
          : `Veuillez corriger les erreurs suivantes :\n${errors.join("\n")}`;

      setNotification({
        visible: true,
        title:
          errors.length === 1
            ? "⚠️ Erreur de validation"
            : "⚠️ Erreurs de validation",
        message: errorMessage,
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(userForm);
      setNotification({
        visible: true,
        title: "✅ Profil mis à jour !",
        message: "Vos informations personnelles ont été modifiées avec succès.",
        type: "success",
      });
    } catch (error) {
      const { errorTitle, errorMessage } = handleError(error, "de mise à jour");
      setNotification({
        visible: true,
        title: errorTitle,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToArtisan = async () => {
    const errors = validateArtisanProfile(artisanForm);
    if (errors.length > 0) {
      const errorMessage =
        errors.length === 1
          ? errors[0]
          : `Veuillez corriger les erreurs suivantes :\n${errors.join("\n")}`;

      setNotification({
        visible: true,
        title:
          errors.length === 1
            ? "⚠️ Erreur de validation"
            : "⚠️ Erreurs de validation",
        message: errorMessage,
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await upgradeToArtisan(artisanForm);
      setNotification({
        visible: true,
        title: "🎉 Félicitations !",
        message:
          "Votre compte artisan a été créé avec succès. Vous pouvez maintenant commencer à vendre vos créations !",
        type: "success",
      });
      setActiveTab("artisan");
    } catch (error) {
      const { errorTitle, errorMessage } = handleError(error, "de création");
      setNotification({
        visible: true,
        title: errorTitle,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArtisanProfile = async () => {
    const errors = validateArtisanProfile(artisanForm);
    if (errors.length > 0) {
      const errorMessage =
        errors.length === 1
          ? errors[0]
          : `Veuillez corriger les erreurs suivantes :\n${errors.join("\n")}`;

      setNotification({
        visible: true,
        title:
          errors.length === 1
            ? "⚠️ Erreur de validation"
            : "⚠️ Erreurs de validation",
        message: errorMessage,
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await updateArtisanProfile(artisanForm);
      setNotification({
        visible: true,
        title: "✅ Profil artisan mis à jour !",
        message: "Vos informations d'artisan ont été modifiées avec succès.",
        type: "success",
      });
    } catch (error) {
      const { errorTitle, errorMessage } = handleError(error, "de mise à jour");
      setNotification({
        visible: true,
        title: errorTitle,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug: afficher les valeurs actuelles des formulaires
  console.log("Current userForm:", userForm);
  console.log("Current artisanForm:", artisanForm);

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
      <NotificationToast
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        duration={4000}
      />
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
                  key={`username-${formKey}`}
                  style={[
                    styles.input,
                    userErrors.username && styles.inputError,
                  ]}
                  value={userForm.username}
                  onChangeText={(text) => updateUserForm("username", text)}
                  placeholder="Votre nom d'utilisateur"
                  placeholderTextColor="#8a9a8a"
                />
                {userErrors.username ? (
                  <Text style={styles.errorText}>{userErrors.username}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  key={`firstName-${formKey}`}
                  style={[
                    styles.input,
                    userErrors.firstName && styles.inputError,
                  ]}
                  value={userForm.firstName}
                  onChangeText={(text) => updateUserForm("firstName", text)}
                  placeholder="Votre prénom"
                  placeholderTextColor="#8a9a8a"
                />
                {userErrors.firstName ? (
                  <Text style={styles.errorText}>{userErrors.firstName}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  key={`lastName-${formKey}`}
                  style={[
                    styles.input,
                    userErrors.lastName && styles.inputError,
                  ]}
                  value={userForm.lastName}
                  onChangeText={(text) => updateUserForm("lastName", text)}
                  placeholder="Votre nom"
                  placeholderTextColor="#8a9a8a"
                />
                {userErrors.lastName ? (
                  <Text style={styles.errorText}>{userErrors.lastName}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  key={`bio-${formKey}`}
                  style={[
                    styles.input,
                    styles.textArea,
                    userErrors.bio && styles.inputError,
                  ]}
                  value={userForm.bio}
                  onChangeText={(text) => updateUserForm("bio", text)}
                  placeholder="Parlez-nous de vous..."
                  placeholderTextColor="#8a9a8a"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {userForm.bio.length}/500 caractères
                </Text>
                {userErrors.bio ? (
                  <Text style={styles.errorText}>{userErrors.bio}</Text>
                ) : null}
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
                  key={`businessName-${formKey}`}
                  style={[
                    styles.input,
                    artisanErrors.businessName && styles.inputError,
                  ]}
                  value={artisanForm.businessName}
                  onChangeText={(text) =>
                    updateArtisanForm("businessName", text)
                  }
                  placeholder="Ex: Atelier du Bois"
                  placeholderTextColor="#8a9a8a"
                />
                {artisanErrors.businessName ? (
                  <Text style={styles.errorText}>
                    {artisanErrors.businessName}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Localisation *</Text>
                <TextInput
                  key={`location-${formKey}`}
                  style={[
                    styles.input,
                    artisanErrors.location && styles.inputError,
                  ]}
                  value={artisanForm.location}
                  onChangeText={(text) => updateArtisanForm("location", text)}
                  placeholder="Ex: Lyon, France"
                  placeholderTextColor="#8a9a8a"
                />
                {artisanErrors.location ? (
                  <Text style={styles.errorText}>{artisanErrors.location}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Description de votre activité *
                </Text>
                <TextInput
                  key={`description-${formKey}`}
                  style={[
                    styles.input,
                    styles.textArea,
                    artisanErrors.description && styles.inputError,
                  ]}
                  value={artisanForm.description}
                  onChangeText={(text) =>
                    updateArtisanForm("description", text)
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
                {artisanErrors.description ? (
                  <Text style={styles.errorText}>
                    {artisanErrors.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Année de création</Text>
                <TextInput
                  key={`establishedYear-${formKey}`}
                  style={[
                    styles.input,
                    artisanErrors.establishedYear && styles.inputError,
                  ]}
                  value={artisanForm.establishedYear.toString()}
                  onChangeText={(text) =>
                    updateArtisanForm("establishedYear", text)
                  }
                  placeholder="2024"
                  placeholderTextColor="#8a9a8a"
                  keyboardType="numeric"
                />
                {artisanErrors.establishedYear ? (
                  <Text style={styles.errorText}>
                    {artisanErrors.establishedYear}
                  </Text>
                ) : null}
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
                {artisanErrors.specialties ? (
                  <Text style={styles.errorText}>
                    {artisanErrors.specialties}
                  </Text>
                ) : null}
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
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
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
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    fontFamily: "System",
    letterSpacing: 0.2,
    lineHeight: 16,
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
