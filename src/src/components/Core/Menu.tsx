import React from 'react';
import { localization } from '../../localization/localization';
import { Link } from '../Atoms/Link';
import { extensionId } from '../../../config';

export function Menu(): JSX.Element {
  return (
    <>
      <Link.Info href="https://github.com/maxxxxxdlp/text-hoarder">
        {localization.sourceCode}
      </Link.Info>
      <Link.Info
        href={`https://chromewebstore.google.com/u/1/detail/${extensionId}/reviews`}
      >
        {localization.leaveReview}
      </Link.Info>
      <Link.Info href="https://github.com/maxxxxxdlp/text-hoarder/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md">
        {localization.requestFeature}
      </Link.Info>
      <Link.Info href="https://github.com/maxxxxxdlp/text-hoarder/issues/new?assignees=&labels=bug&projects=&template=bug_report.md">
        {localization.reportIssue}
      </Link.Info>
      <span className="flex-1 -mt-3"></span>
      <p>
        {localization.privacyPolicyDescription}
        <Link.Default
          // FIXME: replace URL
          href="https://calendar-plus.patii.uk/docs/privacy/"
        >
          {localization.privacyPolicy}
        </Link.Default>
      </p>
    </>
  );
}
