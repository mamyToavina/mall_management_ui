import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LayoutService } from '../../core/services/layout.service';
import { BOUTIQUE_NAVIGATION } from './boutique-navigation.config';

@Component({
  selector: 'app-boutique-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="sidebar desktop"
      [class.collapsed]="layout.isSidebarCollapsed()"
      [style.width]="layout.sidebarWidth()"
    >
      <div class="sidebar-title">Espace Boutique</div>
      <div class="sidebar-subtitle">Gestion compte boutique TI</div>

      <nav class="nav" aria-label="Navigation boutique">
        <a
          *ngFor="let item of nav"
          class="nav-item"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
          (click)="layout.closeMobileSidebar()"
          [title]="item.label"
        >
          <span class="icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </a>
      </nav>
    </aside>

    <aside class="sidebar mobile" [class.open]="layout.isMobileSidebarOpen()" aria-label="Menu mobile boutique">
      <div class="mobile-inner">
        <div class="mobile-title">Menu Boutique</div>

        <nav class="nav" aria-label="Navigation mobile boutique">
          <a
            *ngFor="let item of nav"
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
            (click)="layout.closeMobileSidebar()"
          >
            <span class="icon" aria-hidden="true">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </a>
        </nav>
      </div>
    </aside>
  `,
  styleUrls: ['boutique-sidebar.component.css']
})
export class BoutiqueSidebarComponent {
  layout = inject(LayoutService);
  nav = BOUTIQUE_NAVIGATION;
}
