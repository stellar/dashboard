import chai from "chai";
import request from "supertest";
import express from "express";
import proxyAddr from "proxy-addr";
import { parseTrustProxy } from "../../../backend/routes";

describe("Trust Proxy Configuration", function () {
  describe("TRUST_PROXY parsing", function () {
    it("🟢should_use_default_values_when_TRUST_PROXY_not_set", function () {
      const trustProxyCidrs = parseTrustProxy(undefined);

      chai.expect(trustProxyCidrs).to.deep.equal([
        "loopback",
        "linklocal",
        "uniquelocal",
      ]);
    });

    it("🟢should_parse_comma_separated_CIDR_values", function () {
      const trustProxyCidrs = parseTrustProxy("10.0.0.0/8,172.16.0.0/12,192.168.0.0/16");

      chai.expect(trustProxyCidrs).to.deep.equal([
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16",
      ]);
    });

    it("🟢should_parse_named_tokens_loopback_linklocal_uniquelocal", function () {
      const trustProxyCidrs = parseTrustProxy("loopback,linklocal,uniquelocal");

      chai.expect(trustProxyCidrs).to.deep.equal([
        "loopback",
        "linklocal",
        "uniquelocal",
      ]);
    });

    it("🟢should_handle_mixed_CIDR_and_named_tokens", function () {
      const trustProxyCidrs = parseTrustProxy("loopback,10.0.0.0/8,linklocal");

      chai.expect(trustProxyCidrs).to.deep.equal([
        "loopback",
        "10.0.0.0/8",
        "linklocal",
      ]);
    });

    it("🟢should_trim_whitespace_from_values", function () {
      const trustProxyCidrs = parseTrustProxy(" loopback , linklocal , uniquelocal ");

      chai.expect(trustProxyCidrs).to.deep.equal([
        "loopback",
        "linklocal",
        "uniquelocal",
      ]);
    });

    it("🟢should_filter_empty_values", function () {
      const trustProxyCidrs = parseTrustProxy("loopback,,linklocal,,,uniquelocal");

      chai.expect(trustProxyCidrs).to.deep.equal([
        "loopback",
        "linklocal",
        "uniquelocal",
      ]);
    });

    it("🟢should_handle_single_value", function () {
      const trustProxyCidrs = parseTrustProxy("10.0.0.0/8");

      chai.expect(trustProxyCidrs).to.deep.equal(["10.0.0.0/8"]);
    });
  });

  describe("proxyAddr.compile compatibility", function () {
    it("🟢should_compile_default_trust_values_and_trust_loopback", function () {
      const trustProxyCidrs = ["loopback", "linklocal", "uniquelocal"];
      const compiled = proxyAddr.compile(trustProxyCidrs);

      // Verify it's callable and trusts loopback (127.0.0.1)
      chai.expect(compiled).to.be.a("function");
      chai.expect(compiled("127.0.0.1", 0)).to.be.true;
    });

    it("🟢should_compile_CIDR_notation_and_trust_private_ranges", function () {
      const trustProxyCidrs = ["10.0.0.0/8", "172.16.0.0/12"];
      const compiled = proxyAddr.compile(trustProxyCidrs);

      chai.expect(compiled).to.be.a("function");
      // Verify it trusts IPs in the specified CIDR ranges
      chai.expect(compiled("10.0.0.1", 0)).to.be.true;
      chai.expect(compiled("172.16.0.1", 0)).to.be.true;
      chai.expect(compiled("192.168.1.1", 0)).to.be.false;
    });

    it("🟢should_compile_mixed_values_and_trust_both_named_and_CIDR", function () {
      const trustProxyCidrs = ["loopback", "10.0.0.0/8", "linklocal"];
      const compiled = proxyAddr.compile(trustProxyCidrs);

      chai.expect(compiled).to.be.a("function");
      // Verify it trusts both loopback and the CIDR range
      chai.expect(compiled("127.0.0.1", 0)).to.be.true;
      chai.expect(compiled("10.1.2.3", 0)).to.be.true;
    });
  });

  describe("Client IP resolution with trust proxy", function () {
    it("🟢should_resolve_client_IP_when_trusting_loopback", async function () {
      const app = express();
      app.set("trust proxy", proxyAddr.compile(["loopback"]));

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip });
      });

      const response = await request(app)
        .get("/test-ip")
        .set("X-Forwarded-For", "192.168.1.1, 203.0.113.1")
        .expect(200);

      // When trusting loopback, should use X-Forwarded-For
      chai.expect(response.body.ip).to.equal("203.0.113.1");
    });

    it("🟢should_not_trust_unknown_proxy", async function () {
      const app = express();
      // Trust only specific CIDR that doesn't include the test client
      app.set("trust proxy", proxyAddr.compile(["10.0.0.0/8"]));

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip });
      });

      const response = await request(app)
        .get("/test-ip")
        .set("X-Forwarded-For", "203.0.113.1")
        .expect(200);

      // Should not use X-Forwarded-For from untrusted proxy
      chai.expect(response.body.ip).to.not.equal("203.0.113.1");
    });

    it("🟢should_extract_client_IP_from_X_Forwarded_For_with_trusted_proxy", async function () {
      const app = express();
      app.set("trust proxy", proxyAddr.compile(["loopback", "linklocal"]));

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip, ips: req.ips });
      });

      const response = await request(app)
        .get("/test-ip")
        .set("X-Forwarded-For", "203.0.113.1, 198.51.100.1, 192.0.2.1")
        .expect(200);

      chai.expect(response.body.ip).to.equal("192.0.2.1");
      chai.expect(response.body.ips).to.deep.equal(["192.0.2.1"]);
    });

    it("🟢should_use_req_connection_remoteAddress_when_no_X_Forwarded_For", async function () {
      const app = express();
      app.set("trust proxy", proxyAddr.compile(["loopback"]));

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip });
      });

      const response = await request(app).get("/test-ip").expect(200);

      // Should fall back to connection remote address (loopback)
      chai.expect(response.body.ip).to.match(/^::ffff:127\.|^127\.|^::1$/);
    });
  });

  describe("Security edge cases", function () {
    it("🔴should_not_trust_X_Forwarded_For_with_empty_trust_proxy", async function () {
      const app = express();
      // No trust proxy set - should not trust X-Forwarded-For
      app.set("trust proxy", false);

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip });
      });

      const response = await request(app)
        .get("/test-ip")
        .set("X-Forwarded-For", "203.0.113.1")
        .expect(200);

      // Should use connection IP, not X-Forwarded-For
      chai.expect(response.body.ip).to.not.equal("203.0.113.1");
      chai.expect(response.body.ip).to.match(/^::ffff:|^127\.|^::/);
    });

    it("🔴should_handle_malformed_X_Forwarded_For_gracefully", async function () {
      const app = express();
      app.set("trust proxy", proxyAddr.compile(["loopback"]));

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip });
      });

      const response = await request(app)
        .get("/test-ip")
        .set("X-Forwarded-For", "not-an-ip, also-not-an-ip")
        .expect(200);

      // Express parses any comma-separated values, even if not valid IPs
      // It extracts "also-not-an-ip" as the rightmost value
      chai.expect(response.body.ip).to.equal("also-not-an-ip");
    });

    it("🟡should_handle_IPv6_addresses", async function () {
      const app = express();
      app.set("trust proxy", proxyAddr.compile(["loopback", "uniquelocal"]));

      app.get("/test-ip", (req, res) => {
        res.json({ ip: req.ip });
      });

      const response = await request(app)
        .get("/test-ip")
        .set("X-Forwarded-For", "2001:db8::1")
        .expect(200);

      // Should extract the IPv6 address from X-Forwarded-For
      chai.expect(response.body.ip).to.equal("2001:db8::1");
    });
  });
});
