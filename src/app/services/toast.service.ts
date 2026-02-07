import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  show(text: string, tone: ToastMessage['tone'] = 'info', duration = 2500) {
    const id = `${Date.now()}-${this.counter++}`;
    const toast = { id, text, tone };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: string) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
