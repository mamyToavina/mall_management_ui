export interface PublicPromotionBoutiqueDto {
  id: string;
  name: string;
  logo: string | null;
}

export interface PublicPromotionDto {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  currency: string;
  originalPrice: number;
  promoPrice: number;
  discountRate: number;
  boutique: PublicPromotionBoutiqueDto;
}

export interface PublicPromotionListResponseDto {
  data: PublicPromotionDto[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface PublicGeneralSettingsDto {
  mallAddress: string;
  mallLatitude: number;
  mallLongitude: number;
}

export interface PublicBoutiqueDto {
  id: string;
  name: string;
  slogan: string;
  activity: string;
  boxNumber: string | null;
  boxFloor: number | null;
  offerings: string;
  marketingTagline: string;
  locationDescription: string;
  description: string;
  rating: number;
  reviewsCount: number;
  logoUrl: string | null;
  coverUrl: string | null;
  highlights: string[];
}

export interface PublicBoutiqueProductDto {
  id: string;
  boutiqueId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  promoPrice: number | null;
  currency: string;
  imageUrl: string | null;
  stock: number;
}

export interface PublicBoutiqueListResponseDto {
  data: PublicBoutiqueDto[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface PublicBoutiqueDetailResponseDto {
  data: PublicBoutiqueDto;
}

export interface PublicBoutiqueProductsResponseDto {
  data: PublicBoutiqueProductDto[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface PublicReviewAuthorDto {
  id: string | null;
  pseudo: string;
  avatar: string | null;
}

export interface PublicBoutiqueReviewDto {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  author: PublicReviewAuthorDto;
}

export interface PublicBoutiqueReviewListResponseDto {
  data: PublicBoutiqueReviewDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UpsertMyBoutiqueReviewPayload {
  rating: number;
  comment: string;
}

export interface UpsertMyBoutiqueReviewResponseDto {
  message: string;
}
