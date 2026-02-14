import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  logout(): void {
    // Ici: clear tokens, reset store, etc.
    // localStorage.removeItem('token');
    this.router.navigateByUrl('/login').catch(() => {});
  }
}
