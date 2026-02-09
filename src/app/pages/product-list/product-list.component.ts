import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
  protected readonly currentPage = signal(1);
  protected readonly products = signal<ProductDTO[]>([]);

  private readonly filteredFull = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.products();

    return this.products().filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term)
    );
  });

  private readonly filteredPage = computed(() => {
    const size = this.pageSize();
    const page = this.currentPage();
    const start = (page - 1) * size;
    return this.filteredFull().slice(start, start + size);
  });

  private readonly totalPages = computed(() =>
    Math.ceil(this.filteredFull().length / this.pageSize())
  );

  protected readonly vm = computed(() => ({
    loading: this.loading(),
    error: this.error(),
    products: this.filteredPage(),
    total: this.filteredFull().length,
    pageSize: this.pageSize(),
    currentPage: this.currentPage(),
    totalPages: this.totalPages(),
  }));

  protected readonly pageSizes = [5, 10, 20];

  ngOnInit() {
    this.loadProducts();
  }

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
    this.currentPage.set(1);
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
      await firstValueFrom(this.api.deleteProduct(product.id));
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
      this.currentPage.set(1);
    }
  }

  protected onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1);
    if (total > 1) pages.push(total);

    return pages;
  }

  protected onRetry() {
    this.loadProducts();
  }

protected getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  protected onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';

    // Create initials placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'logo-placeholder';
    placeholder.textContent = this.getInitials(img.alt);

    img.parentNode?.replaceChild(placeholder, img);
  }
}
