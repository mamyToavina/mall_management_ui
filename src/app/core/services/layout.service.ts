import { Injectable, computed, signal } from '@angular/core';

export interface CurrentUser {
  name: string;
  role: string;
  avatarUrl: string;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  // Desktop: sidebar visible + collapsable (icon-only)
  readonly isSidebarCollapsed = signal(false);

  // Mobile: drawer open/close
  readonly isMobileSidebarOpen = signal(false);

  // User (mock, remplacé plus tard par vrai auth state)
  readonly user = signal<CurrentUser>({
    name: 'Irchad',
    role: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/96?img=3'
  });

  // Optionnel: on peut centraliser la logique "fermer mobile drawer"
  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  toggleCollapse(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  readonly sidebarWidth = computed(() =>
    this.isSidebarCollapsed() ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)'
  );
}
