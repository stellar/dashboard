import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import {scale, format} from 'd3';
import LineChart from 'react-d3-components/lib/LineChart';
import clone from 'lodash/clone';
import each from 'lodash/each';

export default class AccountsChart extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.colorScale = scale.category10();
    this.state = {loading: true, chartWidth: 400, chartHeight: this.props.chartHeight || 120};
  }

  componentDidMount() {
    this.getAccounts();
    setInterval(() => this.getAccounts(), 1000*60*5);
    // Update chart width
    setInterval(() => {
      let value = this.panel.offsetWidth-20;
      if (this.state.chartWidth != value) {
        this.setState({chartWidth: value});
      }
    }, 5000);
  }

  getAccounts() {
    axios.get('/api/accounts')
      .then(response => {
        let data = [{
          label: "Accounts",
          values: []
        }];
        each(response.data, day => {
          data[0].values.unshift({x: day.date, y: day.accounts});
        });
        this.setState({loading: false, data});
      });
  }

  render() {
    return (
      <div ref={(el) => { this.panel = el; }}>
        <Panel>
          <div className="widget-name">
            <span style={{borderBottom: '2px solid #0074B7'}}>
              Total Accounts in the last 30 days: Live Network
            </span>
          </div>
          {this.state.loading ?
            'Loading...'
            :
            <LineChart
                data={this.state.data}
                width={this.state.chartWidth}
                colorScale={this.colorScale}
                height={this.state.chartHeight}
                margin={{top: 10, bottom: 28, left: 50, right: 10}}/>
          }
        </Panel>
      </div>
    );
  }
}
