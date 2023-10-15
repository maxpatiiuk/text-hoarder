import { wrap } from './wrap';

/*
 * Grid-based table implementation for increased flexibility
 * Does not sacrifice accessibility thanks to the [role] attributes
 * Allows for things like sticky headers and having entire row be a link/button
 * You can set column sizes by adding a className like this:
 *   grid-cols-[repeat(4,1fr)_auto_auto_min-content_minmax(10rem,1fr)]
 * There is much more flexibility in how columns should be sized.
 */
export const Table = {
  Container: wrap(
    'Table.Container',
    'table',
    'grid overflow-auto flex-1 content-baseline',
  ),
  Head: wrap('Table.Head', 'thead', 'contents'),
  Body: wrap('Table.Body', 'tbody', 'contents'),
  Row: wrap('Table.Row', 'tr', 'contents'),
  Header: wrap<'th', { readonly scope: 'row' | 'col' }>(
    'Table.Header',
    'th',
    'bg-white flex items-center gap-1 sticky',
    ({ className, scope, ...rest }) => ({
      ...rest,
      scope,
      /*
       * Despite https://github.com/tailwindlabs/tailwindcss/pull/8299,
       * attribute selectors in arbitrary variants are not supported
       */
      className: `
        ${className}
        ${scope === 'row' ? 'left-0' : scope === 'col' ? 'top-0' : ''}
      `,
    }),
  ),
  Cell: wrap('Table.Cell', 'td', 'flex items-center gap-1'),
};
