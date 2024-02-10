import React from 'react';
import { preferencesText } from '@common/localization/preferencesText';
import { ErrorMessage, Label } from '@common/components/Atoms';
import { Button } from '@common/components/Atoms/Button';
import { Textarea } from '@common/components/Atoms/Input';
import { extractOrigins, preparePatterns } from '../ReaderMode/matchUrl';
import { RA } from '@common/utils/types';
import { IsPreferencesStandalone } from './Context';
import { useStorage } from '../../hooks/useStorage';
import { loadingGif, useLoading } from '@common/hooks/useLoading';
import { sendRequest } from '../Background/messages';
import { isUrlPartComplicated } from '@common/utils/encoding';

export function AutoTriggerUrls(
  value: string,
  setValue: (newValue: string, apply: boolean) => void,
): JSX.Element {
  const lines = React.useMemo(() => value.split('\n'), [value]);
  const updateValue = React.useCallback(
    (rawValue: string): void => {
      const newValue = normalizeUrls(rawValue);
      setValue(newValue, true);
    },
    [setValue],
  );

  const currentSite = location.origin;
  const lastPart = location.pathname.split('/')[1];
  const keepLastPart = !isUrlPartComplicated(lastPart);
  const currentPath = `${location.origin}/${lastPart}`;
  const canAddCurrentSite = !lines.includes(currentSite);
  const canAddCurrentPath = !lines.includes(currentPath) && keepLastPart;

  const isStandalone = React.useContext(IsPreferencesStandalone);
  const showButtons = !isStandalone && (canAddCurrentSite || canAddCurrentPath);

  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const scrollBottom = (): void =>
    void setTimeout(() => {
      const textArea = textAreaRef.current;
      if (textArea === null) return;
      textArea.scrollTop = textArea.scrollHeight;
      textArea.focus();
    }, 0);
  return (
    <>
      <Label.Block>
        {preferencesText.autoTriggerUrls}
        <Textarea
          value={value}
          onValueChange={(value) => setValue(value, false)}
          onBlur={(): void => updateValue(value)}
          className="h-32"
          placeholder={urlsPlaceholder}
          forwardRef={textAreaRef}
        />
      </Label.Block>
      {showButtons && (
        <div className="flex gap-1 flex-wrap">
          {canAddCurrentSite && (
            <Button.Info
              onClick={(): void => {
                updateValue(`${value}\n${currentSite}`);
                scrollBottom();
              }}
            >
              {preferencesText.addCurrentSite}
            </Button.Info>
          )}
          {canAddCurrentPath && (
            <Button.Info
              onClick={(): void => {
                updateValue(`${value}\n${currentPath}`);
                scrollBottom();
              }}
            >
              {preferencesText.addCurrentSiteWithSuffix(lastPart)}
            </Button.Info>
          )}
        </div>
      )}
      <RequestUrlPermissions position="inline" />
    </>
  );
}

const urlsPlaceholder = [
  '# One URL per line',
  '# Optional comments may start with #',
  'wikihow.com',
  '# * means match anything except /',
  '# ** means match anything',
  'https://wired.com/story/*',
  '# if starts with ^, then matches using regex',
  '^(https?://)?(www.)?google.com(.ua)?[/\\]?(search.*)?$',
].join('\n');

const normalizeUrls = (urls: string) =>
  Array.from(new Set(urls.split('\n').map((url) => url.trim())))
    .join('\n')
    .trim();

export function RequestUrlPermissions({
  position,
}: {
  readonly position: 'top' | 'inline';
}): JSX.Element | undefined {
  const isStandalone = React.useContext(IsPreferencesStandalone);
  const [existingPermissions] = useStorage('extension.permissions');

  const [rawMatchUrls] = useStorage('reader.autoTriggerUrls');
  const permissionDiff = React.useMemo(() => {
    if (existingPermissions === undefined) return;
    const currentOrigins = existingPermissions.origins ?? [];

    if (
      currentOrigins.includes('https://*/*') &&
      currentOrigins.includes('http://*/*')
    )
      return { addedOrigins: [], removedOrigins: [] };

    const matchUrls = preparePatterns(rawMatchUrls);
    const origins = extractOrigins(matchUrls);
    const existingOrigins = extractOrigins(currentOrigins);
    const addedOrigins = Array.from(origins).filter(
      (origin) => !existingOrigins.has(origin),
    );
    const removedOrigins = Array.from(existingOrigins).filter(
      (origin) => !origins.has(origin),
    );
    return { addedOrigins, removedOrigins };
  }, [existingPermissions, rawMatchUrls]);

  const isMissingPermissions =
    typeof permissionDiff === 'object' &&
    permissionDiff.addedOrigins.length > 0;

  const [isErrorOnLoad, setIsErrorOnLoad] = React.useState<boolean | undefined>(
    undefined,
  );
  React.useEffect(() => {
    if (isErrorOnLoad === undefined && permissionDiff !== undefined)
      setIsErrorOnLoad(isMissingPermissions);
    else if (isErrorOnLoad === true && !isMissingPermissions)
      setIsErrorOnLoad(false);
  }, [isErrorOnLoad, isMissingPermissions, permissionDiff]);
  const isOnTop = position === 'top';
  const visible = isOnTop === isErrorOnLoad;

  const [isLoading, loading] = useLoading();
  return isMissingPermissions && visible ? (
    <div className="flex flex-col gap-2">
      <ErrorMessage>
        {preferencesText.missingRequiredPermissions}
        <ul className="list-disc pl-4">
          {permissionDiff.addedOrigins.map((origin) => (
            <li key={origin}>{origin}</li>
          ))}
        </ul>
        {!isStandalone && preferencesText.giveAccessInPreferences}
      </ErrorMessage>
      {isStandalone ? (
        <div className="flex gap-2 flex-wrap">
          <Button.Info
            onClick={(): void =>
              loading(
                giveSitePermissions(
                  permissionDiff.addedOrigins,
                  permissionDiff.removedOrigins,
                ),
              )
            }
          >
            {preferencesText.giveAccessToSites}
          </Button.Info>
          <Button.Info onClick={(): void => loading(giveAllPermissions())}>
            {preferencesText.giveAccessToEverySite}
          </Button.Info>
        </div>
      ) : (
        <Button.Info
          onClick={(): void => void sendRequest('OpenPreferences', undefined)}
        >
          {preferencesText.openPreferences}
        </Button.Info>
      )}
      {isLoading && loadingGif}
    </div>
  ) : undefined;
}

async function giveSitePermissions(
  addedOrigins: RA<string>,
  removedOrigins: RA<string>,
): Promise<void> {
  if (addedOrigins.length > 0)
    await chrome.permissions
      .request({
        origins: formatOrigins(addedOrigins) as string[],
      })
      .catch(console.error);

  if (removedOrigins.length > 0)
    await chrome.permissions
      .remove({
        origins: formatOrigins(removedOrigins) as string[],
      })
      .catch(console.error);
}

const giveAllPermissions = async (): Promise<void> =>
  chrome.permissions
    .request({
      origins: formatOrigins(['*']) as string[],
    })
    .then(() => undefined);

const formatOrigins = (origins: RA<string>): RA<string> =>
  Array.from(origins).flatMap((origin) => [
    `https://${origin}/`,
    `http://${origin}/`,
  ]);
