import React from "react";
import axios from "axios";
import round from "lodash/round";
import { ago, agoSeconds } from "../common/time";
import { copyStatusCard } from "./ui/statusCard.js";
import logoUrl from "../assets/stellar-logo-white.svg";

// ledgersInAverageCalculation defines how many last ledgers should be
// considered when calculating average ledger length.
const ledgersInAverageCalculation = 200;
// opsRateWindow defines how many recent ledgers feed the ops/min figure.
const opsRateWindow = 20;

export default class NetworkStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  // This method will be called when a new ledger is created.
  onNewLedger(ledger) {
    let lastLedgerSequence = ledger.sequence;
    let protocolVersion = ledger.protocol_version;
    let closedAt = new Date(ledger.closed_at);
    let lastLedgerLength = closedAt - this.state.closedAt;
    // Update last ${ledgersInAverageCalculation} ledgers length sum by subtracting
    // the oldest measurement we have and adding the newest.
    this.records.unshift(ledger);
    let ledgerLengthSum =
      this.state.ledgerLengthSum -
      (new Date(this.records[this.records.length - 2].closed_at) -
        new Date(this.records[this.records.length - 1].closed_at)) /
        1000 +
      (new Date(this.records[0].closed_at) -
        new Date(this.records[1].closed_at)) /
        1000;
    this.records.pop();
    // Protocol upgrades are the moment this page gets projected on big
    // screens — flash the stat when the version flips.
    if (
      this.state.protocolVersion &&
      protocolVersion !== this.state.protocolVersion
    ) {
      clearTimeout(this.protocolFlashTimer);
      this.setState({ protocolFlash: true });
      this.protocolFlashTimer = setTimeout(
        () => this.setState({ protocolFlash: false }),
        6000,
      );
    }
    this.setState({
      closedAt,
      closedAgo: agoSeconds(closedAt),
      lastLedgerSequence,
      lastLedgerLength,
      ledgerLengthSum,
      protocolVersion,
      opsPerMinute: this.opsPerMinute(),
    });
  }

  // Operations per minute over the most recent ledgers.
  opsPerMinute() {
    const window = this.records.slice(0, opsRateWindow);
    if (window.length < 2) {
      return null;
    }
    const ops = window.reduce(
      (sum, ledger) => sum + (ledger.operation_count || 0),
      0,
    );
    const minutes =
      (new Date(window[0].closed_at) -
        new Date(window[window.length - 1].closed_at)) /
      60000;
    return minutes > 0 ? Math.round(ops / minutes) : null;
  }

  getLastLedgers() {
    axios
      .get(
        `${this.props.horizonURL}/ledgers?order=desc&limit=${ledgersInAverageCalculation}`,
      )
      .then((response) => {
        let ledger = response.data._embedded.records[0];
        let lastLedgerSequence = ledger.sequence;
        let protocolVersion = ledger.protocol_version;
        let prevLedger = response.data._embedded.records[1];
        let closedAt = new Date(ledger.closed_at);
        let lastLedgerLength =
          new Date(ledger.closed_at) - new Date(prevLedger.closed_at);

        this.records = response.data._embedded.records;
        let ledgerLengthSum = 0;
        for (let i = 0; i < this.records.length - 1; i++) {
          ledgerLengthSum +=
            (new Date(this.records[i].closed_at) -
              new Date(this.records[i + 1].closed_at)) /
            1000;
        }

        this.setState({
          closedAt,
          // Set closedAgo right away — waiting for the next 1s timer tick
          // briefly renders a wrong "network slow" status on first paint.
          closedAgo: agoSeconds(closedAt),
          lastLedgerLength,
          lastLedgerSequence,
          ledgerLengthSum,
          protocolVersion,
          opsPerMinute: this.opsPerMinute(),
          loading: false,
        });
        // Start listening to events
        this.newLedgerListener = this.props.emitter.addListener(
          this.props.newLedgerEventName,
          this.onNewLedger.bind(this),
        );
      });
  }

  componentDidMount() {
    // Update closedAgo
    this.timerID = setInterval(() => {
      let closedAgo = null;

      if (this.state.closedAt) {
        closedAgo = agoSeconds(this.state.closedAt);
      }

      this.setState({ closedAgo });
    }, 1000);
    this.onKeyDown = (e) => {
      if (e.key === "Escape" && this.props.live && this.props.onExitLive) {
        this.props.onExitLive();
      }
    };
    window.addEventListener("keydown", this.onKeyDown);
    this.getLastLedgers();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    clearTimeout(this.shareResetTimer);
    clearTimeout(this.protocolFlashTimer);
    window.removeEventListener("keydown", this.onKeyDown);
    if (this.newLedgerListener) {
      this.newLedgerListener.remove();
    }
  }

  shareCard(statusText, statusClass, averageLedgerLength) {
    copyStatusCard({
      eyebrow: `${this.props.network} status`,
      statusText,
      statusClass,
      stats: [
        { label: "Last ledger", value: `#${this.state.lastLedgerSequence}` },
        {
          label: "Closed",
          value: `~${ago(this.state.closedAt)} ago in ${
            this.state.lastLedgerLength / 1000
          }s`,
        },
        { label: "Avg close", value: `${round(averageLedgerLength, 2)}s` },
        { label: "Protocol", value: `${this.state.protocolVersion}` },
      ],
    }).then((result) => {
      this.setState({ shareState: result });
      this.shareResetTimer = setTimeout(
        () => this.setState({ shareState: null }),
        2000,
      );
    });
  }

  // Fullscreen view for big screens: conference projections, wall monitors,
  // protocol-upgrade watch parties.
  renderLive(statusClass, statusText, averageLedgerLength) {
    return (
      <section className="live-mode">
        <div className="live-mode-header">
          <img
            className="live-mode-logo site-logo"
            src={logoUrl}
            alt="Stellar"
          />
          <div className="live-mode-eyebrow">{this.props.network}</div>
        </div>
        <div className="status-hero">
          <div className={"status-dot " + statusClass}></div>
          <h1 className="status-word">{statusText}</h1>
        </div>
        {!this.state.loading ? (
          <div className="live-mode-stats">
            <div className="stat">
              <div className="stat-label">Last ledger</div>
              <div className="stat-value">#{this.state.lastLedgerSequence}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Avg close</div>
              <div className="stat-value">
                {round(averageLedgerLength, 2)}s
              </div>
            </div>
            {this.state.opsPerMinute ? (
              <div className="stat">
                <div className="stat-label">Ops per minute</div>
                <div className="stat-value">
                  {this.state.opsPerMinute.toLocaleString("en-US")}
                </div>
              </div>
            ) : null}
            <div className="stat">
              <div className="stat-label">Protocol</div>
              <div
                className={
                  this.state.protocolFlash ? "stat-value flash" : "stat-value"
                }
              >
                {this.state.protocolVersion}
              </div>
            </div>
          </div>
        ) : null}
        <div className="live-mode-footer">
          <div className="live-mode-url">dashboard.stellar.org</div>
          <button
            type="button"
            className="live-mode-hint"
            onClick={() => this.props.onExitLive && this.props.onExitLive()}
          >
            Esc to exit
          </button>
        </div>
      </section>
    );
  }

  render() {
    let statusClass = "";
    let statusText;

    let averageLedgerLength =
      this.state.ledgerLengthSum / ledgersInAverageCalculation;
    if (this.state.loading) {
      statusText = "Connecting…";
    } else if (this.state.closedAgo >= 90) {
      // If last ledger closed more than 90 seconds ago it means network is down.
      statusClass = "down";
      statusText = "Network (or monitoring node) down";
    } else {
      // Now we check the average close time but we also need to check the latest ledger
      // close time because if there are no new ledgers it means that network is slow or down.
      if (averageLedgerLength <= 10 && this.state.closedAgo < 20) {
        statusText = "Up and running";
      } else if (averageLedgerLength <= 15 && this.state.closedAgo < 40) {
        statusClass = "slow";
        statusText = "Network slow";
      } else {
        statusClass = "very-slow";
        statusText = "Network very slow";
      }
    }

    if (this.props.live) {
      return this.renderLive(statusClass, statusText, averageLedgerLength);
    }

    return (
      <section className="network-hero">
        <div className="container network-hero-inner">
          <div className="network-hero-status">
            <div className="network-hero-eyebrow">
              <span className="stat-label">{this.props.network} status</span>
              {!this.state.loading ? (
                <button
                  type="button"
                  className={
                    this.state.shareState
                      ? "share-button active"
                      : "share-button"
                  }
                  onClick={() =>
                    this.shareCard(statusText, statusClass, averageLedgerLength)
                  }
                  title="Copy the network status as a shareable image"
                >
                  {this.state.shareState === "copied"
                    ? "Copied ✓"
                    : this.state.shareState === "downloaded"
                      ? "Downloaded ✓"
                      : this.state.shareState === "error"
                        ? "Couldn't copy"
                        : "Copy image"}
                </button>
              ) : null}
              {!this.state.loading && this.props.onEnterLive ? (
                <button
                  type="button"
                  className="share-button"
                  onClick={() => this.props.onEnterLive()}
                  title="Fullscreen live view for big screens"
                >
                  Live view
                </button>
              ) : null}
            </div>
            <div className="status-hero">
              <div className={"status-dot " + statusClass}></div>
              <h1 className="status-word">{statusText}</h1>
            </div>
          </div>
          {!this.state.loading ? (
            <div className="network-hero-stats">
              <div className="stat">
                <div className="stat-label">Last ledger</div>
                <div className="stat-value">
                  #{this.state.lastLedgerSequence}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Closed</div>
                <div className="stat-value">
                  ~{ago(this.state.closedAt)} ago in{" "}
                  {this.state.lastLedgerLength / 1000}s
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">
                  Avg close · {ledgersInAverageCalculation} ledgers
                </div>
                <div className="stat-value">
                  {round(averageLedgerLength, 2)}s
                </div>
              </div>
              {this.state.opsPerMinute ? (
                <div className="stat">
                  <div className="stat-label">Ops per minute</div>
                  <div className="stat-value">
                    {this.state.opsPerMinute.toLocaleString("en-US")}
                  </div>
                </div>
              ) : null}
              <div className="stat">
                <div className="stat-label">Protocol</div>
                <div className="stat-value">{this.state.protocolVersion}</div>
              </div>
            </div>
          ) : (
            <div className="network-hero-stats">
              <span className="skeleton" style={{ width: 320 }}></span>
            </div>
          )}
        </div>
      </section>
    );
  }
}
