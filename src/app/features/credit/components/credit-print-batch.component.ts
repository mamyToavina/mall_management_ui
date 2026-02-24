import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Credit } from '../model/credit.model';
import { CreditService } from '../services/credit.service';

@Component({
  selector: 'app-credit-print-batch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../pages/credit-print-batch/credit-print-batch.component.html',
  styleUrls: ['../pages/credit-print-batch/credit-print-batch.component.css']
})
export class CreditPrintBatchComponent implements OnInit {
  private router = inject(Router);
  private creditService = inject(CreditService);

  credits: Credit[] = [];
  finalizing = false;

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const stateCredits = (nav?.extras?.state as any)?.credits as Credit[] | undefined;
    const historyCredits = (history.state as any)?.credits as Credit[] | undefined;

    this.credits = stateCredits ?? historyCredits ?? [];

    if (this.credits.length === 0) {
      this.router.navigate(['/admin/credits']);
    }
  }

  print(): void {
    window.print();
  }

  finalize(): void {
    if (this.finalizing) return;

    const ids = this.credits.map((c) => c._id).filter(Boolean);
    if (!ids.length) {
      this.router.navigate(['/admin/credits']);
      return;
    }

    this.finalizing = true;

    forkJoin(ids.map((id) => this.creditService.markAsPrinted(id))).subscribe({
      next: () => {
        alert('Impression finalisee !');
        this.router.navigate(['/admin/credits']);
      },
      error: () => {
        alert('Certaines impressions n ont pas pu etre marquees.');
        this.finalizing = false;
      }
    });
  }

  trackById(_: number, item: Credit) {
    return item._id;
  }
}
