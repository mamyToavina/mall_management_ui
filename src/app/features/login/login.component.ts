import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService, type Role } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);

  error = signal<string | null>(null);
  loadingRole = signal<string | null>(null);

  readonly presets = [
    {
      id: 'buyer',
      title: 'Login acheteur (test)',
      email: 'toavina_acheteur@gmail.com',
      password: 'toavina_acheteur',
      pseudo: 'Acheteur Test',
      firstName: 'Toavina',
      lastName: 'Acheteur',
      gender: 'Male'
    },
    {
      id: 'boutique',
      title: 'Login boutique (test)',
      email: 'boutique@gmail.com',
      password: 'mdp@boutique.com',
      pseudo: 'Boutique Demo',
      firstName: 'Manager',
      lastName: 'Boutique',
      gender: 'Female'
    },
    {
      id: 'admin',
      title: 'Login admin (test)',
      email: 'admin@gmail.com',
      password: 'mdp@admin.com',
      pseudo: 'Admin Demo',
      firstName: 'Admin',
      lastName: 'Principal',
      gender: 'Other'
    }
  ];

  loginAs(presetId: string) {
    const preset = this.presets.find((item) => item.id === presetId);
    if (!preset) return;

    this.loadingRole.set(presetId);
    this.error.set(null);

    this.authService.login({ email: preset.email, password: preset.password }, { redirect: false }).subscribe({
      next: (res) => {
        const role = (res?.user?.role ?? 'USER') as Role;
        this.authService.redirectByRole(role);
        this.loadingRole.set(null);
      },
      error: (err) => {
        console.error('Erreur lors du login:', err);
        const backendMessage =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : null);
        this.error.set(backendMessage || 'Email ou mot de passe incorrect');
        this.loadingRole.set(null);
      }
    });
  }

}
