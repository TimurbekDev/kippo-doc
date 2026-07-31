/**
 * Documentation registry — the single source of truth for packages, navigation,
 * and which content module renders each section.
 *
 * Adding a package  -> push a new `PackageDef`.
 * Adding a section  -> drop `content/<pkg>/<id>.tsx` and add a `DocSection` entry.
 *
 * Section content modules are discovered with Vite's `import.meta.glob`, so the
 * registry never hard-imports a page; it just maps a section id to a lazy loader.
 * All human-readable metadata (title/description/keywords) lives here, which keeps
 * search and SEO instant without loading any content chunk.
 */

import type { ComponentType } from 'react';
import { satisfies } from '../lib/semver';

export interface SectionModule {
  default: ComponentType;
}

export interface DocSection {
  /** URL slug + content filename (`content/<pkg>/<id>.tsx`). */
  id: string;
  /** Sidebar / breadcrumb label. */
  title: string;
  /** Sidebar group heading. */
  group: string;
  /** Lucide icon name (resolved in the Sidebar). */
  icon?: string;
  /** When set, rendered indented under this section id in the sidebar. */
  parent?: string;
  /** One-line summary used for SEO meta + search. */
  description: string;
  /** Extra search terms. */
  keywords?: string[];
}

export interface ContentSet {
  /** Semver range this content applies to (see lib/semver `satisfies`). */
  appliesTo: string;
  /** Map of section id -> lazy module loader. */
  modules: Record<string, () => Promise<SectionModule>>;
}

export interface PackageDef {
  /** URL segment + display id. */
  id: string;
  displayName: string;
  /** NuGet package id used for API calls. */
  nugetId: string;
  /** GitHub repo "owner/name" for edit links + contributor stats. */
  repo: string;
  description: string;
  /** Ordered navigation. */
  sections: DocSection[];
  /** Version-gated content. First matching set (by registry order) wins. */
  contentSets: ContentSet[];
}

/** Eager-discovered lazy loaders for every Kippo content module. */
const kippoModules = import.meta.glob<SectionModule>('./content/kippo/*.tsx');

function kippoLoader(id: string): () => Promise<SectionModule> {
  const key = `./content/kippo/${id}.tsx`;
  const loader = kippoModules[key];
  if (!loader) {
    return () =>
      Promise.reject(new Error(`Missing content module for section "${id}" (${key})`));
  }
  return loader;
}

const KIPPO_SECTIONS: DocSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    group: 'Getting Started',
    icon: 'Home',
    description: 'What Kippo is and why to use it for building Telegram bots in C# and .NET.',
    keywords: ['intro', 'introduction', 'about', 'features', 'telegram bot c#', 'telegram bot dotnet'],
  },
  {
    id: 'installation',
    title: 'Installation',
    group: 'Getting Started',
    icon: 'Package',
    description: 'Install the Kippo NuGet package via CLI, Package Manager, or PackageReference.',
    keywords: ['install', 'nuget', 'dotnet add package', 'setup'],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    group: 'Getting Started',
    icon: 'Rocket',
    description: 'Build and run your first Kippo Telegram bot in C# in under five minutes.',
    keywords: ['quick start', 'tutorial', 'first bot', 'botfather', 'token', 'c# telegram bot tutorial'],
  },
  {
    id: 'routing',
    title: 'Routing',
    group: 'Usage',
    icon: 'Command',
    description: 'Attribute-based routing of Telegram updates to handler methods.',
    keywords: ['router', 'attributes', 'handlers', 'dispatch'],
  },
  {
    id: 'routing-commands',
    title: 'Commands',
    group: 'Usage',
    parent: 'routing',
    description: 'Handle slash commands like /start and /help with the [Command] attribute.',
    keywords: ['command', 'slash', 'start', 'help'],
  },
  {
    id: 'routing-text',
    title: 'Text Messages',
    group: 'Usage',
    parent: 'routing',
    description: 'Match plain text messages and patterns with the [Text] attribute.',
    keywords: ['text', 'pattern', 'message', 'regex'],
  },
  {
    id: 'routing-callbacks',
    title: 'Callback Queries',
    group: 'Usage',
    parent: 'routing',
    description: 'Respond to inline keyboard button presses with [CallbackQuery].',
    keywords: ['callback', 'inline', 'button', 'query'],
  },
  {
    id: 'routing-chat-members',
    title: 'Chat Members',
    group: 'Usage',
    parent: 'routing',
    description: 'React to joins, leaves, bans and promotions with the [ChatMember] attribute.',
    keywords: ['chat member', 'ChatMember', 'join', 'leave', 'kick', 'ban', 'promote', 'admin', 'welcome', 'my_chat_member'],
  },
  {
    id: 'routing-contacts',
    title: 'Contacts',
    group: 'Usage',
    parent: 'routing',
    description: 'Receive shared phone numbers with the [Contact] attribute.',
    keywords: ['contact', 'phone', 'phone number', 'share contact', 'ContactButton', 'verification'],
  },
  {
    id: 'routing-fallback',
    title: 'Fallback',
    group: 'Usage',
    parent: 'routing',
    description: 'Catch updates that match no other handler with the [Fallback] attribute.',
    keywords: ['fallback', 'catch-all', 'unknown', 'default', 'unmatched'],
  },
  {
    id: 'routing-scenes',
    title: 'Scenes',
    group: 'Usage',
    parent: 'routing',
    description: 'Route a whole multi-step dialog to one method with the [Scene] attribute.',
    keywords: ['scene', 'Scene attribute', 'dialog', 'conversation', 'EnterScene', 'wizard'],
  },
  {
    id: 'context',
    title: 'Context API',
    group: 'Usage',
    icon: 'Code2',
    description: 'The Context object: replying, accessing the update, and bot client.',
    keywords: ['context', 'reply', 'update', 'message', 'client'],
  },
  {
    id: 'keyboards',
    title: 'Keyboards',
    group: 'Usage',
    icon: 'Keyboard',
    description: 'Build reply and inline keyboards with the fluent keyboard builders.',
    keywords: ['keyboard', 'reply', 'inline', 'buttons', 'builder'],
  },
  {
    id: 'callback-vault',
    title: 'Callback Vault',
    group: 'Usage',
    icon: 'Vault',
    description: 'Attach large typed payloads to inline buttons, past Telegram\'s 64-byte callback limit.',
    keywords: ['callback', 'vault', 'payload', '64 bytes', 'callback_data', 'inline', 'token', 'ICallbackStore'],
  },
  {
    id: 'sessions',
    title: 'Sessions',
    group: 'Usage',
    icon: 'Database',
    description: 'Track per-user state and data across messages with built-in sessions.',
    keywords: ['session', 'state', 'storage', 'conversation'],
  },
  {
    id: 'scenes',
    title: 'Scenes & Conversations',
    group: 'Usage',
    icon: 'Workflow',
    description: 'Write multi-step dialogs as linear code with await ctx.Ask() — resumable and typed.',
    keywords: ['scene', 'conversation', 'wizard', 'dialog', 'flow', 'ask', 'multi-step', 'form', 'SceneContext', 'AskChoices', 'buttons', 'enum buttons', 'inline keyboard question'],
  },
  {
    id: 'middleware',
    title: 'Middleware',
    group: 'Usage',
    icon: 'Layers',
    description: 'Add cross-cutting behavior with the middleware pipeline.',
    keywords: ['middleware', 'pipeline', 'logging', 'auth', 'rate limit'],
  },
  {
    id: 'flood-control',
    title: 'Flood Control',
    group: 'Usage',
    icon: 'Gauge',
    description: 'Survive Telegram\'s 429 rate limits with automatic retry and per-chat throttling.',
    keywords: ['flood', 'rate limit', '429', 'retry', 'retry_after', 'throttle', 'ThrottlingBotClient'],
  },
  {
    id: 'dependency-injection',
    title: 'Dependency Injection',
    group: 'Usage',
    icon: 'Zap',
    description: 'Inject services into handlers via ASP.NET Core dependency injection.',
    keywords: ['di', 'dependency injection', 'services', 'scoped'],
  },
  {
    id: 'configuration',
    title: 'Configuration',
    group: 'Usage',
    icon: 'Settings',
    description: 'Configure Kippo via appsettings.json and options.',
    keywords: ['configuration', 'appsettings', 'options', 'token'],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    group: 'Usage',
    icon: 'Webhook',
    description: 'Receive updates over HTTP with MapKippoWebhook — production and serverless deployments.',
    keywords: ['webhook', 'MapKippoWebhook', 'setWebhook', 'http', 'production', 'polling', 'secret token', 'deploy'],
  },
  {
    id: 'testing',
    title: 'Testing',
    group: 'Usage',
    icon: 'FlaskConical',
    description: 'Unit-test handlers with fake updates using TestBot — no bot token or network.',
    keywords: ['testing', 'test', 'unit test', 'TestBot', 'mock', 'RecordingBotClient', 'xunit'],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    group: 'Reference',
    icon: 'BookOpen',
    description: 'Reference for Kippo attributes, the Context type, and keyboard builders.',
    keywords: ['api', 'reference', 'attributes', 'types', 'members'],
  },
  {
    id: 'examples',
    title: 'Examples',
    group: 'Reference',
    icon: 'MessageSquare',
    description: 'Complete, copy-paste bot examples built with Kippo.',
    keywords: ['examples', 'samples', 'echo bot', 'menu'],
  },
  {
    id: 'changelog',
    title: 'Changelog',
    group: 'Reference',
    icon: 'History',
    description: 'Release history and version notes pulled live from NuGet.',
    keywords: ['changelog', 'releases', 'versions', 'history'],
  },
];

export const PACKAGES: PackageDef[] = [
  {
    id: 'Kippo',
    displayName: 'Kippo',
    nugetId: 'Kippo',
    repo: 'TimurbekDev/KippoGramm',
    description:
      'A lightweight, attribute-based framework for building Telegram bots in .NET.',
    sections: KIPPO_SECTIONS,
    contentSets: [
      {
        // Single shared content set for all current versions. Future v2 docs:
        // add another ContentSet with appliesTo '>=2.0.0' before this one.
        appliesTo: '*',
        modules: Object.fromEntries(
          KIPPO_SECTIONS.map((s) => [s.id, kippoLoader(s.id)]),
        ),
      },
    ],
  },
];

export const DEFAULT_PACKAGE = PACKAGES[0];

export function getPackage(id: string | undefined): PackageDef | undefined {
  if (!id) return undefined;
  return PACKAGES.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function getSection(
  pkg: PackageDef,
  sectionId: string | undefined,
): DocSection | undefined {
  if (!sectionId) return undefined;
  return pkg.sections.find((s) => s.id === sectionId);
}

/** Resolve the content loader for a section at a given version via `appliesTo`. */
export function resolveContentLoader(
  pkg: PackageDef,
  version: string,
  sectionId: string,
): (() => Promise<SectionModule>) | undefined {
  // Lazy import to avoid a cycle at module-eval time.
  return resolveSet(pkg, version)?.modules[sectionId];
}

function resolveSet(pkg: PackageDef, version: string): ContentSet | undefined {
  return (
    pkg.contentSets.find((set) => safeSatisfies(version, set.appliesTo)) ??
    pkg.contentSets[0]
  );
}

function safeSatisfies(version: string, range: string): boolean {
  try {
    return satisfies(version, range);
  } catch {
    return false;
  }
}

/** Ordered, grouped sections for sidebar rendering. */
export function groupedSections(pkg: PackageDef): { group: string; items: DocSection[] }[] {
  const groups: { group: string; items: DocSection[] }[] = [];
  for (const section of pkg.sections) {
    let bucket = groups.find((g) => g.group === section.group);
    if (!bucket) {
      bucket = { group: section.group, items: [] };
      groups.push(bucket);
    }
    bucket.items.push(section);
  }
  return groups;
}
