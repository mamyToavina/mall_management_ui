import { Routes } from '@angular/router';
import { AdminBillingUploadPageComponent } from './pages/admin-billing-upload-page.component';

export const ADMIN_BILLING_ROUTES: Routes = [
  { path: 'upload', component: AdminBillingUploadPageComponent },
  { path: '', redirectTo: 'upload', pathMatch: 'full' }
];
