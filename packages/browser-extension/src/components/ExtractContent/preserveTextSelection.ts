/**
 * If some text was selected before entering the reader mode, select it after
 * entering the reader mode.
 */
const startId = 'text-hoarder-selection-start-element';
const endId = 'text-hoarder-selection-end-element';
export function preserveTextSelection():
  | undefined
  | ((containerElement: Element) => void) {
  const selection = window.getSelection();
  if (selection?.isCollapsed !== false) return undefined;
  const originalSelection = selection.getRangeAt(0);

  const startMarker = insertMarkerAtOffset(
    originalSelection.startContainer,
    originalSelection.startOffset,
    startId,
  );
  const endMarker = insertMarkerAtOffset(
    originalSelection.endContainer,
    originalSelection.endOffset,
    endId,
  );
  function cleanup(): void {
    startMarker?.();
    endMarker?.();
    // Un-split the adjusting text nodes
    originalSelection.startContainer.parentElement?.normalize();
    originalSelection.endContainer.parentElement?.normalize();
  }

  // Could probably have used a yield here, but this seems more commonplace
  return (containerElement): void => {
    cleanup();
    const newStartMarker =
      containerElement.querySelector(`#${startId}`) ?? undefined;
    const newEndMarker =
      containerElement.querySelector(`#${endId}`) ?? undefined;

    // If found the markers, create a new range
    if (newStartMarker === undefined || newEndMarker === undefined) return;
    const newRange = document.createRange();
    newRange.setStartBefore(newStartMarker);
    newRange.setEndBefore(newEndMarker);

    // Add the new range to the selection
    const newSelection = window.getSelection();
    newSelection?.removeAllRanges();
    newSelection?.addRange(newRange);
  };
}

// Function to insert a marker at a specific offset in a text/element node
function insertMarkerAtOffset(
  node: Node,
  offset: number,
  markerId: string,
): undefined | (() => void) {
  const parent = node.parentNode ?? undefined;
  if (parent === undefined) return undefined;

  const endNode =
    node instanceof Text ? node.splitText(offset) : node.childNodes[offset];

  // Create a new span element to serve as a marker
  const marker = document.createElement('span');
  marker.style.display = 'contents';
  marker.id = markerId;

  // Insert the marker before the second part of the split text node
  parent.insertBefore(marker, endNode);

  return (): void => marker.remove();
}
