import { IR } from '@common/utils/types';
import { className } from '@common/components/Atoms/className';
import { H3 } from '@common/components/Atoms';
import React from 'react';
import { statsText } from '@common/localization/statsText';
import { Table } from '@common/components/Atoms/Table';
import { formatNumber } from '@common/components/Atoms/Internationalization';

export function TopWords({
  topWords,
}: {
  readonly topWords: IR<number>;
}): JSX.Element {
  return (
    <article className={`flex flex-1 flex-col gap-2 ${className.widget}`}>
      <H3>{statsText.mostCommonWords}</H3>
      <Table.Container
        className={`${className.strippedTable} grid-cols-[auto,1fr]`}
      >
        <Table.Head>
          <Table.Row>
            <Table.Header scope="col">{statsText.occurrences}</Table.Header>
            <Table.Header scope="col">{statsText.word}</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {Object.entries(topWords).map(([word, count]) => (
            <Table.Row key={word}>
              <Table.Cell>{formatNumber(count)}</Table.Cell>
              <Table.Cell>{word}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </article>
  );
}
