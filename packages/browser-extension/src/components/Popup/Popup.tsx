import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { AuthContext } from '../Contexts/AuthContext';
import { AuthPrompt } from '../Auth/AuthPrompt';
import { LoadingScreen } from '../Molecules/LoadingScreen';
import { Authenticated } from '../Auth/Authenticated';

/**
 * Entrypoint React component for the extension
 */
export function Popup(): JSX.Element | null {
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
        <AuthPrompt onAuth={auth.handleAuthenticate} />
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
