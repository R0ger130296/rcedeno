import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProductComponent } from './add-product.component';
import { ProductService } from '../../services/product.services';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', [
      'addProduct',
      'updateProduct',
      'getProducts',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [AddProductComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark controls as touched on invalid submit', () => {
    component.onSubmit();
    expect(component.addProductForm.get('name')?.touched).toBeTrue();
    expect(component.addProductForm.get('description')?.touched).toBeTrue();
    expect(component.addProductForm.get('logo')?.touched).toBeTrue();
    expect(component.addProductForm.get('date_release')?.touched).toBeTrue();
    expect(component.addProductForm.get('date_revision')?.touched).toBeTrue();
  });

  it('should call addProduct on valid create submit', async () => {
    const dto = {
      id: 'new',
      name: 'Producto Uno',
      description: 'Descripcion valida',
      logo: 'http://logo.com',
      date_release: '2026-02-20',
      date_revision: '2027-02-20',
    };
    productServiceSpy.addProduct.and.returnValue(of(dto as any));
    component.addProductForm.patchValue({
      name: 'Producto Uno',
      description: 'Descripcion valida',
      logo: 'http://logo.com',
      date_release: '2026-02-20',
    });
    component.addProductForm.get('date_revision')?.setValue('2027-02-20');

    await component.onSubmit();

    expect(productServiceSpy.addProduct).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });

  it('should set submitError when api fails', async () => {
    productServiceSpy.addProduct.and.returnValue(throwError(() => new Error('fail')));
    component.addProductForm.patchValue({
      name: 'Producto Uno',
      description: 'Descripcion valida',
      logo: 'http://logo.com',
      date_release: '2026-02-20',
    });
    component.addProductForm.get('date_revision')?.setValue('2027-02-20');

    await component.onSubmit();

    expect((component as any).submitError()).toContain('No se pudo guardar');
  });

  it('should mark past date as invalid', () => {
    component.addProductForm.get('date_release')?.setValue('2020-01-01');
    fixture.detectChanges();
    const control = component.addProductForm.get('date_release');
    expect(control?.hasError('pastDate')).toBeTrue();
  });

  it('should compute date revision +1 year', () => {
    component.addProductForm.get('date_release')?.setValue('2026-02-01');
    fixture.detectChanges();
    expect(component.addProductForm.get('date_revision')?.value).toBe('2027-02-01');
  });
});
