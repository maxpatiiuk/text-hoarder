import React from 'react';
import { sendRequest } from '../Background/messages';
import { useStorage } from '../../hooks/useStorage';
import { Octokit } from 'octokit';

/**
 * Holds user token (if authenticated) and callback to authenticate
 */
export const AuthContext = React.createContext<Auth>({
  octokit: undefined,
  installationId: undefined,
  handleAuthenticate: () => {
    throw new Error('Not loaded');
  },
  handleSignOut: () => {
    throw new Error('Not loaded');
  },
});
AuthContext.displayName = 'AuthContext';

// FEATURE: handle errors in all places where Octokit is used (https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#catching-errors) (i.e 401 when auth token got revoked by user)
// FEATURE: use pagination (https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#making-paginated-requests:~:text=const%20iterator%20%3D%20octokit.paginate.iterator(octokit,see%20%22Using%20pagination%20in%20the%20REST%20API.%22)

type Auth = {
  readonly octokit: Octokit | undefined;
  readonly installationId: number | undefined;
  readonly handleAuthenticate: () => Promise<true | Error>;
  readonly handleSignOut: () => void;
};

export function AuthenticationProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const [token, setToken] = useStorage('accessToken');
  const [_, setRepositoryName] = useStorage('repositoryName');
  const [installationId, setInstallationId] = useStorage('installationId');

  const handleAuthenticate = React.useCallback(
    async (interactive: boolean) =>
      sendRequest('Authenticate', { interactive }).then((result) => {
        if (result.type === 'Authenticated') {
          setToken(result.token);
          setInstallationId(result.installationId);
          if (process.env.NODE_ENV === 'development') console.log(result.token);
          return true;
        } else return new Error(result.error);
      }),
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
    return {
      octokit,
      installationId,
      handleAuthenticate: handleAuthenticate.bind(undefined, true),
      handleSignOut: () => {
        // FIXME: delete the token?
        setToken(undefined);
        setRepositoryName(undefined);
        // FIXME: delete the installation?
        // await octokit?.rest.apps.revokeInstallationAccessToken().catch(console.error);
      },
    };
  }, [installationId, token, handleAuthenticate, setToken, setRepositoryName]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
