// This file contains functions used both in backend and frontend code.
// Will be helpful to build distribution stats API.
import axios from "axios";
import BigNumber from "bignumber.js";
import map from "lodash/map.js";
import reduce from "lodash/reduce.js";
import find from "lodash/find.js";

const horizonLiveURL = "https://horizon.stellar.org";

const voidAccount = "GALAXYVOIDAOPZTDLHILAJQKCVVFMD4IKLXLSZV5YHO7VY74IWZILUTO";
const networkUpgradeReserveAccount =
  "GBEZOC5U4TVH7ZY5N3FLYHTCZSI6VFGTULG7PBITLF5ZEBPJXFT46YZM";
const accounts = {
  // escrowJan2021: "GBA6XT7YBQOERXT656T74LYUVJ6MEIOC5EUETGAQNHQHEPUFPKCW5GYM",
  escrowJan2022: "GD2D6JG6D3V52ZMPIYSVHYFKVNIMXGYVLYJQ3HYHG5YDPGJ3DCRGPLTP",
  escrowJan2023: "GA2VRL65L3ZFEDDJ357RGI3MAOKPJZ2Z3IJTPSC24I4KDTNFSVEQURRA",
  // Direct Development accounts
  directDevelopment: "GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ",
  directDevelopmentHot2:
    "GATL3ETTZ3XDGFXX2ELPIKCZL7S5D2HY3VK4T7LRPD6DW5JOLAEZSZBA",
  directDevelopmentHot4:
    "GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH",
  directDevelopmentHot5:
    "GAPV2C4BTHXPL2IVYDXJ5PUU7Q3LAXU7OAQDP7KVYHLCNM2JTAJNOQQI",
  // Growth accounts (formerly Use Case Investment)
  sdfGrowth: "GCVJDBALC2RQFLD2HYGQGWNFZBCOD2CPOTN3LE7FWRZ44H2WRAVZLFCU",
  sdfGrowthHot: "GC3ITNZSVVPOWZ5BU7S64XKNI5VPTRSBEXXLS67V4K6LEUETWBMTE7IH",
  sdfGrowthHot2: "GBEVKAYIPWC5AQT6D4N7FC3XGKRRBMPCAMTO3QZWMHHACLHTMAHAM2TP",
  sdfGrowthHot3: "GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4",
  // Product and Innovation accounts (formerly Ecosystem Support)
  sdfProductAndInnovation:
    "GCPWKVQNLDPD4RNP5CAXME4BEDTKSSYRR4MMEL4KG65NEGCOGNJW7QI2",
  sdfProductAndInnovationHot:
    "GDKIJJIKXLOM2NRMPNQZUUYK24ZPVFC6426GZAEP3KUK6KEJLACCWNMX",
  sdfProductAndInnovationHot2:
    "GDWXQOTIIDO2EUK4DIGIBLEHLME2IAJRNU6JDFS5B2ZTND65P7J36WQZ",
  // Assets and Liquidity accounts (formerly User Acquisition)
  sdfAssetsAndLiquidity:
    "GAMGGUQKKJ637ILVDOSCT5X7HYSZDUPGXSUW67B2UKMG2HEN5TPWN3LQ",
  sdfAssetsAndLiquidityHot:
    "GANII5Y2LABEBK74NWNKS4NREX2T52YTBGQDRDKVBFRIIF5VE4ORYOVY",
};

export const ORIGINAL_SUPPLY_AMOUNT = "100000000000";

export async function getLumenBalance(horizonURL, accountId) {
  try {
    const response = await axios.get(`${horizonURL}/accounts/${accountId}`);
    const xlmBalance = find(
      response.data.balances,
      (b) => b.asset_type === "native",
    );
    return xlmBalance.balance;
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 404 || error.response.status === 400)
    ) {
      console.warn(
        `Account ${accountId} not found or invalid (${error.response.status}), treating as 0 balance`,
      );
      return "0.0"; // consider the balance of an account zero if the account does not exist, has been deleted, or is invalid
    } else {
      console.error(`Error fetching balance for account ${accountId}:`, error);
      throw error; // something else happened, and at this point we shouldn't trust the computed balance
    }
  }
}

async function sumRelevantAccounts(accountList) {
  const balances = await Promise.all(
    accountList.map((acct) => getLumenBalance(horizonLiveURL, acct)),
  );
  return balances
    .reduce(
      (sum, currentBalance) => new BigNumber(currentBalance).plus(sum),
      new BigNumber(0),
    )
    .toString();
}

export async function totalLumens(horizonURL) {
  const response = await axios.get(`${horizonURL}/ledgers/?order=desc&limit=1`);
  return response.data._embedded.records[0].total_coins;
}

export async function inflationLumens() {
  const [totalLumensValue, originalSupply] = await Promise.all([
    totalLumens(horizonLiveURL),
    ORIGINAL_SUPPLY_AMOUNT,
  ]);
  return new BigNumber(totalLumensValue).minus(originalSupply);
}

export async function feePool() {
  const response = await axios.get(
    `${horizonLiveURL}/ledgers/?order=desc&limit=1`,
  );
  return response.data._embedded.records[0].fee_pool;
}

export async function burnedLumens() {
  const response = await axios.get(`${horizonLiveURL}/accounts/${voidAccount}`);
  const xlmBalance = find(
    response.data.balances,
    (b) => b.asset_type === "native",
  );
  return xlmBalance.balance;
}

export async function directDevelopmentAll() {
  const {
    directDevelopment,
    directDevelopmentHot2,
    directDevelopmentHot4,
    directDevelopmentHot5,
  } = accounts;
  return sumRelevantAccounts([
    directDevelopment,
    directDevelopmentHot2,
    directDevelopmentHot4,
    directDevelopmentHot5,
  ]);
}

export async function distributionProductAndInnovation() {
  const {
    sdfProductAndInnovation,
    sdfProductAndInnovationHot,
    sdfProductAndInnovationHot2,
  } = accounts;
  return sumRelevantAccounts([
    sdfProductAndInnovation,
    sdfProductAndInnovationHot,
    sdfProductAndInnovationHot2,
  ]);
}

export async function distributionGrowth() {
  const { sdfGrowth, sdfGrowthHot, sdfGrowthHot2, sdfGrowthHot3 } = accounts;
  return sumRelevantAccounts([
    sdfGrowth,
    sdfGrowthHot,
    sdfGrowthHot2,
    sdfGrowthHot3,
  ]);
}

export async function distributionAssetsAndLiquidity() {
  const { sdfAssetsAndLiquidity, sdfAssetsAndLiquidityHot } = accounts;

  return sumRelevantAccounts([
    sdfAssetsAndLiquidity,
    sdfAssetsAndLiquidityHot,
  ]);
}

export async function distributionAll() {
  const results = await Promise.all([
    distributionProductAndInnovation(),
    distributionGrowth(),
    distributionAssetsAndLiquidity(),
    directDevelopmentAll(),
  ]);
  return results.reduce(
    (sum, balance) => new BigNumber(sum).plus(balance),
    new BigNumber(0),
  );
}

export async function getUpgradeReserve() {
  return getLumenBalance(horizonLiveURL, networkUpgradeReserveAccount);
}

export async function sdfAccounts() {
  const balanceMap = map(accounts, (id) => getLumenBalance(horizonLiveURL, id));
  const balances = await Promise.all(balanceMap);
  return reduce(
    balances,
    (sum, balance) => sum.plus(balance),
    new BigNumber(0),
  );
}

export async function totalSupply() {
  const [inflationLumensValue, burnedLumensValue] = await Promise.all([
    inflationLumens(),
    burnedLumens(),
  ]);

  return new BigNumber(ORIGINAL_SUPPLY_AMOUNT)
    .plus(inflationLumensValue)
    .minus(burnedLumensValue);
}

export async function noncirculatingSupply() {
  const balances = await Promise.all([
    getUpgradeReserve(),
    feePool(),
    sdfAccounts(),
  ]);
  return reduce(
    balances,
    (sum, balance) => sum.plus(balance),
    new BigNumber(0),
  );
}

export async function circulatingSupply() {
  const [totalLumensValue, noncirculatingSupplyValue] = await Promise.all([
    totalSupply(),
    noncirculatingSupply(),
  ]);

  return new BigNumber(totalLumensValue).minus(noncirculatingSupplyValue);
}
