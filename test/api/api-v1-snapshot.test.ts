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
    expect(res.body).toEqual({ message: "created" });
  });

  it("400", async () => {
    const res = await request(localUrl).post("/api/v1/snapshot").send({ invalid: true });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errors: [
        {
          instancePath: "",
          keyword: "required",
          message: "must have required property 'baseUrl'",
          params: {
            missingProperty: "baseUrl",
          },
          schemaPath: "#/required",
        },
      ],
      message: "Invalid request body",
    });
  });
});
