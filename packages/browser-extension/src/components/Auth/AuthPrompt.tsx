import React from 'react';

import { popupText } from '../../localization/popupText';
import { Link } from '../Atoms/Link';
import { Button } from '../Atoms/Button';
import { LoadingContext } from '../Contexts/Contexts';
import { ErrorMessage, H1 } from '../Atoms';
import { urls } from '../../../config';

/**
 * This dialog is displayed on first use promoting user to sign in with GitHub
 * and give the extension access to a single private repository
 */
export function AuthPrompt({
  onAuth: handleAuth,
}: {
  readonly onAuth: () => Promise<void>;
}): JSX.Element {
  const loading = React.useContext(LoadingContext);
  const [error, setError] = React.useState('');
  return (
    <>
      <H1>{popupText.textHoarder}</H1>
      <p>{popupText.signInDescription}</p>
      <Step number={1} />
      <p>
        {popupText.gitHubRegisterPrompt((label) => (
          <Link.Default href="https://github.com/signup">{label}</Link.Default>
        ))}
      </p>
      <Step number={2} />
      <p>
        {popupText.createRepositoryPrompt((label) => (
          <Link.Default href="https://docs.github.com/en/get-started/quickstart/create-a-repo#create-a-repository">
            {label}
          </Link.Default>
        ))}
      </p>
      <Step number={3} />
      <Button.Info
        onClick={(): void =>
          loading(handleAuth().catch((error) => setError(error.message)))
        }
      >
        {popupText.signInWithGitHub}
      </Button.Info>
      <p>{popupText.signInInstruction}</p>
      {error.length > 0 && <ErrorMessage>{error}</ErrorMessage>}
      <span className="flex-1 -ml-3" />
      <p>
        {popupText.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {popupText.privacyPolicy}
        </Link.Default>
      </p>
    </>
  );
}

function Step({ number }: { readonly number: number }): JSX.Element {
  return (
    <div className="flex justify-center">
      <span className="w-10 h-10 flex justify-center items-center rounded-full bg-blue-200 dark:bg-blue-800">
        {number}
      </span>
    </div>
  );
}
