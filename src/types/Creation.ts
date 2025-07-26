export interface Creation {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: CreationCategory;
  artisan: {
    name: string;
    location: string;
    profileImage?: string;
  };
  materials: string[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  tags: string[];
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
