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

  clear(): void {
    this.itemsMap.set({});
  }
}
