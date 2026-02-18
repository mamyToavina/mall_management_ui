import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from './auth.store';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
