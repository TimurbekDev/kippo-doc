/**
 * React hooks over the NuGet client. State is driven by the cached client functions,
 * so repeated mounts (e.g. navigating between sections) resolve instantly from cache.
 */

import { useEffect, useState } from 'react';
import { getPackageData, type PackageData } from '../lib/nuget';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function usePackageData(nugetId: string): AsyncState<PackageData> {
  const [state, setState] = useState<AsyncState<PackageData>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    getPackageData(nugetId)
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (alive)
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
      });
    return () => {
      alive = false;
    };
  }, [nugetId]);

  return state;
}
