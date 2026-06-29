import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 py-12 px-6 text-center">
      <div className="rounded-full bg-red-500/10 p-3">
        <AlertTriangle className="text-red-400" size={24} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{message}</p>
      </div>
      {action}
    </div>
  );
}
