/**
 * Single source of truth for SEO route data used by build-time tooling
 * (sitemap generation + static prerender). Mirrors the doc sections in
 * `src/data/registry.ts` — keep the section slugs in sync when adding pages.
 *
 * Kept as plain ESM (no TS) so Node can run it directly at build time without
 * a compile step.
 */

export const BASE_URL = 'https://kippo.uz';
export const PACKAGE_ID = 'Kippo';
export const SITE_NAME = 'Kippo';

/** Doc sections, in navigation order. `title`/`description` feed <title> + meta. */
export const SECTIONS = [
  { id: 'overview', title: 'Overview', description: 'What Kippo is and why to use it for building Telegram bots in C# and .NET.' },
  { id: 'installation', title: 'Installation', description: 'Install the Kippo NuGet package via CLI, Package Manager, or PackageReference.' },
  { id: 'getting-started', title: 'Getting Started', description: 'Build and run your first Kippo Telegram bot in C# in under five minutes.' },
  { id: 'routing', title: 'Routing', description: 'Attribute-based routing of Telegram updates to handler methods in .NET.' },
  { id: 'routing-commands', title: 'Commands', description: 'Handle slash commands like /start and /help with the [Command] attribute.' },
  { id: 'routing-text', title: 'Text Messages', description: 'Match plain text messages and patterns with the [Text] attribute.' },
  { id: 'routing-callbacks', title: 'Callback Queries', description: 'Respond to inline keyboard button presses with [CallbackQuery].' },
  { id: 'routing-chat-members', title: 'Chat Members', description: 'React to joins, leaves, bans and promotions with the [ChatMember] attribute.' },
  { id: 'routing-contacts', title: 'Contacts', description: 'Receive shared phone numbers with the [Contact] attribute.' },
  { id: 'routing-fallback', title: 'Fallback', description: 'Catch updates that match no other handler with the [Fallback] attribute.' },
  { id: 'routing-scenes', title: 'Scenes', description: 'Route a whole multi-step dialog to one method with the [Scene] attribute.' },
  { id: 'context', title: 'Context API', description: 'The Context object: replying, accessing the update, and bot client.' },
  { id: 'keyboards', title: 'Keyboards', description: 'Build reply and inline keyboards with the fluent keyboard builders.' },
  { id: 'callback-vault', title: 'Callback Vault', description: "Attach large typed payloads to inline buttons, past Telegram's 64-byte callback limit." },
  { id: 'sessions', title: 'Sessions', description: 'Track per-user state and data across messages with built-in sessions.' },
  { id: 'scenes', title: 'Scenes & Conversations', description: 'Write multi-step Telegram dialogs as linear C# code with await ctx.Ask().' },
  { id: 'telegram-business', title: 'Telegram Business', description: 'Answer customers of a connected Telegram Business account with [BusinessMessage] and [BusinessConnection] in C#.' },
  { id: 'middleware', title: 'Middleware', description: 'Add cross-cutting behavior with the middleware pipeline.' },
  { id: 'flood-control', title: 'Flood Control', description: "Survive Telegram's 429 rate limits with automatic retry and per-chat throttling." },
  { id: 'dependency-injection', title: 'Dependency Injection', description: 'Inject services into handlers via ASP.NET Core dependency injection.' },
  { id: 'configuration', title: 'Configuration', description: 'Configure Kippo via appsettings.json and options.' },
  { id: 'webhooks', title: 'Webhooks', description: 'Receive Telegram updates over HTTP with MapKippoWebhook — production and serverless.' },
  { id: 'testing', title: 'Testing', description: 'Unit-test handlers with fake updates using TestBot — no bot token or network.' },
  { id: 'api-reference', title: 'API Reference', description: 'Reference for Kippo attributes, the Context type, and keyboard builders.' },
  { id: 'examples', title: 'Examples', description: 'Complete, copy-paste Telegram bot examples built with Kippo in C#.' },
  { id: 'changelog', title: 'Changelog', description: 'Release history and version notes pulled live from NuGet.' },
];

/**
 * Every crawlable URL with the metadata a prerendered page needs.
 * `path` is site-root-relative (no trailing slash except home).
 */
export function routes() {
  const list = [
    {
      path: '/',
      title: 'Kippo — Telegram Bot Framework for C# & .NET',
      description:
        'Build Telegram bots in C# and .NET with Kippo — a lightweight, attribute-based framework with routing, sessions, scenes, middleware, webhooks, and testing. Free, open source, MIT.',
      priority: '1.0',
      changefreq: 'weekly',
    },
    {
      path: '/contributors',
      title: 'Contributors & Statistics — Kippo',
      description: 'Project growth statistics and the people behind Kippo.',
      priority: '0.4',
      changefreq: 'monthly',
    },
  ];

  for (const s of SECTIONS) {
    list.push({
      path: `/docs/${PACKAGE_ID}/latest/${s.id}`,
      title: `${s.title} · ${PACKAGE_ID} · Kippo Docs`,
      description: s.description,
      priority: s.id === 'overview' || s.id === 'getting-started' ? '0.9' : '0.7',
      changefreq: 'monthly',
      isDoc: true,
      heading: s.title,
    });
  }

  return list;
}
