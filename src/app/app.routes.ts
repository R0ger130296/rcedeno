import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { AddProductComponent } from './pages/add-product/add-product.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'products/new',
    component: AddProductComponent,
  },
  {
    path: 'products/:id/edit',
    component: AddProductComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
