import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

export function ApplyTheme({
  container,
}: {
  readonly container: Element;
}): undefined {
  const isDarkMode = useDarkMode();
  const className = isDarkMode ? 'dark' : 'light';
  React.useEffect(() => {
    container.classList.add(className);
    return (): void => container.classList.remove(className);
  }, [container, className]);
}
