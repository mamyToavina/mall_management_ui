import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PaginationMeta, ProductDto } from '../models/product.models';
import { ProductsApiService } from '../services/products-api.service';

@Component({
  selector: 'app-product-low-stock-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-low-stock-page.component.html',
  styleUrl: './product-low-stock-page.component.css'
})
export class ProductLowStockPageComponent {
  private readonly api = inject(ProductsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly products = signal<ProductDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);

  readonly page = signal(1);
  readonly limit = signal(20);
  readonly search = signal('');
  readonly category = signal('');

  readonly pageNumbers = computed(() => {
    const meta = this.meta();
    if (!meta) return [];
    const start = Math.max(1, meta.page - 2);
    const end = Math.min(meta.pages, meta.page + 2);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  });

  constructor() {
    this.load();
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  onCategoryChange(value: string) {
    this.category.set(value);
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
    this.category.set('');
    this.limit.set(20);
    this.page.set(1);
    this.load();
  }

  goToPage(page: number) {
    const meta = this.meta();
    if (!meta) return;
    const safePage = Math.min(Math.max(1, page), meta.pages || 1);
    this.page.set(safePage);
    this.load();
  }

  shortage(product: ProductDto) {
    return Math.max(0, (product.lowStockThreshold ?? 0) - (product.stockQuantity ?? 0));
  }

  private load() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .listMine({
        page: this.page(),
        limit: this.limit(),
        lowStock: true,
        search: this.search().trim() || undefined,
        category: this.category().trim() || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.products.set(response.data ?? []);
          this.meta.set(response.meta ?? null);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.error?.message || 'Chargement stock faible impossible.');
          this.products.set([]);
          this.meta.set(null);
        }
      });
  }
}
