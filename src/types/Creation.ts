export interface Creation {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: CreationCategory;
  artisanId: string; // Référence à l'ID de l'artisan (User)
  materials: string[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
}

// Interface pour affichage avec données artisan jointes
export interface CreationWithArtisan extends Creation {
  categoryLabel?: string; // Label de la catégorie depuis la base de données
  artisan: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    displayName?: string; // Nom d'affichage calculé
    artisanProfile?: {
      businessName?: string;
      location?: string;
      verified: boolean;
      rating?: number;
    };
  };
}

export enum CreationCategory {
  JEWELRY = "jewelry",
  POTTERY = "pottery",
  DECORATION = "decoration",
  TEXTILES = "textiles",
  WOODWORK = "woodwork",
  METALWORK = "metalwork",
  OTHER = "other",
}

export const CATEGORY_LABELS: Record<CreationCategory, string> = {
  [CreationCategory.JEWELRY]: "Bijoux",
  [CreationCategory.POTTERY]: "Poterie",
  [CreationCategory.DECORATION]: "Décoration",
  [CreationCategory.TEXTILES]: "Textiles",
  [CreationCategory.WOODWORK]: "Bois",
  [CreationCategory.METALWORK]: "Métal",
  [CreationCategory.OTHER]: "Autre",
};

// Types pour la création/modification
export interface CreateCreationData {
  title: string;
  description: string;
  price: number;
  imageUrl?: string; // Optionnel car peut être null
  category: CreationCategory;
  materials: string[];
  tags: string[];
  artisanId: string; // Ajouté pour correspondre à l'API
}

export interface UpdateCreationData extends Partial<CreateCreationData> {
  isAvailable?: boolean;
}
