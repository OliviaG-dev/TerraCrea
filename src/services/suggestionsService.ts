import { CreationsApi } from "./creationsApi";
import { CreationCategory, CATEGORY_LABELS } from "../types/Creation";

export interface SuggestionItem {
  id: string;
  text: string;
  type: string;
  icon: string;
}

class SuggestionsService {
  private static instance: SuggestionsService;
  private suggestionsCache: Map<string, SuggestionItem[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SuggestionsService {
    if (!SuggestionsService.instance) {
      SuggestionsService.instance = new SuggestionsService();
    }
    return SuggestionsService.instance;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: SuggestionItem[]): void {
    this.suggestionsCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private getCache(key: string): SuggestionItem[] | undefined {
    if (this.isCacheValid(key)) {
      return this.suggestionsCache.get(key);
    }
    return undefined;
  }

  async getCreationSuggestions(query: string): Promise<SuggestionItem[]> {
    const cacheKey = `creations_${query}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const creations = await CreationsApi.getAllCreations();
      const suggestions: SuggestionItem[] = [];

      // Suggestions de titres de créations
      const titleSuggestions = creations
        .filter(creation => 
          creation.title.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map(creation => ({
          id: `title_${creation.id}`,
          text: creation.title,
          type: "Titre de création",
          icon: "🎨"
        }));

      // Suggestions de matériaux
      const materialSuggestions = creations
        .flatMap(creation => creation.materials || [])
        .filter(material => 
          material.toLowerCase().includes(query.toLowerCase())
        )
        .filter((material, index, array) => array.indexOf(material) === index)
        .slice(0, 2)
        .map(material => ({
          id: `material_${material}`,
          text: material,
          type: "Matériau",
          icon: "🔧"
        }));

      // Suggestions de tags
      const tagSuggestions = creations
        .flatMap(creation => creation.tags || [])
        .filter(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        )
        .filter((tag, index, array) => array.indexOf(tag) === index)
        .slice(0, 2)
        .map(tag => ({
          id: `tag_${tag}`,
          text: tag,
          type: "Tag",
          icon: "🏷️"
        }));

      // Suggestions de catégories
      const categorySuggestions = Object.entries(CATEGORY_LABELS)
        .filter(([key, label]) => 
          label.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 2)
        .map(([key, label]) => ({
          id: `category_${key}`,
          text: label,
          type: "Catégorie",
          icon: "📂"
        }));

      suggestions.push(...titleSuggestions, ...materialSuggestions, ...tagSuggestions, ...categorySuggestions);
      
      // Supprimer les doublons basés sur le texte
      const uniqueSuggestions = suggestions.filter((suggestion, index, array) => 
        array.findIndex(s => s.text === suggestion.text) === index
      );

      this.setCache(cacheKey, uniqueSuggestions);
      return uniqueSuggestions;
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions de créations:", error);
      return [];
    }
  }

  async getCreatorSuggestions(query: string): Promise<SuggestionItem[]> {
    const cacheKey = `creators_${query}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const creators = await CreationsApi.getAllCreators();
      const suggestions: SuggestionItem[] = [];

      // Suggestions de noms d'artisans
      const nameSuggestions = creators
        .filter(creator => 
          creator.artisan_name?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map(creator => ({
          id: `creator_${creator.artisan_id}`,
          text: creator.artisan_name || "Artisan inconnu",
          type: "Artisan",
          icon: "👨‍🎨"
        }));

      // Suggestions de spécialités
      const specialtySuggestions = creators
        .flatMap(creator => creator.artisan_specialties || [])
        .filter(specialty => 
          specialty.toLowerCase().includes(query.toLowerCase())
        )
        .filter((specialty, index, array) => array.indexOf(specialty) === index)
        .slice(0, 2)
        .map(specialty => ({
          id: `specialty_${specialty}`,
          text: specialty,
          type: "Spécialité",
          icon: "⭐"
        }));

      // Suggestions de localisations
      const locationSuggestions = creators
        .filter(creator => 
          creator.artisan_location?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 2)
        .map(creator => ({
          id: `location_${creator.artisan_location}`,
          text: creator.artisan_location || "Localisation inconnue",
          type: "Localisation",
          icon: "📍"
        }));

      suggestions.push(...nameSuggestions, ...specialtySuggestions, ...locationSuggestions);
      
      // Supprimer les doublons basés sur le texte
      const uniqueSuggestions = suggestions.filter((suggestion, index, array) => 
        array.findIndex(s => s.text === suggestion.text) === index
      );

      this.setCache(cacheKey, uniqueSuggestions);
      return uniqueSuggestions;
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions de créateurs:", error);
      return [];
    }
  }

  async getCitySuggestions(query: string): Promise<SuggestionItem[]> {
    const cacheKey = `cities_${query}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const creations = await CreationsApi.getAllCreations();
      const citySuggestions: SuggestionItem[] = [];

      // Extraire toutes les villes uniques
      const cities = new Set<string>();
      creations.forEach(creation => {
        if (creation.artisan_location) {
          cities.add(creation.artisan_location);
        }
      });

      // Filtrer et créer les suggestions
      const filteredCities = Array.from(cities)
        .filter(city => city.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(city => ({
          id: `city_${city}`,
          text: city,
          type: "Ville",
          icon: "🏙️"
        }));

      this.setCache(cacheKey, filteredCities);
      return filteredCities;
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions de villes:", error);
      return [];
    }
  }

  async getSuggestions(query: string, type: "creations" | "creators" | "cities"): Promise<SuggestionItem[]> {
    if (query.trim().length < 2) return [];

    switch (type) {
      case "creations":
        return this.getCreationSuggestions(query);
      case "creators":
        return this.getCreatorSuggestions(query);
      case "cities":
        return this.getCitySuggestions(query);
      default:
        return [];
    }
  }

  clearCache(): void {
    this.suggestionsCache.clear();
    this.cacheExpiry.clear();
  }
}

export const suggestionsService = SuggestionsService.getInstance();
