import React from 'react';

import { localization } from '../../localization/common';
import { Link } from '../Atoms/Link';
import { Button } from '../Atoms/Button';
import { LoadingContext } from '../Contexts/Contexts';
import { ErrorMessage, H1 } from '../Atoms';

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
    <div className="flex flex-col gap-3 p-4 h-full">
      <H1>{localization.textHoarder}</H1>
      <p>{localization.signInDescription}</p>
      <Step number={1} />
      <p>
        {localization.gitHubRegisterPrompt((label) => (
          <Link.Default href="https://github.com/signup" target="_blank">
            {label}
          </Link.Default>
        ))}
      </p>
      <Step number={2} />
      <p>
        {localization.createRepositoryPrompt((label) => (
          <Link.Default
            href="https://docs.github.com/en/get-started/quickstart/create-a-repo#create-a-repository"
            target="_blank"
          >
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
        {localization.privacyPolicyDescription} {/** TODO: replace URL */}
        <Link.Default
          href="https://calendar-plus.patii.uk/docs/privacy/"
          rel="noreferrer"
          target="_blank"
        >
          {localization.privacyPolicy}
        </Link.Default>
      </p>
    </div>
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
