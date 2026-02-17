import { Routes } from '@angular/router';
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

      // route par défaut quand on arrive sur "/"
      { path: '', redirectTo: 'buyers', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
