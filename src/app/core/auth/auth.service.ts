import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthStore, AuthUser } from './auth.store';

export type Role = 'ADMIN' | 'BOUTIQUE' | 'USER' | 'ACHETEUR';

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiBaseUrl}/auth`;

  constructor(
    private http: HttpClient,
    private store: AuthStore,
    private router: Router
  ) {}

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.store.setSession(res.user, res.accessToken);
          this.redirectByRole(res.user.role as Role);
        })
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.api}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.store.clear();
          this.router.navigate(['/login']);
        })
      );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/refresh`, {}, { withCredentials: true });
  }

  restoreSession(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/refresh`, {}, { withCredentials: true });
  }

  redirectByRole(role: Role): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'BOUTIQUE':
        this.router.navigate(['/boutique']);
        break;
      case 'USER':
        this.router.navigate(['/admin']);
        break;
      case 'ACHETEUR':
        this.router.navigate(['/acheteur']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
