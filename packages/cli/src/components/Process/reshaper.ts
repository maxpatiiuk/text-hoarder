import { RA, isDefined } from '@common/utils/types';

/**
 * Run through several processing steps to prepare the text for
 * text-to-speech
 */
export function reshapeText(
  excludeList: ReadonlySet<string>,
  removeRepeated: boolean,
): (rawText: string) => RA<string> {
  const previousLines = new Set<string>();
  return (rawText: string) =>
    rawText
      .split('\n')
      .map((line) => {
        const trimmed = line.trimEnd();
        if (
          excludeList.has(trimmed) ||
          (removeRepeated && previousLines.has(trimmed))
        )
          return undefined;
        if (removeRepeated) previousLines.add(trimmed);
        return trimmed || undefined;
      })
      .filter(isDefined);
}
