import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionMenuComponent } from './action-menu.component';
import { ProductDTO } from '../../models/product.dto';
import { By } from '@angular/platform-browser';

describe('ActionMenuComponent', () => {
  let component: ActionMenuComponent;
  let fixture: ComponentFixture<ActionMenuComponent>;
  const mockProduct: ProductDTO = {
    id: 'test-1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2026-02-20',
    date_revision: '2027-02-20',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActionMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionMenuComponent);
    component = fixture.componentInstance;
    
    // Mock the input signals
    (component as any).product = mockProduct;
    (component as any).isLastRow = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu button', () => {
    const button = fixture.debugElement.query(By.css('.icon-button'));
    expect(button).toBeTruthy();
  });

  it('should toggle menu when button clicked', () => {
    const button = fixture.debugElement.query(By.css('.icon-button'));
    
    expect((component as any).vm().isOpen).toBeFalse();
    
    button.triggerEventHandler('click', new Event('click'));
    fixture.detectChanges();
    
    expect((component as any).vm().isOpen).toBeTrue();
  });

  it('should close menu when clicking outside', () => {
    (component as any).isOpen.set(true);
    fixture.detectChanges();
    
    component.closeMenu();
    
    expect((component as any).vm().isOpen).toBeFalse();
  });

  it('should emit editProduct when edit option clicked', () => {
    spyOn(component.editProduct, 'emit');
    (component as any).isOpen.set(true);
    fixture.detectChanges();
    
    component.edit();
    
    expect(component.editProduct.emit).toHaveBeenCalledWith(mockProduct);
    expect((component as any).vm().isOpen).toBeFalse();
  });

  it('should emit deleteProduct when delete option clicked', () => {
    spyOn(component.deleteProduct, 'emit');
    (component as any).isOpen.set(true);
    fixture.detectChanges();
    
    component.delete();
    
    expect(component.deleteProduct.emit).toHaveBeenCalledWith(mockProduct.id);
    expect((component as any).vm().isOpen).toBeFalse();
  });

  it('should position menu down by default', () => {
    (component as any).isOpen.set(true);
    fixture.detectChanges();
    
    expect((component as any).vm().menuPosition).toBe('down');
  });

  it('should position menu up when isLastRow and not enough space below', () => {
    (component as any).isLastRow = true;
    (component as any).isOpen.set(true);
    
    const mockEvent = {
      target: {
        getBoundingClientRect: () => ({
          bottom: window.innerHeight - 50
        })
      }
    } as any;
    
    (component as any).updateMenuPosition(mockEvent);
    
    expect((component as any).vm().menuPosition).toBe('up');
  });

  it('should position menu down when isLastRow but enough space below', () => {
    (component as any).isLastRow = true;
    (component as any).isOpen.set(true);
    
    const mockEvent = {
      target: {
        getBoundingClientRect: () => ({
          bottom: 100
        })
      }
    } as any;
    
    (component as any).updateMenuPosition(mockEvent);
    
    expect((component as any).vm().menuPosition).toBe('down');
  });

  it('should stop event propagation when toggling menu', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    
    component.toggleMenu(event);
    
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should update menu position only when opening', () => {
    const event = new Event('click');
    spyOn(component as any, 'updateMenuPosition');
    
    (component as any).isOpen.set(true);
    component.toggleMenu(event);
    
    expect((component as any).updateMenuPosition).not.toHaveBeenCalled();
  });

  it('should have correct vm computed values', () => {
    (component as any).isOpen.set(true);
    (component as any).menuPosition.set('up');
    (component as any).isLastRow = true;
    
    expect((component as any).vm()).toEqual({
      isOpen: true,
      menuPosition: 'up',
      isLastRow: true,
    });
  });
});