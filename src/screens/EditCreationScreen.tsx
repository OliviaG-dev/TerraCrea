import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ImagePicker } from "expo-image-picker";
import { NotificationToast } from "../components/NotificationToast";
import { Creation, CreationCategory, CATEGORY_LABELS } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { COLORS } from "../utils/colors";

type EditCreationScreenNavigationProp = ScreenNavigationProp<"EditCreation">;

interface EditCreationScreenParams {
  creation: Creation;
}

export const EditCreationScreen = () => {
  const navigation = useNavigation<EditCreationScreenNavigationProp>();
  const route = useRoute();
  const { creation } = route.params as EditCreationScreenParams;

  const [form, setForm] = useState({
    title: creation.title,
    description: creation.description,
    price: creation.price.toString(),
    category: creation.category,
    materials: creation.materials.join(", "),
    tags: creation.tags.join(", "),
    photo: creation.imageUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    []
  );
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

  // Charger les catégories depuis la base de données
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await CreationsApi.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        // Fallback vers les catégories du frontend
        setCategories(
          Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }))
        );
      }
    };
    loadCategories();
  }, []);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setForm((prev) => ({
          ...prev,
          photo: result.assets[0].uri,
        }));
      }
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible d'accéder à la galerie",
        type: "error",
      });
    }
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.price.trim()) {
      setNotification({
        visible: true,
        title: "⚠️ Attention",
        message: "Veuillez remplir tous les champs obligatoires",
        type: "warning",
      });
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setNotification({
        visible: true,
        title: "⚠️ Attention",
        message: "Le prix doit être un nombre positif",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      // Préparer les données de mise à jour
      const updateData: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: price,
        category: form.category,
        materials: form.materials
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m.length > 0),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      };

      // Si une nouvelle photo a été sélectionnée, l'uploader
      if (
        form.photo &&
        form.photo !== creation.imageUrl &&
        !form.photo.startsWith("http")
      ) {
        try {
          const response = await fetch(form.photo);
          const blob = await response.blob();
          const fileName = `creation_${Date.now()}.jpg`;
          const imageUrl = await CreationsApi.uploadCreationImage(
            blob,
            fileName
          );
          updateData.imageUrl = imageUrl;
        } catch (error) {
          setNotification({
            visible: true,
            title: "❌ Erreur",
            message: "Impossible d'uploader l'image",
            type: "error",
          });
          setLoading(false);
          return;
        }
      }

      // Mettre à jour la création
      await CreationsApi.updateCreation(creation.id, updateData);

      setNotification({
        visible: true,
        title: "✅ Succès",
        message: "Votre création a été mise à jour avec succès",
        type: "success",
      });

      // Retourner à l'écran précédent après un délai
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible de mettre à jour la création",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({
    item,
  }: {
    item: { id: string; label: string };
  }) => (
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
  );

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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Annuler</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Modifier la création</Text>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Photo de la création</Text>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handleAddPhoto}
          >
            {form.photo ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: form.photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>📷</Text>
                <Text style={styles.photoPlaceholderSubtext}>
                  Ajouter une photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Titre */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Titre *</Text>
          <TextInput
            style={styles.textInput}
            value={form.title}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, title: text }))
            }
            placeholder="Nom de votre création"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={form.description}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, description: text }))
            }
            placeholder="Décrivez votre création..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Prix */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Prix (€) *</Text>
          <TextInput
            style={styles.textInput}
            value={form.price}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, price: text }))
            }
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
        </View>

        {/* Catégorie */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Catégorie *</Text>
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

        {/* Matériaux */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Matériaux</Text>
          <TextInput
            style={styles.textInput}
            value={form.materials}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, materials: text }))
            }
            placeholder="Bois, métal, céramique... (séparés par des virgules)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Tags */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Tags</Text>
          <TextInput
            style={styles.textInput}
            value={form.tags}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, tags: text }))
            }
            placeholder="artisanal, fait-main, unique... (séparés par des virgules)"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </ScrollView>

      {/* Modal de sélection de catégorie */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une catégorie</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: "#4a5c4a",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "System",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5c4a",
    fontFamily: "System",
  },
  saveButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 12,
    fontFamily: "System",
  },
  photoContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "System",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  photoPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderSubtext: {
    fontSize: 16,
    color: "#7a8a7a",
    fontFamily: "System",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 8,
    fontFamily: "System",
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8e9e8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#4a5c4a",
    fontFamily: "System",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8e9e8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontFamily: "System",
  },
  selectArrow: {
    fontSize: 16,
    color: "#7a8a7a",
    fontFamily: "System",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 20,
    color: "#7a8a7a",
    fontWeight: "bold",
    fontFamily: "System",
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalItemSelected: {
    backgroundColor: "#f0f9ff",
  },
  modalItemText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontFamily: "System",
  },
  modalItemTextSelected: {
    color: "#4a5c4a",
    fontWeight: "600",
  },
});
