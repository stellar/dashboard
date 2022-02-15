import { getLedgerClosedTimes } from "frontend/helpers/getLedgerClosedTimes";

export const getAverageLedgerClosedTime = (times: string[]) => {
  const size = times.length;

  if (size === 0) {
    return 0;
  }

  const closedTimes = getLedgerClosedTimes(times);
  const sum = closedTimes.reduce((total, time) => total + time, 0);

  return sum / size;
};
