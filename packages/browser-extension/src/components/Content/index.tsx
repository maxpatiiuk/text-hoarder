import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';

// FEATURE: use signed commits https://github.com/orgs/community/discussions/50055
// FEATURE: when adding new entry, check if the same URL was already added in the last 2 years

export function MainScreen(): JSX.Element {
  const { octokit, github } = React.useContext(AuthContext)!;

  console.log(octokit, github);
  return <>Test</>;
}
