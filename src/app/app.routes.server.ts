/*import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];*/

/*import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ✅ Back-office / buyers : PAS de SSR / PAS de prerender
  { path: 'buyers', renderMode: RenderMode.Client },
  { path: 'buyers/**', renderMode: RenderMode.Client },

  // ✅ le reste (e-commerce, etc.)
  // Mets Server (SSR) plutôt que Prerender pour éviter les soucis en dev
  { path: '**', renderMode: RenderMode.Server },
];*/

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ✅ La page Buyers est sur la racine '/'
  { path: '', renderMode: RenderMode.Client },

  // ✅ le reste SSR (si tu veux)
  { path: '**', renderMode: RenderMode.Server },
];


