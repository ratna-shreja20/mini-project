import type { Verdict } from '@/types';

export function verdictClasses(v: Verdict): string {
  switch (v) {
    case 'Genuine':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Suspicious':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Fake':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function verdictDot(v: Verdict): string {
  switch (v) {
    case 'Genuine':
      return 'bg-emerald-500';
    case 'Suspicious':
      return 'bg-amber-500';
    case 'Fake':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
}

export function verdictBgGradient(v: Verdict): string {
  switch (v) {
    case 'Genuine':
      return 'from-emerald-500 to-teal-600';
    case 'Suspicious':
      return 'from-amber-500 to-orange-600';
    case 'Fake':
      return 'from-rose-500 to-red-600';
    default:
      return 'from-slate-500 to-slate-700';
  }
}

export function roleBadgeClasses(role: string): string {
  return role === 'admin'
    ? 'bg-rose-100 text-rose-800'
    : 'bg-sky-100 text-sky-800';
}

export function formatTimestamp(ts: string): string {
  if (!ts) return '--';
  return ts;
}
