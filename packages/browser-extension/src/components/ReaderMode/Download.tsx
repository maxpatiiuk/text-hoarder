import React from 'react';
import { readerText } from '../../localization/readerText';
import { H2 } from '../Atoms';
import { SimpleDocument } from '../ExtractContent/documentToSimpleDocument';

export function Download({
  simpleDocument,
}: {
  readonly simpleDocument: SimpleDocument;
}): JSX.Element {
  return (
    <>
      <H2>{readerText.download}</H2>
    </>
  );
}
