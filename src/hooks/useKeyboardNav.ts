/**
 * Small keyboard helpers. `useHotkey` binds a global shortcut; the predicate keeps
 * the call sites declarative (e.g. Cmd/Ctrl+K to open search).
 */

import { useEffect } from 'react';

type Predicate = (e: KeyboardEvent) => boolean;

export function useHotkey(matches: Predicate, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (matches(e)) handler(e);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [matches, handler]);
}

/** Cmd+K (mac) / Ctrl+K (win/linux). */
export const isCmdK: Predicate = (e) =>
  (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';

/** Forward-slash quick-open when not typing in a field. */
export const isSlash: Predicate = (e) => {
  if (e.key !== '/') return false;
  const t = e.target as HTMLElement | null;
  const tag = t?.tagName;
  return tag !== 'INPUT' && tag !== 'TEXTAREA' && !t?.isContentEditable;
};
