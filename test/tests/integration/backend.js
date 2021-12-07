import chai from "chai";
const request = require("supertest");

const { app, updateLumensCache } = require("../../../backend/app.js");
describe("integration", function() {
  // update caches
  before(async function() {
    await updateLumensCache();
  });

  describe("backend api endpoints", function() {
    it("should return data of correct type", async function() {
      let testCases = [
        {
          url: "/api/lumens",
          wantResultType: "object",
        },
        {
          url: "/api/v2/lumens",
          wantResultType: "object",
        },
        {
          url: "/api/v2/lumens/total-supply",
          wantResultType: "number",
        },
        {
          url: "/api/v2/lumens/circulating-supply",
          wantResultType: "number",
        },
        { url: "/api/v3/lumens", wantResultType: "object" },
        { url: "/api/v3/lumens/all", wantResultType: "object" },
        {
          url: "/api/v3/lumens/total-supply",
          wantResultType: "string",
        },
        {
          url: "/api/v3/lumens/circulating-supply",
          wantResultType: "string",
        },
      ];

      for (var tc of testCases) {
        console.log("testing: ", tc.url);
        let { body } = await request(app)
          .get(tc.url)
          .expect(200);

        chai.expect(body).to.be.an(tc.wantResultType);
        chai.expect(containsData(body)).to.be.true;
      }
    });
  });
});

const containsData = function(data) {
  switch (typeof data) {
    case "object":
      return Object.keys(data).length > 0;
    case "array":
      return data.length > 0;
    case "string":
      return data.length > 0;
    case "number":
      return data != 0;
    case "undefined":
      return false;
    case "null":
      return false;
  }
};
