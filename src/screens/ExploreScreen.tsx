import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  CreationWithArtisan,
  CreationCategory,
  CATEGORY_LABELS,
} from "../types/Creation";
import { CreationsApi, useFavorites } from "../services/creationsApi";
import { ScreenNavigationProp } from "../types/Navigation";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 460; // Réduit pour équilibrer image/contenu

type ExploreScreenNavigationProp = ScreenNavigationProp<"Explore">;

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CreationCategory | "all"
  >("all");
  const [allCreations, setAllCreations] = useState<CreationWithArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { favorites, toggleFavorite } = useFavorites();

  const categories = [
    { key: "all", label: "Tout" },
    ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      key: key as CreationCategory,
      label,
    })),
  ];

  const loadCreations = async () => {
    try {
      setError(null);
      let data: CreationWithArtisan[];

      if (searchQuery.trim() || selectedCategory !== "all") {
        data = await CreationsApi.searchCreations(
          searchQuery,
          selectedCategory
        );
      } else {
        data = await CreationsApi.getAllCreations();
      }

      setAllCreations(data);
    } catch (err) {
      setError(
        "Impossible de charger les créations. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreations();
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoading(true);
      loadCreations();
    }
  }, [searchQuery, selectedCategory]);

  const handleToggleFavorite = async (creationId: string) => {
    try {
      await toggleFavorite(creationId);
    } catch (err) {
      Alert.alert(
        "Erreur",
        "Impossible de modifier les favoris. Veuillez vous connecter.",
        [{ text: "OK" }]
      );
    }
  };

  const formatCreationDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  const renderCreationCard = (item: CreationWithArtisan) => (
    <View key={item.id} style={styles.creationCard}>
      {/* Container d'image avec overlays */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.creationImage}
          accessible={true}
          accessibilityLabel={`Image de ${item.title}`}
        />

        {/* Cœur favoris - Haut gauche */}
        <TouchableOpacity
          style={[
            styles.favoriteOverlay,
            favorites.some((fav) => fav.id === item.id) &&
              styles.favoriteOverlayActive,
          ]}
          onPress={() => handleToggleFavorite(item.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ajouter aux favoris"
          accessibilityHint="Double-tap pour ajouter ou retirer des favoris"
        >
          <Text
            style={[
              styles.favoriteOverlayIcon,
              favorites.some((fav) => fav.id === item.id) &&
                styles.favoriteOverlayIconActive,
            ]}
          >
            {favorites.some((fav) => fav.id === item.id) ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>

        {/* Prix - Haut droite */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceOverlayText}>{item.price.toFixed(2)} €</Text>
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

      <View style={styles.cardContent}>
        {/* Titre avec indicateur de disponibilité */}
        <View style={styles.titleWithAvailability}>
          <Text style={styles.creationTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: item.isAvailable ? "#22c55e" : "#ef4444" },
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
                    {item.category
                      ? CATEGORY_LABELS[item.category as CreationCategory]
                        ? item.category.toLowerCase()
                        : item.category.toLowerCase()
                      : "artisanal"}
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
              {item.category &&
              CATEGORY_LABELS[item.category as CreationCategory]
                ? CATEGORY_LABELS[item.category as CreationCategory]
                : item.category
                ? item.category.toUpperCase()
                : "ARTISANAT"}
            </Text>
          </View>

          {/* Bouton d'action intégré */}
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => {
              // TODO: Navigation vers les détails de la création
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Voir les détails de ${item.title}`}
          >
            <Text style={styles.viewDetailsText}>Voir plus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retour à l'accueil"
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Explorer les créations</Text>
      {!loading && !error && (
        <View style={styles.favoritesIndicator}>
          <Text style={styles.favoritesCount}>❤️ {favorites.length}</Text>
        </View>
      )}
      {(loading || error) && <View style={styles.placeholder} />}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery || selectedCategory !== "all"
          ? "Aucune création trouvée 🔍"
          : "Aucune création disponible 😊"}
      </Text>
      {(searchQuery || selectedCategory !== "all") && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={() => {
            setSearchQuery("");
            setSelectedCategory("all");
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Effacer tous les filtres de recherche"
        >
          <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer} importantForAccessibility="yes">
          <ActivityIndicator
            size="large"
            color="#4a5c4a"
            accessible={true}
            accessibilityLabel="Chargement des créations en cours"
          />
          <Text
            style={styles.loadingText}
            accessible={true}
            accessibilityLiveRegion="polite"
          >
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer} importantForAccessibility="yes">
          <Text
            style={styles.errorText}
            accessible={true}
            accessibilityLiveRegion="assertive"
          >
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadCreations}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Réessayer de charger les créations"
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des créations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible={true}
          accessibilityRole="search"
          accessibilityLabel="Champ de recherche"
          accessibilityHint="Tapez pour rechercher des créations"
        />
      </View>

      {/* Filtres par catégorie sur 2 lignes */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key &&
                  styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key as any)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Filtrer par catégorie ${category.label}`}
              accessibilityState={{
                selected: selectedCategory === category.key,
              }}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.key &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Liste des créations */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {allCreations.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.creationsGrid}>
            <View style={styles.gridContent}>
              {allCreations.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  {renderCreationCard(item)}
                </View>
              ))}
            </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    height: 60, // Hauteur fixe pour le header
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  scrollableGrid: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 18,
    color: "#4a5c4a",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#4a5c4a",
    fontFamily: "System",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  favoritesIndicator: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoritesCount: {
    fontSize: 12,
    color: "#4a5c4a",
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 8,
  },
  searchInput: {
    height: 38,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: "System",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: "100%",
  },
  filtersSection: {
    paddingVertical: 6,
    paddingHorizontal: HORIZONTAL_PADDING,
    width: "100%",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  categoryButton: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: (width - HORIZONTAL_PADDING * 2 - 21) / 4, // Exactement 4 boutons par ligne avec plus d'espace
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: "#4a5c4a",
    borderColor: "#4a5c4a",
    shadowColor: "#4a5c4a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryButtonText: {
    fontSize: 9,
    color: "#666",
    fontWeight: "400",
    fontFamily: "System",
    textAlign: "center",
  },
  categoryButtonTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 6,
  },
  resultsText: {
    fontSize: 14,
    color: "#7a8a7a",
    fontFamily: "System",
    flex: 1,
  },

  creationsGrid: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  creationCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "rgba(74, 92, 74, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#f0f1f0",
  },
  imageContainer: {
    position: "relative",
    height: 140, // Même taille que l'image
  },
  creationImage: {
    width: CARD_WIDTH,
    height: 140, // Réduit pour voir plus d'infos
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#f5f5f4",
  },

  // ❤️ FAVORIS - Design harmonisé TerraCréa
  favoriteOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(245, 240, 235, 0.95)", // Beige naturel
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(139, 111, 71, 0.25)", // Ombre terre
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "rgba(212, 165, 116, 0.4)", // Bordure dorée subtile
  },
  favoriteOverlayIcon: {
    fontSize: 19,
    lineHeight: 19,
    color: "#8b6f47", // Couleur terre pour état normal
    fontWeight: "300",
  },
  // État actif (favori ajouté)
  favoriteOverlayActive: {
    backgroundColor: "rgba(212, 165, 116, 0.95)", // Doré chaud
    borderColor: "rgba(139, 111, 71, 0.8)", // Bordure terre plus marquée
    shadowColor: "rgba(212, 165, 116, 0.35)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }], // Légère animation
  },
  favoriteOverlayIconActive: {
    color: "#8b6f47", // Rouge terre pour cœur actif
    fontWeight: "600",
    fontSize: 20,
  },

  // 💰 PRIX - Haut droite
  priceOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(45, 58, 45, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  priceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(74, 92, 74, 0.2)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "rgba(245, 246, 245, 0.8)",
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(212, 165, 116, 0.95)",
    borderColor: "rgba(196, 153, 105, 0.9)",
    shadowColor: "rgba(212, 165, 116, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  favoriteIcon: {
    fontSize: 20,
    color: "#6a7a6a",
    fontWeight: "300",
  },
  favoriteIconActive: {
    color: "#8b6f47",
    fontSize: 22,
    fontWeight: "400",
  },
  dateOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(45, 58, 45, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateOverlayText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  // ⭐ RATING - Bas droite
  ratingOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingOverlayContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  ratingOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "System",
  },
  reviewOverlayText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "System",
    opacity: 0.9,
  },
  cardContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
    minHeight: 280, // Augmenté pour donner plus de place au contenu
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%",
  },
  // Titre avec indicateur de disponibilité
  titleWithAvailability: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%",
  },
  creationTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2d3a2d",
    fontFamily: "System",
    flex: 1,
    lineHeight: 26,
    letterSpacing: 0.3,
    marginRight: 8,
  },
  // Rond de disponibilité (vert = dispo, rouge = pas dispo)
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  availableDot: {
    backgroundColor: "#4caf50",
  },
  unavailableDot: {
    backgroundColor: "#f44336",
  },
  creationDescription: {
    fontSize: 14,
    color: "#6a7a6a",
    marginBottom: 18,
    fontFamily: "System",
    width: "100%",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  creatorLabel: {
    fontSize: 13,
    color: "#6a7a6a",
    fontFamily: "System",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  creatorNameText: {
    fontSize: 13,
    color: "#4a5c4a",
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
  },

  // Section inférieure avec catégorie et bouton
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
    width: "100%",
  },
  // Catégorie en bas à gauche
  categoryContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  categoryLabel: {
    fontSize: 11,
    color: "#8a9a8a",
    fontWeight: "600",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    backgroundColor: "#f5f6f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#e8e9e8",
    overflow: "hidden",
  },
  // Tags sans trait séparateur
  tagsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  tagsLabel: {
    fontSize: 13,
    color: "#6a7a6a",
    fontFamily: "System",
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tagItem: {
    backgroundColor: "#e8d5c4",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 3,
    borderWidth: 0.5,
    borderColor: "#d4a574",
  },
  tagText: {
    fontSize: 9,
    color: "#8b6f47",
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.1,
  },
  moreTags: {
    fontSize: 9,
    color: "#8a9a8a",
    fontFamily: "System",
    fontStyle: "italic",
    fontWeight: "500",
    letterSpacing: 0.1,
  },

  // Container pour filtres de catégories
  categoriesContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 8,
    backgroundColor: "#f5f6f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
  },
  // Grille des filtres sur 2 lignes
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  categoryText: {
    fontSize: 11,
    color: "#8a9a8a",
    fontWeight: "600",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    backgroundColor: "#f5f6f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#e8e9e8",
    marginRight: 6,
    marginBottom: 4,
    overflow: "hidden",
  },
  // Nouveaux styles pour les états
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7a8a7a",
    fontFamily: "System",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#4a5c4a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  clearFiltersButton: {
    backgroundColor: "#f0f5f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearFiltersText: {
    color: "#4a5c4a",
    fontSize: 14,
    fontWeight: "500",
  },
  // New styles for the new structure

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 20,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  viewDetailsButton: {
    backgroundColor: "#4a5c4a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 12,
    maxWidth: 120,
    shadowColor: "rgba(74, 92, 74, 0.25)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#3d4f3d",
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  ratingText: {
    fontSize: 14,
    color: "#4a5c4a",
    fontWeight: "600",
    fontFamily: "System",
  },
  reviewText: {
    fontSize: 10,
    color: "#999",
    fontFamily: "System",
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "System",
  },
});

export default ExploreScreen;
