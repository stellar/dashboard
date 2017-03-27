import React from 'react';
import Button from 'muicss/lib/react/button';
import assign from 'lodash/assign';

export default class AppBar extends React.Component {
  render() {
    return <div>
      <div className="mui-appbar">
        <div className="left">
          <div className="back"><a href="https://www.stellar.org">&laquo; Stellar.org</a></div>
          <div className="mui--text-headline">Stellar.org Dashboard</div>
        </div>
        <div className="icons">
          <div className="icon">
            <a href="https://github.com/stellar/dashboard" target="_blank">
              <i className="material-icons">code</i><br />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  }
}
