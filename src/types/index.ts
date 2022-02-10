export type MaintenanceMessage = {
  id: string;
  name: string;
  details: string | React.ReactNode | null;
  scheduledFor: string;
};

export type IncidentMessage = {
  id: string;
  name: string;
  startedAt: string;
  lastUpdatedAt: string | null;
  affected: string;
  details: string | React.ReactNode | null;
};

export type IncidentUpdate = {
  [key: string]: any;
  body: string;
};

export type IncidentComponent = {
  [key: string]: any;
  name: string;
};

export type AnnouncementMessage = {
  [key: string]: any;
  id: string;
  name: string;
  components: IncidentComponent[];
  /* eslint-disable camelcase */
  incident_updates: IncidentUpdate[];
  scheduled_for: string;
  /* eslint-enable camelcase */
};

export type IncidentItem = {
  [key: string]: any;
  id: string;
  name: string;
  // eslint-disable-next-line camelcase
  started_at: string;
};

export type Incident = {
  id: string;
  name: string;
  startedAt: string;
};
