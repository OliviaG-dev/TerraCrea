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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { Creation } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";

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

  const loadCreations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userCreations = await CreationsApi.getUserCreations(user.id);
      setCreations(userCreations);

      // Debug temporaire pour voir les URLs d'images
      userCreations.forEach((creation) => {
        console.log(
          `Création "${creation.title}": imageUrl = "${creation.imageUrl}"`
        );
      });
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

  const handleAddCreation = () => {
    navigation.navigate("AddCreation");
  };

  const handleEditCreation = (creation: Creation) => {
    setNotification({
      visible: true,
      title: "ℹ️ Fonctionnalité à venir",
      message: "La modification de créations sera bientôt disponible !",
      type: "info",
    });
  };

  const handleDeleteCreation = (creation: Creation) => {
    Alert.alert(
      "Supprimer la création",
      `Êtes-vous sûr de vouloir supprimer "${creation.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await CreationsApi.deleteCreation(creation.id);
              setNotification({
                visible: true,
                title: "✅ Supprimé",
                message: "La création a été supprimée avec succès",
                type: "success",
              });
              loadCreations();
            } catch (error) {
              setNotification({
                visible: true,
                title: "❌ Erreur",
                message: "Impossible de supprimer la création",
                type: "error",
              });
            }
          },
        },
      ]
    );
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
                console.warn(
                  `Erreur de chargement de l'image: ${creation.imageUrl}`
                );
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderSubtext}>
                {hasImage ? "Erreur de chargement" : "Aucune image"}
              </Text>
              {hasImage && (
                <Text style={styles.imageDebugText}>
                  URL: {creation.imageUrl?.substring(0, 50)}...
                </Text>
              )}
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
              onPress={() => handleDeleteCreation(creation)}
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
  imageDebugText: {
    fontSize: 10,
    color: "#999",
    fontFamily: "System",
    marginTop: 4,
    textAlign: "center",
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
    backgroundColor: "#ef4444",
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
});
