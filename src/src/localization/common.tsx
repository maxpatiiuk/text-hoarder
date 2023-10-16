/**
 * Localization strings for all UI components (except for preferences)
 */

import React from 'react';
import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const localization = dictionary({
  textHoarder: { en: 'Text Hoarder' },
  loading: { en: 'Loading...' },
  privacyPolicy: {
    en: 'Privacy Policy',
  },
  signInDescription: {
    en: `
      The Text Hoarder Chrome Extension requires write access to a single GitHub
      repository - it will be used as storage for the snippets of text you save.
    `,
  },
  privacyPolicyDescription: {
    en: `
      We ensure privacy by not collecting, storing, or sharing any personal data.
      We don't use analytics or tracking tools.
    `,
  },
  gitHubRegisterPrompt: {
    en: (link: (label: string) => JSX.Element) => (
      <>
        If you don't already have a GitHub account, you can{' '}
        {link('register one for free')}.
      </>
    ),
  },
  createRepositoryPrompt: {
    en: (link: (label: string) => JSX.Element) => (
      <>
        Then, proceed to {link('create a new repository')} for this extension.
        Set repository visibility to private if you wish to keep your snippets
        accessible only to you.
      </>
    ),
  },
  signInWithGitHub: { en: 'Sign in with GitHub' },
  signInInstruction: {
    en: 'When prompted by GitHub, give access to the repository you created.',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
