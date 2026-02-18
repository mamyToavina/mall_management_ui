export interface AdminNavItem {
    label: string;
    icon: string;
    route?: string;
    children?: AdminNavItem[];
  }
  
  export const ADMIN_NAVIGATION: AdminNavItem[] = [
    /*{
      label: 'Dashboard',
      icon: '📊',
      route: '/admin/dashboard'
    },*/
    {
      label: 'Gestion Acheteurs',
      icon: '👤',
      route: '/admin/buyers'
    },
    {
      label: 'Gestion Credits',
      icon: '💳',
      route: '/admin/credits'
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
  