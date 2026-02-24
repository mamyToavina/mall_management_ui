import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivitiesApiService } from '../services/activities-api.service';
import { ActivityDto, PaginationMeta } from '../models/activity.models';

@Component({
  selector: 'app-activities-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activities-list-page.component.html',
  styleUrls: ['./activities-list-page.component.css']
})
export class ActivitiesListPageComponent {
  private readonly api = inject(ActivitiesApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activities = signal<ActivityDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedActivity = signal<ActivityDto | null>(null);

  readonly page = signal(1);
  readonly limit = signal(10);
  readonly search = signal('');
  readonly upcoming = signal(true);
  readonly published = signal<boolean | null>(null);
  readonly defaultActivityImage = '/assets/activity-placeholder.svg';
  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .list({
        page: this.page(),
        limit: this.limit(),
        search: this.search(),
        upcoming: this.upcoming(),
        published: this.published() === null ? undefined : this.published() ?? undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activities.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          const message = error?.error?.message || 'Chargement des activites impossible.';
          this.errorMessage.set(message);
        }
      });
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
    this.load();
  }

  onLimit(value: string) {
    const parsed = Number(value);
    this.limit.set(Number.isFinite(parsed) ? parsed : 10);
    this.page.set(1);
    this.load();
  }

  onPublished(value: string) {
    if (value === 'true') {
      this.published.set(true);
    } else if (value === 'false') {
      this.published.set(false);
    } else {
      this.published.set(null);
    }
    this.page.set(1);
    this.load();
  }

  onUpcoming(value: string) {
    this.upcoming.set(value === 'true');
    this.page.set(1);
    this.load();
  }

  publishedFilterValue() {
    const value = this.published();
    if (value === null) return '';
    return value ? 'true' : 'false';
  }

  upcomingFilterValue() {
    return this.upcoming() ? 'true' : 'false';
  }

  goTo(page: number) {
    const m = this.meta();
    if (!m) return;
    const safe = Math.max(1, Math.min(page, m.pages));
    this.page.set(safe);
    this.load();
  }

  remove(activity: ActivityDto) {
    const confirmed = window.confirm(`Supprimer l'activite "${activity.title}" ?`);
    if (!confirmed) return;

    this.deletingId.set(activity.id);
    this.errorMessage.set(null);

    this.api
      .delete(activity.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId.set(null);
          this.selectedActivity.set(null);
          this.load();
        },
        error: (error) => {
          this.deletingId.set(null);
          const message = error?.error?.message || 'Suppression impossible.';
          this.errorMessage.set(message);
        }
      });
  }

  activityTrack(activity: ActivityDto, index: number): string {
    const maybeLegacyId = (activity as ActivityDto & { _id?: string })._id;
    return activity.id || maybeLegacyId || String(index);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return this.dateFormatter.format(date);
  }

  openDetails(activity: ActivityDto) {
    this.selectedActivity.set(activity);
  }

  closeDetails() {
    this.selectedActivity.set(null);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultActivityImage)) return;
    img.src = this.defaultActivityImage;
  }
}
