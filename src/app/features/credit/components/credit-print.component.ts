import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';

import { CreditService } from '../services/credit.service';
import { Credit } from '../model/credit.model';

@Component({
  selector: 'app-credit-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../pages/credit-print/credit-print.component.html',
  styleUrls: ['../pages/credit-print/credit-print.component.css'],
})
export class CreditPrintComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private creditService = inject(CreditService);

  credit?: Credit;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        filter((id): id is string => !!id),
        switchMap((id) => this.creditService.getCreditById(id))
      )
      .subscribe({
        next: (res) => (this.credit = res.data),
        error: (err) => console.error(err),
      });
  }

  finalize(): void {
    if (!this.credit?._id) return;

    this.creditService.markAsPrinted(this.credit._id).subscribe({
      next: () => {
        alert('Impression finalisée !');
        this.router.navigate(['/credits']);
      },
      error: (err) => console.error(err),
    });
  }
}
