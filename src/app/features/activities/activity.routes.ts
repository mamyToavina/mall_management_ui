import { Routes } from '@angular/router';
import { ActivitiesListPageComponent } from './pages/activities-list-page.component';
import { ActivityFormPageComponent } from './pages/activity-form-page.component';

export const ACTIVITY_ROUTES: Routes = [
  { path: '', component: ActivitiesListPageComponent },
  { path: 'new', component: ActivityFormPageComponent },
  { path: ':id/edit', component: ActivityFormPageComponent }
];
