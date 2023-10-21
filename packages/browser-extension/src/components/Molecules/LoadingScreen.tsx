import React from 'react';
import { LoadingContext } from '../Contexts/Contexts';

export function LoadingScreen(): null {
  const loading = React.useContext(LoadingContext);
  const resolveRef = React.useRef<() => void>();
  React.useEffect(() => {
    loading(
      new Promise<void>((resolve) => {
        resolveRef.current = resolve;
      }),
    );
    return (): void => resolveRef.current?.();
  }, [loading]);

  return null;
}
