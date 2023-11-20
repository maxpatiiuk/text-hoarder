import {
  legacySavedFileExtension,
  savedFileExtension,
} from '@common/utils/encoding';
import { RA, RR, Writable } from '@common/utils/types';
import { extname } from 'node:path';
import { SimpleGit } from 'simple-git';

export type FilesWithTags = RR<
  string,
  {
    readonly date: Date;
    readonly tag: string | undefined;
  }
>;

export const tagsToFileMeta = (
  tags: RA<string>,
  git: SimpleGit,
): Promise<FilesWithTags> =>
  Promise.all(
    [...tags, undefined].map(async (tag, index) => {
      const isFirst = index === 0;
      const isLast = tag === undefined;
      const { all: tagCommits } = await git.log({
        format: { date: '%aI' },
        '--name-only': null,
        // Workaround for https://github.com/steveukx/git-js/issues/956
        ...(isFirst
          ? tag === undefined
            ? {}
            : { [tag]: null }
          : {
              from: tags[index - 1],
              to: isLast ? undefined : tag,
              symmetric: false,
            }),
      });

      return tagCommits.flatMap(
        ({ date, diff }) =>
          diff?.files
            .filter(
              ({ file }) =>
                // Exclude non-markdown
                (extname(file) === savedFileExtension ||
                  extname(file) === legacySavedFileExtension) &&
                // Exclude files not-containing a year in path (README.md)
                !Number.isNaN(Number.parseInt(file.split('/')[0])),
            )
            .map(({ file }) => [file, new Date(date), tag] as const) ?? [],
      );
    }),
  ).then((entries) =>
    // For each file edited within a tag, preserve only the most recent date edited
    entries
      .flat()
      .reduce<Writable<FilesWithTags>>((reduced, [file, date, tag]) => {
        if (reduced[file] !== undefined && reduced[file]?.date > date)
          return reduced;
        reduced[file] = { date, tag };
        return reduced;
      }, {}),
  );
