import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { useDocs } from '../../context/DocsProvider';
import { resolveContentLoader } from '../../data/registry';
import { useDocMeta } from '../../hooks/useDocMeta';
import { useToc } from '../../hooks/useToc';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';
import { TableOfContents } from '../layout/TableOfContents';
import { Callout } from './Callout';

interface ContentState {
  Comp: ComponentType | null;
  loading: boolean;
  error: Error | null;
}

export function DocRenderer() {
  const { pkg, section, resolvedVersion, versionParam, isAlias, packageData, hrefFor } =
    useDocs();
  const contentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ContentState>({
    Comp: null,
    loading: true,
    error: null,
  });

  useDocMeta(
    `${section.title} · ${pkg.displayName} ${versionParam} · Docs`,
    section.description,
  );

  // Load the section content module for the active package/version/section.
  useEffect(() => {
    let alive = true;
    setState({ Comp: null, loading: true, error: null });
    const loader = resolveContentLoader(pkg, resolvedVersion, section.id);
    if (!loader) {
      setState({ Comp: null, loading: false, error: new Error('Content not found') });
      return;
    }
    loader()
      .then((mod) => alive && setState({ Comp: mod.default, loading: false, error: null }))
      .catch(
        (error: unknown) =>
          alive &&
          setState({
            Comp: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }),
      );
    return () => {
      alive = false;
    };
  }, [pkg, resolvedVersion, section.id]);

  // Scroll to top on section change (anchor links handled by the browser).
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0 });
  }, [section.id]);

  const { headings, activeId } = useToc(
    contentRef,
    `${section.id}:${state.Comp ? 'ready' : 'loading'}`,
  );

  const sections = pkg.sections;
  const index = sections.findIndex((s) => s.id === section.id);
  const prev = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  const isOutdated =
    !isAlias &&
    packageData?.latestStable != null &&
    resolvedVersion !== packageData.latestStable &&
    !packageData.versions.find((v) => v.version === resolvedVersion)?.isPrerelease;

  const Comp = state.Comp;

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="min-w-0">
        {isOutdated && (
          <Callout type="warning" title="Older version">
            You're viewing docs for{' '}
            <span className="font-mono">{resolvedVersion}</span>. The latest stable
            release is{' '}
            <Link
              to={`/docs/${pkg.id}/latest/${section.id}`}
              className="font-mono underline hover:text-white"
            >
              {packageData?.latestStable}
            </Link>
            .
          </Callout>
        )}

        <div ref={contentRef} className="doc-prose">
          {state.loading && <Spinner label="Loading…" />}
          {state.error && (
            <ErrorState
              title="Couldn't load this page"
              message={state.error.message}
            />
          )}
          {Comp && <Comp />}
        </div>

        {/* Footer: edit link + prev/next */}
        <div className="mt-12 border-t border-zinc-800 pt-6">
          <a
            href={`https://github.com/${pkg.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <Pencil size={14} />
            Edit this page on GitHub
          </a>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                to={hrefFor(prev.id)}
                className="group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
              >
                <ArrowLeft size={18} className="text-zinc-500 group-hover:text-blue-400" />
                <span>
                  <span className="block text-xs text-zinc-500">Previous</span>
                  <span className="block font-medium text-white">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={hrefFor(next.id)}
                className="group flex items-center justify-end gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-right transition-colors hover:border-zinc-700 sm:col-start-2"
              >
                <span>
                  <span className="block text-xs text-zinc-500">Next</span>
                  <span className="block font-medium text-white">{next.title}</span>
                </span>
                <ArrowRight size={18} className="text-zinc-500 group-hover:text-blue-400" />
              </Link>
            )}
          </div>
        </div>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents headings={headings} activeId={activeId} />
        </div>
      </aside>
    </div>
  );
}
