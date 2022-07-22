import BigNumber from "bignumber.js";

export function formatBigNumbers(number: string) {
  const bigNumber = new BigNumber(number).toFormat(2);
  return bigNumber.replace(",", "");
}
