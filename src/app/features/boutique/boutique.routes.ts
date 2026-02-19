import { Routes } from '@angular/router';
import { BoutiqueHomePageComponent } from './pages/boutique-home.component';

export const BOUTIQUE_ROUTES: Routes = [
  { path: 'home', component: BoutiqueHomePageComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
