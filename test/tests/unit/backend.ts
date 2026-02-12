import chai from "chai";
import { redisClient } from "../../../backend/redis";
import { updateCache, catchup, LedgerRecord } from "../../../backend/ledgers";
const v1 = require("../../../backend/lumens");
const v2v3 = require("../../../backend/v2v3/lumens");

const REDIS_LEDGER_KEY_TEST = "ledgers_test";
const REDIS_PAGING_TOKEN_KEY_TEST = "paging_token_test";

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
          "productAndInnovation",
          "growth",
          "assetsAndLiquidity",
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
    it("should store cache with correct data", async function () {
      // cleanup
      await redisClient.del(REDIS_LEDGER_KEY_TEST);
      await redisClient.del(REDIS_PAGING_TOKEN_KEY_TEST);

      const ledgers: LedgerRecord[] = [
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

      await updateCache(
        ledgers,
        REDIS_LEDGER_KEY_TEST,
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );
      chai.expect(JSON.parse(cachedLedgers as string)).to.eql([
        {
          date: "01-12",
          transaction_count: 80,
          operation_count: 300,
        },
        {
          date: "01-11",
          transaction_count: 15,
          operation_count: 50,
        },
      ]);
      chai.assert.equal(cachedPagingToken as string, "103");
    });
  });
  describe("catchup", function () {
    this.timeout(20000);
    it("should handle large amounts of ledgers", async function () {
      // cleanup
      await redisClient.del(REDIS_LEDGER_KEY_TEST);
      await redisClient.del(REDIS_PAGING_TOKEN_KEY_TEST);

      await catchup(
        REDIS_LEDGER_KEY_TEST,
        "168143176454897664",
        REDIS_PAGING_TOKEN_KEY_TEST,
        1000,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      // Verify that data was returned (flexible test since API returns current data)
      const ledgers = JSON.parse(cachedLedgers as string);
      chai.expect(ledgers).to.be.an("array");
      chai.expect(ledgers.length).to.be.greaterThan(0);
      chai
        .expect(ledgers[0])
        .to.have.all.keys(["date", "transaction_count", "operation_count"]);
      chai.expect(ledgers[0].transaction_count).to.be.a("number");
      chai.expect(ledgers[0].operation_count).to.be.a("number");
      chai.expect(cachedPagingToken).to.be.a("string");
    });
    it("should not update if caught up", async function () {
      await redisClient.set(REDIS_LEDGER_KEY_TEST, "[]");
      await redisClient.set(REDIS_PAGING_TOKEN_KEY_TEST, "10");

      await catchup(
        REDIS_LEDGER_KEY_TEST,
        "now",
        REDIS_PAGING_TOKEN_KEY_TEST,
        0,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );
      chai.assert.equal(cachedLedgers as string, "[]");
      chai.assert.equal(cachedPagingToken as string, "10");
    });
    it("should only store last 30 days", async function () {
      // cleanup
      await redisClient.del(REDIS_LEDGER_KEY_TEST);
      await redisClient.del(REDIS_PAGING_TOKEN_KEY_TEST);

      const ledgers: LedgerRecord[] = [];
      for (let i = 1; i <= 31; i++) {
        ledgers.push(
          {
            paging_token: String(100 + 2 * i - 1),
            sequence: 1000 + 2 * i - 1,
            successful_transaction_count: 10 + i,
            failed_transaction_count: 5 + i,
            operation_count: 50 + i,
            closed_at: `2022-01-${("0" + i).slice(-2)}T01:06:00Z`,
          },
          {
            paging_token: String(101 + 2 * i),
            sequence: 1001 + 2 * i,
            successful_transaction_count: 10 + i,
            failed_transaction_count: 5 + i,
            operation_count: 50 + i,
            closed_at: `2022-01-${("0" + i).slice(-2)}T01:06:01Z`,
          },
        );
      }
      await updateCache(
        ledgers,
        REDIS_LEDGER_KEY_TEST,
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);

      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );
      chai.assert.equal(JSON.parse(cachedLedgers as string).length, 30);
      chai.assert.equal(JSON.parse(cachedLedgers as string)[0].date, "01-31");
      chai.assert.equal(cachedPagingToken as string, "163");
    });
  });
});
