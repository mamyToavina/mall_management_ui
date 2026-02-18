import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Credit } from '../model/credit.model';

@Component({
  selector: 'app-credit-card',
  templateUrl: '../pages/credit-card/credit-card.component.html',
  styleUrls: ['../pages/credit-card/credit-card.component.css']
})
export class CreditCardComponent {
  @Input() credit!: Credit;
  @Output() print = new EventEmitter<void>();

  onPrint(): void {
    this.print.emit();
  }
}
