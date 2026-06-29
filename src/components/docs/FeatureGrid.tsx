import type { ReactNode } from 'react';

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3;
}

export function FeatureGrid({ features, columns = 2 }: FeatureGridProps) {
  const cols = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${cols}`}>
      {features.map((feature) => (
        <div
          key={feature.title}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 sm:p-6"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-lg bg-zinc-800 p-2">{feature.icon}</div>
            <div>
              <h3 className="mb-2 text-base font-semibold text-white sm:text-lg">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
