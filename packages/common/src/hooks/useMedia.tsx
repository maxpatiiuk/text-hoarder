import React from 'react';
import { eventListener } from '../utils/events';

export function useMedia(query: string): boolean {
  const media = React.useMemo(() => globalThis.matchMedia(query), [query]);
  const eventsTarget = React.useMemo(
    () => eventListener<{ readonly change: undefined }>(media),
    [media],
  );
  const [matches, setMatches] = React.useState(media.matches);
  React.useEffect(
    () => eventsTarget.on('change', () => setMatches(media.matches), true),
    [eventsTarget, media],
  );
  return matches;
}
