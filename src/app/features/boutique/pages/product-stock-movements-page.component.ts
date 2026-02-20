import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  PaginationMeta,
  ProductDto,
  ProductStatus,
  StockMovementDto,
  StockOperation
} from '../models/product.models';
import { ProductsApiService } from '../services/products-api.service';

@Component({
  selector: 'app-product-stock-movements-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-stock-movements-page.component.html',
  styleUrl: './product-stock-movements-page.component.css'
})
export class ProductStockMovementsPageComponent {
  private readonly api = inject(ProductsApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadingProducts = signal(false);
  readonly loadingMovements = signal(false);
  readonly submitting = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly products = signal<ProductDto[]>([]);
  readonly productsMeta = signal<PaginationMeta | null>(null);
  readonly productPage = signal(1);
  readonly productLimit = signal(10);
  readonly productSearch = signal('');
  readonly productStatus = signal<ProductStatus | ''>('');
  readonly selectedProductId = signal<string>('');
  readonly movements = signal<StockMovementDto[]>([]);
  readonly movementsMeta = signal<PaginationMeta | null>(null);
  readonly movementPage = signal(1);
  readonly movementLimit = signal(20);

  readonly statusOptions: ProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];
  readonly operationOptions: StockOperation[] = ['INCREMENT', 'DECREMENT', 'SET'];

  readonly selectedProduct = computed(() =>
    this.products().find((product) => product._id === this.selectedProductId()) ?? null
  );

  readonly pageNumbers = computed(() => {
    const meta = this.movementsMeta();
    if (!meta) return [];

    const start = Math.max(1, meta.page - 2);
    const end = Math.min(meta.pages, meta.page + 2);
    const pages: number[] = [];
    for (let index = start; index <= end; index += 1) pages.push(index);
    return pages;
  });

  readonly productPageNumbers = computed(() => {
    const meta = this.productsMeta();
    if (!meta) return [];

    const start = Math.max(1, meta.page - 2);
    const end = Math.min(meta.pages, meta.page + 2);
    const pages: number[] = [];
    for (let index = start; index <= end; index += 1) pages.push(index);
    return pages;
  });

  readonly adjustForm = this.fb.group({
    operation: ['INCREMENT' as StockOperation, [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(0)]],
    reason: [''],
    note: [''],
    reference: ['']
  });

  constructor() {
    this.loadProducts();
  }

  onProductSearchChange(value: string) {
    this.productSearch.set(value);
    this.productPage.set(1);
  }

  onProductStatusChange(value: string) {
    this.productStatus.set((value as ProductStatus) || '');
    this.productPage.set(1);
  }

  applyProductFilters() {
    this.loadProducts();
  }

  resetProductFilters() {
    this.productSearch.set('');
    this.productStatus.set('');
    this.productPage.set(1);
    this.loadProducts();
  }

  goToProductPage(page: number) {
    const meta = this.productsMeta();
    if (!meta) return;
    const safePage = Math.min(Math.max(1, page), meta.pages || 1);
    this.productPage.set(safePage);
    this.loadProducts();
  }

  onSelectProduct(productId: string) {
    this.selectedProductId.set(productId);
    this.movementPage.set(1);
    this.loadMovements();
  }

  onMovementLimitChange(value: string) {
    const parsed = Number(value);
    this.movementLimit.set(Number.isFinite(parsed) ? parsed : 20);
    this.movementPage.set(1);
    this.loadMovements();
  }

  goToMovementPage(page: number) {
    const meta = this.movementsMeta();
    if (!meta) return;
    const safePage = Math.min(Math.max(1, page), meta.pages || 1);
    this.movementPage.set(safePage);
    this.loadMovements();
  }

  submitAdjustment() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.adjustForm.markAllAsTouched();

    const productId = this.selectedProductId();
    if (!productId) {
      this.errorMessage.set('Veuillez choisir un produit avant de faire un mouvement.');
      return;
    }

    if (this.adjustForm.invalid) {
      this.errorMessage.set('Veuillez corriger les champs invalides.');
      return;
    }

    const value = this.adjustForm.getRawValue();
    const operation: StockOperation = value.operation ?? 'INCREMENT';
    const quantity = Number(value.quantity ?? 0);

    if (['INCREMENT', 'DECREMENT'].includes(operation) && quantity <= 0) {
      this.errorMessage.set('La quantite doit etre superieure a 0 pour INCREMENT/DECREMENT.');
      return;
    }

    if (operation === 'SET' && quantity < 0) {
      this.errorMessage.set('La quantite ne peut pas etre negative.');
      return;
    }

    this.submitting.set(true);

    this.api
      .adjustStock(productId, {
        operation,
        quantity,
        reason: value.reason?.trim() || undefined,
        note: value.note?.trim() || undefined,
        reference: value.reference?.trim() || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedProduct) => {
          this.submitting.set(false);
          this.successMessage.set('Mouvement enregistre avec succes.');
          this.patchProduct(updatedProduct);
          this.movementPage.set(1);
          this.loadMovements();
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(error?.error?.message || 'Mouvement stock impossible.');
        }
      });
  }

  badgeType(type: string) {
    if (type === 'IN') return 'Entree';
    if (type === 'OUT') return 'Sortie';
    if (type === 'SET') return 'Ajustement';
    return 'Initial';
  }

  private loadProducts() {
    this.loadingProducts.set(true);
    this.errorMessage.set(null);

    this.api
      .listMine({
        page: this.productPage(),
        limit: this.productLimit(),
        search: this.productSearch().trim() || undefined,
        status: this.productStatus()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loadingProducts.set(false);
          this.products.set(response.data ?? []);
          this.productsMeta.set(response.meta ?? null);

          const selectedId = this.selectedProductId();
          const stillVisible = response.data?.some((item) => item._id === selectedId);
          if (!stillVisible) {
            const firstProduct = response.data?.[0];
            this.selectedProductId.set(firstProduct?._id || '');
          }

          if (this.selectedProductId()) {
            this.loadMovements();
          } else {
            this.movements.set([]);
            this.movementsMeta.set(null);
          }
        },
        error: () => {
          this.loadingProducts.set(false);
          this.productsMeta.set(null);
          this.errorMessage.set('Chargement des produits impossible.');
        }
      });
  }

  private loadMovements() {
    const productId = this.selectedProductId();
    if (!productId) {
      this.movements.set([]);
      this.movementsMeta.set(null);
      return;
    }

    this.loadingMovements.set(true);
    this.errorMessage.set(null);

    this.api
      .listStockMovements(productId, this.movementPage(), this.movementLimit())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loadingMovements.set(false);
          this.movements.set(response.data ?? []);
          this.movementsMeta.set(response.meta ?? null);
        },
        error: (error) => {
          this.loadingMovements.set(false);
          this.errorMessage.set(error?.error?.message || 'Historique stock introuvable.');
          this.movements.set([]);
          this.movementsMeta.set(null);
        }
      });
  }

  private patchProduct(product: ProductDto) {
    this.products.update((list) =>
      list.map((item) => (item._id === product._id ? { ...item, ...product } : item))
    );
  }
}
