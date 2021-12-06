import chai from "chai";
const v1 = require("../../backend/lumens.js");
const v2 = require("../../backend/v2/lumens.js");
const v3 = require("../../backend/v3/lumens.js");

describe("lumens v1", function() {
  describe("updateApiLumens", function() {
    it("should run without error and caches should update", async function() {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      chai
        .expect(v1.v1Cache)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "totalCoins",
          "availableCoins",
          "programs",
        ]);
      chai
        .expect(v1.v1Cache.programs)
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

describe("lumens v2", function() {
  describe("updateApiLumens", function() {
    it("should run without error and caches should update", async function() {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      chai
        .expect(v1.v2Cache)
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
    });
  });
});

describe("lumens v3", function() {
  describe("updateApiLumens", function() {
    it("should run without error and caches should update", async function() {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      chai
        .expect(v1.v3Cache)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "originalSupply",
          "inflationLumens",
          "burnedLumens",
          "totalSupplyCalculate",
          "upgradeReserve",
          "feePool",
          "sdfMandate",
          "circulatingSupplyCalculate",
          "_details",
        ]);

      chai
        .expect(v1.totalSupplyCheckResponse)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "totalSupplyCalculate",
          "inflationLumens",
          "burnedLumens",
          "totalSupplySum",
          "upgradeReserve",
          "feePool",
          "sdfMandate",
          "circulatingSupplyCalculate",
        ]);
    });
  });
});
