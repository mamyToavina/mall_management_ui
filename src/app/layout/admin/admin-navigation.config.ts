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
    children: [
      { label: 'Nouveau locataire', icon: '\u2795', route: '/admin/tenants/wizard/user' },
      { label: 'Contrats', icon: '\u{1F4DC}', route: '/admin/tenants/contracts' }
    ]
  },
  {
    label: 'Paramétrage',
    icon: '\u2699',
    route: '/admin/tenants/settings'
  },
  {
    label: 'Gestion Boxes',
    icon: '\u{1F4E6}',
    children: [
      { label: 'Liste', icon: '\u2261', route: '/admin/boxes' },
      { label: 'Creer', icon: '\u2795', route: '/admin/boxes/new' }
    ]
  },
  {
    label: 'Facturation',
    icon: '\u{1F4C4}',
    children: [
      { label: 'Upload factures', icon: '\u2B06', route: '/admin/billing/upload' }
    ]
  }
];
