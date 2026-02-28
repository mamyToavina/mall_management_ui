import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'app.theme';
  private readonly isBrowser: boolean;

  readonly mode = signal<ThemeMode>('dark');

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    const initial = this.isBrowser ? this.readInitialModeBrowser() : 'dark';
    this.mode.set(initial);

    if (this.isBrowser) this.applyTheme(initial);
  }

  toggle(): void {
    const next: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.set(next);
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);

    if (!this.isBrowser) return;

    localStorage.setItem(this.STORAGE_KEY, mode);
    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeMode) {
    if (!this.isBrowser) return;
    document.documentElement.setAttribute('data-theme', mode);
  }

  private readInitialModeBrowser(): ThemeMode {
    const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }
}

