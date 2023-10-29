import React from 'react';
import { signInText } from '../../localization/signInText';
import { Link } from '../Atoms/Link';
import { urls } from '../../../config';
import { readerText } from '../../localization/readerText';
import { H1 } from '../Atoms';
import { Button } from '../Atoms/Button';
import { useStorage } from '../../hooks/useStorage';
import { AuthContext } from '../Contexts/AuthContext';

export function InfoTab(): JSX.Element {
  const [repository] = useStorage('setup.repository');
  const { handleSignOut } = React.useContext(AuthContext);
  return (
    <>
      <H1 className="flex-1">{readerText.textHoarder}</H1>
      {typeof repository === 'object' && (
        <Link.Info
          href={`https://github.com/${repository.owner}/${repository.name}`}
        >
          {signInText.openRepositoryInGitHub}
        </Link.Info>
      )}
      <Link.Info href={urls.webStoreReviewUrl}>
        {readerText.leaveReview}
      </Link.Info>
      <Link.Info href={urls.sourceCode}>{readerText.sourceCode}</Link.Info>
      <Link.Info href={urls.requestFeature}>
        {readerText.requestFeature}
      </Link.Info>
      <Link.Info href={urls.reportIssue}>{readerText.reportIssue}</Link.Info>
      <Button.Danger onClick={handleSignOut}>
        {signInText.signOut}
      </Button.Danger>
      <p>
        {signInText.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {signInText.privacyPolicy}
        </Link.Default>
      </p>
    </>
  );
}
