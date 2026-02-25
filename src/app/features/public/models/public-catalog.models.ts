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

export interface PublicBoutiqueDto {
  id: string;
  name: string;
  slogan: string;
  activity: string;
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
