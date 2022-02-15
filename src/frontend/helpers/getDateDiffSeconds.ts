export const getDateDiffSeconds = (date1: string, date2: string) => {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return (d1 - d2) / 1000;
};
