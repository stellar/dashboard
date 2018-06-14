import React from 'react';

export default class AppBar extends React.Component {
  render() {
    return <footer>
      <div className="mui-col-md-4">
        <p>
          <strong>Other tools</strong>
        </p>
        <p>
          <a href="https://stellarterm.com/" target="_blank">StellarTerm</a><br />
          <a href="https://stellarchain.io/" target="_blank">StellarChain</a>
        </p>
      </div>
      <div className="clear"></div>
    </footer>
  }
}
