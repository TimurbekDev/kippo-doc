import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SearchDialog } from './SearchDialog';
import { DocRenderer } from '../docs/DocRenderer';
import { useHotkey, isCmdK, isSlash } from '../../hooks/useKeyboardNav';

export function DocsLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useHotkey(
    isCmdK,
    useCallback((e: KeyboardEvent) => {
      e.preventDefault();
      setSearchOpen((v) => !v);
    }, []),
  );
  useHotkey(
    isSlash,
    useCallback((e: KeyboardEvent) => {
      e.preventDefault();
      setSearchOpen(true);
    }, []),
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar isOpen={menuOpen} onClose={closeMenu} onOpenSearch={openSearch} />

      <main className="min-w-0 flex-1">
        <TopBar onOpenMenu={() => setMenuOpen(true)} onOpenSearch={openSearch} />
        <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-12" key={location.pathname}>
          <DocRenderer />
        </div>
      </main>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
