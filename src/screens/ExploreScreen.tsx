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
import { useUserContext } from "../context/UserContext";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 460; // Réduit pour équilibrer image/contenu

type ExploreScreenNavigationProp = ScreenNavigationProp<"Explore">;

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const { isAuthenticated } = useUserContext();
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

        {/* Cœur favoris - Haut gauche (visible seulement si connecté) */}
        {isAuthenticated && (
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
        )}

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
      {!loading && !error && isAuthenticated ? (
        <View style={styles.favoritesIndicator}>
          <Text style={styles.heartIcon}>♥</Text>
          <Text style={styles.favoritesCount}>{favorites.length}</Text>
        </View>
      ) : (
        <View style={styles.placeholder} />
      )}
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
        ref={(scrollViewRef) => {
          // @ts-ignore
          global.scrollViewRef = scrollViewRef;
        }}
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

            {/* Bouton retour en haut */}
            <View style={styles.scrollToTopContainer}>
              <TouchableOpacity
                style={styles.scrollToTopButton}
                onPress={() => {
                  // @ts-ignore
                  global.scrollViewRef?.scrollTo({ y: 0, animated: true });
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Retour en haut de la liste"
              >
                <Text style={styles.scrollToTopButtonText}>↑</Text>
              </TouchableOpacity>
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
    paddingVertical: 12,
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
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f4",
    borderWidth: 1,
    borderColor: "#e8e9e8",
    width: 40,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 18,
    color: "#4a5c4a",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5c4a",
    fontFamily: "System",
    letterSpacing: 0.3,
    flex: 1,
    textAlign: "center",
  },
  favoritesIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heartIcon: {
    fontSize: 24,
    color: "#4a5c4a",
  },

  favoritesCount: {
    fontSize: 12,
    color: "#4a5c4a",
    fontWeight: "600",
    fontFamily: "System",
  },
  placeholder: {
    width: 40,
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e8e9e8",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fafaf9",
    color: "#4a5c4a",
    fontFamily: "System",
  },
  categoriesContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 8,
    backgroundColor: "#fafaf9",
    alignItems: "center",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 600,
  },
  categoryButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    fontSize: 11,
    color: "#8a9a8a",
    fontWeight: "600",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryButtonTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  creationsGrid: {
    width: "100%",
    maxWidth: 800,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  creationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e8e9e8",
  },
  imageContainer: {
    position: "relative",
    height: CARD_HEIGHT * 0.6,
    backgroundColor: "#f5f5f4",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  favoriteOverlayActive: {
    backgroundColor: "rgba(74, 92, 74, 0.9)",
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
    backgroundColor: "rgba(74, 92, 74, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateOverlayText: {
    fontSize: 9,
    color: "#7a8a7a",
    fontFamily: "System",
    fontWeight: "500",
  },
  cardContent: {
    padding: 16,
  },
  titleWithAvailability: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  creationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5c4a",
    flex: 1,
    marginRight: 8,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  creationDescription: {
    fontSize: 14,
    color: "#7a8a7a",
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  creatorLabel: {
    fontSize: 12,
    color: "#7a8a7a",
    fontFamily: "System",
    fontWeight: "500",
  },
  creatorNameText: {
    fontSize: 12,
    color: "#4a5c4a",
    fontFamily: "System",
    fontWeight: "600",
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 12,
    color: "#7a8a7a",
    fontFamily: "System",
    fontWeight: "500",
    marginBottom: 6,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagItem: {
    backgroundColor: "#e8d5c4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#d4a574",
  },
  tagText: {
    fontSize: 10,
    color: "#8b6f47",
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.1,
  },
  moreTags: {
    fontSize: 10,
    color: "#8a9a8a",
    fontFamily: "System",
    fontStyle: "italic",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    backgroundColor: "#f5f5f4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryLabel: {
    fontSize: 10,
    color: "#4a5c4a",
    fontWeight: "600",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viewDetailsButton: {
    backgroundColor: "#4a5c4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  scrollToTopContainer: {
    alignItems: "center",
    paddingVertical: 8,
    paddingBottom: 15,
  },
  scrollToTopButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollToTopButtonText: {
    fontSize: 18,
    color: "#4a5c4a",
    fontWeight: "500",
    fontFamily: "System",
  },
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
});

export default ExploreScreen;
