import React from 'react';
import { localization } from '../../localization/localization';
import { Link } from '../Atoms/Link';
import { extensionId, urls } from '../../../config';

export function Menu(): JSX.Element {
  return (
    <>
      <Link.Info
        href={`https://chromewebstore.google.com/u/1/detail/${extensionId}/reviews`}
      >
        {localization.leaveReview}
      </Link.Info>
      <Link.Info href={urls.sourceCode}>{localization.sourceCode}</Link.Info>
      <Link.Info href={urls.requestFeature}>
        {localization.requestFeature}
      </Link.Info>
      <Link.Info href={urls.reportIssue}>{localization.reportIssue}</Link.Info>
      <span className="flex-1 -mt-3"></span>
      <p>
        {localization.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {localization.privacyPolicy}
        </Link.Default>
      </p>
    </>
  );
}
