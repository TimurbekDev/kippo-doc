import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink, Search, X, Github } from 'lucide-react';
import { useDocs } from '../../context/DocsProvider';
import { groupedSections, type DocSection } from '../../data/registry';
import { SectionIcon } from './icons';
import { VersionSelector } from './VersionSelector';
import { PackageSelector } from './PackageSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function Sidebar({ isOpen, onClose, onOpenSearch }: SidebarProps) {
  const { pkg, section, hrefFor, packageData, versionParam, resolvedVersion } = useDocs();

  const groups = useMemo(() => groupedSections(pkg), [pkg]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (group: string) =>
    setCollapsed((c) => ({ ...c, [group]: !c[group] }));

  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 z-50 h-screen w-72 overflow-y-auto border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group flex items-center gap-3" onClick={onClose}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                <span className="text-lg font-bold text-white">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white transition-colors group-hover:text-blue-400">
                  {pkg.displayName}
                </h1>
                <p className="font-mono text-[11px] text-zinc-500">
                  {versionParam === resolvedVersion ? versionParam : resolvedVersion}
                </p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <PackageSelector />
          <VersionSelector />

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
          >
            <Search size={15} />
            <span className="flex-1 text-left">Search docs…</span>
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>
        </div>

        <nav className="px-2 pb-8">
          {groups.map((group) => {
            const topLevel = group.items.filter((s) => !s.parent);
            const isCollapsed = collapsed[group.group];
            return (
              <div key={group.group} className="mb-2">
                <button
                  onClick={() => toggle(group.group)}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
                >
                  {group.group}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>

                {!isCollapsed && (
                  <ul className="space-y-0.5">
                    {topLevel.map((item) => {
                      const children = group.items.filter((s) => s.parent === item.id);
                      return (
                        <NavItem
                          key={item.id}
                          item={item}
                          children_={children}
                          activeId={section.id}
                          hrefFor={hrefFor}
                          onClose={onClose}
                        />
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="mt-6 border-t border-zinc-800 px-1 pt-4">
            <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Resources
            </h3>
            <ResourceLink
              href={`https://www.nuget.org/packages/${pkg.nugetId}`}
              label="NuGet Package"
              icon={<ExternalLink size={16} />}
            />
            <ResourceLink
              href={`https://github.com/${pkg.repo}`}
              label="GitHub"
              icon={<Github size={16} />}
            />
            <Link
              to="/contributors"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
            >
              <ExternalLink size={16} />
              Contributors & Stats
            </Link>
            {packageData && (
              <p className="px-3 pt-3 text-xs text-zinc-600">
                {packageData.totalDownloads.toLocaleString()} total downloads
              </p>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavItem({
  item,
  children_,
  activeId,
  hrefFor,
  onClose,
}: {
  item: DocSection;
  children_: DocSection[];
  activeId: string;
  hrefFor: (id: string) => string;
  onClose: () => void;
}) {
  const active = activeId === item.id;
  return (
    <li>
      <Link
        to={hrefFor(item.id)}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          active
            ? 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
        }`}
      >
        <SectionIcon name={item.icon} />
        {item.title}
      </Link>
      {children_.length > 0 && (
        <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-3">
          {children_.map((child) => (
            <li key={child.id}>
              <Link
                to={hrefFor(child.id)}
                onClick={onClose}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                  activeId === child.id
                    ? 'text-blue-400'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ResourceLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}
