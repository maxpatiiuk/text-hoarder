import { formatNumber } from '@common/components/Atoms/Internationalization';
import { useTransitionDuration } from '@common/hooks/useReduceMotion';
import { f } from '@common/utils/functools';
import { RA } from '@common/utils/types';
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
        backgroundColor: `hsl(${indexToHue(index, data.length)},100%,83%)`,
        borderColor: `hsl(${indexToHue(index, data.length)},100%,69%)`,
        borderWidth: 2,
      })),
    [data],
  );

  const yMin = React.useMemo(() => f.min(...data) ?? 0, [data]);
  const isLarge = labels.length > 30;

  return (
    <div className={isLarge ? 'h-96' : 'max-h-64'}>
      <Bar
        data={{
          labels: [''],
          datasets,
        }}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: ({ dataset, parsed }) =>
                  `${dataset.label}: ${formatNumber(parsed.y)}`,
              },
            },
            legend: { display: !isLarge },
          },
          maintainAspectRatio: false,
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
    </div>
  );
}

const indexToHue = (index: number, count: number): number =>
  (((index % count) / count) * 360 + 160) % 360;
