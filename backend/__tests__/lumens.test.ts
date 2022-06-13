import { redisClient } from "../src/redisSetup";
import { updateCache, catchup, LedgerRecord, INTERVALS } from "../src/ledgers";
import { updateApiLumens as updateApiLumensV1 } from "../src/lumens";
import { updateApiLumens as updateApiLumensV2V3 } from "../src/v2v3/lumens";

const REDIS_LEDGER_KEY_TEST = "ledgers_test";
const REDIS_PAGING_TOKEN_KEY_TEST = "paging_token_test";

describe("lumens v1", () => {
  // 10s timeout added for the multiple calls to Horizon per test, which
  // occasionally surpasses the default 2s timeout causing an error.
  jest.setTimeout(50000);

  afterAll((done) => {
    done();
  });

  describe("updateApiLumens", () => {
    it("should run without error and caches should update", async () => {
      const err = await updateApiLumensV1();
      expect(err).toBeUndefined();

      const cached = await redisClient.get("lumensV1");
      expect(cached).not.toBe(null);

      const obj = JSON.parse(cached as string);
      expect(obj).toEqual(expect.any(Object));
      expect(Object.keys(obj)).toEqual(
        expect.arrayContaining([
          "updatedAt",
          "totalCoins",
          "availableCoins",
          "programs",
        ]),
      );

      const { programs } = obj;
      expect(programs).toEqual(expect.any(Object));
      expect(Object.keys(programs)).toEqual(
        expect.arrayContaining([
          "directDevelopment",
          "ecosystemSupport",
          "useCaseInvestment",
          "userAcquisition",
        ]),
      );
    });
  });
});

describe("lumens v2", () => {
  jest.setTimeout(50000);

  afterAll((done) => {
    done();
  });

  describe("updateApiLumens", () => {
    it("should run without error and caches should update", async () => {
      const err = await updateApiLumensV2V3();
      expect(err).toBeUndefined();

      const cached = await redisClient.get("lumensV2");
      expect(cached).not.toBe(null);

      const obj = JSON.parse(cached as string);
      expect(obj).toEqual(expect.any(Object));
      expect(Object.keys(obj)).toEqual(
        expect.arrayContaining([
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
        ]),
      );

      const objValues = Object.values(obj).filter((v) => !v);
      expect(objValues.length).toEqual(0);
    });
  });
});

describe("lumens v3", () => {
  jest.setTimeout(10000);

  afterAll((done) => {
    done();
  });

  describe("updateApiLumens", () => {
    it("should run without error and caches should update", async () => {
      const err = await updateApiLumensV2V3();
      expect(err).toBeUndefined();

      const cached = await redisClient.get("lumensV3");
      expect(cached).not.toBe(null);

      const obj = JSON.parse(cached as string);
      expect(obj).toEqual(expect.any(Object));
      expect(Object.keys(obj)).toEqual(
        expect.arrayContaining([
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
        ]),
      );

      const objValues = Object.values(obj).filter((v) => !v);
      expect(objValues.length).toEqual(0);

      const totalCached = await redisClient.get("totalSupplyCheckResponse");
      expect(totalCached).not.toBe(null);

      const totalObj = JSON.parse(totalCached as string);
      expect(totalObj).toEqual(expect.any(Object));
      expect(Object.keys(totalObj)).toEqual(
        expect.arrayContaining([
          "updatedAt",
          "totalSupply",
          "inflationLumens",
          "burnedLumens",
          "totalSupplySum",
          "upgradeReserve",
          "feePool",
          "sdfMandate",
          "circulatingSupply",
        ]),
      );

      const totalObjValues = Object.values(totalObj).filter((v) => !v);
      expect(totalObjValues.length).toEqual(0);
    });
  });
});

describe("ledgers", () => {
  afterAll((done) => {
    done();
  });

  describe("updateCache", () => {
    it("should store cache with correct data", async () => {
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
        INTERVALS.month,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      expect(JSON.parse(cachedLedgers as string)).toEqual([
        {
          date: "2022-1-12 00:00:00",
          transaction_count: 80,
          operation_count: 300,
          sequence: 10003,
        },
        {
          date: "2022-1-11 00:00:00",
          transaction_count: 15,
          operation_count: 50,
          sequence: 10001,
        },
      ]);
      expect(cachedPagingToken).toEqual("103");
    });
  });

  describe("catchup", () => {
    jest.setTimeout(50000);

    afterAll((done) => {
      done();
    });

    it("should handle large amounts of ledgers", async () => {
      // cleanup
      await redisClient.del(REDIS_LEDGER_KEY_TEST);
      await redisClient.del(REDIS_PAGING_TOKEN_KEY_TEST);

      await catchup(
        REDIS_LEDGER_KEY_TEST,
        "168143176454897664",
        REDIS_PAGING_TOKEN_KEY_TEST,
        1000,
        INTERVALS.month,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      expect(JSON.parse(cachedLedgers as string)).toEqual([
        {
          date: "2022-1-12 00:00:00",
          transaction_count: 403018,
          operation_count: 781390,
          sequence: 39149884,
        },
      ]);
      expect(cachedPagingToken).toEqual("168147471422193664");
    });

    it("should not update if caught up", async () => {
      await redisClient.set(REDIS_LEDGER_KEY_TEST, "[]");
      await redisClient.set(REDIS_PAGING_TOKEN_KEY_TEST, "10");

      await catchup(
        REDIS_LEDGER_KEY_TEST,
        "now",
        REDIS_PAGING_TOKEN_KEY_TEST,
        0,
        INTERVALS.month,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      expect(cachedLedgers).toEqual("[]");
      expect(cachedPagingToken).toEqual("10");
    });

    it("should only store last 30 days", async () => {
      // cleanup
      await redisClient.del(REDIS_LEDGER_KEY_TEST);
      await redisClient.del(REDIS_PAGING_TOKEN_KEY_TEST);

      const ledgers: LedgerRecord[] = [];

      for (let i = 1; i <= 31; i++) {
        const dayString = `0${i}`;

        ledgers.push(
          {
            paging_token: String(100 + 2 * i - 1),
            sequence: 1000 + 2 * i - 1,
            successful_transaction_count: 10 + i,
            failed_transaction_count: 5 + i,
            operation_count: 50 + i,
            closed_at: `2022-01-${dayString.slice(-2)}T01:06:00Z`,
          },
          {
            paging_token: String(101 + 2 * i),
            sequence: 1001 + 2 * i,
            successful_transaction_count: 10 + i,
            failed_transaction_count: 5 + i,
            operation_count: 50 + i,
            closed_at: `2022-01-${dayString.slice(-2)}T01:06:01Z`,
          },
        );
      }

      await updateCache(
        ledgers,
        REDIS_LEDGER_KEY_TEST,
        REDIS_PAGING_TOKEN_KEY_TEST,
        INTERVALS.month,
      );

      const cachedLedgers = await redisClient.get(REDIS_LEDGER_KEY_TEST);
      const cachedPagingToken = await redisClient.get(
        REDIS_PAGING_TOKEN_KEY_TEST,
      );

      expect(JSON.parse(cachedLedgers as string).length).toEqual(30);
      expect(JSON.parse(cachedLedgers as string)[0].date).toEqual(
        "2022-1-31 00:00:00",
      );
      expect(cachedPagingToken as string).toEqual("163");
    });
  });
});
