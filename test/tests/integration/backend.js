import chai from "chai";
const request = require("supertest");

const { app, updateLumensCache } = require("../../../backend/routes.js");
describe("integration", function() {
  // update caches
  before(async function() {
    await updateLumensCache();
  });

  describe("backend api endpoints", function() {
    it("/api/lumens should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/lumens")
        .expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);
    });

    it("/api/v2/lumens should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v2/lumens")
        .expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);
    });

    it("/api/v2/lumens/total-supply should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v2/lumens/total-supply")
        .expect(200);

      chai.expect(body).to.be.an("number");
      chai.expect(body).to.not.equal(0);
    });

    it("/api/v2/lumens/circulating-supply should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v2/lumens/circulating-supply")
        .expect(200);

      chai.expect(body).to.be.an("number");
      chai.expect(body).to.not.equal(0);
    });

    it("/api/v3/lumens should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v3/lumens")
        .expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);
    });

    it("/api/v3/lumens/all should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v3/lumens/all")
        .expect(200);

      chai.expect(body).to.be.an("object");
      chai.expect(Object.keys(body).length).to.not.equal(0);
    });

    it("/api/v3/lumens/total-supply should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v3/lumens/total-supply")
        .expect(200);

      chai.expect(body).to.be.an("string");
      chai.expect(body).to.not.equal("");
    });

    it("/api/v3/lumens/circulating-supply should return successfuly with data", async function() {
      let { body } = await request(app)
        .get("/api/v3/lumens/circulating-supply")
        .expect(200);

      chai.expect(body).to.be.an("string");
      chai.expect(body).to.not.equal("");
    });
  });
});
