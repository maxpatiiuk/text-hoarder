/**
 * Localization strings for sign in flow and info menu
 */

import React from 'react';
import { dictionary } from './utils';
import { commonText } from '@common/localization/commonText';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const signInText = dictionary({
  privacyPolicy: {
    en: 'Privacy Policy',
  },
  signInDescription: {
    en: `
      The ${commonText.textHoarder} Browser Extension requires write access to a single GitHub repository - it will be used as storage for the snippets of text you save.
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
  pickRepository: { en: 'Pick a repository' },
  pickRepositoryHint: {
    en: (
      createRepositoryLink: (label: string) => JSX.Element,
      editPermissionsLink: (label: string) => JSX.Element,
    ) => (
      <>
        Don't see the repository you are looking for? Try{' '}
        {createRepositoryLink('creating new repository')} or{' '}
        {editPermissionsLink('editing the rights you gave to this extension')}.
      </>
    ),
  },
  noRepositories: {
    en: (
      createRepositoryLink: (label: string) => JSX.Element,
      editPermissionsLink: (label: string) => JSX.Element,
    ) => (
      <>
        You don't have any GitHub repositories, or the {commonText.textHoarder}{' '}
        extension wasn't given access to any repository. Consider{' '}
        {createRepositoryLink('creating a new repository')} or{' '}
        {editPermissionsLink('editing the rights you gave to this extension')}.
      </>
    ),
  },
  signOut: { en: 'Sign out' },
  openRepositoryInGitHub: { en: 'Open repository on GitHub' },
});
/* eslint-enable @typescript-eslint/naming-convention */
