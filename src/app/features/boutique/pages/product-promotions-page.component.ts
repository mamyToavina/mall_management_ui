import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PaginationMeta, ProductDto, ProductStatus } from '../models/product.models';
import { ProductsApiService } from '../services/products-api.service';

@Component({
  selector: 'app-product-promotions-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-promotions-page.component.html',
  styleUrl: './product-promotions-page.component.css'
})
export class ProductPromotionsPageComponent {
  private readonly api = inject(ProductsApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly products = signal<ProductDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly selectedProductId = signal('');

  readonly page = signal(1);
  readonly limit = signal(20);
  readonly search = signal('');
  readonly status = signal<ProductStatus | ''>('');
  readonly statusOptions: ProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

  readonly selectedProduct = computed(
    () => this.products().find((item) => item._id === this.selectedProductId()) ?? null
  );

  readonly pageNumbers = computed(() => {
    const meta = this.meta();
    if (!meta) return [];
    const start = Math.max(1, meta.page - 2);
    const end = Math.min(meta.pages, meta.page + 2);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  });

  readonly promotionForm = this.fb.group({
    percentage: [10, [Validators.required, Validators.min(1), Validators.max(90)]],
    startsAt: [this.currentLocalDateTime(), [Validators.required]],
    durationDays: [7, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    this.load();
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  onStatusChange(value: string) {
    this.status.set((value as ProductStatus) || '');
    this.page.set(1);
  }

  onLimitChange(value: string) {
    const parsed = Number(value);
    this.limit.set(Number.isFinite(parsed) ? parsed : 20);
    this.page.set(1);
    this.load();
  }

  applyFilters() {
    this.page.set(1);
    this.load();
  }

  resetFilters() {
    this.search.set('');
    this.status.set('');
    this.limit.set(20);
    this.page.set(1);
    this.load();
  }

  selectProduct(productId: string) {
    this.selectedProductId.set(productId);
  }

  applyPromotion() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.promotionForm.markAllAsTouched();

    const product = this.selectedProduct();
    if (!product) {
      this.errorMessage.set('Veuillez choisir un produit.');
      return;
    }

    if (this.promotionForm.invalid) {
      this.errorMessage.set('Veuillez corriger le formulaire promotion.');
      return;
    }

    const value = this.promotionForm.getRawValue();
    const startsAt = new Date(value.startsAt ?? '').toISOString();

    this.submitting.set(true);
    this.api
      .setPromotion(product._id, {
        percentage: Number(value.percentage ?? 0),
        startsAt,
        durationDays: Number(value.durationDays ?? 1)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.submitting.set(false);
          this.patchProduct(updated);
          this.successMessage.set('Promotion appliquee avec succes.');
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(error?.error?.message || 'Application promotion impossible.');
        }
      });
  }

  clearPromotion() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const product = this.selectedProduct();
    if (!product) {
      this.errorMessage.set('Veuillez choisir un produit.');
      return;
    }

    this.submitting.set(true);
    this.api
      .clearPromotion(product._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.submitting.set(false);
          this.patchProduct(updated);
          this.successMessage.set('Promotion retiree.');
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(error?.error?.message || 'Suppression promotion impossible.');
        }
      });
  }

  goToPage(page: number) {
    const meta = this.meta();
    if (!meta) return;
    const safePage = Math.min(Math.max(1, page), meta.pages || 1);
    this.page.set(safePage);
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .listMine({
        page: this.page(),
        limit: this.limit(),
        search: this.search().trim() || undefined,
        status: this.status()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.products.set(response.data ?? []);
          this.meta.set(response.meta ?? null);

          const selectedId = this.selectedProductId();
          const exists = response.data?.some((item) => item._id === selectedId);
          if (!exists) this.selectedProductId.set(response.data?.[0]?._id || '');
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.error?.message || 'Chargement produits impossible.');
          this.products.set([]);
          this.meta.set(null);
        }
      });
  }

  private patchProduct(updated: ProductDto) {
    this.products.update((items) =>
      items.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
    );
  }

  private currentLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}
