import type { ReactNode } from 'react';

type BadgeTone = 'blue' | 'green' | 'amber' | 'purple' | 'zinc' | 'red';

const tones: Record<BadgeTone, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = 'zinc', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
