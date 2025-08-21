import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { CommonHeader } from "../components";
import { Creation, CATEGORY_LABELS } from "../types/Creation";
import { useFavorites } from "../context/FavoritesContext";
import { COLORS, emptyStyles, loadingStyles } from "../utils";

export const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { user } = useUserContext();
  const { favorites, loading, error, removeFromFavorites, loadFavorites } =
    useFavorites();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Rafraîchir la liste quand on revient sur cet écran
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?.id) {
        loadFavorites();
      }
    });

    return unsubscribe;
  }, [navigation, user, loadFavorites]);

  const handleViewCreation = (creation: Creation) => {
    (navigation as any).navigate("CreationDetail", { creationId: creation.id });
  };

  const handleRemoveFavorite = async (creationId: string) => {
    await removeFromFavorites(creationId);
  };

  const renderFavoriteCard = (creation: Creation) => {
    const hasImage = creation.imageUrl && creation.imageUrl.trim() !== "";
    const imageHasError = imageErrors.has(creation.id);

    return (
      <View key={creation.id} style={styles.favoriteCard}>
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
            <View style={styles.statsLeft}>
              <Text style={styles.creationStat}>
                ⭐ {creation.rating.toFixed(1)}
              </Text>
              <Text style={styles.creationStat}>
                📊 {creation.reviewCount} avis
              </Text>
            </View>
            <Text style={styles.creationCategory}>
              {CATEGORY_LABELS[creation.category] || creation.category}
            </Text>
          </View>

          <View style={styles.creationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleViewCreation(creation)}
            >
              <Text style={styles.viewButtonText}>Voir plus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveFavorite(creation.id)}
            >
              <Text style={styles.removeButtonText}>Retirer</Text>
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
            Vous devez être connecté pour accéder à vos favoris.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Mes Favoris" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={loadingStyles.container}>
            <Text style={loadingStyles.text}>Chargement de vos favoris...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadFavorites}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : favorites.length === 0 ? (
          <View style={emptyStyles.container}>
            <Text style={emptyStyles.title}>Aucun favori</Text>
            <Text style={emptyStyles.description}>
              Vous n'avez pas encore ajouté de créations à vos favoris. Explorez
              les créations et ajoutez celles qui vous plaisent !
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate("Explore" as never)}
            >
              <Text style={styles.exploreButtonText}>
                Explorer les créations
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.favoritesList}>
            <Text style={styles.sectionTitle}>
              Vos favoris ({favorites.length})
            </Text>
            {favorites.map(renderFavoriteCard)}
          </View>
        )}
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
    padding: 20,
    width: "100%",
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  favoritesList: {
    flex: 1,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  favoriteCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  creationImage: {
    width: "100%",
    height: "100%",
  },
  creationContent: {
    padding: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.6,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  creationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  creationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  creationPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.accent,
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  creationDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  creationStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  creationStat: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  creationCategory: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  creationActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  viewButton: {
    backgroundColor: COLORS.secondary,
  },
  viewButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  removeButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
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
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
