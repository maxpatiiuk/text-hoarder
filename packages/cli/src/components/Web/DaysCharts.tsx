import { H3, WidgetSection } from '@common/components/Atoms';
import React from 'react';
import { StatsCounts } from '../Stats/computeStats';
import { Button } from '@common/components/Atoms/Button';
import { statsText } from '@common/localization/statsText';
import { className } from '@common/components/Atoms/className';
import { formatDate } from '@common/components/Atoms/Internationalization';
import { IR } from '@common/utils/types';
import { BarChart } from './BarChart';
import { useBooleanState } from '@common/hooks/useBooleanState';
import { countLabels } from './BadgeStats';
import { focusWhenRendered } from '@common/components/Molecules/scroll';

export function DaysCharts({
  stats,
}: {
  readonly stats: IR<StatsCounts>;
}): JSX.Element {
  const labels = React.useMemo(
    () => Object.keys(stats).map((date) => formatDate(new Date(date))),
    [stats],
  );
  const data = React.useMemo(() => {
    const values = Object.values(stats);
    return Object.fromEntries(
      Object.keys(countLabels).map((key) => [
        key,
        values.map((value) => value[key as keyof StatsCounts]),
      ]),
    );
  }, [stats]);

  const [showAll, _, __, handleToggle] = useBooleanState();

  return (
    <>
      {Object.entries(countLabels)
        .slice(0, showAll ? Number.POSITIVE_INFINITY : 1)
        .map(([key, label], index) => (
          <WidgetSection className={className.widget} key={key}>
            <H3 forwardRef={index === 1 ? undefined : focusWhenRendered}>
              {label}
            </H3>
            <BarChart labels={labels} data={data[key]} />
            {key === 'count' && (
              <div>
                <Button.LikeLink onClick={handleToggle}>
                  {showAll ? statsText.hideMoreStats : statsText.showMoreStats}
                </Button.LikeLink>
              </div>
            )}
          </WidgetSection>
        ))}
    </>
  );
}
