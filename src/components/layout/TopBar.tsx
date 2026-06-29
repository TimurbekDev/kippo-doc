import { Menu, Search } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface TopBarProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
}

export function TopBar({ onOpenMenu, onOpenSearch }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden min-w-0 flex-1 sm:block">
        <Breadcrumbs />
      </div>

      <button
        onClick={onOpenSearch}
        className="ml-auto flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300 lg:hidden"
        aria-label="Search"
      >
        <Search size={16} />
      </button>
    </header>
  );
}
