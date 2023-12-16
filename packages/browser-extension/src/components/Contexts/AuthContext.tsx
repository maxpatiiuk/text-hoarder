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

// FINAL: handle errors in all places where Octokit is used (https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#catching-errors) (i.e 401 when auth token got revoked by user). or 422 with json .message on double //
// FINAL: use pagination (https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#making-paginated-requests:~:text=const%20iterator%20%3D%20octokit.paginate.iterator(octokit,see%20%22Using%20pagination%20in%20the%20REST%20API.%22)

type Auth = {
  readonly octokit: Octokit | undefined;
  readonly github: OctokitWrapper | undefined;
  readonly installationId: number | undefined;
  readonly handleAuthenticate: () => Promise<void>;
  readonly handleSignOut: (() => void) | undefined;
};

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
              // FIXME: delete the token?
              setToken(undefined);
              setRepository(undefined);
              // FIXME: delete the installation?
              // await octokit?.rest.apps.revokeInstallationAccessToken().catch(console.error);
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

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
