import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductsApiService } from '../services/products-api.service';
import { ProductStatus } from '../models/product.models';

@Component({
  selector: 'app-product-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-create-page.component.html',
  styleUrl: './product-create-page.component.css'
})
export class ProductCreatePageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly dragActive = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly selectedFileName = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  private selectedImageFile: File | null = null;

  readonly statusOptions: ProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

  readonly form = this.fb.group({
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
    trackStock: [true],
    stockQuantity: [0, [Validators.min(0)]],
    lowStockThreshold: [5, [Validators.min(0)]],
    allowBackorder: [false],
    status: ['DRAFT' as ProductStatus, [Validators.required]],
    isPublished: [false]
  });

  get imageRequiredError() {
    return !this.selectedImageFile && this.form.touched;
  }

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  ngOnDestroy() {
    this.clearPreview();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragActive.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) this.setSelectedImage(file);
  }

  onBrowseFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setSelectedImage(file);
  }

  removeImage() {
    this.selectedImageFile = null;
    this.selectedFileName.set(null);
    this.clearPreview();
  }

  resetForm() {
    this.form.reset({
      name: '',
      sku: '',
      brand: '',
      category: '',
      subCategory: '',
      description: '',
      tagsText: '',
      price: 0,
      salePrice: null,
      costPrice: null,
      taxRate: 0,
      unit: 'piece',
      trackStock: true,
      stockQuantity: 0,
      lowStockThreshold: 5,
      allowBackorder: false,
      status: 'DRAFT',
      isPublished: false
    });

    this.removeImage();
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  submit() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.form.markAllAsTouched();

    if (!this.selectedImageFile) {
      this.errorMessage.set('Veuillez ajouter une photo produit (obligatoire).');
      return;
    }

    if (this.form.invalid) {
      this.errorMessage.set('Veuillez corriger les champs invalides avant de continuer.');
      return;
    }

    const value = this.form.getRawValue();
    const basePrice = Number(value.price ?? 0);

    if (value.salePrice !== null && value.salePrice > basePrice) {
      this.errorMessage.set('Le prix promo ne peut pas depasser le prix de base.');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedImageFile);

    this.appendIfFilled(formData, 'name', value.name);
    this.appendIfFilled(formData, 'sku', value.sku);
    this.appendIfFilled(formData, 'brand', value.brand);
    this.appendIfFilled(formData, 'category', value.category);
    this.appendIfFilled(formData, 'subCategory', value.subCategory);
    this.appendIfFilled(formData, 'description', value.description);
    this.appendIfFilled(formData, 'unit', value.unit);
    this.appendIfFilled(formData, 'status', value.status);

    formData.append('price', String(basePrice));
    formData.append('taxRate', String(value.taxRate ?? 0));
    formData.append('trackStock', String(!!value.trackStock));
    formData.append('allowBackorder', String(!!value.allowBackorder));
    formData.append('isPublished', String(!!value.isPublished));
    formData.append('stockQuantity', String(value.stockQuantity ?? 0));
    formData.append('lowStockThreshold', String(value.lowStockThreshold ?? 0));

    if (value.salePrice !== null) formData.append('salePrice', String(value.salePrice));
    if (value.costPrice !== null) formData.append('costPrice', String(value.costPrice));

    const tags = (value.tagsText || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    formData.append('tags', JSON.stringify(tags));

    this.isSubmitting.set(true);

    this.productsApi
      .createMine(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.resetForm();
          this.successMessage.set('Produit cree avec succes.');
          this.errorMessage.set(null);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const message =
            error?.error?.message || 'Creation du produit impossible. Veuillez reessayer.';
          this.errorMessage.set(message);
        }
      });
  }

  goToCatalog() {
    this.router.navigate(['/boutique/products']).catch(() => {});
  }

  private setSelectedImage(file: File) {
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Le fichier doit etre une image valide (JPG, PNG, WEBP...).');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.errorMessage.set('Image trop lourde. Taille maximale: 5 MB.');
      return;
    }

    this.errorMessage.set(null);
    this.selectedImageFile = file;
    this.selectedFileName.set(file.name);
    this.clearPreview();
    this.previewUrl.set(URL.createObjectURL(file));
  }

  private clearPreview() {
    const preview = this.previewUrl();
    if (preview) URL.revokeObjectURL(preview);
    this.previewUrl.set(null);
  }

  private appendIfFilled(formData: FormData, key: string, value: string | null) {
    if (value && value.trim().length > 0) {
      formData.append(key, value.trim());
    }
  }
}
