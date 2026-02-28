import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';

export const roleGuard = (roles: string[]): CanActivateFn => {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);
    const auth = inject(AuthService);
    const platformId = inject(PLATFORM_ID);

    const role = store.role();
    if (role && roles.includes(role)) {
      return true;
    }

    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    // Try to restore session if role not available yet.
    return auth.restoreSession().pipe(
      map((res) => {
        if (res?.user && res?.accessToken) {
          store.setSession(res.user, res.accessToken);
          if (roles.includes(res.user.role)) return true;
        }
        router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
};
  
