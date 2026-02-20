export type PromoProduct = {
  id: string;
  boutiqueId: string;
  boutiqueName: string;
  name: string;
  category: string;
  originalPrice: number;
  promoPrice: number;
  currency: string;
  imageUrl: string;
  badge: string;
};

export type BoutiqueSummary = {
  id: string;
  name: string;
  slogan: string;
  activity: string;
  description: string;
  rating: number;
  reviewsCount: number;
  logoUrl: string;
  coverUrl: string;
  highlights: string[];
};

export type BoutiqueProduct = {
  id: string;
  boutiqueId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  promoPrice?: number;
  currency: string;
  imageUrl: string;
  stock: number;
};

export type EventActivity = {
  id: string;
  title: string;
  description: string;
  dateIso: string;
  location: string;
  imageUrl: string;
  tag: string;
};

export const BOUTIQUES: BoutiqueSummary[] = [
  {
    id: 'techzone',
    name: 'TechZone Boutique',
    slogan: 'La tech qui simplifie votre quotidien',
    activity: 'High-tech & accessoires',
    description:
      'Boutique specialisee en smartphones, wearables et gadgets premium. Demonstrations produit en direct chaque week-end.',
    rating: 4.7,
    reviewsCount: 184,
    logoUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1400',
    highlights: ['Nouveautes hebdo', 'Garantie et SAV local', 'Paiement facilite']
  },
  {
    id: 'beauty-corner',
    name: 'Beauty Corner',
    slogan: 'Le meilleur de la beaute urbaine',
    activity: 'Cosmetique & skincare',
    description:
      'Selection tendance de soins, maquillage et parfums. Coaching beaute express et diagnostics de peau en boutique.',
    rating: 4.5,
    reviewsCount: 129,
    logoUrl: 'https://images.pexels.com/photos/6621460/pexels-photo-6621460.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverUrl: 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=1400',
    highlights: ['Conseil personnalise', 'Marques premium', 'Offres duo']
  },
  {
    id: 'street-fit',
    name: 'Street Fit Store',
    slogan: 'Style, confort, performance',
    activity: 'Mode urbaine & sneakers',
    description:
      'Marques urbaines, collections capsules et chaussures iconiques pour hommes et femmes. Nouvelles sorties chaque mois.',
    rating: 4.6,
    reviewsCount: 96,
    logoUrl: 'https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverUrl: 'https://images.pexels.com/photos/573271/pexels-photo-573271.jpeg?auto=compress&cs=tinysrgb&w=1400',
    highlights: ['Edition limitee', 'Lookbook saisonnier', 'Click & collect']
  },
  {
    id: 'media-spot',
    name: 'Media Spot TI',
    slogan: 'Creativite et contenu sans limite',
    activity: 'Photo, video & creation',
    description:
      'Equipements pour createurs: cameras, micros, eclairage et accessoires. Ateliers initiation le samedi.',
    rating: 4.8,
    reviewsCount: 142,
    logoUrl: 'https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverUrl: 'https://images.pexels.com/photos/273238/pexels-photo-273238.jpeg?auto=compress&cs=tinysrgb&w=1400',
    highlights: ['Studio demo', 'Ateliers createurs', 'Pack debutant']
  }
];

export const BOUTIQUE_PRODUCTS: BoutiqueProduct[] = [
  {
    id: 'p-tech-1',
    boutiqueId: 'techzone',
    name: 'Smartphone Nova X12',
    category: 'Electronique',
    description: 'Ecran AMOLED 120Hz, triple capteur photo, batterie longue duree.',
    price: 1499000,
    promoPrice: 1199000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 18
  },
  {
    id: 'p-tech-2',
    boutiqueId: 'techzone',
    name: 'Casque Audio Pulse Pro',
    category: 'Audio',
    description: 'Reduction de bruit active, autonomie 40h, son immersif.',
    price: 269000,
    promoPrice: 199000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 24
  },
  {
    id: 'p-beauty-1',
    boutiqueId: 'beauty-corner',
    name: 'Pack Soin Glow Ritual',
    category: 'Cosmetique',
    description: 'Routine complete eclat: nettoyant, serum vitamine C et creme hydratante.',
    price: 98000,
    promoPrice: 69000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/13753893/pexels-photo-13753893.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 32
  },
  {
    id: 'p-beauty-2',
    boutiqueId: 'beauty-corner',
    name: 'Palette Makeup Urban 24',
    category: 'Maquillage',
    description: '24 nuances longue tenue pour looks quotidiens et soiree.',
    price: 85000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/3373722/pexels-photo-3373722.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 17
  },
  {
    id: 'p-street-1',
    boutiqueId: 'street-fit',
    name: 'Sneakers Urban Move',
    category: 'Mode',
    description: 'Sneakers respirantes, semelle confort, design lifestyle moderne.',
    price: 189000,
    promoPrice: 139000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 12
  },
  {
    id: 'p-street-2',
    boutiqueId: 'street-fit',
    name: 'Hoodie Street Edition',
    category: 'Mode',
    description: 'Coupe oversize, tissu premium, collection capsule TI.',
    price: 129000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 20
  },
  {
    id: 'p-media-1',
    boutiqueId: 'media-spot',
    name: 'Camera Vlog Creator Kit',
    category: 'Photo',
    description: 'Capteur 4K, autofocus intelligent, kit micro + trepied inclus.',
    price: 739000,
    promoPrice: 589000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 9
  },
  {
    id: 'p-media-2',
    boutiqueId: 'media-spot',
    name: 'Micro Studio Voice X',
    category: 'Audio Pro',
    description: 'Micro condensateur pour podcast, streaming et voix off.',
    price: 159000,
    currency: 'Ar',
    imageUrl: 'https://images.pexels.com/photos/1647188/pexels-photo-1647188.jpeg?auto=compress&cs=tinysrgb&w=1200',
    stock: 27
  }
];

export const PROMO_PRODUCTS: PromoProduct[] = BOUTIQUE_PRODUCTS
  .filter((product) => product.promoPrice && product.promoPrice < product.price)
  .map((product) => {
    const boutique = BOUTIQUES.find((item) => item.id === product.boutiqueId);

    return {
      id: product.id,
      boutiqueId: product.boutiqueId,
      boutiqueName: boutique?.name ?? 'Boutique partenaire',
      name: product.name,
      category: product.category,
      originalPrice: product.price,
      promoPrice: product.promoPrice ?? product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      badge: `-${Math.round((((product.price - (product.promoPrice ?? product.price)) / product.price) * 100))}%`
    };
  });

export const EVENT_ACTIVITIES: EventActivity[] = [
  {
    id: 'event-1',
    title: 'TI Live Shopping Night',
    description:
      'Une soiree immersive avec offres flash, showcases boutiques et experiences premium jusqu a 22h.',
    dateIso: '2026-03-14T18:00:00+03:00',
    location: 'Atrium Central - TI Commercial',
    imageUrl: 'https://images.pexels.com/photos/374894/pexels-photo-374894.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tag: 'Shopping Event'
  },
  {
    id: 'event-2',
    title: 'Festival Street Food & Music',
    description:
      'Degustations exclusives, corners chefs invites et ambiance live pour toute la famille.',
    dateIso: '2026-03-22T11:00:00+03:00',
    location: 'Esplanade Nord - TI Commercial',
    imageUrl: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tag: 'Food & Music'
  },
  {
    id: 'event-3',
    title: 'Innovation Market Weekend',
    description:
      'Decouvrez les marques emergentes, demos interactives et animations tech pour petits et grands.',
    dateIso: '2026-04-05T10:00:00+03:00',
    location: 'Hall Est - TI Commercial',
    imageUrl: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1400',
    tag: 'Innovation'
  }
];
