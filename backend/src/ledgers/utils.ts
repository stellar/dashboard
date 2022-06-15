import { LedgerAverages } from "./data";

export interface LedgerStatData {
  transaction_count: number;
  operation_count: number;
  sequence: number;
}

export interface LedgerStat {
  date: string;
  data: LedgerStatData;
  averages: LedgerAverages;
}

export enum INTERVALS {
  hour = "hour",
  day = "day",
  month = "month",
}

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

const sumAverages = (ledgers: LedgerStat[]) => {
  let output = ledgers.reduce(
    (acc, next) => {
      const nextClosedTimesList = getLedgerClosedTimes(
        next.averages.closed_times_avg.sum,
      );
      const nextClosedTimesSum = nextClosedTimesList.reduce(
        (acc, next) => acc + next,
      );
      return {
        transaction_success_avg: {
          sum:
            acc.transaction_success_avg.sum +
            next.averages.transaction_success_avg.sum,
          size:
            acc.transaction_success_avg.size +
            next.averages.transaction_success_avg.size,
        },
        transaction_failure_avg: {
          sum:
            acc.transaction_failure_avg.sum +
            next.averages.transaction_failure_avg.sum,
          size:
            acc.transaction_failure_avg.size +
            next.averages.transaction_failure_avg.size,
        },
        operation_avg: {
          sum: acc.operation_avg.sum + next.averages.operation_avg.sum,
          size: acc.operation_avg.size + next.averages.operation_avg.size,
        },
        closed_times_avg: {
          sum: acc.closed_times_avg.sum + nextClosedTimesSum,
          size: acc.closed_times_avg.size + next.averages.closed_times_avg.size,
        },
      };
    },
    {
      transaction_success_avg: {
        sum: 0,
        size: 0,
      },
      transaction_failure_avg: {
        sum: 0,
        size: 0,
      },
      operation_avg: {
        sum: 0,
        size: 0,
      },
      closed_times_avg: {
        sum: 0,
        size: 0,
      },
    },
  );

  return output;
};

export const formatOutput = (cachedLedgers: LedgerStat[]) => {
  const average_sums = sumAverages(cachedLedgers);
  const average_values = {
    transaction_failure_avg:
      average_sums.transaction_failure_avg.sum /
      average_sums.transaction_failure_avg.size,
    operation_avg:
      average_sums.operation_avg.sum / average_sums.operation_avg.size,
    transaction_success_avg:
      average_sums.transaction_success_avg.sum /
      average_sums.transaction_success_avg.size,
    closed_times_avg: Math.abs(
      average_sums.closed_times_avg.sum / average_sums.closed_times_avg.size,
    ),
  };

  const output = { data: [] };

  cachedLedgers.forEach((ledger) => {
    output.data.push({
      date: ledger.date,
      ...ledger.data,
    });
  });

  return { ...output, ...average_values };
};

export const getLedgerClosedTimes = (times: number[]): number[] => {
  const size = times.length;

  if (size === 0) {
    return [];
  }

  const partial = times.map((t, idx) => {
    if (idx === size - 1) {
      return 0;
    }

    return getDateDiffSeconds(t, times[idx + 1]);
  });

  return partial.map((value) => Math.round(value));
};

export const getDateDiffSeconds = (time1: number, time2: number) => {
  return (time1 - time2) / 1000;
};
