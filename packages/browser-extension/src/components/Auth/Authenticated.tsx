import React from 'react';
import { localization } from '../../localization/localization';
import { Button } from '../Atoms/Button';
import { AuthContext } from '../Contexts/AuthContext';
import { useStorage } from '../../hooks/useStorage';
import { RepositoryList } from './RepositoryList';
import { H1 } from '../Atoms';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Link } from '../Atoms/Link';
import { Menu } from '../Core/Menu';
import { MainScreen } from '../Content';

// TODO: either make options page content look nicer, or remove options page

export function Authenticated(): JSX.Element {
  const auth = React.useContext(AuthContext);
  const [repositoryName] = useStorage('repositoryName');
  const [isMenuOpen, _, __, handleToggleMenu] = useBooleanState();
  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <H1 className="flex-1">{localization.textHoarder}</H1>
        <Button.Icon
          icon="informationCircle"
          title={localization.aboutTextHoarder}
          onClick={handleToggleMenu}
          aria-pressed={isMenuOpen ? true : undefined}
        />
        {typeof repositoryName === 'string' && (
          <Link.Icon
            icon="globeAlt"
            title={localization.openRepositoryInGitHub}
            href={`https://github.com/${repositoryName}`}
          />
        )}
        <Button.Icon
          icon="logout"
          title={localization.signOut}
          onClick={auth?.handleSignOut}
        />
      </div>
      {isMenuOpen ? (
        <Menu />
      ) : repositoryName === undefined ? (
        <RepositoryList />
      ) : (
        <MainScreen />
      )}
    </>
  );
}
