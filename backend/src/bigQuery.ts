import { BigQuery } from "@google-cloud/bigquery";

let options;
if (process.env.DEV) {
  options = {
    keyFilename: "gcloud/service-account.json",
    projectId: process.env.BQ_PROJECT_ID,
  };
} else {
  options = {
    keyFilename: "../../../gcloud/service-account.json",
    projectId: "hubble-261722",
  };
}

export const bqClient = new BigQuery(options);

// TODO - drop the _2 when Hubble 2.0 is live
const BQHistoryLedgersTable = "crypto-stellar.crypto_stellar_2.history_ledgers";

export function getBqQueryByDate(date: string) {
  console.log("DEBUG - QUERY DATES - DATE NOW: ", new Date());
  return `SELECT id FROM \`${BQHistoryLedgersTable}\` WHERE closed_at >= "${date}" ORDER BY sequence LIMIT 1;`;
}

export interface BQHistoryLedger {
  /* eslint-disable camelcase */
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
  /* eslint-enable camelcase */
}
