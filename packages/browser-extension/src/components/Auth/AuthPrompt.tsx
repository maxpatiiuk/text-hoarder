import React from 'react';

import { signInText } from '@common/localization/signInText';
import { Link } from '@common/components/Atoms/Link';
import { Button } from '@common/components/Atoms/Button';
import { ErrorMessage, H1 } from '@common/components/Atoms';
import { urls } from '../../../config';
import { readerText } from '@common/localization/readerText';
import { AuthContext } from '../Contexts/AuthContext';
import { loadingGif, useLoading } from '@common/hooks/useLoading';

/**
 * This dialog is displayed on first use promoting user to sign in with GitHub
 * and give the extension access to a single private repository
 */
export function AuthPrompt(): JSX.Element {
  const { handleAuthenticate } = React.useContext(AuthContext);
  const [isLoading, loading] = useLoading();
  const [error, setError] = React.useState('');
  return (
    <>
      <H1>{readerText.textHoarder}</H1>
      <p>{signInText.signInDescription}</p>
      <Step number={1} />
      <p>
        {signInText.gitHubRegisterPrompt((label) => (
          <Link.Default href="https://github.com/signup">{label}</Link.Default>
        ))}
      </p>
      <Step number={2} />
      <p>
        {signInText.createRepositoryPrompt((label) => (
          <Link.Default href="https://docs.github.com/en/get-started/quickstart/create-a-repo#create-a-repository">
            {label}
          </Link.Default>
        ))}
      </p>
      <Step number={3} />
      <Button.Info
        onClick={(): void =>
          loading(
            handleAuthenticate().catch((error) => setError(error.message)),
          )
        }
      >
        {signInText.signInWithGitHub}
      </Button.Info>
      <p>{signInText.signInInstruction}</p>
      {isLoading && loadingGif}
      {error.length > 0 && <ErrorMessage>{error}</ErrorMessage>}
      <span className="flex-1 -ml-3" />
      <p>
        {signInText.privacyPolicyDescription}
        <Link.Default href={urls.privacyPolicy}>
          {signInText.privacyPolicy}
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
