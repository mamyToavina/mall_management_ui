import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoxesApiService } from '../services/box.service';

@Component({
  selector: 'app-box-details-page',
  standalone: true,
  templateUrl: './box-details-page.component.html',
  imports: [CommonModule, JsonPipe],
})
export class BoxDetailsPageComponent {
  private route = inject(ActivatedRoute);
  private api = inject(BoxesApiService);
  private destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly box = signal<any | null>(null);
  readonly contract = signal<any | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.error.set('');

    this.api
      .getFullDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.box.set(res?.box ?? null);
          this.contract.set(res?.contract ?? null);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des détails');
          this.loading.set(false);
        },
      });
  }
}
