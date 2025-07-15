import { jest } from '@jest/globals';
import { login, me } from '../controllers/authController.js';

// Mock User model
const mockUser = {
  findOne: jest.fn()
};

// Mock bcrypt
const mockBcrypt = {
  compare: jest.fn()
};

// Mock jsonwebtoken
const mockJwt = {
  sign: jest.fn()
};

// Mock models and utilities
jest.unstable_mockModule('../models/index.js', () => ({
  User: mockUser
}));

jest.unstable_mockModule('bcrypt', () => mockBcrypt);
jest.unstable_mockModule('jsonwebtoken', () => mockJwt);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '7d';

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: null
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      req.body = {
        loginAccount: 'admin',
        password: 'password123'
      };

      const mockUserData = {
        Id: 1,
        LoginAccount: 'admin',
        DisplayName: '系統管理員',
        PasswordHash: 'hashed_password',
        Role: 'Admin'
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('mocked_jwt_token');

      await login(req, res);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { LoginAccount: 'admin' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          loginAccount: 'admin',
          role: 'Admin'
        },
        'test-secret',
        { expiresIn: '7d' }
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: 'mocked_jwt_token',
          displayName: '系統管理員',
          role: 'Admin'
        }
      });
    });

    it('should return 400 when loginAccount is missing', async () => {
      req.body = {
        password: 'password123'
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount 與 password 為必填"
        }
      });
    });

    it('should return 400 when password is missing', async () => {
      req.body = {
        loginAccount: 'admin'
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount 與 password 為必填"
        }
      });
    });

    it('should return 400 when both fields are missing', async () => {
      req.body = {};

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount 與 password 為必填"
        }
      });
    });

    it('should return 401 when user does not exist', async () => {
      req.body = {
        loginAccount: 'nonexistent',
        password: 'password123'
      };

      mockUser.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { LoginAccount: 'nonexistent' }
      });

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "帳號或密碼錯誤"
        }
      });
    });

    it('should return 401 when password is incorrect', async () => {
      req.body = {
        loginAccount: 'admin',
        password: 'wrongpassword'
      };

      const mockUserData = {
        Id: 1,
        LoginAccount: 'admin',
        DisplayName: '系統管理員',
        PasswordHash: 'hashed_password',
        Role: 'Admin'
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockBcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "帳號或密碼錯誤"
        }
      });
    });

    it('should handle empty string fields as missing', async () => {
      req.body = {
        loginAccount: '',
        password: ''
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "loginAccount 與 password 為必填"
        }
      });
    });

    it('should use default JWT_EXPIRES_IN when not set', async () => {
      delete process.env.JWT_EXPIRES_IN;

      req.body = {
        loginAccount: 'admin',
        password: 'password123'
      };

      const mockUserData = {
        Id: 1,
        LoginAccount: 'admin',
        DisplayName: '系統管理員',
        PasswordHash: 'hashed_password',
        Role: 'Admin'
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('mocked_jwt_token');

      await login(req, res);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'test-secret',
        { expiresIn: '7d' }
      );

      // Restore environment variable
      process.env.JWT_EXPIRES_IN = '7d';
    });
  });

  describe('me', () => {
    it('should return current user information when authenticated', async () => {
      req.user = {
        id: 1,
        loginAccount: 'admin',
        displayName: '系統管理員',
        role: 'Admin'
      };

      await me(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 1,
          loginAccount: 'admin',
          displayName: '系統管理員',
          role: 'Admin'
        }
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      req.user = null;

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "請先登入"
        }
      });
    });

    it('should handle missing displayName gracefully', async () => {
      req.user = {
        id: 2,
        loginAccount: 'user1',
        role: 'User'
        // displayName is missing
      };

      await me(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 2,
          loginAccount: 'user1',
          displayName: '',
          role: 'User'
        }
      });
    });

    it('should return 401 when req.user is undefined', async () => {
      req.user = undefined;

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "請先登入"
        }
      });
    });
  });
});