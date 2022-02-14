import moment from "moment";

export const getAverageLedgerClosedTime = (times: string[]) => {
  const size = times.length;

  if (size === 0) {
    return 0;
  }

  const sum = times.reduce((total: number, time: string, idx: number) => {
    if (idx === size - 1) {
      return total;
    }

    const date1 = moment(time);
    const date2 = moment(times[idx + 1]);
    const diff = date1.diff(date2) / 1000;

    return total + diff;
  }, 0);

  return sum / size;
};
