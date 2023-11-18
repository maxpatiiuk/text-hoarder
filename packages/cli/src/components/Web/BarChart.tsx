import { formatNumber } from '@common/components/Atoms/Internationalization';
import { useTransitionDuration } from '@common/hooks/useReduceMotion';
import { f } from '@common/utils/functools';
import { RA, writable } from '@common/utils/types';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function BarChart({
  labels,
  data,
}: {
  readonly labels: RA<string>;
  readonly data: RA<number>;
}): JSX.Element | null {
  const transitionDuration = useTransitionDuration();

  const datasets = React.useMemo(
    () =>
      data.map((value, index) => ({
        label: labels[index],
        data: [value],
        backgroundColor: data.map(
          (_, index) => `hsl(${indexToHue(index, data.length)},100%,83%)`,
        ),
        borderColor: data.map(
          (_, index) => `hsl(${indexToHue(index, data.length)},100%,69%)`,
        ),
        borderWidth: 2,
      })),
    [data],
  );

  const yMin = React.useMemo(() => f.min(...data) ?? 0, [data]);

  return (
    <Bar
      data={{
        labels: writable(labels),
        datasets,
      }}
      options={{
        plugins: {
          tooltip: {
            callbacks: {
              label: ({ parsed }) => formatNumber(parsed.y),
            },
          },
        },
        responsive: true,
        animation: {
          duration: transitionDuration,
        },
        scales: {
          y: {
            min: yMin >= 0 ? 0 : undefined,
            ticks: {
              callback: (value) =>
                typeof value === 'number' ? formatNumber(value) : value,
            },
          },
        },
      }}
    />
  );
}

const indexToHue = (index: number, count: number): number =>
  ((count - ((index + 2) % count)) * 360) / count;
