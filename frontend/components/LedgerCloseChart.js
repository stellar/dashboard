import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import {scale} from 'd3';
import BarChart from 'react-d3-components/lib/BarChart';
import { ResponsiveBar } from '@nivo/bar'
import each from 'lodash/each';
import clone from 'lodash/clone';

export default class LedgerChartClose extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.colorScale = scale.category10();
    this.state = {loading: true, chartWidth: 400, chartHeigth: this.props.chartHeigth || 120};
    this.url = `${this.props.horizonURL}/ledgers?order=desc&limit=${this.props.limit}`;
  }

  componentDidMount() {
    this.getLedgers();
    // Update chart width
    this.updateSize()
    setInterval(() => this.updateSize(), 5000);
  }

  updateSize() {
    let value = this.panel.offsetWidth-20;
    if (this.state.chartWidth != value) {
      this.setState({chartWidth: value});
    }
  }

  getLedgers() {
    axios.get(this.url)
      .then(response => {
        let data = [{
          label: "Ledger Close",
          values: []
        }];
        this.lastLedgerClosedAt = null;
        each(response.data._embedded.records, ledger => {
          let closedAt = new Date(ledger.closed_at);
          if (this.lastLedgerClosedAt == null) {
            this.lastLedgerClosedAt = closedAt;
            this.frontLedgerClosedAt = closedAt; // used in onNewLedger
            return;
          }
          let diff = (this.lastLedgerClosedAt - closedAt)/1000;
          data[0].values.unshift({x: ledger.sequence.toString(), y: diff});
          this.lastLedgerClosedAt = closedAt;
        });

        // Reduce a separate data structure for the nivo bar chart
        const nivoData = this.nivoReducer(response.data._embedded.records)
        this.setState({loading: false, data, nivoData });

        // TODO: Remove logs
        console.log('records', response.data._embedded.records)
        console.log({nivoData})

        // Start listening to events
        this.props.emitter.addListener(this.props.newLedgerEventName, this.onNewLedger.bind(this));
      });
  }

  onNewLedger(ledger) {
    let closedAt = new Date(ledger.closed_at);
    if (this.frontLedgerClosedAt) {
      let data = clone(this.state.data);
      let diff = (closedAt - this.frontLedgerClosedAt)/1000;
      data[0].values.push({x: ledger.sequence.toString(), y: diff});
      if (data[0].values.length > this.props.limit) {
        data[0].values.shift();
      }
      this.setState({data});
    }

    this.frontLedgerClosedAt = closedAt;
  }

  nivoReducer(ledgers) {
    // TODO: Clean up duplicate logic from above
    this.lastLedgerClosedAt = null;
    return ledgers.map(ledger => {
      const closedAt = new Date(ledger.closed_at);
      if (this.lastLedgerClosedAt == null) {
        this.lastLedgerClosedAt = closedAt;
        this.frontLedgerClosedAt = closedAt; // used in onNewLedger
        return;
      }
      const diff = (this.lastLedgerClosedAt - closedAt)/1000;
      this.lastLedgerClosedAt = closedAt;
      return {
        id: ledger.sequence,
        closedAt: diff,
      }
    }).filter(ledger => ledger) // Removes random null values
  }

  render() {
    return (
      <div ref={(el) => { this.panel = el; }}>
        <Panel>
          <div className="widget-name">
            Last {this.props.limit} ledgers close times: {this.props.network}
            <a href={this.url} target="_blank" className="api-link">API</a>
          </div>
          {this.state.loading ?
            'Loading...'
            :
            <BarChart
              data={this.state.data}
              width={this.state.chartWidth}
              colorScale={this.colorScale}
              height={this.state.chartHeigth}
              margin={{top: 10, bottom: 8, left: 50, right: 10}}
              onMouseEnter={(e, data) => console.log("ledger: ", data)}
              onMouseLeave={() => ({})}
              />
          }
        </Panel>
        <Panel style={{ height: '200px'}}> 
          {
            this.state.loading
              ? 'Loading...'
              : <React.Fragment>
                  <div className="widget-name">
                    Last {this.props.limit} ledgers close times: {this.props.network} (Made With Nivo Bar Chart)
                    <a href={this.url} target="_blank" className="api-link">API</a>
                  </div>
                  <LedgerChartNivoBar data={this.state.nivoData} />
                </React.Fragment>
          }
        </Panel>
      </div>
    );
  }
}

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const LedgerChartNivoBar = ({ data }) => (
  <ResponsiveBar
      data={data}
      keys={[
          // "id",
          "closedAt"
      ]}
      indexBy="id"
      margin={{
          "bottom": 20,
          "left": 60,
          "top": 20,
      }}
      padding={0.3}
      colors={{
          "scheme": "nivo"
      }}
      defs={[
          {
              "id": "dots",
              "type": "patternDots",
              "background": "inherit",
              "color": "#38bcb2",
              "size": 4,
              "padding": 1,
              "stagger": true
          },
          {
              "id": "lines",
              "type": "patternLines",
              "background": "inherit",
              "color": "#eed312",
              "rotation": -45,
              "lineWidth": 6,
              "spacing": 10
          }
      ]}
      borderColor={{
          "from": "color",
          "modifiers": [
              [
                  "darker",
                  1.6
              ]
          ]
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={null}
      axisLeft={{
          "tickSize": 5,
          "tickPadding": 5,
          "tickRotation": 0,
          "legendPosition": "middle",
          "legendOffset": -40
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
          "from": "color",
          "modifiers": [
              [
                  "darker",
                  1.6
              ]
          ]
      }}
      legends={[]}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
  />
)