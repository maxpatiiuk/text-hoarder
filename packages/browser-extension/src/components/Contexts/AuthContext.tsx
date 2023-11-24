import React from 'react';
import { sendRequest } from '../Background/messages';
import { useStorage } from '../../hooks/useStorage';
import { Octokit } from 'octokit';
import { ajax } from '@common/utils/ajax';
import { formatUrl, parseUrl } from '@common/utils/queryString';
import { corsAuthMiddlewareUrl } from '../../../config';
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
  handleSignOut: () => {
    throw new Error('Not loaded');
  },
});
AuthContext.displayName = 'AuthContext';

// FINAL: handle errors in all places where Octokit is used (https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#catching-errors) (i.e 401 when auth token got revoked by user). or 422 with json .message on double //
// FINAL: use pagination (https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#making-paginated-requests:~:text=const%20iterator%20%3D%20octokit.paginate.iterator(octokit,see%20%22Using%20pagination%20in%20the%20REST%20API.%22)

type Auth = {
  readonly octokit: Octokit | undefined;
  readonly github: OctokitWrapper | undefined;
  readonly installationId: number | undefined;
  readonly handleAuthenticate: () => Promise<void>;
  readonly handleSignOut: () => void;
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
      sendRequest('Authenticate', { interactive })
        .then(resolveAuthToken)
        .then(({ token, installationId }) => {
          setToken(token);
          setInstallationId(installationId);
          if (process.env.NODE_ENV === 'development') console.log(token);
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
    const github =
      octokit === undefined || repository === undefined
        ? undefined
        : wrapOctokit(octokit, repository);
    return {
      octokit,
      github,
      installationId,
      handleAuthenticate: handleAuthenticate.bind(undefined, true),
      handleSignOut: () => {
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

async function resolveAuthToken({
  callbackUrl,
  originalState,
}: {
  // Example URL: https://bjknebjiadgjchmhppdfdiddfegmcaao.chromiumapp.org/?code=ace8eda36ec23fb106a1&installation_id=43127586&setup_action=install&state=13915511021528948
  callbackUrl: string | undefined;
  originalState: string;
}): Promise<{ readonly token: string; readonly installationId: number }> {
  if (callbackUrl === undefined) throw new Error('Authentication was canceled');
  const {
    code,
    state: returnedState,
    installation_id: installationIdString,
  } = parseUrl(callbackUrl);
  const installationId = Number.parseInt(installationIdString);
  if (
    typeof code !== 'string' ||
    originalState !== returnedState ||
    Number.isNaN(installationId)
  )
    throw new Error('Authentication failed');
  return ajax(formatUrl(corsAuthMiddlewareUrl, { code }), {
    method: 'POST',
  })
    .then((response) => response.text())
    .then((token) => ({ token, installationId }));
}
