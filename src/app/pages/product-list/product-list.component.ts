import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActionMenuComponent } from '../../components/action-menu/action-menu.component';
import { ProductDTO } from '../../models/product.dto';
import { ProductService } from '../../services/product.services';
import { ToastService } from '../../services/toast.service';
import { BrandComponent } from '../../components/brand/brand.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    ActionMenuComponent,
    BrandComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ProductService);
  private readonly toast = inject(ToastService);

  protected readonly searchTerm = signal('');
  protected readonly isModalVisible = signal(false);
  protected readonly productToDelete = signal<ProductDTO | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pageSize = signal(5);
  protected readonly products = signal<ProductDTO[]>([]);

  protected readonly vm = computed(() => ({
    loading: this.loading(),
    error: this.error(),
    products: this.filteredProducts(),
    total: this.filteredProducts().length,
    pageSize: this.pageSize(),
  }));

  protected readonly pageSizes = [5, 10, 20];

  ngOnInit() {
    this.loadProducts();
  }

  private readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const size = this.pageSize();
    const list = term
      ? this.products().filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.id.toLowerCase().includes(term),
        )
      : this.products();
    return list.slice(0, size);
  });

  private loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data ?? []);
        this.loading.set(false);
        this.toast.show('Productos cargados', 'info', 1800);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.loading.set(false);
        this.toast.show('Error al cargar productos', 'error');
      },
    });
  }

  protected onSearch(term: string) {
    this.searchTerm.set(term);
  }

  /**
   * Navigate to add or edit page
   */
  protected goToProductDetail(product?: ProductDTO) {
    if (!product) {
      this.router.navigate(['/products/new']);
      return;
    }
    this.router.navigate([`/products/${product.id}/edit`], {
      state: { product },
    });
  }

  /**
   * Show modal for deletion
   */
  protected confirmDeleteProduct(product: ProductDTO) {
    this.productToDelete.set(product);
    this.isModalVisible.set(true);
  }

  protected closeModal() {
    this.isModalVisible.set(false);
    this.productToDelete.set(null);
  }

  /**
   * Confirm and delete the product
   */
  protected async confirmDelete() {
    const product = this.productToDelete();
    if (!product) return;
    try {
      this.loading.set(true);
      await this.api.deleteProduct(product.id).toPromise();
      this.products.update((list) => list.filter((p) => p.id !== product.id));
      this.deleteError.set(null);
      this.toast.show('Producto eliminado', 'success');
    } catch (error) {
      this.deleteError.set('No se pudo eliminar: el producto ya no existe.');
      this.toast.show('No se pudo eliminar', 'error');
    } finally {
      this.loading.set(false);
      this.closeModal();
    }
  }

  protected onPageSizeChange(size: string) {
    const parsed = Number(size);
    if (!isNaN(parsed)) {
      this.pageSize.set(parsed);
    }
  }

  protected onRetry() {
    this.loadProducts();
  }
}
