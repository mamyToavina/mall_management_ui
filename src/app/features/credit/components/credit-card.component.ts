import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Credit } from '../model/credit.model';

@Component({
  selector: 'app-credit-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../pages/credit-card/credit-card.component.html',
  styleUrls: ['../pages/credit-card/credit-card.component.css'],
})
export class CreditCardComponent {
  @Input({ required: true }) credit!: Credit;
  @Output() print = new EventEmitter<void>();

  onPrint(): void {
    this.print.emit();
  }
}
