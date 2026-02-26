import { Routes } from '@angular/router';
import { AdminBillingUploadPageComponent } from './pages/admin-billing-upload-page.component';
import { AdminBillingHistoryPageComponent } from './pages/admin-billing-history-page.component';

export const ADMIN_BILLING_ROUTES: Routes = [
  { path: 'upload', component: AdminBillingUploadPageComponent },
  { path: 'history', component: AdminBillingHistoryPageComponent },
  { path: '', redirectTo: 'upload', pathMatch: 'full' }
];
