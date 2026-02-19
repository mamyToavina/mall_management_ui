import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Credit } from '../model/credit.model';
import { CreditService } from '../services/credit.service';

@Component({
  selector: 'app-credit-print-batch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../pages/credit-print-batch/credit-print-batch.component.html',
  styleUrls: ['../pages/credit-print-batch/credit-print-batch.component.css'],
})
export class CreditPrintBatchComponent implements OnInit {
  private router = inject(Router);
  private creditService = inject(CreditService);

  credits: Credit[] = [];

  ngOnInit(): void {
    // ✅ récupère les crédits envoyés depuis la page génération
    const nav = this.router.getCurrentNavigation();
    const stateCredits = (nav?.extras?.state as any)?.credits as Credit[] | undefined;

    // Fallback si l’utilisateur refresh la page
    const historyCredits = (history.state as any)?.credits as Credit[] | undefined;

    this.credits = stateCredits ?? historyCredits ?? [];

    if (this.credits.length === 0) {
      // Rien à afficher -> retour à la génération
      this.router.navigate(['/admin/credits']);
    }
  }

  print(): void {
    window.print();
  }

  finalize(): void {
    // Optionnel: marquer tous comme imprimés
    const ids = this.credits.map(c => c._id);

    // Si tu n'as pas d'endpoint "batch", on le fait un à un (simple)
    ids.forEach((id) => {
      this.creditService.markAsPrinted(id).subscribe();
    });

    alert('Impression finalisée !');
    this.router.navigate(['/admin/credits']);
  }

  trackById(_: number, item: Credit) {
    return item._id;
  }
}
