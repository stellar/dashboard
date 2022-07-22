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
  transactions: TransactionsInitialState;
  operations: OperationsInitialState;
  feeStats: FeeStatsInitialState;
}

export type StoreKey = keyof Store;

export interface LedgersInitialState {
  lastLedgerRecords: LedgerItem[];
  protocolVersion: number | null;
  ledgerClosedTimes: string[];
  ledgerTransactionsHistory: {
    items: LedgerTransactionHistoryItem[];
    average: {
      txTransactionSuccess: number;
      txTransactionError: number;
      opCount: number;
      closeTimeAvg: number;
    };
  };
  averageClosedTime: number | null;
  isStreaming: boolean;
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface TransactionsInitialState {
  transactionsHistory: {
    items: TransactionHistoryItem[];
  };
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface OperationsInitialState {
  lastOperations: FetchLastOperationsActionResponse[];
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface FeeStatsInitialState {
  data: FeeStatsData | null;
  fees: AverageTransactionFeeData | null;
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

export type LedgerTransactionHistoryItem = {
  date: Date;
  txTransactionCount: number;
  opCount: number;
  sequence: number;
};

export enum LedgerTransactionHistoryFilterType {
  "30D" = "30D",
  "24H" = "24H",
  "1H" = "1H",
}

export type TransactionHistoryItem = {
  durationInSeconds: number;
  date: string;
  txOperationCount: number;
};

export interface FetchTransactionsHistoryActionResponse {
  items: TransactionHistoryItem[];
}

export interface OperationsResponse {
  records: {
    id: string;
    paging_token: string;
    transaction_successful: boolean;
    source_account: string;
    type: string;
    type_i: number;
    created_at: string;
    transaction_hash: string;
    amount: string;
    price: string;
    price_r: {
      n: number;
      d: number;
    };
    buying_asset_type: string;
    buying_asset_issuer: string;
    buying_asset_code: string;
    selling_asset_type: string;
    selling_asset_code: string;
    selling_asset_issuer: string;
    offer_id: string;
    to: string;
    from: string;
    asset_type: string;
    asset_code: string;
    asset_issuer: string;
    source_asset_type: string;
    source_asset_issuer: string;
    source_asset_code: string;
    trustor: string;
    source_max?: string;
    starting_balance?: string;
    authorize?: string;
    into?: string;
    name?: string;
    shares_received?: string;
    shares?: string;
  }[];
}

export interface FetchLastOperationsActionResponse {
  id: string;
  type: string;
  source_account: string;
  amount: number;
  offer_id: number;
  buying_asset_type: string;
  buying_asset_issuer: string;
  buying_asset_code: string;
  selling_asset_type: string;
  selling_asset_code: string;
  selling_asset_issuer: string;
  to: string;
  asset_type: string;
  asset_code: string;
  asset_issuer: string;
  source_asset_type: string;
  source_asset_issuer: string;
  source_asset_code: string;
  trustor: string;
  timeAgo: number;
  source_max?: string;
  starting_balance?: string;
  liquidity_pool_id?: string;
  authorize?: string;
  into?: string;
  name?: string;
  shares_received?: string;
  shares?: string;
}

export interface FeesResponse {
  date: string;
  primaryValue: string;
}

export interface FeeStatsData {
  last_ledger: number;
  last_ledger_base_fee: number;
  ledger_capacity_usage: number;
  fee_charged: {
    max: number;
    min: number;
    mode: number;
    p10: number;
    p20: number;
    p30: number;
    p40: number;
    p50: number;
    p60: number;
    p70: number;
    p80: number;
    p90: number;
    p95: number;
    p99: number;
  };
  max_fee: {
    max: number;
    min: number;
    mode: number;
    p10: number;
    p20: number;
    p30: number;
    p40: number;
    p50: number;
    p60: number;
    p70: number;
    p80: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface AverageTransactionFeeData {
  month: FeesResponse[];
  day: FeesResponse[];
}
