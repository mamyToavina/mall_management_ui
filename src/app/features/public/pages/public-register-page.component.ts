import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';

import {
  PublicApiErrorResponse,
  PublicAuthApiService,
  PublicRegisterGender
} from '../services/public-auth-api.service';

@Component({
  selector: 'app-public-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-register-page.component.html',
  styleUrls: ['./public-register-page.component.css']
})
export class PublicRegisterPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly publicAuthApi = inject(PublicAuthApiService);

  pseudo = '';
  email = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  gender: PublicRegisterGender | '' = '';
  avatarFile: File | null = null;
  selectedPhotoName = '';
  isDragOver = false;
  isSubmitting = false;
  submitAttempted = false;
  errorMessage = '';
  photoErrorMessage = '';
  backendFieldErrors: Record<string, string> = {};
  isResultModalOpen = false;
  resultModalType: 'loading' | 'success' | 'error' = 'loading';
  resultModalTitle = '';
  resultModalMessage = '';
  resultModalDetails: string[] = [];

  constructor() {
    this.title.setTitle('TI Commercial | Creer un compte');
    this.meta.updateTag({
      name: 'description',
      content: 'Creez votre compte TI Commercial pour acceder aux offres personnalisees et rappels d activites.'
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.applySelectedPhoto(file);
    this.clearBackendFieldError('avatar');
  }

  selectGender(gender: PublicRegisterGender): void {
    this.gender = this.gender === gender ? '' : gender;
    this.clearBackendFieldError('gender');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files?.[0] ?? null;
    this.applySelectedPhoto(file);
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.avatarFile = null;
    this.selectedPhotoName = '';
    this.photoErrorMessage = '';
    this.clearBackendFieldError('avatar');
    fileInput.value = '';
  }

  private applySelectedPhoto(file: File | null): void {
    if (!file) {
      this.avatarFile = null;
      this.selectedPhotoName = '';
      this.photoErrorMessage = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.photoErrorMessage = 'Veuillez selectionner une image valide.';
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.photoErrorMessage = 'La photo ne doit pas depasser 5 Mo.';
      return;
    }

    this.photoErrorMessage = '';
    this.avatarFile = file;
    this.selectedPhotoName = file.name;
  }

  submit(): void {
    if (this.isSubmitting || !this.canSubmit) return;

    this.submitAttempted = true;
    this.errorMessage = '';
    this.backendFieldErrors = {};
    if (!this.isClientFormValid()) {
      return;
    }

    this.isSubmitting = true;
    const selectedAvatar = this.avatarFile;
    this.openResultModal(
      'loading',
      'Creation en cours',
      'Veuillez patienter quelques secondes, votre compte est en cours de creation.'
    );

    this.publicAuthApi
      .registerUser({
        pseudo: this.pseudo.trim(),
        email: this.email.trim(),
        password: this.password,
        firstName: this.firstName.trim() || undefined,
        lastName: this.lastName.trim() || undefined,
        gender: this.gender || undefined,
        avatar: this.avatarFile
      })
      .pipe(timeout(25000))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.errorMessage = '';
          this.password = '';
          this.confirmPassword = '';
          this.avatarFile = null;
          this.selectedPhotoName = '';
          this.submitAttempted = false;
          this.backendFieldErrors = {};
          if (selectedAvatar && !res?.user?.avatar) {
            this.openResultModal(
              'error',
              'Compte cree sans photo',
              'Le compte a ete cree, mais la photo de profil n a pas ete enregistree.'
            );
            return;
          }

          this.openResultModal('success', 'Compte cree', res.message || 'Votre compte a ete cree avec succes.');
        },
        error: (err: unknown) => {
          this.isSubmitting = false;
          const parsed = this.parseApiError(err)
          this.errorMessage = parsed.message
          this.backendFieldErrors = parsed.fieldErrors
          this.openResultModal('error', 'Inscription impossible', parsed.message, parsed.details);
        }
      });
  }

  isFieldInvalid(invalid: boolean, touched: boolean): boolean {
    return invalid && (touched || this.submitAttempted);
  }

  get isPasswordMismatch(): boolean {
    if (!this.submitAttempted && !this.confirmPassword) return false;
    return this.password !== this.confirmPassword;
  }

  get canSubmit(): boolean {
    return this.isClientFormValid();
  }

  private isClientFormValid(): boolean {
    if (!this.pseudo.trim() || !this.email.trim() || !this.password) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) return false;
    if (this.password.length < 8) return false;
    if (!this.confirmPassword) return false;
    if (this.password !== this.confirmPassword) return false;
    if (this.photoErrorMessage) return false;
    return true;
  }

  clearBackendFieldError(field: string): void {
    if (!this.backendFieldErrors[field]) return;
    delete this.backendFieldErrors[field];
  }

  closeResultModal(): void {
    this.isResultModalOpen = false;
  }

  private openResultModal(
    type: 'loading' | 'success' | 'error',
    title: string,
    message: string,
    details: string[] = []
  ): void {
    this.resultModalType = type;
    this.resultModalTitle = title;
    this.resultModalMessage = message;
    this.resultModalDetails = details;
    this.isResultModalOpen = true;
  }

  private parseApiError(err: unknown): {
    message: string;
    details: string[];
    fieldErrors: Record<string, string>;
  } {
    if ((err as { name?: string })?.name === 'TimeoutError') {
      return {
        message: 'Le serveur met trop de temps a repondre. Veuillez reessayer.',
        details: [],
        fieldErrors: {}
      };
    }

    const httpErr = err as HttpErrorResponse;
    const apiError = (httpErr?.error || {}) as PublicApiErrorResponse;
    const message =
      apiError?.message ||
      (typeof httpErr?.error === 'string' ? httpErr.error : null) ||
      'Inscription impossible. Veuillez verifier les informations.';

    const fieldErrors: Record<string, string> = {};
    const details: string[] = [];
    if (Array.isArray(apiError?.errors)) {
      for (const item of apiError.errors) {
        if (!item || !item.field || !item.message) continue;
        fieldErrors[item.field] = item.message;
        details.push(item.message);
      }
    }

    return { message, details, fieldErrors };
  }
}
