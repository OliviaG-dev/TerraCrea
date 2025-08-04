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
import { Creation } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { COLORS } from "../utils/colors";

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

  const handleEditCreation = (creation: Creation) => {
    navigation.navigate("EditCreation", { creation });
  };

  const handleDeleteCreation = (creation: Creation) => {
    console.log(
      "🔄 Tentative de suppression de la création:",
      creation.id,
      creation.title
    );

    // Afficher la modal de confirmation
    setDeleteModal({
      visible: true,
      creation: creation,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.creation) return;

    const creation = deleteModal.creation;
    console.log("✅ Utilisateur a confirmé la suppression");

    setDeleteModal({ visible: false, creation: null });
    setLoading(true);

    try {
      console.log("🔄 Appel de CreationsApi.deleteCreation...");
      const result = await CreationsApi.deleteCreation(creation.id);
      console.log("✅ Résultat de la suppression:", result);

      setNotification({
        visible: true,
        title: "✅ Supprimé",
        message: `"${creation.title}" a été supprimée avec succès`,
        type: "success",
      });

      // Recharger la liste des créations
      console.log("🔄 Rechargement de la liste...");
      await loadCreations();
      console.log("✅ Liste rechargée");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
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

          <View style={styles.creationStats}>
            <Text style={styles.creationStat}>⭐ {creation.rating}</Text>
            <Text style={styles.creationStat}>
              📊 {creation.reviewCount} avis
            </Text>
            <Text style={styles.creationCategory}>{creation.category}</Text>
          </View>

          <View style={styles.creationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditCreation(creation)}
            >
              <Text style={styles.editButtonText}>✏️ Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                console.log("🔄 Bouton Supprimer cliqué pour:", creation.title);
                handleDeleteCreation(creation);
              }}
            >
              <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mes Créations</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddCreation}>
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Chargement de vos créations...
            </Text>
          </View>
        ) : creations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucune création</Text>
            <Text style={styles.emptyDescription}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>
                🗑️ Supprimer la création
              </Text>
            </View>

            <View style={styles.deleteModalBody}>
              <Text style={styles.deleteModalMessage}>
                Êtes-vous sûr de vouloir supprimer définitivement
              </Text>
              <Text
                style={[
                  styles.deleteModalMessage,
                  styles.deleteModalCreationTitle,
                ]}
              >
                "{deleteModal.creation?.title}" ?
              </Text>
              <Text style={styles.deleteModalWarning}>
                Cette action ne peut pas être annulée.
              </Text>
            </View>

            <View style={styles.deleteModalActions}>
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
  addButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#7a8a7a",
    fontFamily: "System",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 12,
    fontFamily: "System",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#7a8a7a",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: "System",
  },
  emptyAddButton: {
    backgroundColor: "#4a5c4a",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  creationsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4a5c4a",
    marginBottom: 20,
    fontFamily: "System",
  },
  creationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
  },
  creationImage: {
    width: "100%",
    height: "100%",
  },
  creationContent: {
    padding: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: "#7a8a7a",
    fontFamily: "System",
  },
  creationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  creationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5c4a",
    flex: 1,
    fontFamily: "System",
  },
  creationPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ff6b35",
    fontFamily: "System",
  },
  creationDescription: {
    fontSize: 14,
    color: "#7a8a7a",
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: "System",
  },
  creationStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  creationStat: {
    fontSize: 12,
    color: "#8a9a8a",
    fontFamily: "System",
  },
  creationCategory: {
    fontSize: 12,
    color: "#4a5c4a",
    fontWeight: "500",
    fontFamily: "System",
  },
  creationActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#4a5c4a",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
  // Styles pour la modal de suppression
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  deleteModalHeader: {
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.danger,
    textAlign: "center",
    fontFamily: "System",
  },
  deleteModalBody: {
    marginBottom: 24,
    alignItems: "center",
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#4a5c4a",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: "System",
    width: "100%",
  },
  deleteModalCreationTitle: {
    fontWeight: "600",
    color: COLORS.danger,
  },
  deleteModalWarning: {
    fontSize: 14,
    color: "#7a8a7a",
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "System",
    width: "100%",
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e8e9e8",
  },
  cancelButtonText: {
    color: "#4a5c4a",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "System",
    textAlign: "center",
  },
  confirmDeleteButton: {
    backgroundColor: COLORS.danger,
  },
  confirmDeleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "System",
    textAlign: "center",
  },
});
