import chai from "chai";
const v1 = require("../../backend/lumens.js");
const v2v3 = require("../../backend/v2v3/lumens.js");

describe("lumens v1", function() {
  describe("updateApiLumens", function() {
    it("should run without error and caches should update", async function() {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      chai
        .expect(v1.cachedData)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "totalCoins",
          "availableCoins",
          "programs",
        ]);
      chai
        .expect(v1.cachedData.programs)
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
      let err = await v2v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      chai
        .expect(v2v3.lumensDataV2)
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
      for (var k in v2v3.lumensDataV2) {
        chai.expect(v2v3.lumensDataV2[k].toString()).to.not.be.empty;
      }
    });
  });
});

describe("lumens v3", function() {
  describe("updateApiLumens", function() {
    it("should run without error and caches should update", async function() {
      let err = await v2v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      chai
        .expect(v2v3.lumensDataV3)
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
      for (var k in v2v3.lumensDataV3) {
        chai.expect(v2v3.lumensDataV3[k].toString()).to.not.be.empty;
      }

      chai
        .expect(v2v3.totalSupplyCheckResponse)
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
      for (var k in v2v3.totalSupplyCheckResponse) {
        chai.expect(v2v3.totalSupplyCheckResponse[k].toString()).to.not.be
          .empty;
      }
    });
  });
});
