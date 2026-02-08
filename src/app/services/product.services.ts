import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, MonoTypeOperatorFunction } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ProductDTO } from '../models/product.dto';
import { environment } from '../../environments/environment';
import { ProductListResponse } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/bp/products`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  getProducts(): Observable<ProductListResponse> {
    return this.http
      .get<ProductListResponse>(this.url, { headers: this.headers })
      .pipe(delay(500), this.handleError('obtener productos'));
  }

  addProduct(product: ProductDTO): Observable<ProductDTO> {
    return this.http
      .post<ProductDTO>(this.url, product, { headers: this.headers })
      .pipe(this.handleError('agregar producto'));
  }

  updateProduct(id: string, product: ProductDTO): Observable<ProductDTO> {
    return this.http
      .put<ProductDTO>(`${this.url}/${id}`, product, { headers: this.headers })
      .pipe(this.handleError('actualizar producto'));
  }

  deleteProduct(id: string): Observable<any> {
    return this.http
      .delete(`${this.url}/${id}`, { headers: this.headers })
      .pipe(this.handleError('eliminar producto'));
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.url}/verification/${id}`, { headers: this.headers })
      .pipe(this.handleError('verificar ID del producto'));
  }

  /**
   * Handler centralizado para logging y propagación de errores.
   * Mantiene trazas limpias y mensajes consistentes.
   */
  private handleError<T>(context: string): MonoTypeOperatorFunction<T> {
    return catchError((error: any) => {
      console.error(`Error al ${context}:`, error);
      return throwError(() => error as T);
    });
  }
}
