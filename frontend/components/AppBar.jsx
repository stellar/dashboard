import React from "react";
import logoUrl from "../assets/stellar-logo-white.svg";

export default class AppBar extends React.Component {
  render() {
    return (
      <header className="site-header">
        <div className="container site-header-inner">
          <a
            className="site-brand"
            href="https://www.stellar.org"
            title="Back to Stellar.org"
          >
            <img className="site-logo" src={logoUrl} alt="Stellar" />
            <span className="site-brand-suffix">Network Dashboard</span>
          </a>
          <nav className="site-nav">
            <a
              className="hide-mobile"
              href="https://www.stellar.org/privacy-policy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            <a
              className="hide-mobile"
              href="https://www.stellar.org/terms-of-service"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>
            <a
              href="https://github.com/stellar/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            {this.props.forceTheme ? (
              <a href="#" onClick={this.props.turnOffForceTheme}>
                Turn off the Force theme
              </a>
            ) : null}
          </nav>
        </div>
      </header>
    );
  }
}
