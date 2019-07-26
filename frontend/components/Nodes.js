import React from "react";
import Panel from "muicss/lib/react/panel";
import Button from "muicss/lib/react/button";
import Node from "./Node";
import axios from "axios";
import commonNodes from "../../common/nodes.js";
import sortBy from "lodash/sortBy";
import shuffle from "lodash/shuffle";

const ORDER_RANDOM = "random";
const ORDER_ALPHABETICAL = "alphabetical";

const NODES_PER_PAGE = 15;

export default class Nodes extends React.Component {
  constructor(props) {
    super(props);
    // Persist the random order so it's the same after switching
    // the order in the UI.
    this.shuffledList = shuffle(commonNodes);
    this.alphabeticalList = sortBy(commonNodes, ["name"]);

    this.state = {
      page: 1,
      order: ORDER_RANDOM,
      list: this.shuffledList,
      uptimeData: {},
    };
  }

  componentDidMount() {
    this.getUptimeData();
    setInterval(() => this.getUptimeData(), 60 * 1000);
  }

  getUptimeData() {
    axios.get("/api/nodes").then((response) => {
      this.setState({ uptimeData: response.data });
    });
  }

  setOrder(order) {
    this.setState({ order, page: 1 });
  }

  movePage(p) {
    this.setState({ page: this.state.page + p });
  }

  render() {
    let list;

    if (this.state.order == ORDER_ALPHABETICAL) {
      list = this.alphabeticalList;
    } else {
      list = this.shuffledList;
    }

    list = list.slice(
      (this.state.page - 1) * NODES_PER_PAGE,
      this.state.page * NODES_PER_PAGE,
    );

    return (
      <div>
        <div className="mui-col-md-12">
          <div className="mui--pull-left">
            <Button
              variant="flat"
              size="small"
              color="primary"
              disabled={this.state.order == ORDER_RANDOM}
              onClick={this.setOrder.bind(this, ORDER_RANDOM)}
            >
              <i className="material-icons mui--visible-xs-inline">shuffle</i>
              <span className="mui--hidden-xs">Random order</span>
            </Button>
            <Button
              variant="flat"
              size="small"
              color="primary"
              disabled={this.state.order == ORDER_ALPHABETICAL}
              onClick={this.setOrder.bind(this, ORDER_ALPHABETICAL)}
            >
              <i className="material-icons mui--visible-xs-inline">
                sort_by_alpha
              </i>
              <span className="mui--hidden-xs">Alphabetical order</span>
            </Button>
          </div>
          <div className="mui--pull-right">
            {this.state.page > 1 ? (
              <Button
                variant="flat"
                size="small"
                color="primary"
                onClick={this.movePage.bind(this, -1)}
              >
                &laquo; Prev
                <span className="mui--hidden-sm mui--hidden-xs"> page</span>
              </Button>
            ) : null}
            {this.state.page < commonNodes.length / NODES_PER_PAGE ? (
              <Button
                variant="flat"
                size="small"
                color="primary"
                onClick={this.movePage.bind(this, 1)}
              >
                Next<span className="mui--hidden-sm mui--hidden-xs"> page</span>{" "}
                &raquo;
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mui--clearfix"></div>
        <div className="mui-col-md-12">
          {Object.values(list).map((node) => (
            <Node
              key={node.id}
              data={node}
              uptime={this.state.uptimeData[node.id]}
            />
          ))}
        </div>
      </div>
    );
  }
}
