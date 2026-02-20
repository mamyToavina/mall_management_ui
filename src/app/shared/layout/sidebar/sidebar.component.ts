import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Desktop sidebar -->
    <aside class="sidebar desktop"
          [class.collapsed]="layout.isSidebarCollapsed()"
          [style.width]="layout.sidebarWidth()">

      <nav class="nav" aria-label="Navigation principale">

        <!-- Gestion acheteur -->
        <a class="nav-item"
           routerLink="/buyers"
           routerLinkActive="active"
           (click)="layout.closeMobileSidebar()"
           title="Gestion acheteur">
          <span class="icon" aria-hidden="true">👤</span>
          <span class="label">Gestion acheteur</span>
        </a>

        <!-- Gestion credit -->
        <a class="nav-item"
          routerLink="/credits"
          routerLinkActive="active"
          (click)="layout.closeMobileSidebar()"
          title="Gestion credits">
          <span class="icon" aria-hidden="true">💳</span>
          <span class="label">Gestion credits</span>
        </a>


        <!-- Gestion boxes (accordion) -->
        <div class="nav-group" [class.open]="boxesOpen()">
          <button
            type="button"
            class="nav-item nav-toggle"
            (click)="toggleBoxes()"
            [attr.aria-expanded]="boxesOpen()"
            aria-controls="boxes-submenu"
            title="Gestion boxes"
          >
            <span class="icon" aria-hidden="true">📦</span>
            <span class="label">Gestion boxes</span>

            <span class="chevron" aria-hidden="true"></span>
          </button>

          <div class="subnav" id="boxes-submenu" [class.open]="boxesOpen()">
            <a class="sub-item"
               routerLink="/boxes"
               routerLinkActive="active"
               (click)="layout.closeMobileSidebar()"
               title="Liste">
              <span class="sub-icon" aria-hidden="true">≡</span>
              <span class="sub-label">Liste</span>
            </a>

            <a class="sub-item"
               routerLink="/boxes/new"
               routerLinkActive="active"
               (click)="layout.closeMobileSidebar()"
               title="Créer une box">
              <span class="sub-icon" aria-hidden="true">＋</span>
              <span class="sub-label">Créer</span>
            </a>
          </div>
        </div>

      </nav>
    </aside>

    <!-- Mobile drawer -->
    <aside class="sidebar mobile"
          [class.open]="layout.isMobileSidebarOpen()"
          aria-label="Menu mobile">

      <div class="mobile-inner">
        <div class="mobile-title">Menu</div>

        <nav class="nav" aria-label="Navigation mobile">

          <a class="nav-item"
             routerLink="/buyers"
             routerLinkActive="active"
             (click)="layout.closeMobileSidebar()">
            <span class="icon" aria-hidden="true">👤</span>
            <span class="label">Gestion acheteur</span>
          </a>

          <div class="nav-group" [class.open]="boxesOpen()">
            <button
              type="button"
              class="nav-item nav-toggle"
              (click)="toggleBoxes()"
              [attr.aria-expanded]="boxesOpen()"
              aria-controls="boxes-submenu-mobile"
            >
              <span class="icon" aria-hidden="true">📦</span>
              <span class="label">Gestion boxes</span>
              <span class="chevron" aria-hidden="true"></span>
            </button>

            <div class="subnav" id="boxes-submenu-mobile" [class.open]="boxesOpen()">
              <a class="sub-item"
                 routerLink="/boxes"
                 routerLinkActive="active"
                 (click)="layout.closeMobileSidebar()">
                <span class="sub-icon" aria-hidden="true">≡</span>
                <span class="sub-label">Liste</span>
              </a>

              <a class="sub-item"
                 routerLink="/boxes/new"
                 routerLinkActive="active"
                 (click)="layout.closeMobileSidebar()">
                <span class="sub-icon" aria-hidden="true">＋</span>
                <span class="sub-label">Créer</span>
              </a>
            </div>
          </div>

        </nav>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  public layout = inject(LayoutService);
  private router = inject(Router);

  readonly boxesOpen = signal(this.router.url.startsWith('/boxes'));

  toggleBoxes(): void {
    this.boxesOpen.update(v => !v);
  }
}
