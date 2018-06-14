// This file contains functions used both in backend and frontend code.
// Will be helpful to build distribution stats API.
import axios from "axios";
import BigNumber from "bignumber.js";
import map from "lodash/map";
import reduce from "lodash/reduce";
import find from "lodash/find";

const horizonLiveURL = "https://horizon.stellar.org";

const accounts = {
  worldGiveaway:       "GDKIJJIKXLOM2NRMPNQZUUYK24ZPVFC6426GZAEP3KUK6KEJLACCWNMX",
  partnerships:        "GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4",
  btcGiveawayCold:     "GDTNE54IWDB3UQLMIUSBKIDTMUW7FNKBU4VB2GVW4OL65BZN7W5VRNVY",
  invitesHot:          "GAX3BRBNB5WTJ2GNEFFH7A4CZKT2FORYABDDBZR5FIIT3P7FLS2EFOZZ",
  sdfOperationalFunds: "GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ",
  vestingPool:         "GANOI26P6VAUL4NFVA4FAIOIBOR46NORONBIWUPRIGAMP7T5W5MOY4O6",
  cashAccount:         "GAYOCVRRNXGQWREOZBDP4UEW475NKZKLA4EIEIBKBSJN2PQQWUQ5KGUH",
  inflationDest:       "GDWNY2POLGK65VVKIH5KQSH7VWLKRTQ5M6ADLJAYC2UEHEBEARCZJWWI",
}

export function getLumenBalance(horizonURL, accountId) {
  return axios.get(`${horizonURL}/accounts/${accountId}`)
    .then(response => {
      var xlmBalance = find(response.data.balances, b => b.asset_type == 'native');
      return xlmBalance.balance;
    });
}

export function totalCoins(horizonURL) {
  return axios.get(`${horizonURL}/ledgers/?order=desc&limit=1`)
    .then(response => response.data._embedded.records[0].total_coins);
}

export function distributionAll() {
  return Promise.all([
    distributionDirectSignup(),
    distributionBitcoinProgram(),
    distributionPartnershipProgram(),
    distributionBuildChallenge()
  ]).then(balances => {
    var amount = reduce(balances, (sum, balance) => sum.add(balance), new BigNumber(0));
    return amount.toString();
  })
}

export function distributionDirectSignup() {
  return Promise.all([
    getLumenBalance(horizonLiveURL, accounts.worldGiveaway),
    getLumenBalance(horizonLiveURL, accounts.invitesHot),
  ]).then(balances => {
    var amount = new BigNumber(50*Math.pow(10, 9)); // 50B
    amount = amount.minus(balances[0]);
    amount = amount.minus(balances[1]);
    return amount.toString();
  })
}

export function distributionBitcoinProgram() {
  return "2037756769.6575473";
}

export function distributionBuildChallenge() {
  let sum = 49116333+30520000+7950000+62400000+5700000+2599000;
  return sum.toString();
}

export function distributionPartnershipProgram() {
  return getLumenBalance(horizonLiveURL, accounts.partnerships).then(balance => {
    var amount = new BigNumber(25*Math.pow(10, 9)); // 25B
    amount = amount.minus(balance);
    return amount.toString();
  })
}

export function sdfAccounts() {
  var balanceMap = map(accounts, id => getLumenBalance(horizonLiveURL, id));
  return Promise.all(balanceMap).then(balances => {
    return reduce(balances, (sum, balance) => sum.add(balance), new BigNumber(0));
  });
}

export function availableCoins() {
  return Promise.all([totalCoins(horizonLiveURL), sdfAccounts()])
    .then(result => {
      let [totalCoins, sdfAccounts] = result;
      return new BigNumber(totalCoins).minus(sdfAccounts);
    });
}

