import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ContractRenewalPaginatedResponse,
  ContractStatus,
  CreateBoutiqueContractDto,
  CreateTenantApiRequest,
  CreateTenantApiResponse,
  ContractsPaginatedResponse,
  GeneralSettingsDto
} from '../models/tenant.models';
import { environment } from '../../../../environments/environment';
import { catchError, throwError, timeout } from 'rxjs';

const API_TIMEOUT_MS = 12000;

const extractApiErrorMessage = (err: any, fallback: string, endpointLabel: string) => {
  if (err?.name === 'TimeoutError') {
    return `Délai dépassé lors de l'appel ${endpointLabel}.`;
  }

  if (err?.status === 0) {
    return 'Serveur inaccessible. Vérifiez le backend et votre réseau.';
  }

  const rawString = typeof err?.error === 'string' ? err.error : '';
  if (rawString.includes('<!DOCTYPE html>') || rawString.includes('Cannot GET')) {
    return `Endpoint ${endpointLabel} indisponible sur le backend.`;
  }

  if (err?.status === 404) {
    return `Endpoint ${endpointLabel} introuvable sur le backend.`;
  }

  return (
    err?.error?.message ||
    err?.error?.error ||
    rawString ||
    fallback
  );
};

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
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors de la création du locataire.';
          const message = extractApiErrorMessage(err, fallback, '/admin/create-tenant');

          return throwError(() => new Error(message));
        })
      );
  }

  getGeneralSettings() {
    return this.http
      .get<GeneralSettingsDto>(`${environment.apiBaseUrl}/admin/settings/general`)
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors du chargement du paramétrage général.';
          const message = extractApiErrorMessage(err, fallback, '/admin/settings/general');
          return throwError(() => new Error(message));
        })
      );
  }

  updateGeneralSettings(payload: Partial<GeneralSettingsDto>) {
    return this.http
      .put<{ message: string; settings: GeneralSettingsDto }>(`${environment.apiBaseUrl}/admin/settings/general`, payload)
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors de la mise à jour du paramétrage.';
          const message = extractApiErrorMessage(err, fallback, '/admin/settings/general');

          return throwError(() => new Error(message));
        })
      );
  }

  getContracts(params: { page?: number; limit?: number; status?: ContractStatus } = {}) {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http
      .get<ContractsPaginatedResponse>(`${environment.apiBaseUrl}/admin/contracts`, { params: httpParams })
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors du chargement des contrats.';
          const message = extractApiErrorMessage(err, fallback, '/admin/contracts');

          return throwError(() => new Error(message));
        })
      );
  }

  updateContractStatus(contractId: string, status: 'ACTIVE' | 'TERMINATED') {
    return this.http
      .patch<{ message: string }>(`${environment.apiBaseUrl}/admin/contracts/${contractId}/status`, { status })
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors de la mise à jour du contrat.';
          const message = extractApiErrorMessage(err, fallback, '/admin/contracts/:id/status');

          return throwError(() => new Error(message));
        })
      );
  }

  listRenewalRequests(params: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    boutiqueId?: string;
  } = {}) {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.boutiqueId) httpParams = httpParams.set('boutiqueId', params.boutiqueId);

    return this.http
      .get<ContractRenewalPaginatedResponse>(`${environment.apiBaseUrl}/admin/contract-renewals`, { params: httpParams })
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors du chargement des demandes de renouvellement.';
          const message = extractApiErrorMessage(err, fallback, '/admin/contract-renewals');
          return throwError(() => new Error(message));
        })
      );
  }

  approveRenewalRequest(
    requestId: string,
    payload: {
      finalTerms: {
        durationMonths: number;
        monthlyRent: number;
        penaltyFee: number;
        penaltyGrowthFactor: number;
        terminationFee: number;
        onlineSalesCommissionPercent: number;
        notes?: string;
      };
      reviewNote?: string;
    }
  ) {
    return this.http
      .post<{ message: string }>(`${environment.apiBaseUrl}/admin/contract-renewals/${requestId}/approve`, payload)
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = "Erreur lors de l'approbation de la demande.";
          const message = extractApiErrorMessage(err, fallback, '/admin/contract-renewals/:id/approve');
          return throwError(() => new Error(message));
        })
      );
  }

  rejectRenewalRequest(requestId: string, reviewNote: string) {
    return this.http
      .post<{ message: string }>(`${environment.apiBaseUrl}/admin/contract-renewals/${requestId}/reject`, { reviewNote })
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError((err) => {
          const fallback = 'Erreur lors du rejet de la demande.';
          const message = extractApiErrorMessage(err, fallback, '/admin/contract-renewals/:id/reject');
          return throwError(() => new Error(message));
        })
      );
  }
}
