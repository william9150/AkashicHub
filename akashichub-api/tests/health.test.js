import request from "supertest";
import app from "../index.js";

describe("GET /api/health", () => {
  it("should return success response", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("AkashicHub API is running"),
      })
    );
  });
});
