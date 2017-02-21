import React from 'react';
import Button from 'muicss/lib/react/button';
import {EventEmitter} from 'fbemitter';
import axios from 'axios';
import {Server} from 'stellar-sdk';
import {assign} from 'lodash';

import AppBar from './AppBar';
import AccountBalance from './AccountBalance';
import NetworkStatus from './NetworkStatus';
import LedgerCloseChart from './LedgerCloseChart';
import ListAccounts from './ListAccounts';
import PublicNetworkLedgersHistoryChart from './PublicNetworkLedgersHistoryChart';
import RecentOperations from './RecentOperations';
import TransactionsChart from './TransactionsChart';
import {LIVE_NEW_LEDGER, LIVE_NEW_OPERATION, TEST_NEW_LEDGER, TEST_NEW_OPERATION} from '../events';

const horizonLive = "https://horizon.stellar.org";
const horizonTest = "https://horizon-testnet.stellar.org";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.emitter = new EventEmitter();

    this.streamLedgers(horizonLive, LIVE_NEW_LEDGER);
    this.streamOperations(horizonLive, LIVE_NEW_OPERATION);

    this.streamLedgers(horizonTest, TEST_NEW_LEDGER);
    this.streamOperations(horizonTest, TEST_NEW_OPERATION);
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
          </section>
        </div>
      </div>
    );
  }
}
