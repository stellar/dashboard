import React from "react";
import { EventEmitter } from "fbemitter";
import axios from "axios";
import moment from "moment";
import * as StellarSdk from "@stellar/stellar-sdk";

import AppBar from "./AppBar.jsx";
import AccountBalance from "./AccountBalance.jsx";
import FeeStats from "./FeeStats.jsx";
import NetworkStatus from "./NetworkStatus.jsx";
import Incidents from "./Incidents.jsx";
// D3 components - now updated to D3 v7
import LedgerCloseChart from "./LedgerCloseChart.jsx";
import PublicNetworkLedgersHistoryChart from "./PublicNetworkLedgersHistoryChart.jsx";
import TransactionsChart from "./TransactionsChart.jsx";
import FailedTransactionsChart from "./FailedTransactionsChart.jsx";
import LumensCirculating from "./LumensCirculating.jsx";
import LumensNonCirculating from "./LumensNonCirculating.jsx";
import RecentOperations from "./RecentOperations.jsx";
import TotalCoins from "./TotalCoins.jsx";
import { LIVE_NEW_LEDGER, TEST_NEW_LEDGER } from "../events";
import { setTimeOffset } from "../common/time";
import { ScheduledMaintenance } from "./ScheduledMaintenance.jsx";
import sanitizeHtml from "../utilities/sanitizeHtml.js";

const horizonLive = "https://horizon.stellar.org";
const horizonTest = "https://horizon-testnet.stellar.org";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.chrome57 = navigator.userAgent.toLowerCase().indexOf("chrome/57") > -1;
    this.emitter = new EventEmitter();
    this.sleepDetector();

    // Add an axios response interceptor to setup a timestamp offset between
    // local time and horizon time if a date header is present
    // this will be used to settle clock discrepancies
    axios.interceptors.response.use(
      function (response) {
        let headerDate = response.headers.date;
        if (headerDate) {
          setTimeOffset(
            Math.round((new Date() - new Date(response.headers.date)) / 1000),
          );
        }
        return response;
      },
      function (error) {
        return Promise.reject(error);
      },
    );

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
    axios
      .get(`${horizonURL}/ledgers?order=desc&limit=1`)
      .then((response) => {
        let lastLedger = response.data._embedded.records[0];

        new StellarSdk.Horizon.Server(horizonURL)
          .ledgers()
          .cursor(lastLedger.paging_token)
          .limit(200)
          .stream({
            onmessage: (ledger) => this.emitter.emit(eventName, ledger),
            onerror: (error) => {
              console.warn("Stellar streaming error:", error);
              // Retry after 5 seconds
              setTimeout(() => this.streamLedgers(horizonURL, eventName), 5000);
            },
          });
      })
      .catch((error) => {
        console.warn("Failed to get initial ledger:", error);
        // Retry after 5 seconds
        setTimeout(() => this.streamLedgers(horizonURL, eventName), 5000);
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

        <div className="container">
          {
            /* Incidents */
            this.state.statusPage
              ? this.state.statusPage.incidents.map((m) => {
                  return (
                    <div key={m.id} className="banner">
                      <a href={"https://status.stellar.org/incidents/" + m.id}>
                        {m.name}
                      </a>
                      <div className="banner-meta">
                        started {moment(m.started_at).fromNow()}
                        {m.incident_updates.length > 0
                          ? ", last update " +
                            moment(m.incident_updates[0].created_at).fromNow()
                          : null}
                        {" · affected: "}
                        {m.components.map((c) => c.name).join(", ")}
                      </div>
                      {m.incident_updates.length > 0 ? (
                        <div>{sanitizeHtml(m.incident_updates[0].body)}</div>
                      ) : null}
                    </div>
                  );
                })
              : null
          }
          {
            /* Scheduled maintenances */
            this.state.statusPage &&
            this.state.statusPage.scheduled_maintenances.length ? (
              <ScheduledMaintenance
                scheduledMaintenances={
                  this.state.statusPage.scheduled_maintenances
                }
              />
            ) : null
          }
          {this.chrome57 ? (
            <div className="banner warning">
              You are using Chrome 57. There is a{" "}
              <a
                href="https://bugs.chromium.org/p/chromium/issues/detail?id=707544"
                target="_blank"
                rel="noreferrer"
              >
                known bug
              </a>{" "}
              that makes the Dashboard app consume extensive amounts of memory.
              Please switch to any other browser or wait for a fix by a Chromium
              team.
            </div>
          ) : null}
          {this.state.sleeping ? (
            <div className="banner warning">
              System sleep detected. Waiting for internet connection...
            </div>
          ) : null}
          {this.state.forceTheme && this.state.may4 ? (
            <h1 className="may4">
              May the 4<sup>th</sup> be with you!
            </h1>
          ) : null}
        </div>

        <main className="container">
          <section className="section">
            <h1 className="section-title">Live network</h1>
            <div className="grid">
              <div className="col-4 stack">
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
              <div className="col-8 stack">
                <LedgerCloseChart
                  chartHeight={150}
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="100"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <TransactionsChart
                  chartHeight={150}
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="100"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <FailedTransactionsChart
                  chartHeight={150}
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="100"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <PublicNetworkLedgersHistoryChart chartHeight={150} />
              </div>
            </div>
          </section>

          <section className="section">
            <h1 className="section-title">Lumen supply</h1>
            <div className="grid">
              <div className="col-4">
                <TotalCoins />
              </div>
              <div className="col-4">
                <LumensNonCirculating />
              </div>
              <div className="col-4">
                <LumensCirculating />
              </div>
            </div>
            <p className="section-footnote">
              How these numbers are calculated:{" "}
              <a
                href="https://www.stellar.org/developers/guides/lumen-supply-metrics.html"
                target="_blank"
                rel="noreferrer"
              >
                Lumen supply metrics
              </a>
            </p>
          </section>

          <section className="section">
            <h1 className="section-title">Network nodes</h1>
            <div className="card">
              <div className="card-body nodes-cta">
                <span>
                  View network nodes on Stellarbeat and visualize consensus.
                </span>
                <a
                  href="https://stellarbeat.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore nodes &rarr;
                </a>
              </div>
            </div>
          </section>

          <section className="section">
            <h1 className="section-title">Test network</h1>
            <div className="grid">
              <div className="col-4 stack">
                <NetworkStatus
                  network="Test network"
                  horizonURL={horizonTest}
                  newLedgerEventName={TEST_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <AccountBalance
                  horizonURL={horizonTest}
                  name="Friendbot"
                  id="GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR"
                />
                <RecentOperations
                  limit="20"
                  label="Test network"
                  horizonURL={horizonTest}
                  emitter={this.emitter}
                />
              </div>
              <div className="col-8 stack">
                <LedgerCloseChart
                  chartHeight={150}
                  network="Test network"
                  horizonURL={horizonTest}
                  limit="100"
                  newLedgerEventName={TEST_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <TransactionsChart
                  chartHeight={150}
                  network="Test network"
                  horizonURL={horizonTest}
                  limit="100"
                  newLedgerEventName={TEST_NEW_LEDGER}
                  emitter={this.emitter}
                />
                <FailedTransactionsChart
                  chartHeight={150}
                  network="Test network"
                  horizonURL={horizonTest}
                  limit="100"
                  newLedgerEventName={TEST_NEW_LEDGER}
                  emitter={this.emitter}
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="container">
            Live metrics for the Stellar network, streamed from Horizon and the
            dashboard API.{" "}
            <a
              href="https://github.com/stellar/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
          </div>
        </footer>
      </div>
    );
  }
}
