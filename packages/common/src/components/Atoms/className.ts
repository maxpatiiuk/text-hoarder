const current = 'aria-[pressed]:brightness-150 aria-[current]:brightness-150';
const link = `text-blue-600 dark:text-blue-400 transition hover:text-black dark:hover:text-white underline ${current}`;
const inputBackground = 'bg-gray-300 dark:bg-neutral-700';
export const className = {
  input: `rounded pl-1 pr-1 sm:pl-3 sm:pr-3 border-none ring-1 ring-black ${inputBackground}`,
  select: `w-full pr-5 bg-right cursor-pointer ${inputBackground}`,
  button: `inline-flex justify-center items-center px-4 py-2 rounded-md border-none text-white ${current}`,
  success: 'bg-green-600 hover:bg-green-700',
  danger: 'bg-red-600 hover:bg-red-700',
  info: 'bg-blue-600 hover:bg-blue-700',
  link,
  icon: `${link} inline-flex justify-center items-center active:bg-blue-100 disabled:!cursor-not-allowed
    first-letter:disabled:!text-gray-400 disabled:hover:!text-gray-400
    dark:active:bg-blue-500 disabled:dark:!text-neutral-600
    disabled:hover:dark:!text-neutral-600 rounded
  `,
  strippedTable: `[&_:is(th,td)]:p-1 [&_:is(th,td)]:sm:p-2 [&_:is(th,td)]:ring-1
    [&_:is(th,td)]:ring-gray-300
    [&_tr:nth-child(even)_:is(th,td)]:bg-gray-200 p-px`,
  label: 'flex flex-col',
  labelForCheckbox: 'cursor-pointer inline-flex gap-1 items-center',
  // Ensures Textarea can't grow past max dialog width
  textArea: `max-w-full min-w-[theme(spacing.20)] min-h-[theme(spacing.8)] ${inputBackground}`,
  widget: 'bg-gray-100 dark:bg-neutral-800 p-2 rounded',
};
