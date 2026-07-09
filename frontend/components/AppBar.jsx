import React from "react";
import logoUrl from "../assets/stellar-logo-white.svg";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export default class AppBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: document.documentElement.getAttribute("data-theme") || "dark",
    };
  }

  toggleTheme() {
    const theme = this.state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // Storage can be unavailable (private browsing); the toggle still works.
    }
    // Charts listen for this to re-resolve their palette.
    window.dispatchEvent(new Event("themechange"));
    this.setState({ theme });
  }

  render() {
    return (
      <header className="site-header">
        <div className="container site-header-inner">
          <div className="site-header-left">
            <a
              className="site-brand"
              href="https://www.stellar.org"
              title="Back to Stellar.org"
            >
              <img className="site-logo" src={logoUrl} alt="Stellar" />
              <span className="site-brand-suffix">Network Dashboard</span>
            </a>
            <nav className="network-switcher" aria-label="Network">
              <a
                href="/"
                className={this.props.network === "live" ? "active" : null}
                onClick={(e) => {
                  e.preventDefault();
                  this.props.onSwitchNetwork("live");
                }}
              >
                Mainnet
              </a>
              <a
                href="/testnet"
                className={this.props.network === "test" ? "active" : null}
                onClick={(e) => {
                  e.preventDefault();
                  this.props.onSwitchNetwork("test");
                }}
              >
                Testnet
              </a>
            </nav>
          </div>
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
            <button
              type="button"
              className="icon-button"
              onClick={this.toggleTheme.bind(this)}
              aria-label={
                this.state.theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
            >
              {this.state.theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>
    );
  }
}
