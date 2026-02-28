import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';
import { RealtimeService } from '../../core/realtime/realtime.service';
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
  private readonly auth = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentRef = inject(DOCUMENT);
  private lastRefreshAt = 0;
  private creditListenerCleanup: (() => void) | null = null;

  constructor() {
    this.creditListenerCleanup = this.realtime.onEvent<{ credit?: number }>('credit:updated', (payload) => {
      if (payload && typeof payload.credit === 'number') {
        this.authStore.updateUser({ credit: payload.credit });
      } else {
        this.refreshIfVisible();
      }
    });
    this.destroyRef.onDestroy(() => {
      this.creditListenerCleanup?.();
      this.creditListenerCleanup = null;
    });
  }

  @HostListener('window:keydown.escape')
  onEsc() {
    this.layout.closeMobileSidebar();
  }

  @HostListener('window:focus')
  onFocus() {
    this.refreshIfVisible();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    this.refreshIfVisible();
  }

  private refreshIfVisible() {
    const now = Date.now();
    if (now - this.lastRefreshAt < 15000) return;
    const visibility = this.documentRef?.visibilityState;
    if (visibility && visibility !== 'visible') return;
    this.lastRefreshAt = now;

    this.auth
      .getMyProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res?.user) this.authStore.updateUser(res.user);
        }
      });
  }
}
