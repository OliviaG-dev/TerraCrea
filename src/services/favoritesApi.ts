import { CreationsApi } from "./creationsApi";
import { CreationWithArtisan } from "../types/Creation";

export class FavoritesApi {
  /**
   * Récupère tous les favoris de l'utilisateur connecté
   */
  static async getUserFavorites(): Promise<CreationWithArtisan[]> {
    try {
      return await CreationsApi.getUserFavorites();
    } catch (error) {
      throw new Error("Impossible de récupérer vos favoris");
    }
  }

  /**
   * Ajoute une création aux favoris
   */
  static async addToFavorites(creationId: string): Promise<boolean> {
    try {
      return await CreationsApi.addToFavorites(creationId);
    } catch (error) {
      throw new Error("Impossible d'ajouter aux favoris");
    }
  }

  /**
   * Retire une création des favoris
   */
  static async removeFromFavorites(creationId: string): Promise<boolean> {
    try {
      return await CreationsApi.removeFromFavorites(creationId);
    } catch (error) {
      throw new Error("Impossible de retirer des favoris");
    }
  }

  /**
   * Vérifie si une création est dans les favoris
   */
  static async isFavorite(creationId: string): Promise<boolean> {
    try {
      return await CreationsApi.isFavorite(creationId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Bascule l'état favori d'une création
   */
  static async toggleFavorite(creationId: string): Promise<boolean> {
    try {
      return await CreationsApi.toggleFavorite(creationId);
    } catch (error) {
      throw new Error("Impossible de modifier les favoris");
    }
  }

  /**
   * Récupère le nombre total de favoris
   */
  static async getFavoritesCount(): Promise<number> {
    try {
      const favorites = await CreationsApi.getUserFavorites();
      return favorites.length;
    } catch (error) {
      return 0;
    }
  }
}
