import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivityPublicDto } from '../../activities/models/activity.models';
import { ActivitiesApiService } from '../../activities/services/activities-api.service';

@Component({
  selector: 'app-public-events-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-events-page.component.html',
  styleUrls: ['./public-events-page.component.css']
})
export class PublicEventsPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activitiesApi = inject(ActivitiesApiService);

  readonly events = signal<ActivityPublicDto[]>([]);
  readonly loading = signal(false);
  readonly defaultActivityImage = '/assets/public-activity-placeholder.svg';
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly pageSize = 10;
  private readonly dateLongFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  private readonly dateShortFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  });

  constructor() {
    this.title.setTitle('TI Commercial | Activites et evenements');
    this.meta.updateTag({
      name: 'description',
      content: 'Decouvrez toutes les activites publiques a venir a TI Commercial.'
    });

    this.loadEvents(1);
  }

  loadEvents(page = 1) {
    this.loading.set(true);

    this.activitiesApi
      .getPublicUpcoming({ page, limit: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.events.set(res.data || []);
          this.currentPage.set(res.meta?.page || page);
          this.totalPages.set(Math.max(1, res.meta?.pages || 1));
          this.totalItems.set(res.meta?.total || 0);
          this.loading.set(false);
        },
        error: () => {
          this.events.set([]);
          this.currentPage.set(1);
          this.totalPages.set(1);
          this.totalItems.set(0);
          this.loading.set(false);
        }
      });
  }

  nextPage() {
    if (this.currentPage() >= this.totalPages()) return;
    this.loadEvents(this.currentPage() + 1);
  }

  prevPage() {
    if (this.currentPage() <= 1) return;
    this.loadEvents(this.currentPage() - 1);
  }

  onEventImageError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultActivityImage)) return;
    img.src = this.defaultActivityImage;
  }

  activityPeriodLabel(event: ActivityPublicDto): string {
    const start = new Date(event.startDateIso || event.dateIso);
    const end = new Date(event.endDateIso || event.dateIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Date a confirmer';
    }

    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    if (sameDay) {
      return `Le ${this.dateLongFormatter.format(start)}`;
    }

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth) {
      return `Du ${start.getDate()} au ${this.dateLongFormatter.format(end)}`;
    }

    if (sameYear) {
      return `Du ${this.dateShortFormatter.format(start)} au ${this.dateLongFormatter.format(end)}`;
    }

    return `Du ${this.dateLongFormatter.format(start)} au ${this.dateLongFormatter.format(end)}`;
  }
}
