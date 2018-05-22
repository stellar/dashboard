import React from 'react';
import Panel from 'muicss/lib/react/panel';
import Node from './Node';
import axios from 'axios';
import list from '../../common/nodes.js';

export default class Nodes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {uptimeData: {}};
  }

  componentDidMount() {
    this.getUptimeData();
    setInterval(() => this.getUptimeData(), 60*1000);
  }

  getUptimeData() {
    axios.get('/api/nodes')
      .then(response => {
        this.setState({uptimeData: response.data});
      });
  }

  render() {
    return (
      <div className="mui-col-md-12">
        {
          Object.values(list).map(node => <Node key={node.id} data={node} uptime={this.state.uptimeData[node.id]} />)
        }
      </div>
    );
  }
}
