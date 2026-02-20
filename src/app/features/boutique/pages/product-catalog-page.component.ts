import {
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { ProductCatalogQuery, ProductDto, ProductStatus, PaginationMeta } from '../models/product.models';
import { ProductsApiService } from '../services/products-api.service';

@Component({
  selector: 'app-product-catalog-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-catalog-page.component.html',
  styleUrl: './product-catalog-page.component.css'
})
export class ProductCatalogPageComponent {
  private readonly api = inject(ProductsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly products = signal<ProductDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly page = signal(1);
  readonly limit = signal(10);
  readonly search = signal('');
  readonly status = signal<ProductStatus | ''>('');
  readonly category = signal('');
  readonly lowStock = signal(false);

  readonly statusOptions: ProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

  readonly query = computed<ProductCatalogQuery>(() => ({
    page: this.page(),
    limit: this.limit(),
    search: this.search().trim() || undefined,
    status: this.status(),
    category: this.category().trim() || undefined,
    lowStock: this.lowStock() ? true : undefined
  }));

  readonly pageNumbers = computed(() => {
    const m = this.meta();
    if (!m) return [];

    const start = Math.max(1, m.page - 2);
    const end = Math.min(m.pages, m.page + 2);
    const pages: number[] = [];
    for (let index = start; index <= end; index += 1) pages.push(index);
    return pages;
  });

  constructor() {
    afterNextRender(() => {
      const query$ = toObservable(this.query, { injector: this.injector });

      query$
        .pipe(
          debounceTime(200),
          distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
          switchMap((query) => {
            this.loading.set(true);
            this.errorMessage.set(null);

            return this.api.listMine(query).pipe(
              catchError((error) => {
                const message =
                  error?.error?.message ||
                  'Echec du chargement du catalogue produit. Veuillez reessayer.';
                this.errorMessage.set(message);
                return of({
                  data: [],
                  meta: {
                    total: 0,
                    page: query.page,
                    limit: query.limit,
                    pages: 1
                  }
                });
              })
            );
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((response) => {
          this.products.set(response.data ?? []);
          this.meta.set(response.meta ?? null);
          this.loading.set(false);
        });
    });
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  onStatusChange(value: string) {
    this.status.set((value as ProductStatus) || '');
    this.page.set(1);
  }

  onCategoryChange(value: string) {
    this.category.set(value);
    this.page.set(1);
  }

  onLowStockChange(checked: boolean) {
    this.lowStock.set(checked);
    this.page.set(1);
  }

  onLimitChange(value: string) {
    const parsed = Number(value);
    this.limit.set(Number.isFinite(parsed) ? parsed : 10);
    this.page.set(1);
  }

  goToPage(pageNumber: number) {
    const m = this.meta();
    if (!m) return;
    const safePage = Math.min(Math.max(1, pageNumber), m.pages || 1);
    this.page.set(safePage);
  }

  resetFilters() {
    this.search.set('');
    this.status.set('');
    this.category.set('');
    this.lowStock.set(false);
    this.limit.set(10);
    this.page.set(1);
  }

  trackByProductId(_index: number, product: ProductDto) {
    return product._id;
  }
}
