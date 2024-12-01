import { savedFileExtension, encoding } from '@common/utils/encoding';
import { RA } from '@common/utils/types';
import { getUniqueName } from '@common/utils/uniquifyName';
import { relative, sep, join } from 'path';
import { markdownToText } from '../../../../browser-extension/src/components/ExtractContent/markdownToText';
import fs from 'node:fs';
import { reshapingStats } from './stats';
import { cliText } from '@common/localization/cliText';
import { commonText } from '@common/localization/commonText';

/*
 * Max length of a Windows path is 260, but this accounts for file extension and
 * uniqueness padding
 */
const maxSafeWindowsPath = 250;
// See https://serverfault.com/a/9548/522337
const maxFileNameLength = 255;
const minTitleLength = 20;
export function textProcessor(
  rootDir: string,
  outputDir: string,
  forceOutputDir: boolean,
  split: number,
  reshaper: (text: string) => RA<string>,
): {
  readonly file: (file: string, date?: Date) => void;
  readonly complete: () => void;
} {
  if (
    process.platform === 'win32' &&
    outputDir.length + minTitleLength > maxSafeWindowsPath
  )
    console.warn(cliText.outputPathTooLong);

  const maxLength =
    // Trim long titles on Windows, if output dir itself is not too long
    process.platform === 'win32' &&
    outputDir.length + minTitleLength < maxSafeWindowsPath
      ? maxSafeWindowsPath - outputDir.length
      : maxFileNameLength - savedFileExtension.length;

  console.log(cliText.processingFiles);

  const stats = reshapingStats();
  const usedNames: string[] = [];

  let prepareDirectory: (() => void) | undefined = () => {
    const directoryExists =
      fs.existsSync(outputDir) && fs.readdirSync(outputDir).length !== 0;
    if (directoryExists)
      if (forceOutputDir) fs.rmSync(outputDir, { recursive: true });
      else {
        console.error(cliText.outputDirAlreadyExits(outputDir));
        process.exit(1);
      }
    fs.mkdirSync(outputDir, { recursive: true });
  };

  return {
    file(file, date) {
      /**
       * Only delete previous directory contents once at least one file is
       * going to be outputted, so that directory is not needlessly deleted
       * if an error occurs
       */
      prepareDirectory?.();
      prepareDirectory = undefined;

      const relativeFile = relative(rootDir, file);
      const relativeMatchIndex = relativeFile.match(reYearInPath)?.index;
      // Try to align the path so that it begins with the year
      let alignedPath = relativeFile;
      if (relativeMatchIndex !== undefined)
        alignedPath = relativeFile.slice(relativeMatchIndex);
      else {
        const absoluteMatchIndex = file.match(reYearInPath)?.index;
        if (absoluteMatchIndex !== undefined)
          alignedPath = file.slice(absoluteMatchIndex);
      }

      console.log(relativeFile);
      const [year, url] = encoding.urlToPath.decode(alignedPath);

      // Check if the path was created by Text Hoarder
      const fullHost = Number.isNaN(year) ? undefined : new URL(url).hostname;
      const host =
        fullHost?.startsWith('www.') === true
          ? fullHost.slice('www.'.length)
          : fullHost;

      const rawText = readFile(file);
      if (rawText === undefined) return;

      const { birthtime: createdDate, mtime: modifiedDate } =
        date === undefined
          ? fs.statSync(file)
          : {
              birthtime: date,
              mtime: date,
            };

      const text = file.endsWith(savedFileExtension)
        ? markdownToText(rawText)
        : rawText;
      const lines = rawText.split('\n');
      const oldLines = lines.length;
      const oldNonBlankLines = lines.filter(Boolean).length;
      const processedText = reshaper(text);
      const newText = processedText.join('\n');
      const newLines = processedText.length;
      // Reshaper might remove all lines if article was duplicated
      if (newLines === 0) return;
      stats.addFile(oldLines, oldNonBlankLines, newLines);

      const title =
        encoding.fileTitle.encode(processedText[0]) ||
        encoding.fileTitle.encode(
          file
            .split(sep)
            .at(-1)
            ?.replace(/\.\w+$/, '') || '',
        ) ||
        encoding.fileTitle.encode(commonText.textHoarder);
      const splitText = splitFile(newText, split);
      const padLength = splitText.length.toString().length;

      const uniqueNames = splitText.map((text) => {
        const newName = getUniqueName(
          host === undefined ? title : `${host} - ${title}`,
          usedNames,
          maxLength,
          'title',
          padLength,
        );
        usedNames.push(newName);
        return [join(outputDir, `${newName}.txt`), text];
      });

      uniqueNames.forEach(([path, text]) => {
        fs.writeFileSync(path, text);
        fs.utimesSync(path, createdDate, modifiedDate);
      });
    },
    complete: () => {
      console.log(cliText.outputted(outputDir));
      stats.output();
    },
  };
}

const reYearInPath = /(^|[\/\\])2\d{3}[\/\\]/u;

function readFile(fileName: string): string | undefined {
  try {
    return fs.readFileSync(fileName, 'utf8');
  } catch {
    console.error('Failed to read the file. Skipping it');
    return undefined;
  }
}

function splitFile(text: string, maxSize: number): RA<string> {
  if (maxSize === 0 || text.length < maxSize) return [text];
  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';
  lines.forEach((line) => {
    if (currentChunk.length + line.length >= maxSize) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += `${line}\n`;
  });
  chunks.push(currentChunk);
  return chunks;
}
