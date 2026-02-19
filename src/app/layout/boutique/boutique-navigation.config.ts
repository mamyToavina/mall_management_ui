export interface BoutiqueNavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

export const BOUTIQUE_NAVIGATION: BoutiqueNavItem[] = [
  {
    label: 'Accueil',
    icon: '??',
    route: '/boutique/home',
    exact: true
  }
];
