import { catchErrors } from '@common/components/Errors/assert';
import { cliText } from '@common/localization/cliText';
import fs from 'node:fs';
import { join } from 'node:path';

export const metaFileName = '.text-hoarder.json';

type MetaFile = {
  readonly _description: string;
  readonly version: string;
};

export function readMetaFile(repositoryRoot: string): MetaFile {
  const rawContent = fs.existsSync(metaFileName)
    ? fs.readFileSync(join(repositoryRoot, metaFileName)).toString()
    : '{}';
  const content = catchErrors(() => JSON.parse(rawContent)) ?? {};

  return {
    ...content,
    _description: content._description ?? cliText.metaFileComment,
    version:
      typeof content.version === 'string'
        ? content.version
        : process.env.TEXT_HOARDER_VERSION,
  };
}

export function saveMetaFile(repositoryRoot: string, metaFile: MetaFile): void {
  fs.writeFileSync(
    join(repositoryRoot, metaFileName),
    JSON.stringify(metaFile, null, 4),
  );
}
