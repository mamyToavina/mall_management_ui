import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/public-home-page.component').then((m) => m.PublicHomePageComponent)
  },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./pages/public-promotions-page.component').then((m) => m.PublicPromotionsPageComponent)
  },
  {
    path: 'boutiques',
    loadComponent: () =>
      import('./pages/public-boutiques-page.component').then((m) => m.PublicBoutiquesPageComponent)
  },
  {
    path: 'boutiques/:id',
    loadComponent: () =>
      import('./pages/public-boutique-details-page.component').then((m) => m.PublicBoutiqueDetailsPageComponent)
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/public-events-page.component').then((m) => m.PublicEventsPageComponent)
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/public-search-page.component').then((m) => m.PublicSearchPageComponent)
  },
  {
    path: 'panier',
    loadComponent: () =>
      import('./pages/public-cart-page.component').then((m) => m.PublicCartPageComponent)
  },
  {
    path: 'mes-commandes',
    loadComponent: () =>
      import('./pages/public-my-orders-page.component').then((m) => m.PublicMyOrdersPageComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/public-register-page.component').then((m) => m.PublicRegisterPageComponent)
  }
];
