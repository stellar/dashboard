import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import round from "lodash/round";
import { ago } from "../common/time";

// ledgersInAverageCalculation defines how many last ledgers should be
// considered when calculating average ledger length.
const ledgersInAverageCalculation = 200;

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
    this.setState({
      closedAt,
      lastLedgerSequence,
      lastLedgerLength,
      ledgerLengthSum,
      protocolVersion,
    });
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
          lastLedgerLength,
          lastLedgerSequence,
          ledgerLengthSum,
          protocolVersion,
          loading: false,
        });
        // Start listening to events
        this.props.emitter.addListener(
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
        closedAgo = (new Date() - this.state.closedAt) / 1000;
      }

      this.setState({ closedAgo });
    }, 1000);
    this.getLastLedgers();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    let statusClass;
    let statusText;

    let averageLedgerLength =
      this.state.ledgerLengthSum / ledgersInAverageCalculation;
    if (this.state.loading) {
      statusText = <strong className="mui--text-body2">Loading...</strong>;
    } else if (this.state.closedAgo >= 90) {
      // If last ledger closed more than 90 seconds ago it means network is down.
      statusClass = "down";
      statusText = (
        <strong className="mui--text-body2" style={{ color: "#666" }}>
          Network (or monitoring node) down!
        </strong>
      );
    } else {
      // Now we check the average close time but we also need to check the latest ledger
      // close time because if there are no new ledgers it means that network is slow or down.
      if (averageLedgerLength <= 10 && this.state.closedAgo < 20) {
        statusText = (
          <strong className="mui--text-body2" style={{ color: "#2196f3" }}>
            Up and running!
          </strong>
        );
      } else if (averageLedgerLength <= 15 && this.state.closedAgo < 40) {
        statusClass = "slow";
        statusText = (
          <strong className="mui--text-body2" style={{ color: "orange" }}>
            Network slow!
          </strong>
        );
      } else {
        statusClass = "very-slow";
        statusText = (
          <strong className="mui--text-body2" style={{ color: "red" }}>
            Network very slow!
          </strong>
        );
      }
    }

    return (
      <Panel>
        <div className="widget-name">Network Status: {this.props.network}</div>
        <div className="mui--text-center">
          {/* Fancy pulse effect */}
          <div className="pulse-container">
            <div className={"pulse pulse1 " + statusClass}></div>
            <div className={"pulse pulse2 " + statusClass}></div>
          </div>
        </div>
        <div className="mui--text-caption mui--text-center">
          {statusText}
          <br />
          {!this.state.loading ? (
            <div>
              Protocol version: {this.state.protocolVersion}
              <br />
              Last ledger: #{this.state.lastLedgerSequence} closed ~
              {ago(this.state.closedAt)} ago in{" "}
              {this.state.lastLedgerLength / 1000}s.
              <br />
              Average ledger close time in the last{" "}
              {ledgersInAverageCalculation} ledgers:{" "}
              {round(averageLedgerLength, 2)}s.
            </div>
          ) : (
            ""
          )}
        </div>
      </Panel>
    );
  }
}
