import { getDateDiffSeconds } from "frontend/helpers/getDateDiffSeconds";

export const getLedgerClosedTimes = (times: string[]): number[] => {
  const size = times.length;

  if (size === 0) {
    return [];
  }

  return times.map((t, idx) => {
    if (idx === size - 1) {
      return 0;
    }

    return getDateDiffSeconds(t, times[idx + 1]);
  });
};
