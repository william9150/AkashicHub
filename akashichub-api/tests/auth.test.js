import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../index.js";

/* -------- Jest Mocks -------- */
jest.unstable_mockModule("../models/User.js", () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn(),
    },
  };
});

jest.unstable_mockModule("bcrypt", () => {
  return {
    __esModule: true,
    default: {},
    compare: jest.fn(),
  };
});

import User from "../models/User.js";
import { compare as bcryptCompare } from "bcrypt";

/* -------- Test Suite -------- */
describe("Auth API", () => {
  beforeAll(() => {
    // Provide a secret for JWT signing / verification in tests
    process.env.JWT_SECRET = "unit_test_secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("returns token on valid credentials", async () => {
      /* Arrange */
      const fakeUser = {
        Id: 1,
        LoginAccount: "admin",
        PasswordHash: "hashedPwd",
        DisplayName: "Admin",
        Role: "Admin",
      };

      User.findOne.mockResolvedValue(fakeUser);
      bcryptCompare.mockResolvedValue(true);

      /* Act */
      const res = await request(app).post("/api/auth/login").send({ loginAccount: "admin", password: "correct_password" });

      /* Assert */
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");

      const payload = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
      expect(payload).toEqual(
        expect.objectContaining({
          id: fakeUser.Id,
          loginAccount: fakeUser.LoginAccount,
          role: fakeUser.Role,
        })
      );
    });

    it("returns 401 when credentials invalid", async () => {
      User.findOne.mockResolvedValue(null); // user not found

      const res = await request(app).post("/api/auth/login").send({ loginAccount: "wrong", password: "wrong" });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });
});
