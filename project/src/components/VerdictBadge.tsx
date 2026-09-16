import type { Verdict } from '@/types';
import { verdictClasses, verdictDot } from '@/lib/utils';

interface Props {
  verdict: Verdict;
  size?: 'sm' | 'md';
}

export default function VerdictBadge({ verdict, size = 'sm' }: Props) {
  const padding = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${verdictClasses(
        verdict
      )} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${verdictDot(verdict)}`} />
      {verdict}
    </span>
  );
}
