import { WidgetSection, H3, H4 } from '@common/components/Atoms';
import { Button } from '@common/components/Atoms/Button';
import { formatNumber } from '@common/components/Atoms/Internationalization';
import { className } from '@common/components/Atoms/className';
import { statsText } from '@common/localization/statsText';
import { RR, IR, GetSet } from '@common/utils/types';
import React from 'react';
import { StatsCounts, StatsJson, StatsStructure } from '../Stats/computeStats';
import { BarChart } from './BarChart';

export function gitTagToHuman(tag: string): string {
  const date = new Date(tag);
  const isValidDate = !Number.isNaN(date.getTime());
  return isValidDate ? date.toLocaleDateString() : tag;
}

export function BadgeStats({
  allStats,
  stats,
  type,
  activeHost: [activeHost, setActiveHost],
}: {
  readonly allStats: StatsJson;
  readonly stats: StatsStructure;
  readonly type: 'perYear' | 'perTag';
  readonly activeHost: GetSet<string | undefined>;
}): JSX.Element {
  const currentStats =
    activeHost === undefined ? stats.counts : stats.perHost[activeHost];

  const [activeBadge, setActiveBadge] = React.useState<
    keyof typeof countLabels | undefined
  >(undefined);
  return (
    <>
      <WidgetSection>
        <div className="flex gap-8">
          <H3>{statsText.counts}</H3>
          {typeof activeHost === 'string' && (
            <>
              <div className="flex items-center">{`${statsText.forWebsite}: ${activeHost}`}</div>
              <Button.Success onClick={(): void => setActiveHost(undefined)}>
                {statsText.showAll}
              </Button.Success>
            </>
          )}
        </div>
        <div className="grid gap-4 flex-wrap grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
          {Object.keys(countLabels).map((key) => (
            <Badge
              key={key}
              type={key as keyof typeof countLabels}
              counts={currentStats}
              isActive={activeBadge === key}
              onClick={(): void =>
                setActiveBadge(
                  activeBadge === key
                    ? undefined
                    : (key as keyof typeof countLabels),
                )
              }
            />
          ))}
        </div>
      </WidgetSection>
      {typeof activeBadge === 'string' && (
        <BadgeCharts stats={allStats[type]} badge={activeBadge} />
      )}
    </>
  );
}

export const countLabels: RR<keyof StatsCounts, string> = {
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
  readonly type: keyof typeof countLabels;
  readonly counts: StatsCounts;
  readonly isActive: boolean;
  readonly onClick: () => void;
}): JSX.Element {
  const count = counts.count;
  const total = counts[type];
  const average = total / count;
  return (
    <article className={`${className.widget} aspect-square flex flex-col`}>
      <H4>{countLabels[type]}</H4>
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
          {statsText.compare}
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
  readonly badge: keyof typeof countLabels;
}): JSX.Element {
  const labels = Object.keys(stats).map(gitTagToHuman);
  const totalData = Object.values(stats).map(({ counts }) => counts[badge]);
  const averageData = Object.values(stats).map(
    ({ counts }) => counts[badge] / counts.count,
  );

  const showAverage = badge !== 'count';
  return (
    <WidgetSection className={className.widget}>
      <div className="flex-1">
        <H3>{countLabels[badge]}</H3>
        <BarChart labels={labels} data={totalData} />
      </div>
      {showAverage && (
        <div className="flex-1">
          <H3>{statsText.average}</H3>
          <BarChart labels={labels} data={averageData} />
        </div>
      )}
    </WidgetSection>
  );
}
