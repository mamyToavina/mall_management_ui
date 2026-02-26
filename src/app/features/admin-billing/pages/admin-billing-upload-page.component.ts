import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBillingUploadResult } from '../models/admin-billing.models';
import { AdminBillingApiService } from '../services/admin-billing-api.service';

@Component({
  selector: 'app-admin-billing-upload-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-billing-upload-page.component.html',
  styleUrl: './admin-billing-upload-page.component.css'
})
export class AdminBillingUploadPageComponent {
  private readonly api = inject(AdminBillingApiService);
  private readonly now = new Date();

  readonly selectedMonth = signal(this.now.getMonth() + 1);
  readonly selectedYear = signal(this.now.getFullYear());
  readonly selectedFiles = signal<File[]>([]);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly uploadResult = signal<AdminBillingUploadResult | null>(null);

  readonly months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Fevrier' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Aout' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Decembre' }
  ] as const;

  readonly years = computed(() => {
    const currentYear = this.now.getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  });

  readonly totalSelectedSizeMb = computed(() => {
    const bytes = this.selectedFiles().reduce((sum, file) => sum + file.size, 0);
    return bytes / (1024 * 1024);
  });

  onFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.setValidatedFiles(files);
    input.value = '';
  }

  removeFile(index: number) {
    const next = [...this.selectedFiles()];
    next.splice(index, 1);
    this.selectedFiles.set(next);
  }

  clearFiles() {
    this.selectedFiles.set([]);
  }

  submitUpload() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.uploadResult.set(null);

    const files = this.selectedFiles();
    if (files.length === 0) {
      this.errorMessage.set('Veuillez selectionner au moins un fichier PDF.');
      return;
    }

    this.isSubmitting.set(true);
    this.api
      .uploadElectricityInvoices(this.selectedMonth(), this.selectedYear(), files)
      .subscribe({
        next: (result) => {
          this.uploadResult.set(result);
          this.selectedFiles.set([]);
          this.successMessage.set(
            `${result.uploaded} facture(s) traitee(s), ${result.failed} erreur(s).`
          );
          this.isSubmitting.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Upload impossible. Veuillez reessayer.');
          this.isSubmitting.set(false);
        }
      });
  }

  trackByName(_index: number, file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  private setValidatedFiles(files: File[]) {
    const current = this.selectedFiles();
    const filtered: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      const isPdfMime = file.type === 'application/pdf';
      const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
      if (!isPdfMime && !isPdfExt) {
        rejected.push(file.name);
        continue;
      }
      filtered.push(file);
    }

    const dedup = new Map<string, File>();
    for (const file of [...current, ...filtered]) {
      dedup.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    }

    if (rejected.length > 0) {
      this.errorMessage.set(`Fichier(s) ignores (non PDF): ${rejected.join(', ')}`);
    } else {
      this.errorMessage.set(null);
    }

    this.selectedFiles.set(Array.from(dedup.values()));
  }
}
