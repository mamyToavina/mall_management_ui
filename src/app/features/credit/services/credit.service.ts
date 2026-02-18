import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credit } from '../model/credit.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  // Injection moderne sans constructeur
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/credit`;

  /**
   * Générer des crédits
   */
  generateCredit(adminId: string, value: number, quantity: number): Observable<Credit[]> {
    return this.http.post<Credit[]>(`${this.baseUrl}/generate`, { 
      adminId, 
      value, 
      quantity 
    });
  }

  /**
   * Lister les crédits (Approche standard RxJS)
   */
  listCredits(): Observable<Credit[]> {
    return this.http.get<Credit[]>(this.baseUrl);
  }

  /**
   * Marquer comme imprimé
   */
  markAsPrinted(id: string): Observable<Credit> {
    return this.http.patch<Credit>(`${this.baseUrl}/print/${id}`, {});
  }
}
