import React from 'react';
import { sendRequest } from '../Background/messages';
import { useStorage } from '../../hooks/useStorage';
import { Octokit } from 'octokit';
import { OctokitWrapper, wrapOctokit } from './Octokit';

/**
 * Holds user token (if authenticated) and callback to authenticate
 */
export const AuthContext = React.createContext<Auth>({
  octokit: undefined,
  github: undefined,
  installationId: undefined,
  handleAuthenticate: () => {
    throw new Error('Not loaded');
  },
  handleSignOut: undefined,
});
AuthContext.displayName = 'AuthContext';

type Auth = {
  readonly octokit: Octokit | undefined;
  readonly github: OctokitWrapper | undefined;
  readonly installationId: number | undefined;
  readonly handleAuthenticate: () => Promise<void>;
  readonly handleSignOut: (() => void) | undefined;
};

// Unsafe because it might be accessed before being set
let unsafeAuth: Auth | undefined = undefined;
export const unsafeGetAuth = (): Auth | undefined => unsafeAuth;

export function AuthenticationProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const [token, setToken] = useStorage('auth.accessToken');
  const [repository, setRepository] = useStorage('setup.repository');
  const [installationId, setInstallationId] = useStorage('auth.installationId');

  const handleAuthenticate = React.useCallback(
    async (interactive: boolean) =>
      sendRequest('Authenticate', { interactive }).then(
        ({ token, installationId }) => {
          setToken(token);
          setInstallationId(installationId);
          if (process.env.NODE_ENV === 'development') console.log(token);
        },
      ),
    [setToken, setInstallationId],
  );

  const auth = React.useMemo(() => {
    /**
     * See docs at:
     * https://www.npmjs.com/package/octokit
     * https://github.com/octokit/authentication-strategies.js/
     * https://github.com/octokit/auth-app.js/ (though this one
     *   requires server)
     */
    const octokit =
      token === undefined ? undefined : new Octokit({ auth: token });
    const github =
      octokit === undefined || repository === undefined
        ? undefined
        : wrapOctokit(octokit, repository);
    return {
      octokit,
      github,
      installationId,
      handleAuthenticate: handleAuthenticate.bind(undefined, true),
      handleSignOut:
        token === undefined
          ? undefined
          : () => {
              setToken(undefined);
              setRepository(undefined);
            },
    };
  }, [
    repository,
    installationId,
    token,
    handleAuthenticate,
    setToken,
    setRepository,
  ]);
  unsafeAuth = auth;

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
