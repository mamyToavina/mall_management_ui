import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { AuthStore } from '../../../core/auth/auth.store';
import { DeliveryCapacityPolicy } from '../models/public-sales.models';
import { PublicCartStore } from '../services/public-cart.store';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';
import { PublicSalesApiService } from '../services/public-sales-api.service';

@Component({
  selector: 'app-public-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-cart-page.component.html',
  styleUrls: ['./public-cart-page.component.css']
})
export class PublicCartPageComponent {
  readonly cart = inject(PublicCartStore);
  readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly salesApi = inject(PublicSalesApiService);
  private readonly catalogApi = inject(PublicCatalogApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly defaultPromotionImage = this.catalogApi.defaultPromotionImage;
  checkoutLoading = false;
  checkoutMessage = '';
  checkoutError = '';
  checkoutFieldErrors: Record<string, string> = {};
  isCheckoutResultModalOpen = false;
  checkoutResultTitle = '';
  checkoutResultMessage = '';
  checkoutResultKind: 'success' | 'error' = 'success';
  pickupLocation = '';
  contactPhone = '';
  deliveryCapacityPolicy: DeliveryCapacityPolicy = 'AUTO_NEXT_AVAILABLE';

  get isUserConnected(): boolean {
    return this.store.isAuthenticated() && this.store.role() === 'USER';
  }

  removeItem(productId: string): void {
    this.cart.remove(productId);
  }

  increaseItem(productId: string): void {
    this.cart.increase(productId);
  }

  decreaseItem(productId: string): void {
    this.cart.decrease(productId);
  }

  setItemQuantity(productId: string, rawValue: string | number): void {
    const parsed = Number(rawValue);
    this.cart.setQuantity(productId, Number.isFinite(parsed) ? parsed : 1);
  }

  trackByProductId(_index: number, item: { productId: string }): string {
    return item.productId;
  }

  clearCart(): void {
    this.cart.clear();
  }

  onCartImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultPromotionImage)) return;
    img.src = this.defaultPromotionImage;
  }

  submitCheckout(): void {
    if (this.checkoutLoading) return;

    this.checkoutMessage = '';
    this.checkoutError = '';
    this.checkoutFieldErrors = {};

    if (!this.isUserConnected) {
      this.checkoutError = 'Connectez-vous avec un compte utilisateur pour commander.';
      this.openCheckoutModal('error', 'Commande impossible', this.checkoutError);
      this.router.navigate(['/login']);
      return;
    }

    const pickupLocation = this.pickupLocation.trim();
    const contactPhone = this.contactPhone.trim();

    if (pickupLocation.length < 5) {
      this.checkoutFieldErrors['pickupLocation'] = 'Lieu de retrait requis (minimum 5 caracteres).';
    }
    if (!/^[+0-9\s\-()]{6,30}$/.test(contactPhone)) {
      this.checkoutFieldErrors['contactPhone'] = 'Numero de contact invalide.';
    }
    if (Object.keys(this.checkoutFieldErrors).length > 0) return;

    const items = this.cart.items().map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    if (!items.length) {
      this.checkoutError = 'Votre panier est vide.';
      this.openCheckoutModal('error', 'Commande impossible', this.checkoutError);
      return;
    }

    this.checkoutLoading = true;
    const idempotencyKey = `sale-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    this.salesApi
      .checkout(
        {
          items,
          deliveryCapacityPolicy: this.deliveryCapacityPolicy,
          pickupLocation,
          contactPhone
        },
        idempotencyKey
      )
      .pipe(
        timeout(12000),
        finalize(() => {
          this.checkoutLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          const sale = res?.data;
          const currentCredit = Number(this.store.user()?.credit || 0);
          const spent = Number(sale?.totals?.grandTotal || 0);
          if (Number.isFinite(spent) && spent > 0) {
            this.store.updateUser({ credit: Math.max(0, currentCredit - spent) });
          }
          this.cart.clear();
          this.checkoutMessage = sale?.reference
            ? `Commande validee. Reference: ${sale.reference}`
            : 'Commande validee avec succes.';
          this.openCheckoutModal('success', 'Commande validee', this.checkoutMessage);
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.checkoutError = 'Le serveur met trop de temps a repondre. Veuillez reessayer.';
            this.openCheckoutModal('error', 'Echec de la commande', this.checkoutError);
            this.cdr.detectChanges();
            return;
          }

          this.checkoutError = err?.error?.message || 'Impossible de finaliser la commande.';
          this.openCheckoutModal('error', 'Echec de la commande', this.checkoutError);

          const errors = err?.error?.errors;
          if (Array.isArray(errors)) {
            for (const item of errors) {
              if (!item?.field || !item?.message) continue;
              this.checkoutFieldErrors[item.field] = item.message;
            }
          }
          this.cdr.detectChanges();
        }
      });
  }

  closeCheckoutModal(): void {
    this.isCheckoutResultModalOpen = false;
  }

  private openCheckoutModal(
    kind: 'success' | 'error',
    title: string,
    message: string
  ): void {
    this.checkoutResultKind = kind;
    this.checkoutResultTitle = title;
    this.checkoutResultMessage = message;
    this.isCheckoutResultModalOpen = true;
    this.cdr.detectChanges();
  }
}
