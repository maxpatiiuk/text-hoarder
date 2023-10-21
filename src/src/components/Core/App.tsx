import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { AuthContext } from '../Contexts/AuthContext';
import { AuthPrompt } from './AuthPrompt';
import { LoadingScreen } from '../Molecules/LoadingScreen';
import { Authenticated } from './Authenticated';

/**
 * Entrypoint React component for the extension
 */
export function App(): JSX.Element | null {
  const [debugOverlay] = useAsyncState(
    React.useCallback(() => debugOverlayPromise, []),
    false,
  );

  const auth = React.useContext(AuthContext);
  return (
    <>
      {debugOverlay}
      {auth === undefined ? (
        <LoadingScreen />
      ) : auth.octokit === undefined ? (
        <AuthPrompt
          onAuth={(): Promise<true | Error> => auth.handleAuthenticate()}
        />
      ) : (
        <Authenticated />
      )}
    </>
  );
}

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;
