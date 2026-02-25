import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ActivityDto,
  ActivityListQuery,
  ActivityPublicDto,
  PaginatedResponse,
  UpsertActivityPayload
} from '../models/activity.models';

@Injectable({ providedIn: 'root' })
export class ActivitiesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/activities`;
  private readonly assetBaseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  readonly defaultImageUrl = '/assets/public-activity-placeholder.svg';

  getPublicUpcoming(query?: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(10, Number(query?.limit) || 10));
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));

    return this.http
      .get<PaginatedResponse<ActivityPublicDto>>(`${this.baseUrl}/public/upcoming`, { params })
      .pipe(
        map((res) => ({
          ...res,
          data: (res.data || []).map((item) => this.normalizePublic(item))
        }))
      );
  }

  list(query: ActivityListQuery) {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 10));

    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.published !== undefined) params = params.set('published', String(query.published));
    if (query.upcoming !== undefined) params = params.set('upcoming', String(query.upcoming));

    return this.http
      .get<PaginatedResponse<ActivityDto>>(this.baseUrl, { params })
      .pipe(map((res) => ({ ...res, data: res.data.map((item) => this.normalizeAdmin(item)) })));
  }

  getById(id: string) {
    return this.http
      .get<ActivityDto>(`${this.baseUrl}/${id}`)
      .pipe(map((item) => this.normalizeAdmin(item)));
  }

  create(payload: UpsertActivityPayload, image: File) {
    const formData = this.toFormData(payload, image);
    return this.http.post<ActivityDto>(this.baseUrl, formData).pipe(map((item) => this.normalizeAdmin(item)));
  }

  update(id: string, payload: UpsertActivityPayload) {
    return this.http
      .patch<ActivityDto>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((item) => this.normalizeAdmin(item)));
  }

  replacePhoto(id: string, image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http
      .patch<ActivityDto>(`${this.baseUrl}/${id}/photo`, formData)
      .pipe(map((item) => this.normalizeAdmin(item)));
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  private toFormData(payload: UpsertActivityPayload, image: File): FormData {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('dateIso', payload.dateIso);
    formData.append('durationDays', String(payload.durationDays));
    formData.append('location', payload.location);
    formData.append('tag', payload.tag);
    if (payload.isPublished !== undefined) {
      formData.append('isPublished', String(payload.isPublished));
    }
    return formData;
  }

  private normalizePublic(item: ActivityPublicDto): ActivityPublicDto {
    const raw = item as ActivityPublicDto & {
      _id?: string;
      date?: string;
      eventDate?: string;
      startDate?: string;
      startDateIso?: string;
      endDate?: string;
      endDateIso?: string;
    };
    const startDateIso = raw.startDateIso || raw.startDate || raw.dateIso || raw.eventDate || raw.date || '';
    const durationDays = Number(item.durationDays) || 1;
    const endDateIso = raw.endDateIso || raw.endDate || this.computeEndDateIso(startDateIso, durationDays);

    return {
      ...raw,
      id: raw.id || raw._id || '',
      startDateIso,
      endDateIso,
      dateIso: startDateIso,
      durationDays,
      imageUrl: this.toAbsoluteImageUrl(item.imageUrl)
    };
  }

  private normalizeAdmin(item: ActivityDto): ActivityDto {
    const raw = item as ActivityDto & {
      _id?: string;
      date?: string;
      eventDate?: string;
      startDate?: string;
      startDateIso?: string;
      endDate?: string;
      endDateIso?: string;
    };
    const startDateIso = raw.startDateIso || raw.startDate || raw.dateIso || raw.eventDate || raw.date || '';
    const durationDays = Number(item.durationDays) || 1;
    const endDateIso = raw.endDateIso || raw.endDate || this.computeEndDateIso(startDateIso, durationDays);

    return {
      ...raw,
      id: raw.id || raw._id || '',
      startDateIso,
      endDateIso,
      dateIso: startDateIso,
      durationDays,
      imageUrl: this.toAbsoluteImageUrl(item.imageUrl)
    };
  }

  private computeEndDateIso(startDateIso: string, durationDays: number): string {
    const start = new Date(startDateIso);
    if (Number.isNaN(start.getTime())) return '';
    const end = new Date(start);
    end.setDate(end.getDate() + Math.max(1, durationDays) - 1);
    return end.toISOString();
  }

  private toAbsoluteImageUrl(value: string): string {
    if (!value) return this.defaultImageUrl;
    if (/^https?:\/\//i.test(value)) return value;
    return `${this.assetBaseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }
}
