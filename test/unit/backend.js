import chai from "chai";
const v1 = require("../../backend/lumens.js");
const v2 = require("../../backend/v2/lumens.js");
const v3 = require("../../backend/v3/lumens.js");

describe("lumens v1", function() {
  describe("updateApiLumens", function() {
    it("should run without error", async function() {
      let err = await v1.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");
    });
  });
});

describe("lumens v2", function() {
  describe("updateApiLumens", function() {
    it("should run without error", async function() {
      let err = await v2.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");
    });
  });
});

describe("lumens v3", function() {
  describe("updateApiLumens", function() {
    it("should run without error", async function() {
      let err = await v3.updateApiLumens();
      chai.assert.isUndefined(err, "there was no error");
    });
  });
});
