import { getLanguage } from '../../localization/utils';
import { RA } from '../../utils/types';

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
        readonly day?: 'numeric' | '2-digit';
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

const dateFormatter = new Intl.DateTimeFormat(getLanguage(), {
  month: 'short',
  day: 'numeric',
});
export const formatDate = (date: Readonly<Date>): string =>
  dateFormatter.format(date);

const numberFormatter = new Intl.NumberFormat(getLanguage(), {
  roundingMode: 'halfEven',
  maximumFractionDigits: 2,
});
export const formatNumber = (number: number): string =>
  numberFormatter.format(number);
