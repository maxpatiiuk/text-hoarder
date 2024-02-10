import React from 'react';
import { RA } from '../utils/types';
import { useBooleanState } from './useBooleanState';
import { readerText } from '../localization/readerText';

// LOW: don't set isLoading if occurs only briefly. https://github.com/specify/specify7/blob/e7d7e29cf72641ad61ab65efd823d3dac13df18c/specifyweb/frontend/js_src/lib/components/Core/Contexts.tsx#L149-L188
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
  const loadingHandler = React.useCallback(
    (promise: Promise<unknown>): void => {
      const holderId = holders.current.length;
      holders.current = [...holders.current, holderId];
      handleLoading();
      promise
        .finally(() => {
          holders.current = holders.current.filter((item) => item !== holderId);
          if (holders.current.length === 0) handleLoaded();
          setError(undefined);
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
