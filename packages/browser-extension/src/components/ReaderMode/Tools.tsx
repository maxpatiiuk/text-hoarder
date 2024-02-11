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
import { SaveText, buildRepositoryUrl, useExistingFile } from './SaveText';
import { ActivateExtension, listenEvent } from '../Background/messages';
import { Link } from '@common/components/Atoms/Link';
import { loadingGif, useLoading } from '@common/hooks/useLoading';
import { className } from '@common/components/Atoms/className';

export function Tools({
  simpleDocument,
  style,
  activatedReason,
}: {
  readonly simpleDocument: SimpleDocument;
  readonly style: React.CSSProperties;
  readonly activatedReason: ActivateExtension['action'];
}): JSX.Element {
  const [selectedTool, setSelectedTool] = React.useState<
    undefined | 'saveText' | 'editText' | 'infoTab' | 'preferences'
  >(undefined);
  const handleClose = React.useCallback(() => setSelectedTool(undefined), []);

  const [collapsed, setCollapsed] = useStorage('reader.toolsCollapsed');

  const [_, __, catchErrors] = useLoading();
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

  const handleActivated = React.useCallback(
    (action: ActivateExtension['action']) =>
      action === 'saveText' || action === 'editText'
        ? setSelectedTool(action)
        : action === 'download'
          ? handleDownload()
          : undefined,
    [handleDownload],
  );

  const [allowBackgroundKeyboardShortcuts] = useStorage(
    'reader.allowBackgroundKeyboardShortcuts',
  );
  const allowBackgroundKeysRef = React.useRef(allowBackgroundKeyboardShortcuts);
  const activatedReasonRef = React.useRef(activatedReason);
  React.useEffect(() => {
    if (allowBackgroundKeysRef.current) {
      allowBackgroundKeysRef.current = false;
      handleActivated(activatedReasonRef.current);
    }
  }, []);

  React.useEffect(
    () =>
      listenEvent('ActivateExtension', ({ action }) => handleActivated(action)),
    [handleActivated],
  );

  // Close on outside click
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(
    () =>
      selectedTool === undefined || containerRef.current === null
        ? undefined
        : listen(containerRef.current.getRootNode(), 'click', (event) =>
            event.target instanceof Element &&
            containerRef.current?.contains(event.target) === false &&
            /*
             * If the button was removed from DOM on click, it won't be inside
             * of it's parent anymore, but doesn't mean it's an outside click
             */
            event.target.isConnected === true
              ? handleClose()
              : undefined,
          ),
    [selectedTool, handleClose],
  );

  const [existingFile, setExistingFile] = useExistingFile();
  const [repository] = useStorage('setup.repository');
  const panelId = React.useId();

  const [unfocusedMenuOpacity] = useStorage('reader.unfocusedMenuOpacity');

  return (
    <div
      className={`
        fixed top-0 right-0 flex backdrop-blur rounded-es print:hidden
        bg-white/80 dark:bg-black/70 max-h-full
        ${className.baseText}
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
        // REFACTOR: use popover once it's well supported
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
        {selectedTool === 'saveText' || !collapsed ? (
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
        ) : undefined}
        {selectedTool === 'saveText' || !collapsed ? (
          typeof existingFile === 'string' && typeof repository === 'object' ? (
            <Link.Icon
              href={buildRepositoryUrl(repository, existingFile)}
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
          )
        ) : undefined}
        {!collapsed && (
          <Button.Icon
            onClick={handleDownload}
            icon="download"
            title={readerText.download}
          />
        )}
        {selectedTool === 'infoTab' || !collapsed ? (
          <Button.Icon
            onClick={(): void =>
              setSelectedTool(
                selectedTool === 'infoTab' ? undefined : 'infoTab',
              )
            }
            icon="informationCircle"
            title={readerText.aboutTextHoarder}
            aria-pressed={selectedTool === 'infoTab' ? true : undefined}
            aria-controls={panelId}
          />
        ) : undefined}
        {selectedTool === 'preferences' || !collapsed ? (
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
        ) : undefined}
        <Button.Icon
          onClick={(): void => setCollapsed(!collapsed)}
          icon={collapsed ? 'chevronDown' : 'chevronUp'}
          title={
            collapsed
              ? preferencesText.expandMenu
              : preferencesText.collapseMenu
          }
          aria-label={preferencesText.collapseMenu}
          aria-pressed={collapsed ? true : undefined}
        />
      </nav>
    </div>
  );
}
