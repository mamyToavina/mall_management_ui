import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const authService = inject(AuthService);
  const isRefreshRequest = req.url.includes('/auth/refresh');
  const isAuthRequest = req.url.includes('/auth/');

  const token = store.accessToken();

  if (token && !isRefreshRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  if (!token && !isRefreshRequest && !isAuthRequest) {
    return authService.restoreSession().pipe(
      switchMap((res: any) => {
        const user = res?.user;
        if (user && res?.accessToken) {
          store.setSession(user, res.accessToken);
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${res.accessToken}`
            }
          });
          return next(newReq);
        }
        return next(req);
      }),
      catchError(() => next(req))
    );
  }

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        if (isRefreshRequest) {
          store.clear();
          return throwError(() => err);
        }

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            const user = res?.user || store.user();
            if (!user || !res?.accessToken) {
              store.clear();
              return throwError(() => err);
            }
            store.setSession(user, res.accessToken);

            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`
              }
            });

            return next(newReq);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
