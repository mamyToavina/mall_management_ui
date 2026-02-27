import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { finalize } from 'rxjs';

import {
  AccountActivationService,
  CompleteBoutiqueProfilePayload
} from '../services/account-activation.service';

@Component({
  selector: 'app-activate-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(AccountActivationService);
  private platformId = inject(PLATFORM_ID);

  loading = false;
  error = '';
  success = '';
  dragActive = false;
  logoPreview = '';
  private logoFile: File | null = null;
  private activationUserId = '';
  private activationToken = '';

  readonly form = this.fb.group({
    pseudo: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    boutiqueName: ['', [Validators.required, Validators.minLength(2)]],
    activity: ['', [Validators.required, Validators.minLength(2)]],
    offerings: ['', [Validators.required, Validators.minLength(8)]],
    marketingTagline: ['', [Validators.required, Validators.minLength(6)]],
    publicDescription: ['', [Validators.required, Validators.minLength(12)]],
    firstName: [''],
    lastName: [''],
    gender: [''],
    onlineSalesEnabled: [false],
    logo: [''],
  });

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const id = qp.get('id') ?? '';
    const token = qp.get('token') ?? '';

    this.activationUserId = id;
    this.activationToken = token;

    if (!id || !token) {
      this.error = 'Lien d activation invalide: userId ou token manquant.';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.activationUserId || !this.activationToken) {
      this.error = 'Lien d activation invalide: userId ou token manquant.';
      return;
    }

    const password = this.form.get('password')?.value ?? '';
    const confirm = this.form.get('confirmPassword')?.value ?? '';

    if (password !== confirm) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.error = '';
    this.success = '';
    this.loading = true;

    const raw = this.form.getRawValue();
    const payload: CompleteBoutiqueProfilePayload = {
      userId: this.activationUserId,
      token: this.activationToken,
      password: raw.password!,
      pseudo: raw.pseudo!,
      boutiqueName: raw.boutiqueName!,
      activity: raw.activity || undefined,
      offerings: raw.offerings || undefined,
      marketingTagline: raw.marketingTagline || undefined,
      publicDescription: raw.publicDescription || undefined,
      firstName: raw.firstName || undefined,
      lastName: raw.lastName || undefined,
      gender: raw.gender || undefined,
      onlineSalesEnabled: !!raw.onlineSalesEnabled,
      logo: undefined,
      logoFile: this.logoFile ?? undefined
    };

    this.api.completeBoutiqueProfile(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
      next: (res) => {
        this.success = res.message || 'Compte active avec succes.';

        if (isPlatformBrowser(this.platformId) && res?.boutique?.logo) {
          localStorage.setItem('ti.boutique.logo', res.boutique.logo);
        }

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1300);
      },
      error: (err: Error) => {
        this.error = err.message;
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.useLogoFile(file);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.useLogoFile(file);
    }
  }

  private useLogoFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error = 'Le logo doit etre une image.';
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.error = 'Le logo depasse 2MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      this.logoPreview = result;
      this.logoFile = file;
      this.error = '';
    };
    reader.readAsDataURL(file);
  }
}
