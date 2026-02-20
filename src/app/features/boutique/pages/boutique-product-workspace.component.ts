import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-boutique-product-workspace-page',
  standalone: true,
  template: `
    <section class="page-card">
      <h1>{{ title }}</h1>
      <p class="sub">{{ description }}</p>

      <div class="hint">
        Cette page est prete pour brancher les appels API /api/products correspondants.
      </div>
    </section>
  `,
  styles: `
    .page-card {
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

    .hint {
      border-radius: 12px;
      border: 1px dashed color-mix(in oklab, var(--border) 72%, transparent);
      background: color-mix(in oklab, var(--surface) 92%, var(--surface-soft) 8%);
      padding: 12px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
    }
  `
})
export class BoutiqueProductWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title =
    (this.route.snapshot.data['title'] as string | undefined) ?? 'Gestion Produits';

  readonly description =
    (this.route.snapshot.data['description'] as string | undefined) ??
    'Structure de page pour les fonctionnalites produit.';
}
