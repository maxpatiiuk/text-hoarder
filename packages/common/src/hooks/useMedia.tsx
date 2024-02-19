import React from 'react';
import { listen } from '../utils/events';

export function useMedia(query: string): boolean {
  const media = React.useMemo(() => globalThis.matchMedia(query), [query]);
  const [matches, setMatches] = React.useState(media.matches);
  React.useEffect(
    () =>
      listen(media, 'change', () => setMatches(media.matches), {
        capture: true,
      }),
    [media, media],
  );
  return matches;
}
