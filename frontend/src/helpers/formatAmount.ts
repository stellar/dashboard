import BigNumber from "bignumber.js";

const trimZeroes = (number: string) => {
  const [wholeNum, fraction] = number.split(".");

  if (fraction === "00") {
    return wholeNum;
  }

  return number;
};

export const formatAmount = (amount: string | number) => {
  const num = new BigNumber(amount);

  // billion
  const b = 1000000000;
  if (num.gte(b)) {
    return `${trimZeroes(num.div(b).toFormat(2))}B`;
  }

  // million
  const m = 1000000;
  if (num.gte(m)) {
    return `${trimZeroes(num.div(m).toFormat(2))}M`;
  }

  // thousand
  const k = 1000;
  if (num.gte(k)) {
    return `${trimZeroes(num.div(k).toFormat(2))}k`;
  }

  // smallest amount
  const min = 0.001;
  if (num.lt(min)) {
    return `<${min}`;
  }

  return `${num.toFormat(3)}`;
};
