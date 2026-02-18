import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-header',
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
          ☰
        </button>

        <button
          class="icon-btn desktop-only"
          type="button"
          (click)="layout.toggleCollapse()"
          aria-label="Réduire/étendre la barre latérale"
        >
          ☰
        </button>

        <a class="brand" routerLink="/" aria-label="Accueil">
          <span class="logo" aria-hidden="true">A</span>
          <span class="brand-text">Admin Panel</span>
        </a>
      </div>

      <div class="right" *ngIf="store.user() as user">
        <button
          class="icon-btn"
          type="button"
          (click)="theme.toggle()"
          [attr.aria-label]="theme.mode() === 'dark'
            ? 'Passer en mode clair'
            : 'Passer en mode sombre'"
        >
          <span aria-hidden="true">{{ theme.mode() === 'dark' ? '☀' : '🌙' }}</span>
        </button>

        <div class="user">
          <img
            class="avatar"
            [src]="user.avatar || 'assets/default-avatar.png'"
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
          (click)="auth.logout()"
          aria-label="Se déconnecter"
        >
          ⎋
        </button>
      </div>
    </header>
  `,
  styleUrls: ['admin-header.component.css'],
})
export class AdminHeaderComponent {
  store = inject(AuthStore);
  auth = inject(AuthService);
  layout = inject(LayoutService);
  theme = inject(ThemeService);
}
