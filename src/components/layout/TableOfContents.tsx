import type { TocHeading } from '../../hooks/useToc';

interface TableOfContentsProps {
  headings: TocHeading[];
  activeId: string;
}

export function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        On this page
      </p>
      <ul className="space-y-1 border-l border-zinc-800">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 py-1 transition-colors ${
                h.depth === 3 ? 'pl-6' : 'pl-3'
              } ${
                activeId === h.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
