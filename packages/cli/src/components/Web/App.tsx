import { H1, H2, WidgetSection } from '@common/components/Atoms';
import { commonText } from '@common/localization/commonText';
import React from 'react';
import { StatsJson } from '../Stats/computeStats';
import { Button } from '@common/components/Atoms/Button';
import { State } from 'typesafe-reducer';
import { statsText } from '@common/localization/statsText';
import { DaysCharts } from './DaysCharts';
import { HostsTable } from './HostsTable';
import { TopWords } from './TopWords';
import { BadgeStats, gitTagToHuman } from './BadgeStats';

type Page =
  | State<'All'>
  | State<'Tag', { readonly tag: string }>
  | State<'Year', { readonly year: string }>;

export function App({ stats }: { readonly stats: StatsJson }) {
  const [page, setPage] = React.useState<Page>({ type: 'All' });
  const hasYears = Object.keys(stats.perYear).length > 0;
  const hasTags = Object.keys(stats.perTag).length > 0;
  const allButton = (
    <Button.Info
      onClick={(): void => setPage({ type: 'All' })}
      aria-pressed={page.type === 'All' ? true : undefined}
    >
      {statsText.allYears}
    </Button.Info>
  );
  return (
    <>
      <H1>{commonText.textHoarder}</H1>
      <nav>
        {hasYears && (
          <>
            <H2>{statsText.showStatsForYear}</H2>
            <div className="flex gap-2 flex-wrap">
              {allButton}
              {Object.keys(stats.perYear).map((year) => (
                <Button.Info
                  key={year}
                  onClick={(): void => setPage({ type: 'Year', year })}
                  aria-pressed={
                    page.type === 'Year' && page.year === year
                      ? true
                      : undefined
                  }
                >
                  {year}
                </Button.Info>
              ))}
            </div>
          </>
        )}
        {hasTags && (
          <>
            <H2>{statsText.showStatsForTag}</H2>
            <div className="flex gap-2 flex-wrap">
              {!hasYears && allButton}
              {Object.keys(stats.perTag).map((tag) => (
                <Button.Info
                  key={tag}
                  onClick={(): void => setPage({ type: 'Tag', tag })}
                  aria-pressed={
                    page.type === 'Tag' && page.tag === tag ? true : undefined
                  }
                >
                  {gitTagToHuman(tag)}
                </Button.Info>
              ))}
            </div>
          </>
        )}
      </nav>
      <Page stats={stats} page={page} />
    </>
  );
}

function Page({
  stats: allStats,
  page,
}: {
  readonly stats: StatsJson;
  readonly page: Page;
}): JSX.Element {
  const stats =
    page.type === 'All'
      ? allStats.allStats
      : page.type === 'Tag'
      ? allStats.perTag[page.tag]
      : allStats.perYear[page.year];

  const activeHost = React.useState<string | undefined>(undefined);
  return (
    <main className="contents">
      <H2>
        {page.type === 'All'
          ? statsText.allYears
          : page.type === 'Tag'
          ? gitTagToHuman(page.tag)
          : page.year}
      </H2>
      <BadgeStats
        allStats={allStats}
        stats={stats}
        type={page.type === 'All' ? 'perYear' : 'perTag'}
        activeHost={activeHost}
      />
      <DaysCharts stats={stats.perDay} />
      <WidgetSection className="!flex-row flex-wrap">
        <HostsTable hostsStats={stats.perHost} activeHost={activeHost} />
        <TopWords topWords={stats.topWords} />
      </WidgetSection>
    </main>
  );
}
