import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    loadChildren: () =>
      import('./features/buyers/buyers.routes')
        .then(m => m.BUYERS_ROUTES)
  },
  // Exemple login (optionnel)
  // { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },

  { path: '**', redirectTo: 'buyers' }
];

