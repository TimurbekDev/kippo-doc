/**
 * NuGet v3 API client. All endpoints are public and CORS-enabled, so they run
 * directly from the browser. Every call is wrapped in the TTL cache so navigating
 * around the docs never refetches.
 *
 * Endpoints:
 *  - flatcontainer index   -> list of all versions
 *  - registration5-semver2 -> per-version catalog entries (published date, deps, notes)
 *  - azuresearch query      -> download statistics
 */

import { cached, TTL } from './cache';
import { isPrerelease, latestStable, sortDesc } from './semver';

const FLATCONTAINER = 'https://api.nuget.org/v3-flatcontainer';
const REGISTRATION = 'https://api.nuget.org/v3/registration5-semver2';
const SEARCH = 'https://azuresearch-usnc.nuget.org/query';

export interface PackageDependency {
  id: string;
  range?: string;
}

export interface DependencyGroup {
  targetFramework?: string;
  dependencies: PackageDependency[];
}

export interface VersionInfo {
  version: string;
  isPrerelease: boolean;
  published?: string;
  description?: string;
  releaseNotes?: string;
  dependencyGroups: DependencyGroup[];
  downloads?: number;
}

export interface PackageStats {
  totalDownloads: number;
  versions: Record<string, number>;
}

export interface PackageData {
  id: string;
  versions: VersionInfo[];
  latest?: string;
  latestStable?: string;
  totalDownloads: number;
  description?: string;
  tags?: string[];
  authors?: string[];
  iconUrl?: string;
  projectUrl?: string;
  licenseExpression?: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`NuGet ${res.status} for ${url}`);
  return (await res.json()) as T;
}

/** Raw version list, newest-first. */
export async function getVersions(packageId: string): Promise<string[]> {
  const id = packageId.toLowerCase();
  return cached(`nuget:versions:${id}`, TTL.HOUR, async () => {
    const data = await getJson<{ versions: string[] }>(
      `${FLATCONTAINER}/${id}/index.json`,
    );
    return sortDesc(data.versions ?? []);
  });
}

interface RegistrationCatalogEntry {
  version: string;
  published?: string;
  description?: string;
  releaseNotes?: string;
  tags?: string[];
  authors?: string;
  iconUrl?: string;
  projectUrl?: string;
  licenseExpression?: string;
  dependencyGroups?: Array<{
    targetFramework?: string;
    dependencies?: Array<{ id: string; range?: string }>;
  }>;
}

interface RegistrationPage {
  items?: Array<{ catalogEntry?: RegistrationCatalogEntry; '@id'?: string; items?: RegistrationPage['items'] }>;
  '@id'?: string;
}

interface RegistrationIndex {
  items?: RegistrationPage[];
}

function mapEntry(entry: RegistrationCatalogEntry): VersionInfo {
  return {
    version: entry.version,
    isPrerelease: isPrerelease(entry.version),
    published: entry.published,
    description: entry.description,
    releaseNotes: entry.releaseNotes,
    dependencyGroups: (entry.dependencyGroups ?? []).map((g) => ({
      targetFramework: g.targetFramework,
      dependencies: (g.dependencies ?? []).map((d) => ({ id: d.id, range: d.range })),
    })),
  };
}

/**
 * Registration index → flat list of VersionInfo (published date, deps, release notes).
 * Inlined pages are read directly; paged registrations would require following `@id`,
 * but small packages (like Kippo) inline everything.
 */
export async function getRegistration(packageId: string): Promise<VersionInfo[]> {
  const id = packageId.toLowerCase();
  return cached(`nuget:registration:${id}`, TTL.HOUR, async () => {
    const index = await getJson<RegistrationIndex>(`${REGISTRATION}/${id}/index.json`);
    const out: VersionInfo[] = [];
    for (const page of index.items ?? []) {
      const items = page.items;
      if (items) {
        for (const leaf of items) {
          if (leaf.catalogEntry) out.push(mapEntry(leaf.catalogEntry));
        }
      } else if (page['@id']) {
        // Paged registration: fetch the page on demand.
        try {
          const sub = await getJson<RegistrationPage>(page['@id']);
          for (const leaf of sub.items ?? []) {
            if (leaf.catalogEntry) out.push(mapEntry(leaf.catalogEntry));
          }
        } catch {
          // ignore unreachable page
        }
      }
    }
    return out;
  });
}

interface SearchResult {
  data?: Array<{
    id: string;
    description?: string;
    tags?: string[];
    authors?: string[];
    iconUrl?: string;
    projectUrl?: string;
    licenseExpression?: string;
    totalDownloads?: number;
    versions?: Array<{ version: string; downloads?: number }>;
  }>;
}

/** Download statistics + lightweight package metadata from the search index. */
export async function getStats(packageId: string): Promise<PackageStats & {
  description?: string;
  tags?: string[];
  authors?: string[];
  iconUrl?: string;
  projectUrl?: string;
  licenseExpression?: string;
}> {
  const id = packageId.toLowerCase();
  return cached(`nuget:stats:${id}`, TTL.STATS, async () => {
    const data = await getJson<SearchResult>(
      `${SEARCH}?q=packageid:${id}&prerelease=true&semVerLevel=2.0.0`,
    );
    const pkg = data.data?.find((p) => p.id.toLowerCase() === id) ?? data.data?.[0];
    const versions: Record<string, number> = {};
    for (const v of pkg?.versions ?? []) {
      if (v.downloads != null) versions[v.version] = v.downloads;
    }
    return {
      totalDownloads: pkg?.totalDownloads ?? 0,
      versions,
      description: pkg?.description,
      tags: pkg?.tags,
      authors: pkg?.authors,
      iconUrl: pkg?.iconUrl,
      projectUrl: pkg?.projectUrl,
      licenseExpression: pkg?.licenseExpression,
    };
  });
}

/**
 * Aggregate everything the UI needs about a package in one shaped object.
 * Combines version list + registration metadata + download stats.
 */
export async function getPackageData(packageId: string): Promise<PackageData> {
  const [versions, registration, stats] = await Promise.all([
    getVersions(packageId),
    getRegistration(packageId).catch(() => [] as VersionInfo[]),
    getStats(packageId).catch(() => ({
      totalDownloads: 0,
      versions: {} as Record<string, number>,
    })),
  ]);

  const regByVersion = new Map(registration.map((v) => [v.version, v]));

  const merged: VersionInfo[] = versions.map((version) => {
    const reg = regByVersion.get(version);
    return {
      version,
      isPrerelease: isPrerelease(version),
      published: reg?.published,
      description: reg?.description,
      releaseNotes: reg?.releaseNotes,
      dependencyGroups: reg?.dependencyGroups ?? [],
      downloads: stats.versions[version],
    };
  });

  return {
    id: packageId,
    versions: merged,
    latest: versions[0],
    latestStable: latestStable(versions),
    totalDownloads: stats.totalDownloads,
    description: 'description' in stats ? stats.description : undefined,
    tags: 'tags' in stats ? stats.tags : undefined,
    authors: 'authors' in stats ? stats.authors : undefined,
    iconUrl: 'iconUrl' in stats ? stats.iconUrl : undefined,
    projectUrl: 'projectUrl' in stats ? stats.projectUrl : undefined,
    licenseExpression: 'licenseExpression' in stats ? stats.licenseExpression : undefined,
  };
}
