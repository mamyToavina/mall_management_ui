import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditService } from '../services/credit.service'; 
import { Credit } from '../model/credit.model';

@Component({
  selector: 'app-credit-print',
  templateUrl: '../pages/credit-print/credit-print.component.html',
  styleUrls: ['../pages/credit-print/credit-print.component.css']
})
export class CreditPrintComponent implements OnInit {
  credit!: Credit;

  constructor(private route: ActivatedRoute, private creditService: CreditService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.creditService.listCredits().subscribe({
        next: (credits) => this.credit = credits.find(c => c._id === id)!
      });
    }
  }

  finalize(): void {
    alert('Impression finalisée !');
    this.router.navigate(['/credits']);
  }
}
