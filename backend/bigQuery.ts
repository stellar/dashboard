import { BigQuery } from "@google-cloud/bigquery";

const options = {
  keyFilename: "service-account.json",
  projectId: "hubble-261722",
};

export const bqClient = new BigQuery(options);

export function getLast30DaysQuery() {
  const today = new Date();
  const before = new Date(today.setDate(today.getDate() - 32));
  const bqDate = `${before.getFullYear()}-${
    before.getUTCMonth() + 1
  }-${before.getUTCDate()}`;
  return `SELECT * FROM \`hubble-261722.crypto_stellar_internal_2.history_ledgers\` WHERE closed_at >= "${bqDate}" ORDER BY sequence LIMIT 1;`;
}

export interface BQHistoryLedger {
  sequence: number;
  ledger_hash: string;
  previous_ledger_hash: string;
  transaction_count: number;
  operation_count: number;
  closed_at: Date;
  id: number;
  total_coins: number;
  fee_pool: number;
  base_fee: number;
  base_reserve: number;
  max_tx_set_size: number;
  protocol_version: number;
  ledger_header: string;
  successful_transaction_count: number;
  failed_transaction_count: number;
  tx_set_operation_count: number;
  batch_id: string;
  batch_run_date: Date;
  batch_insert_ts: Date;
}
