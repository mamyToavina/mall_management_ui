import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError, timeout } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface CompleteBoutiqueProfilePayload {
  userId: string;
  token: string;
  password: string;
  pseudo: string;
  boutiqueName: string;
  activity?: string;
  offerings?: string;
  marketingTagline?: string;
  publicDescription?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  onlineSalesEnabled?: boolean;
  logo?: string;
  logoFile?: File;
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
    activity?: string;
    offerings?: string;
    marketingTagline?: string;
    publicDescription?: string;
    onlineSalesEnabled?: boolean;
    status: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AccountActivationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly requestTimeoutMs = 30000;

  constructor(private http: HttpClient) {}

  completeBoutiqueProfile(payload: CompleteBoutiqueProfilePayload) {
    const body = new FormData();
    body.append('userId', payload.userId);
    body.append('token', payload.token);
    body.append('password', payload.password);
    body.append('pseudo', payload.pseudo);
    body.append('boutiqueName', payload.boutiqueName);

    if (payload.activity) body.append('activity', payload.activity);
    if (payload.offerings) body.append('offerings', payload.offerings);
    if (payload.marketingTagline) body.append('marketingTagline', payload.marketingTagline);
    if (payload.publicDescription) body.append('publicDescription', payload.publicDescription);
    if (payload.firstName) body.append('firstName', payload.firstName);
    if (payload.lastName) body.append('lastName', payload.lastName);
    if (payload.gender) body.append('gender', payload.gender);
    if (payload.onlineSalesEnabled !== undefined) {
      body.append('onlineSalesEnabled', String(payload.onlineSalesEnabled));
    }
    if (payload.logoFile) {
      body.append('logo', payload.logoFile, payload.logoFile.name);
    } else if (payload.logo) {
      body.append('logo', payload.logo);
    }

    return this.http
      .post<CompleteBoutiqueProfileResponse>(`${this.baseUrl}/complete-boutique-profile`, body)
      .pipe(
        timeout(this.requestTimeoutMs),
        catchError((err) => {
          const fallback = 'Activation impossible pour le moment.';
          const message =
            err?.name === 'TimeoutError'
              ? "Le serveur met trop de temps à répondre. Veuillez réessayer."
              :
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : null) ||
            fallback;

          return throwError(() => new Error(message));
        })
      );
  }
}
