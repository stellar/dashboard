import React from "react";

export default class AppBar extends React.Component {
  render() {
    return (
      <div>
        <div className="mui-appbar">
          <div className="left">
            <div className="back">
              <a href="https://www.stellar.org">&laquo; Stellar.org</a>
            </div>
            <div className="mui--text-headline">Stellar.org Dashboard</div>
          </div>
          <div className="icons">
            <div className="icon">
              <a href="https://www.stellar.org/privacy-policy" target="_blank">
                Privacy Policy
              </a>
            </div>
            <div className="icon">
              <a
                href="https://www.stellar.org/terms-of-service"
                target="_blank"
              >
                Terms of Service
              </a>
            </div>
            <div className="icon">
              <a href="https://github.com/stellar/dashboard" target="_blank">
                GitHub
              </a>
            </div>
            {this.props.forceTheme ? (
              <div className="icon">
                <a href="#" onClick={this.props.turnOffForceTheme}>
                  <i className="material-icons">star_border</i>
                  <br />
                  Turn off the Force theme
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
