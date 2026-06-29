/**
 * Table-of-contents + scroll-spy. Scans `<h2>`/`<h3>` inside a container, auto-assigns
 * slug ids to any heading missing one (so anchor links work without authoring ids),
 * and tracks the heading currently in view.
 */

import { useEffect, useState, type RefObject } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64);
}

export function useToc<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  /** Change this (e.g. section id) to force a re-scan when content swaps. */
  contentKey: string,
): { headings: TocHeading[]; activeId: string } {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLHeadingElement>('h2, h3'),
    );
    const seen = new Set<string>();
    const found: TocHeading[] = nodes.map((node) => {
      const text = node.textContent ?? '';
      let id = node.id || slugify(text);
      while (seen.has(id)) id = `${id}-1`;
      seen.add(id);
      if (!node.id) node.id = id;
      node.style.scrollMarginTop = '6rem';
      return { id, text, depth: node.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(found);
    setActiveId(found[0]?.id ?? '');

    if (found.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: [0, 1] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [containerRef, contentKey]);

  return { headings, activeId };
}
