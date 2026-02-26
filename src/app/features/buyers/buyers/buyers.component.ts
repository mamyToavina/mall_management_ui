import { Component, DestroyRef, Injector, computed, inject, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BuyerCardModalComponent } from './buyers-card-modal';
import {
  BuyerDto,
  BuyerHistoryEntry,
  BuyerHistoryFilters,
  BuyerHistorySummary,
  PaginationMeta,
  UserStatus
} from './buyers.model';
import { BuyersApiService } from './buyers.services';
import { formatAriary, getDefaultAvatarUrl, resolveAvatarUrl, timeAgo } from './buyers.utils';

@Component({
  selector: 'app-buyers-page',
  standalone: true,
  imports: [CommonModule, BuyerCardModalComponent],
  templateUrl: './buyers.component.html',
  styleUrls: ['buyers.component.css']
})
export class BuyersPageComponent {
  private readonly api = inject(BuyersApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly buyers = signal<BuyerDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal<boolean>(false);

  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly search = signal<string>('');
  readonly status = signal<UserStatus | ''>('');

  readonly selectedBuyer = signal<BuyerDto | null>(null);
  readonly historyEntries = signal<BuyerHistoryEntry[]>([]);
  readonly historyMeta = signal<PaginationMeta | null>(null);
  readonly historySummary = signal<BuyerHistorySummary | null>(null);
  readonly historyLoading = signal<boolean>(false);
  readonly historyError = signal<string>('');
  readonly historyFilters = signal<BuyerHistoryFilters>({
    type: 'ALL',
    page: 1,
    limit: 10
  });

  readonly isBlockModalOpen = signal(false);
  readonly blockingBuyer = signal<BuyerDto | null>(null);
  readonly blockReason = signal('');
  readonly blockSubmitting = signal(false);
  readonly blockError = signal('');

  private readonly refreshTick = signal(0);
  private historySearchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly query = computed(() => ({
    page: this.page(),
    limit: this.limit(),
    search: this.search(),
    status: this.status()
  }));

  readonly pageNumbers = computed(() => {
    const m = this.meta();
    if (!m) return [];
    const start = Math.max(1, m.page - 2);
    const end = Math.min(m.pages, m.page + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  money = formatAriary;
  avatarUrl = resolveAvatarUrl;
  ago = timeAgo;
  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    const fallback = getDefaultAvatarUrl();
    if (img.src.endsWith(fallback)) return;
    img.src = fallback;
  }

  constructor() {
    afterNextRender(() => {
      const query$ = toObservable(
        computed(() => [this.query(), this.refreshTick()] as const),
        { injector: this.injector }
      );

      query$
        .pipe(
          debounceTime(120),
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
          switchMap(([q]) => {
            this.loading.set(true);
            return this.api.getBuyers(q).pipe(
              catchError(() =>
                of({
                  data: [],
                  meta: { total: 0, page: q.page, limit: q.limit, pages: 1 }
                })
              )
            );
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((res) => {
          this.buyers.set(res.data ?? []);
          this.meta.set(res.meta ?? null);
          this.loading.set(false);
        });
    });
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  onStatus(value: string) {
    this.status.set((value as UserStatus) || '');
    this.page.set(1);
  }

  onLimit(value: string) {
    const parsed = Number(value);
    this.limit.set(Number.isFinite(parsed) ? parsed : 10);
    this.page.set(1);
  }

  goTo(page: number) {
    const m = this.meta();
    if (!m) return;
    const safe = Math.min(Math.max(1, page), m.pages);
    this.page.set(safe);
  }

  refresh() {
    this.refreshTick.update((value) => value + 1);
  }

  openBuyer(id: string) {
    this.loading.set(true);
    this.historyError.set('');

    this.api
      .getBuyerById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (buyer) => {
          this.selectedBuyer.set(buyer);
          this.historyFilters.set({ type: 'ALL', page: 1, limit: 10, search: '' });
          this.loadHistory();
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  closeModal() {
    this.selectedBuyer.set(null);
    this.historyEntries.set([]);
    this.historyMeta.set(null);
    this.historySummary.set(null);
    this.historyError.set('');
  }

  confirmBlock(buyer: BuyerDto) {
    this.blockingBuyer.set(buyer);
    this.blockReason.set('');
    this.blockError.set('');
    this.blockSubmitting.set(false);
    this.isBlockModalOpen.set(true);
  }

  closeBlockModal() {
    this.isBlockModalOpen.set(false);
    this.blockingBuyer.set(null);
    this.blockReason.set('');
    this.blockSubmitting.set(false);
    this.blockError.set('');
  }

  setBlockReason(value: string) {
    this.blockReason.set(value);
    if (this.blockError()) this.blockError.set('');
  }

  submitBlock() {
    const buyer = this.blockingBuyer();
    if (!buyer) return;

    const reason = this.blockReason().trim();
    if (reason.length < 3) {
      this.blockError.set('Veuillez saisir un motif valide (minimum 3 caracteres).');
      return;
    }
    if (reason.length > 500) {
      this.blockError.set('Le motif est trop long (500 caracteres max).');
      return;
    }

    this.blockSubmitting.set(true);
    this.api
      .blockBuyer(buyer._id, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.patchRow(updated);
          this.blockSubmitting.set(false);
          this.closeBlockModal();
        },
        error: (error) => {
          this.blockSubmitting.set(false);
          this.blockError.set(error?.error?.message || 'Blocage impossible.');
        }
      });
  }

  confirmUnblock(buyer: BuyerDto) {
    this.api
      .unblockBuyer(buyer._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => this.patchRow(updated)
      });
  }

  onHistoryFilterChange(patch: Partial<BuyerHistoryFilters>) {
    if (patch.search !== undefined) {
      if (this.historySearchTimer) clearTimeout(this.historySearchTimer);
      this.historyFilters.update((prev) => ({ ...prev, ...patch, page: 1 }));
      this.historySearchTimer = setTimeout(() => this.loadHistory(), 250);
      return;
    }

    this.historyFilters.update((prev) => ({ ...prev, ...patch }));
    this.loadHistory();
  }

  onHistoryPageChange(page: number) {
    this.historyFilters.update((prev) => ({ ...prev, page }));
    this.loadHistory();
  }

  private loadHistory() {
    const buyer = this.selectedBuyer();
    if (!buyer) return;

    this.historyLoading.set(true);
    this.historyError.set('');

    this.api
      .getBuyerHistory(buyer._id, this.historyFilters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.historyEntries.set(res.data ?? []);
          this.historyMeta.set(res.meta ?? null);
          this.historySummary.set(res.summary ?? null);
          this.historyLoading.set(false);
        },
        error: (error) => {
          this.historyEntries.set([]);
          this.historyMeta.set(null);
          this.historySummary.set(null);
          this.historyLoading.set(false);
          this.historyError.set(error?.error?.message || 'Historique indisponible.');
        }
      });
  }

  private patchRow(updated: BuyerDto) {
    this.buyers.update((list) => list.map((item) => (item._id === updated._id ? { ...item, ...updated } : item)));

    if (this.selectedBuyer()?._id === updated._id) {
      this.selectedBuyer.set({ ...this.selectedBuyer()!, ...updated });
    }
  }
}

