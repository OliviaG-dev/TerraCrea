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
import { CommonHeader } from "../components";
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

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { isAuthenticated } = useUserContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CreationCategory | "all"
  >("all");
  const [searchResults, setSearchResults] = useState<CreationWithArtisan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { favorites, toggleFavorite } = useFavorites();

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

  const performSearch = async () => {
    if (!searchQuery.trim() && selectedCategory === "all") {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await CreationsApi.searchCreations(
        searchQuery,
        selectedCategory
      );
      setSearchResults(data);
    } catch (err) {
      setError(
        "Impossible de charger les résultats. Vérifiez votre connexion."
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      performSearch();
    }
  }, [selectedCategory]);

  const handleSearch = () => {
    performSearch();
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

  const handleBackToHome = () => {
    navigation.navigate("Home");
  };

  const renderSearchResult = ({ item }: { item: CreationWithArtisan }) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <TouchableOpacity
        style={[cardStyles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
        onPress={() => handleCreationPress(item)}
        activeOpacity={0.9}
      >
        <View style={cardStyles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={cardStyles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={cardStyles.favoriteButton}
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={cardStyles.favoriteIcon}>
              {isFavorite ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={cardStyles.content}>
          <Text style={cardStyles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={cardStyles.creator} numberOfLines={1}>
            par {item.artisan.name}
          </Text>
          <Text style={cardStyles.description} numberOfLines={3}>
            {item.description}
          </Text>
          <View style={cardStyles.footer}>
            <Text style={cardStyles.category}>
              {CATEGORY_LABELS[item.category]}
            </Text>
            <Text style={cardStyles.price}>{item.price}€</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={emptyStyles.container}>
          <Text style={emptyStyles.title}>Recherchez vos créations</Text>
          <Text style={emptyStyles.subtitle}>
            Utilisez la barre de recherche ci-dessus pour trouver des créations
            uniques
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
          <Text style={emptyStyles.subtitle}>{error}</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={emptyStyles.container}>
          <Text style={emptyStyles.title}>Aucun résultat trouvé</Text>
          <Text style={emptyStyles.subtitle}>
            Essayez de modifier vos critères de recherche
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Recherche" onBack={handleBackToHome} />

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une création..."
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

      {/* Catégories */}
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
              onPress={() => setSelectedCategory(category.key)}
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

      {/* Résultats */}
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
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
});
