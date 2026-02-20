import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { PublicCartStore } from '../../features/public/services/public-cart.store';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent {
  readonly year = new Date().getFullYear();
  readonly cart = inject(PublicCartStore);
}
