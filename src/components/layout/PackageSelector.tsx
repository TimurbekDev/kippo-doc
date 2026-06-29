import { useNavigate } from 'react-router-dom';
import { Box } from 'lucide-react';
import { PACKAGES } from '../../data/registry';
import { useDocs } from '../../context/DocsProvider';

/** Renders only when more than one package is registered. */
export function PackageSelector() {
  const { pkg } = useDocs();
  const navigate = useNavigate();

  if (PACKAGES.length < 2) return null;

  return (
    <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
      <Box size={14} className="shrink-0 text-zinc-500" />
      <select
        value={pkg.id}
        onChange={(e) => navigate(`/docs/${e.target.value}/latest/${PACKAGES.find((p) => p.id === e.target.value)?.sections[0].id}`)}
        className="w-full bg-transparent text-sm text-zinc-200 outline-none"
        aria-label="Select package"
      >
        {PACKAGES.map((p) => (
          <option key={p.id} value={p.id} className="bg-zinc-900">
            {p.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
