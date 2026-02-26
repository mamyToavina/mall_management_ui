import { environment } from '../../../../environments/environment';

const DEFAULT_AVATAR_URL = '/assets/avatar-default-other.svg';

export function timeAgo(isoDate: string, now = new Date()): string {
  const d = new Date(isoDate);
  const diffMs = now.getTime() - d.getTime();
  const s = Math.max(0, Math.floor(diffMs / 1000));

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (s < minute) return `membre depuis ${s}s`;
  if (s < hour) return `membre depuis ${Math.floor(s / minute)}min`;
  if (s < day) return `membre depuis ${Math.floor(s / hour)}h`;
  if (s < week) return `membre depuis ${Math.floor(s / day)} jour(s)`;
  if (s < month) return `membre depuis ${Math.floor(s / week)} semaine(s)`;
  if (s < year) return `membre depuis ${Math.floor(s / month)} mois`;
  return `membre depuis ${Math.floor(s / year)} an(s)`;
}

export function formatAriary(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${new Intl.NumberFormat('fr-FR').format(n)} Ar`;
}

export function getDefaultAvatarUrl(): string {
  return DEFAULT_AVATAR_URL;
}

export function resolveAvatarUrl(avatarPath?: string | null): string {
  const raw = String(avatarPath || '').trim();
  if (!raw) return DEFAULT_AVATAR_URL;

  if (/^https?:\/\//i.test(raw)) return raw;

  const normalized = raw.startsWith('/') ? raw : `/${raw}`;

  if (normalized.startsWith('/uploads/')) {
    const base = String(environment.apiBaseUrl || '').replace(/\/$/, '');
    if (base) return `${base}${normalized}`;
  }

  return normalized;
}
