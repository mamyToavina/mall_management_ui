import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoxesApiService } from '../services/box.service';

type DetailField = { label: string; value: string };

@Component({
  selector: 'app-box-details-page',
  standalone: true,
  templateUrl: './box-details-page.component.html',
  styleUrls: ['./box-details-page.component.css'],
  imports: [CommonModule, RouterModule],
})
export class BoxDetailsPageComponent {
  private route = inject(ActivatedRoute);
  private api = inject(BoxesApiService);
  private destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly box = signal<any | null>(null);
  readonly contract = signal<any | null>(null);
  readonly boxStatus = computed(() => (this.box()?.boutique ? 'Occupé' : 'Libre'));

  readonly contractFields = computed<DetailField[]>(() => {
    const c = this.contract();
    if (!c || typeof c !== 'object') return [];

    return [
      { label: 'Référence', value: this.readContractValue(c, ['number', 'code', '_id', 'id']) },
      { label: 'Statut', value: this.readContractValue(c, ['status', 'state']) },
      { label: 'Date début', value: this.readContractValue(c, ['startDate', 'dateStart', 'start']) },
      { label: 'Date fin', value: this.readContractValue(c, ['endDate', 'dateEnd', 'end']) },
      { label: 'Locataire', value: this.readContractValue(c, ['buyer.fullName', 'buyer.name', 'tenant.fullName', 'tenant.name', 'client.fullName']) },
      { label: 'Téléphone', value: this.readContractValue(c, ['buyer.phone', 'tenant.phone', 'client.phone']) },
      { label: 'Loyer', value: this.readContractCurrency(c, ['monthlyRent', 'rent', 'amount']) },
      { label: 'Caution', value: this.readContractCurrency(c, ['deposit', 'securityDeposit', 'caution']) },
    ].filter((field) => field.value !== '-');
  });

  readonly contractExtraFields = computed<DetailField[]>(() => {
    const c = this.contract();
    if (!c || typeof c !== 'object') return [];

    const hiddenKeys = new Set([
      '_id',
      'id',
      '__v',
      'v',
      'number',
      'code',
      'status',
      'state',
      'startDate',
      'dateStart',
      'start',
      'endDate',
      'dateEnd',
      'end',
      'monthlyRent',
      'rent',
      'amount',
      'deposit',
      'securityDeposit',
      'caution',
      'buyer',
      'tenant',
      'client',
      'boutique',
      'box',
      'createdAt',
      'updatedAt',
    ]);

    return Object.entries(c)
      .filter(([key, value]) => !hiddenKeys.has(key) && this.hasValue(value))
      .slice(0, 8)
      .map(([key, value]) => ({
        label: this.labelFromKey(key),
        value: this.isCurrencyKey(key) ? this.formatAr(value) : this.formatValue(value),
      }));
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.error.set('');

    this.api
      .getFullDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.box.set(res?.box ?? null);
          this.contract.set(res?.contract ?? null);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur lors du chargement des détails');
          this.loading.set(false);
        },
      });
  }

  boutiqueName(): string {
    const b = this.box();
    const value = b?.boutique;
    if (!this.hasValue(value)) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value?.name || value?.title || value?.fullName || value?.number || value?._id || '-';
    }
    return '-';
  }

  formatAr(value: unknown): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return `${n.toLocaleString('fr-FR')} Ar`;
  }

  private readContractValue(contract: any, paths: string[]): string {
    for (const path of paths) {
      const value = this.readPath(contract, path);
      if (this.hasValue(value)) return this.formatValue(value);
    }
    return '-';
  }

  private readContractCurrency(contract: any, paths: string[]): string {
    for (const path of paths) {
      const value = this.readPath(contract, path);
      if (this.hasValue(value)) return this.formatAr(value);
    }
    return '-';
  }

  private readPath(source: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], source);
  }

  private hasValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private labelFromKey(key: string): string {
    const frLabels: Record<string, string> = {
      penaltyFee: 'Frais de pénalité',
      penaltyGrowthFactor: 'Coefficient de pénalité',
      terminationFee: 'Frais de rupture',
      onlineSalesCommissionPercent: 'Commission vente en ligne (%)',
      durationMonths: 'Durée (mois)',
      monthlyRent: 'Loyer mensuel',
      startDate: 'Date début',
      endDate: 'Date fin'
    };
    if (frLabels[key]) return frLabels[key];

    if (key === 'details' || key === 'notes' || key === 'note' || key === 'remark' || key === 'remarque') {
      return 'Note / Remarque';
    }
    const withSpaces = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }

  private isCurrencyKey(key: string): boolean {
    const k = key.toLowerCase();
    return k.includes('fee') || k.includes('rent') || k.includes('amount') || k.includes('caution');
  }

  private formatValue(value: any): string {
    if (!this.hasValue(value)) return '-';

    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'number') return value.toLocaleString('fr-FR');

    if (typeof value === 'string') {
      const maybeDate = new Date(value);
      if (!Number.isNaN(maybeDate.getTime()) && /[T-]/.test(value)) {
        return maybeDate.toLocaleDateString('fr-FR');
      }
      return value;
    }

    if (Array.isArray(value)) {
      if (!value.length) return '-';
      return value.map((item) => this.formatValue(item)).join(', ');
    }

    if (typeof value === 'object') {
      const display = value?.name ?? value?.fullName ?? value?.title ?? value?.number ?? value?._id;
      return this.hasValue(display) ? String(display) : '[Objet]';
    }

    return String(value);
  }
}
