import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { simpleDocumentToMarkdown } from '../ExtractContent/simpleDocumentToMarkdown';
import { useAsyncState } from '@common/hooks/useAsyncState';
import { AuthContext } from '../Contexts/AuthContext';
import { readerText } from '@common/localization/readerText';
import { Button } from '@common/components/Atoms/Button';
import { encoding } from '@common/utils/encoding';
import { Link } from '@common/components/Atoms/Link';
import { useStorage } from '../../hooks/useStorage';
import { GetOrSet } from '@common/utils/types';
import { sendRequest } from '../Background/messages';
import { Repository } from '../../utils/storage';
import { loadingGif, useLoading } from '@common/hooks/useLoading';
import { commonText } from '@common/localization/commonText';
import { commitText } from '@common/localization/commitText';

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
  const [file, setFile] = useAsyncState(
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
  );

  React.useEffect(() => {
    if (file === undefined || file === false) return;
    sendRequest('UpdateBadge', '1').catch(console.error);
    return (): void =>
      void sendRequest('UpdateBadge', undefined).catch(console.error);
  }, [file]);

  return [file, setFile];
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
  const requestSent = React.useRef(false);
  React.useEffect(() => {
    if (wasAlreadySaved || requestSent.current) return undefined;

    // Fix request being sent twice when React is in development mode
    requestSent.current = true;

    const markdown = simpleDocumentToMarkdown(simpleDocument);
    github!
      .createFile(
        currentYearPath,
        commitText.createFile(simpleDocument.title),
        markdown,
      )
      .then((response) => {
        if (response.type === 'AlreadyExists') setWasAlreadySaved(true);
        handleSaved(currentYearPath);
      });
  }, [github, wasAlreadySaved, simpleDocument]);

  const [isLoading, loading] = useLoading();

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
        loadingGif
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
                              commitText.repositoryInitialize(
                                simpleDocument.title,
                              ),
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
            {commonText.delete}
          </Button.Danger>
          <Link.Info href={fileEditUrl}>{readerText.edit}</Link.Info>
          {isLoading && loadingGif}
        </>
      )}
    </>
  );
}

export const filePathToGitHubUrl = (
  { owner, name, branch }: Repository,
  filePath: string,
) =>
  `https://github.com/${owner}/${name}/edit/${branch}/${encodeURIComponent(
    filePath,
  )}`;
