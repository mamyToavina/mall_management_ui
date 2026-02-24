import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, startWith, switchMap } from 'rxjs';
import { ActivitiesApiService } from '../services/activities-api.service';
import { UpsertActivityPayload } from '../models/activity.models';

@Component({
  selector: 'app-activity-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activity-form-page.component.html',
  styleUrls: ['./activity-form-page.component.css']
})
export class ActivityFormPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ActivitiesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly dragActive = signal(false);
  readonly imageError = signal<string | null>(null);

  readonly selectedFileName = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(null);
  private selectedImageFile: File | null = null;

  readonly id = computed(() => this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => !!this.id());
  readonly pageTitle = computed(() => (this.isEdit() ? 'Modifier activite' : 'Nouvelle activite'));
  readonly tagOptions = [
    'Promotion Flash',
    'Animation Famille',
    'Concert Live',
    'Festival Culinaire',
    'Atelier Enfants',
    'Demonstration Produit',
    'Lancement Boutique',
    'Jeu Concours',
    'Soldes Speciales',
    'Evenement Solidaire',
    'Autre'
  ];
  readonly selectedTagOption = signal('Promotion Flash');
  readonly isOtherTag = computed(() => this.selectedTagOption() === 'Autre');

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120), Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.maxLength(1200)]],
    dateIso: ['', [Validators.required]],
    durationDays: [1, [Validators.required, Validators.min(1), Validators.max(365)]],
    location: ['', [Validators.required, Validators.maxLength(180)]],
    tagOption: ['Promotion Flash', [Validators.required]],
    customTag: [''],
    isPublished: [true]
  });

  constructor() {
    this.form.controls.tagOption.valueChanges
      .pipe(startWith(this.form.controls.tagOption.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedTagOption.set(value ?? '');
        this.syncCustomTagValidators(value);
      });

    if (!this.isEdit()) return;

    this.isLoading.set(true);
    this.api
      .getById(this.id()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (activity) => {
          this.form.setValue({
            title: activity.title,
            description: activity.description,
            dateIso: this.isoToDatetimeLocal(activity.dateIso),
            durationDays: activity.durationDays,
            location: activity.location,
            tagOption: this.tagOptions.includes(activity.tag) ? activity.tag : 'Autre',
            customTag: this.tagOptions.includes(activity.tag) ? '' : activity.tag,
            isPublished: activity.isPublished
          });
          this.previewUrl.set(activity.imageUrl);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error?.error?.message || 'Chargement impossible.');
        }
      });
  }

  onBrowseFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.handleImageFile(file);
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
    if (!file) return;
    this.handleImageFile(file);
  }

  removeSelectedImage() {
    this.selectedImageFile = null;
    this.selectedFileName.set(null);
    this.revokePreviewIfObjectUrl();
    this.imageError.set(null);
    if (this.isEdit()) return;
    this.previewUrl.set(null);
  }

  submit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    if (!this.isEdit() && !this.selectedImageFile) {
      this.imageError.set('Image obligatoire pour creer une activite.');
      return;
    }

    this.imageError.set(null);
    const payload = this.buildPayload();
    this.isSubmitting.set(true);

    if (this.isEdit()) {
      this.api
        .update(this.id()!, payload)
        .pipe(
          switchMap((updated) => {
            if (!this.selectedImageFile) return of(updated);
            return this.api.replacePhoto(this.id()!, this.selectedImageFile);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.selectedImageFile = null;
            this.selectedFileName.set(null);
            this.successMessage.set('Activite mise a jour.');
          },
          error: (error) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(error?.error?.message || 'Mise a jour impossible.');
          }
        });
      return;
    }

    this.api
      .create(payload, this.selectedImageFile!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/admin/activities']).catch(() => {});
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error?.error?.message || 'Creation impossible.');
        }
      });
  }

  ngOnDestroy(): void {
    this.revokePreviewIfObjectUrl();
  }

  private buildPayload(): UpsertActivityPayload {
    const raw = this.form.getRawValue();
    const tag = raw.tagOption === 'Autre' ? raw.customTag.trim() : raw.tagOption.trim();
    return {
      title: raw.title.trim(),
      description: raw.description.trim(),
      dateIso: new Date(raw.dateIso).toISOString(),
      durationDays: Number(raw.durationDays),
      location: raw.location.trim(),
      tag,
      isPublished: raw.isPublished
    };
  }

  private isoToDatetimeLocal(isoDate: string): string {
    const date = new Date(isoDate);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private revokePreviewIfObjectUrl() {
    const preview = this.previewUrl();
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }

  private handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.imageError.set('Le fichier doit etre une image valide.');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.imageError.set('Image trop lourde. Taille max: 5MB.');
      return;
    }

    this.imageError.set(null);
    this.selectedImageFile = file;
    this.selectedFileName.set(file.name);
    this.revokePreviewIfObjectUrl();
    this.previewUrl.set(URL.createObjectURL(file));
  }

  hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private syncCustomTagValidators(tagOption: string | null) {
    const customTagControl = this.form.controls.customTag;
    if (tagOption === 'Autre') {
      customTagControl.setValidators([Validators.required, Validators.maxLength(120)]);
    } else {
      customTagControl.clearValidators();
      customTagControl.setValue('', { emitEvent: false });
    }
    customTagControl.updateValueAndValidity({ emitEvent: false });
  }
}
