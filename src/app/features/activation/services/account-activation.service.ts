import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface CompleteBoutiqueProfilePayload {
  userId: string;
  token: string;
  password: string;
  pseudo: string;
  boutiqueName: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  onlineSalesEnabled?: boolean;
  logo?: string;
}

export interface CompleteBoutiqueProfileResponse {
  message: string;
  user: {
    id: string;
    email: string;
    pseudo: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
    isAccountCompleted: boolean;
  };
  boutique: {
    id: string;
    name: string;
    logo?: string;
    onlineSalesEnabled?: boolean;
    status: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AccountActivationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  completeBoutiqueProfile(payload: CompleteBoutiqueProfilePayload) {
    return this.http
      .post<CompleteBoutiqueProfileResponse>(`${this.baseUrl}/complete-boutique-profile`, payload)
      .pipe(
        catchError((err) => {
          const fallback = 'Activation impossible pour le moment.';
          const message =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : null) ||
            fallback;

          return throwError(() => new Error(message));
        })
      );
  }
}
