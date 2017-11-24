import React from 'react';
import Panel from 'muicss/lib/react/panel';
import {scale} from 'd3';
import BarChart from 'react-d3-components/lib/BarChart';

export default class Node extends React.Component {
  constructor(props) {
    super(props);
    this.colorScale = scale.category10();
    this.state = {loading: true, chartWidth: 300, chartHeigth: this.props.chartHeigth || 50};
  }

  componentDidMount() {
    // Update chart width
    setInterval(() => {
      let value = this.panel.offsetWidth-50;
      if (this.state.chartWidth != value) {
        this.setState({chartWidth: value});
      }
    }, 5000);
  }

  componentWillReceiveProps(props) {
    let data = [{
      label: "Ups",
      values: []
    }, {
      label: "Downs",
      values: []
    }];

    let state = 'up';
    let isNew = false;
    let countRecentDowns = 0;
    const downsToCheck = 6;

    for (let i = 0; i < props.uptime.length; i++) {
      let measurement = props.uptime[i];
      const up = measurement.status > 0;
      const noData = measurement.status == 0;
      const down = measurement.status < 0;

      if (i < downsToCheck && down) {
        countRecentDowns++;
      }

      if (up) {
        data[0].values.unshift({x: measurement.date, y: 2});
        data[1].values.unshift({x: measurement.date, y: 0});
      } else if (down) {
        data[0].values.unshift({x: measurement.date, y: 0});
        data[1].values.unshift({x: measurement.date, y: 1});
      } else if (noData) {
        isNew = true;
        data[0].values.unshift({x: measurement.date, y: 0});
        data[1].values.unshift({x: measurement.date, y: 0});
      }
    }

    if (countRecentDowns > 0) {
      state = 'problems';
    }

    // If last measurement is down then node is down.
    if (props.uptime.length > 0 && props.uptime[0].status < 0) {
      state = 'down';
    }

    this.setState({loading: false, data, isNew, state});
  }

  render() {
    return (
      <div className="mui-col-md-3" ref={(el) => { this.panel = el; }}>
        <Panel>
          <div className="widget-name">
            {this.props.data.name}
            {this.state.isNew ? <span className="new">new!</span> : null}
          </div>
          <table className="mui-table small" style={{'tableLayout': 'fixed'}}>
            <tbody>
              <tr>
                <td style={{width: '10%'}}><strong>Status</strong></td>
                <td className="amount-column">
                {
                  !this.state.loading ?
                    this.state.state == 'up' ?
                      <strong style={{color: "#2196f3"}}>Up!</strong>
                      :
                    this.state.state == 'problems' ?
                      <strong style={{color: "orange"}}>Problems...</strong>
                      :
                      <strong style={{color: "red"}}>Down!</strong>
                    :
                    <span>Loading...</span>
                }
                </td>
              </tr>
              <tr>
                <td><strong>Host</strong></td>
                <td className="amount-column">{this.props.data.host}:{this.props.data.port}</td>
              </tr>
              <tr>
                <td colSpan="2"><strong>Public Key</strong></td>
              </tr>
              <tr>
                <td colSpan="2" style={{wordWrap: "break-word"}}>{this.props.data.publicKey}</td>
              </tr>
            </tbody>
          </table>
          {this.state.loading ?
            'Loading...'
            :
            <div>
              <BarChart
                data={this.state.data}
                width={this.state.chartWidth}
                colorScale={this.colorScale}
                height={this.state.chartHeigth}
                margin={{top: 10, bottom: 8, left: -18, right: -15}} />
              <div className="small gray margin-top10">
                Checked every 5 mins. Last: {this.props.uptime[0].date} UTC
              </div>
            </div>
          }
        </Panel>
      </div>
    );
  }
}
