import { Component, EventEmitter, Input, Output } from '@angular/core';
import { formatAriary, resolveAvatarUrl, timeAgo } from './buyers.utils';
import { BuyerDto } from './buyers.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buyer-card-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()"></div>

    <div class="modal" role="dialog" aria-modal="true" aria-label="Fiche acheteur">
      <div class="modal-header">
        <div class="title">Fiche acheteur</div>
        <button class="icon-btn" type="button" (click)="close.emit()" aria-label="Fermer">✕</button>
      </div>

      <div class="card" *ngIf="buyer">
        <div class="card-top">
          <img class="photo" [src]="avatarUrl(buyer.avatar)" alt="Photo profil" />
          <div class="who">
            <div class="pseudo">{{ buyer.pseudo }}</div>
            <div class="sub">
              <span class="badge" [class.blocked]="buyer.status==='BLOCKED'">{{ buyer.status }}</span>
              @if (buyer.createdAt; as createdAt) {
                <span class="muted">{{ ago(createdAt) }}</span>
              }

            </div>
          </div>
        </div>

        <div class="grid">
          <div class="field">
            <div class="label">Nom</div>
            <div class="value">{{ buyer.firstName || '—' }}</div>
          </div>

          <div class="field">
            <div class="label">Email</div>
            <div class="value">{{ buyer.email }}</div>
          </div>

          <div class="field">
            <div class="label">Solde</div>
            @if (buyer.credit; as credit) {
                <div class="value strong">{{ money(credit) }}</div>
            }

          </div>

          <div class="field">
            <div class="label">Compte complété</div>
            <div class="value">{{ buyer.isAccountCompleted ? 'Oui' : 'Non' }}</div>
          </div>

          @if (buyer; as b) {

            <div class="field">
                <div class="label">Créé le</div>
                <div class="value">{{ b.createdAt | date:'medium' }}</div>
            </div>

            <div class="field">
                <div class="label">Mis à jour</div>
                <div class="value">{{ b.updatedAt | date:'medium' }}</div>
            </div>

           }


          <div class="field span2">
            <div class="label">ID</div>
            <div class="value mono">{{ buyer._id }}</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" type="button" (click)="close.emit()">Fermer</button>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop{
      position: fixed; inset: 0; background: rgba(2,6,23,.55);
      backdrop-filter: blur(2px); z-index: 80;
    }
    .modal{
      position: fixed; z-index: 90;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: min(92vw, 720px);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .modal-header{
      display:flex; align-items:center; justify-content:space-between;
      padding: 14px 14px;
      border-bottom: 1px solid var(--border);
    }
    .title{ font-weight: 800; }
    .icon-btn{
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 12px;
      height: 38px; width: 38px;
      cursor: pointer;
    }
    .card{ padding: 14px; }
    .card-top{ display:flex; gap: 12px; align-items:center; }
    .photo{
      width: 76px; height: 76px; border-radius: 16px; object-fit: cover;
      border: 1px solid var(--border);
    }
    .pseudo{ font-size: 18px; font-weight: 900; }
    .sub{ display:flex; gap: 10px; align-items:center; margin-top: 4px; }
    .badge{
      font-size: 12px; padding: 4px 10px; border-radius: 999px;
      border: 1px solid var(--border); color: var(--text);
      background: color-mix(in oklab, var(--surface) 80%, var(--primary) 8%);
      font-weight: 700;
    }
    .badge.blocked{ color: #ef4444; }
    .muted{ color: var(--muted); font-size: 12px; }

    .grid{
      margin-top: 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .field{
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 10px 12px;
      background: color-mix(in oklab, var(--surface) 92%, transparent);
    }
    .field.span2{ grid-column: span 2; }
    .label{ font-size: 12px; color: var(--muted); font-weight: 700; }
    .value{ margin-top: 4px; font-weight: 700; }
    .value.strong{ font-size: 16px; }
    .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }

    .modal-footer{
      padding: 12px 14px;
      border-top: 1px solid var(--border);
      display:flex; justify-content:flex-end;
    }
    .btn{
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 12px;
      height: 40px;
      padding: 0 14px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: var(--shadow);
    }

    @media (max-width: 520px){
      .grid{ grid-template-columns: 1fr; }
      .field.span2{ grid-column: auto; }
      .photo{ width: 64px; height: 64px; }
    }
  `]
})
export class BuyerCardModalComponent {
  @Input() buyer: BuyerDto | null = null;
  @Output() close = new EventEmitter<void>();

  ago = timeAgo;
  money = formatAriary;
  avatarUrl = resolveAvatarUrl;
}

