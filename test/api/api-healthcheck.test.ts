import request from "supertest";
import { describe, it, expect } from "vitest";

import { localUrl } from "./shared.js";

describe("api-healthcheck", () => {
  it("200", async () => {
    const res = await request(localUrl).get("/api/healthcheck");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "ok" });
  });
});
