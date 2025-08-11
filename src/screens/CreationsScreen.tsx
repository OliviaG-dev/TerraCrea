import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { CommonHeader } from "../components";
import { Creation, CATEGORY_LABELS } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { COLORS, emptyStyles, loadingStyles, modalStyles } from "../utils";

type CreationsScreenNavigationProp = ScreenNavigationProp<"Creations">;

export const CreationsScreen = () => {
  const navigation = useNavigation<CreationsScreenNavigationProp>();
  const { user } = useUserContext();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
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
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    creation: Creation | null;
  }>({
    visible: false,
    creation: null,
  });

  const loadCreations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userCreations = await CreationsApi.getUserCreations(user.id);
      setCreations(userCreations);
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible de charger vos créations",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreations();
  }, [user]);

  // Rafraîchir la liste quand on revient sur cet écran
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?.id) {
        loadCreations();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  const handleAddCreation = () => {
    navigation.navigate("AddCreation");
  };

  const handleViewCreation = (creation: Creation) => {
    // Navigation vers l'écran de détail de la création
    navigation.navigate("CreationDetail", { creationId: creation.id });
  };

  const handleEditCreation = (creation: Creation) => {
    navigation.navigate("EditCreation", { creation });
  };

  const handleDeleteCreation = (creation: Creation) => {
    // Afficher la modal de confirmation
    setDeleteModal({
      visible: true,
      creation: creation,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.creation) return;

    const creation = deleteModal.creation;

    setDeleteModal({ visible: false, creation: null });
    setLoading(true);

    try {
      const result = await CreationsApi.deleteCreation(creation.id);

      setNotification({
        visible: true,
        title: "✅ Supprimé",
        message: `"${creation.title}" a été supprimée avec succès`,
        type: "success",
      });

      // Recharger la liste des créations
      await loadCreations();
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: `Erreur: ${
          error instanceof Error
            ? error.message
            : "Impossible de supprimer la création"
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ visible: false, creation: null });
  };

  const renderCreationCard = (creation: Creation) => {
    const hasImage = creation.imageUrl && creation.imageUrl.trim() !== "";
    const imageHasError = imageErrors.has(creation.id);

    return (
      <View key={creation.id} style={styles.creationCard}>
        {/* Image de la création */}
        <View style={styles.imageContainer}>
          {hasImage && !imageHasError ? (
            <Image
              source={{ uri: creation.imageUrl }}
              style={styles.creationImage}
              resizeMode="cover"
              onError={() => {
                setImageErrors((prev) => new Set(prev).add(creation.id));
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderSubtext}>
                {hasImage ? "Erreur de chargement" : "Aucune image"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.creationContent}>
          <View style={styles.creationHeader}>
            <Text style={styles.creationTitle}>{creation.title}</Text>
            <Text style={styles.creationPrice}>{creation.price}€</Text>
          </View>

          <Text style={styles.creationDescription} numberOfLines={2}>
            {creation.description}
          </Text>

          {creation.materials && creation.materials.length > 0 && (
            <View style={styles.materialsContainer}>
              <Text style={styles.materialsLabel}>Matériaux :</Text>
              <Text style={styles.materialsText}>
                {creation.materials.slice(0, 3).join(", ")}
                {creation.materials.length > 3 && "..."}
              </Text>
            </View>
          )}

          <View style={styles.creationStats}>
            <View style={styles.statsLeft}>
              <Text style={styles.creationStat}>
                ⭐ {creation.rating.toFixed(1)}
              </Text>
              <Text style={styles.creationStat}>
                📊 {creation.reviewCount} avis
              </Text>
            </View>
            <Text style={styles.creationCategory}>
              {CATEGORY_LABELS[creation.category] || creation.category}
            </Text>
          </View>

          <View style={styles.creationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleViewCreation(creation)}
            >
              <Text style={styles.viewButtonText}>Voir plus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditCreation(creation)}
            >
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCreation(creation)}
            >
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Vous devez être connecté pour accéder à vos créations.
          </Text>
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
        title="Mes Créations"
        onBack={() => navigation.goBack()}
        rightButton={{
          text: "+ Ajouter",
          onPress: handleAddCreation,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={loadingStyles.container}>
            <Text style={loadingStyles.text}>
              Chargement de vos créations...
            </Text>
          </View>
        ) : creations.length === 0 ? (
          <View style={emptyStyles.container}>
            <Text style={emptyStyles.title}>Aucune création</Text>
            <Text style={emptyStyles.description}>
              Vous n'avez pas encore créé de créations. Commencez par en ajouter
              une !
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleAddCreation}
            >
              <Text style={styles.emptyAddButtonText}>
                Créer ma première création
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.creationsList}>
            <Text style={styles.sectionTitle}>
              Vos créations ({creations.length})
            </Text>
            {creations.map(renderCreationCard)}
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmation de suppression */}
      <Modal
        visible={deleteModal.visible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Text style={modalStyles.title}>🗑️ Supprimer la création</Text>

            <Text style={modalStyles.message}>
              Êtes-vous sûr de vouloir supprimer définitivement{" "}
              <Text style={{ fontWeight: "700", color: COLORS.textPrimary }}>
                "{deleteModal.creation?.title}" ?
              </Text>
              {"\n\n"}Cette action ne peut pas être annulée.
            </Text>

            <View style={modalStyles.actions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  Supprimer définitivement
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  emptyAddButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyAddButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  creationsList: {
    flex: 1,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  creationCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  creationImage: {
    width: "100%",
    height: "100%",
  },
  creationContent: {
    padding: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.6,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  creationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  creationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  creationPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.accent,
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  creationDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  materialsContainer: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  materialsLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  materialsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  creationStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  creationStat: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  creationCategory: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  creationActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  viewButton: {
    backgroundColor: COLORS.secondary,
  },
  viewButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  deleteButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  // Styles spécifiques pour les boutons de la modale
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  confirmDeleteButton: {
    backgroundColor: COLORS.danger,
  },
  confirmDeleteButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
