import { Routes } from '@angular/router';
import { BoxDetailsPageComponent } from './pages/box-details-page.component';
import { BoxesPageComponent } from './pages/boxes-list-page.component';
import { BoxFormPageComponent } from './pages/box-form-page.component';

export const BOXES_ROUTES: Routes = [
  { path: '', component: BoxesPageComponent },
  { path: 'new', component: BoxFormPageComponent },
  { path: ':id/edit', component: BoxFormPageComponent },
  { path: ':id', component: BoxDetailsPageComponent },
];

