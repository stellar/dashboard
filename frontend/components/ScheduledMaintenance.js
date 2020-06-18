import React from "react";
import Panel from "muicss/lib/react/panel";
import moment from "moment";

export const ScheduledMaintenance = ({ scheduledMaintenances }) => {
  const sortedMaintenances = scheduledMaintenances
    .slice()
    .sort((a, b) => (moment(a).isSameOrBefore(b) ? 1 : -1));
  const {
    id,
    name,
    incident_updates: updates,
    scheduled_for,
  } = sortedMaintenances[0];
  const scheduledFor = moment(scheduled_for);

  return (
    <Panel key={id} className="mui--bg-accent-light">
      <div className="mui--text-subhead mui--text-light">
        Scheduled Maintenance:{" "}
        <a href={"https://status.stellar.org/incidents/" + id}>
          <strong>{name}</strong>
        </a>{" "}
        on{" "}
        {moment(scheduled_for)
          .utc()
          .format("dddd, MMMM Do YYYY, [at] h:mma")}{" "}
        UTC (
        {moment(scheduled_for).format(
          moment(scheduled_for)
            .utc()
            .format("dddd") === moment(scheduled_for).format("dddd")
            ? "h:mma"
            : "MMMM Do YYYY, h:mma",
        )}{" "}
        local time)
        <br />
        {updates.length > 0 ? (
          <span
            dangerouslySetInnerHTML={{
              __html: updates[0].body,
            }}
          />
        ) : null}
        <br />
      </div>
    </Panel>
  );
};
