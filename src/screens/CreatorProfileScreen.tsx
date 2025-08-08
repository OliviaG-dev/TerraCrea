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
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserContext } from "../context/UserContext";
import { NotificationToast } from "../components/NotificationToast";
import { CommonHeader } from "../components";
import { CreationWithArtisan } from "../types/Creation";
import { ScreenNavigationProp } from "../types/Navigation";
import { CreationsApi } from "../services/creationsApi";
import { COLORS, formatDate } from "../utils";
import { supabase } from "../services/supabase";

type CreatorProfileScreenNavigationProp =
  ScreenNavigationProp<"CreatorProfile">;

interface CreatorProfileScreenParams {
  artisanId: string;
}

export const CreatorProfileScreen = () => {
  const navigation = useNavigation<CreatorProfileScreenNavigationProp>();
  const route = useRoute();
  const { artisanId } = route.params as CreatorProfileScreenParams;
  const { user } = useUserContext();

  const [artisan, setArtisan] = useState<any>(null);
  const [creations, setCreations] = useState<CreationWithArtisan[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Charger les informations de l'artisan et ses créations
  const loadCreatorProfile = async () => {
    try {
      setLoading(true);

      // Récupérer toutes les créations pour trouver l'artisan
      const allCreations = await CreationsApi.getAllCreations();
      const artisanCreations = allCreations.filter(
        (c) => c.artisanId === artisanId
      );

      if (artisanCreations.length === 0) {
        throw new Error("Artisan non trouvé");
      }

      // Récupérer les données complètes de l'artisan depuis la table artisans
      const { data: artisanData, error: artisanError } = await supabase
        .from("artisans")
        .select("*")
        .eq("id", artisanId)
        .single();

      // Prendre les informations de base depuis la première création
      const baseArtisanInfo = artisanCreations[0].artisan;

      // Enrichir avec les données de la table artisans
      const enrichedArtisanInfo = {
        ...baseArtisanInfo,
        artisanProfile: {
          ...baseArtisanInfo.artisanProfile,
          specialties: artisanData?.specialties || [],
          establishedYear: artisanData?.established_year,
          description:
            artisanData?.bio || baseArtisanInfo.artisanProfile?.description,
          businessName:
            artisanData?.name || baseArtisanInfo.artisanProfile?.businessName,
          location:
            artisanData?.location || baseArtisanInfo.artisanProfile?.location,
          email: artisanData?.email || baseArtisanInfo.artisanProfile?.email,
          phone: artisanData?.phone || baseArtisanInfo.artisanProfile?.phone,
        },
      };

      setArtisan(enrichedArtisanInfo);
      setCreations(artisanCreations);
    } catch (error) {
      setNotification({
        visible: true,
        title: "❌ Erreur",
        message: "Impossible de charger le profil de l'artisan",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers une création spécifique
  const handleViewCreation = (creation: CreationWithArtisan) => {
    navigation.navigate("CreationDetail", { creationId: creation.id });
  };

  // Navigation vers l'édition (seulement pour le créateur lui-même)
  const handleEditProfile = () => {
    navigation.navigate("Profil");
  };

  useEffect(() => {
    loadCreatorProfile();
  }, [artisanId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CommonHeader
          title="Profil Artisan"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!artisan) {
    return (
      <SafeAreaView style={styles.container}>
        <CommonHeader
          title="Profil Artisan"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Artisan non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = user?.id === artisanId;

  const renderCreationCard = ({ item }: { item: CreationWithArtisan }) => (
    <TouchableOpacity
      style={styles.creationCard}
      onPress={() => handleViewCreation(item)}
    >
      <View style={styles.creationImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.creationImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.creationImagePlaceholder}>
            <Text style={styles.creationImagePlaceholderText}>📷</Text>
          </View>
        )}
      </View>

      <View style={styles.creationInfo}>
        <Text style={styles.creationTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.creationPrice}>{item.price}€</Text>
        <View style={styles.creationStats}>
          <Text style={styles.creationRating}>⭐ {item.rating.toFixed(1)}</Text>
          <Text style={styles.creationReviews}>({item.reviewCount} avis)</Text>
        </View>
        <Text style={styles.creationStatus}>
          {item.isAvailable ? "✅ Disponible" : "❌ Indisponible"}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        title="Profil Artisan"
        onBack={() => navigation.goBack()}
        rightButton={
          isOwnProfile
            ? {
                text: "Modifier",
                onPress: handleEditProfile,
              }
            : undefined
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* En-tête du profil */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {artisan.artisanProfile?.profileImageUrl ? (
              <Image
                source={{ uri: artisan.artisanProfile.profileImageUrl }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {artisan.displayName?.charAt(0) || "A"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.artisanName}>
              {artisan.displayName || "Artisan"}
            </Text>
            {artisan.artisanProfile?.location && (
              <Text style={styles.artisanLocation}>
                📍 {artisan.artisanProfile.location}
              </Text>
            )}
            {artisan.artisanProfile?.verified && (
              <View style={styles.verifiedContainer}>
                <Text style={styles.verifiedBadge}>✓ Vérifié</Text>
              </View>
            )}
            <Text style={styles.memberSince}>
              Membre depuis{" "}
              {formatDate(
                artisan.artisanProfile?.joinedAt || artisan.createdAt
              )}
            </Text>
            <View style={styles.specialtiesContainer}>
              {artisan.artisanProfile?.specialties &&
              artisan.artisanProfile.specialties.length > 0 ? (
                <View style={styles.specialtiesList}>
                  {artisan.artisanProfile.specialties.map(
                    (specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    )
                  )}
                </View>
              ) : (
                <Text style={styles.noSpecialtiesText}>
                  Aucune spécialité configurée
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Bio de l'artisan */}
        {artisan.artisanProfile?.description && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.bioText}>
              {artisan.artisanProfile.description}
            </Text>
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{creations.length}</Text>
              <Text style={styles.statLabel}>Créations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {creations.filter((c) => c.isAvailable).length}
              </Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(() => {
                  const averageRating =
                    creations.reduce((sum, c) => sum + c.rating, 0) /
                    Math.max(creations.length, 1);
                  return averageRating % 1 === 0
                    ? averageRating.toFixed(0)
                    : averageRating.toFixed(1);
                })()}
              </Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>

            {artisan.artisanProfile?.rating && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ⭐{" "}
                  {(() => {
                    const rating = artisan.artisanProfile.rating;
                    return rating % 1 === 0
                      ? rating.toFixed(0)
                      : rating.toFixed(1);
                  })()}
                </Text>
                <Text style={styles.statLabel}>Note artisan</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact (seulement si c'est le propre profil) */}
        {isOwnProfile && artisan.artisanProfile && (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Informations de contact</Text>
            <View style={styles.contactInfo}>
              {artisan.artisanProfile.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Email :</Text>
                  <Text style={styles.contactValue}>
                    {artisan.artisanProfile.email}
                  </Text>
                </View>
              )}
              {artisan.artisanProfile.phone && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Téléphone :</Text>
                  <Text style={styles.contactValue}>
                    {artisan.artisanProfile.phone}
                  </Text>
                </View>
              )}
              {!artisan.artisanProfile.phone && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Téléphone :</Text>
                  <Text style={styles.contactValue}>Non renseigné</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Liste des créations */}
        <View style={styles.creationsSection}>
          <Text style={styles.sectionTitle}>
            Créations ({creations.length})
          </Text>

          {creations.length === 0 ? (
            <View style={styles.emptyCreations}>
              <Text style={styles.emptyCreationsText}>
                Aucune création pour le moment
              </Text>
            </View>
          ) : (
            <FlatList
              data={creations}
              renderItem={renderCreationCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.creationsList}
            />
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
  profileHeader: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textOnPrimary,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  artisanName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  artisanLocation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  verifiedContainer: {
    marginBottom: 8,
  },
  verifiedBadge: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: "600",
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginBottom: 8,
  },
  specialtiesContainer: {
    marginTop: 8,
  },
  noSpecialtiesText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  bioSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  bioText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
  },

  specialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  specialtyTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 14,
    color: COLORS.textOnPrimary,
    fontWeight: "500",
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: "center",
    minWidth: 80,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    fontWeight: "500",
  },
  contactSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  contactInfo: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  contactValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  creationsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  emptyCreations: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyCreationsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  creationsList: {
    gap: 16,
    width: "100%",
  },
  creationCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  creationImageContainer: {
    width: "100%",
    height: 200,
  },
  creationImage: {
    width: "100%",
    height: "100%",
  },
  creationImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  creationImagePlaceholderText: {
    fontSize: 48,
    opacity: 0.6,
  },
  creationInfo: {
    padding: 16,
  },
  creationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  creationPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.accent,
    marginBottom: 8,
  },
  creationStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  creationRating: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  creationReviews: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  creationStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
