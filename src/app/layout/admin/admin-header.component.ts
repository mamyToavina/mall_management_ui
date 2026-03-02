import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';

import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="header">
      <div class="left">
        <button
          class="icon-btn mobile-only"
          type="button"
          (click)="layout.toggleMobileSidebar()"
          aria-label="Ouvrir le menu"
        >
          &#9776;
        </button>

        <button
          class="icon-btn desktop-only"
          type="button"
          (click)="layout.toggleCollapse()"
          aria-label="Reduire ou etendre la barre laterale"
        >
          &#9776;
        </button>

        <a class="brand" routerLink="/" aria-label="Accueil">
          <span class="logo" aria-hidden="true">
            <img src="assets/logo_ti_commercial.png" alt="" />
          </span>
          <span class="brand-text">Admin Panel</span>
        </a>
      </div>

      <div class="right" *ngIf="store.user() as user">
        <span
          class="icon-btn theme-toggle"
          role="button"
          tabindex="0"
          (click)="theme.toggle()"
          (keydown.enter)="theme.toggle()"
          (keydown.space)="theme.toggle()"
          [attr.aria-label]="theme.mode() === 'dark'
            ? 'Passer en mode clair'
            : 'Passer en mode sombre'"
        >
          <span aria-hidden="true" [innerHTML]="theme.mode() === 'dark' ? '&#9728;' : '&#9790;'"></span>
        </span>

        <div
          class="user"
          role="button"
          tabindex="0"
          (click)="openProfile()"
          (keydown.enter)="openProfile()"
        >
          <img
            class="avatar"
            [src]="headerAvatar() || 'assets/default-avatar.png'"
            alt="Photo de profil"
          />
          <div class="meta">
            <div class="name">{{ user.pseudo }}</div>
            <div class="role">{{ user.role }}</div>
          </div>
        </div>

        <button
          class="icon-btn danger"
          type="button"
          (click)="auth.logout().subscribe()"
          aria-label="Se deconnecter"
        >
          &#9099;
        </button>
      </div>
    </header>

    <ng-container *ngIf="profileOpen">
      <div class="profile-backdrop" (click)="closeProfile()"></div>
      <div class="profile-modal" role="dialog" aria-modal="true">
        <div class="profile-header">
          <div>
            <div class="profile-title">Profil administrateur</div>
            <div class="profile-subtitle">Modifiez vos informations</div>
          </div>
          <button class="icon-btn" type="button" (click)="closeProfile()" aria-label="Fermer">X</button>
        </div>

        <form class="profile-form" (ngSubmit)="submitProfile()">
          <div class="profile-grid">
            <label class="field">
              <span>Pseudo</span>
              <input name="pseudo" [(ngModel)]="profile.pseudo" required />
            </label>
            <label class="field">
              <span>Email</span>
              <input name="email" type="email" [(ngModel)]="profile.email" required />
            </label>
            <label class="field">
              <span>Prenom</span>
              <input name="firstName" [(ngModel)]="profile.firstName" />
            </label>
            <label class="field">
              <span>Nom</span>
              <input name="lastName" [(ngModel)]="profile.lastName" />
            </label>
            <label class="field">
              <span>Genre</span>
              <select name="gender" [(ngModel)]="profile.gender">
                <option value="">Non defini</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
                <option value="Other">Autre</option>
              </select>
            </label>
            <label class="field">
              <span>Avatar</span>
              <input name="avatar" type="file" accept="image/*" (change)="onAvatarChange($event)" />
              <small class="hint" *ngIf="avatarName">{{ avatarName }}</small>
            </label>
          </div>

          <div class="profile-divider"></div>

          <div class="profile-grid">
            <label class="field">
              <span>Mot de passe actuel</span>
              <input
                name="currentPassword"
                type="password"
                [(ngModel)]="profile.currentPassword"
                autocomplete="current-password"
              />
            </label>
            <label class="field">
              <span>Nouveau mot de passe</span>
              <input
                name="newPassword"
                type="password"
                [(ngModel)]="profile.newPassword"
                autocomplete="new-password"
              />
            </label>
            <label class="field">
              <span>Confirmer nouveau mot de passe</span>
              <input
                name="confirmPassword"
                type="password"
                [(ngModel)]="profile.confirmPassword"
                autocomplete="new-password"
              />
            </label>
          </div>

          <div class="notice error" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="notice success" *ngIf="successMessage">{{ successMessage }}</div>

          <div class="actions">
            <button class="icon-btn" type="button" (click)="closeProfile()">Annuler</button>
            <button class="icon-btn primary" type="submit" [disabled]="isSaving">
              {{ isSaving ? 'Mise a jour...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </ng-container>
  `,
  styleUrls: ['admin-header.component.css'],
})
export class AdminHeaderComponent {
  store = inject(AuthStore);
  auth = inject(AuthService);
  layout = inject(LayoutService);
  theme = inject(ThemeService);

  profileOpen = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  avatarName = '';
  avatarFile: File | null = null;
  avatarPreview = '';
  profile = {
    pseudo: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '' as '' | 'Male' | 'Female' | 'Other',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  openProfile(): void {
    const user = this.store.user();
    if (!user) return;

    this.profile = {
      pseudo: user.pseudo || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      gender: (user.gender as '' | 'Male' | 'Female' | 'Other') || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.avatarFile = null;
    this.avatarName = '';
    this.avatarPreview = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.profileOpen = true;
  }

  closeProfile(): void {
    this.profileOpen = false;
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.avatarFile = null;
    this.avatarName = '';
    this.avatarPreview = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Veuillez selectionner une image valide.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'La photo de profil ne doit pas depasser 5 Mo.';
      return;
    }
    this.avatarFile = file;
    this.avatarName = file.name;
    this.avatarPreview = URL.createObjectURL(file);
  }

  submitProfile(): void {
    if (this.isSaving) return;
    if (this.profile.newPassword && !this.profile.currentPassword) {
      this.errorMessage = 'Mot de passe actuel obligatoire pour changer le mot de passe.';
      return;
    }
    if (this.profile.newPassword && this.profile.newPassword.length < 8) {
      this.errorMessage = 'Le nouveau mot de passe doit contenir au moins 8 caracteres.';
      return;
    }
    if (this.profile.newPassword && this.profile.newPassword !== this.profile.confirmPassword) {
      this.errorMessage = 'La confirmation du mot de passe ne correspond pas.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      pseudo: this.profile.pseudo,
      email: this.profile.email,
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      gender: this.profile.gender,
      avatar: this.avatarFile,
      ...(this.profile.currentPassword ? { currentPassword: this.profile.currentPassword } : {}),
      ...(this.profile.newPassword ? { newPassword: this.profile.newPassword } : {})
    };

    this.auth
      .updateMyProfile(payload)
      .pipe(timeout(15000))
      .subscribe({
        next: (res) => {
          this.successMessage = res?.message || 'Profil mis a jour.';
          this.avatarFile = null;
          this.avatarName = '';
          this.avatarPreview = this.resolveAvatarUrl(res?.user?.avatar) || '';
          this.profile.currentPassword = '';
          this.profile.newPassword = '';
          this.profile.confirmPassword = '';
          this.isSaving = false;
        },
        error: (err) => {
          const errors = err?.error?.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            this.errorMessage = errors[0]?.message || 'Echec de mise a jour.';
          } else if (err?.name === 'TimeoutError') {
            this.errorMessage = 'Le serveur met trop de temps a repondre.';
          } else {
            this.errorMessage = err?.error?.message || 'Echec de mise a jour.';
          }
          this.isSaving = false;
        }
      });
  }

  headerAvatar(): string {
    if (this.avatarPreview) return this.avatarPreview;
    return this.resolveAvatarUrl(this.store.user()?.avatar);
  }

  private resolveAvatarUrl(avatar?: string | null): string {
    const raw = String(avatar || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = String(environment.apiBaseUrl || '').replace(/\/api\/?$/, '');
    if (!base) return raw.startsWith('/') ? raw : `/${raw}`;
    return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
  }
}
