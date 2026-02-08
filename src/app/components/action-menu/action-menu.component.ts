import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
  computed,
  signal,
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
  isLastRow = input<boolean>(false);
  private readonly isOpen = signal(false);
  private readonly menuPosition = signal<'down' | 'up'>('down');

  protected readonly vm = computed(() => ({
    isOpen: this.isOpen(),
    menuPosition: this.menuPosition(),
    isLastRow: this.isLastRow(),
  }));

  edit() {
    this.editProduct.emit(this.product());
    this.isOpen.set(false);
  }

  delete() {
    this.deleteProduct.emit(this.product().id);
    this.isOpen.set(false);
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    const wasOpen = this.isOpen();
    this.isOpen.set(!wasOpen);

    if (!wasOpen) {
      this.updateMenuPosition(event);
    }
  }

  private updateMenuPosition(event: Event) {
    if (this.isLastRow()) {
      const button = event.target as HTMLElement;
      const rect = button.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const estimatedMenuHeight = 80;

      this.menuPosition.set(spaceBelow < estimatedMenuHeight ? 'up' : 'down');
    } else {
      this.menuPosition.set('down');
    }
  }

  @HostListener('document:click')
  closeMenu() {
    this.isOpen.set(false);
  }
}
