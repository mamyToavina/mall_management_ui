import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { API_BASE_URL } from '../../core/api.config';
import { CreateBoutiqueContractDto } from '../models/tenant.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoutiqueService {
  constructor(private http: HttpClient) {}
  createUserAndContract(dto: CreateBoutiqueContractDto) {
    return this.http.post(`${environment.apiBaseUrl}/admin/create-tenant`, dto);
  }
}
