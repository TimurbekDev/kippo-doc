/**
 * DocsProvider resolves the active package / version / section from the URL, fetches
 * the package's live NuGet data, and shares it with the docs UI. Version aliases
 * (`latest`, `stable`) are kept in the URL for shareable links and resolved to a
 * concrete version here for display.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPackage,
  getSection,
  type DocSection,
  type PackageDef,
} from '../data/registry';
import { usePackageData } from '../hooks/useNuget';
import type { PackageData } from '../lib/nuget';

export interface DocsContextValue {
  pkg: PackageDef;
  packageData: PackageData | null;
  loading: boolean;
  error: Error | null;
  /** Raw `:version` from the URL (may be an alias like `latest`). */
  versionParam: string;
  /** Concrete version the alias resolves to (falls back to the param until data loads). */
  resolvedVersion: string;
  /** True when `versionParam` is `latest` / `stable`. */
  isAlias: boolean;
  section: DocSection;
  /** Navigate keeping package + section, swapping the version segment. */
  goToVersion: (version: string) => void;
  /** Navigate keeping package + version, swapping the section. */
  goToSection: (sectionId: string) => void;
  /** Build a docs URL within the current package + version. */
  hrefFor: (sectionId: string) => string;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export function useDocs(): DocsContextValue {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error('useDocs must be used within <DocsProvider>');
  return ctx;
}

function resolveVersion(
  param: string,
  data: PackageData | null,
): { resolved: string; isAlias: boolean } {
  const lower = param.toLowerCase();
  if (lower === 'latest') {
    return { resolved: data?.latestStable ?? data?.latest ?? param, isAlias: true };
  }
  if (lower === 'stable') {
    return { resolved: data?.latestStable ?? data?.latest ?? param, isAlias: true };
  }
  return { resolved: param, isAlias: false };
}

interface DocsProviderProps {
  children: ReactNode;
  /** Rendered when the package or section in the URL is unknown. */
  fallback: ReactNode;
}

export function DocsProvider({ children, fallback }: DocsProviderProps) {
  const params = useParams();
  const navigate = useNavigate();

  const pkg = getPackage(params.package);
  const versionParam = params.version ?? 'latest';
  const sectionId = params.section ?? pkg?.sections[0]?.id ?? '';
  const section = pkg ? getSection(pkg, sectionId) : undefined;

  const { data, loading, error } = usePackageData(pkg?.nugetId ?? '');

  const { resolved, isAlias } = useMemo(
    () => resolveVersion(versionParam, data),
    [versionParam, data],
  );

  const goToVersion = useCallback(
    (version: string) => {
      if (!pkg) return;
      navigate(`/docs/${pkg.id}/${version}/${sectionId}`);
    },
    [navigate, pkg, sectionId],
  );

  const goToSection = useCallback(
    (target: string) => {
      if (!pkg) return;
      navigate(`/docs/${pkg.id}/${versionParam}/${target}`);
    },
    [navigate, pkg, versionParam],
  );

  const hrefFor = useCallback(
    (target: string) => (pkg ? `/docs/${pkg.id}/${versionParam}/${target}` : '/'),
    [pkg, versionParam],
  );

  const value = useMemo<DocsContextValue | null>(() => {
    if (!pkg || !section) return null;
    return {
      pkg,
      packageData: data,
      loading,
      error,
      versionParam,
      resolvedVersion: resolved,
      isAlias,
      section,
      goToVersion,
      goToSection,
      hrefFor,
    };
  }, [
    pkg,
    section,
    data,
    loading,
    error,
    versionParam,
    resolved,
    isAlias,
    goToVersion,
    goToSection,
    hrefFor,
  ]);

  if (!value) return <>{fallback}</>;
  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}
