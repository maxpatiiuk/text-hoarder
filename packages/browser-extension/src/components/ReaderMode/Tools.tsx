import React from 'react';
import { Button } from '@common/components/Atoms/Button';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '@common/localization/readerText';
import { Preferences } from '../Preferences/Preferences';
import { listen } from '@common/utils/events';
import { preferencesText } from '@common/localization/preferencesText';
import { useStorage } from '../../hooks/useStorage';
import { downloadDocument } from './download';
import { InfoTab } from './InfoTab';
import { EnsureAuthenticated } from '../Auth';
import { SaveText, filePathToGitHubUrl, useExistingFile } from './SaveText';
import { listenEvent } from '../Background/messages';
import { Link } from '@common/components/Atoms/Link';
import { loadingGif, useLoading } from '@common/hooks/useLoading';

export function Tools({
  simpleDocument,
  style,
}: {
  readonly simpleDocument: SimpleDocument;
  readonly style: React.CSSProperties;
}): JSX.Element {
  const [selectedTool, setSelectedTool] = React.useState<
    undefined | 'saveText' | 'editText' | 'infoTab' | 'preferences'
  >(undefined);
  const handleClose = React.useCallback(() => setSelectedTool(undefined), []);

  const [, catchErrors] = useLoading();
  const [downloadFormat] = useStorage('reader.downloadFormat');
  const handleDownload = React.useCallback(
    (): void =>
      containerRef.current === null
        ? undefined
        : catchErrors(
            downloadDocument(
              downloadFormat,
              simpleDocument,
              containerRef.current,
            ),
          ),
    [catchErrors, downloadFormat],
  );

  React.useEffect(
    () =>
      listenEvent('ActivateExtension', ({ action }) =>
        action === 'saveText' || action === 'editText'
          ? setSelectedTool(action)
          : action === 'download'
          ? handleDownload()
          : undefined,
      ),
    [downloadDocument, setSelectedTool],
  );

  // Close on outside click
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(
    () =>
      selectedTool === undefined || containerRef.current === null
        ? undefined
        : listen(containerRef.current.getRootNode(), 'click', (event) =>
            event.target instanceof Element &&
            containerRef.current?.contains(event.target) === false
              ? setSelectedTool(undefined)
              : undefined,
          ),
    [selectedTool, setSelectedTool],
  );

  const [existingFile, setExistingFile] = useExistingFile();
  const [repository] = useStorage('setup.repository');
  const panelId = React.useId();

  const [unfocusedMenuOpacity] = useStorage('reader.unfocusedMenuOpacity');

  return (
    <div
      className={`
        absolute top-0 right-0 flex backdrop-blur rounded-es
        bg-white/80 dark:bg-black/70 max-h-full border-r border-gray-400
        ${
          selectedTool === undefined
            ? 'opacity-[var(--opacity)] hover:opacity-100 focus-within:opacity-100'
            : ''
        }
      `}
      style={
        {
          ...style,
          '--opacity': unfocusedMenuOpacity / 100,
        } as React.CSSProperties
      }
      ref={containerRef}
    >
      {selectedTool !== undefined && (
        <aside
          className={`
            flex flex-col gap-4 p-4 overflow-auto w-[20rem]
            ${
              selectedTool === 'preferences' || selectedTool === 'infoTab'
                ? 'pt-0 '
                : ''
            }
          `}
          id={panelId}
          tabIndex={-1}
          ref={(element): void => element?.focus()}
        >
          {selectedTool === 'preferences' ? (
            <Preferences />
          ) : selectedTool === 'infoTab' ? (
            <InfoTab />
          ) : (
            <EnsureAuthenticated>
              {existingFile === undefined ? (
                loadingGif
              ) : (
                <SaveText
                  existingFile={existingFile}
                  simpleDocument={simpleDocument}
                  mode={selectedTool === 'saveText' ? 'save' : 'edit'}
                  onClose={handleClose}
                  onSaved={setExistingFile}
                />
              )}
            </EnsureAuthenticated>
          )}
        </aside>
      )}
      <nav
        className="flex flex-col p-2 gap-3 text-[130%] "
        aria-label={readerText.tools}
      >
        <Button.Icon
          onClick={(): void =>
            setSelectedTool(
              selectedTool === 'saveText' ? undefined : 'saveText',
            )
          }
          icon={
            typeof existingFile === 'string' ? 'bookmark' : 'bookmarkHollow'
          }
          title={readerText.saveToGitHub}
          aria-pressed={selectedTool === 'saveText' ? true : undefined}
          aria-controls={panelId}
        />
        {typeof existingFile === 'string' && typeof repository === 'object' ? (
          <Link.Icon
            href={filePathToGitHubUrl(repository, existingFile)}
            icon="pencil"
            title={readerText.editOnGitHub}
            aria-controls={panelId}
          />
        ) : (
          <Button.Icon
            onClick={(): void =>
              setSelectedTool(
                selectedTool === 'editText' ? undefined : 'editText',
              )
            }
            icon="pencil"
            title={readerText.editOnGitHub}
            aria-pressed={selectedTool === 'editText' ? true : undefined}
            aria-controls={panelId}
          />
        )}
        <Button.Icon
          onClick={handleDownload}
          icon="download"
          title={readerText.download}
        />
        <Button.Icon
          onClick={(): void =>
            setSelectedTool(selectedTool === 'infoTab' ? undefined : 'infoTab')
          }
          icon="informationCircle"
          title={readerText.aboutTextHoarder}
          aria-pressed={selectedTool === 'infoTab' ? true : undefined}
          aria-controls={panelId}
        />
        <Button.Icon
          onClick={(): void =>
            setSelectedTool(
              selectedTool === 'preferences' ? undefined : 'preferences',
            )
          }
          icon="cog"
          title={preferencesText.preferences}
          aria-pressed={selectedTool === 'preferences' ? true : undefined}
          aria-controls={panelId}
        />
      </nav>
    </div>
  );
}
