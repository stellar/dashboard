import React from 'react';
import Panel from 'muicss/lib/react/panel';
import Button from 'muicss/lib/react/button';
import {EventEmitter} from 'fbemitter';
import axios from 'axios';
import {Server} from 'stellar-sdk';
import assign from 'lodash/assign';

import AppBar from './AppBar';
import AccountBalance from './AccountBalance';
import DistributionProgress from './DistributionProgress';
import NetworkStatus from './NetworkStatus';
import LedgerCloseChart from './LedgerCloseChart';
import ListAccounts from './ListAccounts';
import LumensAvailable from './LumensAvailable';
import LumensGivenAway from './LumensGivenAway';
import PublicNetworkLedgersHistoryChart from './PublicNetworkLedgersHistoryChart';
import RecentOperations from './RecentOperations';
import TotalCoins from './TotalCoins';
import TransactionsChart from './TransactionsChart';
import {LIVE_NEW_LEDGER, LIVE_NEW_OPERATION, TEST_NEW_LEDGER, TEST_NEW_OPERATION} from '../events';

const horizonLive = "https://horizon.stellar.org";
const horizonTest = "https://horizon-testnet.stellar.org";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.emitter = new EventEmitter();
    this.sleepDetector();
  }

  componentDidMount() {
    this.streamLedgers(horizonLive, LIVE_NEW_LEDGER);
    this.streamOperations(horizonLive, LIVE_NEW_OPERATION);

    this.streamLedgers(horizonTest, TEST_NEW_LEDGER);
    this.streamOperations(horizonTest, TEST_NEW_OPERATION);
  }

  sleepDetector() {
    if (!this.lastTime) {
      this.lastTime = new Date();
    }

    let currentTime = new Date();
    if (currentTime - this.lastTime > 20*60*1000) {
      this.setState({sleeping: true});
      location.reload();
      return;
    }

    this.lastTime = new Date();
    setTimeout(this.sleepDetector.bind(this), 5000);
  }

  streamLedgers(horizonURL, eventName) {
    // Get last ledger
    axios.get(`${horizonURL}/ledgers?order=desc&limit=1`)
      .then(response => {
        let lastLedger = response.data._embedded.records[0];

        new Server(horizonURL).ledgers().cursor(lastLedger.paging_token)
          .stream({
            onmessage: ledger => this.emitter.emit(eventName, ledger)
          });
      });
  }

  streamOperations(horizonURL, eventName) {
    // Get last operation
    axios.get(`${horizonURL}/operations?order=desc&limit=1`)
      .then(response => {
        let lastOperation = response.data._embedded.records[0];

        new Server(horizonURL).operations().cursor(lastOperation.paging_token)
          .stream({
            onmessage: operation => this.emitter.emit(eventName, operation)
          });
      });
  }

  render() {
    return (
      <div>
        <AppBar />

        {this.state.sleeping ?
          <Panel>
            <div className="mui--text-subhead mui--text-accent">System sleep detected. Reloading...</div>
          </Panel>
          :
          null
        }

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
                <RecentOperations
                  limit="20"
                  label="Live network"
                  horizonURL={horizonLive}
                  newOperationEventName={LIVE_NEW_OPERATION}
                  emitter={this.emitter}
                  />
              </div>
              <div className="mui-col-md-8">
                <LedgerCloseChart
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="200"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                  />
                <TransactionsChart
                  network="Live network"
                  horizonURL={horizonLive}
                  limit="200"
                  newLedgerEventName={LIVE_NEW_LEDGER}
                  emitter={this.emitter}
                  />
                <PublicNetworkLedgersHistoryChart />
              </div>
            </div>
          </section>

          <section>
            <h1>Lumen distribution</h1>

            <div className="mui-col-md-4">
              <DistributionProgress />
            </div>

            <div className="mui-col-md-4">
              <TotalCoins
                horizonURL={horizonLive}
                />
            </div>

            <div className="mui-col-md-4">
              <LumensAvailable />
            </div>

            <div className="mui-col-md-4">
              <LumensGivenAway />
            </div>
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
                newOperationEventName={TEST_NEW_OPERATION}
                emitter={this.emitter}
                />
            </div>
            <div className="mui-col-md-8">
              <LedgerCloseChart
                network="Test network"
                horizonURL={horizonTest}
                limit="200"
                newLedgerEventName={TEST_NEW_LEDGER}
                emitter={this.emitter}
                />
              <TransactionsChart
                network="Test network"
                horizonURL={horizonTest}
                limit="200"
                newLedgerEventName={TEST_NEW_LEDGER}
                emitter={this.emitter}
                />
            </div>
            <div className="mui-col-md-4">
              <AccountBalance
                horizonURL={horizonTest}
                name="Friendbot"
                id="GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
                />
            </div>
          </section>
          <section>
            <div className="mui--text-center">Contribute on <a href="https://github.com/stellar/dashboard">GitHub</a>!</div>
          </section>
        </div>
      </div>
    );
  }
}
