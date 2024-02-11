import { savedFileExtension } from '@common/utils/encoding';
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

export async function tagsToFileMeta(
  tags: RA<string>,
  git: SimpleGit,
): Promise<FilesWithTags> {
  const initialCommit = await git.firstCommit();
  return Promise.all(
    [...tags, undefined].map(async (tag, index) => {
      const { all: tagCommits } = await git.log({
        format: { date: '%aI' },
        '--name-only': null,
        from: tags[index - 1] ?? initialCommit,
        to: tag ?? 'HEAD',
        symmetric: false,
      });

      return tagCommits.flatMap(
        ({ date, diff }) =>
          diff?.files
            .filter(
              ({ file }) =>
                // Exclude non-markdown
                extname(file) === savedFileExtension &&
                // Exclude files not-containing a year in path (README.md)
                !Number.isNaN(Number.parseInt(file.split('/')[0])),
            )
            .map(({ file }) => [file, new Date(date), tag] as const) ?? [],
      );
    }),
  ).then((entries) =>
    /*
     * For each file edited within a tag, preserve only the earliest date
     * edited. This allows for fixing content extraction mistakes in older
     * articles, without pushing them into most recent tag
     */
    entries
      .flat()
      .reduce<Writable<FilesWithTags>>((reduced, [file, date, tag]) => {
        if (reduced[file] !== undefined && reduced[file]?.date < date)
          return reduced;
        reduced[file] = { date, tag };
        return reduced;
      }, {}),
  );
}
