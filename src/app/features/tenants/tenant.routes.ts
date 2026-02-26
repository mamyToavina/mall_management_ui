import { Routes } from '@angular/router';
import { UserStepComponent } from './pages/user-step.component';
import { ContractStepComponent } from './pages/contract-step.component';
import { ContractsListPageComponent } from './pages/contracts-list-page.component';
import { GeneralSettingsPageComponent } from './pages/general-settings-page.component';

export const TENANTS_ROUTES: Routes = [
  { path: '', redirectTo: 'wizard/user', pathMatch: 'full' },
  { path: 'settings', component: GeneralSettingsPageComponent },
  { path: 'contracts', component: ContractsListPageComponent },
  { path: 'wizard/user', component: UserStepComponent },
  { path: 'wizard/contract', component: ContractStepComponent },
  { path: '**', redirectTo: 'wizard/user' },
];
