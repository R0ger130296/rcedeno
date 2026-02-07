import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductService } from './product.services';
import { environment } from '../../environments/environment';
import { ProductDTO } from '../models/product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/bp/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET products', () => {
    const mock: ProductDTO[] = [];
    service.getProducts().subscribe((res) => {
      expect(res.data).toEqual(mock);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mock });
  });

  it('should POST product', () => {
    const dto = {
      id: '1',
      name: 'n',
      description: 'd',
      logo: 'l',
      date_release: '2026-01-01',
      date_revision: '2027-01-01',
    };
    service.addProduct(dto as ProductDTO).subscribe((res) => {
      expect(res).toEqual(dto);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(dto);
  });

  it('should PUT product', () => {
    const dto = {
      id: '1',
      name: 'n',
      description: 'd',
      logo: 'l',
      date_release: '2026-01-01',
      date_revision: '2027-01-01',
    };
    service.updateProduct('1', dto as ProductDTO).subscribe((res) => {
      expect(res).toEqual(dto);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(dto);
  });

  it('should DELETE product', () => {
    service.deleteProduct('1').subscribe((res) => {
      expect(res).toEqual({});
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should verify product id', () => {
    service.verifyProductId('1').subscribe((exists) => {
      expect(exists).toBeTrue();
    });
    const req = httpMock.expectOne(`${apiUrl}/verification/1`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });
});
