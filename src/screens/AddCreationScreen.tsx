import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { CommonHeader, CommonInput } from "../components";
import { CreationCategory, CATEGORY_LABELS } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import * as ImagePicker from "expo-image-picker";
import { COLORS, inputStyles, modalStyles } from "../utils";
import { commonMaterials, commonTags } from "../../assets/data";

type AddCreationScreenNavigationProp = ScreenNavigationProp<"AddCreation">;

export const AddCreationScreen = () => {
  const navigation = useNavigation<AddCreationScreenNavigationProp>();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);
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

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: CreationCategory.OTHER,
    materials: [] as string[],
    tags: [] as string[],
    photo: null as string | null,
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  // État pour les catégories depuis la base de données
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    []
  );

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "title":
        if (!value.trim()) return "Le titre est requis";
        if (value.length < 3)
          return "Le titre doit contenir au moins 3 caractères";
        if (value.length > 100)
          return "Le titre ne peut pas dépasser 100 caractères";
        return "";
      case "description":
        if (!value.trim()) return "La description est requise";
        if (value.length < 20)
          return "La description doit contenir au moins 20 caractères";
        if (value.length > 1000)
          return "La description ne peut pas dépasser 1000 caractères";
        return "";
      case "price":
        if (!value.trim()) return "Le prix est requis";
        const price = parseFloat(value);
        if (isNaN(price)) return "Le prix doit être un nombre valide";
        if (price <= 0) return "Le prix doit être supérieur à 0";
        if (price > 10000) return "Le prix ne peut pas dépasser 10 000€";
        return "";
      default:
        return "";
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const addMaterial = () => {
    if (form.materials.length >= 6) {
      setNotification({
        visible: true,
        title: "Limite atteinte",
        message: "Vous ne pouvez pas ajouter plus de 6 matériaux",
        type: "warning",
      });
      return;
    }
    if (
      materialInput.trim() &&
      !form.materials.includes(materialInput.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()],
      }));
      setMaterialInput("");
    }
  };

  const removeMaterial = (material: string) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m !== material),
    }));
  };

  const addTag = () => {
    if (form.tags.length >= 8) {
      setNotification({
        visible: true,
        title: "Limite atteinte",
        message: "Vous ne pouvez pas ajouter plus de 8 tags",
        type: "warning",
      });
      return;
    }
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const [materialInput, setMaterialInput] = useState("");
  const [tagInput, setTagInput] = useState("");

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

  const handleAddPhoto = async () => {
    // Gestion spécifique pour le web
    if (Platform.OS === "web") {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              const imageUri = e.target.result;
              setForm((prev) => ({ ...prev, photo: imageUri }));
              setNotification({
                visible: true,
                title: "✅ Photo ajoutée !",
                message: "Votre photo a été ajoutée avec succès",
                type: "success",
              });
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      } catch (error) {
        setNotification({
          visible: true,
          title: "❌ Erreur Web",
          message: "Impossible de sélectionner la photo sur le web.",
          type: "error",
        });
        return;
      }
    }

    // Code mobile (existant)
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setNotification({
          visible: true,
          title: "❌ Permission refusée",
          message:
            "Nous avons besoin de votre permission pour accéder à votre galerie",
          type: "error",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setForm((prev) => ({ ...prev, photo: imageUri }));
        setNotification({
          visible: true,
          title: "✅ Photo ajoutée !",
          message: "Votre photo a été ajoutée avec succès",
          type: "success",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible d'ajouter la photo. Veuillez réessayer.",
        type: "error",
      });
    }
  };

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photo: null }));
  };

  const validateForm = () => {
    const newErrors = {
      title: validateField("title", form.title),
      description: validateField("description", form.description),
      price: validateField("price", form.price),
      category: "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setNotification({
        visible: true,
        title: "⚠️ Erreurs de validation",
        message: "Veuillez corriger les erreurs dans le formulaire",
        type: "warning",
      });
      return;
    }

    if (!user?.id) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Vous devez être connecté pour créer une création",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = form.photo;

      if (form.photo && !form.photo.includes("supabase.co")) {
        try {
          const fileName = `creation_${Date.now()}.jpg`;
          imageUrl = await CreationsApi.uploadCreationImage(
            form.photo,
            fileName
          );
        } catch (uploadError) {
          imageUrl = null;
        }
      }

      // Vérifier que l'utilisateur est connecté et a un ID
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }

      const creationData: {
        title: string;
        description: string;
        price: number;
        category: CreationCategory;
        materials: string[];
        tags: string[];
        artisanId: string;
        imageUrl?: string;
      } = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        artisanId: user.id,
        materials: form.materials || [],
        ...(imageUrl && { imageUrl }), // N'inclure imageUrl que s'il n'est pas null
        tags: form.tags || [],
      };

      await CreationsApi.createCreation(creationData);

      let successMessage = "Votre création a été ajoutée avec succès";
      if (imageUrl) {
        successMessage += " (avec image)";
      } else if (form.photo && !form.photo.includes("supabase.co")) {
        successMessage += " (sans image - upload échoué)";
      }

      setNotification({
        visible: true,
        title: "✅ Création ajoutée !",
        message: successMessage,
        type: "success",
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      let errorMessage =
        "Impossible d'ajouter la création. Veuillez réessayer.";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Erreur de validation. Vérifiez vos informations.";
        } else if (error.message.includes("401")) {
          errorMessage = "Vous devez être connecté pour créer une création.";
        } else if (error.message.includes("403")) {
          errorMessage =
            "Vous n'avez pas les permissions pour créer une création.";
        } else if (error.message.includes("500")) {
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
        } else {
          errorMessage = error.message;
        }
      }

      setNotification({
        visible: true,
        title: "❌ Erreur",
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
            Vous devez être connecté pour créer une création.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user.isArtisan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Vous devez être artisan pour créer une création.
          </Text>
          <TouchableOpacity
            style={[styles.submitButton, { marginTop: 20 }]}
            onPress={() => navigation.navigate("Profil")}
          >
            <Text style={styles.submitButtonText}>Devenir artisan</Text>
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

      <CommonHeader
        title="Nouvelle Création"
        onBack={() => navigation.goBack()}
        backLabel="Annuler"
        rightButton={{
          text: "Sauvegarder",
          onPress: handleSubmit,
          loading: loading,
          disabled: loading,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
          Informations de base
        </Text>

        <CommonInput
          label="Titre de la création *"
          value={form.title}
          onChangeText={(text) => updateForm("title", text)}
          placeholder="Ex: Vase en céramique unique"
          maxLength={100}
          error={errors.title}
        />

        <CommonInput
          label="Description *"
          value={form.description}
          onChangeText={(text) => updateForm("description", text)}
          placeholder="Décrivez votre création, son histoire, ses caractéristiques..."
          multiline
          numberOfLines={4}
          maxLength={1000}
          style={inputStyles.textArea}
          charCount={{ current: form.description.length, max: 1000 }}
          error={errors.description}
        />

        <CommonInput
          label="Prix (€) *"
          value={form.price}
          onChangeText={(text) => updateForm("price", text)}
          placeholder="29.99"
          keyboardType="numeric"
          error={errors.price}
        />

        <View style={inputStyles.container}>
          <Text style={inputStyles.label}>Catégorie *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {categories.find((cat) => cat.id === form.category)?.label ||
                CATEGORY_LABELS[form.category]}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Photo de la création</Text>
        <View style={inputStyles.container}>
          {form.photo ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: form.photo }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={removePhoto}
              >
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
            >
              <Text style={styles.addPhotoText}>📷 Ajouter une photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Matériaux utilisés</Text>
        <View style={inputStyles.container}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowMaterialsModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {form.materials.length > 0
                ? `${form.materials.length} matériau(x) sélectionné(s)`
                : "Sélectionner des matériaux"}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {form.materials.length > 0 && (
            <View style={styles.itemsList}>
              {form.materials.map((material, index) => (
                <View key={index} style={styles.itemChip}>
                  <Text style={styles.itemText}>{material}</Text>
                  <TouchableOpacity
                    onPress={() => removeMaterial(material)}
                    style={styles.removeItemButton}
                  >
                    <Text style={styles.removeItemText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={inputStyles.container}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTagsModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {form.tags.length > 0
                ? `${form.tags.length} tag(s) sélectionné(s)`
                : "Sélectionner des tags"}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
          {form.tags.length > 0 && (
            <View style={styles.itemsList}>
              {form.tags.map((tag, index) => (
                <View key={index} style={styles.itemChip}>
                  <Text style={styles.itemText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => removeTag(tag)}
                    style={styles.removeItemButton}
                  >
                    <Text style={styles.removeItemText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Création en cours..." : "Créer ma création"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modale de sélection de catégorie */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.category === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setForm((prev) => ({
                      ...prev,
                      category: item.id as CreationCategory,
                    }));
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.category === item.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modale de sélection de matériaux */}
      <Modal
        visible={showMaterialsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMaterialsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner des matériaux</Text>
              <TouchableOpacity
                onPress={() => setShowMaterialsModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={commonMaterials}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.materials.includes(item) && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    if (form.materials.includes(item)) {
                      removeMaterial(item);
                    } else {
                      setForm((prev) => ({
                        ...prev,
                        materials: [...prev.materials, item],
                      }));
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.materials.includes(item) &&
                        styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.materials.includes(item) && (
                    <Text style={styles.modalItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modale de sélection de tags */}
      <Modal
        visible={showTagsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner des tags</Text>
              <TouchableOpacity
                onPress={() => setShowTagsModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={commonTags}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    form.tags.includes(item) && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    if (form.tags.includes(item)) {
                      removeTag(item);
                    } else {
                      setForm((prev) => ({
                        ...prev,
                        tags: [...prev.tags, item],
                      }));
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.tags.includes(item) && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.tags.includes(item) && (
                    <Text style={styles.modalItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4a5c4a",
    marginTop: 28,
    marginBottom: 16,
    fontFamily: "System",
  },
  selectButton: {
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
  selectButtonText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontFamily: "System",
  },
  selectArrow: {
    fontSize: 12,
    color: "#8a9a8a",
    fontFamily: "System",
  },
  itemsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  itemChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a5c4a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "System",
    marginRight: 6,
    fontWeight: "500",
  },
  removeItemButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeItemText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "System",
    lineHeight: 13,
    textAlign: "center",
  },
  submitContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: "#4a5c4a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "rgba(74, 92, 74, 0.25)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#8a9a8a",
    elevation: 1,
  },
  submitButtonText: {
    color: "#fafaf9",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
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
    fontFamily: "System",
  },
  photoContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    borderRadius: 12,
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e8e9e8",
  },
  removePhotoButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "System",
    lineHeight: 18,
    textAlign: "center",
  },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: "#e8e9e8",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  addPhotoText: {
    fontSize: 16,
    color: "#8a9a8a",
    fontFamily: "System",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5c4a",
    fontFamily: "System",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 18,
    color: "#8a9a8a",
    fontFamily: "System",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemSelected: {
    backgroundColor: "#f8f9fa",
  },
  modalItemText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontFamily: "System",
  },
  modalItemTextSelected: {
    color: "#4a5c4a",
    fontWeight: "500",
  },
  modalItemCheck: {
    fontSize: 16,
    color: "#4a5c4a",
    fontWeight: "600",
    fontFamily: "System",
  },
});
