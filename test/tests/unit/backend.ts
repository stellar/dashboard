import chai from "chai";
import { redisClient } from "../../../backend/redis";
const v1 = require("../../../backend/lumens");
const v2v3 = require("../../../backend/v2v3/lumens");

describe("lumens v1", function () {
  this.timeout(10000);
  describe("updateApiLumens", function () {
    it("should run without error and caches should update", async function () {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      let cached = await redisClient.get("lumensV1");
      chai.expect(cached).to.not.be.null;
      let obj = JSON.parse(cached as string);

      chai
        .expect(obj)
        .to.be.an("object")
        .that.has.all.keys([
          "updatedAt",
          "totalCoins",
          "availableCoins",
          "programs",
        ]);
      chai
        .expect(obj.programs)
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

describe("lumens v2", function () {
  this.timeout(10000);
  describe("updateApiLumens", function () {
    it("should run without error and caches should update", async function () {
      let err = await v2v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      let cached = await redisClient.get("lumensV2");
      chai.expect(cached).to.not.be.null;
      let obj = JSON.parse(cached as string);

      chai
        .expect(obj)
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
      for (var k in obj) {
        chai.expect(obj[k].toString()).to.not.be.empty;
      }
    });
  });
});

describe("lumens v3", function () {
  this.timeout(10000);
  describe("updateApiLumens", function () {
    it("should run without error and caches should update", async function () {
      let err = await v2v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");

      let cached = await redisClient.get("lumensV3");
      chai.expect(cached).to.not.be.null;
      let obj = JSON.parse(cached as string);

      chai
        .expect(obj)
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
      for (var k in obj) {
        chai.expect(obj[k].toString()).to.not.be.empty;
      }

      cached = await redisClient.get("totalSupplyCheckResponse");
      chai.expect(cached).to.not.be.null;
      obj = JSON.parse(cached as string);

      chai
        .expect(obj)
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
      for (var k in obj) {
        chai.expect(obj[k].toString()).to.not.be.empty;
      }
    });
  });
});
