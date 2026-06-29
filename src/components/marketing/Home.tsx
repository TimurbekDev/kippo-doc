import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  Github,
  CheckCircle2,
  Download,
  Tag,
  Boxes,
  BookOpen,
} from 'lucide-react';
import { CodeBlock } from '../docs/CodeBlock';
import { FeatureGrid, type Feature } from '../docs/FeatureGrid';
import { DEFAULT_PACKAGE } from '../../data/registry';
import { usePackageData } from '../../hooks/useNuget';
import { useDocMeta } from '../../hooks/useDocMeta';
import {
  Zap,
  Database,
  Layers,
  Keyboard,
  Rocket,
  Package as PackageIcon,
} from 'lucide-react';

const features: Feature[] = [
  {
    icon: <Zap className="text-yellow-500" size={22} />,
    title: 'Attribute-Based Routing',
    description: 'Define handlers with [Command], [Text], and [CallbackQuery].',
  },
  {
    icon: <Database className="text-green-500" size={22} />,
    title: 'Session Management',
    description: 'Track user state and data across conversations automatically.',
  },
  {
    icon: <Layers className="text-purple-500" size={22} />,
    title: 'Middleware Pipeline',
    description: 'Add logging, authentication, and rate limiting with ease.',
  },
  {
    icon: <Keyboard className="text-blue-500" size={22} />,
    title: 'Keyboard Builders',
    description: 'Fluent API for reply and inline keyboards.',
  },
  {
    icon: <Rocket className="text-red-500" size={22} />,
    title: 'ASP.NET Core Native',
    description: 'Dependency injection, hosting, and configuration built in.',
  },
  {
    icon: <PackageIcon className="text-cyan-500" size={22} />,
    title: 'Production Ready',
    description: 'Thread-safe sessions and robust error handling.',
  },
];

const exampleCode = `public class MyHandler : BotUpdateHandler
{
    [Command("start")]
    public async Task Start(Context context)
    {
        await context.Reply("Hello! Welcome to my bot!");
    }
}

// Program.cs
builder.Services.AddKippo<MyHandler>(builder.Configuration);`;

const docsHome = `/docs/${DEFAULT_PACKAGE.id}/latest/${DEFAULT_PACKAGE.sections[0].id}`;

export function Home() {
  const { data } = usePackageData(DEFAULT_PACKAGE.nugetId);
  useDocMeta(
    'Kippo — Telegram Bot Framework for .NET',
    DEFAULT_PACKAGE.description,
  );

  const latest = data?.latestStable ?? data?.latest;
  const versionCount = data?.versions.length ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 font-bold text-white">
              K
            </div>
            <span className="text-lg font-bold">Kippo</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to={docsHome}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Docs
            </Link>
            <Link
              to="/contributors"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white sm:block"
            >
              Contributors
            </Link>
            <a
              href={`https://github.com/${DEFAULT_PACKAGE.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            {latest ? `Version ${latest} available` : 'Now on NuGet'}
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Build Telegram Bots
            <br />
            <span className="bg-linear-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent">
              with Elegance
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            {DEFAULT_PACKAGE.description} Attribute-based routing, sessions, middleware, and
            keyboard builders — all native to ASP.NET Core.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={docsHome}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <a
              href={`https://www.nuget.org/packages/${DEFAULT_PACKAGE.nugetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-700 sm:w-auto"
            >
              <Package size={18} /> NuGet Package
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> .NET 8, 9, 10
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> MIT License
            </span>
            {data && (
              <span className="flex items-center gap-2">
                <Download size={16} className="text-green-500" />
                {data.totalDownloads.toLocaleString()} downloads
              </span>
            )}
          </div>
        </section>

        {/* Live stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Download className="text-blue-400" size={20} />}
            label="Total downloads"
            value={data ? data.totalDownloads.toLocaleString() : '—'}
          />
          <StatCard
            icon={<Tag className="text-purple-400" size={20} />}
            label="Latest version"
            value={latest ?? '—'}
          />
          <StatCard
            icon={<Boxes className="text-green-400" size={20} />}
            label="Published versions"
            value={versionCount ? String(versionCount) : '—'}
          />
        </section>

        {/* Quick example */}
        <section className="py-16">
          <h2 className="mb-4 text-2xl font-bold">Quick example</h2>
          <p className="mb-6 text-zinc-400">A working bot handler in just a few lines:</p>
          <CodeBlock code={exampleCode} language="csharp" filename="MyHandler.cs" />
        </section>

        {/* Features */}
        <section className="pb-16">
          <h2 className="mb-8 text-2xl font-bold">Why Kippo?</h2>
          <FeatureGrid features={features} columns={3} />
        </section>

        {/* Install */}
        <section className="pb-16">
          <h2 className="mb-4 text-2xl font-bold">Install in seconds</h2>
          <CodeBlock
            code={`dotnet add package ${DEFAULT_PACKAGE.nugetId}`}
            language="bash"
            filename="Terminal"
          />
        </section>

        {/* CTA */}
        <section className="mb-20 rounded-2xl border border-blue-500/20 bg-linear-to-br from-blue-500/10 to-purple-500/10 px-6 py-12 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to build your bot?</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Follow the step-by-step guide and have a Telegram bot running in under five
            minutes.
          </p>
          <Link
            to={docsHome}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-purple-700"
          >
            <BookOpen size={18} /> Read the docs
          </Link>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-zinc-400">{label}</h3>
      </div>
      <p className="font-mono text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
