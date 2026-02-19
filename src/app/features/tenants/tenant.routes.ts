import { Routes } from '@angular/router';
import { UserStepComponent } from './pages/user-step.component';
import { ContractStepComponent } from './pages/contract-step.component';

export const TENANTS_ROUTES: Routes = [
  { path: '', redirectTo: 'wizard/user', pathMatch: 'full' },
  { path: 'wizard/user', component: UserStepComponent },
  { path: 'wizard/contract', component: ContractStepComponent },
  { path: '**', redirectTo: 'wizard/user' },
];
