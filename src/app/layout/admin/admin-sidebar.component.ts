import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ADMIN_NAVIGATION } from './admin-navigation.config';
import { LayoutService } from '../../core/services/layout.service';

type NavItem = {
  label: string;
  icon?: string;
  route?: string;
  exact?: boolean;
  children?: { label: string; icon?: string; route: string }[];
};

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Desktop sidebar -->
    <aside class="sidebar desktop"
          [class.collapsed]="layout.isSidebarCollapsed()"
          [style.width]="layout.sidebarWidth()">

      <nav class="nav" aria-label="Navigation principale">
        <ng-container *ngFor="let item of nav">

          <!-- Simple item -->
          <a *ngIf="!item.children?.length"
             class="nav-item"
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
             (click)="layout.closeMobileSidebar()"
             [title]="item.label">
            <span class="icon" aria-hidden="true">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </a>

          <!-- Group item (accordion) -->
          <div *ngIf="item.children?.length"
               class="nav-group"
               [class.open]="isOpen(item)">

            <button
              type="button"
              class="nav-item nav-toggle"
              (click)="toggle(item)"
              [attr.aria-expanded]="isOpen(item)"
              [attr.aria-controls]="submenuId(item)"
              [title]="item.label"
            >
              <span class="icon" aria-hidden="true">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
              <span class="chevron" aria-hidden="true"></span>
            </button>

            <div class="subnav"
                 [id]="submenuId(item)"
                 [class.open]="isOpen(item)">

              <a *ngFor="let child of item.children"
                 class="sub-item"
                 [routerLink]="child.route"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }"
                 (click)="layout.closeMobileSidebar()"
                 [title]="child.label">
                <span class="sub-icon" aria-hidden="true">{{ child.icon || '\\u2022' }}</span>
                <span class="sub-label">{{ child.label }}</span>
              </a>

            </div>
          </div>

        </ng-container>
      </nav>
    </aside>

    <!-- Mobile drawer -->
    <aside class="sidebar mobile"
          [class.open]="layout.isMobileSidebarOpen()"
          aria-label="Menu mobile">

      <div class="mobile-inner">
        <div class="mobile-title">Menu</div>

        <nav class="nav" aria-label="Navigation mobile">
          <ng-container *ngFor="let item of nav">

            <a *ngIf="!item.children?.length"
               class="nav-item"
               [routerLink]="item.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
               (click)="layout.closeMobileSidebar()">
              <span class="icon" aria-hidden="true">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
            </a>

            <div *ngIf="item.children?.length"
                 class="nav-group"
                 [class.open]="isOpen(item)">

              <button
                type="button"
                class="nav-item nav-toggle"
                (click)="toggle(item)"
                [attr.aria-expanded]="isOpen(item)"
                [attr.aria-controls]="submenuId(item) + '-mobile'"
              >
                <span class="icon" aria-hidden="true">{{ item.icon }}</span>
                <span class="label">{{ item.label }}</span>
                <span class="chevron" aria-hidden="true"></span>
              </button>

              <div class="subnav"
                   [id]="submenuId(item) + '-mobile'"
                   [class.open]="isOpen(item)">

                <a *ngFor="let child of item.children"
                   class="sub-item"
                   [routerLink]="child.route"
                   routerLinkActive="active"
                   [routerLinkActiveOptions]="{ exact: true }"
                   (click)="layout.closeMobileSidebar()">
                  <span class="sub-icon" aria-hidden="true">{{ child.icon || '\\u2022' }}</span>
                  <span class="sub-label">{{ child.label }}</span>
                </a>

              </div>
            </div>

          </ng-container>
        </nav>
      </div>
    </aside>
  `,
  styleUrls: ['admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  public layout = inject(LayoutService);
  private router = inject(Router);

  nav: NavItem[] = ADMIN_NAVIGATION as NavItem[];

  // on stocke les menus ouverts par label
  private openMenus = signal(new Set<string>());

  // âœ… ouvre automatiquement le menu si l'url correspond Ã  une route enfant
  constructor() {
    this.syncOpenMenusWithUrl();
  }

  toggle(item: NavItem) {
    const label = item.label;
    const next = new Set(this.openMenus());

    if (next.has(label)) {
      next.delete(label);
    } else {
      // In collapsed desktop mode, keep only one flyout open for readability.
      if (this.layout.isSidebarCollapsed()) {
        next.clear();
      }
      next.add(label);
    }

    this.openMenus.set(next);
  }

  isOpen(item: NavItem) {
    // In collapsed mode, route-driven auto-open is disabled to avoid persistent flyouts.
    if (this.layout.isSidebarCollapsed()) {
      return this.openMenus().has(item.label);
    }

    // In expanded mode, keep section open when current route belongs to it.
    return this.openMenus().has(item.label) || this.isRouteInside(item);
  }

  private isRouteInside(item: NavItem) {
    if (!item.children?.length) return false;
    const url = this.router.url;
    return item.children.some(c => url.startsWith(c.route));
  }

  private syncOpenMenusWithUrl() {
    const next = new Set<string>();
    const url = this.router.url;

    for (const item of this.nav) {
      if (item.children?.some(c => url.startsWith(c.route))) {
        next.add(item.label);
      }
    }
    this.openMenus.set(next);
  }

  submenuId(item: NavItem) {
    return `submenu-${this.slug(item.label)}`;
  }

  private slug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
}

