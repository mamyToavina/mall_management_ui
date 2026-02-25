import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';
import { CreditService } from '../../features/credit/services/credit.service';
import { PublicCartStore } from '../../features/public/services/public-cart.store';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent {
  readonly year = new Date().getFullYear();
  readonly cart = inject(PublicCartStore);
  readonly auth = inject(AuthService);
  readonly store = inject(AuthStore);
  readonly creditService = inject(CreditService);
  readonly cdr = inject(ChangeDetectorRef);

  isCreditModalOpen = false;
  isProfileModalOpen = false;
  creditCode = '';
  creditLoading = false;
  creditMessage = '';
  creditError = '';
  private avatarLoadFailed = false;
  private fallbackAvatarFailed = false;
  private lastAvatarKey = '';

  creditHistory = [
    { date: '2026-02-25 10:30', label: 'Recharge code mobile', amount: +20000 },
    { date: '2026-02-21 15:12', label: 'Achat en boutique', amount: -12000 },
    { date: '2026-02-18 09:40', label: 'Recharge code mobile', amount: +50000 }
  ];
  profileLoading = false;
  profileMessage = '';
  profileError = '';
  profileFieldErrors: Record<string, string> = {};
  profilePseudo = '';
  profileEmail = '';
  profileFirstName = '';
  profileLastName = '';
  profileGender: 'Male' | 'Female' | 'Other' | '' = '';
  profileCurrentPassword = '';
  profileNewPassword = '';
  profileConfirmPassword = '';
  profileAvatarFile: File | null = null;
  profileAvatarPreview = '';
  private profileInitial = {
    pseudo: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '' as 'Male' | 'Female' | 'Other' | ''
  };

  get isUserConnected(): boolean {
    return this.store.isAuthenticated() && this.store.role() === 'USER';
  }

  get userPseudo(): string {
    return this.store.user()?.pseudo || 'Utilisateur';
  }

  get userBalance(): number {
    return Number(this.store.user()?.credit || 0);
  }

  get avatarUrl(): string {
    const avatar = this.store.user()?.avatar;
    if (!avatar) return '';
    if (/^https?:\/\//i.test(avatar)) return avatar;
    const base = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    return `${base}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;
  }

  get resolvedAvatarUrl(): string {
    this.syncAvatarState();

    if (!this.avatarLoadFailed && this.avatarUrl) {
      return this.avatarUrl;
    }

    const gender = this.store.user()?.gender;
    if (gender === 'Male') return '/assets/avatar-default-male.svg';
    if (gender === 'Female') return '/assets/avatar-default-female.svg';
    return '/assets/avatar-default-other.svg';
  }

  get showAvatarImage(): boolean {
    return !this.fallbackAvatarFailed;
  }

  onAvatarError(): void {
    if (this.avatarUrl && !this.avatarLoadFailed) {
      this.avatarLoadFailed = true;
      this.cdr.detectChanges();
      return;
    }
    this.fallbackAvatarFailed = true;
    this.cdr.detectChanges();
  }

  openCreditModal(): void {
    this.creditCode = '';
    this.creditLoading = false;
    this.creditMessage = '';
    this.creditError = '';
    this.isCreditModalOpen = true;
  }

  openProfileModal(): void {
    this.isProfileModalOpen = true;
    this.profileLoading = true;
    this.profileMessage = '';
    this.profileError = '';
    this.profileFieldErrors = {};
    this.profileAvatarFile = null;
    const localUser = this.store.user();
    this.profilePseudo = localUser?.pseudo || '';
    this.profileEmail = localUser?.email || '';
    this.profileFirstName = localUser?.firstName || '';
    this.profileLastName = localUser?.lastName || '';
    this.profileGender = (localUser?.gender as 'Male' | 'Female' | 'Other' | '') || '';
    this.profileCurrentPassword = '';
    this.profileNewPassword = '';
    this.profileConfirmPassword = '';
    this.profileAvatarPreview = this.resolvedAvatarUrl;
    this.profileInitial = {
      pseudo: this.profilePseudo,
      email: this.profileEmail,
      firstName: this.profileFirstName,
      lastName: this.profileLastName,
      gender: this.profileGender
    };

    this.auth.getMyProfile().subscribe({
      next: (res) => {
        const user = res?.user || this.store.user();
        this.profilePseudo = user?.pseudo || '';
        this.profileEmail = user?.email || '';
        this.profileFirstName = user?.firstName || '';
        this.profileLastName = user?.lastName || '';
        this.profileGender = (user?.gender as 'Male' | 'Female' | 'Other' | '') || '';
        this.profileCurrentPassword = '';
        this.profileNewPassword = '';
        this.profileConfirmPassword = '';
        this.profileAvatarPreview = this.resolvedAvatarUrl;
        this.profileInitial = {
          pseudo: this.profilePseudo,
          email: this.profileEmail,
          firstName: this.profileFirstName,
          lastName: this.profileLastName,
          gender: this.profileGender
        };
        this.profileLoading = false;
      },
      error: (err) => {
        this.profileLoading = false;
        this.profileError =
          err?.error?.message ||
          'Impossible de charger votre profil pour le moment.';
      }
    });
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  onProfileAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.profileFieldErrors['avatar'] = 'Veuillez selectionner une image valide.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.profileFieldErrors['avatar'] = 'La photo de profil ne doit pas depasser 5 Mo.';
      return;
    }
    delete this.profileFieldErrors['avatar'];
    this.profileAvatarFile = file;
    this.profileAvatarPreview = URL.createObjectURL(file);
  }

  submitProfileUpdate(): void {
    if (this.profileLoading) return;

    this.profileMessage = '';
    this.profileError = '';
    this.profileFieldErrors = {};

    if (this.profileEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.profileEmail.trim())) {
      this.profileFieldErrors['email'] = 'L email n est pas valide.';
    }
    if (this.profileNewPassword && this.profileNewPassword.length < 8) {
      this.profileFieldErrors['newPassword'] = 'Le nouveau mot de passe doit contenir au moins 8 caracteres.';
    }
    if (this.profileNewPassword && !this.profileCurrentPassword) {
      this.profileFieldErrors['currentPassword'] =
        'Le mot de passe actuel est obligatoire pour changer le mot de passe.';
    }
    if (this.profileNewPassword !== this.profileConfirmPassword) {
      this.profileFieldErrors['confirmPassword'] = 'La confirmation du mot de passe ne correspond pas.';
    }

    if (Object.keys(this.profileFieldErrors).length > 0) return;

    const payload: {
      pseudo?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      gender?: 'Male' | 'Female' | 'Other' | '';
      avatar?: File | null;
      currentPassword?: string;
      newPassword?: string;
    } = {};
    const nextPseudo = this.profilePseudo.trim();
    const nextEmail = this.profileEmail.trim();
    const nextFirstName = this.profileFirstName.trim();
    const nextLastName = this.profileLastName.trim();
    const nextGender = this.profileGender || '';

    if (nextPseudo !== this.profileInitial.pseudo.trim()) payload.pseudo = nextPseudo;
    if (nextEmail !== this.profileInitial.email.trim()) payload.email = nextEmail;
    if (nextFirstName !== this.profileInitial.firstName.trim()) payload.firstName = nextFirstName;
    if (nextLastName !== this.profileInitial.lastName.trim()) payload.lastName = nextLastName;
    if (nextGender !== this.profileInitial.gender) payload.gender = nextGender;
    if (this.profileAvatarFile) payload.avatar = this.profileAvatarFile;
    if (this.profileNewPassword) {
      payload.currentPassword = this.profileCurrentPassword || undefined;
      payload.newPassword = this.profileNewPassword || undefined;
    }

    if (Object.keys(payload).length === 0) {
      this.profileMessage = 'Aucune modification detectee.';
      return;
    }

    this.profileLoading = true;
    this.auth
      .updateMyProfile(payload)
      .subscribe({
        next: (res) => {
          const savedUser = res?.user || this.store.user();
          this.profilePseudo = savedUser?.pseudo || this.profilePseudo;
          this.profileEmail = savedUser?.email || this.profileEmail;
          this.profileFirstName = savedUser?.firstName || '';
          this.profileLastName = savedUser?.lastName || '';
          this.profileGender = (savedUser?.gender as 'Male' | 'Female' | 'Other' | '') || '';
          this.profileLoading = false;
          this.profileMessage = res?.message || 'Profil mis a jour.';
          this.profileCurrentPassword = '';
          this.profileNewPassword = '';
          this.profileConfirmPassword = '';
          this.profileAvatarFile = null;
          this.profileAvatarPreview = this.resolvedAvatarUrl;
          this.profileInitial = {
            pseudo: savedUser?.pseudo || '',
            email: savedUser?.email || '',
            firstName: savedUser?.firstName || '',
            lastName: savedUser?.lastName || '',
            gender: (savedUser?.gender as 'Male' | 'Female' | 'Other' | '') || ''
          };
        },
        error: (err) => {
          this.profileLoading = false;
          this.profileError =
            err?.error?.message ||
            'Mise a jour du profil impossible.';

          const errors = err?.error?.errors;
          if (Array.isArray(errors)) {
            for (const item of errors) {
              if (!item?.field || !item?.message) continue;
              this.profileFieldErrors[item.field] = item.message;
            }
          }
        }
      });
  }

  closeCreditModal(): void {
    this.isCreditModalOpen = false;
  }

  submitCredit(): void {
    if (this.creditLoading) return;
    if (!this.creditCode.trim()) {
      this.creditError = 'Veuillez entrer le numero de la carte prepayee.';
      return;
    }

    const code = this.creditCode.trim();
    this.creditLoading = true;
    this.creditError = '';
    this.creditMessage = '';

    const idempotencyKey = `pub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.creditService
      .useCredit(code, idempotencyKey)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.creditLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
      next: (res) => {
        if (!res || res?.success === false) {
          this.creditError = res?.message || 'Numero de carte prepayee invalide.';
          this.cdr.detectChanges();
          return;
        }

        const newBalance = res?.data?.newBalance;
        if (typeof newBalance === 'number') {
          this.store.updateUser({ credit: newBalance });
        }

        const usedValue = Number(res?.data?.credit?.value || 0);
        if (!usedValue) {
          this.creditError = 'Numero de carte prepayee invalide.';
          this.cdr.detectChanges();
          return;
        }

        this.creditHistory = [
          {
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            label: 'Recharge carte prepayee',
            amount: +usedValue
          },
          ...this.creditHistory
        ];

        this.creditMessage =
          res?.message ||
          `Credit ajoute avec succes: +${usedValue.toLocaleString('fr-FR')} Ar.`;
        this.creditCode = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.name === 'TimeoutError') {
          this.creditError = 'Le serveur met trop de temps a repondre. Veuillez reessayer.';
          this.cdr.detectChanges();
          return;
        }
        this.creditError =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Insertion du credit impossible. Veuillez verifier le numero.';
        this.cdr.detectChanges();
      }
    });
  }

  onCreditCodeInput(): void {
    if (this.creditError) this.creditError = '';
    if (this.creditMessage) this.creditMessage = '';
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {},
      error: () => {
        this.store.clear();
      }
    });
  }

  private syncAvatarState(): void {
    const currentKey = `${this.store.user()?.id || ''}|${this.avatarUrl || ''}`;
    if (this.lastAvatarKey === currentKey) return;
    this.lastAvatarKey = currentKey;
    this.avatarLoadFailed = false;
    this.fallbackAvatarFailed = false;
  }
}
