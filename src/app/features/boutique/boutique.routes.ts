import { Routes } from '@angular/router';
import { BoutiqueHomePageComponent } from './pages/boutique-home.component';
import { BoutiqueProductWorkspaceComponent } from './pages/boutique-product-workspace.component';
import { ProductCatalogPageComponent } from './pages/product-catalog-page.component';
import { ProductCreatePageComponent } from './pages/product-create-page.component';
import { ProductStockMovementsPageComponent } from './pages/product-stock-movements-page.component';

export const BOUTIQUE_ROUTES: Routes = [
  { path: 'home', component: BoutiqueHomePageComponent },
  {
    path: 'products',
    component: ProductCatalogPageComponent
  },
  {
    path: 'products/new',
    component: ProductCreatePageComponent
  },
  {
    path: 'products/low-stock',
    component: BoutiqueProductWorkspaceComponent,
    data: {
      title: 'Stock Faible',
      description: 'Surveiller les produits sous seuil avec le filtre lowStock=true.'
    }
  },
  {
    path: 'products/stock-movements',
    component: ProductStockMovementsPageComponent
  },
  {
    path: 'products/promotions',
    component: BoutiqueProductWorkspaceComponent,
    data: {
      title: 'Promotions Produits',
      description: 'Configurer, activer et retirer les promotions des produits.'
    }
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
