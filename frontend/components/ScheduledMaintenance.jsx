import React from "react";
import moment from "moment";
import sanitizeHtml from "../utilities/sanitizeHtml.js";

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

  return (
    <div key={id} className="banner warning">
      Scheduled maintenance:{" "}
      <a href={"https://status.stellar.org/incidents/" + id}>{name}</a>
      <div className="banner-meta">
        {moment(scheduled_for).utc().format("dddd, MMMM Do YYYY, [at] h:mma")}{" "}
        UTC (
        {moment(scheduled_for).format(
          moment(scheduled_for).utc().format("dddd") ===
            moment(scheduled_for).format("dddd")
            ? "h:mma"
            : "MMMM Do YYYY, h:mma",
        )}{" "}
        local time)
      </div>
      {updates.length > 0 ? <div>{sanitizeHtml(updates[0].body)}</div> : null}
    </div>
  );
};
