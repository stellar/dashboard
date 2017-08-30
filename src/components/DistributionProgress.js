import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import reduce from "lodash/reduce";
import filter from "lodash/filter";
import BigNumber from 'bignumber.js';
import Cell from 'recharts/lib/component/Cell';
import PieChart from 'recharts/lib/chart/PieChart';
import Pie from 'recharts/lib/polar/Pie';
import {distributionDirectSignup, distributionBitcoinProgram, distributionPartnershipProgram, distributionBuildChallenge} from '../../common/lumens.js';

const BILLION = Math.pow(10, 9);

export default class DistributionProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loading: true, chartWidth: 400, chartHeigth: this.props.chartHeigth || 200};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.updateData(),
      5*60*1000
    );
    this.updateData();
    setInterval(() => {
      let value = this.panel.offsetWidth-20;
      if (this.state.chartWidth != value) {
        this.setState({chartWidth: value});
      }
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateData() {
    let programs = [];
    let dataOuter = [];
    let dataInner = [];

    Promise.all([
      distributionDirectSignup(),
      distributionBitcoinProgram(),
      distributionPartnershipProgram(),
      distributionBuildChallenge()
    ]).then(results => {
        let [directSignup, bitcoinProgram, partnershipProgram, buildChallenge] = results;

        let directSignupLeft = new BigNumber(50*BILLION).minus(directSignup);
        let partnershipProgramLeft = new BigNumber(25*BILLION).minus(partnershipProgram);
        let buildChallengeLeft = new BigNumber(1*BILLION).minus(buildChallenge);

        // Programs - used in a table below the pie chart
        programs.push({name: 'Direct signup program',   value: parseInt(directSignup),       p: this.percentOf(directSignup, 50)});
        programs.push({name: 'Bitcoin program',         value: parseInt(bitcoinProgram),     p: "100" /* BTC/XRP Giveaway are over */});
        programs.push({name: 'Stellar Build Challenge', value: parseInt(buildChallenge),     p: this.percentOf(buildChallenge, 1)});
        programs.push({name: 'Partnership program',     value: parseInt(partnershipProgram), p: this.percentOf(partnershipProgram, 25)});

        // Outer Pie
        const distributedColor = '#0C7EC2';
        const toDistributeColor = '#C2DAF1';
        const sdfColor = '#BDBDBD';

        dataOuter.push({name: 'Direct signup program',   value: parseInt(directSignup),       color: distributedColor});
        dataOuter.push({name: 'Bitcoin program',         value: parseInt(bitcoinProgram),     color: distributedColor});
        dataOuter.push({name: 'Stellar Build Challenge', value: parseInt(buildChallenge),     color: distributedColor});
        dataOuter.push({name: 'Partnership program',     value: parseInt(partnershipProgram), color: distributedColor});

        dataOuter.push({name: 'Direct signup program left', value: parseInt(directSignupLeft),         color: toDistributeColor});
        dataOuter.push({name: 'Partnership program left',   value: parseInt(partnershipProgramLeft),   color: toDistributeColor});
        dataOuter.push({name: 'Build Challenge left',       value: parseInt(buildChallengeLeft),       color: toDistributeColor});

        let notAssigned = reduce(dataOuter, (left, section) => left - section.value, 95*BILLION);
        dataOuter.push({name: 'Not assigned', value: notAssigned, color: toDistributeColor});

        // Hide programs with less than 1B distributed, their labels overlap in the pie chart.
        dataOuter = filter(dataOuter, p => p.value >= BILLION);

        // Inner Pie
        var sumDistributed = reduce(programs, (sum, program) => sum += program.value, 0);
        dataInner.push({name: 'Distributed',   value: sumDistributed,                       color: distributedColor})
        dataInner.push({name: 'To Distribute', value: 100*BILLION-5*BILLION-sumDistributed, color: toDistributeColor})

        // Add SDF funds to inner and outer pie
        const sdfFunds = {name: 'SDF operational costs', value: 5*BILLION, color: sdfColor}
        dataOuter.push(sdfFunds);
        dataInner.push(sdfFunds);

        this.setState({programs, dataOuter, dataInner, loading: false});
      });
  }

  percentOf(x, yBillions) {
    return new BigNumber(x).div(yBillions*Math.pow(10, 9)).mul(100).round(2, BigNumber.ROUND_DOWN).toFormat(2).toString();
  }

  render() {
    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload}) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 2.4;
      let x  = cx + radius * Math.cos(-midAngle * RADIAN);
      let y = cy  + radius * Math.sin(-midAngle * RADIAN);

      // recharts don't rearange labels when they overlap...
      if (payload.name == "Bitcoin program") {
        y += 10;
      }

      return (
        <text fill="black" fontSize="12" x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {payload.name}
        </text>
      );
    };


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
                <PieChart width={this.state.chartWidth} height={this.state.chartHeigth}>
                  <Pie data={this.state.dataInner} cx="50%" cy="50%" outerRadius={25}
                     startAngle={90} endAngle={-270} isAnimationActive={false}>
                     {this.state.dataInner.map((entry, index) => <Cell key={index} fill={entry.color}/>)}
                  </Pie>
                  <Pie data={this.state.dataOuter} label={renderCustomizedLabel} cx="50%" cy="50%"
                       innerRadius={30} outerRadius={50} startAngle={90} endAngle={-270} isAnimationActive={false}>
                    {this.state.dataOuter.map((entry, index) => <Cell key={index} fill={entry.color}/>)}
                  </Pie>
               </PieChart>
                <table className="mui-table small">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Progress</th>
                      <th>Amount Distributed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      Object.keys(this.state.programs).map(key => {
                        let row = this.state.programs[key];
                        if (!row.p) {
                          return;
                        }
                        return <tr key={key}>
                          <td>{row.name}</td>
                          <td className="amount-column">{row.p ? `${row.p}%` : null}</td>
                          <td className="amount-column">{new BigNumber(row.value).toFormat(0, BigNumber.ROUND_HALF_UP)} XLM</td>
                        </tr>;
                      })
                    }
                  </tbody>
                </table>
                <div className="small gray margin-top10">
                  Learn more about <a href="https://www.stellar.org/about/mandate/#Lumen_distribution" target="_blank">Lumen distribution</a>.
                </div>
              </div>
          }
        </Panel>
      </div>
    );
  }
}
