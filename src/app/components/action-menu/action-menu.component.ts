import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDTO } from '../../models/product.dto';

@Component({
  selector: 'app-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionMenuComponent {
  product = input.required<ProductDTO>();
  editProduct = output<ProductDTO>();
  deleteProduct = output<string>();
  isOpen = false;

  edit() {
    this.editProduct.emit(this.product());
    this.isOpen = false;
  }

  delete() {
    this.deleteProduct.emit(this.product().id);
    this.isOpen = false;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click')
  closeMenu() {
    this.isOpen = false;
  }
}
