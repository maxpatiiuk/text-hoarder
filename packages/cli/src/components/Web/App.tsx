import { H1, H2, Label, WidgetSection } from '@common/components/Atoms';
import { commonText } from '@common/localization/commonText';
import React from 'react';
import { StatsJson } from '../Stats/computeStats';
import { State } from 'typesafe-reducer';
import { statsText } from '@common/localization/statsText';
import { DaysCharts } from './DaysCharts';
import { HostsTable } from './HostsTable';
import { TopWords } from './TopWords';
import { BadgeStats, gitTagToHuman } from './BadgeStats';
import { Select } from '@common/components/Atoms/Input';

type Page =
  | State<'All'>
  | State<'Tag', { readonly tag: string }>
  | State<'Year', { readonly year: string }>;

export function App({ stats }: { readonly stats: StatsJson }) {
  const [page, setPage] = React.useState<Page>({ type: 'All' });
  const allTags = Object.keys(stats.perTag);
  return (
    <>
      <H1>{commonText.textHoarder}</H1>
      <Label.Inline className="gap-2">
        {statsText.filter}
        <Select
          value={
            page.type === 'All'
              ? 'All'
              : page.type === 'Tag'
              ? `Tag:${page.tag}`
              : page.year
          }
          onValueChange={(value): void =>
            value === 'All'
              ? setPage({ type: 'All' })
              : value.startsWith('tag:')
              ? setPage({ type: 'Tag', tag: value.slice('Tag:'.length) })
              : setPage({ type: 'Year', year: value })
          }
        >
          <option value="All">{statsText.allYears}</option>
          <optgroup label={statsText.years}>
            {Object.keys(stats.perYear).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </optgroup>
          {allTags.length > 0 && (
            <optgroup label={statsText.tags}>
              {allTags.map((tag) => (
                <option key={tag} value={`Tag:tag`}>
                  {gitTagToHuman(tag)}
                </option>
              ))}
            </optgroup>
          )}
        </Select>
      </Label.Inline>
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
      <DaysCharts stats={stats.perDay} />
      <BadgeStats
        allStats={allStats}
        stats={stats}
        type={page.type === 'All' ? 'perYear' : 'perTag'}
        activeHost={activeHost}
      />
      <WidgetSection className="!flex-row flex-wrap">
        <HostsTable hostsStats={stats.perHost} activeHost={activeHost} />
        <TopWords topWords={stats.topWords} />
      </WidgetSection>
    </main>
  );
}
