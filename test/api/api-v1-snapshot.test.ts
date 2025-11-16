import request from "supertest";
import { describe, it, expect } from "vitest";

import { localUrl } from "./shared.js";

describe("POST /api/v1/snapshot", () => {
  describe("201", () => {
    it("パラメータ最低限", async () => {
      const res = await request(localUrl)
        .post("/api/v1/snapshot")
        .send({
          baseUrl: "https://example.com",
          targets: [{ path: "/foo", width: 1200 }],
        });
      expect(res.status).toBe(201);
      expect(Object.keys(res.body)).toHaveLength(2);
      expect(res.body.message).toEqual("created");
      expect(res.body.timestamp).toMatch(/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/); // yyyy-MM-dd-HH-mm-ss (フォーマットだけ確認する)
    });

    it("パラメータ全てあり", async () => {
      const res = await request(localUrl)
        .post("/api/v1/snapshot")
        .send({
          baseUrl: "https://example.com",
          targets: [
            {
              path: "/foo",
              width: 1200,
              fullPage: true,
              beforeEvaluate: "console.log('beforeEvaluate')",
            },
          ],
        });
      expect(res.status).toBe(201);
      expect(Object.keys(res.body)).toHaveLength(2);
      expect(res.body.message).toEqual("created");
      expect(res.body.timestamp).toMatch(/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/); // yyyy-MM-dd-HH-mm-ss (フォーマットだけ確認する)
    });
  });

  describe("400", () => {
    it("baseUrlとtargetsがない場合", async () => {
      const res = await request(localUrl).post("/api/v1/snapshot").send({ invalid: true });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Invalid request body",
        errors: [
          "must have required property 'baseUrl'",
          "must have required property 'targets'",
          "must NOT have additional properties",
        ],
      });
    });

    it("targetsがない場合", async () => {
      const res = await request(localUrl)
        .post("/api/v1/snapshot")
        .send({ baseUrl: "https://example.com" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Invalid request body",
        errors: ["must have required property 'targets'"],
      });
    });
  });
});
