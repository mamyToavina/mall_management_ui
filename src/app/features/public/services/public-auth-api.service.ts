import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

export type PublicRegisterGender = 'Male' | 'Female' | 'Other';

export interface PublicRegisterPayload {
  pseudo: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  gender?: PublicRegisterGender;
  avatar?: File | null;
}

export interface PublicRegisterResponse {
  message: string;
  user: {
    id: string;
    pseudo: string;
    email: string;
    avatar: string | null;
    firstName?: string;
    lastName?: string;
    gender?: PublicRegisterGender;
    role: 'USER' | 'ADMIN' | 'BOUTIQUE';
    status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  };
}

export interface PublicApiFieldError {
  field: string;
  message: string;
}

export interface PublicApiErrorResponse {
  message?: string;
  errors?: PublicApiFieldError[];
}

@Injectable({ providedIn: 'root' })
export class PublicAuthApiService {
  private readonly http = inject(HttpClient);
  private readonly usersBaseUrl = `${environment.apiBaseUrl}/users`;

  registerUser(payload: PublicRegisterPayload) {
    const formData = new FormData();
    formData.set('pseudo', payload.pseudo);
    formData.set('email', payload.email);
    formData.set('password', payload.password);

    if (payload.firstName?.trim()) formData.set('firstName', payload.firstName.trim());
    if (payload.lastName?.trim()) formData.set('lastName', payload.lastName.trim());
    if (payload.gender) formData.set('gender', payload.gender);
    if (payload.avatar) formData.append('avatar', payload.avatar, payload.avatar.name);

    return this.http.post<PublicRegisterResponse>(`${this.usersBaseUrl}/registerUser`, formData);
  }
}
