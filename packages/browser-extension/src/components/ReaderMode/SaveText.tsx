import React from 'react';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { simpleDocumentToMarkdown } from '../ExtractContent/simpleDocumentToMarkdown';
import { useAsyncState } from '../../hooks/useAsyncState';
import { AuthContext } from '../Contexts/AuthContext';
import { State } from 'typesafe-reducer';
import { readerText } from '../../localization/readerText';
import { Button } from '../Atoms/Button';
import { LoadingContext } from '../Contexts/Contexts';
import { encoding } from '../../utils/encoding';
import { Link } from '../Atoms/Link';
import { Repository, useStorage } from '../../hooks/useStorage';
import { GetOrSet } from '../../utils/types';
import { sendRequest } from '../Background/messages';

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
  return useAsyncState(
    React.useCallback(
      () =>
        github
          ?.hasFile(currentYearPath)
          .then((hasFile) =>
            hasFile
              ? currentYearPath
              : github
                  .hasFile(previousYearPath)
                  .then((hasFile) => (hasFile ? previousYearPath : false)),
          ),
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
  readonly existingFile: undefined | false | string;
  readonly simpleDocument: SimpleDocument;
  readonly mode: 'save' | 'edit';
  readonly onClose: () => void;
  readonly onSaved: (fileName: string) => void;
}): JSX.Element {
  const { github } = React.useContext(AuthContext);
  const repository = useStorage('setup.repository')[0];

  const [state, setState] = useAsyncState<
    | State<
        'RecentlySaved',
        {
          readonly saveAgain: () => Promise<void>;
          readonly path: string;
        }
      >
    | State<
        'Saved',
        {
          readonly path: string;
        }
      >
  >(
    React.useCallback(async () => {
      if (existingFile === undefined) return undefined;

      function saveDocument(): Promise<void> {
        const markdown = simpleDocumentToMarkdown(simpleDocument);
        return github!
          .editFile(currentYearPath, simpleDocument.title, markdown)
          .then(() => handleSaved(currentYearPath));
      }

      if (typeof existingFile === 'string')
        return {
          type: 'RecentlySaved',
          path: existingFile,
          saveAgain: saveDocument,
        };
      else
        return saveDocument().then(() => ({
          type: 'Saved',
          path: currentYearPath,
        }));
    }, [github, existingFile, simpleDocument]),
    false,
  );

  const loading = React.useContext(LoadingContext);

  const fileEditUrl =
    typeof repository === 'object' && typeof state === 'object'
      ? pathToUrl(repository, state.path)
      : undefined;
  React.useEffect(
    () =>
      mode === 'edit' && typeof fileEditUrl === 'string'
        ? void sendRequest('OpenUrl', fileEditUrl)
            .then(handleClose)
            .catch(console.error)
        : undefined,
    [fileEditUrl, mode],
  );

  return (
    <>
      {existingFile === undefined ||
      state === undefined ||
      fileEditUrl === undefined ||
      mode === 'edit' ? (
        <p>{readerText.loading}</p>
      ) : (
        <>
          {state.type === 'RecentlySaved' ? (
            <>
              <p className="flex-1">{readerText.recentlySaved}</p>
              <Button.Success
                onClick={(): void =>
                  loading(
                    state
                      .saveAgain()
                      .then(() =>
                        setState({ type: 'Saved', path: currentYearPath }),
                      ),
                  )
                }
              >
                {
                  /*
                   * File contents will likely be the same, but last commit date
                   * will be updated - last commit date matters when looking for
                   * recently added/updated files
                   */
                  readerText.saveAgain
                }
              </Button.Success>
            </>
          ) : (
            <p className="flex-1">{readerText.saved}</p>
          )}
          <Link.Info href={fileEditUrl}>{readerText.edit}</Link.Info>
        </>
      )}
    </>
  );
}

const pathToUrl = ({ owner, name, branch }: Repository, filePath: string) =>
  `https://github.com/${owner}/${name}/edit/${branch}/${filePath}`;
