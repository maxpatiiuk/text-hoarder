import React from 'react';
import { signInText } from '@common/localization/signInText';
import { Link } from '@common/components/Atoms/Link';
import { urls } from '../../../config';
import { readerText } from '@common/localization/readerText';
import { H1 } from '@common/components/Atoms';
import { Button } from '@common/components/Atoms/Button';
import { useStorage } from '../../hooks/useStorage';
import { AuthContext } from '../Contexts/AuthContext';
import { commonText } from '@common/localization/commonText';

export function InfoTab(): JSX.Element {
  const [repository] = useStorage('setup.repository');
  const { handleSignOut } = React.useContext(AuthContext);
  return (
    <>
      <H1 className="flex-1">{commonText.textHoarder}</H1>
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
      {typeof handleSignOut === 'function' && (
        <Button.Danger onClick={handleSignOut}>
          {signInText.signOut}
        </Button.Danger>
      )}
      <p>
        {signInText.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {signInText.privacyPolicy}
        </Link.Default>
      </p>
    </>
  );
}
