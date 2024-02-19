/*
 * This config partially overwrites and extends the default Tailwind config:
 * https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */

import type { Config } from 'tailwindcss';

export default {
  content: ['./packages/*/index.html', './packages/*/src/**/*.{ts,tsx}'],
  // Disable unneeded components to reduce performance impact
  corePlugins: {
    float: false,
    clear: false,
    skew: false,
    caretColor: false,
    sepia: false,
  },
  darkMode: 'class',
  theme: {
    // Make default border radius more rounded
    borderRadius: {
      none: '0px',
      xs: '0.125rem',
      sm: '0.25rem',
      DEFAULT: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
    extend: {
      colors: {
        // Some in-between shades:
        gray: {
          350: 'hsl(218deg 12% 79%)',
        },
        yellow: {
          250: 'hsl(53deg 98% 72%)',
        },
        indigo: {
          350: 'hsl(232deg 92% 79%)',
        },
        neutral: {
          350: 'hsl(0deg 0% 73%)',
        },
      },
      brightness: {
        70: '.7',
        80: '.8',
      },
      transitionDuration: {
        0: '0ms',
      },
      keyframes: {
        'hue-rotate': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
      animation: {
        'hue-rotate': '4s hue-rotate 2s linear infinite',
      },
    },
  },
} satisfies Config;
