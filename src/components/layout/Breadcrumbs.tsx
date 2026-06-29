import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocs } from '../../context/DocsProvider';

export function Breadcrumbs() {
  const { pkg, versionParam, section, hrefFor } = useDocs();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-zinc-500">
      <Link to="/" className="transition-colors hover:text-zinc-300">
        Docs
      </Link>
      <ChevronRight size={14} className="text-zinc-700" />
      <Link to={hrefFor(pkg.sections[0].id)} className="transition-colors hover:text-zinc-300">
        {pkg.displayName}
      </Link>
      <ChevronRight size={14} className="text-zinc-700" />
      <span className="font-mono text-xs text-zinc-400">{versionParam}</span>
      <ChevronRight size={14} className="text-zinc-700" />
      <span className="font-medium text-zinc-300">{section.title}</span>
    </nav>
  );
}
