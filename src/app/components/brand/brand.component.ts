import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {}
