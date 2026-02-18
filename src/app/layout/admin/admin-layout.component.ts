import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer.component';
import { AdminHeaderComponent } from './admin-header.component';
import { LayoutService } from '../../core/services/layout.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AdminHeaderComponent,
    AdminSidebarComponent,
    CommonModule,
    FooterComponent,
    
  ],
  template: `
    <div class="shell">
      <app-admin-header />

      <div class="body">
        <app-admin-sidebar />

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
  styleUrls: ['admin-layout.component.css']
})
export class AdminLayoutComponent {

    constructor(public layout: LayoutService) {}

    @HostListener('window:keydown.escape')

    onEsc() {
        this.layout.closeMobileSidebar();
    }
}
