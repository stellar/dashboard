export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}

// Store
export interface Store {
  ledgers: LedgersInitialState;
  lumenSupply: LumenSupplyInitialState;
  networkNodes: NetworkNodesInitialState;
  dex: DexDataInitialState;
}

export type StoreKey = keyof Store;

export interface LedgersInitialState {
  lastLedgerRecords: LedgerItem[];
  protocolVersion: number | null;
  ledgerClosedTimes: string[];
  averageClosedTime: number | null;
  isStreaming: boolean;
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface NetworkNodesInitialState {
  data: NetworkNodesData | null;
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface LumenSupplyInitialState {
  data: LumenSupplyData | null;
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface DexDataInitialState {
  data: DexData | null;
  status: ActionStatus | undefined;
  errorString?: string;
}

export enum NetworkNodesType {
  WATCHER_NODES = "watcherNodes",
  VALIDATOR_NODES = "validatorNodes",
  FULL_VALIDATORS = "fullValidators",
  ORGANIZATIONS = "organizations",
  TOP_TIER_VALIDATORS = "topTierValidators",
  TOP_TIER_ORGANIZATIONS = "topTierOrganizations",
}

export interface NetworkNodeItemData {
  current: number;
  historyStats: {
    name: string;
    value: number;
  }[];
}

export interface NetworkNodesData {
  [NetworkNodesType.WATCHER_NODES]: NetworkNodeItemData;
  [NetworkNodesType.VALIDATOR_NODES]: NetworkNodeItemData;
  [NetworkNodesType.FULL_VALIDATORS]: NetworkNodeItemData;
  [NetworkNodesType.ORGANIZATIONS]: NetworkNodeItemData;
  [NetworkNodesType.TOP_TIER_VALIDATORS]: NetworkNodeItemData;
  [NetworkNodesType.TOP_TIER_ORGANIZATIONS]: NetworkNodeItemData;
}

export interface LumenSupplyData {
  circulating: string;
  nonCirculating: string;
  total: string;
}

export interface DexItemData {
  last24HR: number;
  overall: number;
  fluctuation: number;
}

export interface DexData {
  trades: DexItemData;
  volume: DexItemData;
  totalUniqueAssets: number;
  dailyActiveAccounts: number;
  payments24HRs: number;
}

export enum ActionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface RejectMessage {
  errorString: string;
}

// Announcements and incidents
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

export type LedgerRecord = {
  id: string;
  hash: string;
  sequence: number;
  /* eslint-disable camelcase */
  paging_token: string;
  prev_hash: string;
  successful_transaction_count: number;
  failed_transaction_count: number;
  operation_count: number;
  tx_set_operation_count: number;
  closed_at: string;
  total_coins: string;
  fee_pool: string;
  base_fee_in_stroops: number;
  base_reserve_in_stroops: number;
  max_tx_set_size: number;
  protocol_version: number;
  header_xdr: string;
  /* eslint-enable camelcase */
};

export type LedgerItem = {
  sequenceNumber: number;
  txCountSuccessful: number;
  txCountFailed: number;
  opCount: number;
  closedAt: string;
  protocolVersion: number;
  closedTime: number;
};
