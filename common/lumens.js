// This file contains functions used both in backend and frontend code.
// Will be helpful to build distribution stats API.
import axios from "axios";
import BigNumber from "bignumber.js";
import map from "lodash/map";
import reduce from "lodash/reduce";
import find from "lodash/find";

const horizonLiveURL = "https://horizon.stellar.org";

const voidAccount = "GALAXYVOIDAOPZTDLHILAJQKCVVFMD4IKLXLSZV5YHO7VY74IWZILUTO";
const networkUpgradeReserveAccount =
  "GBEZOC5U4TVH7ZY5N3FLYHTCZSI6VFGTULG7PBITLF5ZEBPJXFT46YZM";
const accounts = {
  escrowJan2021: "GBA6XT7YBQOERXT656T74LYUVJ6MEIOC5EUETGAQNHQHEPUFPKCW5GYM",
  escrowJan2022: "GD2D6JG6D3V52ZMPIYSVHYFKVNIMXGYVLYJQ3HYHG5YDPGJ3DCRGPLTP",
  escrowJan2023: "GA2VRL65L3ZFEDDJ357RGI3MAOKPJZ2Z3IJTPSC24I4KDTNFSVEQURRA",
  developerSupportHot:
    "GCKJZ2YVECFGLUDJ5T7NZMJPPWERBNYHCXT2MZPXKELFHUSYQR5TVHJQ",
  directDevelopment: "GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ",
  // directDevelopmentHot1:
  //   "GCEZYB47RSSSR6RMHQDTBWL4L6RY5CY2SPJU3QHP3YPB6ALPVRLPN7OQ",
  directDevelopmentHot2:
    "GATL3ETTZ3XDGFXX2ELPIKCZL7S5D2HY3VK4T7LRPD6DW5JOLAEZSZBA",
  // directDevelopmentHot3:
  //   "GCVLWV5B3L3YE6DSCCMHLCK7QIB365NYOLQLW3ZKHI5XINNMRLJ6YHVX",
  infrastructureGrants:
    "GCVJDBALC2RQFLD2HYGQGWNFZBCOD2CPOTN3LE7FWRZ44H2WRAVZLFCU",
  currencySupport: "GAMGGUQKKJ637ILVDOSCT5X7HYSZDUPGXSUW67B2UKMG2HEN5TPWN3LQ",
  enterpriseFund: "GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4",
  newProducts: "GCPWKVQNLDPD4RNP5CAXME4BEDTKSSYRR4MMEL4KG65NEGCOGNJW7QI2",
  inAppDistribution: "GDKIJJIKXLOM2NRMPNQZUUYK24ZPVFC6426GZAEP3KUK6KEJLACCWNMX",
  inAppDistributionHot:
    "GAX3BRBNB5WTJ2GNEFFH7A4CZKT2FORYABDDBZR5FIIT3P7FLS2EFOZZ",
  marketingSupport: "GBEVKAYIPWC5AQT6D4N7FC3XGKRRBMPCAMTO3QZWMHHACLHTMAHAM2TP",
};

export const ORIGINAL_SUPPLY_AMOUNT = "100000000000";

export function getLumenBalance(horizonURL, accountId) {
  return axios.get(`${horizonURL}/accounts/${accountId}`).then((response) => {
    var xlmBalance = find(
      response.data.balances,
      (b) => b.asset_type == "native",
    );
    return xlmBalance.balance;
  });
}

function sumRelevantAccounts(accounts) {
  return Promise.all(
    accounts.map((acct) => getLumenBalance(horizonLiveURL, acct)),
  ).then((data) =>
    data
      .reduce(
        (sum, currentBalance) => new BigNumber(currentBalance).add(sum),
        new BigNumber(0),
      )
      .toString(),
  );
}

export function totalLumens(horizonURL) {
  return axios
    .get(`${horizonURL}/ledgers/?order=desc&limit=1`)
    .then((response) => {
      return response.data._embedded.records[0].total_coins;
    });
}

export function inflationLumens() {
  return Promise.all([
    totalLumens(horizonLiveURL),
    ORIGINAL_SUPPLY_AMOUNT,
  ]).then((result) => {
    let [totalLumens, originalSupply] = result;
    return new BigNumber(totalLumens).minus(originalSupply);
  });
}

export function feePool() {
  return axios
    .get(`${horizonLiveURL}/ledgers/?order=desc&limit=1`)
    .then((response) => {
      return response.data._embedded.records[0].fee_pool;
    });
}

export function burnedLumens() {
  return axios
    .get(`${horizonLiveURL}/accounts/${voidAccount}`)
    .then((response) => {
      var xlmBalance = find(
        response.data.balances,
        (b) => b.asset_type == "native",
      );
      return xlmBalance.balance;
    });
}

export function directDevelopmentAll() {
  const {
    directDevelopment,
    // directDevelopmentHot1,
    directDevelopmentHot2,
    // directDevelopmentHot3,
  } = accounts;
  return sumRelevantAccounts([
    directDevelopment,
    // directDevelopmentHot1,
    directDevelopmentHot2,
    // directDevelopmentHot3,
  ]);
}

export function distributionEcosystemSupport() {
  const { infrastructureGrants, currencySupport } = accounts;
  return sumRelevantAccounts([infrastructureGrants, currencySupport]);
}

export function distributionUseCaseInvestment() {
  const { enterpriseFund, newProducts } = accounts;
  return sumRelevantAccounts([enterpriseFund, newProducts]);
}

export function distributionUserAcquisition() {
  const {
    inAppDistribution,
    inAppDistributionHot,
    marketingSupport,
  } = accounts;

  return sumRelevantAccounts([
    inAppDistribution,
    inAppDistributionHot,
    marketingSupport,
  ]);
}

export function getUpgradeReserve() {
  return getLumenBalance(horizonLiveURL, networkUpgradeReserveAccount);
}

export function sdfAccounts() {
  var balanceMap = map(accounts, (id) => getLumenBalance(horizonLiveURL, id));
  return Promise.all(balanceMap).then((balances) => {
    return reduce(
      balances,
      (sum, balance) => sum.add(balance),
      new BigNumber(0),
    );
  });
}

export function totalSupply() {
  return Promise.all([inflationLumens(), burnedLumens()]).then((result) => {
    let [inflationLumens, burnedLumens] = result;

    return new BigNumber(ORIGINAL_SUPPLY_AMOUNT)
      .plus(inflationLumens)
      .minus(burnedLumens);
  });
}

export function noncirculatingSupply() {
  return Promise.all([getUpgradeReserve(), feePool(), sdfAccounts()]).then(
    (balances) => {
      return reduce(
        balances,
        (sum, balance) => sum.add(balance),
        new BigNumber(0),
      );
    },
  );
}

export function circulatingSupply() {
  return Promise.all([totalSupply(), noncirculatingSupply()]).then((result) => {
    let [totalLumens, noncirculatingSupply] = result;

    return new BigNumber(totalLumens).minus(noncirculatingSupply);
  });
}
