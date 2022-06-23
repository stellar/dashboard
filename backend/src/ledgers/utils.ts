export interface LedgerStatData {
  transaction_success: number;
  transaction_failure: number;
  operation_count: number;
  sequence: number;
  total_ledgers: number;
  start: string;
  end: string;
}

export interface LedgerStat {
  date: string;
  data: LedgerStatData;
}

export enum INTERVALS {
  hour = "hour",
  day = "day",
  month = "month",
}

export const getServerNamespace = (text: string, isTestnet: boolean) =>
  isTestnet ? `${text}_testnet` : text;

export const getHorizonServer = (isTestnet) =>
  isTestnet
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";

export const dateSorter = (a: LedgerStat, b: LedgerStat) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};

export const getLedgerKey = {
  hour: (closed_at: Date) =>
    `${closed_at.getUTCFullYear()}-${
      closed_at.getUTCMonth() + 1
    }-${closed_at.getUTCDate()} ${closed_at.getUTCHours()}:${closed_at.getUTCMinutes()}:00`,
  day: (closed_at: Date) =>
    `${closed_at.getUTCFullYear()}-${
      closed_at.getUTCMonth() + 1
    }-${closed_at.getUTCDate()} ${closed_at.getUTCHours()}:00:00`,
  month: (closed_at: Date) =>
    `${closed_at.getUTCFullYear()}-${
      closed_at.getUTCMonth() + 1
    }-${closed_at.getUTCDate()} 00:00:00`,
};

const getBqDate = (interval: INTERVALS) => {
  const offsetByInterval = {
    hour: (now: Date = new Date()): Date =>
      new Date(now.setUTCHours(now.getUTCHours() - 1)),
    day: (now: Date = new Date()): Date =>
      new Date(now.setUTCDate(now.getUTCDate() - 1)),
    month: (now: Date = new Date()): Date =>
      new Date(now.setUTCMonth(now.getUTCMonth() - 1)),
  };
  const offset = offsetByInterval[interval]();
  return `${offset.getFullYear()}-${
    offset.getUTCMonth() + 1
  }-${offset.getUTCDate()} ${offset.getUTCHours()}:${offset.getUTCMinutes()}:${offset.getUTCSeconds()}`;
};

export const BIGQUERY_DATES = {
  hour: getBqDate(INTERVALS.hour),
  day: getBqDate(INTERVALS.day),
  month: getBqDate(INTERVALS.month),
};

export const formatOutput = (cachedLedgers: LedgerStat[]) => {
  const total_ledgers = cachedLedgers.reduce(
    (a, curr) => a + curr.data.total_ledgers,
    0,
  );
  const total_successful_tx = cachedLedgers.reduce(
    (a, curr) => a + curr.data.transaction_success,
    0,
  );

  const total_failed_tx = cachedLedgers.reduce(
    (a, curr) => a + curr.data.transaction_failure,
    0,
  );

  const total_ops = cachedLedgers.reduce(
    (a, curr) => a + curr.data.operation_count,
    0,
  );

  const first = new Date(cachedLedgers.at(-1).data.start).getTime();
  const last = new Date(cachedLedgers[0].data.end).getTime();
  const avg_close_time = (last - first) / total_ledgers / 1000;
  const avg_successful_tx_count = total_successful_tx / total_ledgers;
  const avg_failed_tx_count = total_failed_tx / total_ledgers;
  const avg_op_count = total_ops / total_ledgers;

  const output = { data: [] };
  cachedLedgers.forEach((ledger) => {
    output.data.push({
      date: ledger.date,
      ...ledger.data,
    });
  });

  return {
    ...output,
    avg_close_time,
    avg_successful_tx_count,
    avg_failed_tx_count,
    avg_op_count,
  };
};
