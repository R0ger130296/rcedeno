import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.services';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductDTO } from '../../models/product.dto';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActionMenuComponent } from '../../components/action-menu/action-menu.component';
import { BrandComponent } from '../../components/brand/brand.component';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let apiSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const products: ProductDTO[] = [
    {
      id: '1',
      name: 'Uno',
      description: 'Desc',
      logo: '',
      date_release: '2026-02-20',
      date_revision: '2027-02-20',
    },
    {
      id: '2',
      name: 'Dos',
      description: 'Desc',
      logo: '',
      date_release: '2026-02-21',
      date_revision: '2027-02-21',
    },
  ];

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ProductService', [
      'getProducts',
      'deleteProduct',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastSpy = jasmine.createSpyObj('ToastService', ['show'], {
      toasts: () => [],
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatMenuModule,
        ActionMenuComponent,
        BrandComponent,
        ProductListComponent,
      ],
      providers: [
        { provide: ProductService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should load products on init', () => {
    apiSpy.getProducts.and.returnValue(of({ data: products }));
    fixture.detectChanges();
    expect(apiSpy.getProducts).toHaveBeenCalled();
    expect((component as any).products().length).toBe(2);
  });

  it('should handle load error', () => {
    apiSpy.getProducts.and.returnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    expect(component['error']()).toContain('No se pudieron cargar');
  });

  it('should delete product and update list', async () => {
    apiSpy.getProducts.and.returnValue(of({ data: products }));
    apiSpy.deleteProduct.and.returnValue(of({}));
    fixture.detectChanges();
    component['products'].set(products);
    (component as any).confirmDeleteProduct(products[0]);
    await (component as any).confirmDelete();
    expect(apiSpy.deleteProduct).toHaveBeenCalledWith('1');
    expect((component as any).products().length).toBe(1);
  });

  it('should filter by search term', () => {
    apiSpy.getProducts.and.returnValue(of({ data: products }));
    fixture.detectChanges();
    (component as any).onSearch('Uno');
    expect(component['filteredProducts']().length).toBe(1);
    expect(component['filteredProducts']()[0].id).toBe('1');
  });

  it('should handle delete error', async () => {
    apiSpy.getProducts.and.returnValue(of({ data: products }));
    apiSpy.deleteProduct.and.returnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    component['products'].set(products);
    (component as any).confirmDeleteProduct(products[0]);
    await (component as any).confirmDelete();
    expect(component['deleteError']()).toContain('No se pudo eliminar');
  });
});
