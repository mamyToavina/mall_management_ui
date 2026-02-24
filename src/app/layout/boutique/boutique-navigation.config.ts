export interface BoutiqueNavItem {
  label: string;
  icon: string;
  route?: string;
  exact?: boolean;
  children?: BoutiqueNavItem[];
}

export const BOUTIQUE_NAVIGATION: BoutiqueNavItem[] = [
  {
    label: 'Accueil',
    icon: '\u{1F3E0}',
    route: '/boutique/home',
    exact: true
  },
  {
    label: 'Gestion Produits',
    icon: '\u{1F4E6}',
    children: [
      {
        label: 'Catalogue',
        icon: '\u{1F4CB}',
        route: '/boutique/products',
        exact: true
      },
      {
        label: 'Ajouter Produit',
        icon: '\u2795',
        route: '/boutique/products/new',
        exact: true
      },
      {
        label: 'Stock Faible',
        icon: '\u26A0',
        route: '/boutique/products/low-stock',
        exact: true
      },
      {
        label: 'Mouvements Stock',
        icon: '\u{1F504}',
        route: '/boutique/products/stock-movements',
        exact: true
      },
      {
        label: 'Promotions',
        icon: '\u{1F3F7}',
        route: '/boutique/products/promotions',
        exact: true
      }
    ]
  },
  {
    label: 'Facturation',
    icon: '\u{1F4B0}',
    route: '/boutique/billing',
    exact: true
  },
  {
    label: 'Commandes',
    icon: '\u{1F4E8}',
    route: '/boutique/orders',
    exact: true
  },
  {
    label: 'Livraison',
    icon: '\u{1F69A}',
    route: '/boutique/delivery-settings',
    exact: true
  }
];
