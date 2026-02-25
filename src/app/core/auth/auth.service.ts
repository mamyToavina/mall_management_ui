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

export interface MyProfileResponse {
  user: AuthUser;
}

export interface UpdateMyProfilePayload {
  pseudo?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  avatar?: File | null;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateMyProfileResponse {
  message: string;
  user: AuthUser;
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
          this.router.navigate(['/']);
        })
      );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/refresh`, {}, { withCredentials: true });
  }

  restoreSession(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/refresh`, {}, { withCredentials: true });
  }

  getMyProfile(): Observable<MyProfileResponse> {
    return this.http.get<MyProfileResponse>(`${environment.apiBaseUrl}/users/me`);
  }

  updateMyProfile(payload: UpdateMyProfilePayload): Observable<UpdateMyProfileResponse> {
    const formData = new FormData();
    if (payload.pseudo !== undefined) formData.set('pseudo', payload.pseudo.trim());
    if (payload.email !== undefined) formData.set('email', payload.email.trim());

    if (payload.firstName !== undefined) formData.set('firstName', payload.firstName.trim());
    if (payload.lastName !== undefined) formData.set('lastName', payload.lastName.trim());
    if (payload.gender !== undefined) formData.set('gender', payload.gender);
    if (payload.avatar) formData.append('avatar', payload.avatar, payload.avatar.name);
    if (payload.currentPassword) formData.set('currentPassword', payload.currentPassword);
    if (payload.newPassword) formData.set('newPassword', payload.newPassword);

    return this.http.patch<UpdateMyProfileResponse>(`${environment.apiBaseUrl}/users/me`, formData).pipe(
      tap((res) => {
        this.store.updateUser(res.user);
      })
    );
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
        this.router.navigate(['/']);
        break;
      case 'ACHETEUR':
        this.router.navigate(['/acheteur']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
