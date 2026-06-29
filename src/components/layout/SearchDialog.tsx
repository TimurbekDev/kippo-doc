import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, FileText } from 'lucide-react';
import { search, type SearchResult } from '../../lib/search';
import { useDocs } from '../../context/DocsProvider';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const { pkg, versionParam } = useDocs();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => (open ? search(query) : []), [query, open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const go = (r: SearchResult) => {
    const version = r.packageId === pkg.id ? versionParam : 'latest';
    navigate(`/docs/${r.packageId}/${version}/${r.sectionId}`);
    onClose();
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
          <Search size={18} className="shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search documentation…"
            className="w-full bg-transparent py-4 text-sm text-white placeholder-zinc-500 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query && results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">
              No results for “{query}”.
            </p>
          )}
          {!query && (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">
              Search sections, topics, and API references.
            </p>
          )}
          <ul>
            {results.map((r, i) => (
              <li key={`${r.packageId}/${r.sectionId}`}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${
                    i === active ? 'bg-blue-500/10' : 'hover:bg-zinc-800/60'
                  }`}
                >
                  <FileText
                    size={16}
                    className={i === active ? 'text-blue-400' : 'text-zinc-500'}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${i === active ? 'text-white' : 'text-zinc-200'}`}>
                      {r.title}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {r.packageName} · {r.group} — {r.description}
                    </p>
                  </div>
                  {i === active && (
                    <CornerDownLeft size={14} className="shrink-0 text-zinc-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
