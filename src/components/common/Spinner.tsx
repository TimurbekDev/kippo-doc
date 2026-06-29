interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label, className = '' }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
      {label && <p className="text-sm text-zinc-400">{label}</p>}
    </div>
  );
}
