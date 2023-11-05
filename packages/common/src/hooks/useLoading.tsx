import React from 'react';
import { RA } from '../utils/types';
import { useBooleanState } from './useBooleanState';
import { readerText } from '../localization/readerText';

// LOW: don't set isLoading if occurs only briefly. https://github.com/specify/specify7/blob/xml-editor/specifyweb/frontend/js_src/lib/components/Core/Contexts.tsx#L149-L188
/**
 * Provide a callback that can be called with a promise. While promise is
 * resolving, this hook will set isLoading to "true". Can have multiple promises
 * in loading() at the same time - isLoading stays true until all promises are
 * resolved.
 * Also, catches and handle errors if promise is rejected.
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
        .catch(console.error);
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
