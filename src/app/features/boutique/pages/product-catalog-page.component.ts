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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { ProductCatalogQuery, ProductDto, ProductStatus, PaginationMeta } from '../models/product.models';
import { ProductsApiService } from '../services/products-api.service';
import { environment } from '../../../../environments/environment';

type ConfirmActionType =
  | 'save-product'
  | 'delete-product'
  | 'remove-image'
  | 'add-image'
  | 'replace-image';

type ConfirmAction = {
  type: ConfirmActionType;
  productId: string;
  imagePath?: string;
  file?: File;
};

@Component({
  selector: 'app-product-catalog-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-catalog-page.component.html',
  styleUrl: './product-catalog-page.component.css'
})
export class ProductCatalogPageComponent {
  private readonly api = inject(ProductsApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly assetBaseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');

  readonly products = signal<ProductDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly actionLoading = signal(false);
  readonly publishLoadingId = signal<string | null>(null);

  readonly page = signal(1);
  readonly limit = signal(10);
  readonly search = signal('');
  readonly status = signal<ProductStatus | ''>('');
  readonly category = signal('');
  readonly lowStock = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly editingProductId = signal<string | null>(null);
  readonly editingProduct = signal<ProductDto | null>(null);
  readonly confirmAction = signal<ConfirmAction | null>(null);

  readonly statusOptions: ProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

  readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    sku: ['', [Validators.required, Validators.maxLength(80)]],
    brand: ['', [Validators.maxLength(80)]],
    category: ['', [Validators.maxLength(80)]],
    subCategory: ['', [Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(1200)]],
    tagsText: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    salePrice: [null as number | null, [Validators.min(0)]],
    costPrice: [null as number | null, [Validators.min(0)]],
    taxRate: [0, [Validators.min(0)]],
    unit: ['piece', [Validators.maxLength(30)]],
    status: ['DRAFT' as ProductStatus, [Validators.required]],
    trackStock: [true],
    lowStockThreshold: [5, [Validators.min(0)]],
    allowBackorder: [false],
    isPublished: [false]
  });

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
          debounceTime(100),
          distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
          switchMap((query) => {
            this.loading.set(true);
            this.errorMessage.set(null);

            return this.api.listMine(query).pipe(
              catchError((error) => {
                const message =
                  error?.error?.message ||
                  'Échec du chargement du catalogue produit. Veuillez réessayer.';
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
    this.successMessage.set(null);
  }

  publishedCount() {
    return this.products().filter((item) => !!item.isPublished).length;
  }

  statusLabel(status: ProductStatus) {
    if (status === 'ACTIVE') return 'Actif';
    if (status === 'ARCHIVED') return 'Archivé';
    return 'Brouillon';
  }

  togglePublished(product: ProductDto) {
    const nextValue = !product.isPublished;
    this.publishLoadingId.set(product._id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.api
      .updateMine(product._id, { isPublished: nextValue })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.products.update((items) =>
            items.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
          );

          if (this.editingProductId() === updated._id) {
            const current = this.editingProduct();
            if (current) this.editingProduct.set({ ...current, ...updated });
            this.editForm.patchValue({ isPublished: !!updated.isPublished }, { emitEvent: false });
          }

          this.publishLoadingId.set(null);
          this.successMessage.set(
            nextValue ? 'Produit publié avec succès.' : 'Produit retiré de la publication.'
          );
        },
        error: (error) => {
          this.publishLoadingId.set(null);
          this.errorMessage.set(error?.error?.message || 'Mise a jour publication impossible.');
        }
      });
  }

  trackByProductId(_index: number, product: ProductDto) {
    return product._id;
  }

  openEditModal(product: ProductDto) {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.editingProductId.set(product._id);
    this.editingProduct.set(product);
    this.editForm.reset({
      name: product.name ?? '',
      sku: product.sku ?? '',
      brand: product.brand ?? '',
      category: product.category ?? '',
      subCategory: product.subCategory ?? '',
      description: product.description ?? '',
      tagsText: (product.tags ?? []).join(', '),
      price: product.price ?? 0,
      salePrice: product.salePrice ?? null,
      costPrice: product.costPrice ?? null,
      taxRate: product.taxRate ?? 0,
      unit: product.unit ?? 'piece',
      status: product.status ?? 'DRAFT',
      trackStock: product.trackStock ?? true,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      allowBackorder: product.allowBackorder ?? false,
      isPublished: product.isPublished ?? false
    });

    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    if (this.actionLoading()) return;
    this.isEditModalOpen.set(false);
    this.confirmAction.set(null);
    this.editingProductId.set(null);
    this.editingProduct.set(null);
  }

  askSaveProduct() {
    const productId = this.editingProductId();
    if (!productId) return;

    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) {
      this.errorMessage.set('Veuillez corriger les champs invalides avant de continuer.');
      return;
    }

    this.confirmAction.set({ type: 'save-product', productId });
  }

  askDeleteProduct() {
    const productId = this.editingProductId();
    if (!productId) return;
    this.confirmAction.set({ type: 'delete-product', productId });
  }

  askAddImage(file: File | null) {
    const productId = this.editingProductId();
    if (!productId || !file) return;
    this.confirmAction.set({ type: 'add-image', productId, file });
  }

  askReplaceImage(imagePath: string, file: File | null) {
    const productId = this.editingProductId();
    if (!productId || !file) return;
    this.confirmAction.set({ type: 'replace-image', productId, imagePath, file });
  }

  askRemoveImage(imagePath: string) {
    const productId = this.editingProductId();
    if (!productId) return;
    this.confirmAction.set({ type: 'remove-image', productId, imagePath });
  }

  closeConfirmModal() {
    if (this.actionLoading()) return;
    this.confirmAction.set(null);
  }

  confirmMessage() {
    const action = this.confirmAction();
    if (!action) return '';

    if (action.type === 'save-product') return 'Confirmer la mise à jour du produit ?';
    if (action.type === 'delete-product') return 'Confirmer la suppression définitive du produit ?';
    if (action.type === 'add-image') return "Confirmer l'ajout de cette image ?";
    if (action.type === 'replace-image') return 'Confirmer le remplacement de cette image ?';
    return 'Confirmer la suppression de cette image ?';
  }

  confirmActionAndExecute() {
    const action = this.confirmAction();
    if (!action) return;

    this.actionLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (action.type === 'save-product') {
      this.executeSave(action.productId);
      return;
    }

    if (action.type === 'delete-product') {
      this.executeDelete(action.productId);
      return;
    }

    if (action.type === 'add-image' && action.file) {
      this.api
        .addImage(action.productId, action.file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => this.onActionSuccess(updated, 'Image ajoutée avec succès.'),
          error: (error) => this.onActionError(error?.error?.message || "Ajout d'image impossible.")
        });
      return;
    }

    if (action.type === 'replace-image' && action.imagePath && action.file) {
      this.api
        .replaceImage(action.productId, action.imagePath, action.file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => this.onActionSuccess(updated, 'Image remplacée avec succès.'),
          error: (error) =>
            this.onActionError(error?.error?.message || "Remplacement d'image impossible.")
        });
      return;
    }

    if (action.type === 'remove-image' && action.imagePath) {
      this.api
        .removeImage(action.productId, action.imagePath)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => this.onActionSuccess(updated, 'Image supprimée avec succès.'),
          error: (error) =>
            this.onActionError(error?.error?.message || "Suppression d'image impossible.")
        });
      return;
    }

    this.actionLoading.set(false);
    this.confirmAction.set(null);
  }

  imageUrl(imagePath?: string) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${this.assetBaseUrl}${imagePath}`;
  }

  publicationLabel(product: ProductDto) {
    return product.isPublished ? 'Publié' : 'Non publié';
  }

  private executeSave(productId: string) {
    const value = this.editForm.getRawValue();
    const basePrice = Number(value.price ?? 0);

    if (value.salePrice !== null && value.salePrice > basePrice) {
      this.onActionError('Le prix promo ne peut pas dépasser le prix de base.');
      return;
    }

    const payload = {
      name: value.name?.trim(),
      sku: value.sku?.trim(),
      brand: value.brand?.trim() || undefined,
      category: value.category?.trim() || undefined,
      subCategory: value.subCategory?.trim() || undefined,
      description: value.description?.trim() || undefined,
      tags: (value.tagsText || '')
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
      price: basePrice,
      salePrice: value.salePrice ?? undefined,
      costPrice: value.costPrice ?? undefined,
      taxRate: value.taxRate ?? 0,
      unit: value.unit?.trim() || 'piece',
      status: value.status as ProductStatus,
      trackStock: !!value.trackStock,
      lowStockThreshold: Number(value.lowStockThreshold ?? 0),
      allowBackorder: !!value.allowBackorder,
      isPublished: !!value.isPublished
    };

    this.api
      .updateMine(productId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => this.onActionSuccess(updated, 'Produit mis à jour avec succès.'),
        error: (error) =>
          this.onActionError(error?.error?.message || 'Mise à jour du produit impossible.')
      });
  }

  private executeDelete(productId: string) {
    this.api
      .deleteMine(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.products.update((items) => items.filter((item) => item._id !== productId));
          this.successMessage.set('Produit supprimé avec succès.');
          this.actionLoading.set(false);
          this.confirmAction.set(null);
          this.closeEditModal();
        },
        error: (error) =>
          this.onActionError(error?.error?.message || 'Suppression produit impossible.')
      });
  }

  private onActionSuccess(updated: ProductDto, message: string) {
    this.products.update((items) =>
      items.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
    );
    this.editingProduct.set(updated);
    this.successMessage.set(message);
    this.actionLoading.set(false);
    this.confirmAction.set(null);
  }

  private onActionError(message: string) {
    this.errorMessage.set(message);
    this.actionLoading.set(false);
    this.confirmAction.set(null);
  }
}

