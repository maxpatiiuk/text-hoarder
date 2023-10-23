import React from 'react';
import { gitHubAppName } from '../../../config';
import { useAsyncState } from '../../hooks/useAsyncState';
import { useStorage } from '../../hooks/useStorage';
import { popupText } from '../../localization/popupText';
import { Button } from '../Atoms/Button';
import { Link } from '../Atoms/Link';
import { AuthContext } from '../Contexts/AuthContext';

export function RepositoryList(): JSX.Element | undefined {
  const auth = React.useContext(AuthContext);
  const [_, setRepositoryName] = useStorage('repositoryName');
  const [repositories] = useAsyncState(
    React.useCallback(
      () =>
        auth?.installationId === undefined
          ? undefined
          : auth?.octokit?.rest.apps
              .listInstallationReposForAuthenticatedUser({
                installation_id: auth.installationId,
                per_page: 100,
              })
              .then(({ data }) =>
                data.repositories.map(({ full_name }) => full_name),
              )
              .then((repositories) => {
                if (repositories.length === 1)
                  setRepositoryName(repositories[0]);
                return repositories;
              }),
      [auth, setRepositoryName],
    ),
    true,
  );

  return repositories === undefined ||
    repositories.length === 1 ? undefined : repositories.length === 0 ? (
    <p>{popupText.noRepositories(createRepositoryLink, editPermissionsLink)}</p>
  ) : (
    <>
      {popupText.pickRepository}
      <div className="flex flex-1 flex-col gap-1 overflow-auto">
        {repositories.map((name) => (
          <Button.Success
            key={name}
            onClick={(): void => setRepositoryName(name)}
            className="!justify-start"
          >
            {name}
          </Button.Success>
        ))}
      </div>
      <p>
        {popupText.pickRepositoryHint(
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
