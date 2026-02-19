export interface AdminNavItem {
  label: string;
  icon: string;
  route?: string;
  exact?: boolean;
  children?: AdminNavItem[];
}

export const ADMIN_NAVIGATION: AdminNavItem[] = [
  {
    label: 'Gestion Acheteurs',
    icon: '👥',
    route: '/admin/buyers'
  },
  {
    label: 'Gestion Credits',
    icon: '💳',
    route: '/admin/credits'
  },
  {
    label: 'Gestion Locataires',
    icon: '🏬',
    route: '/admin/tenants/wizard/user',
    exact: false
  },
  {
    label: 'Gestion Boxes',
    icon: '📦',
    children: [
      { label: 'Liste', icon: '≡', route: '/admin/boxes' },
      { label: 'Créer', icon: '＋', route: '/admin/boxes/new' }
    ]
  }
];
