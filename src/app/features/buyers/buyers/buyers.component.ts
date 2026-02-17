import { Component, DestroyRef, Injector, inject, signal, computed, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BuyerCardModalComponent } from './buyers-card-modal';
import { BuyerDto, PaginationMeta, UserStatus } from './buyers.model';
import { BuyersApiService } from './buyers.services';
import { formatAriary, resolveAvatarUrl, timeAgo } from './buyers.utils';

@Component({
  selector: 'app-buyers-page',
  standalone: true,
  imports: [CommonModule, BuyerCardModalComponent],
  template: `
    <section class="page">
      <header class="top">
        <div>
          <h1>Gestion acheteur</h1>
          <p class="sub">Liste des comptes acheteurs</p>
        </div>

        @if (meta(); as m) {
          <div class="stats">
            <div class="pill">
              <span>Total</span>
              <strong>{{ m.total }}</strong>
            </div>

            <div class="pill">
              <span>Page</span>
              <strong>{{ m.page }}/{{ m.pages }}</strong>
            </div>
          </div>
        }
      </header>

      <div class="card">
        <div class="filters">
          <div class="field">
            <label>Recherche</label>
            <input
              type="search"
              [value]="search()"
              (input)="onSearch(($any($event.target)).value)"
              placeholder="pseudo ou email..."
            />
          </div>

          <div class="field">
            <label>Status</label>
            <select [value]="status()" (change)="onStatus(($any($event.target)).value)">
              <option value="">Tous</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          <div class="field">
            <label>Limit</label>
            <select [value]="limit()" (change)="onLimit(($any($event.target)).value)">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="20">20</option>
            </select>
          </div>

          <div class="field actions">
            <button class="btn" type="button" (click)="refresh()">Rafraîchir</button>
          </div>
        </div>

        <div class="table-wrap" *ngIf="!loading(); else loadingTpl">
          <table class="table" *ngIf="buyers().length; else emptyTpl">
            <thead>
              <tr>
                <th>Acheteur</th>
                <th>Email</th>
                <th>Solde</th>
                <th>Status</th>
                <th>Ancienneté</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                *ngFor="let b of buyers()"
                class="row"
                (click)="openBuyer(b._id)"
                tabindex="0"
              >
                <td>
                  <div class="who">
                    <img class="avatar" [src]="avatarUrl(b.avatar)" alt="avatar" />
                    <div class="who-meta">
                      <div class="pseudo">{{ b.pseudo }}</div>
                      <div class="small muted">{{ b.firstName || '—' }}</div>
                    </div>
                  </div>
                </td>

                <td class="mono">{{ b.email }}</td>
                <td class="strong">{{ money(b.credit) }}</td>

                <td>
                  <span class="badge" [class.blocked]="b.status==='BLOCKED'">{{ b.status }}</span>
                </td>

                <td class="muted">{{ ago(b.createdAt) }}</td>

                <td class="td-actions" (click)="$event.stopPropagation()">
                  <button
                    class="btn danger"
                    *ngIf="b.status==='ACTIVE'"
                    type="button"
                    (click)="confirmBlock(b)"
                  >
                    Bloquer
                  </button>

                  <button
                    class="btn"
                    *ngIf="b.status==='BLOCKED'"
                    type="button"
                    (click)="confirmUnblock(b)"
                  >
                    Débloquer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination" *ngIf="meta() as m">
            <button class="btn" type="button" [disabled]="m.page<=1" (click)="goTo(m.page-1)">
              ← Précédent
            </button>

            <div class="pages">
              <button
                class="page-btn"
                type="button"
                *ngFor="let p of pageNumbers()"
                [class.active]="p===m.page"
                (click)="goTo(p)"
              >
                {{ p }}
              </button>
            </div>

            <button class="btn" type="button" [disabled]="m.page>=m.pages" (click)="goTo(m.page+1)">
              Suivant →
            </button>
          </div>
        </div>
      </div>

      <!-- Modal fiche -->
      <app-buyer-card-modal
        *ngIf="selectedBuyer()"
        [buyer]="selectedBuyer()"
        (close)="closeModal()"
      />

      <ng-template #loadingTpl>
        <div class="loading">Chargement...</div>
      </ng-template>

      <ng-template #emptyTpl>
        <div class="empty">
          Aucun acheteur trouvé.
        </div>
      </ng-template>
    </section>
  `,
  styleUrls: ['./buyers.component.css']
})

export class BuyersPageComponent {

  private api = inject(BuyersApiService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  // state
  readonly buyers = signal<BuyerDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal<boolean>(false);

  // query state
  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly search = signal<string>('');
  readonly status = signal<UserStatus | ''>('');

  // for modal
  readonly selectedBuyer = signal<BuyerDto | null>(null);

  // helper (UI)
  money = formatAriary;
  avatarUrl = resolveAvatarUrl;
  ago = timeAgo;

  // computed query object
  readonly query = computed(() => ({
    page: this.page(),
    limit: this.limit(),
    search: this.search(),
    status: this.status()
  }));

  // pagination numbers (simple, pro, et pas trop long)
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
    console.log("mandeha an");
    afterNextRender(() => {
      const query$ = toObservable(
        computed(() => [this.query(), this.refreshTick()] as const),
        { injector: this.injector } // ✅ important
      );

      query$
        .pipe(
          debounceTime(150),
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
          switchMap(([q]) => {
            this.loading.set(true);
            return this.api.getBuyers(q).pipe(
              catchError((err) => {
                console.error('GET BUYERS FAILED', err);
                return of({ data: [], meta: { total: 0, page: q.page, limit: q.limit, pages: 1 } });
              })
            );
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((res) => {
          console.log("ito ny solution an");
          this.buyers.set(res.data ?? []);
          this.meta.set(res.meta ?? null);
          this.loading.set(false);
        });
    });
  }
  

  onSearch(v: string) {
    this.search.set(v);
    this.page.set(1);
  }

  onStatus(v: string) {
    this.status.set((v as UserStatus) || '');
    this.page.set(1);
  }

  onLimit(v: string) {
    const n = Number(v);
    this.limit.set(Number.isFinite(n) ? n : 10);
    this.page.set(1);
  }

  goTo(p: number) {
    const m = this.meta();
    if (!m) return;
    const safe = Math.min(Math.max(1, p), m.pages);
    this.page.set(safe);
  }

  refresh() {
    this.refreshTick.update(x => x + 1);
  }

  openBuyer(id: string) {
    this.loading.set(true);
    this.api.getBuyerById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (buyer) => {
        this.selectedBuyer.set(buyer);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  closeModal() {
    this.selectedBuyer.set(null);
  }

  confirmBlock(b: BuyerDto) {
    const ok = window.confirm(`Bloquer "${b.pseudo}" ?`);
    if (!ok) return;

    this.api.blockBuyer(b._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.patchRow(updated);
      }
    });
  }

  confirmUnblock(b: BuyerDto) {
    const ok = window.confirm(`Débloquer "${b.pseudo}" ?`);
    if (!ok) return;

    this.api.unblockBuyer(b._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.patchRow(updated);
      }
    });
  }

  private patchRow(updated: BuyerDto) {
    this.buyers.update(list => list.map(x => x._id === updated._id ? { ...x, ...updated } : x));
    // si modal ouvert sur le même buyer
    if (this.selectedBuyer()?._id === updated._id) {
      this.selectedBuyer.set({ ...this.selectedBuyer()!, ...updated });
    }
  }
}

