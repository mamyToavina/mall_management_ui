import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DeliveryCapacityCalendarDto } from '../models/sales.models';
import { SalesApiService } from '../services/sales-api.service';

@Component({
  selector: 'app-boutique-delivery-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boutique-delivery-settings-page.component.html',
  styleUrl: './boutique-delivery-settings-page.component.css'
})
export class BoutiqueDeliverySettingsPageComponent {
  private readonly api = inject(SalesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadingCalendar = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly calendar = signal<DeliveryCapacityCalendarDto | null>(null);

  readonly weekdayLabels = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi'
  ];

  readonly form = this.fb.nonNullable.group({
    dailyOrderCapacity: [30, [Validators.required, Validators.min(1), Validators.max(5000)]],
    preparationDays: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
    workingDays: this.fb.nonNullable.control<number[]>([1, 2, 3, 4, 5], [Validators.required])
  });

  constructor() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.api
      .getDeliverySettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const settings = res.data.deliverySettings;
          this.form.reset({
            dailyOrderCapacity: settings.dailyOrderCapacity,
            preparationDays: settings.preparationDays,
            workingDays: settings.workingDays
          });
          this.loading.set(false);
          this.loadCalendar();
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.error?.message || 'Chargement des parametres impossible.');
        }
      });
  }

  loadCalendar() {
    this.loadingCalendar.set(true);

    this.api
      .getDeliveryCapacityCalendar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.calendar.set(res.data);
          this.loadingCalendar.set(false);
        },
        error: () => {
          this.calendar.set(null);
          this.loadingCalendar.set(false);
        }
      });
  }

  save() {
    this.form.markAllAsTouched();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const raw = this.form.getRawValue();
    if (!raw.workingDays.length) {
      this.errorMessage.set('Selectionnez au moins un jour de livraison.');
      return;
    }
    if (this.form.invalid) return;

    this.saving.set(true);
    this.api
      .updateDeliverySettings({
        workingDays: [...raw.workingDays].sort((a, b) => a - b),
        dailyOrderCapacity: Number(raw.dailyOrderCapacity),
        preparationDays: Number(raw.preparationDays)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Parametres de livraison mis a jour.');
          this.loadCalendar();
        },
        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(error?.error?.message || 'Mise a jour impossible.');
        }
      });
  }

  toggleWorkingDay(day: number, checked: boolean) {
    const current = new Set(this.form.controls.workingDays.value);
    if (checked) current.add(day);
    else current.delete(day);
    this.form.controls.workingDays.setValue([...current].sort((a, b) => a - b));
    this.form.controls.workingDays.markAsDirty();
  }

  isWorkingDay(day: number) {
    return this.form.controls.workingDays.value.includes(day);
  }

  dayLabel(day: number) {
    return this.weekdayLabels[day] ?? `Jour ${day}`;
  }
}

