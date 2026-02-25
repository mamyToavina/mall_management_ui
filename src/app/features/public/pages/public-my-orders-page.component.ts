import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthStore } from '../../../core/auth/auth.store';
import { MySaleDto, OrderStatus } from '../models/public-sales.models';
import { PublicSalesApiService } from '../services/public-sales-api.service';

@Component({
  selector: 'app-public-my-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-my-orders-page.component.html',
  styleUrls: ['./public-my-orders-page.component.css']
})
export class PublicMyOrdersPageComponent implements OnInit {
  private readonly store = inject(AuthStore);
  private readonly salesApi = inject(PublicSalesApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';
  allOrders: MySaleDto[] = [];
  filteredOrders: MySaleDto[] = [];
  pagedOrders: MySaleDto[] = [];

  page = 1;
  readonly limit = 10;
  pages = 1;

  selectedOrderLoading = false;
  selectedOrderError = '';
  selectedOrder: MySaleDto | null = null;
  isDetailsModalOpen = false;
  isFilterModalOpen = false;

  query = '';
  statusFilter: OrderStatus | '' = '';
  fromDate = '';
  toDate = '';
  minTotal = '';
  maxTotal = '';

  draftQuery = '';
  draftStatusFilter: OrderStatus | '' = '';
  draftFromDate = '';
  draftToDate = '';
  draftMinTotal = '';
  draftMaxTotal = '';

  ngOnInit(): void {
    if (!this.isUserConnected) return;
    this.loadOrders();
  }

  get isUserConnected(): boolean {
    return this.store.isAuthenticated() && this.store.role() === 'USER';
  }

  async loadOrders(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.selectedOrder = null;
    this.selectedOrderError = '';
    this.selectedOrderLoading = false;

    try {
      const limit = 50;
      let page = 1;
      let pages = 1;
      const all: MySaleDto[] = [];

      while (page <= pages) {
        const res = await firstValueFrom(this.salesApi.listMySales({ page, limit }));
        const rows = Array.isArray(res?.data) ? res.data : [];
        all.push(...rows);
        pages = Number(res?.meta?.pages || 1);
        page += 1;
      }

      this.allOrders = all.sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      );
      this.applyFilters(true);
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err: any) {
      this.loading = false;
      this.error = err?.error?.message || 'Impossible de charger vos commandes.';
      this.cdr.detectChanges();
    }
  }

  applyFilters(resetPage = false): void {
    const query = this.query.trim().toLowerCase();
    const minTotal = Number(this.minTotal);
    const maxTotal = Number(this.maxTotal);
    const from = this.fromDate ? new Date(this.fromDate) : null;
    const to = this.toDate ? new Date(this.toDate) : null;

    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    this.filteredOrders = this.allOrders.filter((order) => {
      if (this.statusFilter && order.status !== this.statusFilter) return false;

      if (query) {
        const inReference = order.reference.toLowerCase().includes(query);
        const inProducts = order.items.some((item) => item.productName.toLowerCase().includes(query));
        const inBoutiques = order.boutiqueBreakdown.some((b) =>
          b.boutiqueName.toLowerCase().includes(query)
        );
        if (!inReference && !inProducts && !inBoutiques) return false;
      }

      const placedAt = new Date(order.placedAt);
      if (from && placedAt < from) return false;
      if (to && placedAt > to) return false;

      const total = Number(order?.totals?.grandTotal || 0);
      if (this.minTotal !== '' && Number.isFinite(minTotal) && total < minTotal) return false;
      if (this.maxTotal !== '' && Number.isFinite(maxTotal) && total > maxTotal) return false;

      return true;
    });

    if (resetPage) this.page = 1;
    this.refreshPagination();
  }

  clearFilters(): void {
    this.query = '';
    this.statusFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.minTotal = '';
    this.maxTotal = '';
    this.applyFilters(true);
  }

  refreshPagination(): void {
    this.pages = Math.max(1, Math.ceil(this.filteredOrders.length / this.limit));
    if (this.page > this.pages) this.page = this.pages;
    const start = (this.page - 1) * this.limit;
    this.pagedOrders = this.filteredOrders.slice(start, start + this.limit);
  }

  openDetails(orderId: string): void {
    this.isDetailsModalOpen = true;
    this.selectedOrderLoading = true;
    this.selectedOrderError = '';
    this.selectedOrder = null;

    this.salesApi.getMySaleById(orderId).subscribe({
      next: (res) => {
        this.selectedOrderLoading = false;
        this.selectedOrder = res?.data || null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.selectedOrderLoading = false;
        this.selectedOrderError = err?.error?.message || 'Detail commande introuvable.';
        this.cdr.detectChanges();
      }
    });
  }

  closeDetails(): void {
    this.isDetailsModalOpen = false;
    this.selectedOrder = null;
    this.selectedOrderError = '';
    this.selectedOrderLoading = false;
  }

  openFilterModal(): void {
    this.draftQuery = this.query;
    this.draftStatusFilter = this.statusFilter;
    this.draftFromDate = this.fromDate;
    this.draftToDate = this.toDate;
    this.draftMinTotal = this.minTotal;
    this.draftMaxTotal = this.maxTotal;
    this.isFilterModalOpen = true;
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false;
  }

  applyFilterModal(): void {
    this.query = this.draftQuery;
    this.statusFilter = this.draftStatusFilter;
    this.fromDate = this.draftFromDate;
    this.toDate = this.draftToDate;
    this.minTotal = this.draftMinTotal;
    this.maxTotal = this.draftMaxTotal;
    this.applyFilters(true);
    this.isFilterModalOpen = false;
  }

  clearFilterModal(): void {
    this.draftQuery = '';
    this.draftStatusFilter = '';
    this.draftFromDate = '';
    this.draftToDate = '';
    this.draftMinTotal = '';
    this.draftMaxTotal = '';
  }

  previousPage(): void {
    if (this.loading || this.page <= 1) return;
    this.page -= 1;
    this.refreshPagination();
  }

  nextPage(): void {
    if (this.loading || this.page >= this.pages) return;
    this.page += 1;
    this.refreshPagination();
  }

  toOrderStatusLabel(status: OrderStatus): string {
    if (status === 'PLACED') return 'Placee';
    if (status === 'PROCESSING') return 'En traitement';
    if (status === 'DELIVERED') return 'Livree';
    return 'Annulee';
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.query.trim()) count += 1;
    if (this.statusFilter) count += 1;
    if (this.fromDate) count += 1;
    if (this.toDate) count += 1;
    if (this.minTotal !== '') count += 1;
    if (this.maxTotal !== '') count += 1;
    return count;
  }
}
