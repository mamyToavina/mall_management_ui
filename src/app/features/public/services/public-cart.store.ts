import { Injectable, computed, signal } from '@angular/core';

export type CartItem = {
  productId: string;
  productName: string;
  boutiqueName: string;
  imageUrl: string;
  unitPrice: number;
  currency: string;
  quantity: number;
};

export type AddToCartPayload = {
  productId: string;
  productName: string;
  boutiqueName: string;
  imageUrl: string;
  unitPrice: number;
  currency: string;
};

@Injectable({ providedIn: 'root' })
export class PublicCartStore {
  private readonly itemsMap = signal<Record<string, CartItem>>({});

  readonly items = computed(() => Object.values(this.itemsMap()));

  readonly count = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly total = computed(() =>
    this.items().reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  );

  add(payload: AddToCartPayload): void {
    this.itemsMap.update((current) => {
      const existing = current[payload.productId];

      if (existing) {
        return {
          ...current,
          [payload.productId]: {
            ...existing,
            quantity: existing.quantity + 1
          }
        };
      }

      return {
        ...current,
        [payload.productId]: {
          ...payload,
          quantity: 1
        }
      };
    });
  }

  remove(productId: string): void {
    this.itemsMap.update((current) => {
      if (!current[productId]) return current;
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  increase(productId: string): void {
    this.itemsMap.update((current) => {
      const existing = current[productId];
      if (!existing) return current;

      return {
        ...current,
        [productId]: {
          ...existing,
          quantity: existing.quantity + 1
        }
      };
    });
  }

  decrease(productId: string): void {
    this.itemsMap.update((current) => {
      const existing = current[productId];
      if (!existing) return current;

      if (existing.quantity <= 1) {
        const next = { ...current };
        delete next[productId];
        return next;
      }

      return {
        ...current,
        [productId]: {
          ...existing,
          quantity: existing.quantity - 1
        }
      };
    });
  }

  setQuantity(productId: string, quantity: number): void {
    this.itemsMap.update((current) => {
      const existing = current[productId];
      if (!existing) return current;

      const safeQuantity = Math.max(1, Math.min(9999, Math.trunc(Number(quantity) || 1)));

      return {
        ...current,
        [productId]: {
          ...existing,
          quantity: safeQuantity
        }
      };
    });
  }

  clear(): void {
    this.itemsMap.set({});
  }
}
