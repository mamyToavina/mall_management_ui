/*import { Routes } from '@angular/router';
import { CreditGenerateComponent } from './components/credit-generate.component';
import { CreditPrintComponent } from './components/credit-print.component';

export const CREDIT_ROUTES: Routes = [
  { path: '', component: CreditGenerateComponent },
  { path: 'print/:id', component: CreditPrintComponent },
];*/

import { Routes } from '@angular/router';
import { CreditGenerateComponent } from './components/credit-generate.component';
import { CreditPrintBatchComponent } from './components/credit-print-batch.component';

export const CREDIT_ROUTES: Routes = [
  { path: '', component: CreditGenerateComponent },
  { path: 'print-batch', component: CreditPrintBatchComponent },
];

