import chai from "chai";
import { redisClient } from "../../../backend/redis";
import { updateCache } from "../../../backend/ledgers";
const v1 = require("../../../backend/lumens");
const v2v3 = require("../../../backend/v2v3/lumens");

// 10s timeout added for the multiple calls to Horizon per test, which occasionally
// surpasses the default 2s timeout causing an error.

describe("lumens v1", function () {
  this.timeout(10000);
  describe("updateApiLumens", function () {
    it("should run without error and caches should update", async function () {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      let cached = await redisClient.get("lumensV1");
      chai.expect(cached).to.not.be.null;
      let obj = JSON.parse(cached as string);

      chai
        .expect(obj)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "totalCoins",
          "availableCoins",
          "programs",
        ]);
      chai
        .expect(obj.programs)
        .to.be.an("object")
        .that.has.all.keys([
          "directDevelopment",
          "ecosystemSupport",
          "useCaseInvestment",
          "userAcquisition",
        ]);
    });
  });
});

describe("lumens v2", function () {
  this.timeout(10000);
  describe("updateApiLumens", function () {
    it("should run without error and caches should update", async function () {
      let err = await v2v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      let cached = await redisClient.get("lumensV2");
      chai.expect(cached).to.not.be.null;
      let obj = JSON.parse(cached as string);

      chai
        .expect(obj)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "originalSupply",
          "inflationLumens",
          "burnedLumens",
          "totalSupply",
          "upgradeReserve",
          "feePool",
          "sdfMandate",
          "circulatingSupply",
          "_details",
        ]);
      for (var k in obj) {
        chai.expect(obj[k].toString()).to.not.be.empty;
      }
    });
  });
});

describe("lumens v3", function () {
  this.timeout(10000);
  describe("updateApiLumens", function () {
    it("should run without error and caches should update", async function () {
      let err = await v2v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      let cached = await redisClient.get("lumensV3");
      chai.expect(cached).to.not.be.null;
      let obj = JSON.parse(cached as string);

      chai
        .expect(obj)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "originalSupply",
          "inflationLumens",
          "burnedLumens",
          "totalSupply",
          "upgradeReserve",
          "feePool",
          "sdfMandate",
          "circulatingSupply",
          "_details",
        ]);
      for (var k in obj) {
        chai.expect(obj[k].toString()).to.not.be.empty;
      }

      cached = await redisClient.get("totalSupplyCheckResponse");
      chai.expect(cached).to.not.be.null;
      obj = JSON.parse(cached as string);

      chai
        .expect(obj)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "totalSupply",
          "inflationLumens",
          "burnedLumens",
          "totalSupplySum",
          "upgradeReserve",
          "feePool",
          "sdfMandate",
          "circulatingSupply",
        ]);
      for (var k in obj) {
        chai.expect(obj[k].toString()).to.not.be.empty;
      }
    });
  });
});

describe("ledgers", function () {
  describe("updateCache", function () {
    it("should store cache correctly", async function () {
      const ledgersKey = "ledgers_test";
      const pagingTokenKey = "paging_token_test";

      // cleanup
      await redisClient.del(ledgersKey);
      await redisClient.del(pagingTokenKey);

      const ledgers: any = [
        {
          paging_token: "101",
          sequence: 10001,
          successful_transaction_count: 10,
          failed_transaction_count: 5,
          operation_count: 50,
          closed_at: "2022-01-11T01:06:00Z",
        },
        {
          paging_token: "102",
          sequence: 10002,
          successful_transaction_count: 20,
          failed_transaction_count: 10,
          operation_count: 100,
          closed_at: "2022-01-12T01:06:00Z",
        },
        {
          paging_token: "103",
          sequence: 10003,
          successful_transaction_count: 30,
          failed_transaction_count: 20,
          operation_count: 200,
          closed_at: "2022-01-12T01:07:00Z",
        },
      ];

      await updateCache(ledgers, ledgersKey, "now", pagingTokenKey);

      let cachedLedgers = await redisClient.get(ledgersKey);
      let cachedPagingToken = await redisClient.get(pagingTokenKey);

      chai.expect(JSON.parse(cachedLedgers as string)).to.eql([
        {
          date: "01-11",
          transaction_count: 15,
          operation_count: 50,
        },
        {
          date: "01-12",
          transaction_count: 80,
          operation_count: 300,
        },
      ]);
      chai.assert.equal(JSON.parse(cachedPagingToken as string), "103");
    });
  });
});

// describe("ledgers", function () {
//   describe("catchupLedgers", function () {
//     it("should update redis without error", function () {
//       catchupLedgers("now");
//     });
//   });
// });
