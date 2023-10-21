import React from 'react';

import { localization } from '../../localization/localization';
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
  readonly onAuth: () => Promise<true | Error>;
}): JSX.Element {
  const loading = React.useContext(LoadingContext);
  const [error, setError] = React.useState('');
  return (
    <>
      <H1>{localization.textHoarder}</H1>
      <p>{localization.signInDescription}</p>
      <Step number={1} />
      <p>
        {localization.gitHubRegisterPrompt((label) => (
          <Link.Default href="https://github.com/signup">{label}</Link.Default>
        ))}
      </p>
      <Step number={2} />
      <p>
        {localization.createRepositoryPrompt((label) => (
          <Link.Default href="https://docs.github.com/en/get-started/quickstart/create-a-repo#create-a-repository">
            {label}
          </Link.Default>
        ))}
      </p>
      <Step number={3} />
      <Button.Info
        onClick={(): void =>
          loading(
            handleAuth().then((result) => {
              if (result instanceof Error) setError(result.message);
            }),
          )
        }
      >
        {localization.signInWithGitHub}
      </Button.Info>
      <p>{localization.signInInstruction}</p>
      {error.length > 0 && <ErrorMessage>{error}</ErrorMessage>}
      <span className="flex-1 -ml-3" />
      <p>
        {localization.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {localization.privacyPolicy}
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
