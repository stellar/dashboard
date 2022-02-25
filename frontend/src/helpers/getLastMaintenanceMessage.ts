import { sanitizeHtml } from "helpers/sanitizeHtml";
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
      new Date(a.scheduled_for) <= new Date(b.scheduled_for) ? 1 : -1,
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
