import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { simpleDocumentToMarkdown } from '../ExtractContent/simpleDocumentToMarkdown';
import { AuthContext } from '../Contexts/AuthContext';
import { readerText } from '@common/localization/readerText';
import { Button } from '@common/components/Atoms/Button';
import { encoding } from '@common/utils/encoding';
import { Link } from '@common/components/Atoms/Link';
import { useStorage } from '../../hooks/useStorage';
import { GetOrSet, isDefined } from '@common/utils/types';
import { sendRequest } from '../Background/messages';
import { Repository } from '../../utils/storage';
import { loadingGif, useLoading } from '@common/hooks/useLoading';
import { commonText } from '@common/localization/commonText';
import { commitText } from '@common/localization/commitText';
import { ErrorMessage } from '@common/components/Atoms';

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;
const currentYearPath = encoding.urlToPath.encode(
  currentYear,
  globalThis.location.href,
);
const previousYearPath = encoding.urlToPath.encode(
  previousYear,
  globalThis.location.href,
);

export function useExistingFile(): GetOrSet<undefined | false | string> {
  const { github } = React.useContext(AuthContext);
  const [eagerCheckForAlreadySaved] = useStorage(
    'reader.eagerCheckForAlreadySaved',
  );
  const eagerCheckRef = React.useRef(eagerCheckForAlreadySaved);
  const [file, setFile] = React.useState<undefined | false | string>(undefined);
  React.useEffect(
    () =>
      eagerCheckRef.current
        ? github === undefined
          ? setFile(undefined)
          : void github
              .hasFile(currentYearPath)
              .then((hasFile) =>
                hasFile
                  ? currentYearPath
                  : github
                      .hasFile(previousYearPath)
                      .then((hasFile) => (hasFile ? previousYearPath : false)),
              )
              .then(setFile)
              .catch((error) => {
                console.error(error);
                return false;
              })
        : setFile(false),
    [github],
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

  const [isLoading, error, loading] = useLoading();

  const [wasAlreadySaved, setWasAlreadySaved] = React.useState(
    typeof existingFile === 'string',
  );
  const requestSent = React.useRef(false);
  React.useEffect(() => {
    if (wasAlreadySaved || requestSent.current) return undefined;

    // Fix request being sent twice when React is in development mode
    requestSent.current = true;

    const markdown = simpleDocumentToMarkdown(simpleDocument);
    loading(
      github!
        .createFile(
          currentYearPath,
          commitText.saveArticle(simpleDocument.title),
          markdown,
        )
        .then((response) => {
          if (response.type === 'AlreadyExists') setWasAlreadySaved(true);
          handleSaved(currentYearPath);
        }),
    );
  }, [loading, github, wasAlreadySaved, simpleDocument]);

  const fileEditUrl =
    typeof repository === 'object' && typeof existingFile === 'string'
      ? buildRepositoryUrl(repository, existingFile)
      : undefined;
  const openFileUrl = mode === 'edit' ? fileEditUrl : undefined;
  React.useEffect(
    () =>
      typeof openFileUrl === 'string'
        ? loading(sendRequest('OpenUrl', openFileUrl).then(handleClose))
        : undefined,
    [openFileUrl, loading, handleClose],
  );

  const [undoUsingForcePush] = useStorage('github.undoUsingForcePush');

  return (
    <>
      {typeof error === 'string' && <ErrorMessage>{error}</ErrorMessage>}
      {existingFile === undefined ||
      fileEditUrl === undefined ||
      mode === 'edit' ? (
        loadingGif
      ) : (
        <>
          <p className="flex-1">
            {wasAlreadySaved
              ? readerText.recentlySaved
              : readerText.savedToGitHub}
          </p>
          <Button.Danger
            onClick={(): void =>
              typeof existingFile === 'string'
                ? loading(
                    (undoUsingForcePush
                      ? github!
                          .deleteFileUsingForcePush(existingFile)
                          .catch(() => false)
                      : Promise.resolve(false)
                    )
                      .then((deleted) =>
                        deleted
                          ? undefined
                          : github!.deleteFile(
                              existingFile,
                              simpleDocument.title,
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

export const buildRepositoryUrl = (
  { owner, name, branch }: Repository,
  filePath?: string,
) =>
  [
    'https://github.com/',
    owner,
    '/',
    name,
    filePath === undefined ? '/tree/' : '/edit/',
    // Branch name may contain special characters
    encoding.fileName.encode(branch),
    '/',
    /*
     * URL encode % so that browser does not decode the URL encoded characters
     * in the file name. I.e if file name has ?, it is replaced by %3F.
     * Turn that into %253F so that GitHub sees %3F and not ?
     */
    filePath?.replaceAll('%', encodeURIComponent('%')),
  ]
    .filter(isDefined)
    .join('');
