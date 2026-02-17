import { Component } from '@angular/core';
import { LayoutService } from '../../../core/services/layout.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="left">
        <button class="icon-btn mobile-only" type="button"
          (click)="layout.toggleMobileSidebar()"
          aria-label="Ouvrir le menu">
          ☰
        </button>

        <button class="icon-btn desktop-only" type="button"
          (click)="layout.toggleCollapse()"
          aria-label="Réduire/étendre la barre latérale">
          ☰
        </button>

        <a class="brand" href="/" aria-label="Accueil">
          <span class="logo" aria-hidden="true">A</span>
          <span class="brand-text">AngularApp</span>
        </a>
      </div>

      <div class="right">
        <button class="icon-btn" type="button" (click)="theme.toggle()"
          [attr.aria-label]="theme.mode() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'">
          <span aria-hidden="true">{{ theme.mode() === 'dark' ? '☀' : '🌙' }}</span>
        </button>

        <div class="user">
          <img class="avatar" [src]="layout.user().avatarUrl" alt="Photo de profil" />
          <div class="meta">
            <div class="name">{{ layout.user().name }}</div>
            <div class="role">{{ layout.user().role }}</div>
          </div>
        </div>

        <button class="icon-btn danger" type="button" (click)="auth.logout()"
          aria-label="Se déconnecter">
          ⎋
        </button>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(
    public layout: LayoutService,
    public theme: ThemeService,
    public auth: AuthService
  ) {}
}
