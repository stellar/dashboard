export const getLedgerClosedTimes = (times: string[]): number[] => {
  const size = times.length;

  if (size === 0) {
    return [];
  }

  return times.map((t, idx) => {
    if (idx === size - 1) {
      return 0;
    }

    const date1 = new Date(t).getTime();
    const date2 = new Date(times[idx + 1]).getTime();
    const diff = (date1 - date2) / 1000;

    return diff;
  });
};
