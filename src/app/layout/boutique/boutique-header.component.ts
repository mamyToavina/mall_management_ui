import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, DestroyRef, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';

import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';
import { RealtimeService } from '../../core/realtime/realtime.service';

@Component({
  selector: 'app-boutique-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="header">
      <div class="left">
        <button
          class="icon-btn mobile-only"
          type="button"
          (click)="onMobileMenuClick($event)"
          aria-label="Ouvrir le menu"
        >
          <span aria-hidden="true">&#9776;</span>
        </button>

        <button
          class="icon-btn desktop-only"
          type="button"
          (click)="onDesktopMenuClick($event)"
          aria-label="Reduire ou etendre la barre laterale"
        >
          <span aria-hidden="true">&#9776;</span>
        </button>

        <a class="brand" routerLink="/boutique/home" aria-label="Accueil boutique">
          <span class="logo" aria-hidden="true">TI</span>
          <span class="brand-text">TI Boutique</span>
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
          [attr.aria-label]="theme.mode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
        >
          <span aria-hidden="true" [innerHTML]="theme.mode() === 'dark' ? '&#9728;' : '&#9790;'"></span>
        </span>

        <div class="notify-wrap">
          <span
            class="icon-btn notify"
            role="button"
            tabindex="0"
            (click)="toggleNotifications()"
            (keydown.enter)="toggleNotifications()"
            (keydown.space)="toggleNotifications()"
            aria-label="Notifications commandes boutique"
          >
            <span class="badge" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
            <span aria-hidden="true" [innerHTML]="'&#128276;'"></span>
          </span>

          <div class="notify-panel" *ngIf="notificationsOpen">
            <div class="notify-head">
              <span>Notifications</span>
              <button class="link-btn" type="button" (click)="markAllSeen()">Tout vu</button>
            </div>

            <div class="notify-list" *ngIf="notifications.length > 0; else emptyState">
              <button
                class="notify-item"
                type="button"
                *ngFor="let item of notifications; trackBy: trackByNotification"
                (click)="openNotification(item)"
              >
                <div class="notify-avatar">{{ avatarInitial(item.customerName) }}</div>
                <div class="notify-text">
                  <div class="notify-title">Commande de {{ item.customerName }}</div>
                  <div class="notify-meta">{{ item.reference }} · {{ timeAgo(item.placedAt) }}</div>
                </div>
                <span class="notify-dot" *ngIf="!item.seen"></span>
              </button>
            </div>

            <ng-template #emptyState>
              <div class="notify-empty">Aucune notification</div>
            </ng-template>
          </div>
        </div>

        <div
          class="user"
          role="button"
          tabindex="0"
          (click)="openProfile()"
          (keydown.enter)="openProfile()"
        >
          <img class="avatar" [src]="headerAvatar() || 'assets/logo.png'" alt="Logo boutique" />
          <div class="meta">
            <div class="name">{{ user.pseudo }}</div>
            <div class="role">{{ user.role }}</div>
          </div>
        </div>

        <button class="icon-btn danger" type="button" (click)="auth.logout().subscribe()" aria-label="Se deconnecter">
          <span aria-hidden="true">&#9099;</span>
        </button>
      </div>
    </header>

    <ng-container *ngIf="profileOpen">
      <div class="profile-backdrop" (click)="closeProfile()"></div>
      <div class="profile-modal" role="dialog" aria-modal="true">
        <div class="profile-header">
          <div>
            <div class="profile-title">Profil boutique</div>
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
  styleUrls: ['boutique-header.component.css']
})
export class BoutiqueHeaderComponent {
  store = inject(AuthStore);
  auth = inject(AuthService);
  layout = inject(LayoutService);
  theme = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private realtime = inject(RealtimeService);
  private router = inject(Router);

  profileOpen = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  avatarName = '';
  avatarFile: File | null = null;
  avatarPreview = '';
  notificationsOpen = false;
  notifications: Array<{
    id: string;
    orderId: string;
    reference: string;
    customerName: string;
    placedAt: string;
    seen: boolean;
  }> = [];
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

  readonly boutiqueLogo = computed(() => {
    const userLogo = this.store.user()?.avatar;
    if (userLogo) return userLogo;

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('ti.boutique.logo');
      if (saved) return saved;
    }

    return 'assets/logo.png';
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.restoreNotifications();
    const cleanup = this.realtime.onEvent('notification:order', (payload) => {
      this.onOrderNotification(payload as any);
    });
    this.destroyRef.onDestroy(cleanup);
  }

  onMobileMenuClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.layout.toggleMobileSidebar();
  }

  onDesktopMenuClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.layout.toggleCollapse();
  }

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

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllSeen(): void {
    if (this.notifications.length === 0) return;
    this.notifications = this.notifications.map((item) => ({ ...item, seen: true }));
    this.persistNotifications();
  }

  openNotification(item: { id: string; orderId: string }) {
    this.notifications = this.notifications.map((n) =>
      n.id === item.id ? { ...n, seen: true } : n
    );
    this.persistNotifications();
    this.notificationsOpen = false;
    this.router.navigate(['/boutique/orders'], { queryParams: { orderId: item.orderId } });
  }

  trackByNotification(_index: number, item: { id: string }) {
    return item.id;
  }

  headerAvatar(): string {
    if (this.avatarPreview) return this.avatarPreview;
    const userAvatar = this.resolveAvatarUrl(this.store.user()?.avatar);
    if (userAvatar) return userAvatar;
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('ti.boutique.logo');
      if (saved) return saved;
    }
    return '';
  }

  unreadCount(): number {
    return this.notifications.filter((n) => !n.seen).length;
  }

  avatarInitial(name: string): string {
    const value = String(name || '').trim();
    return value ? value.charAt(0).toUpperCase() : '?';
  }

  timeAgo(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Maintenant';
    const diff = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Maintenant';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} j`;
  }

  private onOrderNotification(payload: {
    id?: string;
    orderId?: string;
    reference?: string;
    customerName?: string;
    placedAt?: string;
  }) {
    const orderId = String(payload?.orderId || '').trim();
    if (!orderId) return;
    const id = String(payload?.id || orderId);
    if (this.notifications.some((n) => n.id === id)) return;

    const item = {
      id,
      orderId,
      reference: String(payload?.reference || 'Commande'),
      customerName: String(payload?.customerName || 'Client'),
      placedAt: String(payload?.placedAt || new Date().toISOString()),
      seen: false
    };

    this.notifications = [item, ...this.notifications].slice(0, 30);
    this.persistNotifications();
    this.playNotificationSound();
  }

  private restoreNotifications(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem('boutique.notifications');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.notifications = parsed
          .filter((item) => item && item.orderId && item.id)
          .slice(0, 30)
          .map((item) => ({
            id: String(item.id),
            orderId: String(item.orderId),
            reference: String(item.reference || 'Commande'),
            customerName: String(item.customerName || 'Client'),
            placedAt: String(item.placedAt || new Date().toISOString()),
            seen: Boolean(item.seen)
          }));
      }
    } catch {
      // ignore storage errors
    }
  }

  private persistNotifications(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('boutique.notifications', JSON.stringify(this.notifications));
  }

  private playNotificationSound(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.18);
      oscillator.onended = () => {
        ctx.close().catch(() => {});
      };
    } catch {
      // ignore audio errors
    }
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
