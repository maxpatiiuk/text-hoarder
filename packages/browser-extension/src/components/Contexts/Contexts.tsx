import React from 'react';

import { ErrorBoundary } from '../Errors/ErrorBoundary';
import { AuthenticationProvider } from './AuthContext';
import { StorageProvider } from '../../hooks/useStorage';
import { loadingGif } from '../../hooks/useLoading';

/**
 * Provide contexts used by other components
 *
 * It is best practice to use context as little as possible, as they make
 * components more dependent on their parents.
 *
 * Thus, contexts were used only when necessary, and defined as higher up
 * the tree as possible, so that code refactoring does not lead to a
 * situation where context is accessed before it is defined.
 *
 * Defining contexts very high also allows the top ErrorBoundary to have
 * access to them.
 */
export function Contexts({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={loadingGif}>
        <StorageProvider>
          <AuthenticationProvider>{children}</AuthenticationProvider>
        </StorageProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
}
