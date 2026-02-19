import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateBoutiqueContractDto,
  CreateTenantApiRequest,
  CreateTenantApiResponse
} from '../models/tenant.models';
import { environment } from '../../../../environments/environment';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoutiqueService {
  constructor(private http: HttpClient) {}

  createUserAndContract(dto: CreateBoutiqueContractDto) {
    const payload: CreateTenantApiRequest = {
      firstName: dto.user.firstName,
      lastName: dto.user.lastName,
      email: dto.user.email,
      boxId: dto.user.boxId,
      contractData: dto.contract
    };

    return this.http
      .post<CreateTenantApiResponse>(`${environment.apiBaseUrl}/admin/create-tenant`, payload)
      .pipe(
        catchError((err) => {
          const fallback = 'Erreur lors de la creation du locataire';
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
