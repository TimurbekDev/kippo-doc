import {
  Home,
  Package,
  Rocket,
  Command,
  Code2,
  Keyboard,
  Database,
  Layers,
  Zap,
  Settings,
  BookOpen,
  MessageSquare,
  History,
  FlaskConical,
  Gauge,
  Vault,
  Workflow,
  Webhook,
  Briefcase,
  FileText,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Home,
  Package,
  Rocket,
  Command,
  Code2,
  Keyboard,
  Database,
  Layers,
  Zap,
  Settings,
  BookOpen,
  MessageSquare,
  History,
  FlaskConical,
  Gauge,
  Vault,
  Workflow,
  Webhook,
  Briefcase,
};

/** Resolve a registry icon name to a rendered Lucide icon (falls back to a doc icon). */
export function SectionIcon({ name, size = 18 }: { name?: string; size?: number }) {
  const Icon = (name && ICONS[name]) || FileText;
  return <Icon size={size} />;
}
