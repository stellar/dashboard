import React from 'react';
import Button from 'muicss/lib/react/button';
import {assign} from 'lodash';
import {SLIDE} from '../events';

export default class AppBar extends React.Component {
  render() {
    return <div>
      <div className="mui-appbar">
        <div className="mui--text-headline">Stellar.org Dashboard</div>
      </div>
    </div>
  }
}
