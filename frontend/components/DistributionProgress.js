import React from "react";
import Panel from "muicss/lib/react/panel";
import filter from "lodash/filter";
import BigNumber from "bignumber.js";
import Cell from "recharts/lib/component/Cell";
import PieChart from "recharts/lib/chart/PieChart";
import Pie from "recharts/lib/polar/Pie";
import * as lumens from "../../common/lumens.js";

const BILLION = Math.pow(10, 9);

export default class DistributionProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      chartWidth: 400,
      chartHeight: this.props.chartHeight || 200,
    };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.updateData(), 5 * 60 * 1000);
    this.updateData();
    setInterval(() => {
      let value = this.panel.offsetWidth - 20;
      if (this.state.chartWidth != value) {
        this.setState({ chartWidth: value });
      }
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateData() {
    let programs = [];

    Promise.all([
      lumens.totalCoins(this.props.horizonLiveURL),
      // lumens.sdfAccounts(),
      // lumens.availableCoins(),
      lumens.distributionAll(),
      lumens.distributionDirectSignup(),
      lumens.distributionBitcoinProgram(),
      lumens.distributionPartnershipProgram(),
      lumens.distributionBuildChallenge(),
      lumens.distributionEcosystemSupport(),
      lumens.distributionUseCaseInvestment(),
      lumens.distributionUserAcquisition(),
    ]).then((results) => {
      const [
        totalCoins,
        // sdfAccounts,
        // availableCoins,
        distributionAll,
        directSignup,
        bitcoinProgram,
        partnershipProgram,
        buildChallenge,
        ecosystemSupport,
        useCaseInvestment,
        userAcquisition,
      ] = results;
      const sdfAccounts = 1000000;
      const availableCoins = 1000000;

      const directSignupLeft = new BigNumber(50 * BILLION).minus(directSignup);
      const partnershipProgramLeft = new BigNumber(25 * BILLION).minus(
        partnershipProgram,
      );

      const distributedColor = "#0C7EC2";
      const toDistributeColor = "#C2DAF1";

      // Pie chart and table
      programs.push({
        name: "Direct Development",
        value: parseInt(directSignup),
        color: distributedColor,
      });
      programs.push({
        name: "Ecosystem Support",
        value: parseInt(ecosystemSupport),
        color: distributedColor,
      });
      programs.push({
        name: "Use-Case Investment",
        value: parseInt(useCaseInvestment),
        color: distributedColor,
      });
      programs.push({
        name: "User Acquisition",
        value: parseInt(userAcquisition),
        color: distributedColor,
      });

      let sdfDiscretionary = new BigNumber(sdfAccounts)
        .minus(directSignupLeft)
        .minus(partnershipProgramLeft);
      programs.push({
        name: "SDF discretionary",
        value: sdfDiscretionary.toNumber(),
        color: toDistributeColor,
      });

      // Hide programs with less than 2B distributed, their labels overlap in the pie chart.
      programs = filter(programs, (p) => p.value >= 0.9 * BILLION);

      this.setState({ programs, loading: false });
    });
  }

  percentOf(x, yBillions) {
    return (
      new BigNumber(x)
        .div(yBillions * Math.pow(10, 9))
        .mul(100)
        .round(2, BigNumber.ROUND_DOWN)
        .toFormat(2)
        .toString() + "%"
    );
  }

  render() {
    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      payload,
    }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 2.4;
      let x = cx + radius * Math.cos(-midAngle * RADIAN);
      let y = cy + radius * Math.sin(-midAngle * RADIAN);

      // recharts don't rearange labels when they overlap...
      if (payload.name == "Bitcoin program") {
        y += 10;
      }

      if (payload.name == "Other") {
        y += 10;
      }

      return (
        <text
          fill="black"
          fontSize="12"
          x={x}
          y={y}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
        >
          {payload.name}
        </text>
      );
    };

    const { chartHeight, chartWidth, loading, programs } = this.state;

    return (
      <div
        ref={(el) => {
          this.panel = el;
        }}
      >
        <Panel>
          <div className="widget-name">
            Distribution Progress
            <a href="/api/lumens" target="_blank" className="api-link">
              API
            </a>
          </div>
          {loading ? (
            "Loading..."
          ) : (
            <div>
              <PieChart width={chartWidth} height={chartHeight}>
                <Pie
                  data={programs}
                  label={renderCustomizedLabel}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                >
                  {programs.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <table className="mui-table small">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Amount Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(programs).map((key) => {
                    let row = programs[key];

                    return (
                      <tr key={key}>
                        <td>{row.name}</td>
                        <td className="amount-column">
                          {new BigNumber(row.value).toFormat(
                            0,
                            BigNumber.ROUND_HALF_UP,
                          )}{" "}
                          XLM
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="small gray margin-top10">
                Learn more about{" "}
                <a
                  href="https://www.stellar.org/foundation/programs"
                  target="_blank"
                >
                  Lumen distribution
                </a>
                .
              </div>
            </div>
          )}
        </Panel>
      </div>
    );
  }
}
