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
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonHeader, CreationCard } from "../components";
import {
  CreationWithArtisan,
  CreationCategory,
  CATEGORY_LABELS,
} from "../types/Creation";
import { CreationsApi } from "../services/creationsApi";
import { useFavorites } from "../context/FavoritesContext";
import { ScreenNavigationProp } from "../types/Navigation";
import { useUserContext } from "../context/UserContext";
import { COLORS, cardStyles, emptyStyles, loadingStyles } from "../utils";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 460;

type SearchScreenNavigationProp = ScreenNavigationProp<"Search">;

type SearchType = "creations" | "creators" | "cities";

interface SearchResult {
  type: SearchType;
  data: any[];
  cityStats?: { city: string; creatorCount: number; creationCount: number };
}

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { isAuthenticated } = useUserContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CreationCategory | "all"
  >("all");
  const [selectedSearchType, setSelectedSearchType] =
    useState<SearchType>("creations");
  const [searchResults, setSearchResults] = useState<SearchResult>({
    type: "creations",
    data: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Charger les données par défaut au montage du composant
  useEffect(() => {
    loadDefaultData();
  }, []);

  // Charger les données par défaut selon le type sélectionné
  const loadDefaultData = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(false);

    try {
      let data: any[] = [];

      switch (selectedSearchType) {
        case "creations":
          // Utiliser searchCreations avec la catégorie sélectionnée pour le filtrage
          data = await CreationsApi.searchCreations("", selectedCategory);
          setSearchResults({ type: selectedSearchType, data });
          break;
        case "creators":
          data = await CreationsApi.getAllCreators();
          setSearchResults({ type: selectedSearchType, data });
          break;
        case "cities":
          // Pour les villes, on garde un état vide par défaut
          setSearchResults({ type: selectedSearchType, data: [] });
          break;
      }
    } catch (err) {
      setError("Impossible de charger les données. Vérifiez votre connexion.");
      setSearchResults({ type: selectedSearchType, data: [] });
    } finally {
      setLoading(false);
    }
  };

  // Composant SVG pour la loupe personnalisée
  const SearchIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const categories = [
    { key: "all", label: "Tout" },
    ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      key: key as CreationCategory,
      label,
    })),
  ];

  const searchTypes = [
    { key: "creations", label: "Créations", icon: "" },
    { key: "creators", label: "Créateurs", icon: "" },
    { key: "cities", label: "Villes", icon: "" },
  ];

  const performSearch = async () => {
    // Si pas de terme de recherche et catégorie "all", charger les données par défaut
    if (
      !searchQuery.trim() &&
      selectedCategory === "all" &&
      selectedSearchType !== "cities"
    ) {
      loadDefaultData();
      return;
    }

    // Si recherche par ville sans terme, ne rien faire
    if (selectedSearchType === "cities" && !searchQuery.trim()) {
      setSearchResults({ type: selectedSearchType, data: [] });
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let data: any[] = [];

      switch (selectedSearchType) {
        case "creations":
          data = await CreationsApi.searchCreations(
            searchQuery,
            selectedCategory
          );
          setSearchResults({ type: selectedSearchType, data });
          break;
        case "creators":
          if (searchQuery.trim()) {
            data = await CreationsApi.searchCreators(searchQuery);
          } else {
            data = await CreationsApi.getAllCreators();
          }
          setSearchResults({ type: selectedSearchType, data });
          break;
        case "cities":
          const cityResult = await CreationsApi.searchByCity(searchQuery);
          setSearchResults({
            type: selectedSearchType,
            data: cityResult.creations,
            cityStats: cityResult.cityStats,
          });
          break;
      }
    } catch (err) {
      setError(
        "Impossible de charger les résultats. Vérifiez votre connexion."
      );
      setSearchResults({ type: selectedSearchType, data: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      performSearch();
    } else {
      // Si pas de recherche active, charger les données par défaut
      loadDefaultData();
    }
  }, [selectedCategory, selectedSearchType]);

  const handleSearch = () => {
    if (!searchQuery.trim() && selectedSearchType !== "cities") {
      // Si pas de terme de recherche, charger les données par défaut
      loadDefaultData();
    } else {
      performSearch();
    }
  };

  const handleToggleFavorite = async (creationId: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour ajouter des favoris.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await toggleFavorite(creationId);
    } catch (err) {
      Alert.alert(
        "Erreur",
        "Impossible de modifier les favoris. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    }
  };

  const handleCreationPress = (creation: CreationWithArtisan) => {
    navigation.navigate("CreationDetail", { creationId: creation.id });
  };

  const handleCreatorPress = (creator: any) => {
    navigation.navigate("CreatorProfile", { artisanId: creator.id });
  };

  const handleBackToHome = () => {
    navigation.navigate("Home");
  };

  const renderCreationResult = ({ item }: { item: CreationWithArtisan }) => {
    const isItemFavorite = isFavorite(item.id);

    return (
      <CreationCard
        item={item}
        isFavorite={isItemFavorite}
        onToggleFavorite={handleToggleFavorite}
        onPress={handleCreationPress}
        isAuthenticated={isAuthenticated}
      />
    );
  };

  const renderCreatorResult = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.creatorCard}
        onPress={() => handleCreatorPress(item)}
        activeOpacity={0.95}
      >
        <View style={styles.creatorCardContent}>
          <View style={styles.creatorAvatarContainer}>
            {item.artisanProfile?.profileImage || item.profileImage ? (
              <Image
                source={{
                  uri: item.artisanProfile?.profileImage || item.profileImage,
                }}
                style={styles.creatorAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.creatorAvatarPlaceholder}>
                <Text style={styles.creatorAvatarInitial}>
                  {(
                    item.artisanProfile?.businessName ||
                    item.displayName ||
                    "A"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
            {item.artisanProfile?.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName} numberOfLines={1}>
              {item.artisanProfile?.businessName ||
                item.displayName ||
                "Artisan"}
            </Text>
            <View style={styles.creatorLocationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.creatorLocation} numberOfLines={1}>
                {item.artisanProfile?.location || "Localisation non précisée"}
              </Text>
            </View>
            <View style={styles.specialtiesContainer}>
              {item.artisanProfile?.specialties
                ?.slice(0, 2)
                .map((specialty: string, index: number) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              {(!item.artisanProfile?.specialties ||
                item.artisanProfile.specialties.length === 0) && (
                <View style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>Artisan</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.creatorStats}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>
                {item.rating?.toFixed(1) || "0.0"}
              </Text>
            </View>
            <View style={styles.salesContainer}>
              <Text style={styles.salesIcon}>🛍️</Text>
              <Text style={styles.creatorSales}>
                {item.artisanProfile?.totalSales || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCityResult = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.cityResultCard}
        onPress={() => {
          // Naviguer vers une vue des créations de cette ville
          setSelectedSearchType("creations");
          setSearchQuery(item.city);
          performSearch();
        }}
        activeOpacity={0.95}
      >
        <View style={styles.cityResultCardContent}>
          <View style={styles.cityHeader}>
            <View style={styles.cityIconContainer}>
              <Text style={styles.cityIcon}>🏙️</Text>
            </View>
            <Text style={styles.cityName}>{item.city}</Text>
          </View>

          <View style={styles.cityStatsContainer}>
            <View style={styles.cityStat}>
              <Text style={styles.cityStatIcon}>👨‍🎨</Text>
              <Text style={styles.cityStatLabel}>Créateurs</Text>
              <Text style={styles.cityStatValue}>{item.creatorCount}</Text>
            </View>
            <View style={styles.cityStatDivider} />
            <View style={styles.cityStat}>
              <Text style={styles.cityStatIcon}>🎨</Text>
              <Text style={styles.cityStatLabel}>Créations</Text>
              <Text style={styles.cityStatValue}>{item.creationCount}</Text>
            </View>
          </View>

          <View style={styles.cityAction}>
            <Text style={styles.cityActionText}>Voir les créations</Text>
            <Text style={styles.cityActionArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResult = ({ item }: { item: any }) => {
    switch (selectedSearchType) {
      case "creations":
        return renderCreationResult({ item });
      case "creators":
        return renderCreatorResult({ item });
      case "cities":
        // Pour les villes, on affiche directement les créations avec CreationCard
        return renderCreationResult({ item });
      default:
        return null;
    }
  };

  const renderEmptyState = () => {
    if (!hasSearched && searchResults.data.length === 0) {
      return (
        <View style={emptyStyles.container}>
          <Text style={emptyStyles.title}>
            Chargement des{" "}
            {selectedSearchType === "creations"
              ? "créations"
              : selectedSearchType === "creators"
              ? "créateurs"
              : "villes"}
          </Text>
          <Text style={emptyStyles.description}>
            {selectedSearchType === "creations"
              ? "Toutes les créations disponibles sont en cours de chargement..."
              : selectedSearchType === "creators"
              ? "Tous les créateurs disponibles sont en cours de chargement..."
              : "Recherchez une ville pour voir les créations disponibles"}
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={loadingStyles.container}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={loadingStyles.text}>Recherche en cours...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={emptyStyles.container}>
          <Text style={emptyStyles.title}>Erreur de recherche</Text>
          <Text style={emptyStyles.description}>{error}</Text>
        </View>
      );
    }

    if (searchResults.data.length === 0) {
      return (
        <View style={emptyStyles.container}>
          <Text style={emptyStyles.title}>
            {selectedSearchType === "cities"
              ? `Aucune création trouvée à ${searchQuery}`
              : "Aucun résultat trouvé"}
          </Text>
          <Text style={emptyStyles.description}>
            {selectedSearchType === "cities"
              ? "Essayez une autre ville ou vérifiez l'orthographe"
              : "Essayez de modifier vos critères de recherche"}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Recherche" onBack={handleBackToHome} />

      {/* Types de recherche */}
      <View style={styles.searchTypesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.searchTypesScroll}
        >
          {searchTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.searchTypeButton,
                selectedSearchType === type.key &&
                  styles.searchTypeButtonActive,
              ]}
              onPress={() => setSelectedSearchType(type.key as SearchType)}
              activeOpacity={0.8}
            >
              <Text style={styles.searchTypeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.searchTypeText,
                  selectedSearchType === type.key &&
                    styles.searchTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              selectedSearchType === "creations"
                ? "Rechercher une création..."
                : selectedSearchType === "creators"
                ? "Rechercher un créateur..."
                : "Rechercher une ville (ex: Lyon, Paris)..."
            }
            placeholderTextColor="#8a9a8a"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <SearchIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Catégories (uniquement pour les créations) */}
      {selectedSearchType === "creations" && (
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
                onPress={() =>
                  setSelectedCategory(category.key as CreationCategory | "all")
                }
                activeOpacity={0.8}
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
      )}

      {/* Résultats */}
      <FlatList
        data={searchResults.data}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          selectedSearchType === "cities" &&
          searchQuery.trim() &&
          searchResults.cityStats ? (
            <View style={styles.cityCardContainer}>
              <View style={styles.cityCard}>
                <View style={styles.cityCardContent}>
                  <View style={styles.cityCardHeader}>
                    <Text style={styles.cityCardIcon}>🏙️</Text>
                    <Text style={styles.cityCardTitle}>
                      {searchResults.cityStats.city}
                    </Text>
                  </View>
                  <View style={styles.cityCardStats}>
                    <View style={styles.cityCardStat}>
                      <Text style={styles.cityCardStatIcon}>👨‍🎨</Text>
                      <Text style={styles.cityCardStatLabel}>Artisans</Text>
                      <Text style={styles.cityCardStatValue}>
                        {searchResults.cityStats.creatorCount}
                      </Text>
                    </View>
                    <View style={styles.cityCardStatDivider} />
                    <View style={styles.cityCardStat}>
                      <Text style={styles.cityCardStatIcon}>🎨</Text>
                      <Text style={styles.cityCardStatLabel}>Créations</Text>
                      <Text style={styles.cityCardStatValue}>
                        {searchResults.cityStats.creationCount}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },
  searchTypesContainer: {
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
    alignItems: "center",
  },
  searchTypesScroll: {
    paddingHorizontal: HORIZONTAL_PADDING,
    alignItems: "center",
    justifyContent: "center",
  },
  searchTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f4",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  searchTypeIcon: {
    fontSize: 16,
    marginRight: 0,
  },
  searchTypeText: {
    fontSize: 14,
    color: "#8a9a8a",
    fontWeight: "600",
    fontFamily: "System",
  },
  searchTypeTextActive: {
    color: "#fff",
  },
  // Styles pour le conteneur de centrage de la carte de ville
  cityCardContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  // Styles pour la carte de ville
  cityCard: {
    backgroundColor: "#fff",
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e9e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: "100%",
    maxWidth: 300,
  },
  cityCardContent: {
    padding: 12,
    width: "100%",
  },
  cityCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    width: "100%",
  },
  cityCardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cityCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5c4a",
    textAlign: "center",
    flex: 1,
  },
  cityCardStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cityCardStat: {
    alignItems: "center",
    flex: 1,
  },
  cityCardStatIcon: {
    fontSize: 14,
    marginBottom: 1,
  },
  cityCardStatLabel: {
    fontSize: 10,
    color: "#6a7a6a",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 1,
  },
  cityCardStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5a6b5a",
    textAlign: "center",
  },
  cityCardStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e8e9e8",
    marginHorizontal: 12,
  },

  searchContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9e8",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e8e9e8",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fafaf9",
    color: "#4a5c4a",
    fontFamily: "System",
    marginRight: 8,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    paddingVertical: 4,
    backgroundColor: "#fafaf9",
    width: "100%",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
    width: "100%",
  },
  categoryButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
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
  resultsContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  separator: {
    height: 16,
  },

  // Styles pour les cartes créateurs
  creatorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: CARD_WIDTH,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  creatorCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  creatorAvatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  creatorAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  creatorAvatarInitial: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "700",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  verifiedIcon: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  creatorInfo: {
    flex: 1,
    marginRight: 16,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  creatorLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  creatorLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  creatorStats: {
    alignItems: "flex-end",
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.warning,
  },
  salesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  salesIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  creatorSales: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // Styles pour les cartes villes (résultats de recherche)
  cityResultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: CARD_WIDTH,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cityResultCardContent: {
    alignItems: "center",
  },
  cityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cityIcon: {
    fontSize: 24,
  },
  cityName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },
  cityStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cityStat: {
    alignItems: "center",
    flex: 1,
  },
  cityStatIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  cityStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cityStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  cityStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray,
    marginHorizontal: 20,
  },
  cityAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cityActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  cityActionArrow: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
