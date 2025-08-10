import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { CommonHeader } from "../components";
import { CreationWithArtisan, CATEGORY_LABELS } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { RatingsApi } from "../services/ratingsApi";
import { COLORS, formatDate } from "../utils";

// Composant pour les étoiles de notation
const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 24,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.starsContainer}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          style={styles.starButton}
        >
          <Text
            style={[
              styles.starIcon,
              { fontSize: size },
              star <= rating ? styles.starFilled : styles.starEmpty,
            ]}
          >
            {star <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

type CreationDetailScreenNavigationProp =
  ScreenNavigationProp<"CreationDetail">;

interface CreationDetailScreenParams {
  creationId: string;
}

export const CreationDetailScreen = () => {
  const navigation = useNavigation<CreationDetailScreenNavigationProp>();
  const route = useRoute();
  const { creationId } = route.params as CreationDetailScreenParams;
  const { user } = useUserContext();

  const [creation, setCreation] = useState<CreationWithArtisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
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

  // Charger les détails de la création
  const loadCreationDetails = async () => {
    try {
      setLoading(true);
      // Récupérer toutes les créations et filtrer par ID
      const allCreations = await CreationsApi.getAllCreations();
      const foundCreation = allCreations.find((c) => c.id === creationId);

      if (!foundCreation) {
        throw new Error("Création non trouvée");
      }

      setCreation(foundCreation);

      // Vérifier si l'utilisateur connecté a mis en favori cette création
      if (user) {
        try {
          const favoriteStatus = await CreationsApi.isFavorite(creationId);
          setIsFavorite(favoriteStatus);
        } catch (error) {
          // Continuer sans le statut favori
        }
      }

      // Charger la notation existante de l'utilisateur (si connecté et pas créateur)
      if (user && user.id !== foundCreation.artisanId) {
        try {
          const existingRating = await RatingsApi.getUserRating(creationId);
          setUserRating(existingRating);
        } catch (error) {
          // Continuer sans la notation existante
        }
      }
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible de charger les détails de la création",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer les favoris
  const handleToggleFavorite = async () => {
    if (!user) {
      setNotification({
        visible: true,
        title: "⚠️ Connexion requise",
        message: "Vous devez être connecté pour ajouter aux favoris",
        type: "warning",
      });
      return;
    }

    try {
      setFavoriteLoading(true);
      const success = await CreationsApi.toggleFavorite(creationId);
      if (success) {
        setIsFavorite(!isFavorite);
        setNotification({
          visible: true,
          title: isFavorite ? "💔 Retiré des favoris" : "❤️ Ajouté aux favoris",
          message: isFavorite
            ? "Création retirée de vos favoris"
            : "Création ajoutée à vos favoris",
          type: "success",
        });
      } else {
        setNotification({
          visible: true,
          title: "⚠️ Attention",
          message: "Impossible de modifier les favoris pour le moment",
          type: "warning",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message:
          "Impossible de modifier les favoris. Veuillez réessayer plus tard.",
        type: "error",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Gérer la notation
  const handleRating = async (rating: number) => {
    if (!user) {
      setNotification({
        visible: true,
        title: "⚠️ Connexion requise",
        message: "Vous devez être connecté pour noter cette création",
        type: "warning",
      });
      return;
    }

    if (user.id === creation?.artisanId) {
      setNotification({
        visible: true,
        title: "⚠️ Action non autorisée",
        message: "Vous ne pouvez pas noter vos propres créations",
        type: "warning",
      });
      return;
    }

    try {
      setRatingLoading(true);

      const success = await RatingsApi.saveUserRating(creationId, rating);

      if (success) {
        setUserRating(rating);
        setNotification({
          visible: true,
          title: "⭐ Merci pour votre note !",
          message: `Vous avez donné ${rating}/5 étoiles à cette création`,
          type: "success",
        });

        // Recharger les détails de la création pour mettre à jour la note moyenne
        await loadCreationDetails();
      } else {
        setNotification({
          visible: true,
          title: "❌ Erreur",
          message: "Impossible de sauvegarder votre note. Veuillez réessayer.",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible de sauvegarder votre note. Veuillez réessayer.",
        type: "error",
      });
    } finally {
      setRatingLoading(false);
    }
  };

  // Navigation vers l'édition (seulement pour le créateur)
  const handleEditCreation = () => {
    if (creation) {
      navigation.navigate("EditCreation", { creation });
    }
  };

  // Navigation vers le profil de l'artisan
  const handleViewArtisanProfile = () => {
    if (creation?.artisan) {
      navigation.navigate("CreatorProfile", { artisanId: creation.artisan.id });
    }
  };

  useEffect(() => {
    loadCreationDetails();
  }, [creationId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CommonHeader
          title="Détails de la création"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!creation) {
    return (
      <SafeAreaView style={styles.container}>
        <CommonHeader
          title="Détails de la création"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Création non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = user?.id === creation.artisanId;

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
        title="Détails de la création"
        onBack={() => navigation.goBack()}
        rightButton={
          user
            ? {
                text: favoriteLoading ? "..." : isFavorite ? "❤️" : "🤍",
                onPress: handleToggleFavorite,
                disabled: favoriteLoading,
              }
            : undefined
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image de la création */}
        <View style={styles.imageContainer}>
          {creation.imageUrl && !imageError ? (
            <Image
              source={{ uri: creation.imageUrl }}
              style={styles.creationImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderSubtext}>
                {imageError ? "Erreur de chargement" : "Aucune image"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {/* En-tête avec titre et prix */}
          <View style={styles.headerSection}>
            <Text style={styles.creationTitle}>{creation.title}</Text>
            <Text style={styles.creationPrice}>{creation.price}€</Text>
          </View>

          {/* Informations artisan */}
          <View style={styles.artisanSection}>
            <Text style={styles.sectionTitle}>Artisan</Text>
            <TouchableOpacity
              style={styles.artisanCard}
              onPress={handleViewArtisanProfile}
            >
              <View style={styles.artisanInfo}>
                <Text style={styles.artisanName}>
                  {creation.artisan.displayName || "Artisan"}
                </Text>
                {creation.artisan.artisanProfile?.location && (
                  <Text style={styles.artisanLocation}>
                    📍 {creation.artisan.artisanProfile.location}
                  </Text>
                )}
                {creation.artisan.artisanProfile?.verified && (
                  <Text style={styles.verifiedBadge}>✓ Vérifié</Text>
                )}
              </View>
              <Text style={styles.viewProfileText}>Voir le profil →</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.creationDescription}>
              {creation.description}
            </Text>
          </View>

          {/* Catégorie */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <Text style={styles.categoryText}>
              {CATEGORY_LABELS[creation.category] || creation.category}
            </Text>
          </View>

          {/* Matériaux */}
          {creation.materials && creation.materials.length > 0 && (
            <View style={styles.materialsSection}>
              <Text style={styles.sectionTitle}>Matériaux utilisés</Text>
              <View style={styles.materialsList}>
                {creation.materials.map((material, index) => (
                  <View key={index} style={styles.materialTag}>
                    <Text style={styles.materialText}>{material}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {creation.tags && creation.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsList}>
                {creation.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Statistiques */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ⭐ {creation.rating.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>📊 {creation.reviewCount}</Text>
                <Text style={styles.statLabel}>Avis</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {creation.isAvailable ? "✅" : "❌"}
                </Text>
                <Text style={styles.statLabel}>
                  {creation.isAvailable ? "Disponible" : "Indisponible"}
                </Text>
              </View>
            </View>
          </View>

          {/* Notation utilisateur */}
          {user && user.id !== creation.artisanId && (
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Donnez votre avis</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingInstruction}>
                  {userRating
                    ? `Vous avez donné ${userRating}/5 étoiles`
                    : "Tapez sur les étoiles pour noter cette création"}
                </Text>
                <StarRating
                  rating={userRating || 0}
                  onRatingChange={handleRating}
                  readonly={ratingLoading}
                  size={32}
                />
                {ratingLoading && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={styles.ratingLoader}
                  />
                )}
              </View>
            </View>
          )}

          {/* Affichage de la notation pour les non-connectés */}
          {!user && (
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Note moyenne</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingInstruction}>
                  Connectez-vous pour noter cette création
                </Text>
                <StarRating
                  rating={creation.rating}
                  readonly={true}
                  size={32}
                />
              </View>
            </View>
          )}

          {/* Informations de création */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Créée le :</Text>
                <Text style={styles.infoValue}>
                  {formatDate(creation.createdAt)}
                </Text>
              </View>
              {creation.updatedAt && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Modifiée le :</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(creation.updatedAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          {isCreator && (
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditCreation}
              >
                <Text style={styles.editButtonText}>Modifier ma création</Text>
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
    backgroundColor: COLORS.background,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  creationImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  imagePlaceholderText: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.6,
  },
  imagePlaceholderSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  detailsContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  creationTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  creationPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.accent,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  artisanSection: {
    marginBottom: 24,
  },
  artisanCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  artisanInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  artisanLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "600",
  },
  viewProfileText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  descriptionSection: {
    marginBottom: 24,
  },
  creationDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  materialsSection: {
    marginBottom: 24,
  },
  materialsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  materialTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  materialText: {
    fontSize: 14,
    color: COLORS.textOnPrimary,
    fontWeight: "500",
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagItem: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 24,
  },
  infoList: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  actionsSection: {
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  starButton: {
    padding: 5,
  },
  starIcon: {
    fontSize: 24,
  },
  starFilled: {
    color: COLORS.accent,
  },
  starEmpty: {
    color: COLORS.textSecondary,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  ratingInstruction: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  ratingLoader: {
    marginTop: 10,
  },
});
