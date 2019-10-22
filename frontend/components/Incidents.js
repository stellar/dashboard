import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import moment from "moment";

export default class Incidents extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  getIncidents() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    axios
      .get("https://9sl3dhr1twv1.statuspage.io/api/v2/incidents.json?limit=10")
      .then((response) => {
        this.setState({ loading: false, incidents: response.data.incidents });
        this.loading = false;
      });
  }

  componentDidMount() {
    this.getIncidents();
    this.timerID = setInterval(() => this.getIncidents(), 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    return (
      <Panel>
        <div className="widget-name">Incidents</div>
        {this.state.loading ? (
          <span>Loading...</span>
        ) : (
          <ul className="incidents">
            {this.state.incidents.map((m) => {
              return (
                <li key={m.id}>
                  <a
                    href={"https://status.stellar.org/incidents/" + m.id}
                  >
                    {m.name}
                  </a>{" "}
                  ({moment(m.started_at).fromNow()})
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    );
  }
}
