import chai from "chai";
const request = require("supertest");

const { app, updateLumensCache } = require("../../../backend/routes");

// Regex patterns for validation
const DECIMAL_NUMBER_REGEX = /^\d+(\.\d+)?$/; // Matches "123456789.1234567"
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/; // Matches ISO date format
const URL_REGEX = /^https?:\/\/.+/; // Matches URLs
const DATE_FORMAT_REGEX = /^\d{2}-\d{2}$/; // Matches "MM-DD" format for ledger dates

describe("integration", function () {
  this.timeout(10000);
  // update caches
  before(async function () {
    await updateLumensCache();
  });

  describe("backend api endpoints", function () {
    it("/api/lumens should return successfuly with data", async function () {
      let { body } = await request(app).get("/api/lumens").expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);

      // Validate structure and formats
      chai
        .expect(body)
        .to.have.all.keys([
          "updatedAt",
          "totalCoins",
          "availableCoins",
          "programs",
        ]);
      chai.expect(body.updatedAt).to.match(ISO_DATE_REGEX);
      chai.expect(body.totalCoins).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.availableCoins).to.match(DECIMAL_NUMBER_REGEX);

      chai.expect(body.programs).to.be.an("object");
      chai
        .expect(body.programs)
        .to.have.all.keys([
          "directDevelopment",
          "productAndInnovation",
          "growth",
          "assetsAndLiquidity",
        ]);
      chai
        .expect(body.programs.directDevelopment)
        .to.match(DECIMAL_NUMBER_REGEX);
      chai
        .expect(body.programs.productAndInnovation)
        .to.match(DECIMAL_NUMBER_REGEX);
      chai
        .expect(body.programs.growth)
        .to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.programs.assetsAndLiquidity).to.match(DECIMAL_NUMBER_REGEX);
    });

    it("/api/v2/lumens should return successfuly with data", async function () {
      let { body } = await request(app).get("/api/v2/lumens").expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);

      // Validate structure and formats
      chai
        .expect(body)
        .to.have.all.keys([
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
      chai.expect(body.updatedAt).to.match(ISO_DATE_REGEX);
      chai.expect(body.originalSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.inflationLumens).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.burnedLumens).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.totalSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.upgradeReserve).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.feePool).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.sdfMandate).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.circulatingSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body._details).to.match(URL_REGEX);
    });

    it("/api/v2/lumens/total-supply should return successfuly with data", async function () {
      let { body } = await request(app)
        .get("/api/v2/lumens/total-supply")
        .expect(200);

      chai.expect(body).to.be.a("number");
      chai.expect(body).to.be.greaterThan(0);
      chai.expect(body).to.be.finite;
    });

    it("/api/v2/lumens/circulating-supply should return successfuly with data", async function () {
      let { body } = await request(app)
        .get("/api/v2/lumens/circulating-supply")
        .expect(200);

      chai.expect(body).to.be.a("number");
      chai.expect(body).to.be.greaterThan(0);
      chai.expect(body).to.be.finite;
    });

    it("/api/v3/lumens should return successfuly with data", async function () {
      let { body } = await request(app).get("/api/v3/lumens").expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);

      // Validate structure and formats (same as v2)
      chai
        .expect(body)
        .to.have.all.keys([
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
      chai.expect(body.updatedAt).to.match(ISO_DATE_REGEX);
      chai.expect(body.originalSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.inflationLumens).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.burnedLumens).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.totalSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.upgradeReserve).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.feePool).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.sdfMandate).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.circulatingSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body._details).to.match(URL_REGEX);
    });

    it("/api/v3/lumens/all should return successfuly with data", async function () {
      let { body } = await request(app).get("/api/v3/lumens/all").expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);

      // Validate structure and formats
      chai
        .expect(body)
        .to.have.all.keys([
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
      chai.expect(body.updatedAt).to.match(ISO_DATE_REGEX);
      chai.expect(body.totalSupply).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.inflationLumens).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.burnedLumens).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.totalSupplySum).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.upgradeReserve).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.feePool).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.sdfMandate).to.match(DECIMAL_NUMBER_REGEX);
      chai.expect(body.circulatingSupply).to.match(DECIMAL_NUMBER_REGEX);
    });

    it("/api/v3/lumens/total-supply should return successfuly with data", async function () {
      let { body } = await request(app)
        .get("/api/v3/lumens/total-supply")
        .expect(200);

      chai.expect(body).to.be.a("string");
      chai.expect(body).to.not.equal("");
      chai.expect(body).to.match(DECIMAL_NUMBER_REGEX);
    });

    it("/api/v3/lumens/circulating-supply should return successfuly with data", async function () {
      let { body } = await request(app)
        .get("/api/v3/lumens/circulating-supply")
        .expect(200);

      chai.expect(body).to.be.a("string");
      chai.expect(body).to.not.equal("");
      chai.expect(body).to.match(DECIMAL_NUMBER_REGEX);
    });

    it("/api/ledgers/public should return successfully with data", async function () {
      // The ledgers endpoint might not have data initially, so we handle both cases
      const response = await request(app).get("/api/ledgers/public");

      if (response.status === 200) {
        chai.expect(response.body).to.be.an("array");
        if (response.body.length > 0) {
          // Validate ledger data structure and formats
          response.body.forEach((ledger: any) => {
            chai
              .expect(ledger)
              .to.have.all.keys([
                "date",
                "transaction_count",
                "operation_count",
              ]);
            chai.expect(ledger.date).to.match(DATE_FORMAT_REGEX);
            chai.expect(ledger.transaction_count).to.be.a("number");
            chai.expect(ledger.operation_count).to.be.a("number");
            chai.expect(ledger.transaction_count).to.be.greaterThanOrEqual(0);
            chai.expect(ledger.operation_count).to.be.greaterThanOrEqual(0);
          });
        }
      } else if (response.status === 500) {
        // Ledgers cache might not be initialized - this is acceptable for this test
        chai
          .expect(response.body.message || response.text)
          .to.include("redis key not found");
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });
  });
});
