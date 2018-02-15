import React from 'react';
import renderer from 'react-test-renderer';
import AccountBadge from '../AccountBadge';
import { knownAccounts } from '../../common/known_accounts';

describe('AccountBadge', () => {
  it(`renders component`, () => {
    const component = renderer.create(<AccountBadge horizonURL="horizon_url_stub" id="id_stub" />);
    expect(component.toJSON()).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: known`, () => {
    const knownAccountId = Object.keys(knownAccounts)[0];
    const component = renderer.create(<AccountBadge horizonURL="horizon_url_stub" id={knownAccountId} known="known_stub" />);
    expect(component.toJSON()).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: known2`, () => {
    const knownAccountId = Object.keys(knownAccounts)[0];
    const component = renderer.create(<AccountBadge horizonURL="horizon_url_stub" id={knownAccountId} known="knownAccountId" />);
    expect(component.toJSON()).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: known object`, () => {
    const knownAccountId = Object.keys(knownAccounts).pop();
    const component = renderer.create(<AccountBadge horizonURL="horizon_url_stub" id={knownAccountId} known="knownAccountId" />);
    expect(component.toJSON()).toMatchSnapshot();
    component.unmount();
  });
});