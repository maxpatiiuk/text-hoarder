import { SECOND } from '@common/components/Atoms/timeUnits';
import { cliText } from '@common/localization/cliText';

export function reshapingStats(): {
  readonly addFile: (
    originalLines: number,
    originalNonEmptyLines: number,
    finalLines: number,
  ) => void;
  readonly output: () => void;
} {
  const start = Date.now();
  let totalOriginalLines = 0;
  let totalOriginalNonEmptyLines = 0;
  let totalFinalLines = 0;
  let totalFiles = 0;
  return {
    addFile: (
      originalLines: number,
      originalNonEmptyLines: number,
      finalLines: number,
    ) => {
      totalFiles += 1;
      totalOriginalLines += originalLines;
      totalOriginalNonEmptyLines += originalNonEmptyLines;
      totalFinalLines += finalLines;
    },
    output: () => {
      const end = Date.now();
      const timePassed = Math.max(1, Math.round((end - start) / SECOND));
      console.log(
        cliText.processedFiles(totalFiles, timePassed),
        '\n',
        cliText.processStatsResult(
          totalOriginalLines,
          totalOriginalNonEmptyLines,
          totalFinalLines,
        ),
      );
    },
  };
}
