/**
 * Minimal, dependency-free semver utilities tailored to NuGet version strings.
 *
 * NuGet versions look like `1.0.6`, `2.0.0-preview.3`, `1.2.3.4` (4-part), etc.
 * We only need: parse, compare, sort, prerelease detection, and a small subset of
 * range matching (`*`, `>=x.y.z`, `>x`, `<=x`, `<x`, `^x`, `~x`, exact) so the docs
 * content registry can declare `appliesTo` ranges.
 */

export interface ParsedVersion {
  /** Numeric release identifiers (NuGet allows up to 4: major.minor.patch.revision). */
  release: number[];
  /** Dot-separated prerelease identifiers, empty when stable. */
  prerelease: string[];
  /** Original string, untouched. */
  raw: string;
}

/** Parse a NuGet/semver version string. Tolerant of build metadata (`+...`) and 4-part versions. */
export function parse(version: string): ParsedVersion {
  const raw = version.trim();
  const noBuild = raw.split('+')[0];
  const [core, pre = ''] = noBuild.split('-', 2);
  const release = core
    .split('.')
    .map((n) => Number.parseInt(n, 10))
    .map((n) => (Number.isNaN(n) ? 0 : n));
  const prerelease = pre ? pre.split('.') : [];
  return { release, prerelease, raw };
}

/** True when the version carries a prerelease tag (e.g. `-preview`, `-beta.1`). */
export function isPrerelease(version: string): boolean {
  return parse(version).prerelease.length > 0;
}

function compareRelease(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

function comparePrerelease(a: string[], b: string[]): number {
  // Per semver: a version WITH prerelease is lower than the same WITHOUT.
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;

  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ai = a[i];
    const bi = b[i];
    if (ai === undefined) return -1;
    if (bi === undefined) return 1;
    const an = /^\d+$/.test(ai);
    const bn = /^\d+$/.test(bi);
    if (an && bn) {
      const diff = Number(ai) - Number(bi);
      if (diff !== 0) return diff < 0 ? -1 : 1;
    } else if (an) {
      return -1; // numeric identifiers are lower than alphanumeric
    } else if (bn) {
      return 1;
    } else if (ai !== bi) {
      return ai < bi ? -1 : 1;
    }
  }
  return 0;
}

/** Compare two versions: -1 if a<b, 0 if equal, 1 if a>b. */
export function compare(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  const rel = compareRelease(pa.release, pb.release);
  if (rel !== 0) return rel;
  return comparePrerelease(pa.prerelease, pb.prerelease);
}

/** Newest-first sort. Returns a new array. */
export function sortDesc(versions: string[]): string[] {
  return [...versions].sort((a, b) => compare(b, a));
}

/** Oldest-first sort. Returns a new array. */
export function sortAsc(versions: string[]): string[] {
  return [...versions].sort(compare);
}

/** Highest stable version, or highest overall when no stable exists. */
export function latestStable(versions: string[]): string | undefined {
  const stable = versions.filter((v) => !isPrerelease(v));
  const pool = stable.length > 0 ? stable : versions;
  return sortDesc(pool)[0];
}

/**
 * Does `version` satisfy `range`?
 * Supported: `*`/`latest`/`stable` (any), `>=`, `>`, `<=`, `<`, `=`, `^`, `~`, and bare exact.
 */
export function satisfies(version: string, range: string): boolean {
  const r = range.trim();
  if (r === '' || r === '*' || r === 'latest' || r === 'stable') return true;

  const m = r.match(/^(>=|<=|>|<|=|\^|~)?\s*(.+)$/);
  if (!m) return false;
  const op = m[1] ?? '=';
  const target = m[2].trim();
  const cmp = compare(version, target);

  switch (op) {
    case '>':
      return cmp > 0;
    case '>=':
      return cmp >= 0;
    case '<':
      return cmp < 0;
    case '<=':
      return cmp <= 0;
    case '=':
      return cmp === 0;
    case '^': {
      // Caret: >= target, same left-most non-zero component.
      if (cmp < 0) return false;
      const t = parse(target).release;
      const v = parse(version).release;
      const idx = t.findIndex((n) => n !== 0);
      const lead = idx === -1 ? 0 : idx;
      return (v[lead] ?? 0) === (t[lead] ?? 0);
    }
    case '~': {
      // Tilde: >= target, same major.minor.
      if (cmp < 0) return false;
      const t = parse(target).release;
      const v = parse(version).release;
      return (v[0] ?? 0) === (t[0] ?? 0) && (v[1] ?? 0) === (t[1] ?? 0);
    }
    default:
      return false;
  }
}
