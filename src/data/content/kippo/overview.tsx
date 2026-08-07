import { Link } from 'react-router-dom';
import {
  Zap,
  Database,
  Layers,
  Keyboard,
  Rocket,
  Package,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { CodeBlock } from '../../../components/docs/CodeBlock';
import { FeatureGrid } from '../../../components/docs/FeatureGrid';
import { useDocs } from '../../../context/DocsProvider';

const features = [
  {
    icon: <Zap className="text-yellow-500" size={22} />,
    title: 'Attribute-Based Routing',
    description:
      'Define handlers with [Command], [Text], and [CallbackQuery]. No complex configuration.',
  },
  {
    icon: <Database className="text-green-500" size={22} />,
    title: 'Session Management',
    description:
      'Track user state and data across conversations, with typed state helpers and TTL/LRU eviction.',
  },
  {
    icon: <Layers className="text-purple-500" size={22} />,
    title: 'Middleware Pipeline',
    description: 'Add logging, authentication, rate limiting, or any custom behavior.',
  },
  {
    icon: <Keyboard className="text-blue-500" size={22} />,
    title: 'Keyboard Builders',
    description: 'Fluent API for reply and inline keyboards with minimal code.',
  },
  {
    icon: <Briefcase className="text-teal-500" size={22} />,
    title: 'Telegram Business',
    description:
      'Answer customers of a connected Business account with [BusinessMessage] — replies go out as the account.',
  },
  {
    icon: <Rocket className="text-red-500" size={22} />,
    title: 'ASP.NET Core Integration',
    description: 'Seamless dependency injection, hosting, and configuration.',
  },
  {
    icon: <Package className="text-cyan-500" size={22} />,
    title: 'Production Ready',
    description: 'Thread-safe sessions, automatic scoping, and robust error handling.',
  },
];

const quickExample = `public class MyHandler : BotUpdateHandler
{
    [Command("start")]
    public async Task Start(Context context)
    {
        await context.Reply("Hello! Welcome to my bot!");
    }
}

// Program.cs
builder.Services.AddKippo<MyHandler>(builder.Configuration);`;

export default function Overview() {
  const { hrefFor, resolvedVersion } = useDocs();

  return (
    <>
      <h1>Kippo Overview</h1>
      <p className="lead">
        Kippo is a lightweight, attribute-based framework for building Telegram bots in
        .NET, with session management, middleware, and intuitive routing. You're viewing
        version <code>{resolvedVersion}</code>.
      </p>

      <h2>Quick example</h2>
      <p>Get a Telegram bot running with a single handler:</p>
      <CodeBlock code={quickExample} language="csharp" filename="MyHandler.cs" />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={hrefFor('getting-started')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Get started <ArrowRight size={18} />
        </Link>
        <Link
          to={hrefFor('installation')}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          <Package size={18} /> Installation
        </Link>
      </div>

      <h2>Why Kippo?</h2>
      <FeatureGrid features={features} />
    </>
  );
}
