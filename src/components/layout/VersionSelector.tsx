import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Check, Tag } from 'lucide-react';
import { useDocs } from '../../context/DocsProvider';
import { Badge } from '../common/Badge';

export function VersionSelector() {
  const { packageData, loading, versionParam, resolvedVersion, isAlias, goToVersion } =
    useDocs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const { stable, prerelease } = useMemo(() => {
    const versions = packageData?.versions ?? [];
    return {
      stable: versions.filter((v) => !v.isPrerelease).map((v) => v.version),
      prerelease: versions.filter((v) => v.isPrerelease).map((v) => v.version),
    };
  }, [packageData]);

  const label = isAlias ? `${versionParam} (${resolvedVersion})` : versionParam;

  const select = (version: string) => {
    goToVersion(version);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading && !packageData}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-700 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          <Tag size={14} className="shrink-0 text-zinc-500" />
          <span className="truncate font-mono text-xs">{loading && !packageData ? 'loading…' : label}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 max-h-80 w-full min-w-56 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl shadow-black/40"
        >
          <button
            onClick={() => select('latest')}
            className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <span className="flex items-center gap-2">
              latest
              <Badge tone="blue">newest stable</Badge>
            </span>
            {versionParam === 'latest' && <Check size={14} className="text-blue-400" />}
          </button>

          {stable.length > 0 && (
            <Group title="Stable">
              {stable.map((v) => (
                <Item
                  key={v}
                  version={v}
                  selected={versionParam === v}
                  onSelect={select}
                />
              ))}
            </Group>
          )}

          {prerelease.length > 0 && (
            <Group title="Prerelease">
              {prerelease.map((v) => (
                <Item
                  key={v}
                  version={v}
                  selected={versionParam === v}
                  onSelect={select}
                  tone="amber"
                />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-1">
      <p className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {title}
      </p>
      {children}
    </div>
  );
}

function Item({
  version,
  selected,
  onSelect,
  tone,
}: {
  version: string;
  selected: boolean;
  onSelect: (v: string) => void;
  tone?: 'amber';
}) {
  return (
    <button
      onClick={() => onSelect(version)}
      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left font-mono text-xs text-zinc-300 hover:bg-zinc-800"
    >
      <span className="flex items-center gap-2">
        {version}
        {tone === 'amber' && <Badge tone="amber">pre</Badge>}
      </span>
      {selected && <Check size={14} className="text-blue-400" />}
    </button>
  );
}
