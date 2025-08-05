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
import { Platform } from "react-native";
import { NotificationToast } from "../components/NotificationToast";
import { CommonHeader, CommonInput } from "../components";
import { Creation, CreationCategory, CATEGORY_LABELS } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { COLORS, inputStyles } from "../utils";

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
    materials: creation.materials,
    tags: creation.tags,
    photo: creation.imageUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    []
  );

  const commonMaterials = [
    "Bois",
    "Argile",
    "Verre",
    "Métal",
    "Pierre",
    "Tissu",
    "Cuir",
    "Papier",
    "Plastique",
    "Céramique",
    "Bambou",
    "Laine",
    "Soie",
    "Coton",
    "Lin",
  ];

  const commonTags = [
    "Fait main",
    "Unique",
    "Écologique",
    "Vintage",
    "Moderne",
    "Traditionnel",
    "Artisanal",
    "Durable",
    "Recyclé",
    "Bio",
    "Éthique",
    "Local",
    "Personnalisable",
  ];
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
        // Fallback vers les catégories du frontend
        setCategories(
          Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }))
        );
      }
    };
    loadCategories();
  }, []);

  const handleAddPhoto = async () => {
    // Vérifier si nous sommes sur le web
    if (Platform.OS === "web") {
      setNotification({
        visible: true,
        title: "⚠️ Fonctionnalité limitée",
        message:
          "La sélection de photo n'est pas disponible sur le web. Veuillez tester sur un appareil mobile.",
        type: "warning",
      });
      return;
    }

    try {
      // Vérifier que ImagePicker est disponible
      if (!ImagePicker.requestMediaLibraryPermissionsAsync) {
        setNotification({
          visible: true,
          title: "❌ Erreur",
          message: "ImagePicker n'est pas disponible sur cette plateforme",
          type: "error",
        });
        return;
      }

      // Demander les permissions d'abord
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

      if (!result.canceled && result.assets[0]) {
        setForm((prev) => ({
          ...prev,
          photo: result.assets[0].uri,
        }));
        setHasNewPhoto(true);
        setNotification({
          visible: true,
          title: "✅ Photo sélectionnée",
          message: "Votre photo a été sélectionnée avec succès",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de photo:", error);
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message:
          "Impossible d'accéder à la galerie. Veuillez vérifier les permissions.",
        type: "error",
      });
    }
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photo: "",
    }));
    setHasNewPhoto(false);
    setNotification({
      visible: true,
      title: "🗑️ Photo supprimée",
      message: "La photo a été supprimée de la création",
      type: "info",
    });
  };

  const addMaterial = () => {
    setShowMaterialsModal(true);
  };

  const removeMaterial = (material: string) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m !== material),
    }));
  };

  const addTag = () => {
    setShowTagsModal(true);
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
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
        materials: form.materials,
        tags: form.tags,
      };

      // Gestion de la photo

      if (hasNewPhoto && form.photo) {
        // Nouvelle photo sélectionnée (URI local)
        try {
          const fileName = `creation_${Date.now()}.jpg`;
          const imageUrl = await CreationsApi.uploadCreationImage(
            form.photo,
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
      } else if (!form.photo && creation.imageUrl) {
        // Photo supprimée
        updateData.imageUrl = null;
      }

      // Mettre à jour la création
      const updatedCreation = await CreationsApi.updateCreation(
        creation.id,
        updateData
      );

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

      <CommonHeader
        title="Modifier la création"
        onBack={() => navigation.goBack()}
        backLabel="Annuler"
        rightButton={{
          text: "Enregistrer",
          onPress: handleSubmit,
          loading: loading,
          disabled: loading,
        }}
      />

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
        <CommonInput
          label="Titre *"
          value={form.title}
          onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
          placeholder="Nom de votre création"
        />

        {/* Description */}
        <CommonInput
          label="Description *"
          value={form.description}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, description: text }))
          }
          placeholder="Décrivez votre création..."
          multiline
          numberOfLines={4}
          style={inputStyles.textArea}
        />

        {/* Prix */}
        <CommonInput
          label="Prix (€) *"
          value={form.price}
          onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
          placeholder="0.00"
          keyboardType="numeric"
        />

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
          <Text style={styles.inputLabel}>Matériaux utilisés</Text>
          <TouchableOpacity style={styles.selectButton} onPress={addMaterial}>
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

        {/* Tags */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Tags</Text>
          <TouchableOpacity style={styles.selectButton} onPress={addTag}>
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

      {/* Modal pour sélectionner des matériaux */}
      <Modal
        visible={showMaterialsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMaterialsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner des matériaux</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMaterialsModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={commonMaterials}
              keyExtractor={(item) => item}
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
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal pour sélectionner des tags */}
      <Modal
        visible={showTagsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner des tags</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTagsModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={commonTags}
              keyExtractor={(item) => item}
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
  modalItemCheck: {
    color: "#4a5c4a",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: "auto",
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
});
