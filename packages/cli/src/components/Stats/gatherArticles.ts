import { encoding } from '@common/utils/encoding';
import fs from 'fs/promises';
import { join } from 'path';
import { markdownToText } from '../../../../browser-extension/src/components/ExtractContent/markdownToText';
import { FilesWithTags } from './getFileTags';

export const gatherArticles = async (
  cwd: string,
  filesWithTags: FilesWithTags,
  callback: (article: Article) => void,
): Promise<void> =>
  Promise.all(
    Object.entries(filesWithTags).map(async ([fileName, { date, tag }]) => {
      const path = join(cwd, fileName);
      const [year, url] = encoding.urlToPath.decode(fileName);
      return (
        fs
          .readFile(path, 'utf8')
          .then((fileContent) => {
            const fileText = markdownToText(fileContent)
              .trim()
              .replaceAll('’', "'")
              .split('\n');
            const title = fileText[0];
            const content = fileText.slice(1).join('\n').trim();

            callback({
              year,
              url,
              title,
              content,
              date,
              tag,
            });
          })
          // Happens if the file was deleted (filesWithTags includes deleted files)
          .catch(() => undefined)
      );
    }),
  ).then(() => undefined);

export type Article = {
  readonly year: number;
  readonly url: string;
  readonly title: string;
  readonly content: string;
  readonly date: Date;
  readonly tag: string | undefined;
};
