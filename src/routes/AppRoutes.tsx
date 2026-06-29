import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { DEFAULT_PACKAGE, getPackage } from '../data/registry';
import { DocsProvider } from '../context/DocsProvider';
import { Spinner } from '../components/common/Spinner';
import { NotFound } from '../components/common/NotFound';

const Home = lazy(() =>
  import('../components/marketing/Home').then((m) => ({ default: m.Home })),
);
const Contributors = lazy(() =>
  import('../components/marketing/Contributors').then((m) => ({ default: m.Contributors })),
);
const DocsLayout = lazy(() =>
  import('../components/layout/DocsLayout').then((m) => ({ default: m.DocsLayout })),
);

function firstSectionPath(packageId: string, version: string): string {
  const pkg = getPackage(packageId);
  if (!pkg) return '';
  return `/docs/${pkg.id}/${version}/${pkg.sections[0].id}`;
}

/** /docs/:package -> /docs/:package/latest/<first section> */
function PackageRedirect() {
  const { package: pkgId } = useParams();
  const pkg = getPackage(pkgId);
  if (!pkg) return <NotFound />;
  return <Navigate to={firstSectionPath(pkg.id, 'latest')} replace />;
}

/** /docs/:package/:version -> /docs/:package/:version/<first section> */
function VersionRedirect() {
  const { package: pkgId, version } = useParams();
  const pkg = getPackage(pkgId);
  if (!pkg) return <NotFound />;
  return <Navigate to={firstSectionPath(pkg.id, version ?? 'latest')} replace />;
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Spinner label="Loading…" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contributors" element={<Contributors />} />

          <Route
            path="/docs"
            element={
              <Navigate
                to={firstSectionPath(DEFAULT_PACKAGE.id, 'latest')}
                replace
              />
            }
          />
          <Route path="/docs/:package" element={<PackageRedirect />} />
          <Route path="/docs/:package/:version" element={<VersionRedirect />} />
          <Route
            path="/docs/:package/:version/:section"
            element={
              <DocsProvider fallback={<NotFound />}>
                <DocsLayout />
              </DocsProvider>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
