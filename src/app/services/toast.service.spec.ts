import { TestBed } from '@angular/core/testing';
import { ToastService, ToastMessage } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty toasts array', () => {
    expect(service.toasts()).toEqual([]);
  });

it('should generate unique IDs for toasts', () => {
    service.show('Test 1');
    service.show('Test 2');

    const toasts = service.toasts();
    expect(toasts.length).toBe(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('should add toast with default tone info', () => {
    service.show('Test message');

    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].text).toBe('Test message');
    expect(toasts[0].tone).toBe('info');
  });

  it('should add toast with specified tone', () => {
    service.show('Error message', 'error');

    const toasts = service.toasts();
    expect(toasts[0].tone).toBe('error');
  });

  it('should add toast with custom duration', (done) => {
    const shortDuration = 100;
    service.show('Short toast', 'info', shortDuration);

    expect(service.toasts().length).toBe(1);

    setTimeout(() => {
      expect(service.toasts().length).toBe(0);
      done();
    }, shortDuration + 50);
  });

  it('should dismiss toast by ID', () => {
    service.show('Toast 1');
    service.show('Toast 2');

    const toasts = service.toasts();
    const firstToastId = toasts[0].id;

    service.dismiss(firstToastId);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].id).not.toBe(firstToastId);
  });

  it('should handle dismiss of non-existent ID gracefully', () => {
    service.show('Test toast');

    const initialLength = service.toasts().length;
    service.dismiss('non-existent-id');

    expect(service.toasts().length).toBe(initialLength);
  });

  it('should support all toast tones', () => {
    const tones: ToastMessage['tone'][] = ['success', 'error', 'info'];

    tones.forEach((tone, index) => {
      service.show(`Toast ${index}`, tone);
    });

    const toasts = service.toasts();
    expect(toasts.length).toBe(3);

    toasts.forEach((toast, index) => {
      expect(toast.tone).toBe(tones[index]);
    });
  });

it('should auto-dismiss after default duration', (done) => {
    service.show('Auto dismiss test');
    
    expect(service.toasts().length).toBe(1);
    
    setTimeout(() => {
      expect(service.toasts().length).toBe(0);
      done();
    }, 2600); // 2500 default + 100ms buffer
  });

it('should create proper toast message structure', () => {
    service.show('Test', 'success');
    
    const toast = service.toasts()[0];
    expect(toast.id).toBeDefined();
    expect(toast.text).toBe('Test');
    expect(toast.tone).toBe('success');
    expect(typeof toast.id).toBe('string');
    expect(toast.id.length).toBeGreaterThan(0);
  });

  it('should increment counter for unique IDs', () => {
    const initialCounter = (service as any).counter;

    service.show('Test 1');
    service.show('Test 2');

    expect((service as any).counter).toBe(initialCounter + 2);
  });
});
