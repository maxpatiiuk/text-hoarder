import { getLanguage } from '../../localization/utils';
import { f } from '../../utils/functools';
import { RA } from '../../utils/types';
import { DAY, MONTH, WEEK, YEAR } from './timeUnits';

// Localized month names
export const months = ['', ...getMonthNames('long')];

function getMonthNames(format: 'long' | 'short'): RA<string> {
  const months = new Intl.DateTimeFormat(getLanguage(), { month: format });
  return f.between(0, YEAR / MONTH, (month) =>
    months.format(new Date(0, month, 2, 0, 0, 0)),
  );
}

// Localized week day names
export const weekDays = getWeekDays('long');

function getWeekDays(format: 'long' | 'short'): RA<string> {
  const weekDays = new Intl.DateTimeFormat(getLanguage(), { weekday: format });
  return f.between(1, WEEK / DAY + 1, (weekDay) =>
    weekDays.format(new Date(2017, 0, weekDay, 0, 0, 0)),
  );
}

/* This is an incomplete definition. For complete, see MDN Docs */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  class Locale {
    public constructor(locales?: RA<string> | string);

    public weekInfo?: {
      readonly firstDay: 1 | 7;
    };

    public getWeekInfo?: () => {
      readonly firstDay: 1 | 7;
    };
  }

  class DateTimeFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly dateStyle?: 'full' | 'long' | 'medium' | 'short';
        readonly timeStyle?: 'full' | 'long' | 'medium' | 'short';
        readonly month?: 'long' | 'short';
        readonly weekday?: 'long' | 'short';
      },
    );

    public format(value: Readonly<Date>): string;
  }

  class NumberFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly roundingMode: 'halfEven';
        readonly maximumFractionDigits: number;
      },
    );

    public format(value: number): string;
  }
}

const locale = new Intl.Locale(getLanguage());
const weekInfo = locale.getWeekInfo?.() ?? locale.weekInfo;
export const firstDayOfWeek =
  weekInfo?.firstDay === 7 ? 0 : weekInfo?.firstDay ?? 1;

const numberFormatter = new Intl.NumberFormat(getLanguage(), {
  roundingMode: 'halfEven',
  maximumFractionDigits: 2,
});
export const formatNumber = (number: number): string =>
  numberFormatter.format(number);
