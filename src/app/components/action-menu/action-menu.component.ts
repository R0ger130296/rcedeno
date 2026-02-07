import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ProductDTO } from '../../models/product.dto';

@Component({
  selector: 'app-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.css'],
  imports: [MatIconModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionMenuComponent {
  @Input() product!: ProductDTO;
  @Output() editProduct = new EventEmitter<ProductDTO>();
  @Output() deleteProduct = new EventEmitter<string>();

  edit() {
    this.editProduct.emit(this.product);
  }

  delete() {
    this.deleteProduct.emit(this.product.id);
  }
}
