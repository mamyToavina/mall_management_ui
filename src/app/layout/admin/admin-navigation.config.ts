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
    icon: '\u{1F465}',
    route: '/admin/buyers'
  },
  {
    label: 'Gestion Credits',
    icon: '\u{1F4B3}',
    children: [
      { label: 'Generer', icon: '\u2795', route: '/admin/credits/generate' },
      { label: 'Liste', icon: '\u2261', route: '/admin/credits/list' },
      { label: 'Statistique', icon: '\u{1F4CA}', route: '/admin/credits/stats' }
    ]
  },
  {
    label: 'Gestion Activites',
    icon: '\u{1F4C5}',
    children: [
      { label: 'Liste', icon: '\u2261', route: '/admin/activities' },
      { label: 'Creer', icon: '\u2795', route: '/admin/activities/new' }
    ]
  },
  {
    label: 'Gestion Locataires',
    icon: '\u{1F3EC}',
    route: '/admin/tenants/wizard/user',
    exact: false
  },
  {
    label: 'Gestion Boxes',
    icon: '\u{1F4E6}',
    children: [
      { label: 'Liste', icon: '\u2261', route: '/admin/boxes' },
      { label: 'Creer', icon: '\u2795', route: '/admin/boxes/new' }
    ]
  }
];
