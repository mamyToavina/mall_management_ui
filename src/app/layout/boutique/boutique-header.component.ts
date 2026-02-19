import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-boutique-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="left">
        <button
          class="icon-btn mobile-only"
          type="button"
          (click)="layout.toggleMobileSidebar()"
          aria-label="Ouvrir le menu"
        >
          Menu
        </button>

        <button
          class="icon-btn desktop-only"
          type="button"
          (click)="layout.toggleCollapse()"
          aria-label="Reduire/etendre la barre laterale"
        >
          Menu
        </button>

        <a class="brand" routerLink="/boutique/home" aria-label="Accueil boutique">
          <span class="logo" aria-hidden="true">TI</span>
          <span class="brand-text">TI Boutique</span>
        </a>
      </div>

      <div class="right" *ngIf="store.user() as user">
        <button
          class="icon-btn notify"
          type="button"
          aria-label="Notifications"
        >
          <span aria-hidden="true">Notif</span>
          <span class="badge" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
        </button>

        <button
          class="icon-btn"
          type="button"
          (click)="theme.toggle()"
          [attr.aria-label]="theme.mode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
        >
          <span aria-hidden="true">{{ theme.mode() === 'dark' ? 'Light' : 'Dark' }}</span>
        </button>

        <div class="user">
          <img class="avatar" [src]="boutiqueLogo()" alt="Logo boutique" />
          <div class="meta">
            <div class="name">{{ user.pseudo }}</div>
            <div class="role">{{ user.role }}</div>
          </div>
        </div>

        <button
          class="icon-btn danger"
          type="button"
          (click)="auth.logout()"
          aria-label="Se deconnecter"
        >
          Out
        </button>
      </div>
    </header>
  `,
  styleUrls: ['boutique-header.component.css']
})
export class BoutiqueHeaderComponent {
  store = inject(AuthStore);
  auth = inject(AuthService);
  layout = inject(LayoutService);
  theme = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  readonly unreadCount = signal(5);

  readonly boutiqueLogo = computed(() => {
    const userLogo = this.store.user()?.avatar;
    if (userLogo) return userLogo;

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('ti.boutique.logo');
      if (saved) return saved;
    }

    return 'assets/logo.png';
  });
}
