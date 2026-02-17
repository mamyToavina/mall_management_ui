import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
      <nav class="nav">
        <a class="nav-item"
           routerLink="/buyers"
           routerLinkActive="active"
           (click)="layout.closeMobileSidebar()">
          <span class="icon" aria-hidden="true">👥</span>
          <span class="label">Gestion acheteur</span>
        </a>
      </nav>
    </aside>

    <!-- Mobile drawer -->
    <aside class="sidebar mobile"
          [class.open]="layout.isMobileSidebarOpen()"
          aria-label="Menu mobile">
      <div class="mobile-inner">
        <div class="mobile-title">Menu</div>
        <nav class="nav">
          <a class="nav-item"
             routerLink="/buyers"
             routerLinkActive="active"
             (click)="layout.closeMobileSidebar()">
            <span class="icon" aria-hidden="true">👥</span>
            <span class="label">Gestion acheteur</span>
          </a>
        </nav>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(public layout: LayoutService) {}
}
