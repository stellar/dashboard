import request from "supertest";
import { app, updateLumensCache } from "../src/routes";

describe("integration", () => {
  beforeAll(async () => {
    await updateLumensCache();
  }, 50000);

  afterAll((done) => {
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
      const { body } = await request(app)
        .get("/api/dex/active-accounts")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).toBeGreaterThan(0);
    });

    it("/api/dex/unique-assets should return a positive integer", async () => {
      const { body } = await request(app)
        .get("/api/dex/unique-assets")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).toBeGreaterThan(0);
    });

    it("/api/dex/24h-trades should return an object", async () => {
      const { body } = await request(app)
        .get("/api/dex/24h-trades")
        .expect(200);

      expect(body).toEqual(expect.any(Object));
      expect(body).toMatchObject({
        change: expect.any(String),
        overall: expect.any(Number),
        trades_last_24h: expect.any(Number),
      });
    });

    it("/api/dex/24h-payments should return an object", async () => {
      const { body } = await request(app)
        .get("/api/dex/24h-payments")
        .expect(200);

      expect(body).toEqual(expect.any(Number));
      expect(body).toBeGreaterThan(0);
    });
  });
});
