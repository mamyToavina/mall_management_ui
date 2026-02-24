import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivityPublicDto } from '../../activities/models/activity.models';
import { ActivitiesApiService } from '../../activities/services/activities-api.service';

@Component({
  selector: 'app-public-events-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
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
  readonly defaultActivityImage = '/assets/activity-placeholder.svg';

  constructor() {
    this.title.setTitle('TI Commercial | Activites et evenements');
    this.meta.updateTag({
      name: 'description',
      content: 'Decouvrez toutes les activites publiques a venir a TI Commercial.'
    });

    this.loadEvents();
  }

  private loadEvents() {
    this.loading.set(true);

    this.activitiesApi
      .getPublicUpcoming(50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.events.set(items);
          this.loading.set(false);
        },
        error: () => {
          this.events.set([]);
          this.loading.set(false);
        }
      });
  }

  onEventImageError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultActivityImage)) return;
    img.src = this.defaultActivityImage;
  }
}
