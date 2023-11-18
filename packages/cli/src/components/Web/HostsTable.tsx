import { GetSet, IR } from '@common/utils/types';
import { StatsCounts } from '../Stats/computeStats';
import { className } from '@common/components/Atoms/className';
import { H3 } from '@common/components/Atoms';
import React from 'react';
import { statsText } from '@common/localization/statsText';
import { Table } from '@common/components/Atoms/Table';
import { formatNumber } from '@common/components/Atoms/Internationalization';
import { Button } from '@common/components/Atoms/Button';

export function HostsTable({
  hostsStats,
  activeHost: [activeHost, setActiveHost],
}: {
  readonly hostsStats: IR<StatsCounts>;
  readonly activeHost: GetSet<string | undefined>;
}): JSX.Element {
  return (
    <article className={`flex flex-1 flex-col gap-2 ${className.widget}`}>
      <H3>{statsText.topWebsites}</H3>
      <Table.Container
        className={`${className.strippedTable} grid-cols-[auto,1fr]`}
      >
        <Table.Head>
          <Table.Row>
            <Table.Header scope="col">{statsText.savedArticles}</Table.Header>
            <Table.Header scope="col">{statsText.website}</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {Object.entries(hostsStats).map(([host, { count }]) => (
            <Table.Row key={host}>
              <Table.Cell>
                <Button.LikeLink
                  aria-pressed={activeHost === host ? 'true' : undefined}
                  onClick={(): void =>
                    setActiveHost(activeHost === host ? undefined : host)
                  }
                >
                  {formatNumber(count)}
                </Button.LikeLink>
                {}
              </Table.Cell>
              <Table.Cell>{host}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </article>
  );
}
