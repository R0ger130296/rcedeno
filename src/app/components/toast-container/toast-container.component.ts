import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);
  readonly toasts = computed(() => this.service.toasts());

  @Input() position: 'top-right' | 'bottom-right' = 'top-right';

  dismiss(id: string) {
    this.service.dismiss(id);
  }
}
