import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LayoutService } from '../../core/services/layout.service';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { BoutiqueHeaderComponent } from './boutique-header.component';
import { BoutiqueSidebarComponent } from './boutique-sidebar.component';

@Component({
  selector: 'app-boutique-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BoutiqueHeaderComponent,
    BoutiqueSidebarComponent,
    FooterComponent
  ],
  template: `
    <div class="shell">
      <app-boutique-header />

      <div class="body">
        <app-boutique-sidebar />

        <main class="content" (click)="layout.closeMobileSidebar()">
          <div class="content-inner">
            <router-outlet />
          </div>
          <app-footer />
        </main>
      </div>

      <div
        class="backdrop"
        *ngIf="layout.isMobileSidebarOpen()"
        (click)="layout.closeMobileSidebar()"
        aria-hidden="true"
      ></div>
    </div>
  `,
  styleUrls: ['../admin/admin-layout.component.css']
})
export class BoutiqueLayoutComponent {
  layout = inject(LayoutService);

  @HostListener('window:keydown.escape')
  onEsc() {
    this.layout.closeMobileSidebar();
  }
}
