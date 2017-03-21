import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import PieChart from 'react-d3-components/lib/PieChart';
import {scale} from 'd3';
import {distributionDirectSignup, distributionBitcoinProgram, distributionNonprofitProgram} from '../../common/lumens.js';

export default class DistributionProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loading: true, chartWidth: 400, chartHeigth: this.props.chartHeigth || 120};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.updateData(),
      5*60*1000
    );
    this.updateData();
    setInterval(() => this.setState({chartWidth: this.panel.offsetWidth-20}), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateData() {
    let data = {label: 'Distribution', values: []};

    Promise.all([
      distributionDirectSignup(),
      distributionBitcoinProgram(),
      distributionNonprofitProgram()
    ]).then(results => {
        let directSignup = results[0];
        let bitcoinProgram = results[1];
        let nonProfits = results[2];

        let directSignupLeft = new BigNumber(50*Math.pow(10, 9)).minus(directSignup);
        let bitcoinProgramLeft = new BigNumber(20*Math.pow(10, 9)).minus(bitcoinProgram);
        let nonProfitsLeft = new BigNumber(25*Math.pow(10, 9)).minus(nonProfits);

        let percentDirectSignup = this.percentOf(directSignup, 50);
        data.values.push({x: `Direct signup program (${percentDirectSignup}%)`, y: directSignup, p: percentDirectSignup});
        data.values.push({x: 'Direct signup program left', y: directSignupLeft});

        let percentBitcoinProgram = this.percentOf(bitcoinProgram, 20);
        data.values.push({x: `Bitcoin program (${percentBitcoinProgram}%)`, y: bitcoinProgram, p: percentBitcoinProgram});
        data.values.push({x: 'Bitcoin program left', y: bitcoinProgramLeft});

        let percentNonProfits = this.percentOf(nonProfits, 25);
        data.values.push({x: `Funded by stellar (${percentNonProfits}%)`, y: nonProfits, p: percentNonProfits});
        data.values.push({x: 'Funded by stellar left ', y: nonProfitsLeft});

        data.values.push({x: 'SDF operational costs', y: "5000000000"});
        this.setState({data, loading: false});
      });
  }

  percentOf(x, yBillions) {
    return new BigNumber(x).div(yBillions*Math.pow(10, 9)).mul(100).round(2).toFormat(2).toString();
  }

  render() {
    return (
      <div ref={(el) => { this.panel = el; }}>
        <Panel>
          <div className="widget-name">
            Distribution Progress
            <a href="/api/lumens" target="_blank" className="api-link">API</a>
          </div>
          {this.state.loading ?
              'Loading...'
              :
              <div>
                <PieChart
                  data={this.state.data}
                  innerRadius={30}
                  outerRadius={40}
                  sort={null}
                  scale={scale.category20()}
                  width={this.state.chartWidth}
                  height={this.state.chartHeigth}
                  margin={{top: 10, bottom: 10, left: 10, right: 10}} />
                <table className="mui-table small">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Progress</th>
                      <th>Amount Given Away</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      Object.keys(this.state.data.values).map(key => { 
                        let row = this.state.data.values[key];
                        if (!row.p) {
                          return;
                        }
                        return <tr key={key}>
                          <td>{row.x}</td>
                          <td className="amount-column">{row.p ? `${row.p}%` : null}</td>
                          <td className="amount-column">{new BigNumber(row.y).toFormat(0, BigNumber.ROUND_HALF_UP)} XLM</td>
                        </tr>
                      })
                    }
                  </tbody>
                </table>
              </div>
          }
        </Panel>
      </div>
    );
  }
}
