import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);

  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  login() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du login:', err);
        this.error.set('Email ou mot de passe incorrect');
        this.loading.set(false);
      }
    });
  }
}
