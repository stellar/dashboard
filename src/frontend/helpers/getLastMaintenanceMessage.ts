import moment from "moment";
import { sanitizeHtml } from "frontend/helpers/sanitizeHtml";
import { AnnouncementMessage, MaintenanceMessage } from "types";

export const getLastMaintenanceMessage = (
  messages: AnnouncementMessage[],
): MaintenanceMessage | null => {
  if (messages.length === 0) {
    return null;
  }

  const sortedMessages = messages
    .slice()
    .sort((a, b) =>
      moment(a.scheduled_for).isSameOrBefore(b.scheduled_for) ? 1 : -1,
    );

  const {
    id,
    name,
    incident_updates: incidentUpdates,
    scheduled_for: scheduledFor,
  } = sortedMessages[0];

  return {
    id,
    name,
    details:
      incidentUpdates.length > 0 ? sanitizeHtml(incidentUpdates[0].body) : null,
    scheduledFor,
  };
};
