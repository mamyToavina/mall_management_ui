import {
    Component,
    DestroyRef,
    Injector,
    afterNextRender,
    computed,
    inject,
    signal,
  } from '@angular/core';

import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { BoxDto, PaginationMeta, BoxesStatsDto, BoxStatus } from '../models/box.models';
import { BoxesApiService } from '../services/box.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
  
  
  @Component({
    selector: 'app-boxes-page',
    standalone: true,
    templateUrl: 'boxes-list-page.component.html',
    styleUrl: 'boxes-list-page.component.css',

    imports: [
      CommonModule,
      RouterModule,
    ]
  })

  export class BoxesPageComponent {
    private api = inject(BoxesApiService);
    private destroyRef = inject(DestroyRef);
    private injector = inject(Injector);
  
    // state
    readonly boxes = signal<BoxDto[]>([]);
    readonly meta = signal<PaginationMeta | null>(null);
    readonly stats = signal<BoxesStatsDto>({ total: 0, free: 0, occupied: 0 });
    readonly loading = signal<boolean>(false);
  
    // query state (comme Buyers)
    readonly page = signal<number>(1);
    readonly limit = signal<number>(10);
  
    // filtres
    readonly floor = signal<number | null>(null);
    readonly minSurface = signal<number | null>(null);
    readonly maxSurface = signal<number | null>(null);
    readonly minRent = signal<number | null>(null);
    readonly maxRent = signal<number | null>(null);
    readonly status = signal<BoxStatus | ''>('');
  
    // computed query object
    readonly query = computed(() => ({
      page: this.page(),
      limit: this.limit(),
      floor: this.floor() ?? undefined,
      minSurface: this.minSurface() ?? undefined,
      maxSurface: this.maxSurface() ?? undefined,
      minRent: this.minRent() ?? undefined,
      maxRent: this.maxRent() ?? undefined,
      status: this.status(),
    }));
  
    // pagination numbers (comme Buyers)
    readonly pageNumbers = computed(() => {
      const m = this.meta();
      if (!m) return [];
      const totalPages = m.pages;
      const current = m.page;
  
      const start = Math.max(1, current - 2);
      const end = Math.min(totalPages, current + 2);
  
      const pages: number[] = [];
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    });
  
    private readonly refreshTick = signal(0);
  
    constructor() {
      afterNextRender(() => {
        this.loadStats();
  
        const query$ = toObservable(
          computed(() => [this.query(), this.refreshTick()] as const),
          { injector: this.injector }
        );
  
        query$
          .pipe(
            debounceTime(100),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            switchMap(([q]) => {
              this.loading.set(true);
              return this.api.getBoxes(q).pipe(
                catchError((err) => {
                  console.error('GET BOXES FAILED', err);
                  return of({
                    data: [],
                    meta: { total: 0, page: q.page, limit: q.limit, pages: 1 },
                    stats: { total: 0, free: 0, occupied: 0 },
                  });
                })
              );
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((res) => {
            this.boxes.set(res.data ?? []);
            this.meta.set(res.meta ?? null)
            this.loading.set(false);
          });
      });
    }
  
    // =======================
    // Actions UI (comme Buyers)
    // =======================
  
    onStatus(v: string) {
      this.status.set((v as BoxStatus) || '');
      this.page.set(1);
    }
  
    onLimit(v: string) {
      const n = Number(v);
      this.limit.set(Number.isFinite(n) ? n : 10);
      this.page.set(1);
    }
  
    onFloor(v: string) {
      const n = Number(v);
      this.floor.set(Number.isFinite(n) ? n : null);
      this.page.set(1);
    }
  
    onMinSurface(v: string) {
      const n = Number(v);
      this.minSurface.set(Number.isFinite(n) ? n : null);
      this.page.set(1);
    }
  
    onMaxSurface(v: string) {
      const n = Number(v);
      this.maxSurface.set(Number.isFinite(n) ? n : null);
      this.page.set(1);
    }
  
    onMinRent(v: string) {
      const n = Number(v);
      this.minRent.set(Number.isFinite(n) ? n : null);
      this.page.set(1);
    }
  
    onMaxRent(v: string) {
      const n = Number(v);
      this.maxRent.set(Number.isFinite(n) ? n : null);
      this.page.set(1);
    }
  
    goTo(p: number) {
      const m = this.meta();
      if (!m) return;
      const safe = Math.min(Math.max(1, p), m.pages);
      this.page.set(safe);
    }
  
    refresh() {
      this.refreshTick.update((x) => x + 1);
      this.loadStats();
    }
  
    // =======================
    // Helpers
    // =======================
  
    badgeStatus(b: BoxDto) {
      return b.boutique ? 'Occupé' : 'Libre';
    }

    formatAr(value: number | null | undefined): string {
      if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
      return `${Number(value).toLocaleString('fr-FR')} Ar`;
    }
  
    private loadStats() {
      this.api.getStatistics()
        .pipe(
          tap(() => {

          }),
          catchError((err) => {
            console.error('GET BOX STATS FAILED', err);
            return of({ total: 0, free: 0, occupied: 0 } as BoxesStatsDto);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((s) => this.stats.set(s));
    }

    resetAll() {
        this.floor.set(null);
        this.minSurface.set(null);
        this.maxSurface.set(null);
        this.minRent.set(null);
        this.maxRent.set(null);
        this.status.set('');
        this.limit.set(10);
        this.page.set(1);
        this.refresh();
    }
      
  }
  

