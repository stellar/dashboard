import * as commonLumens from "../common/lumens.js";
import {redisClient} from './redis.js';

const REDIS_KEY = 'api_lumens';

export const handler = function(req, res) {
  redisClient.get(REDIS_KEY, function(err, data) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    data = JSON.parse(data);
    res.send(data);
  });
}

function updateApiLumens() {
  Promise.all([
    commonLumens.totalCoins("https://horizon.stellar.org"),
    commonLumens.availableCoins(),
    commonLumens.distributionAll(),
    commonLumens.distributionDirectSignup(),
    commonLumens.distributionBitcoinProgram(),
    commonLumens.distributionPartnershipProgram(),
    commonLumens.distributionBuildChallenge(),
  ]).then(function(data) {
    var response = {
      updatedAt: new Date(),
      totalCoins: data[0],
      availableCoins: data[1],
      distributedCoins: data[2],
      programs: {
        directProgram: data[3],
        bitcoinProgram: data[4],
        partnershipProgram: data[5],
        buildChallenge: data[6]
      }
    };

    redisClient.set(REDIS_KEY, JSON.stringify(response), function(err, data) {
      if (err) {
        console.error(err);
        return;
      }

      console.log("/api/lumens data saved!");
    });
  })
  .catch(function(err) {
    console.error(err);
    res.sendStatus(500);
  });
}

setInterval(updateApiLumens, 10*60*1000);
updateApiLumens();
