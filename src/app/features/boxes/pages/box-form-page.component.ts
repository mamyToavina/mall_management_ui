import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoxesApiService } from '../services/box.service';
import { BoxDto } from '../models/box.models';

@Component({
  selector: 'app-box-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h2>{{ title() }}</h2>
          <p class="sub">{{ subtitle() }}</p>
        </div>

        <a class="btn" routerLink="/boxes">← Retour liste</a>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="grid">
            <label class="field">
              <span>Numéro</span>
              <input type="text" formControlName="number" placeholder="ex: B12" />
              <small class="err" *ngIf="isInvalid('number')">Numéro requis</small>
            </label>

            <label class="field">
              <span>Étage</span>
              <input type="number" formControlName="floor" placeholder="ex: 1" />
              <small class="err" *ngIf="isInvalid('floor')">Étage requis (>=0)</small>
            </label>

            <label class="field">
              <span>Surface (m²)</span>
              <input type="number" formControlName="surface" placeholder="ex: 20" />
              <small class="err" *ngIf="isInvalid('surface')">Surface requise (>0)</small>
            </label>

            <label class="field">
              <span>Loyer mensuel</span>
              <input type="number" formControlName="monthlyRent" placeholder="ex: 250000" />
              <small class="err" *ngIf="isInvalid('monthlyRent')">Loyer requis (>=0)</small>
            </label>

            <label class="field">
              <span>Compteur électricité</span>
              <input type="text" formControlName="electricityMeterNumber" placeholder="optionnel" />
            </label>

            <label class="field">
              <span>Boutique</span>
              <input type="text" formControlName="boutique" placeholder="optionnel" />
            </label>
          </div>

          <div class="actions">
            <button class="btn" type="button" (click)="reset()">Reset</button>

            <button class="btn primary" type="submit" [disabled]="saving() || form.invalid">
              {{ saving() ? 'Enregistrement...' : (isEdit() ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>

    </div>
  `,
  styleUrls: ['box-form-page.component.css']
})
export class BoxFormPageComponent {
  private fb = inject(FormBuilder);
  private api = inject(BoxesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly saving = signal(false);

  readonly id = computed(() => this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => !!this.id());

  readonly title = computed(() => this.isEdit() ? 'Modifier une box' : 'Créer une nouvelle box');
  readonly subtitle = computed(() =>
    this.isEdit() ? 'Met à jour les informations de la box.' : 'Crée une box et l’ajoute à la liste.'
  );

  readonly form = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.maxLength(50)]],
    floor: [0, [Validators.required, Validators.min(0)]],
    surface: [1, [Validators.required, Validators.min(1)]],
    monthlyRent: [0, [Validators.required, Validators.min(0)]],
    electricityMeterNumber: [''],
    boutique: [''],
  });

  constructor() {
    // Si edit -> charger data et patcher
    if (this.isEdit()) {
      const boxId = this.id()!;
      this.saving.set(true);

      this.api.getFullDetails(boxId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            const b = res.box as Partial<BoxDto>;
            this.form.patchValue({
              number: String(b.number ?? ''),
              floor: Number(b.floor ?? 0),
              surface: Number(b.surface ?? 1),
              monthlyRent: Number(b.monthlyRent ?? 0),
              electricityMeterNumber: (b.electricityMeterNumber ?? '') as any,
              boutique: (b.boutique ?? '') as any,
            });
            this.saving.set(false);
          },
          error: () => this.saving.set(false),
        });
    }
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[controlName];
    return c.invalid && (c.dirty || c.touched);
  }

  reset(): void {
    if (this.isEdit()) {
      const boxId = this.id()!;
      this.saving.set(true);
      this.api.getFullDetails(boxId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            const b = res.box as Partial<BoxDto>;
            this.form.reset({
              number: String(b.number ?? ''),
              floor: Number(b.floor ?? 0),
              surface: Number(b.surface ?? 1),
              monthlyRent: Number(b.monthlyRent ?? 0),
              electricityMeterNumber: (b.electricityMeterNumber ?? '') as any,
              boutique: (b.boutique ?? '') as any,
            });
            this.saving.set(false);
          },
          error: () => this.saving.set(false),
        });
    } else {
      this.form.reset({
        number: '',
        floor: 0,
        surface: 1,
        monthlyRent: 0,
        electricityMeterNumber: '',
        boutique: '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;

    const payload: Partial<BoxDto> = {
      number: this.form.value.number!,
      floor: Number(this.form.value.floor),
      surface: Number(this.form.value.surface),
      monthlyRent: Number(this.form.value.monthlyRent),
      electricityMeterNumber: this.form.value.electricityMeterNumber?.trim() || null,
      boutique: this.form.value.boutique?.trim() || null,
    };

    this.saving.set(true);

    const req$ = this.isEdit()
      ? this.api.updateBox(this.id()!, payload)
      : this.api.createBox(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (box) => {
        this.saving.set(false);

        if (this.isEdit()) {
          this.router.navigate(['/boxes']).catch(() => {});
        } else {
          this.router.navigate(['/boxes']).catch(() => {});
        }
      },
      error: () => this.saving.set(false),
    });
  }
}
