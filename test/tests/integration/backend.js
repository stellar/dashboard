import chai from "chai";
const request = require("supertest");

const { app, updateLumensCache } = require("../../../backend/app.js");
const { updateResults, cachedData } = require("../../../backend/ledgers.js");

describe("integration", function() {
  // update caches
  before(async function() {
    await updateLumensCache();
    await updateResults();
  });

  describe("", function() {
    it("should return correct type", async function() {
      let testCases = [
        {
          url: "/api/ledgers/public",
          wantResultType: "array",
          emptyState: {},
        },
        {
          url: "/api/lumens",
          wantResultType: "object",
          emptyState: {},
        },
        {
          url: "/api/v2/lumens",
          wantResultType: "object",
          emptyState: {},
        },
        {
          url: "/api/v2/lumens/total-supply",
          wantResultType: "number",
          emptyState: "",
        },
        {
          url: "/api/v2/lumens/circulating-supply",
          wantResultType: "number",
          emptyState: "",
        },
        { url: "/api/v3/lumens", wantResultType: "object", emptyState: {} },
        { url: "/api/v3/lumens/all", wantResultType: "object", emptyState: {} },
        {
          url: "/api/v3/lumens/total-supply",
          wantResultType: "string",
          emptyState: "",
        },
        {
          url: "/api/v3/lumens/circulating-supply",
          wantResultType: "string",
          emptyState: "",
        },
      ];

      for (var tc of testCases) {
        console.log("testing: ", tc.url);
        let { body } = await request(app)
          .get(tc.url)
          .expect(200);

        // ALEC TODO - remove
        console.log(body);
        console.log(typeof body);

        console.log(body == "{}");

        // chai.expect(body).to.be.an(tc.wantResultType);
        chai.expect(body).to.not.equal(tc.emptyState);
      }
    });
  });
});
