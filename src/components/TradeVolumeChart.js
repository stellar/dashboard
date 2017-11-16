import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import {scale, format} from 'd3';
import BarChart from 'react-d3-components/lib/BarChart';
import clone from 'lodash/clone';
import each from 'lodash/each';

export default class TradeVolumeChart extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.colorScale = scale.category10();
    this.state = {loading: true, chartWidth: 400, chartHeight: this.props.chartHeight || 120};
    this.assets = this.props.assetPair.split('_');
  }

  componentDidMount() {
    this.getDexVolume();
    setInterval(() => this.getDexVolume(), 1000*60*5);
    // Update chart width
    setInterval(() => {
      let value = this.panel.offsetWidth-20;
      if (this.state.chartWidth != value) {
        this.setState({chartWidth: value});
      }
    }, 5000);
  }

  getDexVolume() {
    axios.get('/api/dex/'+this.props.assetPair)
      .then(response => {

        let data = [{
          label: this.assets[0],
          values: []
        }, {
          label: this.assets[1],
          values: []
        }];
        each(response.data, day => {
          if (day.dex_volume == null) {
            data[0].values.unshift({x: day.date, y: 0});
            data[1].values.unshift({x: day.date, y: 0});
          } else {
            data[0].values.unshift({x: day.date, y: day.dex_volume.Base_Volume});
            data[1].values.unshift({x: day.date, y: day.dex_volume.Counter_Volume});
          }

        });
        this.setState({loading: false, data});
      });
  }

  render() {
    return (
      <div ref={(el) => { this.panel = el; }}>
        <Panel>
          <div className="widget-name">
            Trade volume for <span style={{borderBottom: '2px solid #0074B7'}}>{this.assets[0]}</span>
            /
            <span style={{borderBottom: '2px solid #FF6F00'}}>{this.assets[1]}</span> in the last 30 days: Live Network
          </div>
          {this.state.loading ?
            'Loading...'
            :
            <BarChart
              groupedBars

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
