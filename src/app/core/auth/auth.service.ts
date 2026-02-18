/*import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthStore } from './auth.store';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:7878/api/auth';

  constructor(
    private http: HttpClient,
    private store: AuthStore,
    private router: Router
  ) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.api}/login`, credentials, {
      withCredentials: true
    }).subscribe(res => {
      this.store.setSession(res.user, res.accessToken);
      this.redirectByRole(res.user.role);
    });
  }

  logout() {
    this.http.post(`${this.api}/logout`, {}, {
      withCredentials: true
    }).subscribe(() => {
      this.store.clear();
      this.router.navigate(['/login']);
    });
  }

  refreshToken() {
    return this.http.post<any>(`${this.api}/refresh`, {}, {
      withCredentials: true
    });
  }

  private redirectByRole(role: string) {
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'BOUTIQUE':
        this.router.navigate(['/boutique']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  restoreSession() {
    return this.http.post<any>(`${this.api}/refresh`, {}, {
      withCredentials: true
    });
  }
  
}*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthStore, AuthUser } from './auth.store';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'ADMIN' | 'BOUTIQUE' | 'ACHETEUR';

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

  // ✅ Retourne un Observable pour gérer dans le component
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, credentials, { withCredentials: true })
      .pipe(
        tap(res => {
          // on peut stocker la session immédiatement
          this.store.setSession(res.user, res.accessToken);
          this.redirectByRole("ADMIN");
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

  redirectByRole(role: Role) {
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'BOUTIQUE':
        this.router.navigate(['/boutique']);
        break;
      case 'ACHETEUR':
        this.router.navigate(['/acheteur']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}


