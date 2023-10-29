import React from 'react';
import { Popup } from '../../SignInFlow/Popup';
import { mount } from '../../../tests/reactUtils';
import { signInText } from '../../../localization/signInText';
import { act } from '@testing-library/react';

test('renders a button after current date is extracted', () =>
  act(() => {
    const { getByRole } = mount(<Popup />);
    const linkElement = getByRole('button', {
      name: signInText.textHoarder,
    });
    expect(linkElement).toBeInTheDocument();
  }));
