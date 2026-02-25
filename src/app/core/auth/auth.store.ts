import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'ADMIN' | 'USER' | 'BOUTIQUE';

export interface AuthUser {
  id: string;
  pseudo: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  credit?: number;
  gender?: 'Male' | 'Female' | 'Other';
  status?: 'ACTIVE' | 'BLOCKED' | 'DELETED';
}

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private _user = signal<AuthUser | null>(null);
  private _accessToken = signal<string | null>(null);

  user = computed(() => this._user());
  accessToken = computed(() => this._accessToken());
  isAuthenticated = computed(() => !!this._accessToken());
  role = computed(() => this._user()?.role ?? null);

  setSession(user: AuthUser, token: string) {
    this._user.set(user);
    this._accessToken.set(token);
  }

  updateUser(patch: Partial<AuthUser>) {
    const current = this._user();
    if (!current) return;
    this._user.set({ ...current, ...patch });
  }

  clear() {
    this._user.set(null);
    this._accessToken.set(null);
  }
}
