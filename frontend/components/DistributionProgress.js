import React from "react";
import Panel from "muicss/lib/react/panel";
import BigNumber from "bignumber.js";
import Cell from "recharts/lib/component/Cell";
import PieChart from "recharts/lib/chart/PieChart";
import Pie from "recharts/lib/polar/Pie";
import * as lumens from "../../common/lumens.js";

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
      lumens.directDevelopmentAll(),
      lumens.distributionEcosystemSupport(),
      lumens.distributionUseCaseInvestment(),
      lumens.distributionUserAcquisition(),
    ]).then((results) => {
      const [
        directDevelopment,
        ecosystemSupport,
        useCaseInvestment,
        userAcquisition,
      ] = results;

      const distributedColor = "#0C7EC2";

      // Programs - used in both a table below the pie chart and the pie chart
      programs.push({
        name: "Direct Development",
        value: parseInt(directDevelopment),
        p: directDevelopment,
        color: distributedColor,
      });
      programs.push({
        name: "Ecosystem Support",
        value: parseInt(ecosystemSupport),
        p: ecosystemSupport,
        color: distributedColor,
      });
      programs.push({
        name: "Use-Case Investment",
        value: parseInt(useCaseInvestment),
        p: useCaseInvestment,
        color: distributedColor,
      });
      programs.push({
        name: "User Acquisition",
        value: parseInt(userAcquisition),
        p: directDevelopment,
        color: distributedColor,
      });

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
    const { chartHeight, chartWidth, loading, programs } = this.state;
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
                    if (!row.p) {
                      return;
                    }
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
