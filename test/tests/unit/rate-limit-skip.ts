import chai from "chai";
import request from "supertest";
import express from "express";
import { isLumensV1Request } from "../../../backend/routes";

const createApp = () => {
  const app = express();
  app.all("*", (req, res) => {
    const start = process.hrtime.bigint();
    const skip = isLumensV1Request(req);
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    res.set("X-Skip", String(skip)).json({ skip, ms });
  });
  return app;
};

describe("Rate limit skip for /api/lumens", function () {
  describe("isLumensV1Request", function () {
    it("🟢should_skip_GET_api_lumens", async function () {
      const response = await request(createApp()).get("/api/lumens");
      chai.expect(response.body.skip).to.be.true;
    });

    it("🟢should_skip_HEAD_api_lumens", async function () {
      // HEAD responses have no body
      const response = await request(createApp()).head("/api/lumens");
      chai.expect(response.headers["x-skip"]).to.equal("true");
    });

    it("🟢should_skip_mixed_case_and_trailing_slashes", async function () {
      const response = await request(createApp()).get("/API/Lumens//");
      chai.expect(response.body.skip).to.be.true;
    });

    it("🔴should_not_skip_other_paths", async function () {
      for (const path of ["/api/lumens/x", "/api/v2/lumens", "/api", "/"]) {
        const response = await request(createApp()).get(path);
        chai.expect(response.body.skip, path).to.be.false;
      }
    });

    it("🔴should_not_skip_POST_api_lumens", async function () {
      const response = await request(createApp()).post("/api/lumens");
      chai.expect(response.body.skip).to.be.false;
    });

    it("🔴should_run_in_linear_time_on_long_slash_runs", async function () {
      const path = "/api" + "/".repeat(15996) + "a";
      const response = await request(createApp()).get(path);
      chai.expect(response.body.skip).to.be.false;
      chai.expect(response.body.ms).to.be.below(20);
    });
  });
});
