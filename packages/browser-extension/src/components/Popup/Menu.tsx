import React from 'react';
import { popupText } from '../../localization/popupText';
import { Link } from '../Atoms/Link';
import { extensionId, urls } from '../../../config';

export function Menu(): JSX.Element {
  return (
    <>
      <Link.Info
        href={`https://chromewebstore.google.com/u/1/detail/${extensionId}/reviews`}
      >
        {popupText.leaveReview}
      </Link.Info>
      <Link.Info href={urls.sourceCode}>{popupText.sourceCode}</Link.Info>
      <Link.Info href={urls.requestFeature}>
        {popupText.requestFeature}
      </Link.Info>
      <Link.Info href={urls.reportIssue}>{popupText.reportIssue}</Link.Info>
      <span className="flex-1 -mt-3"></span>
      <p>
        {popupText.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {popupText.privacyPolicy}
        </Link.Default>
      </p>
    </>
  );
}
