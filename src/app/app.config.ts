import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { AuthStore } from './core/auth/auth.store';
import { authInterceptor } from './core/auth/auth.interceptor';

function initAuth() {
  const authService = inject(AuthService);
  const store = inject(AuthStore);
  const platformId = inject(PLATFORM_ID);

  return async () => {
    // Never block app bootstrap on server-side route extraction.
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    try {
      const res: any = await firstValueFrom(
        authService.restoreSession().pipe(
          timeout(2500),
          catchError(() => of(null))
        )
      );

      if (res?.user && res?.accessToken) {
        store.setSession(res.user, res.accessToken);
      } else {
        store.clear();
      }

    } catch {
      store.clear();
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      multi: true
    }
  ],
};

