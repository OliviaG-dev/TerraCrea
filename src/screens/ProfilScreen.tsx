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
import { CommonInput, CommonButton } from "../components";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import {
  validateArtisanProfile,
  validateUserProfile,
  getUserDisplayName,
} from "../utils/userUtils";
import { CATEGORY_LABELS, CreationCategory } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { COLORS, inputStyles, buttonStyles } from "../utils";

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

// Composant pour un champ éditable
const EditableField = ({
  label,
  field,
  value,
  placeholder,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  error,
  multiline = false,
  maxLength,
}: {
  label: string;
  field: string;
  value: string;
  placeholder: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
}) => {
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    if (tempValue.trim() !== value) {
      onSave(tempValue);
    }
    onCancel();
  };

  const handleCancel = () => {
    setTempValue(value);
    onCancel();
  };

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (isEditing) {
    return (
      <View style={inputStyles.container}>
        <CommonInput
          label={label}
          value={tempValue}
          onChangeText={setTempValue}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          maxLength={maxLength}
          error={error}
          charCount={
            maxLength
              ? { current: tempValue.length, max: maxLength }
              : undefined
          }
          style={multiline ? inputStyles.textArea : undefined}
        />
        <View style={styles.editActions}>
          <CommonButton
            title="Sauvegarder"
            variant="primary"
            onPress={handleSave}
            style={styles.editButton}
          />
          <CommonButton
            title="Annuler"
            variant="secondary"
            onPress={handleCancel}
            style={styles.editButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.editableField}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        <Text style={styles.editableText}>{value || placeholder}</Text>
        <Text style={styles.editText}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );
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
    case "phone":
      if (value && value.toString().trim()) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value.toString().trim())) {
          return "Format de téléphone invalide";
        }
      }
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
    phone: "",
  });

  // État pour les erreurs du profil artisan
  const [artisanErrors, setArtisanErrors] = useState({
    businessName: "",
    location: "",
    description: "",
    establishedYear: "",
    specialties: "",
    phone: "",
  });

  // Clé pour forcer le re-rendu des formulaires
  const [formKey, setFormKey] = useState(0);

  // État pour gérer l'édition des champs
  const [editingField, setEditingField] = useState<string | null>(null);

  // État pour les catégories depuis la base de données
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    []
  );

  // Charger les catégories depuis la base de données
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await CreationsApi.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        // Fallback vers les catégories du frontend
        setCategories(
          Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }))
        );
      }
    };

    loadCategories();
  }, []);

  // Initialiser les formulaires avec les données utilisateur existantes
  useEffect(() => {
    if (user && user.id) {
      // Vérifier que l'utilisateur est complètement chargé
      // Initialiser le formulaire utilisateur
      const newUserForm = {
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
      };
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
          phone: user.artisanProfile.phone || "",
        };
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

  // Fonctions pour gérer l'édition des champs
  const handleEditField = (field: string) => {
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleSaveField = (field: string, value: string) => {
    updateUserForm(field, value);
    setEditingField(null);
  };

  const handleSaveArtisanField = (field: string, value: string | number) => {
    updateArtisanForm(field, value);
    setEditingField(null);
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
      // Vérifier si l'utilisateur a déjà un profil artisan
      const hasArtisanProfile =
        user?.artisanProfile ||
        user?.user_metadata?.isArtisan ||
        user?.isArtisan;

      if (hasArtisanProfile) {
        // Mise à jour du profil existant
        await updateArtisanProfile(artisanForm);
        setNotification({
          visible: true,
          title: "✅ Profil artisan mis à jour !",
          message: "Vos informations d'artisan ont été modifiées avec succès.",
          type: "success",
        });
      } else {
        // Création d'un nouveau profil
        await upgradeToArtisan(artisanForm);
        setNotification({
          visible: true,
          title: "🎉 Félicitations !",
          message:
            "Votre compte artisan a été créé avec succès. Vous pouvez maintenant commencer à vendre vos créations !",
          type: "success",
        });
        setActiveTab("artisan");
      }

      // Forcer le rafraîchissement de l'état utilisateur
      setTimeout(() => {
        // Recharger la page ou forcer la mise à jour
        setFormKey((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      // Vérifier à nouveau dans le catch pour l'erreur
      const hasArtisanProfile =
        user?.artisanProfile ||
        user?.user_metadata?.isArtisan ||
        user?.isArtisan;
      const { errorTitle, errorMessage } = handleError(
        error,
        hasArtisanProfile ? "de mise à jour" : "de création"
      );
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
            {(capabilities.canCreateProducts ||
              user?.user_metadata?.isArtisan ||
              user?.isArtisan) &&
              !capabilities.isVerified && (
                <View style={styles.artisanBadge}>
                  <Text style={styles.artisanBadgeText}>🎨 Artisan</Text>
                </View>
              )}
          </View>

          {/* Boutons de navigation */}
          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity
              style={styles.backToHomeButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.backToHomeText}>← Retour à l'accueil</Text>
            </TouchableOpacity>

            {(capabilities.canCreateProducts ||
              user?.user_metadata?.isArtisan ||
              user?.isArtisan) && (
              <TouchableOpacity
                style={styles.myCreationsButton}
                onPress={() => navigation.navigate("Creations")}
              >
                <Text style={styles.myCreationsText}>🎨 Mes Créations</Text>
              </TouchableOpacity>
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
                {capabilities.canCreateProducts ||
                user?.user_metadata?.isArtisan ||
                user?.isArtisan
                  ? "Profil Artisan"
                  : "Devenir Artisan"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenu selon l'onglet actif */}
          {activeTab === "profil" ? (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>

              <EditableField
                label="Nom d'utilisateur"
                field="username"
                value={userForm.username}
                placeholder="Votre nom d'utilisateur"
                isEditing={editingField === "username"}
                onEdit={() => handleEditField("username")}
                onSave={(value) => handleSaveField("username", value)}
                onCancel={handleCancelEdit}
                error={userErrors.username}
              />

              <EditableField
                label="Prénom"
                field="firstName"
                value={userForm.firstName}
                placeholder="Votre prénom"
                isEditing={editingField === "firstName"}
                onEdit={() => handleEditField("firstName")}
                onSave={(value) => handleSaveField("firstName", value)}
                onCancel={handleCancelEdit}
                error={userErrors.firstName}
              />

              <EditableField
                label="Nom"
                field="lastName"
                value={userForm.lastName}
                placeholder="Votre nom"
                isEditing={editingField === "lastName"}
                onEdit={() => handleEditField("lastName")}
                onSave={(value) => handleSaveField("lastName", value)}
                onCancel={handleCancelEdit}
                error={userErrors.lastName}
              />

              <EditableField
                label="Bio"
                field="bio"
                value={userForm.bio}
                placeholder="Parlez-nous de vous..."
                isEditing={editingField === "bio"}
                onEdit={() => handleEditField("bio")}
                onSave={(value) => handleSaveField("bio", value)}
                onCancel={handleCancelEdit}
                error={userErrors.bio}
                multiline={true}
                maxLength={500}
              />

              <CommonButton
                title={loading ? "Mise à jour..." : "Mettre à jour le profil"}
                variant="primary"
                onPress={handleUpdateProfile}
                loading={loading}
                disabled={loading}
                style={styles.primaryButton}
              />

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
              {!(
                capabilities.canCreateProducts ||
                user?.user_metadata?.isArtisan ||
                user?.isArtisan
              ) ? (
                // Section "Devenir Artisan"
                <>
                  <Text style={styles.sectionTitle}>Devenir Artisan</Text>
                  <Text style={styles.sectionDescription}>
                    Transformez votre passion en activité ! Créez votre profil
                    artisan pour commencer à vendre vos créations uniques sur
                    TerraCréa et rejoindre notre communauté d'artisans
                    talentueux.
                  </Text>
                </>
              ) : (
                // Section "Profil Artisan"
                <>
                  <Text style={styles.sectionTitle}>Votre Profil Artisan</Text>
                  <Text style={styles.sectionDescription}>
                    Gérez vos informations d'artisan et vos créations. Modifiez
                    vos détails pour améliorer votre visibilité auprès des
                    acheteurs.
                  </Text>
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
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>
                        {user.artisanProfile?.specialties?.length || 0}
                      </Text>
                      <Text style={styles.statLabel}>Spécialités</Text>
                    </View>
                  </View>
                </>
              )}

              {/* Formulaire artisan */}
              <EditableField
                label="Nom de votre entreprise/atelier *"
                field="businessName"
                value={artisanForm.businessName}
                placeholder="Ex: Atelier du Bois"
                isEditing={editingField === "businessName"}
                onEdit={() => handleEditField("businessName")}
                onSave={(value) =>
                  handleSaveArtisanField("businessName", value)
                }
                onCancel={handleCancelEdit}
                error={artisanErrors.businessName}
              />

              <EditableField
                label="Localisation *"
                field="location"
                value={artisanForm.location}
                placeholder="Ex: Lyon, France"
                isEditing={editingField === "location"}
                onEdit={() => handleEditField("location")}
                onSave={(value) => handleSaveArtisanField("location", value)}
                onCancel={handleCancelEdit}
                error={artisanErrors.location}
              />

              <EditableField
                label="Description de votre activité *"
                field="description"
                value={artisanForm.description}
                placeholder="Décrivez votre passion, votre savoir-faire, votre histoire..."
                isEditing={editingField === "description"}
                onEdit={() => handleEditField("description")}
                onSave={(value) => handleSaveArtisanField("description", value)}
                onCancel={handleCancelEdit}
                error={artisanErrors.description}
                multiline={true}
                maxLength={1000}
              />

              <EditableField
                label="Année de création"
                field="establishedYear"
                value={artisanForm.establishedYear.toString()}
                placeholder="2024"
                isEditing={editingField === "establishedYear"}
                onEdit={() => handleEditField("establishedYear")}
                onSave={(value) =>
                  handleSaveArtisanField(
                    "establishedYear",
                    parseInt(value) || new Date().getFullYear()
                  )
                }
                onCancel={handleCancelEdit}
                error={artisanErrors.establishedYear}
              />

              <EditableField
                label="Téléphone"
                field="phone"
                value={artisanForm.phone}
                placeholder="Ex: +33 6 12 34 56 78"
                isEditing={editingField === "phone"}
                onEdit={() => handleEditField("phone")}
                onSave={(value) => handleSaveArtisanField("phone", value)}
                onCancel={handleCancelEdit}
                error={artisanErrors.phone}
              />

              <View style={inputStyles.container}>
                <Text style={inputStyles.label}>
                  Vos spécialités * (sélectionnez au moins une)
                </Text>
                <View style={styles.specialtiesGrid}>
                  {categories.map(({ id, label }) => (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.specialtyChip,
                        artisanForm.specialties.includes(id) &&
                          styles.specialtyChipSelected,
                      ]}
                      onPress={() =>
                        handleSpecialtyToggle(id as CreationCategory)
                      }
                    >
                      <Text
                        style={[
                          styles.specialtyText,
                          artisanForm.specialties.includes(id) &&
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

              <CommonButton
                title={
                  loading
                    ? "Enregistrement..."
                    : capabilities.canCreateProducts ||
                      user?.user_metadata?.isArtisan ||
                      user?.isArtisan
                    ? "Mettre à jour le profil artisan"
                    : "Devenir Artisan"
                }
                variant="primary"
                onPress={
                  capabilities.canCreateProducts
                    ? handleUpdateArtisanProfile
                    : handleUpgradeToArtisan
                }
                loading={loading}
                disabled={loading}
                style={styles.primaryButton}
              />
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
    width: "100%",
  },
  content: {
    padding: 20,
    width: "100%",
  },
  welcomeSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#7a8a7a",
    fontFamily: "System",
    letterSpacing: 0.3,
    textAlign: "center",
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
  artisanBadge: {
    backgroundColor: "#ff6b35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "center",
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  artisanBadgeText: {
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
    width: "100%",
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
  primaryButton: {
    marginTop: 10,
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
    color: COLORS.danger,
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
  navigationButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  backToHomeButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4a5c4a",
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
  myCreationsButton: {
    backgroundColor: "#ff6b35",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  myCreationsText: {
    color: "#fff",
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
  editableField: {
    borderWidth: 1.5,
    borderColor: "#e8e9e8",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  editableText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontFamily: "System",
    flex: 1,
  },
  editableContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  editText: {
    fontSize: 14,
    color: "#4a5c4a",
    fontFamily: "System",
    fontWeight: "500",
    opacity: 0.7,
  },
  editIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4a5c4a",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
});
