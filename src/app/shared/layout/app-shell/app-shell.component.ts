import { Component, HostListener, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { LayoutService } from '../../../core/services/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent,CommonModule],
  template: `
    <div class="shell">
      <app-header />

      <div class="body">
        <app-sidebar />

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
  styleUrls: ['./app-shell.component.css']
})
export class AppShellComponent {
  constructor(public layout: LayoutService) {}

  @HostListener('window:keydown.escape')
  onEsc() {
    this.layout.closeMobileSidebar();
  }
}
