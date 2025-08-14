import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
  CommonHeader,
  FloatingFavoritesButton,
  FloatingSearchButton,
  CreationCard,
  AutoSuggestInput,
} from "../components";
import {
  CreationWithArtisan,
  CreationCategory,
  CATEGORY_LABELS,
} from "../types/Creation";
import { CreationsApi } from "../services/creationsApi";
import { suggestionsService, SuggestionItem } from "../services/suggestionsService";
import { useFavorites } from "../context/FavoritesContext";
import { ScreenNavigationProp } from "../types/Navigation";
import { useUserContext } from "../context/UserContext";
import { COLORS, cardStyles, emptyStyles, loadingStyles } from "../utils";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const CARD_HEIGHT = 460; // Réduit pour équilibrer image/contenu

type ExploreScreenNavigationProp = ScreenNavigationProp<"Explore">;

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const { isAuthenticated } = useUserContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CreationCategory | "all"
  >("all");
  const [allCreations, setAllCreations] = useState<CreationWithArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

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

  // Charger les suggestions quand la requête change
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Charger les suggestions
  const loadSuggestions = async () => {
    if (searchQuery.trim().length > 2) {
      try {
        const suggestions = await suggestionsService.getSuggestions(searchQuery, "creations");
        setSuggestions(suggestions);
      } catch (error) {
        console.error("Erreur lors du chargement des suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

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
    <CreationCard
      key={item.id}
      item={item}
      isFavorite={favorites.some((fav) => fav.id === item.id)}
      onToggleFavorite={handleToggleFavorite}
      onPress={(creation) => {
        navigation.navigate("CreationDetail", { creationId: creation.id });
      }}
      isAuthenticated={isAuthenticated}
    />
  );

  const renderHeader = () => (
    <CommonHeader
      title="Explorer les créations"
      onBack={() => navigation.navigate("Home")}
      backLabel="Retour à l'accueil"
      rightButton={
        !loading && !error && isAuthenticated
          ? {
              text: `♥ ${favorites.length}`,
              onPress: () => {}, // Pas d'action pour l'instant
              isFavorites: true,
            }
          : undefined
      }
    />
  );

  const renderEmptyState = () => (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.title}>
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
        <View style={loadingStyles.container} importantForAccessibility="yes">
          <ActivityIndicator
            size="large"
            color="#4a5c4a"
            accessible={true}
            accessibilityLabel="Chargement des créations en cours"
          />
          <Text
            style={loadingStyles.text}
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
        <AutoSuggestInput
          placeholder="Rechercher des créations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSuggestionSelect={(suggestion) => {
            setSearchQuery(suggestion.text);
          }}
          suggestions={suggestions}
          onSuggestionsFetchRequested={async (query) => {
            if (query.length > 2) {
              const suggestions = await suggestionsService.getSuggestions(query, "creations");
              setSuggestions(suggestions);
            } else {
              setSuggestions([]);
            }
          }}
          onSuggestionsClearRequested={() => setSuggestions([])}
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
        showsVerticalScrollIndicator={false}
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
                <View key={item.id}>{renderCreationCard(item)}</View>
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

      {/* Bouton flottant des favoris pour les utilisateurs connectés */}
      {isAuthenticated && <FloatingFavoritesButton />}

      {/* Bouton flottant de recherche pour les utilisateurs connectés */}
      {isAuthenticated && <FloatingSearchButton />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
    width: "100%",
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
    width: "100%",
  },
  creationsGrid: {
    width: "100%",
    maxWidth: width - HORIZONTAL_PADDING * 2,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: "100%",
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
  cardBorderContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 12, // Coins modérément arrondis
    overflow: "hidden",
    // Bordure sobre et élégante
    borderWidth: 1,
    borderColor: "#e2e8e0", // Couleur très subtile
    // Ombre très légère pour la profondeur
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    // Fond neutre
    backgroundColor: "#ffffff",
  },
});

export default ExploreScreen;
