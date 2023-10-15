import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { AuthContext } from '../Contexts/AuthContext';
import { FirstAuthScreen } from './FirstAuthScreen';

/**
 * Entrypoint react component for the extension
 */
export function App(): JSX.Element | null {
  const [debugOverlay] = useAsyncState(
    React.useCallback(() => debugOverlayPromise, []),
    false,
  );

  const auth = React.useContext(AuthContext);
  const [isFirstAuth, setIsFirstAuth] = React.useState(false);
  const handleAuth = (): void =>
    void auth.handleAuthenticate(true).catch(console.error);

  return (
    <>
      {debugOverlay}
      {isFirstAuth && (
        <FirstAuthScreen
          onClose={(): void => setIsFirstAuth(false)}
          onAuth={handleAuth}
        />
      )}
    </>
  );
}

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;
