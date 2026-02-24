import { Routes } from '@angular/router';
import { BoutiqueHomePageComponent } from './pages/boutique-home.component';
import { ProductCatalogPageComponent } from './pages/product-catalog-page.component';
import { ProductCreatePageComponent } from './pages/product-create-page.component';
import { ProductLowStockPageComponent } from './pages/product-low-stock-page.component';
import { ProductPromotionsPageComponent } from './pages/product-promotions-page.component';
import { ProductStockMovementsPageComponent } from './pages/product-stock-movements-page.component';
import { BoutiqueBillingPageComponent } from './pages/boutique-billing-page.component';

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
    component: ProductLowStockPageComponent
  },
  {
    path: 'products/stock-movements',
    component: ProductStockMovementsPageComponent
  },
  {
    path: 'products/promotions',
    component: ProductPromotionsPageComponent
  },
  {
    path: 'billing',
    component: BoutiqueBillingPageComponent
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
