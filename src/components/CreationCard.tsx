import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  CreationWithArtisan,
  CreationCategory,
  CATEGORY_LABELS,
} from "../types/Creation";
import { COLORS } from "../utils/colors";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 460;

interface CreationCardProps {
  item: CreationWithArtisan;
  isFavorite: boolean;
  onToggleFavorite: (creationId: string) => void;
  onPress: (creation: CreationWithArtisan) => void;
  isAuthenticated: boolean;
}

export const CreationCard: React.FC<CreationCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
  isAuthenticated,
}) => {
  const formatCreationDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardBorderContainer}>
        {/* Container d'image avec overlays */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.creationImage}
            accessible={true}
            accessibilityLabel={`Image de ${item.title}`}
          />

          {/* Cœur favoris - Haut gauche (visible seulement si connecté) */}
          {isAuthenticated && (
            <TouchableOpacity
              style={[
                styles.favoriteOverlay,
                isFavorite && styles.favoriteOverlayActive,
              ]}
              onPress={() => onToggleFavorite(item.id)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ajouter aux favoris"
              accessibilityHint="Double-tap pour ajouter ou retirer des favoris"
            >
              <Text
                style={[
                  styles.favoriteOverlayIcon,
                  isFavorite && styles.favoriteOverlayIconActive,
                ]}
              >
                {isFavorite ? "♥" : "♡"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Prix - Haut droite */}
          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>
              {item.price.toFixed(2)} €
            </Text>
          </View>

          {/* Rating et avis - Bas droite */}
          <View style={styles.ratingOverlay}>
            <View style={styles.ratingOverlayContainer}>
              <Text style={styles.ratingOverlayText}>
                ⭐ {item.rating.toFixed(1)}
              </Text>
              <Text style={styles.reviewOverlayText}>
                ({item.reviewCount} avis)
              </Text>
            </View>
          </View>

          {/* Date de création - Bas gauche */}
          <View style={styles.dateOverlay}>
            <Text style={styles.dateOverlayText}>
              {formatCreationDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Contenu de la carte - fusionné avec l'image */}
        <View style={styles.cardContent}>
          {/* Titre avec indicateur de disponibilité */}
          <View style={styles.titleWithAvailability}>
            <Text style={styles.creationTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View
              style={[
                styles.availabilityDot,
                {
                  backgroundColor: item.isAvailable ? "#22c55e" : COLORS.danger,
                },
              ]}
              accessible={true}
              accessibilityLabel={
                item.isAvailable ? "Disponible" : "Non disponible"
              }
            />
          </View>

          <Text style={styles.creationDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.creatorContainer}>
            <Text style={styles.creatorLabel}>Créateur: </Text>
            <Text style={styles.creatorNameText}>
              {item.artisan?.displayName ||
                (item.artisan?.firstName && item.artisan?.lastName
                  ? `${item.artisan.firstName} ${item.artisan.lastName}`
                  : item.artisan?.username || "Artisan inconnu")}
            </Text>
          </View>

          {/* Tags repositionnés au-dessus */}
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Tags:</Text>
            <View style={styles.tagsList}>
              {item.tags && item.tags.length > 0 ? (
                <>
                  {item.tags.slice(0, 4).map((tag: string, index: number) => (
                    <View key={index} style={styles.tagItem}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 4 && (
                    <Text style={styles.moreTags}>+{item.tags.length - 4}</Text>
                  )}
                </>
              ) : (
                // Tags par défaut si aucun tag de la DB
                <>
                  <View style={styles.tagItem}>
                    <Text style={styles.tagText}>#fait-main</Text>
                  </View>
                  <View style={styles.tagItem}>
                    <Text style={styles.tagText}>
                      #
                      {item.categoryLabel?.toLowerCase() ||
                        (item.category
                          ? CATEGORY_LABELS[
                              item.category as CreationCategory
                            ] || item.category.toLowerCase()
                          : "artisanal")}
                    </Text>
                  </View>
                  <View style={styles.tagItem}>
                    <Text style={styles.tagText}>
                      #
                      {item.price < 50
                        ? "abordable"
                        : item.price > 100
                        ? "premium"
                        : "qualité"}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Section inférieure avec catégorie et bouton */}
          <View style={styles.bottomSection}>
            {/* Catégorie en bas à gauche */}
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>
                {item.categoryLabel ||
                  (item.category
                    ? CATEGORY_LABELS[item.category as CreationCategory] ||
                      item.category.toUpperCase()
                    : "ARTISANAT")}
              </Text>
            </View>

            {/* Bouton d'action intégré */}
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => onPress(item)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Voir les détails de ${item.title}`}
            >
              <Text style={styles.viewDetailsText}>Voir plus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: "#fff",
    transform: [{ scale: 1 }],
  },

  imageContainer: {
    position: "relative",
    height: CARD_HEIGHT * 0.6,
    backgroundColor: "#fafafa",
  },
  creationImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favoriteOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(74, 92, 74, 0.2)",
    shadowColor: "#2d3a2d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteOverlayActive: {
    backgroundColor: "rgba(74, 92, 74, 0.95)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  favoriteOverlayIcon: {
    fontSize: 16,
    color: "#4a5c4a",
  },
  favoriteOverlayIconActive: {
    color: "#fff",
  },
  priceOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(74, 92, 74, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#2d3a2d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  priceOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "System",
  },
  ratingOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 92, 74, 0.15)",
    shadowColor: "#2d3a2d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingOverlayContainer: {
    alignItems: "center",
  },
  ratingOverlayText: {
    fontSize: 10,
    color: "#4a5c4a",
    fontWeight: "600",
    fontFamily: "System",
  },
  reviewOverlayText: {
    fontSize: 8,
    color: "#7a8a7a",
    fontFamily: "System",
  },
  dateOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 92, 74, 0.15)",
    shadowColor: "#2d3a2d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateOverlayText: {
    fontSize: 9,
    color: "#7a8a7a",
    fontFamily: "System",
    fontWeight: "500",
  },
  cardContent: {
    padding: 16,
    backgroundColor: "#fff",
  },
  titleWithAvailability: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  creationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3a2d",
    flex: 1,
    marginRight: 8,
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  creationDescription: {
    fontSize: 15,
    color: "#4a5c4a",
    lineHeight: 22,
    marginBottom: 14,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  creatorLabel: {
    fontSize: 13,
    color: "#5a6b5a",
    fontFamily: "System",
    fontWeight: "500",
  },
  creatorNameText: {
    fontSize: 13,
    color: "#2d3a2d",
    fontFamily: "System",
    fontWeight: "700",
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 13,
    color: "#5a6b5a",
    fontFamily: "System",
    fontWeight: "500",
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagItem: {
    backgroundColor: "#f0e6dd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#6b4f2d",
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  moreTags: {
    fontSize: 12,
    color: "#5a6b5a",
    fontFamily: "System",
    fontStyle: "italic",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 0,
  },
  categoryContainer: {
    backgroundColor: "#f8f9f8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#2d3a2d",
    fontWeight: "700",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viewDetailsButton: {
    backgroundColor: "#4a5c4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  cardBorderContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: "#ffffff",
  },
});
