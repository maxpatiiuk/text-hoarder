export function scrollIntoView(
  element: HTMLElement,
  mode: ScrollLogicalPosition = 'nearest',
): void {
  try {
    element.scrollIntoView({
      behavior: 'smooth',
      block: mode,
      inline: mode,
    });
  } catch {
    element.scrollIntoView(mode === 'start');
  }
}

export const focusWhenRendered = (element: HTMLElement | null): void =>
  element === null ? undefined : scrollIntoView(element);
