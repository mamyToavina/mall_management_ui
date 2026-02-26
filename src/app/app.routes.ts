/*import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'buyers',
        loadChildren: () =>
          import('./features/buyers/buyers.routes').then(m => m.BUYERS_ROUTES),
      },
      {
        path: 'boxes',
        loadChildren: () =>
          import('./features/boxes/boxes.routes').then(m => m.BOXES_ROUTES),
      },
      {
        path: 'tenants',
        loadChildren: () =>
          import('./features/tenants/tenant.routes').then(m => m.TENANTS_ROUTES),
      },

      {
        path: 'credits',
        loadChildren: () =>
          import('./features/credit/credit.routes').then(m => m.CREDIT_ROUTES),
      },

      // route par défaut quand on arrive sur "/"
      { path: '', redirectTo: 'buyers', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];*/

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { LoginComponent } from './features/login/login.component';
import { ActivateAccountComponent } from './features/activation/pages/activate-account.component';

export const routes: Routes = [

  // ===== PUBLIC ROUTES =====
  /*{
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized.component')
        .then(m => m.UnauthorizedComponent)
  },*/

  { path: 'login', component: LoginComponent },
  { path: 'activate-account', component: ActivateAccountComponent },

  // ===== ADMIN AREA =====
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])], 
    loadComponent: () =>
      import('./layout/admin/admin-layout.component')
        .then(m => m.AdminLayoutComponent),

    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent
          )
      },

      {
        path: 'buyers',
        loadChildren: () =>
          import('./features/buyers/buyers.routes')
            .then(m => m.BUYERS_ROUTES),
      },

      {
        path: 'boxes',
        loadChildren: () =>
          import('./features/boxes/boxes.routes')
            .then(m => m.BOXES_ROUTES),
      },

      {
        path: 'credits',
        loadChildren: () =>
          import('./features/credit/credit.routes')
            .then(m => m.CREDIT_ROUTES),
      },
      {
        path: 'activities',
        canActivate: [roleGuard(['ADMIN'])],
        loadChildren: () =>
          import('./features/activities/activity.routes')
            .then(m => m.ACTIVITY_ROUTES),
      },
      {
        path: 'tenants',
        canActivate: [roleGuard(['ADMIN'])],
        loadChildren: () =>
          import('./features/tenants/tenant.routes')
            .then(m => m.TENANTS_ROUTES),
      },
      {
        path: 'billing',
        canActivate: [roleGuard(['ADMIN'])],
        loadChildren: () =>
          import('./features/admin-billing/admin-billing.routes')
            .then(m => m.ADMIN_BILLING_ROUTES),
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ===== BOUTIQUE AREA =====
  {
    path: 'boutique',
    canActivate: [authGuard, roleGuard(['BOUTIQUE'])],
    loadComponent: () =>
      import('./layout/boutique/boutique-layout.component')
        .then(m => m.BoutiqueLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/boutique/boutique.routes')
            .then(m => m.BOUTIQUE_ROUTES),
      }
    ]
  },

  // ===== PUBLIC AREA =====
  {
    path: '',
    loadComponent: () =>
      import('./layout/public/public-layout.component')
        .then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/public/public.routes')
            .then(m => m.PUBLIC_ROUTES),
      }
    ]
  },

  { path: '**', redirectTo: '' }
];

