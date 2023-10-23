import React from 'react';
import { Popup } from '../../Popup/Popup';
import { mount } from '../../../tests/reactUtils';
import { popupText } from '../../../localization/popupText';
import { act } from '@testing-library/react';

test('renders a button after current date is extracted', () =>
  act(() => {
    const { getByRole } = mount(<Popup />);
    const linkElement = getByRole('button', {
      name: popupText.textHoarder,
    });
    expect(linkElement).toBeInTheDocument();
  }));
