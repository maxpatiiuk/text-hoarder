import { H1, H2, H3, H4 } from '@common/components/Atoms';
import { commonText } from '@common/localization/commonText';
import React from 'react';
import { StatsCounts, StatsJson, StatsStructure } from '../Stats/computeStats';
import { Button } from '@common/components/Atoms/Button';
import { State } from 'typesafe-reducer';
import { statsText } from '@common/localization/statsText';
import { className } from '@common/components/Atoms/className';
import { formatNumber } from '@common/components/Atoms/Internationalization';
import { IR, RR } from '@common/utils/types';
import { BarChart } from './BarChart';
import { title } from 'process';

type Page =
  | State<'All'>
  | State<'Tag', { readonly tag: string }>
  | State<'Year', { readonly year: string }>;

function tagToHuman(tag: string): string {
  const date = new Date(tag);
  const isValidDate = !Number.isNaN(date.getTime());
  return isValidDate ? date.toLocaleDateString() : tag;
}

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
                  {tagToHuman(tag)}
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
  const [activeBadge, setActiveBadge] = React.useState<
    keyof typeof badgeLabelMapper | undefined
  >(undefined);
  return (
    <main className="contents">
      <H2>
        {page.type === 'All'
          ? statsText.allYears
          : page.type === 'Tag'
          ? tagToHuman(page.tag)
          : page.year}
      </H2>
      <section className="flex flex-col gap-4">
        <H3>{statsText.counts}</H3>
        <div className="grid gap-4 flex-wrap grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
          {Object.keys(badgeLabelMapper).map((key) => (
            <Badge
              key={key}
              type={key as keyof typeof badgeLabelMapper}
              counts={stats.counts}
              isActive={activeBadge === key}
              onClick={(): void =>
                setActiveBadge(
                  activeBadge === key
                    ? undefined
                    : (key as keyof typeof badgeLabelMapper),
                )
              }
            />
          ))}
        </div>
      </section>
      {typeof activeBadge === 'string' && (
        <BadgeCharts
          stats={allStats[page.type === 'All' ? 'perYear' : 'perTag']}
          badge={activeBadge}
        />
      )}
      <section className={`flex flex-col gap-4 ${className.widget}`}></section>
    </main>
  );
}

const badgeLabelMapper: RR<keyof StatsCounts, string> = {
  count: statsText.savedArticles,
  length: statsText.totalLength,
  words: statsText.totalWords,
  sentences: statsText.totalSentences,
  paragraphs: statsText.totalParagraphs,
  uniqueWords: statsText.totalUniqueWords,
};

function Badge({
  type,
  counts,
  isActive,
  onClick: handleClick,
}: {
  readonly type: keyof typeof badgeLabelMapper;
  readonly counts: StatsCounts;
  readonly isActive: boolean;
  readonly onClick: () => void;
}): JSX.Element {
  const count = counts.count;
  const total = counts[type];
  const average = total / count;
  return (
    <article className={`${className.widget} aspect-square flex flex-col`}>
      <H4>{badgeLabelMapper[type]}</H4>
      <div className="flex-1 flex justify-center items-center text-6xl text-center p-3">
        {formatNumber(total)}
      </div>
      <div className="flex gap-4 flex-wrap">
        {type !== 'count' && (
          <p className="text-gray-700 dark:text-neutral-200">{`${
            statsText.average
          }: ${formatNumber(average)}`}</p>
        )}
        <span className="flex-1 -ml-4" />
        <Button.LikeLink
          aria-pressed={isActive ? true : undefined}
          onClick={handleClick}
        >
          {statsText.chart}
        </Button.LikeLink>
      </div>
    </article>
  );
}

function BadgeCharts({
  stats,
  badge,
}: {
  readonly stats: IR<StatsStructure>;
  readonly badge: keyof typeof badgeLabelMapper;
}): JSX.Element {
  const labels = Object.keys(stats).map(tagToHuman);
  const totalData = Object.values(stats).map(({ counts }) => counts[badge]);
  const averageData = Object.values(stats).map(
    ({ counts }) => counts[badge] / counts.count,
  );

  const showAverage = badge !== 'count';
  return (
    <section className={`flex flex-wrap gap-4 ${className.widget}`}>
      <div className="flex-1">
        <H3>{badgeLabelMapper[badge]}</H3>
        <BarChart labels={labels} data={totalData} />
      </div>

      {showAverage && (
        <div className="flex-1">
          <H3>{statsText.average}</H3>
          <BarChart labels={labels} data={averageData} />
        </div>
      )}
    </section>
  );
}
