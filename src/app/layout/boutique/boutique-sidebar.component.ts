import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { LayoutService } from '../../core/services/layout.service';
import { BOUTIQUE_NAVIGATION, BoutiqueNavItem } from './boutique-navigation.config';

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
      <nav class="nav" aria-label="Navigation boutique">
        <ng-container *ngFor="let item of nav">
          <a
            *ngIf="!item.children?.length"
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

          <div *ngIf="item.children?.length" class="nav-group" [class.open]="isOpen(item)">
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

            <div class="subnav" [id]="submenuId(item)" [class.open]="isOpen(item)">
              <a
                *ngFor="let child of item.children"
                class="sub-item"
                [routerLink]="child.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: child.exact ?? true }"
                (click)="layout.closeMobileSidebar()"
                [title]="child.label"
              >
                <span class="sub-icon" aria-hidden="true">{{ child.icon || '\u2022' }}</span>
                <span class="sub-label">{{ child.label }}</span>
              </a>
            </div>
          </div>
        </ng-container>
      </nav>
    </aside>

    <aside class="sidebar mobile" [class.open]="layout.isMobileSidebarOpen()" aria-label="Menu mobile boutique">
      <div class="mobile-inner">
        <div class="mobile-title">Menu Boutique</div>

        <nav class="nav" aria-label="Navigation mobile boutique">
          <ng-container *ngFor="let item of nav">
            <a
              *ngIf="!item.children?.length"
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? true }"
              (click)="layout.closeMobileSidebar()"
            >
              <span class="icon" aria-hidden="true">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
            </a>

            <div *ngIf="item.children?.length" class="nav-group" [class.open]="isOpen(item)">
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

              <div class="subnav" [id]="submenuId(item) + '-mobile'" [class.open]="isOpen(item)">
                <a
                  *ngFor="let child of item.children"
                  class="sub-item"
                  [routerLink]="child.route"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: child.exact ?? true }"
                  (click)="layout.closeMobileSidebar()"
                >
                  <span class="sub-icon" aria-hidden="true">{{ child.icon || '\u2022' }}</span>
                  <span class="sub-label">{{ child.label }}</span>
                </a>
              </div>
            </div>
          </ng-container>
        </nav>
      </div>
    </aside>
  `,
  styleUrls: ['boutique-sidebar.component.css']
})
export class BoutiqueSidebarComponent {
  public layout = inject(LayoutService);
  private router = inject(Router);

  nav: BoutiqueNavItem[] = BOUTIQUE_NAVIGATION;

  private openMenus = signal(new Set<string>());

  constructor() {
    this.syncOpenMenusWithUrl();
  }

  toggle(item: BoutiqueNavItem) {
    const label = item.label;
    const next = new Set(this.openMenus());

    if (next.has(label)) {
      next.delete(label);
    } else {
      if (this.layout.isSidebarCollapsed()) {
        next.clear();
      }
      next.add(label);
    }

    this.openMenus.set(next);
  }

  isOpen(item: BoutiqueNavItem) {
    if (this.layout.isSidebarCollapsed()) {
      return this.openMenus().has(item.label);
    }

    return this.openMenus().has(item.label) || this.isRouteInside(item);
  }

  submenuId(item: BoutiqueNavItem) {
    return `submenu-${this.slug(item.label)}`;
  }

  private isRouteInside(item: BoutiqueNavItem) {
    if (!item.children?.length) return false;
    const url = this.router.url;
    return item.children.some((child) => (child.route ? url.startsWith(child.route) : false));
  }

  private syncOpenMenusWithUrl() {
    const next = new Set<string>();
    const url = this.router.url;

    for (const item of this.nav) {
      if (item.children?.some((child) => (child.route ? url.startsWith(child.route) : false))) {
        next.add(item.label);
      }
    }

    this.openMenus.set(next);
  }

  private slug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
