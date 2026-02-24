import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  BoutiqueFulfillmentStatus,
  BoutiqueSaleDto,
  PaginationMeta
} from '../models/sales.models';
import { SalesApiService } from '../services/sales-api.service';

@Component({
  selector: 'app-boutique-orders-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boutique-orders-page.component.html',
  styleUrl: './boutique-orders-page.component.css'
})
export class BoutiqueOrdersPageComponent {
  private readonly api = inject(SalesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly orders = signal<BoutiqueSaleDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly selectedStatus = signal<BoutiqueFulfillmentStatus | ''>('');
  readonly page = signal(1);
  readonly limit = signal(20);

  readonly selectedOrderId = signal<string | null>(null);
  readonly selectedOrder = signal<BoutiqueSaleDto | null>(null);
  readonly detailsLoading = signal(false);
  readonly updating = signal(false);
  readonly modalError = signal<string | null>(null);

  readonly statusOptions: BoutiqueFulfillmentStatus[] = [
    'SCHEDULED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'REJECTED'
  ];

  readonly pageNumbers = computed(() => {
    const m = this.meta();
    if (!m) return [];
    const start = Math.max(1, m.page - 2);
    const end = Math.min(m.pages, m.page + 2);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  });

  readonly updateForm = this.fb.nonNullable.group({
    fulfillmentStatus: ['SCHEDULED' as BoutiqueFulfillmentStatus, Validators.required],
    deliveryDate: [''],
    fulfillmentNote: ['', [Validators.maxLength(500)]]
  });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .listBoutiqueOrders({
        page: this.page(),
        limit: this.limit(),
        status: this.selectedStatus()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders.set(res.data ?? []);
          this.meta.set(res.meta ?? null);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.orders.set([]);
          this.meta.set(null);
          this.errorMessage.set(error?.error?.message || 'Chargement des commandes impossible.');
        }
      });
  }

  onStatusFilter(value: string) {
    this.selectedStatus.set((value as BoutiqueFulfillmentStatus) || '');
    this.page.set(1);
    this.load();
  }

  onLimitChange(value: string) {
    const parsed = Number(value);
    this.limit.set(Number.isFinite(parsed) ? parsed : 20);
    this.page.set(1);
    this.load();
  }

  goToPage(page: number) {
    const m = this.meta();
    if (!m) return;
    const safe = Math.max(1, Math.min(page, m.pages));
    this.page.set(safe);
    this.load();
  }

  openDetails(order: BoutiqueSaleDto) {
    this.selectedOrderId.set(order.id);
    this.selectedOrder.set(order);
    this.detailsLoading.set(true);
    this.modalError.set(null);
    this.updateForm.reset({
      fulfillmentStatus: order.boutiqueOrder.fulfillmentStatus,
      deliveryDate: order.boutiqueOrder.deliveryDate ? this.toDateInputValue(order.boutiqueOrder.deliveryDate) : '',
      fulfillmentNote: order.boutiqueOrder.fulfillmentNote || ''
    });

    this.api
      .getBoutiqueOrderById(order.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.selectedOrder.set(res.data);
          this.detailsLoading.set(false);
          this.updateForm.reset({
            fulfillmentStatus: res.data.boutiqueOrder.fulfillmentStatus,
            deliveryDate: res.data.boutiqueOrder.deliveryDate
              ? this.toDateInputValue(res.data.boutiqueOrder.deliveryDate)
              : '',
            fulfillmentNote: res.data.boutiqueOrder.fulfillmentNote || ''
          });
        },
        error: (error) => {
          this.detailsLoading.set(false);
          this.modalError.set(error?.error?.message || 'Chargement detail impossible.');
        }
      });
  }

  closeDetails() {
    this.selectedOrderId.set(null);
    this.selectedOrder.set(null);
    this.modalError.set(null);
  }

  saveOrderUpdate() {
    const order = this.selectedOrder();
    if (!order) return;

    this.updateForm.markAllAsTouched();
    if (this.updateForm.invalid) return;

    const raw = this.updateForm.getRawValue();
    this.updating.set(true);
    this.modalError.set(null);

    this.api
      .updateBoutiqueOrder(order.id, {
        fulfillmentStatus: raw.fulfillmentStatus,
        deliveryDate: raw.deliveryDate ? new Date(raw.deliveryDate).toISOString() : undefined,
        fulfillmentNote: raw.fulfillmentNote?.trim() || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.updating.set(false);
          this.selectedOrder.set(res.data);
          this.load();
        },
        error: (error) => {
          this.updating.set(false);
          this.modalError.set(error?.error?.message || 'Mise a jour impossible.');
        }
      });
  }

  statusLabel(status: BoutiqueFulfillmentStatus) {
    switch (status) {
      case 'SCHEDULED':
        return 'Planifiee';
      case 'PREPARING':
        return 'Preparation';
      case 'READY':
        return 'Prete';
      case 'OUT_FOR_DELIVERY':
        return 'En livraison';
      case 'DELIVERED':
        return 'Livree';
      case 'REJECTED':
        return 'Rejetee';
      default:
        return status;
    }
  }

  buyerName(order: BoutiqueSaleDto) {
    const fullName = [order.buyerSnapshot?.firstName, order.buyerSnapshot?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return fullName || order.buyerSnapshot?.pseudo || order.buyerSnapshot?.email || '-';
  }

  private toDateInputValue(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

