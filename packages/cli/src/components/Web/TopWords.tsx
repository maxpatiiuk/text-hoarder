import { IR, RA } from '@common/utils/types';
import { className } from '@common/components/Atoms/className';
import { H3 } from '@common/components/Atoms';
import React from 'react';
import { statsText } from '@common/localization/statsText';
import { Table } from '@common/components/Atoms/Table';
import { formatNumber } from '@common/components/Atoms/Internationalization';
import { icons } from '@common/components/Atoms/Icons';

export function TopWords({
  topWords,
  previous,
}: {
  readonly topWords: IR<number>;
  readonly previous: IR<number> | undefined;
}): JSX.Element {
  const hasPrevious = typeof previous === 'object';
  const last = hasPrevious ? Object.keys(previous) : undefined;
  return (
    <article className={`flex flex-1 flex-col gap-2 ${className.widget}`}>
      <H3>{statsText.mostCommonWords}</H3>
      <Table.Container
        className={`${className.strippedTable} ${
          hasPrevious ? 'grid-cols-[auto,auto,1fr]' : 'grid-cols-[auto,1fr]'
        } max-h-[80vh]`}
      >
        <Table.Head>
          <Table.Row>
            {hasPrevious && (
              <Table.Header scope="col">{statsText.position}</Table.Header>
            )}
            <Table.Header scope="col">{statsText.occurrences}</Table.Header>
            <Table.Header scope="col">{statsText.word}</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {Object.entries(topWords).map(([word, count], index) => (
            <Table.Row key={word}>
              {hasPrevious && (
                <Table.Cell>
                  <Position index={index} name={word} last={last} />
                </Table.Cell>
              )}
              <Table.Cell>{formatNumber(count)}</Table.Cell>
              <Table.Cell>{word}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </article>
  );
}

export function Position({
  index,
  name,
  last,
}: {
  readonly index: number;
  readonly name: string;
  readonly last: RA<string> | undefined;
}): JSX.Element {
  const previousIndex = last?.indexOf(name);
  return (
    <>
      {formatNumber(index + 1)}
      {previousIndex === undefined ||
      previousIndex === index ? undefined : previousIndex === -1 ||
        previousIndex > index ? (
        <span className="contents text-green-500">
          {icons.chevronUp}
          {previousIndex === -1 ? '∞' : formatNumber(previousIndex - index)}
        </span>
      ) : (
        <span className="contents text-red-500">
          {icons.chevronDown}
          {formatNumber(index - previousIndex)}
        </span>
      )}
    </>
  );
}
