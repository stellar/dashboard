import { sanitizeHtml } from "frontend/helpers/sanitizeHtml";
import { AnnouncementMessage, IncidentMessage } from "types";

export const getIncidentMessages = (
  messages: AnnouncementMessage[],
): IncidentMessage[] => {
  if (messages.length === 0) {
    return [];
  }

  return messages.map((m) => ({
    id: m.id,
    name: m.name,
    startedAt: m.started_at,
    lastUpdatedAt:
      m.incident_updates.length > 0 ? m.incident_updates[0].created_at : null,
    affected: m.components.map((c) => c.name).join(", "),
    details:
      m.incident_updates.length > 0
        ? sanitizeHtml(m.incident_updates[0].body)
        : null,
  }));
};
