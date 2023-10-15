import React from 'react';
import { App } from '../App';
import { mount } from '../../../tests/reactUtils';
import { localization } from '../../../localization/common';
import { act } from '@testing-library/react';

test('renders a button after current date is extracted', () =>
  act(() => {
    const { getByRole } = mount(<App />);
    const linkElement = getByRole('button', {
      name: localization.textHoarder,
    });
    expect(linkElement).toBeInTheDocument();
  }));
