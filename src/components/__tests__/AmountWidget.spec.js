import React from 'react';
import renderer from 'react-test-renderer';
import AmountWidget from '../AmountWidget';
import { knownAccounts } from '../../common/known_accounts';

describe('AmountWidget', () => {
  it(`renders component: loading`, () => {
    const component = renderer.create(<AmountWidget  />);
    expect(component.toJSON()).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: loaded, 0 amount`, () => {
    const component = renderer.create(<AmountWidget  />);
    const instance = component.getInstance();

    instance.setState({ loading: false, amount: 0 });
    component.update(<AmountWidget  />);
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: loaded, 100000 amount`, () => {
    const component = renderer.create(<AmountWidget  />);
    const instance = component.getInstance();

    instance.setState({ loading: false, amount: 100000 });
    component.update(<AmountWidget  />);
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: loaded, 1000000 amount`, () => {
    const component = renderer.create(<AmountWidget  />);
    const instance = component.getInstance();

    instance.setState({ loading: false, amount: 1000000 });
    component.update(<AmountWidget  />);
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    component.unmount();
  });

  it(`renders component: loaded, 1000000000 amount`, () => {
    const component = renderer.create(<AmountWidget  />);
    const instance = component.getInstance();

    instance.setState({ loading: false, amount: 1000000000 });
    component.update(<AmountWidget  />);
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    component.unmount();
  });
});