import React from 'react';
import { RA } from '../utils/types';
import { useBooleanState } from './useBooleanState';
import { crash } from '../components/Errors/assert';
import { readerText } from '../localization/readerText';

/**
 * Display a modal loading dialog while promise is resolving.
 * Also, catch and handle erros if promise is rejected.
 * If multiple promises are resolving at the same time, the dialog is
 * visible until all promises are resolved.
 * This prevents having more than one loading dialog visible at the same time.
 */
export function useLoading(): readonly [
  isLoading: boolean,
  loading: (promise: Promise<unknown>) => void,
] {
  const [isLoading, handleLoading, handleLoaded] = useBooleanState();

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
        })
        .catch(crash);
    },
    [handleLoading, handleLoaded],
  );

  return [isLoading, loadingHandler];
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
