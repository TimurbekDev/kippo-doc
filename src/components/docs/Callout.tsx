import { Info, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';

type CalloutType = 'info' | 'warning' | 'success' | 'tip';

const styles: Record<CalloutType, { wrap: string; icon: ReactNode; text: string }> = {
  info: {
    wrap: 'bg-blue-500/10 border-blue-500/20',
    icon: <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />,
    text: 'text-blue-100',
  },
  warning: {
    wrap: 'bg-amber-500/10 border-amber-500/20',
    icon: <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />,
    text: 'text-amber-100',
  },
  success: {
    wrap: 'bg-green-500/10 border-green-500/20',
    icon: <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={18} />,
    text: 'text-green-100',
  },
  tip: {
    wrap: 'bg-purple-500/10 border-purple-500/20',
    icon: <Lightbulb className="text-purple-400 shrink-0 mt-0.5" size={18} />,
    text: 'text-purple-100',
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const s = styles[type];
  return (
    <div className={`my-4 flex items-start gap-3 rounded-lg border p-4 ${s.wrap}`}>
      {s.icon}
      <div className={`text-sm leading-relaxed ${s.text}`}>
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
