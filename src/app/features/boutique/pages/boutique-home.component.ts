import { Component } from '@angular/core';

@Component({
  selector: 'app-boutique-home-page',
  standalone: true,
  template: `
    <section class="home-card">
      <h1>Accueil Boutique</h1>
      <p class="sub">Bienvenue dans votre espace de gestion TI Boutique.</p>

      <div class="hero">
        <div class="hero-title">Tableau de bord boutique</div>
        <div class="hero-text">
          Cette page est reservee a l administration du compte boutique pour les clients TI commercial.
        </div>
      </div>
    </section>
  `,
  styles: `
    .home-card {
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) + 4px);
      background: var(--surface);
      box-shadow: var(--shadow);
      padding: 20px;
      display: grid;
      gap: 12px;
      min-height: 240px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: -.02em;
    }

    .sub {
      margin: 0;
      color: var(--muted);
      font-weight: 600;
    }

    .hero {
      border-radius: 14px;
      border: 1px dashed color-mix(in oklab, var(--border) 72%, transparent);
      background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
      padding: 14px;
      display: grid;
      gap: 8px;
    }

    .hero-title {
      font-weight: 900;
      color: var(--text);
    }

    .hero-text {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }
  `
})
export class BoutiqueHomePageComponent {}
