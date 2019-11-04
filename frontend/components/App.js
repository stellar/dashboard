import React from "react";
import Panel from "muicss/lib/react/panel";
import Button from "muicss/lib/react/button";
import { EventEmitter } from "fbemitter";
import axios from "axios";
import moment from "moment";
import { Server } from "stellar-sdk";

import AppBar from "./AppBar";
import AccountBalance from "./AccountBalance";
import FeeStats from "./FeeStats";
// import DistributionProgress from "./DistributionProgress";
import NetworkStatus from "./NetworkStatus";
import Nodes from "./Nodes";
import Incidents from "./Incidents";
import LedgerCloseChart from "./LedgerCloseChart";
import ListAccounts from "./ListAccounts";
// import LumensAvailable from "./LumensAvailable";
// import LumensDistributed from "./LumensDistributed";
import PublicNetworkLedgersHistoryChart from "./PublicNetworkLedgersHistoryChart";
import RecentOperations from "./RecentOperations";
// import TotalCoins from "./TotalCoins";
import TransactionsChart from "./TransactionsChart";
import FailedTransactionsChart from "./FailedTransactionsChart";
import { LIVE_NEW_LEDGER, TEST_NEW_LEDGER } from "../events";

const horizonLive = "https://horizon-mon.stellar-ops.com";
const horizonTest = "https://horizon-testnet.stellar.org";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.chrome57 = navigator.userAgent.toLowerCase().indexOf("chrome/57") > -1;
    this.emitter = new EventEmitter();
    this.sleepDetector();

    // forceTheme is our way to celebrate May, 4th.
    var forceTheme = false;
    var may4 = false;

    var now = new Date();
    var d = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();

    if (d == 4 && m == 5) {
      forceTheme = true;
      may4 = true;
    }

    // TLJ
    if (d == 9 && m == 12 && y == 2017) {
      forceTheme = true;
    }

    // TRS
    if (d == 20 && m == 12 && y == 2019) {
      forceTheme = true;
    }

    // For testing
    if (localStorage.getItem("forceTheme") != null) {
      forceTheme = true;
      may4 = true;
    }

    this.state = { forceTheme, may4 };
  }

  componentDidMount() {
    this.streamLedgers(horizonLive, LIVE_NEW_LEDGER);
    this.streamLedgers(horizonTest, TEST_NEW_LEDGER);

    this.getStatusPageData();
    this.statusPageUpdateInterval = setInterval(
      () => this.getStatusPageData(),
      30 * 1000,
    );
  }

  componentWillUnmount() {
    clearInterval(this.statusPageUpdateInterval);
  }

  getStatusPageData() {
    axios
      .get("https://9sl3dhr1twv1.statuspage.io/api/v2/summary.json")
      .then((response) => {
        this.setState({ statusPage: response.data });
      });
  }

  reloadOnConnection() {
    return axios
      .get("https://s3-us-west-1.amazonaws.com/stellar-heartbeat/index.html", {
        timeout: 5 * 1000,
      })
      .then(() => location.reload())
      .catch(() => setTimeout(this.reloadOnConnection.bind(this), 1000));
  }

  sleepDetector() {
    if (!this.lastTime) {
      this.lastTime = new Date();
    }

    let currentTime = new Date();
    if (currentTime - this.lastTime > 10 * 60 * 1000) {
      this.setState({ sleeping: true });
      this.reloadOnConnection();
      return;
    }

    this.lastTime = new Date();
    setTimeout(this.sleepDetector.bind(this), 5000);
  }

  streamLedgers(horizonURL, eventName) {
    // Get last ledger
    axios.get(`${horizonURL}/ledgers?order=desc&limit=1`).then((response) => {
      let lastLedger = response.data._embedded.records[0];

      new Server(horizonURL)
        .ledgers()
        .cursor(lastLedger.paging_token)
        .limit(200)
        .stream({
          onmessage: (ledger) => this.emitter.emit(eventName, ledger),
        });
    });
  }

  turnOffForceTheme() {
    this.setState({ forceTheme: false });
    return false;
  }

  render() {
    return (
      <div id="main" className={this.state.forceTheme ? "force" : null}>
        <AppBar
          forceTheme={this.state.forceTheme}
          turnOffForceTheme={this.turnOffForceTheme.bind(this)}
        />

        {/* Incidents */
        this.state.statusPage
          ? this.state.statusPage.incidents.map((m) => {
              return (
                <Panel key={m.id} className="mui--bg-accent">
                  <div className="mui--text-subhead mui--text-light">
                    <a
                      href={
                        "https://status.stellar.org/incidents/" + m.id
                      }
                    >
                      <strong>{m.name}</strong>
                    </a>{" "}
                    (started: {moment(m.started_at).fromNow()}
                    {m.incident_updates.length > 0
                      ? ", last update: " +
                        moment(m.incident_updates[0].created_at).fromNow()
                      : null}
                    )<br />
                    <small>
                      Affected: {m.components.map((c) => c.name).join(", ")}
                    </small>
                    <br />
                    {m.incident_updates.length > 0 ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: m.incident_updates[0].body,
                        }}
                      />
                    ) : null}
                  </div>
                </Panel>
              );
            })
          : null}

        {/* Scheduled maintenances */
        this.state.statusPage
          ? this.state.statusPage.scheduled_maintenances.map((m) => {
              return (
                <Panel key={m.id} className="mui--bg-accent-light">
                  <div className="mui--text-subhead mui--text-light">
                    Scheduled Maintenance:{" "}
                    <a
                      href={
                        "https://status.stellar.org/incidents/" + m.id
                      }
                    >
                      <strong>{m.name}</strong>
                    </a>{" "}
                    on{" "}
                    {moment(m.scheduled_for)
                      .utc()
                      .format("dddd, MMMM Do YYYY, [at] h:mma")}{" "}
                    UTC (
                    {moment(m.scheduled_for).format(
                      moment(m.scheduled_for)
                        .utc()
                        .format("dddd") ===
                        moment(m.scheduled_for).format("dddd")
                        ? "h:mma"
                        : "MMMM Do YYYY, h:mma",
                    )}{" "}
                    local time)
                    <br />
                    {m.incident_updates.length > 0 ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: m.incident_updates[0].body,
                        }}
                      />
                    ) : null}
                    <br />
                  </div>
                </Panel>
              );
            })
          : null}

        {this.chrome57 ? (
          <Panel>
            <div className="mui--text-subhead mui--text-dark-secondary">
              You are using Chrome 57. There is a{" "}
              <a
                href="https://bugs.chromium.org/p/chromium/issues/detail?id=707544"
                target="_blank"
              >
                known bug
              </a>{" "}
              that makes the Dashboard app consume extensive amounts of memory.
              Please switch to any other browser or wait for a fix by a Chromium
              team.
            </div>
          </Panel>
        ) : null}

        {this.state.sleeping ? (
          <Panel>
            <div className="mui--text-subhead mui--text-accent">
              System sleep detected. Waiting for internet connection...
            </div>
          </Panel>
        ) : null}

        {this.state.forceTheme && this.state.may4 ? (
          <h1 className="may4">
            May the 4<sup>th</sup> be with you!
          </h1>
        ) : null}

        <div id="main" className="mui-container-fluid">
          <section>
            <h1>Live network status</h1>
            <div className="row">
              <div className="mui-col-md-4">
                <NetworkStatus
                  network="Live network"
                  horizonURL={horizonLive}
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <Incidents />
                <FeeStats horizonURL={horizonLive} />
                <RecentOperations
                  limit="20"
                  label="Live network"
                  horizonURL={horizonLive}
                  emitter={this.emitter}
                />
              </div>
              <div className="mui-col-md-8">
                <LedgerCloseChart
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="100"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <TransactionsChart
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="100"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <FailedTransactionsChart
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="100"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <PublicNetworkLedgersHistoryChart />
              </div>
            </div>
          </section>

          <section>
            <h1>Lumen distribution</h1>

            <h2>
              11/4/2019: Updates to Lumen Distribution are currently paused. We will release an updated version of the Dashboard soon.
            </h2>
          </section>

          <section>
            <h1>Featured live network nodes</h1>
            <h2>
              None of the following validators are recommended by Stellar
              Development Foundation. We don't know who really controls
              unverified nodes.
              <br />
              These are <u>not</u> the only nodes in the Stellar network.
              Everyone can run a validating node.
              <br />
              This list is purely for informational purposes.
            </h2>
            <Nodes />
          </section>

          <section>
            <h1>Test network status</h1>
            <div className="mui-col-md-4">
              <NetworkStatus
                network="Test network"
                horizonURL={horizonTest}
                newLedgerEventName={TEST_NEW_LEDGER}
                emitter={this.emitter}
              />
              <RecentOperations
                limit="20"
                label="Test network"
                horizonURL={horizonTest}
                emitter={this.emitter}
              />
            </div>
            <div className="mui-col-md-8">
              <LedgerCloseChart
                network="Test network"
                horizonURL={horizonTest}
                limit="100"
                newLedgerEventName={TEST_NEW_LEDGER}
                emitter={this.emitter}
              />
              <TransactionsChart
                network="Test network"
                horizonURL={horizonTest}
                limit="100"
                newLedgerEventName={TEST_NEW_LEDGER}
                emitter={this.emitter}
              />
              <FailedTransactionsChart
                network="Test network"
                horizonURL={horizonTest}
                limit="100"
                newLedgerEventName={TEST_NEW_LEDGER}
                emitter={this.emitter}
              />
            </div>
            <div className="mui-col-md-4">
              <AccountBalance
                horizonURL={horizonTest}
                name="Friendbot"
                id="GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR"
              />
            </div>
          </section>
        </div>
      </div>
    );
  }
}
