import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreditService } from '../services/credit.service'; 
import { Credit } from '../model/credit.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from '../../../app.routes';
import { CreditCardComponent } from './credit-card.component';
import { CreditPrintComponent } from './credit-print.component';

@Component({
  selector: 'app-credit-generate',
  templateUrl: '../pages/credit-generate/credit-generate.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CreditCardComponent
  ],
  styleUrls: ['../pages/credit-generate/credit-generate.component.css']
})
export class CreditGenerateComponent implements OnInit {
  generateForm: FormGroup;
  credits: Credit[] = [];
  amounts = [20000, 100000, 400000];

  constructor(private fb: FormBuilder, private creditService: CreditService, private router: Router) {
    this.generateForm = this.fb.group({
      value: [this.amounts[0], Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      adminId: ['698c2c9cdc19bdaad5d2a9e5', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCredits();
  }

  generate(): void {
    if (this.generateForm.invalid) return;

    const { value, quantity, adminId } = this.generateForm.value;

    this.creditService.generateCredit(adminId, value, quantity).subscribe({
      next: (res) => this.credits = res,
      error: (err) => console.error(err)
    });
  }

  loadCredits(): void {
    this.creditService.listCredits().subscribe({
      next: (res) => this.credits = res,
      error: (err) => console.error(err)
    });
  }

  printCredit(credit: Credit): void {
    this.router.navigate(['/credits/print', credit._id]);
  }
}
