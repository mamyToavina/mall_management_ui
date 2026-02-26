import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { BuyerDto, BuyerHistoryEntry, BuyerHistoryFilters, BuyerHistorySummary, PaginationMeta } from './buyers.model';
import { formatAriary, getDefaultAvatarUrl, resolveAvatarUrl, timeAgo } from './buyers.utils';

@Component({
  selector: 'app-buyer-card-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()"></div>

    <section class="modal" role="dialog" aria-modal="true" aria-label="Fiche acheteur" (click)="$event.stopPropagation()">
      <header class="modal-header">
        <div>
          <h2>Fiche acheteur</h2>
          <p>{{ buyer?.pseudo || '-' }}</p>
        </div>
        <button class="icon-btn" type="button" (click)="close.emit()" aria-label="Fermer">x</button>
      </header>

      <nav class="tabs" role="tablist" aria-label="Sections acheteur">
        <button type="button" class="tab" [class.active]="activeTab() === 'profile'" (click)="setTab('profile')">Informations</button>
        <button type="button" class="tab" [class.active]="activeTab() === 'history'" (click)="setTab('history')">Historique</button>
      </nav>

      <div class="modal-body" *ngIf="buyer as b">
        <section *ngIf="activeTab() === 'profile'" class="panel profile-panel">
          <div class="head-card">
            <img class="photo" [src]="avatarUrl(b.avatar)" (error)="onAvatarError($event)" alt="Photo profil" />
            <div>
              <h3>{{ b.pseudo }}</h3>
              <div class="sub">
                <span class="badge" [class.blocked]="b.status === 'BLOCKED'">{{ b.status }}</span>
                <span class="muted">{{ ago(b.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="grid">
            <article class="field"><small>Email</small><strong>{{ b.email }}</strong></article>
            <article class="field"><small>Nom</small><strong>{{ b.firstName || '-' }}</strong></article>
            <article class="field"><small>Prenom</small><strong>{{ b.lastName || '-' }}</strong></article>
            <article class="field"><small>Solde</small><strong>{{ money(b.credit) }}</strong></article>
            <article class="field"><small>Compte complete</small><strong>{{ b.isAccountCompleted ? 'Oui' : 'Non' }}</strong></article>
            <article class="field"><small>Date creation</small><strong>{{ b.createdAt | date:'dd/MM/yyyy HH:mm' }}</strong></article>
            <article class="field" *ngIf="b.blockedAt"><small>Bloque le</small><strong>{{ b.blockedAt | date:'dd/MM/yyyy HH:mm' }}</strong></article>
            <article class="field span2" *ngIf="b.blockedReason"><small>Motif blocage</small><strong>{{ b.blockedReason }}</strong></article>
            <article class="field span2"><small>ID</small><strong class="mono">{{ b._id }}</strong></article>
          </div>
        </section>

        <section *ngIf="activeTab() === 'history'" class="panel history-panel">
          <div class="history-toolbar">
            <div class="field">
              <label>Type</label>
              <select [value]="historyFilters?.type || 'ALL'" (change)="onFilterType(($any($event.target)).value)">
                <option value="ALL">Tous</option>
                <option value="PURCHASE">Achats</option>
                <option value="CREDIT_USAGE">Credits utilises</option>
                <option value="REVIEW">Notes / avis</option>
              </select>
            </div>
            <div class="field">
              <label>Date debut</label>
              <input type="date" [value]="historyFilters?.from || ''" (change)="onFilterDate('from', ($any($event.target)).value)" />
            </div>
            <div class="field">
              <label>Date fin</label>
              <input type="date" [value]="historyFilters?.to || ''" (change)="onFilterDate('to', ($any($event.target)).value)" />
            </div>
            <div class="field search">
              <label>Recherche</label>
              <input type="search" [value]="historyFilters?.search || ''" placeholder="reference, boutique, avis..." (input)="onFilterSearch(($any($event.target)).value)" />
            </div>
          </div>

          <div class="summary" *ngIf="historySummary as s">
            <div class="chip"><small>Achats</small><strong>{{ s.byType.PURCHASE }}</strong></div>
            <div class="chip"><small>Credits</small><strong>{{ s.byType.CREDIT_USAGE }}</strong></div>
            <div class="chip"><small>Avis</small><strong>{{ s.byType.REVIEW }}</strong></div>
          </div>

          <div class="history-loading" *ngIf="historyLoading">
            <div class="dice-loader" aria-hidden="true">
              <span class="die d1"></span>
              <span class="die d2"></span>
              <span class="die d3"></span>
            </div>
          </div>

          <p class="error" *ngIf="!historyLoading && historyError">{{ historyError }}</p>
          <p class="empty" *ngIf="!historyLoading && !historyError && !historyEntries.length">Aucun historique trouve.</p>

          <div class="history-list" *ngIf="!historyLoading && historyEntries.length">
            <article class="entry" *ngFor="let item of historyEntries">
              <header>
                <div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.occurredAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div class="tag" [class.purchase]="item.entryType === 'PURCHASE'" [class.credit]="item.entryType === 'CREDIT_USAGE'" [class.review]="item.entryType === 'REVIEW'">
                  {{ labelFor(item.entryType) }}
                </div>
              </header>

              <div class="meta-grid">
                <div *ngIf="item.reference"><small>Reference</small><strong>{{ item.reference }}</strong></div>
                <div *ngIf="item.boutiqueName"><small>Boutique</small><strong>{{ item.boutiqueName }}</strong></div>
                <div *ngIf="item.amount !== null"><small>Montant</small><strong>{{ money(item.amount || 0) }}</strong></div>
                <div *ngIf="item.rating !== null"><small>Note</small><strong>{{ item.rating }}/5</strong></div>
              </div>

              <div class="details" *ngIf="item.entryType === 'PURCHASE'">
                <small>Details achat</small>
                <p>
                  Quantite: {{ numberField(item.details, 'quantityTotal') || 0 }} |
                  Articles: {{ numberField(item.details, 'itemCount') || 0 }} |
                  Statut: {{ stringField(item.details, 'status') || '-' }}
                </p>
                <div class="purchase-lines" *ngIf="purchaseItems(item.details).length">
                  <div class="purchase-line" *ngFor="let line of purchaseItems(item.details)">
                    <div class="line-name">{{ line.productName || '-' }}</div>
                    <div class="line-meta">
                      {{ line.quantity }} x {{ money(line.unitPrice) }} = {{ money(line.lineTotal) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="details" *ngIf="item.entryType === 'REVIEW'">
                <small>Avis</small>
                <p>{{ stringField(item.details, 'comment') || 'Aucun commentaire.' }}</p>
              </div>
            </article>
          </div>

          <footer class="history-pagination" *ngIf="historyMeta && (historyMeta.pages || 1) > 1">
            <button type="button" class="btn" [disabled]="historyMeta.page <= 1" (click)="historyPageChange.emit(historyMeta.page - 1)">Precedent</button>
            <span>Page {{ historyMeta.page }} / {{ historyMeta.pages }}</span>
            <button type="button" class="btn" [disabled]="historyMeta.page >= historyMeta.pages" (click)="historyPageChange.emit(historyMeta.page + 1)">Suivant</button>
          </footer>
        </section>
      </div>

      <footer class="modal-footer">
        <button class="btn" type="button" (click)="close.emit()">Fermer</button>
      </footer>
    </section>
  `,
  styles: [
    `
      .modal-backdrop { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.62); z-index: 90; }
      .modal {
        position: fixed;
        z-index: 91;
        inset: 2vh 3vw;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        overflow: hidden;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
      }
      .modal-header h2 { margin: 0; font-size: 18px; }
      .modal-header p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
      .icon-btn {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        cursor: pointer;
      }
      .tabs { padding: 10px 16px; display: flex; gap: 8px; border-bottom: 1px solid var(--border); }
      .tab {
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        border-radius: 999px;
        padding: 8px 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .tab.active {
        border-color: color-mix(in oklab, var(--primary) 50%, var(--border));
        background: color-mix(in oklab, var(--primary) 14%, var(--surface));
      }
      .modal-body { overflow: auto; padding: 14px 16px; }
      .head-card { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
      .photo { width: 68px; height: 68px; border-radius: 14px; object-fit: cover; border: 1px solid var(--border); }
      .head-card h3 { margin: 0; font-size: 18px; }
      .sub { display: flex; gap: 8px; margin-top: 4px; align-items: center; }
      .badge {
        font-size: 12px;
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 3px 10px;
        background: color-mix(in oklab, var(--surface) 86%, var(--primary) 8%);
        font-weight: 700;
      }
      .badge.blocked { color: #dc2626; }
      .muted { color: var(--muted); font-size: 12px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .field { border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; }
      .field small { display: block; color: var(--muted); font-size: 12px; }
      .field strong { display: block; margin-top: 4px; }
      .field.span2 { grid-column: span 2; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
      .history-toolbar { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
      .history-toolbar .search { grid-column: span 1; }
      label { font-size: 12px; font-weight: 700; color: var(--muted); display: block; margin-bottom: 4px; }
      input, select {
        width: 100%;
        height: 38px;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        padding: 0 10px;
      }
      .summary { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
      .chip {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 8px 10px;
        background: color-mix(in oklab, var(--surface) 95%, var(--bg));
      }
      .chip small { color: var(--muted); display: block; }
      .chip strong { font-size: 13px; }
      .history-loading { padding: 20px; display: flex; justify-content: center; }
      .history-list { display: grid; gap: 10px; }
      .entry { border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; background: color-mix(in oklab, var(--surface) 96%, var(--bg)); }
      .entry header { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
      .entry h4 { margin: 0; font-size: 15px; }
      .entry p { margin: 3px 0 0; color: var(--muted); font-size: 12px; }
      .tag { border-radius: 999px; border: 1px solid var(--border); padding: 3px 10px; font-size: 11px; font-weight: 700; }
      .tag.purchase { color: #0369a1; }
      .tag.credit { color: #6d28d9; }
      .tag.review { color: #ca8a04; }
      .meta-grid { margin-top: 10px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .meta-grid small { display: block; color: var(--muted); font-size: 11px; }
      .meta-grid strong { font-size: 13px; }
      .details { margin-top: 10px; border-top: 1px dashed var(--border); padding-top: 8px; }
      .details small { color: var(--muted); display: block; }
      .details p { margin: 4px 0 0; color: var(--text); font-size: 13px; }
      .purchase-lines { margin-top: 8px; display: grid; gap: 6px; }
      .purchase-line { border: 1px solid var(--border); border-radius: 10px; padding: 8px; background: var(--surface); }
      .line-name { font-weight: 700; }
      .line-meta { margin-top: 2px; color: var(--muted); font-size: 12px; }
      .history-pagination { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; }
      .btn {
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        border-radius: 10px;
        padding: 8px 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn:disabled { opacity: .6; cursor: not-allowed; }
      .error { color: #dc2626; font-weight: 600; }
      .empty { color: var(--muted); }
      .modal-footer { border-top: 1px solid var(--border); padding: 12px 16px; display: flex; justify-content: flex-end; }
      @media (max-width: 980px) {
        .history-toolbar { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 760px) {
        .modal { inset: 1vh 2vw; }
        .grid, .meta-grid, .history-toolbar { grid-template-columns: 1fr; }
        .field.span2 { grid-column: auto; }
      }
    `
  ]
})
export class BuyerCardModalComponent {
  @Input() buyer: BuyerDto | null = null;
  @Input() historyEntries: BuyerHistoryEntry[] = [];
  @Input() historyMeta: PaginationMeta | null = null;
  @Input() historySummary: BuyerHistorySummary | null = null;
  @Input() historyLoading = false;
  @Input() historyError = '';
  @Input() historyFilters: BuyerHistoryFilters | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() historyFilterChange = new EventEmitter<Partial<BuyerHistoryFilters>>();
  @Output() historyPageChange = new EventEmitter<number>();

  readonly activeTab = signal<'profile' | 'history'>('profile');

  ago = timeAgo;
  money = formatAriary;
  avatarUrl = resolveAvatarUrl;
  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    const fallback = getDefaultAvatarUrl();
    if (img.src.endsWith(fallback)) return;
    img.src = fallback;
  }

  setTab(tab: 'profile' | 'history') {
    this.activeTab.set(tab);
  }

  onFilterType(value: string) {
    this.historyFilterChange.emit({ type: value as BuyerHistoryFilters['type'], page: 1 });
  }

  onFilterDate(key: 'from' | 'to', value: string) {
    this.historyFilterChange.emit({ [key]: value || undefined, page: 1 });
  }

  onFilterSearch(value: string) {
    this.historyFilterChange.emit({ search: value, page: 1 });
  }

  labelFor(type: BuyerHistoryEntry['entryType']) {
    if (type === 'PURCHASE') return 'Achat';
    if (type === 'CREDIT_USAGE') return 'Credit';
    return 'Avis';
  }

  stringField(details: Record<string, unknown> | null | undefined, key: string) {
    const value = details?.[key];
    return typeof value === 'string' ? value : '';
  }

  numberField(details: Record<string, unknown> | null | undefined, key: string) {
    const value = details?.[key];
    return typeof value === 'number' ? value : null;
  }

  purchaseItems(details: Record<string, unknown> | null | undefined): Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }> {
    const rows = details?.['items'];
    if (!Array.isArray(rows)) return [];

    return rows
      .map((row) => {
        const entry = row as Record<string, unknown>;
        return {
          productName: typeof entry['productName'] === 'string' ? entry['productName'] : '',
          quantity: typeof entry['quantity'] === 'number' ? entry['quantity'] : 0,
          unitPrice: typeof entry['unitPrice'] === 'number' ? entry['unitPrice'] : 0,
          lineTotal: typeof entry['lineTotal'] === 'number' ? entry['lineTotal'] : 0
        };
      })
      .filter((row) => row.productName || row.quantity || row.unitPrice || row.lineTotal);
  }
}


