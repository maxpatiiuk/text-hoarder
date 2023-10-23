import React from 'react';
import { Button } from '../Atoms/Button';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';
import { readerText } from '../../localization/readerText';
import { Preferences } from './Preferences';
import { Download } from './Download';
import { listen } from '../../utils/events';
import { preferencesText } from '../../localization/preferencesText';

export function Tools({
  simpleDocument,
}: {
  readonly simpleDocument: SimpleDocument;
}): JSX.Element {
  const [selectedTool, setSelectedTool] = React.useState<
    undefined | 'preferences' | 'download'
  >(undefined);

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

  return (
    <div
      className="absolute top-0 right-0 flex backdrop-blur rounded-es bg-white/80 dark:bg-black/70 opacity-75 hover:opacity-100"
      ref={containerRef}
    >
      {selectedTool !== undefined && (
        <aside className="flex flex-col gap-4 p-4 pt-0">
          {selectedTool === 'download' ? (
            <Download simpleDocument={simpleDocument} />
          ) : (
            <Preferences />
          )}
        </aside>
      )}
      <nav
        className="flex flex-col p-2 gap-2 text-[130%] "
        aria-label={readerText.tools}
      >
        <Button.Icon
          onClick={(): void =>
            setSelectedTool(
              selectedTool === 'download' ? undefined : 'download',
            )
          }
          icon="download"
          title={readerText.download}
          aria-pressed={selectedTool === 'download' ? true : undefined}
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
        />
      </nav>
    </div>
  );
}