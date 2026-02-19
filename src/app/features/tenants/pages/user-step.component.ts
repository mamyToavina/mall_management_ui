import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BoutiqueWizardStore } from '../services/wizard/tenant.wizard';

@Component({
  selector: 'app-user-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-step.component.html',
  styleUrls: ['./user-step.component.css']
})
export class UserStepComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: BoutiqueWizardStore
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      boxId: ['69948f62aa056e92fddf0de4', [Validators.required]],
    });

    const saved = this.store.getUser();
    if (saved) this.form.patchValue(saved);
  }

  next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.setUser(this.form.getRawValue() as any);
    this.router.navigate(['/tenants/wizard/contract']);
  }
}
