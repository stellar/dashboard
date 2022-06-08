import request from "supertest";
import { redisClient } from "../src/redisSetup";
import { app, updateLumensCache } from "../src/routes";

describe("integration", () => {
  beforeAll(async () => {
    await updateLumensCache();
  }, 50000);

  afterAll((done) => {
    redisClient.flushAll();
    done();
  });

  describe("backend api endpoints", () => {
    it("/api/lumens should return successfuly with data", async () => {
      const { body } = await request(app).get("/api/lumens").expect(200);

      expect(body).toEqual(expect.any(Object));
      expect(Object.keys(body).length).not.toEqual(0);
    });

    it("/api/v2/lumens should return successfuly with data", async () => {
      const { body } = await request(app).get("/api/v2/lumens").expect(200);

      expect(body).toEqual(expect.any(Object));
      expect(Object.keys(body).length).not.toEqual(0);
    });

    it("/api/v2/lumens/total-supply should return successfuly with data", async () => {
      const { body } = await request(app)
        .get("/api/v2/lumens/total-supply")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).not.toEqual(0);
    });

    it("/api/v2/lumens/circulating-supply should return successfuly with data", async () => {
      const { body } = await request(app)
        .get("/api/v2/lumens/circulating-supply")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).not.toEqual(0);
    });

    it("/api/v3/lumens should return successfuly with data", async () => {
      const { body } = await request(app).get("/api/v3/lumens").expect(200);

      expect(body).toEqual(expect.any(Object));
      expect(Object.keys(body).length).not.toEqual(0);
    });

    it("/api/v3/lumens/all should return successfuly with data", async () => {
      const { body } = await request(app).get("/api/v3/lumens/all").expect(200);

      expect(body).toEqual(expect.any(Object));
      expect(Object.keys(body).length).not.toEqual(0);
    });

    it("/api/v3/lumens/total-supply should return successfuly with data", async () => {
      const { body } = await request(app)
        .get("/api/v3/lumens/total-supply")
        .expect(200);

      expect(body).toEqual(expect.any(String));
      expect(body).not.toEqual("");
    });

    it("/api/v3/lumens/circulating-supply should return successfuly with data", async () => {
      const { body } = await request(app)
        .get("/api/v3/lumens/circulating-supply")
        .expect(200);

      expect(body).toEqual(expect.any(String));
      expect(body).not.toEqual("");
    });

    it("/api/dex/active-accounts should return a positive integer", async () => {
      await redisClient.set(
        "dex-activeAccounts",
        JSON.stringify([{ data: 46017 }]),
      );
      const { body } = await request(app)
        .get("/api/dex/active-accounts")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).toBeGreaterThan(0);

      await redisClient.del("dex-activeAccounts");
    });

    it("/api/dex/unique-assets should return a positive integer", async () => {
      await redisClient.set(
        "dex-uniqueAssets",
        JSON.stringify([{ data: 120786 }]),
      );
      const { body } = await request(app)
        .get("/api/dex/unique-assets")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).toBeGreaterThan(0);

      await redisClient.del("dex-uniqueAssets");
    });

    it("/api/dex/24h-trades should return an object", async () => {
      await redisClient.set(
        "dex-trades24h",
        JSON.stringify([{ data: 1646134 }]),
      );
      await redisClient.set(
        "dex-trades48h",
        JSON.stringify([{ data: 798172 }]),
      );
      await redisClient.set(
        "dex-trades-overall",
        JSON.stringify([{ data: 211592437 }]),
      );
      const { body } = await request(app)
        .get("/api/dex/24h-trades")
        .expect(200);

      expect(body).toEqual(expect.any(Object));
      expect(body).toMatchObject({
        change: expect.any(Number),
        overall: expect.any(Number),
        trades_last_24h: expect.any(Number),
      });

      await redisClient.del("dex-trades24h");
      await redisClient.del("dex-trades48h");
      await redisClient.del("dex-trades-overall");
    });

    it("/api/dex/24h-payments should return an object", async () => {
      await redisClient.set("payments24h", JSON.stringify([{ data: 1543902 }]));
      const { body } = await request(app)
        .get("/api/dex/24h-payments")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).toBeGreaterThan(0);

      await redisClient.del("payments24h");
    });
  });
});
