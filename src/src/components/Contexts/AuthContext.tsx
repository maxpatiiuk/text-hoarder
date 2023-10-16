import React from 'react';
import { sendRequest } from '../Background/messages';
import { useStorage } from '../../hooks/useStorage';

/**
 * Holds user token (if authenticated) and callback to authenticate
 */
export const AuthContext = React.createContext<Auth | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

type Auth = {
  readonly token: string | undefined;
  readonly handleAuthenticate: () => Promise<true | Error>;
};

let unsafeToken: string | undefined = undefined;
export const unsafeGetToken = () => unsafeToken;

export function AuthenticationProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const [token, setToken] = useStorage('accessToken');

  const handleAuthenticate = React.useCallback(
    async (interactive: boolean) =>
      sendRequest('Authenticate', { interactive }).then((result) => {
        if (result.type === 'Authenticated') {
          unsafeToken = token;
          setToken(token);
          return true;
        } else return new Error(result.error);
      }),
    [],
  );
  const isLoading = token === undefined;
  const isTokenMissing = token === '';
  React.useEffect(
    () =>
      isLoading
        ? undefined
        : isTokenMissing
        ? void handleAuthenticate(false)
        : undefined,
    [isTokenMissing, isLoading, handleAuthenticate],
  );

  const auth = React.useMemo(
    () => ({
      token: isTokenMissing ? undefined : token,
      handleAuthenticate: handleAuthenticate.bind(undefined, true),
    }),
    [token, isTokenMissing, handleAuthenticate],
  );
  return (
    <AuthContext.Provider value={isLoading ? undefined : auth}>
      {children}
    </AuthContext.Provider>
  );
}
