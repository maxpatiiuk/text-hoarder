import React from 'react';
import { RA } from '../utils/types';
import { useBooleanState } from './useBooleanState';
import { readerText } from '../localization/readerText';

/**
 * Wait 50ms before displaying loading screen
 *   -> to avoid blinking a loading screen for resolved promises
 * Wait 50sm before removing loading screen
 *   -> to avoid flashing the screen when one loading screen is immediately
 *      followed by another one
 * 50ms was chosen as the longest delay that I don't notice in comparison to 0ms
 * (on an fast MacBook Pro with high refresh rate). The value might have to be
 * adjusted in the future
 */
const loadingScreenDelay = 50;

/**
 * Provide a callback that can be called with a promise. While promise is
 * resolving, this hook will set isLoading to "true". Can have multiple promises
 * in loading() at the same time - isLoading stays true until all promises are
 * resolved.
 * Also, catches and handle errors if promise is rejected.
 */
export function useLoading(): readonly [
  isLoading: boolean,
  error: string | undefined,
  loading: (promise: Promise<unknown>) => void,
] {
  const [isLoading, handleLoading, handleLoaded] = useBooleanState();
  const [error, setError] = React.useState<string | undefined>(undefined);

  const holders = React.useRef<RA<number>>([]);
  const loadingTimeout = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  const loadingHandler = React.useCallback(
    (promise: Promise<unknown>): void => {
      const holderId = Math.max(-1, ...holders.current) + 1;
      holders.current = [...holders.current, holderId];

      clearTimeout(loadingTimeout.current);
      loadingTimeout.current = setTimeout(handleLoading, loadingScreenDelay);
      promise
        .finally(() => {
          holders.current = holders.current.filter((item) => item !== holderId);
          if (holders.current.length > 0) return;

          clearTimeout(loadingTimeout.current);
          loadingTimeout.current = setTimeout(handleLoaded, loadingScreenDelay);
        })
        .catch((error) => {
          console.error(error);
          setError(error instanceof Error ? error.message : String(error));
        });
    },
    [handleLoading, handleLoaded],
  );

  return [isLoading, error, loadingHandler];
}

export const loadingGif = (
  <div className="hover:animate-hue-rotate motion-reduce:animate-hue-rotate">
    <div
      className={`
        spinner-border h-20 w-20 rounded-full border-8 border-blue-500
        motion-safe:m-px
        motion-safe:animate-spin
        motion-safe:border-r-transparent
      `}
      role="status"
    >
      <span className="sr-only">{readerText.loading}</span>
    </div>
  </div>
);
