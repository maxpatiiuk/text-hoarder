import React from 'react';
import { preferencesText } from '../../localization/preferencesText';
import { ErrorMessage, Label } from '../Atoms';
import { Button } from '../Atoms/Button';
import { Textarea } from '../Atoms/Input';
import { extractOrigins, preparePatterns } from '../ReaderMode/matchUrl';
import { RA } from '../../utils/types';
import { IsPreferencesStandalone } from './Context';
import { useStorage } from '../../hooks/useStorage';
import { LoadingContext } from '../Contexts/Contexts';

export function AutoTriggerUrls(
  value: string,
  setValue: (newValue: string, apply: boolean) => void,
): JSX.Element {
  const updateValue = React.useCallback(
    (rawValue: string): void => {
      const newValue = normalizeUrls(rawValue);
      setValue(newValue, true);
    },
    [setValue],
  );

  const isStandalone = React.useContext(IsPreferencesStandalone);
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
        />
      </Label.Block>
      {!isStandalone && (
        <div className="flex gap-1 flex-wrap">
          <Button.Info
            onClick={(): void => updateValue(`${value}\n${location.origin}`)}
          >
            {preferencesText.addCurrentSite}
          </Button.Info>
          <Button.Info
            onClick={(): void =>
              updateValue(
                `${value}\n${location.origin}/${
                  location.pathname.split('/')[1]
                }`,
              )
            }
          >
            {preferencesText.addCurrentSiteWithSuffix(
              location.pathname.split('/')[1],
            )}
          </Button.Info>
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

// FIXME: add prompt and button to ask for missing permissions
// FIXME: add button to give all permissions at once

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

  const loading = React.useContext(LoadingContext);
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
        <Button.Info onClick={(): void => chrome.runtime.openOptionsPage()}>
          {preferencesText.openPreferences}
        </Button.Info>
      )}
    </div>
  ) : undefined;
}
// FIXME: don't ask if already has access to all

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
