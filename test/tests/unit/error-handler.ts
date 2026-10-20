import chai from "chai";
import request from "supertest";
import express from "express";
import { errorHandler } from "../../../backend/routes";

const createApp = () => {
  const app = express();
  app.get("/throws", () => {
    throw new Error("redis key not found");
  });
  app.get("*", (_req, res) => {
    res.send("spa");
  });
  app.use(errorHandler);
  return app;
};

describe("Error handler", function () {
  it("🟢should_not_change_successful_responses", async function () {
    const response = await request(createApp()).get("/assets/ok").expect(200);
    chai.expect(response.text).to.equal("spa");
  });

  it("🔴should_return_400_without_stack_trace_for_malformed_path", async function () {
    const response = await request(createApp()).get("/assets/%c0").expect(400);
    chai.expect(response.text).to.equal("Bad Request");
  });

  it("🔴should_return_500_without_error_details_for_thrown_errors", async function () {
    const response = await request(createApp()).get("/throws").expect(500);
    chai.expect(response.text).to.equal("Internal Server Error");
  });
});
