import { Calendar, Download, Tag } from 'lucide-react';
import { useDocs } from '../../../context/DocsProvider';
import { Spinner } from '../../../components/common/Spinner';
import { ErrorState } from '../../../components/common/ErrorState';
import { Badge } from '../../../components/common/Badge';

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Changelog() {
  const { pkg, packageData, loading, error, goToVersion } = useDocs();

  return (
    <>
      <h1>Changelog</h1>
      <p className="lead">
        Release history for {pkg.displayName}, pulled live from NuGet. Click a version to
        view its documentation.
      </p>

      {loading && <Spinner label="Loading releases from NuGet…" />}
      {error && (
        <ErrorState
          title="Couldn't load releases"
          message="The NuGet API is unavailable right now. Try again later."
        />
      )}

      {packageData && (
        <div className="mt-6 space-y-4">
          {packageData.versions.map((v) => (
            <div
              key={v.version}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => goToVersion(v.version)}
                  className="inline-flex items-center gap-2 font-mono text-lg font-semibold text-white transition-colors hover:text-blue-400"
                >
                  <Tag size={16} className="text-zinc-500" />
                  {v.version}
                </button>
                {v.isPrerelease ? (
                  <Badge tone="amber">prerelease</Badge>
                ) : v.version === packageData.latestStable ? (
                  <Badge tone="green">latest</Badge>
                ) : null}
                {v.published && (
                  <span className="inline-flex items-center gap-1 text-sm text-zinc-500">
                    <Calendar size={14} />
                    {formatDate(v.published)}
                  </span>
                )}
                {v.downloads != null && (
                  <span className="inline-flex items-center gap-1 text-sm text-zinc-500">
                    <Download size={14} />
                    {v.downloads.toLocaleString()}
                  </span>
                )}
              </div>
              {v.releaseNotes && (
                <p className="mt-3 whitespace-pre-line text-sm text-zinc-400">
                  {v.releaseNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
