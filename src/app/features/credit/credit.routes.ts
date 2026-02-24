import { Routes } from '@angular/router';
import { CreditGenerateComponent } from './components/credit-generate.component';
import { CreditPrintBatchComponent } from './components/credit-print-batch.component';
import { CreditListComponent } from './components/credit-list.component';
import { CreditStatsComponent } from './components/credit-stats.component';

export const CREDIT_ROUTES: Routes = [
  { path: 'generate', component: CreditGenerateComponent },
  { path: 'list', component: CreditListComponent },
  { path: 'stats', component: CreditStatsComponent },
  { path: 'print-batch', component: CreditPrintBatchComponent },
  { path: '', redirectTo: 'generate', pathMatch: 'full' }
];
