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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Creation, CreationCategory, CATEGORY_LABELS } from "../types/Creation";
import { CreationsApi, useFavorites } from "../services/creationsApi";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 480;

type ExploreScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Explore"
>;

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CreationCategory | "all"
  >("all");
  const [allCreations, setAllCreations] = useState<Creation[]>([]);
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
      let data: Creation[];

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
      console.error("Erreur lors du chargement des créations:", err);
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

  const isFavorite = (creationId: string) => {
    return favorites.some((fav) => fav.id === creationId);
  };

  const renderCreationCard = ({ item }: { item: Creation }) => (
    <TouchableOpacity style={styles.creationCard} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.creationImage}
          defaultSource={require("../../assets/logo.png")}
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.price}€</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite(item.id) && styles.favoriteButtonActive,
          ]}
          onPress={() => handleToggleFavorite(item.id)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.favoriteIcon,
              isFavorite(item.id) && styles.favoriteIconActive,
            ]}
          >
            {isFavorite(item.id) ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dateOverlay}>
          <Text style={styles.dateOverlayText}>
            {formatCreationDate(item.createdAt)}
          </Text>
        </View>

        <View style={styles.ratingOverlay}>
          <Text style={styles.ratingOverlayText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewOverlayText}>
            ({item.reviewCount} avis)
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.creationTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.availabilityDot,
              item.isAvailable ? styles.availableDot : styles.unavailableDot,
            ]}
          />
        </View>

        <Text style={styles.creationDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.creatorContainer}>
          <Text style={styles.creatorLabel}>Créateur: </Text>
          <Text style={styles.creatorNameText}>{item.artisan.name}</Text>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Tags:</Text>
            <View style={styles.tagsList}>
              {item.tags.slice(0, 4).map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {item.tags.length > 4 && (
                <Text style={styles.moreTags}>+{item.tags.length - 4}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.categoryTag}>
        <Text style={styles.categoryText}>
          {CATEGORY_LABELS[item.category]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a5c4a" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>😕 {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCreations}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une création..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.categoryGrid}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === item.key && styles.categoryButtonActive,
                ]}
                onPress={() =>
                  setSelectedCategory(item.key as CreationCategory | "all")
                }
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === item.key &&
                      styles.categoryButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {allCreations.length} création
            {allCreations.length > 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.scrollableGrid}>
          {allCreations.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.creationsGrid}>
              {allCreations.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  {renderCreationCard({ item })}
                </View>
              ))}
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
    height: 220, // Hauteur réduite pour l'image
  },
  creationImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f4",
  },
  priceTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(45, 58, 45, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
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
  ratingOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
    minHeight: 240, // Hauteur réduite pour être plus compact
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
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

  tagsContainer: {
    marginBottom: 20,
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

  categoryTag: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#f5f6f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#e8e9e8",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: 10,
    color: "#8a9a8a",
    fontWeight: "500",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
});

export default ExploreScreen;
