import React from "react";
import axios from "axios";
import moment from "moment";
import Card from "./ui/Card.jsx";

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
      <Card title="Incidents" className="incidents-card">
        {this.state.loading ? (
          <div>
            <span className="skeleton"></span>
            <span className="skeleton" style={{ width: "80%" }}></span>
            <span className="skeleton" style={{ width: "90%" }}></span>
          </div>
        ) : (
          <ul className="incident-list">
            {this.state.incidents.map((m) => {
              return (
                <li key={m.id}>
                  <a
                    href={"https://status.stellar.org/incidents/" + m.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {m.name}
                  </a>
                  <span className="incident-time">
                    {moment(m.started_at).fromNow()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    );
  }
}
