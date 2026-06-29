import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
  to?: string;
  href?: string;
  className?: string;
}

/** Bordered surface; becomes a link when `to` (internal) or `href` (external) is set. */
export function Card({ title, icon, children, to, href, className = '' }: CardProps) {
  const base = `block rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6 transition-colors ${
    to || href ? 'hover:border-zinc-700 hover:bg-zinc-800/50' : ''
  } ${className}`;

  const inner = (
    <>
      {(icon || title) && (
        <div className="mb-2 flex items-center gap-3">
          {icon && <div className="rounded-lg bg-zinc-800 p-2">{icon}</div>}
          {title && <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>}
        </div>
      )}
      {children && <div className="text-sm leading-relaxed text-zinc-400">{children}</div>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={base}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
        {inner}
      </a>
    );
  }
  return <div className={base}>{inner}</div>;
}
