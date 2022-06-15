export interface LedgerStat {
  date: string;
  transaction_count: number;
  operation_count: number;
  sequence: number;
}

export enum INTERVALS {
  hour = "hour",
  day = "day",
  month = "month",
}

export const dateSorter = (a: LedgerStat, b: LedgerStat) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  if (dateA.getMonth() === 11) {
    dateA.setFullYear(dateA.getFullYear() - 1);
  }
  if (dateB.getMonth() === 11) {
    dateB.setFullYear(dateB.getFullYear() - 1);
  }

  return dateB.getTime() - dateA.getTime();
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
