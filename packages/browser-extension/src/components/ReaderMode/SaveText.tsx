import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { simpleDocumentToMarkdown } from '../ExtractContent/simpleDocumentToMarkdown';
import { useAsyncState } from '../../hooks/useAsyncState';
import { AuthContext } from '../Contexts/AuthContext';
import { readerText } from '../../localization/readerText';
import { Button } from '../Atoms/Button';
import { LoadingContext } from '../Contexts/Contexts';
import { encoding } from '../../utils/encoding';
import { Link } from '../Atoms/Link';
import { useStorage } from '../../hooks/useStorage';
import { GetOrSet } from '../../utils/types';
import { sendRequest } from '../Background/messages';
import { Repository } from '../../utils/storage';

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;
const currentYearPath = encoding.urlToPath.encode(
  currentYear,
  new URL(window.location.href),
);
const previousYearPath = encoding.urlToPath.encode(
  previousYear,
  new URL(window.location.href),
);

export function useExistingFile(): GetOrSet<undefined | false | string> {
  const { github } = React.useContext(AuthContext);
  const [eagerCheckForAlreadySaved] = useStorage(
    'reader.eagerCheckForAlreadySaved',
  );
  return useAsyncState(
    React.useCallback(
      () =>
        eagerCheckForAlreadySaved
          ? github
              ?.hasFile(currentYearPath)
              .then((hasFile) =>
                hasFile
                  ? currentYearPath
                  : github
                      .hasFile(previousYearPath)
                      .then((hasFile) => (hasFile ? previousYearPath : false)),
              )
          : false,
      [github],
    ),
    false,
  );
}

export function SaveText({
  existingFile,
  simpleDocument,
  mode,
  onClose: handleClose,
  onSaved: handleSaved,
}: {
  readonly existingFile: false | string;
  readonly simpleDocument: SimpleDocument;
  readonly mode: 'save' | 'edit';
  readonly onClose: () => void;
  readonly onSaved: (fileName: string | false) => void;
}): JSX.Element {
  const { github } = React.useContext(AuthContext);
  const repository = useStorage('setup.repository')[0];

  const [wasAlreadySaved, setWasAlreadySaved] = React.useState(
    typeof existingFile === 'string',
  );
  React.useEffect(() => {
    if (wasAlreadySaved) return undefined;

    const markdown = simpleDocumentToMarkdown(simpleDocument);
    github!
      .createFile(currentYearPath, simpleDocument.title, markdown)
      .then((response) => {
        if (response.type === 'AlreadyExists') setWasAlreadySaved(true);
        handleSaved(currentYearPath);
      });
  }, [github, wasAlreadySaved, simpleDocument]);

  const loading = React.useContext(LoadingContext);

  const fileEditUrl =
    typeof repository === 'object' && typeof existingFile === 'string'
      ? filePathToGitHubUrl(repository, existingFile)
      : undefined;
  const openFileUrl = mode === 'edit' ? fileEditUrl : undefined;
  React.useEffect(
    () =>
      typeof openFileUrl === 'string'
        ? void sendRequest('OpenUrl', openFileUrl)
            .then(handleClose)
            .catch(console.error)
        : undefined,
    [openFileUrl],
  );

  return (
    <>
      {existingFile === undefined ||
      fileEditUrl === undefined ||
      mode === 'edit' ? (
        <p>{readerText.loading}</p>
      ) : (
        <>
          <p className="flex-1">
            {wasAlreadySaved ? readerText.recentlySaved : readerText.saved}
          </p>
          <Button.Danger
            onClick={(): void =>
              typeof existingFile === 'string'
                ? loading(
                    github!
                      .fetchSha(existingFile)
                      .then((sha) =>
                        sha === undefined
                          ? undefined
                          : github!.deleteFile(
                              existingFile,
                              `[${readerText.delete}] simpleDocument.title`,
                              sha,
                            ),
                      )
                      .then(() => {
                        handleSaved(false);
                        handleClose();
                      }),
                  )
                : undefined
            }
          >
            {readerText.delete}
          </Button.Danger>
          <Link.Info href={fileEditUrl}>{readerText.edit}</Link.Info>
        </>
      )}
    </>
  );
}

export const filePathToGitHubUrl = (
  { owner, name, branch }: Repository,
  filePath: string,
) => `https://github.com/${owner}/${name}/edit/${branch}/${filePath}`;
