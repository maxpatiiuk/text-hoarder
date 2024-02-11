import React from 'react';
import { renderStandalonePage } from '../Core/StandalonePage';
import { statsText } from '@common/localization/statsText';
import { EnsureAuthenticated } from '../Auth';
import { ErrorMessage, H1 } from '@common/components/Atoms';
import { Button } from '@common/components/Atoms/Button';
import { loadingGif, useLoading } from '@common/hooks/useLoading';
import { Link } from '@common/components/Atoms/Link';
import { urls } from '../../../config';

renderStandalonePage(statsText.stats, 'wide', <StatsPage />);

const FilePicker =
  process.env.NODE_ENV === 'development'
    ? React.lazy(() =>
        import('@common/components/Molecules/FilePicker').then(
          ({ FilePicker }) => ({ default: FilePicker }),
        ),
      )
    : undefined;
const Picker = FilePicker!;
const canUncompress = 'DecompressionStream' in globalThis;

const worker = new Worker(chrome.runtime.getURL('dist/statsWorker.bundle.js'));

function StatsPage(): JSX.Element {
  const [contents, setContents] = React.useState<string | undefined>(undefined);
  const [isLoading, error, loading] = useLoading();
  return (
    <EnsureAuthenticated>
      <H1>{statsText.stats}</H1>
      <p>{statsText.statsDescription}</p>
      <Button.Info disabled={!canUncompress}>
        {statsText.beginDownload}
      </Button.Info>
      {canUncompress ? (
        <p>{statsText.makeTakeSomeTime}</p>
      ) : (
        <ErrorMessage>
          {statsText.statsUnsupported((label) => (
            <Link.Default href={urls.statsDocs}>{label}</Link.Default>
          ))}
        </ErrorMessage>
      )}
      {process.env.NODE_ENV === 'development' ? (
        <Picker
          acceptedFormats={['gz']}
          onFileSelected={(file): void => {
            const fileStream = file.stream();
            worker.postMessage(fileStream, [fileStream]);
            loading(
              new Promise((resolve, reject) => {
                worker.addEventListener('message', resolve, {
                  once: true,
                  passive: true,
                });
                worker.addEventListener('error', reject, {
                  once: true,
                  passive: true,
                });
              })
                .then(console.log)
                .finally(() => worker.terminate()),
            );
          }}
        />
      ) : undefined}
      {isLoading && loadingGif}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </EnsureAuthenticated>
  );
}
