import type { ReactNode } from 'react';

interface StepProps {
  /** 1-based step number. */
  n: number;
  title: string;
  children: ReactNode;
}

/** A single numbered step with a connecting rail. */
export function Step({ n, title, children }: StepProps) {
  return (
    <section className="relative pl-11 pb-8 last:pb-0">
      <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {n}
      </span>
      <span className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-zinc-800 last:hidden" />
      <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">{title}</h2>
      <div className="space-y-4 text-zinc-300">{children}</div>
    </section>
  );
}

interface StepsProps {
  children: ReactNode;
}

export function Steps({ children }: StepsProps) {
  return <div className="mt-6">{children}</div>;
}
