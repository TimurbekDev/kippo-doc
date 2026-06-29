/**
 * Client-side documentation search. The index is built from the registry metadata
 * only (titles / descriptions / keywords) so it is instant and pulls in zero content
 * chunks. Results are ranked: title hits beat keyword hits beat description hits.
 */

import { PACKAGES } from '../data/registry';

export interface SearchEntry {
  packageId: string;
  packageName: string;
  sectionId: string;
  title: string;
  group: string;
  description: string;
  keywords: string[];
  /** Pre-lowercased blob for cheap substring scans. */
  haystack: string;
}

export interface SearchResult extends SearchEntry {
  score: number;
}

let cachedIndex: SearchEntry[] | null = null;

export function buildIndex(): SearchEntry[] {
  if (cachedIndex) return cachedIndex;
  const entries: SearchEntry[] = [];
  for (const pkg of PACKAGES) {
    for (const section of pkg.sections) {
      const keywords = section.keywords ?? [];
      entries.push({
        packageId: pkg.id,
        packageName: pkg.displayName,
        sectionId: section.id,
        title: section.title,
        group: section.group,
        description: section.description,
        keywords,
        haystack: [
          pkg.displayName,
          section.title,
          section.group,
          section.description,
          ...keywords,
        ]
          .join(' ')
          .toLowerCase(),
      });
    }
  }
  cachedIndex = entries;
  return entries;
}

function scoreEntry(entry: SearchEntry, q: string): number {
  const title = entry.title.toLowerCase();
  if (title === q) return 1000;
  if (title.startsWith(q)) return 600;
  if (title.includes(q)) return 400;

  if (entry.keywords.some((k) => k.toLowerCase() === q)) return 350;
  if (entry.keywords.some((k) => k.toLowerCase().includes(q))) return 200;

  if (entry.packageName.toLowerCase().includes(q)) return 150;
  if (entry.description.toLowerCase().includes(q)) return 120;

  // Multi-word: require every token to appear somewhere.
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => entry.haystack.includes(t))) return 90;

  if (entry.haystack.includes(q)) return 60;
  return 0;
}

export function search(query: string, limit = 12): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildIndex();
  const results: SearchResult[] = [];
  for (const entry of index) {
    const score = scoreEntry(entry, q);
    if (score > 0) results.push({ ...entry, score });
  }
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return results.slice(0, limit);
}
