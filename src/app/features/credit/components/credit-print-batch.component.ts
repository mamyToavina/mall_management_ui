import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, timeout } from 'rxjs';

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
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  credits: Credit[] = [];
  finalizing = false;
  showResultModal = false;
  resultTitle = '';
  resultMessage = '';
  resultSuccess = false;
  private readonly finalizeTimeoutMs = 20000;

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
    const sheet = document.querySelector('.print-sheet') as HTMLElement | null;
    if (!sheet) return;
    const printFileName = this.buildPrintFileName();

    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) {
      window.print();
      this.zone.run(() => this.finalizeAfterPrint());
      return;
    }

    const styles = this.getPrintDocumentStyles();
    const html = `
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>${printFileName}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${sheet.outerHTML}
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    const triggerPrint = () => {
      printWindow.print();
      printWindow.close();
      this.zone.run(() => this.finalizeAfterPrint());
    };

    if (printWindow.document.readyState === 'complete') {
      triggerPrint();
    } else {
      printWindow.onload = triggerPrint;
    }
  }

  finalize(): void {
    this.finalizeAfterPrint();
  }

  closeResultModal(): void {
    this.showResultModal = false;
  }

  goBackToCredits(): void {
    this.showResultModal = false;
    this.router.navigate(['/admin/credits/generate']);
  }

  private finalizeAfterPrint(): void {
    if (this.finalizing) return;

    const ids = this.credits.map((c) => c._id).filter(Boolean);
    if (!ids.length) {
      this.router.navigate(['/admin/credits']);
      return;
    }

    this.finalizing = true;
    this.cdr.detectChanges();

    forkJoin(ids.map((id) => this.creditService.markAsPrinted(id)))
      .pipe(timeout(this.finalizeTimeoutMs))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.finalizing = false;
            this.resultSuccess = true;
            this.resultTitle = 'Impression finalisée';
            this.resultMessage = 'Les crédits imprimés ont été enregistrés automatiquement.';
            this.showResultModal = true;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.resultSuccess = false;
            this.resultTitle = 'Finalisation incomplète';
            this.resultMessage = 'La finalisation a échoué ou a dépassé le délai. Veuillez réessayer.';
            this.showResultModal = true;
            this.finalizing = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  trackById(_: number, item: Credit) {
    return item._id;
  }

  valueLabel(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} Ar`;
  }

  themeByValue(value: number): string {
    const amount = Number(value) || 0;
    if (amount <= 20_000) return 'theme-ocean';
    if (amount <= 50_000) return 'theme-emerald';
    if (amount <= 100_000) return 'theme-sunset';
    return 'theme-royal';
  }

  emblemByValue(value: number): string {
    const amount = Number(value) || 0;
    if (amount <= 20_000) return 'WAVE';
    if (amount <= 50_000) return 'LEAF';
    if (amount <= 100_000) return 'SUN';
    return 'CROWN';
  }

  private getPrintDocumentStyles(): string {
    return `
      @page { size: A4 portrait; margin: 6mm; }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        width: 210mm;
        min-height: 297mm;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-sheet {
        width: 198mm;
        margin: 0 auto;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(2, 96mm);
        grid-auto-rows: 58mm;
        justify-content: center;
        align-content: start;
        gap: 3mm;
        width: 100%;
      }

      .credit-card {
        position: relative;
        width: 96mm;
        height: 58mm;
        border-radius: 5mm;
        padding: 4.2mm;
        color: #f8fafc;
        overflow: hidden;
        border: 0.2mm solid rgba(15, 23, 42, 0.2);
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .credit-card::before,
      .credit-card::after {
        content: '';
        position: absolute;
        border-radius: 999px;
        pointer-events: none;
      }
      .credit-card::before {
        width: 56mm;
        height: 56mm;
        top: -30mm;
        right: -18mm;
        background: rgba(255, 255, 255, 0.16);
      }
      .credit-card::after {
        width: 45mm;
        height: 45mm;
        bottom: -25mm;
        left: -16mm;
        background: rgba(255, 255, 255, 0.12);
      }

      .credit-card__noise {
        position: absolute;
        inset: 0;
        opacity: 0.18;
        background-image: radial-gradient(rgba(255, 255, 255, 0.7) 0.8px, transparent 0.8px);
        background-size: 4px 4px;
        mix-blend-mode: soft-light;
        pointer-events: none;
      }

      .credit-card__top,
      .credit-card__amount,
      .scratch-note,
      .credit-card__code,
      .credit-card__bottom {
        position: relative;
        z-index: 1;
      }

      .credit-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2.8mm;
      }
      .brand { font-size: 2.8mm; font-weight: 800; letter-spacing: 0.3mm; }
      .emblem {
        font-size: 2.3mm;
        font-weight: 800;
        padding: 1.2mm 2.2mm;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.2);
        border: 0.2mm solid rgba(255, 255, 255, 0.35);
      }

      .credit-card__amount {
        font-size: 6.2mm;
        font-weight: 900;
        letter-spacing: 0.2mm;
        margin-bottom: 2.8mm;
      }
      .scratch-note {
        font-size: 2.2mm;
        font-weight: 700;
        letter-spacing: 0.08mm;
        margin-bottom: 1.2mm;
        color: rgba(248, 250, 252, 0.95);
      }
      .credit-card__code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
        font-size: 3.2mm;
        letter-spacing: 0.2mm;
        background: rgba(15, 23, 42, 0.3);
        border: 0.2mm solid rgba(255, 255, 255, 0.35);
        padding: 1.5mm 2mm;
        border-radius: 2.4mm;
      }

      .credit-card__bottom {
        margin-top: 2.2mm;
        display: flex;
        align-items: center;
        gap: 2.2mm;
      }
      .chip {
        width: 9mm;
        height: 6.8mm;
        border-radius: 1.4mm;
        background: linear-gradient(145deg, #fef3c7, #d4af37);
        box-shadow: inset 0 0 0 0.2mm rgba(68, 64, 60, 0.28);
      }
      .meta { display: grid; gap: 0.2mm; }
      .meta small { opacity: 0.9; font-size: 2.1mm; }
      .meta strong { font-size: 2.3mm; letter-spacing: 0.08mm; }

      .theme-ocean { background: linear-gradient(135deg, #0f172a, #1d4ed8 45%, #0ea5e9); }
      .theme-emerald { background: linear-gradient(135deg, #052e16, #059669 48%, #22c55e); }
      .theme-sunset { background: linear-gradient(135deg, #431407, #f97316 42%, #facc15); }
      .theme-royal { background: linear-gradient(135deg, #1f1147, #7c3aed 46%, #ec4899); }
    `;
  }

  private buildPrintFileName(): string {
    const amount = Number(this.credits[0]?.value || 0);
    const amountLabel = Number.isFinite(amount) && amount > 0 ? String(Math.round(amount)) : '0';
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `credit_${amountLabel}_${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
  }
}
