import { Component, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css']
})

export class LoginComponent {

  private authService = inject(AuthService);
  private store = inject(AuthStore);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  login() {
    /*this.loading.set(true);
    this.error.set(null);

      this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (res : any) => {
          this.loading.set(false);
          this.store.setSession(res.user, res.accessToken);
          this.router.navigate(['/admin']);
        },
        error: () => {
          this.error.set('Email ou mot de passe incorrect');
          this.loading.set(false);
        }
      });*/
      console.log('Tentative de login avec andrana aloha hatreto');

      this.loading.set(true);
this.error.set(null);

console.log('Tentative de login avec:', { email: this.email, password: this.password });

this.authService.login({ email: this.email, password: this.password })
  .subscribe({
    next: (res: any) => {
      console.log('Réponse du backend:', res);

      this.loading.set(false);
      this.store.setSession(res.user, res.accessToken);

      console.log('Utilisateur stocké dans le store:', this.store.user());
      console.log('Redirection vers /admin');

      this.router.navigate(['/admin']);
    },
    error: (err) => {
      console.error('Erreur lors du login:', err);

      this.error.set('Email ou mot de passe incorrect');
      this.loading.set(false);
    }
  });

  }
}



/*console.log('Tentative de login avec andrana aloha hatreto');

      this.loading.set(true);
this.error.set(null);

console.log('Tentative de login avec:', { email: this.email, password: this.password });

this.authService.login({ email: this.email, password: this.password })
  .subscribe({
    next: (res: any) => {
      console.log('Réponse du backend:', res);

      this.loading.set(false);
      this.store.setSession(res.user, res.accessToken);

      console.log('Utilisateur stocké dans le store:', this.store.user());
      console.log('Redirection vers /admin');

      this.router.navigate(['/admin']);
    },
    error: (err) => {
      console.error('Erreur lors du login:', err);

      this.error.set('Email ou mot de passe incorrect');
      this.loading.set(false);
    }
  });*/