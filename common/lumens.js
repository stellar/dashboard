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
  // escrowJan2021: "GBA6XT7YBQOERXT656T74LYUVJ6MEIOC5EUETGAQNHQHEPUFPKCW5GYM",
  escrowJan2022: "GD2D6JG6D3V52ZMPIYSVHYFKVNIMXGYVLYJQ3HYHG5YDPGJ3DCRGPLTP",
  escrowJan2023: "GA2VRL65L3ZFEDDJ357RGI3MAOKPJZ2Z3IJTPSC24I4KDTNFSVEQURRA",
  developerSupportHot:
    "GCKJZ2YVECFGLUDJ5T7NZMJPPWERBNYHCXT2MZPXKELFHUSYQR5TVHJQ",
  developerSupportHot2:
    "GC3ITNZSVVPOWZ5BU7S64XKNI5VPTRSBEXXLS67V4K6LEUETWBMTE7IH",
  directDevelopment: "GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ",
  // directDevelopmentHot1:
  //   "GCEZYB47RSSSR6RMHQDTBWL4L6RY5CY2SPJU3QHP3YPB6ALPVRLPN7OQ",
  directDevelopmentHot2:
    "GATL3ETTZ3XDGFXX2ELPIKCZL7S5D2HY3VK4T7LRPD6DW5JOLAEZSZBA",
  // directDevelopmentHot3:
  //   "GCVLWV5B3L3YE6DSCCMHLCK7QIB365NYOLQLW3ZKHI5XINNMRLJ6YHVX",
  directDevelopmentHot4:
    "GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH",
  directDevelopmentHot5:
    "GAPV2C4BTHXPL2IVYDXJ5PUU7Q3LAXU7OAQDP7KVYHLCNM2JTAJNOQQI",
  infrastructureGrants:
    "GCVJDBALC2RQFLD2HYGQGWNFZBCOD2CPOTN3LE7FWRZ44H2WRAVZLFCU",
  currencySupport: "GAMGGUQKKJ637ILVDOSCT5X7HYSZDUPGXSUW67B2UKMG2HEN5TPWN3LQ",
  currencySupportHot:
    "GANII5Y2LABEBK74NWNKS4NREX2T52YTBGQDRDKVBFRIIF5VE4ORYOVY",
  enterpriseFund: "GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4",
  newProducts: "GCPWKVQNLDPD4RNP5CAXME4BEDTKSSYRR4MMEL4KG65NEGCOGNJW7QI2",
  inAppDistribution: "GDKIJJIKXLOM2NRMPNQZUUYK24ZPVFC6426GZAEP3KUK6KEJLACCWNMX",
  inAppDistributionHot:
    "GAX3BRBNB5WTJ2GNEFFH7A4CZKT2FORYABDDBZR5FIIT3P7FLS2EFOZZ",
  inAppDistributionHot2:
    "GDWXQOTIIDO2EUK4DIGIBLEHLME2IAJRNU6JDFS5B2ZTND65P7J36WQZ",
  marketingSupport: "GBEVKAYIPWC5AQT6D4N7FC3XGKRRBMPCAMTO3QZWMHHACLHTMAHAM2TP",
  marketingSupportHot:
    "GBI5PADO5TEDY3R6WFAO2HEKBTTZS4LGR77XM4AHGN52H45ENBWGDFOH",
};

export const ORIGINAL_SUPPLY_AMOUNT = "100000000000";

export function getLumenBalance(horizonURL, accountId) {
  return axios
    .get(`${horizonURL}/accounts/${accountId}`)
    .then((response) => {
      var xlmBalance = find(
        response.data.balances,
        (b) => b.asset_type == "native",
      );
      return xlmBalance.balance;
    })
    .catch((error) => {
      if (error.response && error.response.status == 404) {
        return "0.0"; // consider the balance of an account zero if the account does not exist or has been deleted from the network
      } else throw error; // something else happened, and at this point we shouldn't trust the computed balance
    });
}

function sumRelevantAccounts(accounts) {
  return Promise.all(
    accounts.map((acct) => getLumenBalance(horizonLiveURL, acct)),
  ).then((data) =>
    data
      .reduce(
        (sum, currentBalance) => new BigNumber(currentBalance).plus(sum),
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
    directDevelopmentHot4,
    directDevelopmentHot5,
  } = accounts;
  return sumRelevantAccounts([
    directDevelopment,
    // directDevelopmentHot1,
    directDevelopmentHot2,
    // directDevelopmentHot3,
    directDevelopmentHot4,
    directDevelopmentHot5,
  ]);
}

export function distributionEcosystemSupport() {
  const {
    infrastructureGrants,
    currencySupport,
    currencySupportHot,
    developerSupportHot,
    developerSupportHot2,
  } = accounts;
  return sumRelevantAccounts([
    infrastructureGrants,
    currencySupport,
    currencySupportHot,
    developerSupportHot,
    developerSupportHot2,
  ]);
}

export function distributionUseCaseInvestment() {
  const { enterpriseFund, newProducts } = accounts;
  return sumRelevantAccounts([enterpriseFund, newProducts]);
}

export function distributionUserAcquisition() {
  const {
    inAppDistribution,
    inAppDistributionHot,
    inAppDistributionHot2,
    marketingSupport,
    marketingSupportHot,
  } = accounts;

  return sumRelevantAccounts([
    inAppDistribution,
    inAppDistributionHot,
    inAppDistributionHot2,
    marketingSupport,
    marketingSupportHot,
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
      (sum, balance) => sum.plus(balance),
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
        (sum, balance) => sum.plus(balance),
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
