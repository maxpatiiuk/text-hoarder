import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

export function ApplyTheme({
  container,
}: {
  readonly container: HTMLElement;
}): undefined {
  const isDarkMode = useDarkMode();
  const className = isDarkMode ? 'dark' : 'light';
  React.useEffect(() => {
    container.classList.add(className);
    container.style.colorScheme = isDarkMode ? 'dark' : 'light';
    return (): void => container.classList.remove(className);
  }, [container, className]);
}
