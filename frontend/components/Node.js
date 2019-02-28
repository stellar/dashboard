import React from 'react';
import Panel from 'muicss/lib/react/panel';
import {scale} from 'd3';
import BarChart from 'react-d3-components/lib/BarChart';

export default class Node extends React.Component {
  constructor(props) {
    super(props);
    this.colorScale = scale.category10();
    this.yAxisScale = scale.ordinal().domain([0, 1, 2]).rangePoints([20, 0]);
    this.state = {
      loading: true,
      chartWidth: 400,
      chartHeight: 20,
      expanded : false,
      small: false,
    };
  }

  componentDidMount() {
    // Update chart width
    this.updateSize();
    this.interval = setInterval(() => this.updateSize(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateSize() {
    let panelWidth = this.panel.offsetWidth;
    if (window.innerWidth < 1150 && !this.state.small) {
      this.setState({small: true, chartWidth: panelWidth/20});
    } else if (window.innerWidth >= 1150 && (this.state.small || this.state.chartWidth != panelWidth/3)) {
      this.setState({small: false, expanded: false, chartWidth: panelWidth/3});
    }
  }

  static getDerivedStateFromProps(props) {
    if (props.uptime === undefined) {
      return null;
    }

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

    for (let i = 0; i < props.uptime.latest.length; i++) {
      let measurement = props.uptime.latest[i];
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
    if (props.uptime.latest.length > 0 && props.uptime.latest[0].status < 0) {
      state = 'down';
    }

    let uptime_24h = props.uptime.uptime_24h;
    let uptime_30d = props.uptime.uptime_30d;

    return {loading: false, data, isNew, state, uptime_24h, uptime_30d};
  }

  renderData() {
    if (this.state.small) {
      return this.state.data.map(x => ({
        label: x.label,
        values: x.values.slice(x.values.length-5),
      }));
    }
    return this.state.data;
  }

  renderColor() {
    if (this.state.loading) {
      return "node-circle";
    } else if (this.state.state === "up") {
      return "node-circle blue";
    } else if (this.state.state === "problems") {
      return "node-circle orange";
    } else {
      return "node-circle red";
    }
  }

  render() {
    let style_24h;
    let style_30d;

    if (!this.state.loading) {
      if (this.state.uptime_24h === undefined) {
        style_24h = "";
      } else if (this.state.uptime_24h >= 99) {
        style_24h = "uptime-great";
      } else if (this.state.uptime_24h >= 95) {
        style_24h = "uptime-good";
      } else if (this.state.uptime_24h >= 80) {
        style_24h = "uptime-normal";
      } else {
        style_24h = "uptime-bad";
      }

      if (this.state.uptime_30d === undefined) {
        style_30d = "";
      } else if (this.state.uptime_30d >= 99) {
        style_30d = "uptime-great";
      } else if (this.state.uptime_30d >= 95) {
        style_30d = "uptime-good";
      } else if (this.state.uptime_30d >= 80) {
        style_30d = "uptime-normal";
      } else {
        style_30d = "uptime-bad";
      }
    }

    return (
      <div ref={(el) => { this.panel = el; }}>
        <Panel className="mui-col-md-12 node-panel">
          <div className="node-panel-large">
            <div className="mui-col-md-3 mui-col-sm-11 mui-col-xs-9 node-circle-container">
              <div className={this.renderColor()} />
                {this.props.data.name}
              </div>
              <div className="mui-col-md-3 mui--hidden-sm mui--hidden-xs">
                <i className="material-icons dicon">domain</i>
                <div className="afterI">{this.props.data.host}:{this.props.data.port}</div>
              </div>
              {this.state.loading ?
                null :
                <div className="mui-col-md-2 mui--hidden-sm mui--hidden-xs">
                  <i className="material-icons dicon">av_timer</i>
                  <div className="afterI">
                    24H <span className={style_24h}>{this.state.uptime_24h === undefined ? 'n/d' : `${this.state.uptime_24h}%`}</span>&nbsp;
                    30D <span className={style_30d}>{this.state.uptime_30d === undefined ? 'n/d' : `${this.state.uptime_30d}%`}</span>&nbsp;
                  </div>
                </div>
              }
              {this.state.loading ?
                'Loading...' :
                <div className={"mui-col-md-4 mui-col-sm-1 mui-col-xs-3 node-barchart-container"}>
                  {
                    this.state.small ? "" :
                    <div className="node-hovered-container">
                      <p className={"node-pubkey"}>{this.props.data.publicKey} </p>
                    </div>
                  }
                  <div className={"node-barchart"}>
                    <BarChart
                      data={this.renderData()}
                      width={this.state.chartWidth}
                      yScale={this.yAxisScale}
                      colorScale={this.colorScale}
                      height={this.state.chartHeight} />
                  </div>
                  {
                    this.state.small ? <i className="material-icons node-dropdown-button" onClick={() => this.setState({expanded : !this.state.expanded})}>expand_more</i> : ""
                  }
                </div>
              }
            </div>
            {this.state.expanded && this.state.small ?
              <div className="node-dropdown">
                <table className="mui-table small" style={{'tableLayout': 'fixed'}}>
                  <tbody>
                    <tr>
                      <td style={{width: '15%'}}><strong>Status</strong></td>
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
                      <td><strong>Uptime 24H</strong></td>
                      <td className="amount-column"><span className={style_24h}>{this.state.uptime_24h === undefined ? 'n/d' : `${this.state.uptime_24h}%`}</span></td>
                    </tr>
                    <tr>
                      <td><strong>Uptime 30D</strong></td>
                      <td className="amount-column"><span className={style_30d}>{this.state.uptime_30d === undefined ? 'n/d' : `${this.state.uptime_30d}%`}</span></td>
                    </tr>
                    <tr>
                      <td colSpan="2"><strong>Public Key</strong></td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{wordWrap: "break-word"}}>{this.props.data.publicKey}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="small gray margin-top10 node-update-interval-container">
                  Checked every 5 mins. Last: {this.props.uptime.latest[0].date} UTC
                </div>
              </div>
              :""
          }
        </Panel>
      </div>
    );
  }
}
