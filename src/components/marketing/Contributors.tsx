import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Download,
  GitBranch,
  Users,
  TrendingUp,
  Github,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { DEFAULT_PACKAGE } from '../../data/registry';
import { usePackageData } from '../../hooks/useNuget';
import { useDocMeta } from '../../hooks/useDocMeta';
import { cached, TTL } from '../../lib/cache';
import { Spinner } from '../common/Spinner';

interface ContributorData {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

function fetchContributors(repo: string): Promise<ContributorData[]> {
  return cached(`github:contributors:${repo}`, TTL.HOUR, async () => {
    const res = await fetch(`https://api.github.com/repos/${repo}/contributors`);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as ContributorData[]).slice(0, 12) : [];
  });
}

export function Contributors() {
  const { repo, nugetId } = DEFAULT_PACKAGE;
  const { data: pkgData } = usePackageData(nugetId);
  const [contributors, setContributors] = useState<ContributorData[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);

  useDocMeta('Contributors & Statistics — Kippo', 'Project growth statistics and the people behind Kippo.');

  useEffect(() => {
    let alive = true;
    fetchContributors(repo)
      .then((list) => alive && setContributors(list))
      .catch(() => alive && setContributors([]))
      .finally(() => alive && setLoadingContributors(false));
    return () => {
      alive = false;
    };
  }, [repo]);

  const recentVersions = pkgData?.versions.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Back home
          </Link>
          <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        <section>
          <h1 className="text-3xl font-extrabold">Contributors &amp; Statistics</h1>
          <p className="mt-3 text-lg text-zinc-400">
            Meet the people building Kippo and explore the project's growth.
          </p>
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <TrendingUp className="text-green-500" size={24} /> Download statistics
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard icon={<Download className="text-blue-400" size={20} />} label="Total downloads">
              {pkgData ? pkgData.totalDownloads.toLocaleString() : '—'}
            </StatCard>
            <StatCard icon={<Package className="text-purple-400" size={20} />} label="Latest version">
              {pkgData?.latestStable ?? '—'}
            </StatCard>
            <StatCard icon={<GitBranch className="text-cyan-400" size={20} />} label="Published versions">
              {pkgData ? String(pkgData.versions.length) : '—'}
            </StatCard>
          </div>

          {recentVersions.length > 0 && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold">Recent versions</h3>
              <div className="space-y-2">
                {recentVersions.map((v) => (
                  <div
                    key={v.version}
                    className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-2"
                  >
                    <span className="font-mono text-zinc-300">{v.version}</span>
                    <span className="text-zinc-400">
                      {v.downloads != null ? `${v.downloads.toLocaleString()} downloads` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <Users className="text-blue-500" size={24} /> Contributors
          </h2>

          {loadingContributors ? (
            <Spinner label="Loading contributors…" />
          ) : contributors.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contributors.map((c) => (
                <a
                  key={c.login}
                  href={c.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <img src={c.avatar_url} alt={c.login} className="h-10 w-10 rounded-full" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white group-hover:text-blue-400">
                      {c.login}
                    </h3>
                    <p className="text-sm text-zinc-400">{c.contributions} contributions</p>
                  </div>
                  <ExternalLink size={16} className="shrink-0 text-zinc-600 group-hover:text-zinc-400" />
                </a>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-500">No contributor data available.</div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-xl font-bold">Project resources</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResourceLink
              href={`https://github.com/${repo}`}
              icon={<GitBranch className="text-zinc-400" size={20} />}
              title="GitHub repository"
              subtitle="Source code, issues, and discussions"
            />
            <ResourceLink
              href={`https://www.nuget.org/packages/${nugetId}`}
              icon={<Download className="text-zinc-400" size={20} />}
              title="NuGet package"
              subtitle="Install Kippo in your project"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-zinc-400">{label}</h3>
      </div>
      <p className="font-mono text-2xl font-bold text-white">{children}</p>
    </div>
  );
}

function ResourceLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-700/50"
    >
      {icon}
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
      <ExternalLink className="ml-auto text-zinc-500" size={16} />
    </a>
  );
}
