import { Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/environment';
import { AuthStore } from '../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authStore = inject(AuthStore);
  private socket: Socket | null = null;
  private lastToken: string | null = null;

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const token = this.authStore.accessToken();
      if (token) {
        this.ensureConnected(token);
      } else {
        this.disconnect();
      }
    });
  }

  onEvent<T>(event: string, handler: (payload: T) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on(event, handler);
    return () => this.socket?.off(event, handler);
  }

  private ensureConnected(token: string) {
    if (this.socket && this.lastToken === token) return;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const baseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true
    });
    this.lastToken = token;
  }

  private disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.lastToken = null;
  }
}
