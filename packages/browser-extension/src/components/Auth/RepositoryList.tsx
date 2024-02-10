import React from 'react';
import { gitHubAppName } from '../../../config';
import { useAsyncState } from '@common/hooks/useAsyncState';
import { useStorage } from '../../hooks/useStorage';
import { signInText } from '@common/localization/signInText';
import { Button } from '@common/components/Atoms/Button';
import { Link } from '@common/components/Atoms/Link';
import { AuthContext } from '../Contexts/AuthContext';
import { loadingGif } from '@common/hooks/useLoading';
import { ErrorMessage } from '@common/components/Atoms';

export function RepositoryList(): JSX.Element | undefined {
  const { installationId, octokit } = React.useContext(AuthContext);
  const [_, setRepository] = useStorage('setup.repository');

  const [repositories, __, ___, error] = useAsyncState(
    React.useCallback(
      () =>
        installationId === undefined
          ? undefined
          : octokit?.rest.apps
              .listInstallationReposForAuthenticatedUser({
                installation_id: installationId,
                per_page: 100,
              })
              .then(({ data }) => data.repositories)
              .then((repositories) => {
                if (repositories.length === 1)
                  setRepository({
                    owner: repositories[0].owner.login,
                    name: repositories[0].name,
                    branch: repositories[0].default_branch,
                  });
                return repositories;
              }),
      [installationId, octokit, setRepository],
    ),
  );

  return repositories === undefined ? (
    loadingGif
  ) : typeof error === 'string' ? (
    <ErrorMessage>{error}</ErrorMessage>
  ) : repositories.length === 1 ? undefined : repositories.length === 0 ? (
    <p>
      {signInText.noRepositories(createRepositoryLink, editPermissionsLink)}
    </p>
  ) : (
    <>
      {signInText.pickRepository}
      <div className="flex flex-1 flex-col gap-1 overflow-auto">
        {repositories.map(
          ({
            full_name: fullName,
            owner,
            name,
            default_branch: defaultBranch,
          }) => (
            <Button.Success
              key={fullName}
              onClick={(): void =>
                setRepository({
                  owner: owner.login,
                  name,
                  branch: defaultBranch,
                })
              }
              className="!justify-start"
            >
              {fullName}
            </Button.Success>
          ),
        )}
      </div>
      <p>
        {signInText.pickRepositoryHint(
          createRepositoryLink,
          editPermissionsLink,
        )}
      </p>
    </>
  );
}

const createRepositoryLink = (label: string) => (
  <Link.Default href="https://docs.github.com/en/get-started/quickstart/create-a-repo#create-a-repository">
    {label}
  </Link.Default>
);
const editPermissionsLink = (label: string) => (
  <Link.Default
    href={`https://github.com/apps/${gitHubAppName}/installations/new`}
  >
    {label}
  </Link.Default>
);
