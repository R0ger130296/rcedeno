import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormBuilder,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDTO } from '../../models/product.dto';
import { ProductService } from '../../services/product.services';
import { BrandComponent } from '../../components/brand/brand.component';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  imports: [CommonModule, ReactiveFormsModule, BrandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProductService);

  protected readonly isEdit = signal(false);
  private readonly currentId = signal<string>('');
  protected readonly pageTitle = computed(() =>
    this.isEdit() ? 'Editar producto' : 'Agregar producto',
  );
  protected readonly submitError = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  addProductForm: FormGroup = this.fb.group(
    {
      name: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
          this.startsWithLetterValidator(),
        ],
        nonNullable: true,
      }),
      description: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
        nonNullable: true,
      }),
      logo: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      date_release: new FormControl('', {
        validators: [Validators.required, this.notPastDateValidator()],
        nonNullable: true,
      }),
      date_revision: new FormControl(
        { value: '', disabled: true },
        {
          validators: [Validators.required],
          nonNullable: true,
        },
      ),
    },
    { validators: this.dateValidation },
  );

  ngOnInit() {
    this.currentId.set(this.generateId());
    this.addProductForm
      .get('date_release')
      ?.valueChanges.subscribe((date) => this.updateRevisionDate(date));

    const stateProduct = history.state?.['product'] as ProductDTO | undefined;
    const routeId = this.route.snapshot.paramMap.get('id');

    if (routeId) {
      this.isEdit.set(true);
      this.initFromRoute(routeId, stateProduct);
    }
  }

  private async initFromRoute(id: string, stateProduct?: ProductDTO) {
    if (stateProduct) {
      this.currentId.set(stateProduct.id);
      this.fillForm(stateProduct);
      return;
    }

    this.loading.set(true);
    this.api.getProducts().subscribe({
      next: (res) => {
        const product = res.data?.find((p) => p.id === id);
        if (!product) {
          this.router.navigateByUrl('/');
          return;
        }
        this.currentId.set(product.id);
        this.fillForm(product);
      },
      error: () => {
        this.apiError.set('No se pudo cargar el producto.');
        this.router.navigateByUrl('/');
      },
      complete: () => this.loading.set(false),
    });
  }

  /**
   * Fill the form with product data if editing an existing product
   */
  private fillForm(product: ProductDTO) {
    this.addProductForm.patchValue({
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    });
  }

  /**
   * Update revision date automatically based on the release date
   */
  private updateRevisionDate(releaseDate: string) {
    if (releaseDate) {
      const release = new Date(releaseDate);
      release.setFullYear(release.getFullYear() + 1);
      const revisionDate = release.toISOString().split('T')[0];

      if (!isNaN(release.getTime())) {
        this.addProductForm.get('date_revision')?.setValue(revisionDate);
      } else {
        this.addProductForm.get('date_revision')?.setValue('');
      }
    }
  }

  /**
   * Submit the form and add or edit the product
   */

  async onSubmit() {
    if (this.addProductForm.valid) {
      this.submitError.set(null);
      const productData: ProductDTO = {
        id: this.currentId(),
        ...this.addProductForm.getRawValue(),
        date_release: this.addProductForm.getRawValue().date_release,
        date_revision: this.addProductForm.getRawValue().date_revision,
      };
      try {
        if (this.isEdit()) {
          await this.api.updateProduct(productData.id, productData).toPromise();
        } else {
          await this.api.addProduct(productData).toPromise();
        }
        this.router.navigate(['']);
      } catch (error) {
        console.error('Error al guardar producto:', error);
        this.submitError.set('No se pudo guardar el producto. Intenta de nuevo.');
      }
    } else {
      this.markAllAsTouched();
    }
  }

  /**
   * Mark all form controls as touched to trigger validation messages
   */
  private markAllAsTouched() {
    Object.keys(this.addProductForm.controls).forEach((field) => {
      const control = this.addProductForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  /**
   * Get error state for revision date
   */
  get dateRevisionInvalid() {
    return (
      this.addProductForm.hasError('invalidRevisionDate') &&
      this.addProductForm.get('date_revision')?.touched
    );
  }

  /**
   * Reset the form
   */
  resetForm() {
    if (!this.isEdit()) {
      this.addProductForm.reset();
      this.currentId.set(this.generateId());
    }
  }

  goBack() {
    this.router.navigate(['']);
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `prod-${Math.random().toString(36).slice(2, 10)}`;
  }

  private startsWithLetterValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value && /^[a-zA-Z]/.test(value)) {
        return null;
      }
      return { startsWithLetter: true };
    };
  }

  private notPastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const release = new Date(value);
      return release < today ? { pastDate: true } : null;
    };
  }

  /**
   * Custom validation for dates to ensure revision date is one year after release date
   */
  private dateValidation(control: AbstractControl): ValidationErrors | null {
    const releaseDate = control.get('date_release')?.value;
    const revisionDate = control.get('date_revision')?.value;

    if (!releaseDate || !revisionDate) {
      return null;
    }

    const release = new Date(releaseDate);
    const revision = new Date(revisionDate);

    release.setFullYear(release.getFullYear() + 1);

    if (
      release.getFullYear() !== revision.getFullYear() ||
      release.getMonth() !== revision.getMonth() ||
      release.getDate() !== revision.getDate()
    ) {
      return {
        invalidRevisionDate:
          'La fecha de revisión debe ser exactamente un año posterior a la de liberación.',
      };
    }

    return null;
  }

  isInvalid(controlName: string): boolean {
    const control = this.addProductForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}
