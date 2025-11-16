import request from "supertest";
import { describe, it, expect } from "vitest";

import { localUrl } from "./shared.js";

describe("api-v1-snapshot", () => {
  it("201", async () => {
    const res = await request(localUrl)
      .post("/api/v1/snapshot")
      .send({
        baseUrl: "https://example.com",
        targets: [{ path: "/foo", width: 1200 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toEqual("created");
    expect(res.body.timestamp).toMatch(/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/); // yyyy-MM-dd-HH-mm-ss (フォーマットだけ確認する)
  });

  it("400", async () => {
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

  it("400", async () => {
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
