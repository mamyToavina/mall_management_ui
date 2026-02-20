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
    icon: 'HM',
    route: '/boutique/home',
    exact: true
  },
  {
    label: 'Gestion Produits',
    icon: 'PR',
    children: [
      {
        label: 'Catalogue',
        icon: 'LS',
        route: '/boutique/products',
        exact: true
      },
      {
        label: 'Ajouter Produit',
        icon: 'NW',
        route: '/boutique/products/new',
        exact: true
      },
      {
        label: 'Stock Faible',
        icon: 'LF',
        route: '/boutique/products/low-stock',
        exact: true
      },
      {
        label: 'Mouvements Stock',
        icon: 'MV',
        route: '/boutique/products/stock-movements',
        exact: true
      },
      {
        label: 'Promotions',
        icon: 'PM',
        route: '/boutique/products/promotions',
        exact: true
      }
    ]
  }
];
